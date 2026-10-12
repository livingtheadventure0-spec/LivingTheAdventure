import { useState } from "react";

function StarCard({ title, value }) {
    const [showDetails, setShowDetails] = useState(false);
    const textValue = value == null || value === "" ? "—" : String(value).trim();
    const isLong = textValue.length > 115 || textValue.split(/\s+/).length > 18;

    return (
        <>
            <article className="flex h-full min-h-[156px] min-w-0 flex-col rounded-2xl border border-white/10 bg-neutral-900/70 p-4 text-left transition-colors duration-200 hover:border-white/20 sm:min-h-[168px] sm:p-5 lg:min-h-[176px] lg:p-6">
                <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400 sm:text-xs">
                    {title}
                </h3>
                <p className="min-w-0 flex-1 break-words text-sm font-medium leading-6 text-white sm:text-base sm:leading-7 line-clamp-3 [overflow-wrap:anywhere]">
                    {textValue}
                </p>
                {isLong && (
                    <button
                        type="button"
                        onClick={() => setShowDetails(true)}
                        className="mt-3 w-fit text-xs font-semibold text-amber-300 underline decoration-amber-300/40 underline-offset-4 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 sm:text-sm"
                    >
                        Show more
                    </button>
                )}
            </article>

            {showDetails && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm sm:p-6"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) setShowDetails(false);
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-label={title}
                        className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-neutral-950 shadow-2xl"
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300 sm:text-xs">Event highlight</p>
                                <h2 className="mt-1 break-words text-lg font-semibold text-white sm:text-xl">{title}</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowDetails(false)}
                                aria-label="Close details"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-xl text-gray-300 hover:bg-white/10 hover:text-white"
                            >
                                ×
                            </button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
                            <p className="whitespace-pre-line break-words text-sm leading-7 text-gray-200 sm:text-base sm:leading-8 [overflow-wrap:anywhere]">{textValue}</p>
                        </div>
                        <div className="flex justify-end border-t border-white/10 px-5 py-4 sm:px-6">
                            <button
                                type="button"
                                onClick={() => setShowDetails(false)}
                                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-gray-200"
                            >
                                Close
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}

export default StarCard;
