import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaRegBell, FaSpinner } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchMe } from "../Profile/Profileapi.js";

const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "fee7630b-38b1-43bf-8ddc-81ca027ba964";

function storageKey(userId, eventId) {
    return `event-interest:${userId}:${eventId}`;
}

export default function InterestButton({ event }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const eventId = event?.event_id || event?.id;
    const isLaunched = event?.status === "published" &&
        String(event?.state || "").trim().toLowerCase() === "launched now!";

    useEffect(() => {
        if (!user || !eventId) {
            setSubmitted(false);
            return;
        }

        setSubmitted(localStorage.getItem(storageKey(user.uid, eventId)) === "submitted");
    }, [user, eventId]);

    useEffect(() => {
        let active = true;

        async function loadProfile() {
            if (!user) {
                setProfile(null);
                return;
            }

            setLoadingProfile(true);
            try {
                const token = await user.getIdToken();
                const me = await fetchMe(token);
                if (active) setProfile(me);
            } catch {
                if (active) setProfile(null);
            } finally {
                if (active) setLoadingProfile(false);
            }
        }

        loadProfile();
        return () => {
            active = false;
        };
    }, [user]);

    if (!isLaunched || !eventId) return null;

    const handleInterest = async () => {
        setError("");

        if (!user) {
            navigate("/auth", {
                state: { returnTo: location.pathname + location.search },
            });
            return;
        }

        if (submitted || submitting) return;

        if (!WEB3FORMS_ACCESS_KEY) {
            setError("We couldn't connect to the interest form right now. Please try again in a moment.");
            return;
        }

        setSubmitting(true);

        try {
            const token = await user.getIdToken();
            const currentProfile = profile || await fetchMe(token);
            const firstName = currentProfile?.first_name || "";
            const lastName = currentProfile?.last_name || "";
            const name = `${firstName} ${lastName}`.trim() ||
                user.displayName ||
                "Adventure explorer";
            const phone = user.phoneNumber || currentProfile?.phone_number || currentProfile?.phone || "";

            if (!phone) {
                throw new Error("We couldn't find a phone number on your account. Please update your profile or contact support.");
            }

            const payload = new FormData();
            payload.append("access_key", WEB3FORMS_ACCESS_KEY);
            payload.append("subject", `Interested in: ${event.title || "Adventure event"}`);
            payload.append("from_name", "Living the Adventure");
            payload.append("name", name);
            payload.append("phone", phone);
            payload.append("email", user.email || currentProfile?.email || "");
            payload.append("event_id", String(eventId));
            payload.append("event_title", event.title || "Adventure event");
            payload.append("event_state", event.state || "");
            payload.append("message", `A logged-in user is interested in this launched event.\\nEvent: ${event.title || "Adventure event"}\\nEvent ID: ${eventId}\\nName: ${name}\\nPhone: ${phone}\\nEmail: ${user.email || currentProfile?.email || "Not provided"}`);

            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: payload,
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "We couldn't register your interest. Please try again.");
            }

            localStorage.setItem(storageKey(user.uid, eventId), "submitted");
            setSubmitted(true);
        } catch (submitError) {
            setError(submitError.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="w-full bg-neutral-950 px-4 py-6 sm:px-6 sm:py-8">
            <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-950 p-5 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
                <div className="mb-5 min-w-0 sm:mb-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">Now launched</p>
                    <h2 className="mt-2 text-xl font-semibold leading-snug text-white sm:text-2xl">Interested in this adventure?</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-300">
                        {user
                            ? "Let our team know and we’ll follow up with you."
                            : "Log in first, then come back here to register your interest."}
                    </p>
                </div>

                <div className="w-full shrink-0 sm:w-auto">
                    <button
                        type="button"
                        onClick={handleInterest}
                        disabled={submitting || submitted || loadingProfile}
                        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white bg-white px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-52 sm:w-auto"
                    >
                        {submitting ? <FaSpinner className="animate-spin" /> :
                            submitted ? <FaCheckCircle /> : <FaRegBell />}
                        {submitting ? "Sending…" : submitted ? "Interest registered" : user ? "I'm interested" : "Log in to continue"}
                    </button>
                    {error && <p role="alert" className="mt-3 text-sm text-neutral-300">{error}</p>}
                    {submitted && <p role="status" className="mt-3 text-center text-sm text-neutral-300">Your interest has been sent successfully.</p>}
                </div>
            </div>
        </section>
    );
}
