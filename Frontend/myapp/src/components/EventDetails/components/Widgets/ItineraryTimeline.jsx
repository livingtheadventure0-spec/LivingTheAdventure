const ItineraryTimeline = ({ itinerary }) => {
    const items =
        itinerary?.split(/[;,]\s*|\n+/).map(s => s.trim()).filter(Boolean) || [];

    return (
        <div className="flex gap-6 overflow-x-auto pb-4">
            {items.map((item, index) => (
                <div
                    key={index}
                    className="
            min-w-[260px]
            p-6
            rounded-2xl
            bg-neutral-900
            border border-white/10
            flex flex-col gap-4
          "
                >
                    <span className="text-white/40 font-semibold">
                        Step {index + 1}
                    </span>
                    <p className="text-xl font-semibold text-white">
                        {item}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default ItineraryTimeline;
