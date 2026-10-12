import { useEffect, useRef, useState } from "react";

function Hero({
    promo_video,
    event_type,
    event_title,
    event_description,
    event_poster,
}) {
    const videoRef = useRef(null);

    const [minTimePassed, setMinTimePassed] = useState(false);
    const [videoReady, setVideoReady] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const [fade, setFade] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMinTimePassed(true), 3000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (minTimePassed && videoReady) {
            setFade(true);

            const fadeTimer = setTimeout(() => {
                setShowVideo(true);
                setFade(false);
                if (videoRef.current) {
                    videoRef.current.play().catch(() => {});
                }
            }, 1000);

            return () => clearTimeout(fadeTimer);
        }
    }, [minTimePassed, videoReady]);

    return (
        <section className="relative isolate flex min-h-[min(780px,88svh)] w-full items-center justify-center overflow-hidden bg-black px-4 py-20 sm:px-6 sm:py-24 md:min-h-[80vh] md:px-8">
            {/* Poster */}
            <img
                src={event_poster}
                alt={event_title || "Event poster"}
                className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ${showVideo ? "opacity-0" : "opacity-100"}`}
                loading="eager"
            />

            {/* Video */}
            {promo_video && (
                <video
                    ref={videoRef}
                    src={promo_video}
                    muted
                    playsInline
                    preload="auto"
                    loop
                    aria-hidden="true"
                    className={`absolute inset-0 hidden h-full w-full object-cover transition-opacity duration-1000 sm:block ${showVideo ? "opacity-100" : "opacity-0"}`}
                    onLoadedData={() => setVideoReady(true)}
                />
            )}

            <div className={`pointer-events-none absolute inset-0 bg-black transition-opacity duration-1000 ${fade ? "opacity-100" : "opacity-0"}`} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/80" />

            {/* Responsive content stays inside the hero at every screen width. */}
            <div className="relative z-10 mx-auto flex w-full max-w-5xl min-w-0 flex-col items-center text-center">
                {event_type && (
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-gray-200 sm:mb-4 sm:text-sm md:text-base">
                        {event_type}
                    </p>
                )}

                <h1 className="w-full max-w-full break-words [overflow-wrap:anywhere] font-bebas text-4xl uppercase leading-[1.05] tracking-[0.08em] text-white drop-shadow-lg sm:text-5xl sm:tracking-[0.12em] md:text-6xl lg:text-7xl">
                    {event_title}
                </h1>

                {event_description && (
                    <p className="mt-4 w-full max-w-3xl break-words [overflow-wrap:anywhere] text-sm leading-6 tracking-wide text-gray-100/95 drop-shadow-md sm:mt-5 sm:text-base sm:leading-7 md:text-lg md:leading-8 line-clamp-5 sm:line-clamp-6">
                        {event_description}
                    </p>
                )}
            </div>
        </section>
    );
}

export default Hero;
