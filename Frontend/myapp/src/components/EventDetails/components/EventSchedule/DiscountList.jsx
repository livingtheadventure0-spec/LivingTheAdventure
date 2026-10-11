// components/EventSchedule/DiscountList.jsx

import React from "react";

function DiscountList({ discounts = [] }) {

    if (!discounts.length) {
        return null;
    }


    return (
        <div className="mt-5">

            <p className="
                text-sm
                font-medium
                text-white
                mb-3
            ">
                Available Offers
            </p>


            <div className="space-y-2">

                {discounts.map(
                    (discount, index) => (

                        <div
                            key={index}
                            className="
                                flex
                                items-center
                                justify-between
                                gap-3
                                px-3
                                py-2
                                rounded-lg
                                bg-green-500/10
                                border
                                border-green-500/20
                            "
                        >

                            <span className="
                                text-sm
                                text-green-400
                            ">
                                {discount.label}
                            </span>


                            <span className="
                                text-xs
                                text-gray-400
                            ">

                                {discount.type ===
                                    "percentage"
                                    ? `${discount.value}% off`
                                    : `₹${discount.value} off`
                                }

                                {" • "}

                                {discount.min_group_size}+
                                {" "}
                                people

                            </span>

                        </div>

                    )
                )}

            </div>

        </div>
    );
}

export default DiscountList;