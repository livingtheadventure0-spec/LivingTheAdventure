import { useEffect, useState } from "react";
import fetchEventsByType from "./FetchEvent";
import VerticalEventCard from "../Common/EventCard/VerticalEventCard";
import Spinner from "../Spinner/Spinner";
import { getApiErrorMessage } from "../../api/errors.js";
import { useAuth } from "../../context/AuthContext";
import { fetchFavourites, toggleFavourite } from "../../api/favourites";

function ViewAll({ event_type, state }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favourites, setFavourites] = useState(new Set());

    const { user } = useAuth();

    useEffect(() => {
        let mounted = true;
        setLoading(true);

        const load = async () => {
            try {
                setError(null);
                const data = await fetchEventsByType(event_type, state);

                let favIds = [];
                if (user) {
                    const token = await user.getIdToken();
                    favIds = await fetchFavourites(token);
                }

                if (!mounted) return;
                setEvents(data);
                setFavourites(new Set(favIds));
            } catch (err) {
                if (mounted) setError(getApiErrorMessage(err, "Failed to load events"));
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();

        return () => {
            mounted = false;
        };
    }, [event_type, state, user]);

    const handleToggleFavourite = async (eventId) => {
        if (!user) {
            alert("Please login to save favourites.");
            return;
        }

        // Optimistic UI update
        setFavourites((prev) => {
            const next = new Set(prev);
            if (next.has(eventId)) next.delete(eventId);
            else next.add(eventId);
            return next;
        });

        try {
            const token = await user.getIdToken();
            const isFavourite = await toggleFavourite(eventId, token);

            // Reconcile with server result
            setFavourites((prev) => {
                const next = new Set(prev);
                if (isFavourite) next.add(eventId);
                else next.delete(eventId);
                return next;
            });
        } catch (err) {
            console.error("Failed to toggle favourite from view-all", err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 min-h-screen">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 py-20">
                {error}
            </div>
        );
    }

    if (!events.length) {
        return (
            <div className="text-center text-gray-400 py-20">
                No events found
            </div>
        );
    }

    return (
        <section className="bg-neutral-950 py-16 min-h-screen">
            <div className="px-6">

                {/* Section Title */}
                <div className="mb-10 w-full text-center">
                    <h2 className="text-2xl md:text-3xl font-bebas text-white">
                        Continue Exploring {state} {event_type}s
                    </h2>
                    <p className="text-gray-400 mt-1 text-sm md:text-base">
                        Discover more adventures curated for you
                    </p>

                    {/* Subtle Divider */}
                    <div className="mx-auto mt-3 h-1 w-12 bg-white/20 rounded-full" />
                </div>

                {/* Grid */}
                <div
                    className="
        grid
        grid-cols-2
        sm:grid-cols-3
        md:grid-cols-4
        lg:grid-cols-5
        gap-6
        max-w-7xl mx-auto
      "
                >
                    {events.map(event => (
                        <VerticalEventCard
                            key={event.id}
                            item={event}
                            isFavourite={favourites.has(event.event_uuid ?? event.id)}
                            onToggleFavourite={handleToggleFavourite}
                        />
                    ))}
                </div>

            </div>
        </section>


    );
}

export default ViewAll;
