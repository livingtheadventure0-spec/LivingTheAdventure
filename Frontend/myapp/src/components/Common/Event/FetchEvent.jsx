import axios from "axios";
import { apiUrl } from "../../../api/config.js";
import { ApiError } from "../../../api/errors.js";

const fetchEvents = async (event_type) => {
    try {
        const url =
            event_type === "home"
                ? apiUrl(`/events/?skip=0&limit=50`)
                : apiUrl(`/events/by-type/${event_type}`);

        const response = await axios.get(url);
        return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
        // No events for this filter -> empty state, not a crash.
        if (err?.response?.status === 404) return [];

        const detail = err?.response?.data?.detail || err?.response?.data?.message || "";
        throw new ApiError(detail || "Failed to load events", {
            status: err?.response?.status,
            detail,
        });
    }
};

export default fetchEvents;
