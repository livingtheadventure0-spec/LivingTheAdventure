function ParticipantSelector({
    value,
    onIncrease,
    onDecrease,
    max,
}) {

    return (
        <div className="mt-10">

            <h3 className="
                text-2xl
                font-semibold
                text-white
                mb-6
            ">
                Number of Participants
            </h3>


            <div className="
                flex
                items-center
                gap-5
            ">

                <button
                    type="button"
                    onClick={onDecrease}
                    disabled={value <= 1}
                    className="
                        w-10
                        h-10
                        rounded-lg
                        border
                        border-white/10
                        bg-white/[0.04]
                        text-white
                        hover:bg-white/[0.08]
                        disabled:opacity-40
                    "
                >
                    -
                </button>


                <span className="
                    text-white
                    text-xl
                    font-semibold
                    min-w-[30px]
                    text-center
                ">
                    {value}
                </span>


                <button
                    type="button"
                    onClick={onIncrease}
                    disabled={value >= max}
                    className="
                        w-10
                        h-10
                        rounded-lg
                        border
                        border-white/10
                        bg-white/[0.04]
                        text-white
                        hover:bg-white/[0.08]
                        disabled:opacity-40
                    "
                >
                    +
                </button>

            </div>


            <p className="
                text-gray-500
                text-sm
                mt-2
            ">
                Maximum {max} participants
            </p>

        </div>
    );
}

export default ParticipantSelector;