from fastapi import HTTPException
from sqlalchemy.orm import Session

from authentication.model.model import User
from event.model.model import Event
from schedule.model.model import EventSchedule

from payment.model.Booking import Booking
from payment.model.Payment import Payment
from sqlalchemy.sql import func

from payment.razorpay_client import get_razorpay_client, get_razorpay_key_id

from upload.s3 import private_media_url

from payment.utils.utils import (
    find_pickup,
    validate_capacity,
    calculate_subtotal,
    find_best_discount,
    calculate_discount,
    calculate_final_amount,
)


def get_current_user(
    decoded: dict,
    db: Session,
) -> User:
    """
    Get authenticated user from Firebase decoded token.
    """

    phone = decoded.get("phone_number")

    if not phone:
        raise HTTPException(
            status_code=401,
            detail="Authenticated phone number not found.",
        )

    user = db.query(User).filter(User.phone == phone).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    return user


def create_payment_order(
    payload,
    decoded: dict,
    db: Session,
):
    user = get_current_user(decoded, db)
    razorpay_client = get_razorpay_client()
    razorpay_key_id = get_razorpay_key_id()

    # ---------------------------------------------------------
    # 1. Find Event
    # ---------------------------------------------------------

    event = db.query(Event).filter(Event.event_id == payload.event_id).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found.",
        )

    # ---------------------------------------------------------
    # 2. Find Schedule
    # ---------------------------------------------------------

    schedule = (
        db.query(EventSchedule)
        .filter(
            EventSchedule.schedule_id == payload.schedule_id,
            EventSchedule.event_id == payload.event_id,
        )
        .first()
    )

    if not schedule:
        raise HTTPException(
            status_code=404,
            detail="Schedule not found for this event.",
        )

    # ---------------------------------------------------------
    # 3. Check schedule status
    # ---------------------------------------------------------

    if schedule.status and schedule.status.lower() != "active":
        raise HTTPException(
            status_code=400,
            detail="This schedule is not available for booking.",
        )

    schedule_data = schedule.schedule_data or {}

    # ---------------------------------------------------------
    # 4. Validate capacity
    # ---------------------------------------------------------

    validate_capacity(
        schedule_data,
        payload.number_of_people,
    )

    # ---------------------------------------------------------
    # 5. Find selected pickup
    # ---------------------------------------------------------

    pickup = find_pickup(
        schedule_data,
        payload.pickup_uuid,
    )

    # ---------------------------------------------------------
    # 6. Get price
    # ---------------------------------------------------------

    price_per_person = float(pickup.get("price_per_person", 0))

    if price_per_person <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid price configured for this pickup.",
        )

    # ---------------------------------------------------------
    # 7. Calculate subtotal
    # ---------------------------------------------------------

    subtotal = calculate_subtotal(
        price_per_person,
        payload.number_of_people,
    )

    # ---------------------------------------------------------
    # 8. Find applicable discount
    # ---------------------------------------------------------

    discount = find_best_discount(
        pickup.get("discounts", []),
        payload.number_of_people,
    )

    # ---------------------------------------------------------
    # 9. Calculate discount
    # ---------------------------------------------------------

    discount_amount = calculate_discount(
        subtotal=subtotal,
        price_per_person=price_per_person,
        people=payload.number_of_people,
        discount=discount,
    )

    # ---------------------------------------------------------
    # 10. Calculate final amount
    # ---------------------------------------------------------

    final_amount = calculate_final_amount(
        subtotal,
        discount_amount,
    )

    # ---------------------------------------------------------
    # 11. Create Booking
    # ---------------------------------------------------------

    booking = Booking(
        user_id=user.user_id,
        event_id=payload.event_id,
        schedule_id=payload.schedule_id,
        pickup_uuid=payload.pickup_uuid,
        number_of_people=payload.number_of_people,
        price_per_person=price_per_person,
        subtotal=subtotal,
        discount_label=(discount.get("label") if discount else None),
        discount_type=(discount.get("type") if discount else None),
        discount_scope=(discount.get("scope") if discount else None),
        discount_value=(float(discount.get("value", 0)) if discount else None),
        discount_amount=discount_amount,
        final_amount=final_amount,
        currency="INR",
        booking_status="PENDING",
    )

    db.add(booking)
    db.flush()

    # ---------------------------------------------------------
    # 12. Create Razorpay order
    # ---------------------------------------------------------

    amount_in_paise = int(round(final_amount * 100))

    if amount_in_paise < 100:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail="Payment amount must be at least ₹1.00.",
        )

    try:

        razorpay_order = razorpay_client.order.create(
            {
                "amount": amount_in_paise,
                "currency": "INR",
                "receipt": str(booking.booking_id),
            }
        )

    except Exception as exc:

        db.rollback()

        raise HTTPException(
            status_code=502,
            detail="Unable to create Razorpay order.",
        ) from exc

    # ---------------------------------------------------------
    # 13. Create Payment
    # ---------------------------------------------------------

    payment = Payment(
        booking_id=booking.booking_id,
        razorpay_order_id=razorpay_order["id"],
        amount_paid=final_amount,
        payment_status="PENDING",
    )

    db.add(payment)

    # ---------------------------------------------------------
    # 14. Commit
    # ---------------------------------------------------------

    try:

        db.commit()

        db.refresh(booking)
        db.refresh(payment)

    except Exception as exc:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Unable to save payment information.",
        ) from exc

    # ---------------------------------------------------------
    # 15. Return checkout information
    # ---------------------------------------------------------

    return {
        "booking_id": booking.booking_id,
        "razorpay_order_id": razorpay_order["id"],
        "razorpay_key": razorpay_key_id,
        "amount": amount_in_paise,
        "currency": "INR",
        "number_of_people": booking.number_of_people,
        "final_amount": booking.final_amount,
    }


def verify_payment(
    payload,
    decoded: dict,
    db: Session,
):
    user = get_current_user(decoded, db)
    razorpay_client = get_razorpay_client()

    # ---------------------------------------------------------
    # 1. Find booking owned by current user
    # ---------------------------------------------------------

    booking = (
        db.query(Booking)
        .filter(
            Booking.booking_id == payload.booking_id,
            Booking.user_id == user.user_id,
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found.",
        )

    # ---------------------------------------------------------
    # 2. Find payment
    # ---------------------------------------------------------

    payment = db.query(Payment).filter(Payment.booking_id == booking.booking_id).first()

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment record not found.",
        )

    # ---------------------------------------------------------
    # 3. Make sure Razorpay order matches
    # ---------------------------------------------------------

    if payment.razorpay_order_id != payload.razorpay_order_id:
        raise HTTPException(
            status_code=400,
            detail="Razorpay order does not match booking.",
        )

    # ---------------------------------------------------------
    # 4. Prevent duplicate verification
    # ---------------------------------------------------------

    if payment.payment_status == "SUCCESS":

        return {
            "success": True,
            "booking_id": booking.booking_id,
            "payment_status": "SUCCESS",
            "booking_status": booking.booking_status,
        }

    # ---------------------------------------------------------
    # 5. Verify Razorpay signature
    # ---------------------------------------------------------

    try:
        # Use the order ID stored on the server, not a client-supplied
        # order ID, as the trusted value for signature verification.
        razorpay_client.utility.verify_payment_signature(
            {
                "razorpay_order_id": payment.razorpay_order_id,
                "razorpay_payment_id": payload.razorpay_payment_id,
                "razorpay_signature": payload.razorpay_signature,
            }
        )

    except Exception as exc:
        payment.payment_status = "FAILED"
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Payment signature verification failed.",
        ) from exc

    # ---------------------------------------------------------
    # 6. Confirm Razorpay's payment status and amount
    # ---------------------------------------------------------

    try:
        razorpay_payment = razorpay_client.payment.fetch(
            payload.razorpay_payment_id
        )
    except Exception as exc:
        # Do not mark a payment as failed or successful when Razorpay's
        # status cannot be checked. The user can retry verification.
        raise HTTPException(
            status_code=502,
            detail="Unable to confirm payment status with Razorpay. Please retry.",
        ) from exc

    expected_amount_paise = int(round(float(booking.final_amount) * 100))

    if (
        razorpay_payment.get("order_id") != payment.razorpay_order_id
        or int(razorpay_payment.get("amount", -1)) != expected_amount_paise
    ):
        raise HTTPException(
            status_code=400,
            detail="Razorpay payment does not match this booking amount or order.",
        )

    if razorpay_payment.get("status") != "captured":
        raise HTTPException(
            status_code=409,
            detail="Payment is not captured yet. Booking remains pending until payment is captured.",
        )

    # ---------------------------------------------------------
    # 7. Payment successful
    # ---------------------------------------------------------

    payment.razorpay_payment_id = payload.razorpay_payment_id
    payment.razorpay_signature = payload.razorpay_signature
    payment.payment_status = "SUCCESS"
    payment.amount_paid = expected_amount_paise / 100
    payment.paid_at = func.now()

    # ---------------------------------------------------------
    # 7. Confirm booking
    # ---------------------------------------------------------

    booking.booking_status = "CONFIRMED"

    try:

        db.commit()

        db.refresh(payment)
        db.refresh(booking)

    except Exception as exc:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Payment verified but booking update failed.",
        ) from exc

    return {
        "success": True,
        "booking_id": booking.booking_id,
        "payment_status": payment.payment_status,
        "booking_status": booking.booking_status,
    }


def get_payment_details(
    booking_id,
    decoded: dict,
    db: Session,
):
    user = get_current_user(decoded, db)

    booking = (
        db.query(Booking)
        .filter(
            Booking.booking_id == booking_id,
            Booking.user_id == user.user_id,
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found.",
        )

    payment = db.query(Payment).filter(Payment.booking_id == booking.booking_id).first()

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found.",
        )

    return {
        "booking_id": booking.booking_id,
        "event_id": booking.event_id,
        "payment_status": payment.payment_status,
        "booking_status": booking.booking_status,
        "amount": booking.final_amount,
        "number_of_people": booking.number_of_people,
    }


def get_all_bookings(
    db: Session,
    page: int = 1,
    limit: int = 20,
    booking_status: str | None = None,
    payment_status: str | None = None,
    event_date: str | None = None,
):
    """Return richly joined admin booking rows with event-date filtering."""
    query = db.query(
        Booking,
        Payment.payment_status,
        Payment.razorpay_order_id,
        Payment.razorpay_payment_id,
        Event,
        User,
        EventSchedule,
    ).outerjoin(
        Payment, Payment.booking_id == Booking.booking_id,
    ).outerjoin(
        Event, Event.event_id == Booking.event_id,
    ).outerjoin(
        User, User.user_id == Booking.user_id,
    ).outerjoin(
        EventSchedule, EventSchedule.schedule_id == Booking.schedule_id,
    )

    if booking_status:
        query = query.filter(Booking.booking_status == booking_status)

    if payment_status:
        query = query.filter(Payment.payment_status == payment_status)

    if event_date:
        # The calendar filters by the event's scheduled start date, not by
        # the day the customer created their booking.
        query = query.filter(
            func.date(
                EventSchedule.schedule_data["basic_details"]["start_datetime"].astext
            ) == event_date
        )

    total = query.count()
    offset = (page - 1) * limit

    # Prioritize events that are currently live, then show the newest
    # scheduled event first; booking creation time breaks ties.
    live_state = func.lower(func.coalesce(Event.state, ""))
    rows = query.order_by(
        func.case(
            (live_state.in_(["in progress", "launched now!", "live"]), 0),
            else_=1,
        ),
        func.date(
            EventSchedule.schedule_data["basic_details"]["start_datetime"].astext
        ).desc().nullslast(),
        Booking.created_at.desc(),
    ).offset(offset).limit(limit).all()

    bookings = []
    for booking, payment_status_value, razorpay_order_id, razorpay_payment_id, event, user, schedule in rows:
        schedule_data = (schedule.schedule_data if schedule else {}) or {}
        basic = schedule_data.get("basic_details", {}) or {}
        pickup = next(
            (
                item for item in (schedule_data.get("pickups", []) or [])
                if str(item.get("pickup_uuid")) == str(booking.pickup_uuid)
            ),
            {},
        )
        bookings.append({
            "booking_id": str(booking.booking_id),
            "user_id": str(booking.user_id),
            "user_name": " ".join(part for part in [user.first_name, user.last_name] if part).strip() if user else None,
            "user_phone": user.phone if user else None,
            "user_email": user.email if user else None,
            "event_id": str(booking.event_id),
            "event_title": event.title if event else "Deleted event",
            "event_state": event.state if event else None,
            "event_status": event.status if event else None,
            "schedule_id": str(booking.schedule_id),
            "event_start_datetime": basic.get("start_datetime"),
            "event_end_datetime": basic.get("end_datetime"),
            "event_location": event.location if event else None,
            "pickup_uuid": booking.pickup_uuid,
            "pickup_point": pickup.get("pickup_point"),
            "pickup_city": pickup.get("city_name"),
            "pickup_datetime": pickup.get("pickup_datetime"),
            "number_of_people": booking.number_of_people,
            "price_per_person": booking.price_per_person,
            "subtotal": booking.subtotal,
            "discount_label": booking.discount_label,
            "discount_type": booking.discount_type,
            "discount_scope": booking.discount_scope,
            "discount_value": booking.discount_value,
            "discount_amount": booking.discount_amount,
            "final_amount": booking.final_amount,
            "currency": booking.currency,
            "booking_status": booking.booking_status,
            "payment_status": payment_status_value or "UNKNOWN",
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "payment_method": (
                db.query(Payment.payment_method)
                .filter(Payment.booking_id == booking.booking_id)
                .scalar()
            ),
            "amount_paid": (
                db.query(Payment.amount_paid)
                .filter(Payment.booking_id == booking.booking_id)
                .scalar()
            ),
            "paid_at": (
                db.query(Payment.paid_at)
                .filter(Payment.booking_id == booking.booking_id)
                .scalar()
            ),
            "created_at": booking.created_at,
            "updated_at": booking.updated_at,
        })

    return {"total": total, "page": page, "limit": limit, "bookings": bookings}

def get_my_bookings(decoded: dict, db: Session):
    """Return the authenticated user's bookings with event and schedule details."""
    user = get_current_user(decoded, db)

    rows = (
        db.query(Booking, Payment.payment_status, Event, EventSchedule)
        .outerjoin(Payment, Payment.booking_id == Booking.booking_id)
        .outerjoin(Event, Event.event_id == Booking.event_id)
        .outerjoin(EventSchedule, EventSchedule.schedule_id == Booking.schedule_id)
        .filter(Booking.user_id == user.user_id)
        .order_by(Booking.created_at.desc())
        .all()
    )

    results = []
    for booking, payment_status, event, schedule in rows:
        schedule_data = (schedule.schedule_data if schedule else {}) or {}
        basic = schedule_data.get("basic_details", {}) or {}
        pickups = schedule_data.get("pickups", []) or []
        pickup = next(
            (item for item in pickups if str(item.get("pickup_uuid")) == str(booking.pickup_uuid)),
            {},
        )
        results.append({
            "booking_id": str(booking.booking_id),
            "event_id": str(booking.event_id),
            "schedule_id": str(booking.schedule_id),
            "event_title": event.title if event else "Adventure event",
            "event_cover_image_url": private_media_url(event.cover_image_url) if event and event.cover_image_url else None,
            "event_location": event.location if event else None,
            "start_datetime": basic.get("start_datetime"),
            "end_datetime": basic.get("end_datetime"),
            "duration_days": basic.get("duration_days"),
            "pickup_point": pickup.get("pickup_point"),
            "pickup_city": pickup.get("city_name"),
            "pickup_datetime": pickup.get("pickup_datetime"),
            "number_of_people": booking.number_of_people,
            "price_per_person": booking.price_per_person,
            "subtotal": booking.subtotal,
            "discount_amount": booking.discount_amount,
            "final_amount": booking.final_amount,
            "currency": booking.currency,
            "booking_status": booking.booking_status,
            "payment_status": payment_status or "UNKNOWN",
            "created_at": booking.created_at.isoformat() if booking.created_at else None,
        })

    return {"total": len(results), "bookings": results}
