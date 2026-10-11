import axios from "axios";
import { apiUrl } from "../../../api/config.js";

const fetchEvents = async (item) => {
    const response = await axios.get(
        apiUrl(`/events/${item.id}`)
    );
    return response.data;
};

export default fetchEvents;
