function StarCard({ title, value }) {
    return (
        <div
            className="
        rounded-2xl
        bg-neutral-900/60
        border border-white/10
        p-6
        text-center
        transition-all duration-300
        hover:border-white/20
        hover:-translate-y-1
        "
        >
            <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-2">
                {title}
            </h3>

            <p className="text-lg font-semibold text-white">
                {value || "—"}
            </p>
        </div>
    );
}

export default StarCard;
