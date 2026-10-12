import { useEffect, useId, useRef, useState } from "react";

function StarCard({ title, value }) {
    const [showDetails, setShowDetails] = useState(false);
    const [closing, setClosing] = useState(false);
    const closeTimerRef = useRef(null);
    const closeButtonRef = useRef(null);
    const titleId = useId();

    const textValue = value == null || value === "" ? "—" : String(value).replace(/\s+/g, " ").trim();
    const words = textValue.split(/\s+/).filter(Boolean).length;
    const isLong = textValue.length > 145 || words > 22;

    const closeDetails = () => {
        if (closing) return;
        setClosing(true);
        closeTimerRef.current = window.setTimeout(() => {
            setShowDetails(false);
            setClosing(false);
            closeTimerRef.current = null;
        }, 400);
    };

    useEffect(() => {
        if (!showDetails) return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeButtonRef.current?.focus();

        const handleKeyDown = (event) => {
            if (event.key === "Escape") closeDetails();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [showDetails]);

    useEffect(() => () => {
        if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    }, []);

    return (
        <>
            <article className="flex h-full min-h-[164px] min-w-0 flex-col items-center rounded-2xl border border-white/10 bg-neutral-900/70 p-4 text-center transition-colors duration-200 hover:border-white/20 sm:min-h-[176px] sm:p-5 lg:min-h-[184px] lg:p-6">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400 sm:text-sm sm:tracking-widest">{title}</h3>
                <p className="line-clamp-3 min-w-0 w-full flex-1 break-words text-base font-medium leading-6 text-white sm:leading-7 [overflow-wrap:anywhere]">{textValue}</p>
                {isLong && (
                    <button type="button" onClick={() => { setClosing(false); setShowDetails(true); }} aria-haspopup="dialog" className="mt-3 rounded-md px-2 py-1 text-sm font-semibold text-white underline decoration-white/40 underline-offset-4 transition-colors hover:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                        Show more
                    </button>
                )}
            </article>

            {showDetails && (
                <div
                    className={`fixed inset-0 z-[100] flex items-end justify-center transition-colors duration-[400ms] ease-in-out ${closing ? "bg-black/0" : "bg-black/70"}`}
                    onMouseDown={(event) => { if (event.target === event.currentTarget) closeDetails(); }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={titleId}
                        className={`flex max-h-[88dvh] w-full flex-col overflow-hidden border-t border-white/15 bg-neutral-950 shadow-[0_-12px_50px_rgba(0,0,0,0.45)] transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${closing ? "translate-y-full" : "translate-y-0"}`}
                    >
                        <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-white/25 sm:hidden" aria-hidden="true" />
                        <header className="relative shrink-0 border-b border-white/10 px-6 pb-5 pt-5 text-center sm:px-8 sm:pt-7">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-400 sm:text-xs">Event highlight</p>
                            <h2 id={titleId} className="mt-2 break-words text-xl font-semibold text-white sm:text-2xl">{title}</h2>
                            <button ref={closeButtonRef} type="button" onClick={closeDetails} aria-label="Close details" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-xl text-gray-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-5 sm:top-5">×</button>
                        </header>
                        <div className="min-h-0 overflow-y-auto px-6 py-6 text-center sm:px-8 sm:py-7">
                            <p className="whitespace-pre-line break-words text-base leading-7 text-gray-200 sm:text-lg sm:leading-8 [overflow-wrap:anywhere]">{textValue}</p>
                        </div>
                        <footer className="shrink-0 border-t border-white/10 px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-8 sm:py-5">
                            <button type="button" onClick={closeDetails} className="w-full rounded-full border border-white/20 bg-white px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-gray-200 sm:mx-auto sm:block sm:w-auto sm:min-w-32">Close</button>
                        </footer>
                    </section>
                </div>
            )}
        </>
    );
}

export default StarCard;
