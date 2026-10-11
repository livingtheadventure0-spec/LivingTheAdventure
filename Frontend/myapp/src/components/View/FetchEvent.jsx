import axios from "axios";
import { apiUrl } from "../../api/config.js";
import { ApiError } from "../../api/errors.js";

const fetchEventsByType = async (event_type, state = "") => {
    let response;
    try {
        response = await axios.get(apiUrl(`/events/by-type/${event_type}`));
    } catch (err) {
        if (err?.response?.status === 404) return [];
        const detail = err?.response?.data?.detail || err?.response?.data?.message || "";
        throw new ApiError(detail || "Failed to load events", {
            status: err?.response?.status,
            detail,
        });
    }

    let events = Array.isArray(response.data) ? response.data : [];

    // ✅ filter only if state is not empty
    if (state && state.trim() !== "") {
        events = events.filter(
            event => event.state?.toLowerCase() === state.toLowerCase()
        );
    }

    return events.map(event => ({
        id: event.id,
        // Used for favourites + stable identifiers across lists/details
        event_uuid: event.event_uuid ?? event.event_id ?? event.id,
        title: event.title,
        imageUrl: event.cover_image_url,
        description: event.short_description,
        category: event.adventure_activity_category,
        difficulty: event.adventure_difficulty_level,
        durationDays: event.duration_days,
        durationNights: event.duration_nights,
        location: event.location,
        raw: event // optional: keep original
    }));
};

export default fetchEventsByType;
