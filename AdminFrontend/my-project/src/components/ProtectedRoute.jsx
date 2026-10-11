import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({ children }) {
    const token = localStorage.getItem("admin_token");

    if (!token) {
        alert("Session expired. Please login again.");
        return <Navigate to="/" replace />;
    }

    try {
        const decoded = jwtDecode(token);

        if (decoded.exp * 1000 < Date.now()) {
            localStorage.clear();
            alert("Session expired. Please login again.");
            return <Navigate to="/" replace />;
        }

        return children;
    } catch {
        localStorage.clear();
        alert("Invalid session. Please login again.");
        return <Navigate to="/login" replace />;
    }
}