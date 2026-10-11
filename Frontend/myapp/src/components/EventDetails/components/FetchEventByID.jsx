import axios from "axios";
import { apiUrl } from "../../../api/config.js";
import { ApiError } from "../../../api/errors.js";

const fetchEventsByID = async (event_id) => {
    try {
        const response = await axios.get(apiUrl(`/events/${event_id}`));
        return response.data;
    } catch (err) {
        const status = err?.response?.status;
        const detail = err?.response?.data?.detail || err?.response?.data?.message || "";

        if (status === 404) {
            throw new ApiError(detail || "Event not found", { status, detail, code: "NOT_FOUND" });
        }

        throw new ApiError(detail || "Failed to load event", { status, detail });
    }
};

export default fetchEventsByID;
