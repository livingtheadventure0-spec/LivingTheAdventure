function StarCard({ title, value }) {
    return (
        <article className="h-full min-w-0 rounded-2xl border border-white/10 bg-neutral-900/60 p-4 text-left transition-colors duration-300 hover:border-white/20 sm:p-5 md:p-6">
            <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-gray-400 sm:text-sm sm:tracking-widest">
                {title}
            </h3>

            <p className="min-w-0 whitespace-pre-line break-words [overflow-wrap:anywhere] text-sm font-medium leading-6 text-white sm:text-base sm:leading-7">
                {value || "—"}
            </p>
        </article>
    );
}

export default StarCard;
