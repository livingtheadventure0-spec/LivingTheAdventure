import React, {
    useMemo,
    useState,
} from "react";

import PickupPoints from "./PickupPoints.jsx";
import ParticipantSelector from "./ParticipantSelector.jsx";
import BookingSummary from "./BookingSummary.jsx";
import PaymentButton from "./PaymentButton.jsx";

import { calculateDiscount } from "../utils/pricing.js";

import usePayment from "../../hooks/usePayment.js";


function BookingSection({
    event,
    schedule,
    user,
    navigate,
}) {

    const [
        selectedPickup,
        setSelectedPickup
    ] = useState(null);


    const [
        numberOfPeople,
        setNumberOfPeople
    ] = useState(1);


    const pickups =
        schedule?.schedule_data?.pickups ||
        [];


    const capacity =
        schedule?.schedule_data
            ?.capacity_pricing;


    const maxParticipants =
        Math.min(
            event?.max_participants_allowed ||
            20,

            capacity?.seats_available ||
            20,

            20
        );


    // =====================================================
    // PRICE
    // =====================================================

    const pricing = useMemo(
        () =>
            calculateDiscount({
                pickup:
                    selectedPickup,

                numberOfPeople,
            }),

        [
            selectedPickup,
            numberOfPeople,
        ]
    );


    // =====================================================
    // PAYMENT
    // =====================================================

    const {
        handlePayment,
        paymentLoading,
        paymentError,
        razorpayReady,
    } = usePayment({

        user,

        event,

        schedule,

        selectedPickup,

        numberOfPeople,

        navigate,
    });


    // =====================================================
    // PARTICIPANTS
    // =====================================================

    const increasePeople = () => {

        setNumberOfPeople(
            (current) =>
                Math.min(
                    current + 1,
                    maxParticipants
                )
        );
    };


    const decreasePeople = () => {

        setNumberOfPeople(
            (current) =>
                Math.max(
                    current - 1,
                    1
                )
        );
    };


    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="space-y-10">


            {/* PICKUPS */}

            <PickupPoints
                pickups={pickups}

                selectedPickup={
                    selectedPickup
                }

                onSelectPickup={
                    (pickup) => {
                        setSelectedPickup(
                            pickup
                        );
                    }
                }
            />


            {/* PARTICIPANTS */}

            <ParticipantSelector
                value={
                    numberOfPeople
                }

                max={
                    maxParticipants
                }

                onIncrease={
                    increasePeople
                }

                onDecrease={
                    decreasePeople
                }
            />


            {/* SUMMARY */}

            <BookingSummary
                pickup={
                    selectedPickup
                }

                numberOfPeople={
                    numberOfPeople
                }

                pricing={
                    pricing
                }
            />


            {/* ERROR */}

            {paymentError && (

                <div className="
                    p-4
                    rounded-lg
                    bg-red-500/10
                    border
                    border-red-500/20
                    text-red-400
                ">
                    {paymentError}
                </div>

            )}


            {/* PAYMENT */}

            <PaymentButton

                onClick={
                    handlePayment
                }

                loading={
                    paymentLoading
                }

                ready={
                    razorpayReady
                }

                disabled={
                    !selectedPickup
                }
            />


            {!selectedPickup && (

                <p className="
                    text-gray-500
                    text-sm
                ">
                    Please select a pickup location
                    to continue.
                </p>

            )}

        </div>
    );
}


export default BookingSection;