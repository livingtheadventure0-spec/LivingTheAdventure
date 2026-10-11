import { apiUrl } from "../../api/config.js";
import { ApiError } from "../../api/errors.js";

const fetchHero = async (heroType) => {
    let response = await fetch(
        apiUrl(`/heroes/by-type/${heroType}`),
        {
            headers: { Accept: "application/json" },
            credentials: "include",
        }
    );

    if (!response.ok) {
        // Treat "no heroes" as empty list to simplify UI handling.
        if (response.status === 404) return [];

        let detail = "";
        try {
            const ct = response.headers.get("content-type") || "";
            if (ct.includes("application/json")) {
                const body = await response.json();
                detail = body?.detail || body?.message || "";
            } else {
                detail = await response.text();
            }
        } catch {
            // ignore parse errors
        }

        throw new ApiError(detail || `Request failed (${response.status})`, {
            status: response.status,
            detail,
        });
    }

    const data = await response.json();

    if (!Array.isArray(data)) return [];

    return data.map((item) => ({
        id: item.id,
        eventId: item.event_id,
        title: item.title,
        video: item.video_url,
        thumbnail: item.thumbnail_image_url,
        logo: item.thumbnail_image_url,
        description: item.description,
        details: item.details,
        genres: item.genres,
    }));
};

export default fetchHero;
