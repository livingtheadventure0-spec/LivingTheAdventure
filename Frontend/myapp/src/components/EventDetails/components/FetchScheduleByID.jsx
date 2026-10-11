import axios from "axios";
import { apiUrl } from "../../../api/config.js";
import { ApiError } from "../../../api/errors.js";

const fetchScheduleByID = async (event_uuid) => {
    try {
        const response = await axios.get(apiUrl(`/event-schedules/by-event/${event_uuid}`));
        return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
        const status = err?.response?.status;
        const detail = err?.response?.data?.detail || err?.response?.data?.message || "";

        // No schedule -> show "no schedule" in UI, not a global error.
        if (status === 404) return [];

        throw new ApiError(detail || "Failed to load schedule", { status, detail });
    }
};

export default fetchScheduleByID;
