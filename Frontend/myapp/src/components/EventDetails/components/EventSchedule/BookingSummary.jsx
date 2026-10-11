import React from "react";

function BookingSummary({
    pickup,
    numberOfPeople,
    pricing,
}) {

    if (!pickup) {
        return null;
    }


    return (
        <div className="
            mt-8
            p-6
            rounded-2xl
            bg-white/[0.04]
            border
            border-white/10
        ">

            <h3 className="
                text-xl
                font-semibold
                text-white
                mb-6
            ">
                Booking Summary
            </h3>


            <div className="space-y-4">

                <Row
                    label="Pickup"
                    value={`${pickup.pickup_point} (${pickup.city_name})`}
                />


                <Row
                    label="Price per person"
                    value={`₹${pickup.price_per_person}`}
                />


                <Row
                    label="Participants"
                    value={numberOfPeople}
                />


                <Row
                    label="Subtotal"
                    value={`₹${pricing.subtotal.toLocaleString(
                        "en-IN"
                    )}`}
                />


                {pricing.discountAmount > 0 && (

                    <div className="
                        flex
                        justify-between
                        text-green-400
                    ">

                        <span>
                            {pricing.discount?.label ||
                                "Discount"}
                        </span>

                        <span>
                            -₹
                            {pricing.discountAmount.toLocaleString(
                                "en-IN"
                            )}
                        </span>

                    </div>
                )}


                <div className="
                    border-t
                    border-white/10
                    pt-4
                ">

                    <div className="
                        flex
                        justify-between
                        items-center
                    ">

                        <span className="
                            text-lg
                            font-semibold
                            text-white
                        ">
                            Total
                        </span>


                        <span className="
                            text-2xl
                            font-bold
                            text-white
                        ">
                            ₹
                            {pricing.finalAmount.toLocaleString(
                                "en-IN"
                            )}
                        </span>

                    </div>

                </div>

            </div>

        </div>
    );
}


function Row({ label, value }) {

    return (
        <div className="
            flex
            justify-between
            gap-4
            text-gray-300
        ">

            <span>
                {label}
            </span>

            <span className="text-white text-right">
                {value}
            </span>

        </div>
    );
}


export default BookingSummary;