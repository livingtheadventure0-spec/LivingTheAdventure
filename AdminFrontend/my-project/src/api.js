import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Production uses the same-origin Vercel /api rewrite. Set VITE_API_BASE_URL for local development or a separately hosted backend.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

// Request Interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");

    if (token) {
      try {
        const decoded = jwtDecode(token);

        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.clear();
          window.location.replace("/");
          return Promise.reject(new Error("Token expired"));
        }

        // Send token to backend
        config.headers.token = token;
        // OR if your backend expects Bearer:
        // config.headers.Authorization = `Bearer ${token}`;
      } catch (err) {
        localStorage.clear();
        window.location.replace("/");
        return Promise.reject(new Error("Invalid token"));
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace("/");
    }

    return Promise.reject(error);
  },
);

export default API;
