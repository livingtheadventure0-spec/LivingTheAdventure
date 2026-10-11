import React, { useEffect, useState } from "react";
import EventCollection from "../EventCollection/EventCollection";
import fetchEvents from "./FetchEvent";
import Spinner from "../../Spinner/Spinner";
import { useAuth } from "../../../context/AuthContext";
import { fetchFavourites, toggleFavourite } from "../../../api/favourites";
import { getApiErrorMessage } from "../../../api/errors.js";

const Event = ({ heroType }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favourites, setFavourites] = useState(new Set());

    const { user } = useAuth();

    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const eventsData = await fetchEvents(heroType);

                let favIds = [];
                if (user) {
                    const token = await user.getIdToken();
                    favIds = await fetchFavourites(token);
                }

                if (!mounted) return;

                setEvents(eventsData);
                setFavourites(new Set(favIds));
            } catch (err) {
                if (mounted) {
                    setError(getApiErrorMessage(err, "Failed to load events"));
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            mounted = false;
        };
    }, [heroType, user]);

    const handleToggleFavourite = async (eventId) => {
        if (!user) {
            alert("Please login to save favourites.");
            return;
        }

        // Optimistic UI update for instant feedback
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

            // Reconcile with server result
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
            console.error("Failed to toggle favourite", err);
        }
    };

    if (loading) return <div className="text-white text-center mt-20">
        <Spinner />
    </div>;
    if (error) return <div className="text-red-500 text-center mt-20">{error}</div>;
    if (!events.length) {
        return (
            <div className="text-gray-400 text-center mt-20">
                No events available right now.
            </div>
        );
    }

    return (
        <div className="min-h-screen font-sans ml-10 mt-4">
            <EventCollection
                heroType={heroType}
                data={events}
                favourites={favourites}
                onToggleFavourite={handleToggleFavourite}
            />
        </div>
    );
};

export default Event;
