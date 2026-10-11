import { useState, useEffect, useMemo } from "react";
import { GoPlus, GoCheck } from "react-icons/go";
import { useNavigate } from "react-router-dom";

function Slider({ heroContent = [], favourites, onToggleFavourite }) {
    const navigate = useNavigate();
    const initialHero = useMemo(() => heroContent[0] || null, [heroContent]);
    const [activeHero, setActiveHero] = useState(initialHero);
    const [audioOn, setAudioOn] = useState(false);
    const [fade, setFade] = useState(false);

    useEffect(() => {
        if (heroContent.length) setActiveHero(heroContent[0]);
    }, [heroContent]);

    if (!activeHero) return null;

    const currentIndex = heroContent.findIndex(
        h => h.id === activeHero.id
    );

    const changeHero = (hero) => {
        if (!hero || hero.id === activeHero.id) return;
        setFade(true);
        setTimeout(() => {
            setActiveHero(hero);
            setFade(false);
        }, 300);
    };

    const handleVideoEnd = () => {
        const next = heroContent[(currentIndex + 1) % heroContent.length];
        changeHero(next);
    };

    const isFavourite =
        favourites instanceof Set && activeHero?.eventId
            ? favourites.has(activeHero.eventId)
            : false;

    return (
        <div className="bg-black text-white">
            <section className="relative h-[70vh] sm:h-[80vh] lg:h-screen w-full pl-10 md:pl-0 overflow-hidden">

                {/* Video */}
                <div className={`absolute inset-0 transition-opacity duration-300 ${fade ? "opacity-0" : "opacity-100"}`}>
                    <video
                        className="w-full h-full object-cover"
                        src={activeHero.video}
                        poster={activeHero.thumbnail}
                        autoPlay
                        muted={!audioOn}
                        playsInline
                        preload="metadata"
                        onEnded={handleVideoEnd}
                    />
                </div>

                {/* Gradient */}
                <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-black/50 to-black" />

                {/* Content */}
                <div className="relative z-20 h-full flex items-center px-4 sm:px-6 lg:px-10">
                    <div className="container mx-auto px-0 sm:px-4 md:px-20 lg:px-24 lg:ml-16">

                        {/* TITLE */}
                        <h1 className="
              text-xl
              sm:text-2xl
              md:text-3xl
              lg:text-4xl
              font-bold
              mb-3 lg:mb-4
              uppercase
            ">
                            {activeHero.title}
                        </h1>

                        {/* META */}
                        <div className="flex flex-wrap gap-2 sm:gap-3 mb-2 text-gray-400 text-xs sm:text-sm capitalize">
                            {(activeHero.details || []).map(d => (
                                <span key={d}>{d}</span>
                            ))}
                        </div>

                        {/* DESCRIPTION */}
                        <p className="
              max-w-xl
              text-sm sm:text-base md:text-lg
              mb-4 sm:mb-6
              capitalize
            ">
                            {activeHero.description}
                        </p>

                        {/* GENRES */}
                        <div className="flex flex-wrap gap-2 mb-4 sm:mb-6 md:pr-0 text-gray-300 text-xs sm:text-sm">
                            {(activeHero.genres || []).map((g, i) => (
                                <span key={g}>
                                    {g}{i < activeHero.genres.length - 1 && " •"}
                                </span>
                            ))}
                        </div>

                        {/* CTA + THUMBNAILS */}
                        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6 lg:mb-10">

                            {/* CTA */}
                            <div className="flex gap-3 sm:gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (activeHero?.eventId) {
                                            navigate("/eventDetails/" + activeHero.eventId);
                                        }
                                    }}
                                    disabled={!activeHero?.eventId}
                                    className="bg-white text-black font-bold py-2 sm:py-2.5 lg:py-3 px-5 sm:px-6 lg:px-8 rounded-lg text-sm sm:text-base transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Book Now
                                </button>

                                <button
                                    className="
                  bg-white/20 text-white
                  p-2.5 sm:p-3
                  rounded-xl
                "
                                    type="button"
                                    onClick={() =>
                                        onToggleFavourite &&
                                        activeHero?.eventId &&
                                        onToggleFavourite(activeHero.eventId)
                                    }
                                >
                                    {isFavourite ? (
                                        <GoCheck className="h-4 sm:h-5" />
                                    ) : (
                                        <GoPlus className="h-4 sm:h-5" />
                                    )}
                                </button>
                            </div>

                            {/* Thumbnails */}
                            <div className="
                flex gap-2
                overflow-x-auto
                sm:overflow-visible
                sm:absolute sm:right-0 sm:top-1
                md:pt-0
                pt-5
                pb-2 sm:pb-0
              ">
                                {heroContent.map(hero => (
                                    <button
                                        key={hero.id}
                                        onClick={() => changeHero(hero)}
                                        className={`
                      w-20 h-12
                      sm:w-24 sm:h-16
                      overflow-hidden rounded-lg
                      transition-all duration-300
                      ${activeHero.id === hero.id
                                                ? "border-2 border-white opacity-100"
                                                : "opacity-60 hover:opacity-100"}
                    `}
                                    >
                                        <img
                                            src={hero.thumbnail}
                                            alt={hero.title}
                                            loading="lazy"
                                            decoding="async"
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Slider;
