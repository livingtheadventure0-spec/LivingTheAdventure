import axios from "axios";
import { apiUrl } from "../../../api/config.js";
import { ApiError } from "../../../api/errors.js";

const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const fetchEventsByID = async (eventIdentifier) => {
    const identifier = String(eventIdentifier ?? "").trim();

    if (!identifier) {
        throw new ApiError("A valid event ID is required.", {
            code: "INVALID_EVENT_ID",
        });
    }

    // Homepage hero cards use the event UUID. The API's /events/{event_id}
    // route expects an integer, so UUIDs must use the dedicated by-uuid route.
    const endpoint = UUID_PATTERN.test(identifier)
        ? `/events/by-uuid/${encodeURIComponent(identifier)}`
        : `/events/${encodeURIComponent(identifier)}`;

    try {
        const response = await axios.get(apiUrl(endpoint));
        return response.data;
    } catch (err) {
        const status = err?.response?.status;
        const detail = err?.response?.data?.detail || err?.response?.data?.message;

        if (status === 404) {
            throw new ApiError("Event not found.", {
                status,
                detail,
                code: "NOT_FOUND",
            });
        }

        // FastAPI validation errors can return an array of objects in detail.
        // Convert these to readable text rather than displaying "[object Object]".
        const readableDetail = Array.isArray(detail)
            ? detail
                .map((item) => {
                    if (typeof item === "string") return item;
                    if (item && typeof item === "object") {
                        return item.msg || item.message || JSON.stringify(item);
                    }
                    return String(item);
                })
                .join(", ")
            : typeof detail === "string"
                ? detail
                : detail && typeof detail === "object"
                    ? detail.msg || detail.message || JSON.stringify(detail)
                    : "";

        throw new ApiError(readableDetail || "Failed to load event. Please try again.", {
            status,
            detail: readableDetail,
        });
    }
};

export default fetchEventsByID;
