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

    // 1️⃣ Minimum poster time (3s)
    useEffect(() => {
        const timer = setTimeout(() => {
            setMinTimePassed(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    // 2️⃣ When BOTH conditions are true → fade & show video
    useEffect(() => {
        if (minTimePassed && videoReady) {
            setFade(true);

            const fadeTimer = setTimeout(() => {
                setShowVideo(true);
                setFade(false);

                // Explicit play (important)
                if (videoRef.current) {
                    videoRef.current.play().catch(() => { });
                }
            }, 1000); // fade duration

            return () => clearTimeout(fadeTimer);
        }
    }, [minTimePassed, videoReady]);

    return (
        <section className="relative w-full h-[70vh] md:h-screen overflow-hidden bg-black">

            {/* Poster (default layer) */}
            <img
                src={event_poster}
                alt={event_title}
                className={`absolute inset-0 w-full h-full object-cover
          transition-opacity duration-1000
          ${showVideo ? "opacity-0" : "opacity-100"}
        `}
                loading="eager"
            />

            {/* Video (only becomes visible when allowed) */}
            {promo_video && (
                <video
                    ref={videoRef}
                    src={promo_video}
                    muted
                    playsInline
                    preload="auto"
                    loop
                    className={`absolute inset-0 w-full h-full object-cover
            transition-opacity duration-1000
            ${showVideo ? "opacity-100" : "opacity-0"}
          `}
                    onLoadedData={() => setVideoReady(true)}
                />
            )}

            {/* Fade layer (ONLY used during transition) */}
            <div
                className={`absolute inset-0 bg-black pointer-events-none
          transition-opacity duration-1000
          ${fade ? "opacity-100" : "opacity-0"}
        `}
            />

            {/* Gradient overlay */}
            <div className="
        absolute inset-0
        bg-gradient-to-b from-black/60 via-black/40 to-black/80
        pointer-events-none
        transform-gpu will-change-transform
      " />

            {/* Content */}
            <div className="relative z-10 h-full w-full flex items-center justify-center text-center px-6">
                <div className="max-w-3xl">
                    <p className="font-cenzel text-sm md:text-base uppercase tracking-widest text-gray-300 mb-3">
                        {event_type}
                    </p>

                    <h1 className="font-bebas text-6xl tracking-widest uppercase text-white">
                        {event_title}
                    </h1>

                    <p className="text-base md:text-lg capitalize tracking-widest text-gray-300 mt-3">
                        {event_description}
                    </p>
                </div>
            </div>
        </section>
    );
}

export default Hero;
