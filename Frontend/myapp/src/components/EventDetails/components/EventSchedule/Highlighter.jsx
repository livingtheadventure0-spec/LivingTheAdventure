function Highlights({ highlights }) {
    const normalizedStatus = String(highlights || "").trim().toLowerCase();
    const statusLabels = {
        upcoming: "Upcoming",
        ongoing: "Event ongoing",
        completed: "Event completed",
    };
    const statusLabel = statusLabels[normalizedStatus];

    if (!statusLabel) return null;

    return (
        <div
            className="
        w-full
        backdrop-blur-xl
        bg-black/60
        border-t border-white/10
        px-6 py-3
        flex items-center justify-center
      "
        >
            <div className="flex items-center gap-3">

                {/* Status Dot */}
                <span
                    className={`
            w-2.5 h-2.5 rounded-full
            ${highlights === "Upcoming" ? "bg-emerald-400" : ""}
            ${highlights === "Ongoing" ? "bg-yellow-400" : ""}
            ${highlights === "Completed" ? "bg-gray-400" : ""}
          `}
                />

                {/* Status Text */}
                <p className="
          font-bebass
          tracking-widests
          uppercase
          text-sm md:text-base
          text-white
        ">
                    {statusLabel}
                </p>
            </div>
        </div>
    );
}

export default Highlights;
