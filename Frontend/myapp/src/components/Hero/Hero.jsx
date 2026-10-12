import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import fetchHero from "./FetchHero";
import fetchEventsByType from "../View/FetchEvent";
import Spinner from "../Spinner/Spinner";
import MainPage from "../Common/MainPage/MainPage";
import VerticalEventCard from "../Common/EventCard/VerticalEventCard";
import { useAuth } from "../../context/AuthContext";
import { fetchFavourites, toggleFavourite } from "../../api/favourites";
import { getApiErrorMessage } from "../../api/errors.js";

const TYPE_TO_EVENT = {
    home: null,
    trip: "trip",
    trek: "trek",
    adventure: "adventure",
    peek: "peak",
    peak: "peak",
    parkdev: "special_event",
    track: "trek",
};

const PAGE_LINKS = {
    home: "/",
    trip: "/trip",
    trek: "/trek",
    adventure: "/adventure",
    peek: "/peak",
    peak: "/peak",
    parkdev: "/special_event",
    track: "/trek",
};

function Hero({ heroType = "home" }) {
    const [events, setEvents] = useState([]);
    const [fallbackEvents, setFallbackEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favourites, setFavourites] = useState(new Set());
    const { user } = useAuth();

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                let heroes = [];
                try {
                    heroes = await fetchHero(heroType);
                } catch (heroError) {
                    // If the hero endpoint is unavailable, still try to show real events below.
                    console.warn("Unable to load configured hero; using event fallback.", heroError);
                }

                let regularEvents = [];
                if (!heroes.length) {
                    const normalizedType = String(heroType || "home").toLowerCase();
                    const eventType = TYPE_TO_EVENT[normalizedType];
                    if (eventType) {
                        regularEvents = await fetchEventsByType(eventType);
                    } else {
                        const collections = await Promise.all(
                            ["trip", "trek", "adventure", "peak"].map(async (type) => {
                                try { return await fetchEventsByType(type); }
                                catch { return []; }
                            })
                        );
                        const seen = new Set();
                        regularEvents = collections.flat().filter((event) => {
                            const key = event.event_uuid ?? event.id;
                            if (seen.has(key)) return false;
                            seen.add(key);
                            return true;
                        });
                    }
                }

                let favIds = [];
                if (user) {
                    try {
                        const token = await user.getIdToken();
                        favIds = await fetchFavourites(token);
                    } catch (favouriteError) {
                        console.warn("Unable to load favourites.", favouriteError);
                    }
                }

                if (!isMounted) return;
                setEvents(heroes);
                setFallbackEvents(regularEvents);
                setFavourites(new Set(favIds));
            } catch (err) {
                if (isMounted) setError(getApiErrorMessage(err, "Failed to load events"));
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadData();
        return () => { isMounted = false; };
    }, [heroType, user]);

    const handleToggleFavourite = async (eventId) => {
        if (!user) {
            alert("Please login to save favourites.");
            return;
        }

        setFavourites((prev) => {
            const next = new Set(prev);
            if (next.has(eventId)) next.delete(eventId);
            else next.add(eventId);
            return next;
        });

        try {
            const token = await user.getIdToken();
            const isFavourite = await toggleFavourite(eventId, token);
            setFavourites((prev) => {
                const next = new Set(prev);
                if (isFavourite) next.add(eventId);
                else next.delete(eventId);
                return next;
            });
        } catch (err) {
            console.error("Failed to toggle favourite from hero", err);
        }
    };

    if (isLoading) {
        return <div className="flex min-h-[60vh] items-center justify-center bg-black text-white md:min-h-screen"><Spinner /></div>;
    }

    if (events.length) {
        return (
            <section className="relative min-h-[70vh] w-full overflow-hidden bg-black text-white md:min-h-screen">
                <MainPage heroType={heroType} heroContent={events} favourites={favourites} onToggleFavourite={handleToggleFavourite} />
            </section>
        );
    }

    const pageLink = PAGE_LINKS[String(heroType || "home").toLowerCase()] || "/";
    const pageLabel = String(heroType || "adventure").toLowerCase() === "home" ? "adventures" : String(heroType || "adventure").replace(/([A-Z])/g, " $1").toLowerCase();

    if (fallbackEvents.length) {
        return (
            <section className="min-h-[60vh] bg-black px-4 py-12 text-white sm:px-6 lg:px-10">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[.25em] text-white/50">Explore Living the Adventure</p>
                            <h1 className="text-3xl font-semibold capitalize sm:text-4xl">Discover {pageLabel}</h1>
                            <p className="mt-2 max-w-xl text-sm text-white/60">There isn't a featured hero here yet. Explore available events instead.</p>
                        </div>
                        <Link to={pageLink === "/" ? "/trip" : pageLink} className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold transition hover:bg-white hover:text-black">View all events</Link>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {fallbackEvents.slice(0, 12).map((event) => (
                            <VerticalEventCard key={event.event_uuid ?? event.id} item={event} isFavourite={favourites.has(event.event_uuid ?? event.id)} onToggleFavourite={handleToggleFavourite} />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-[55vh] items-center justify-center bg-black px-5 py-16 text-center text-white">
            <div className="max-w-lg">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/[.04] text-2xl">↗</div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[.25em] text-white/45">Living the Adventure</p>
                <h1 className="text-2xl font-semibold sm:text-3xl">No events available right now</h1>
                <p className="mt-3 text-sm leading-6 text-white/60">We're preparing the next adventures for this section. Please check back soon or explore our other trips.</p>
                {error && <p className="mt-3 text-xs text-white/40">{error}</p>}
                <Link to="/" className="mt-7 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/85">Visit home</Link>
            </div>
        </section>
    );
}

export default Hero;
