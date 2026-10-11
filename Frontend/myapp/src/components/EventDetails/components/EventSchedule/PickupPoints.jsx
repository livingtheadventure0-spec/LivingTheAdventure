import {
    MdOutlineAccessTime,
    MdOutlineCurrencyRupee,
    MdOutlineLocationOn
} from "react-icons/md";

import DiscountList from "./DiscountList.jsx";


function PickupPoints({
    pickups = [],
    selectedPickup,
    onSelectPickup,
}) {

    return (

        <div>

            <h3 className="
                text-2xl
                font-semibold
                text-white
                mb-8
            ">
                Pickup Locations
            </h3>


            <div className="
                grid
                md:grid-cols-2
                gap-6
            ">

                {pickups.map((pickup) => {

                    const isSelected =
                        selectedPickup?.pickup_uuid ===
                        pickup.pickup_uuid;


                    return (

                        <div
                            key={pickup.pickup_uuid}
                            onClick={() =>
                                onSelectPickup(pickup)
                            }
                            className={`
                                cursor-pointer
                                p-6
                                rounded-2xl
                                border
                                transition

                                ${isSelected
                                    ? "bg-white/[0.10] border-white/40"
                                    : "bg-white/[0.04] border-white/10 hover:bg-white/[0.07]"
                                }
                            `}
                        >

                            <div className="
                                flex
                                items-start
                                justify-between
                                gap-4
                            ">

                                <h4 className="
                                    text-lg
                                    font-semibold
                                    text-white
                                ">
                                    {pickup.pickup_point}
                                    {" "}
                                    ({pickup.city_name})
                                </h4>


                                {isSelected && (
                                    <span className="
                                        text-xs
                                        px-2
                                        py-1
                                        rounded-full
                                        bg-green-500/20
                                        text-green-400
                                    ">
                                        Selected
                                    </span>
                                )}

                            </div>


                            <p className="
                                text-gray-400
                                text-sm
                                mt-2
                            ">
                                {pickup.address?.street_address}
                            </p>


                            <div className="
                                flex
                                justify-between
                                mt-4
                                text-gray-300
                                text-sm
                            ">

                                <span className="
                                    flex
                                    items-center
                                    gap-2
                                ">
                                    <MdOutlineAccessTime />

                                    {new Date(
                                        pickup.pickup_datetime
                                    ).toLocaleTimeString(
                                        [],
                                        {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        }
                                    )}
                                </span>


                                <span className="
                                    flex
                                    items-center
                                    gap-1
                                ">
                                    <MdOutlineCurrencyRupee />

                                    {pickup.price_per_person}
                                    /person
                                </span>

                            </div>


                            <DiscountList
                                discounts={
                                    pickup.discounts
                                }
                            />


                            <a
                                href={
                                    pickup.address
                                        ?.google_map_url
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) =>
                                    e.stopPropagation()
                                }
                                className="
                                    inline-flex
                                    items-center
                                    gap-1
                                    mt-4
                                    text-teal-400
                                    text-sm
                                "
                            >
                                <MdOutlineLocationOn />

                                View on Map

                            </a>

                        </div>
                    );
                })}

            </div>

        </div>
    );
}


export default PickupPoints;