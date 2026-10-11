import { useState, useEffect } from "react";
import fetchHero from "./FetchHero";
import Spinner from "../Spinner/Spinner";
import MainPage from "../Common/MainPage/MainPage";
import { useAuth } from "../../context/AuthContext";
import { fetchFavourites, toggleFavourite } from "../../api/favourites";
import { getApiErrorMessage } from "../../api/errors.js";

function Hero({ heroType }) {
    const [events, setEvents] = useState([]);
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
                const heroes = await fetchHero(heroType);

                let favIds = [];
                if (user) {
                    const token = await user.getIdToken();
                    favIds = await fetchFavourites(token);
                }

                if (!isMounted) return;

                setEvents(heroes);
                setFavourites(new Set(favIds));
            } catch (err) {
                if (isMounted) {
                    setError(getApiErrorMessage(err, "Failed to load hero events"));
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [heroType, user]);

    const handleToggleFavourite = async (eventId) => {
        if (!user) {
            alert("Please login to save favourites.");
            return;
        }

        // Optimistic UI update
        setFavourites((prev) => {
            const next = new Set(prev);
            if (next.has(eventId)) {
                next.delete(eventId);
            } else {
                next.add(eventId);
            }
            return next;
        });

        try {
            const token = await user.getIdToken();
            const isFavourite = await toggleFavourite(eventId, token);

            // Reconcile with server
            setFavourites((prev) => {
                const next = new Set(prev);
                if (isFavourite) {
                    next.add(eventId);
                } else {
                    next.delete(eventId);
                }
                return next;
            });
        } catch (err) {
            console.error("Failed to toggle favourite from hero", err);
        }
    };

    /* ---------- LOADING STATE ---------- */
    if (isLoading) {
        return (
            <div className="
        bg-black text-white
        min-h-[60vh] md:min-h-screen
        flex items-center justify-center
      ">
                <Spinner />
            </div>
        );
    }

    /* ---------- ERROR STATE ---------- */
    if (error) {
        return (
            <div className="
        bg-black text-white
        min-h-[60vh] md:min-h-screen
        flex items-center justify-center
        text-center px-4
      ">
                Error: {error}
            </div>
        );
    }

    /* ---------- EMPTY STATE ---------- */
    if (!events.length) {
        return (
            <div className="
        bg-black text-white
        min-h-[60vh] md:min-h-screen
        flex items-center justify-center
        text-center px-4
      ">
                No events found
            </div>
        );
    }

    /* ---------- MAIN HERO ---------- */
    return (
        <section
            className="
        bg-black text-white
        w-full
        min-h-[70vh] md:min-h-screen
        overflow-hidden
        relative
      "
        >
            <MainPage
                heroType={heroType}
                heroContent={events}
                favourites={favourites}
                onToggleFavourite={handleToggleFavourite}
            />
        </section>
    );
}

export default Hero;
