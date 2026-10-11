import { useAuth } from '../../context/AuthContext';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    FaUserCircle, FaEdit, FaHeart, FaCheckCircle,
    FaExclamationTriangle, FaPhone, FaEnvelope, FaUser,
    FaSignOutAlt, FaSave, FaTimes, FaCalendarAlt, FaHistory
} from "react-icons/fa";
import axios from "axios";
import { apiUrl } from "../../api/config.js";
import { getApiErrorMessage } from "../../api/errors.js";
import { fetchMe, updateProfile } from "./Profileapi.js";
import { fetchFavourites } from "../../api/favourites.js";

function Profile() {

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [statusMsg, setStatusMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const [profile, setProfile] = useState({
        first_name: "",
        last_name: "",
        email: "",
    });

    // Tab state
    const [activeTab, setActiveTab] = useState("favourites");

    // Favourites
    const [favLoading, setFavLoading] = useState(false);
    const [favouriteIds, setFavouriteIds] = useState([]);
    const [favouriteEvents, setFavouriteEvents] = useState([]);

    // Current bookings (placeholder - replace with actual API)
    const [currentBookings, setCurrentBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);

    // Previous events (placeholder - replace with actual API)
    const [previousEvents, setPreviousEvents] = useState([]);
    const [previousLoading, setPreviousLoading] = useState(false);

    useEffect(() => {
        if (!user) navigate("/");
    }, [user]);

    // Load profile
    useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (!user) return;
            setErrorMsg(""); setStatusMsg("");
            try {
                const token = await user.getIdToken();
                const me = await fetchMe(token);
                if (!mounted) return;
                setProfile({
                    first_name: me?.first_name ?? "",
                    last_name: me?.last_name ?? "",
                    email: me?.email ?? "",
                });
            } catch (err) {
                if (mounted) setErrorMsg(getApiErrorMessage(err, "Failed to load profile"));
            }
        };
        load();
        return () => { mounted = false; };
    }, [user]);

    // Load favourites
    useEffect(() => {
        let mounted = true;
        const loadFavs = async () => {
            if (!user) return;
            setFavLoading(true);
            try {
                const token = await user.getIdToken();
                const ids = await fetchFavourites(token);
                if (!mounted) return;
                setFavouriteIds(Array.isArray(ids) ? ids : []);
                const events = await Promise.all(
                    (ids || []).slice(0, 50).map(async (id) => {
                        try {
                            const res = await axios.get(apiUrl(`/events/by-uuid/${id}`));
                            return res.data;
                        } catch { return null; }
                    })
                );
                if (!mounted) return;
                setFavouriteEvents(events.filter(Boolean));
            } finally {
                if (mounted) setFavLoading(false);
            }
        };
        loadFavs();
        return () => { mounted = false; };
    }, [user]);

    // TODO: Load current bookings when activeTab changes
    useEffect(() => {
        if (activeTab === "bookings" && currentBookings.length === 0) {
            // loadCurrentBookings();
        }
    }, [activeTab]);

    // TODO: Load previous events when activeTab changes
    useEffect(() => {
        if (activeTab === "previous" && previousEvents.length === 0) {
            // loadPreviousEvents();
        }
    }, [activeTab]);

    const handleLogout = async () => { await logout(); navigate("/"); };

    const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

    const handleSave = async () => {
        if (!user) return;

        setSaving(true);
        setErrorMsg("");
        setStatusMsg("");

        try {
            const token = await user.getIdToken();

            const updated = await updateProfile(token, {
                first_name: profile.first_name,
                last_name: profile.last_name,
                email: profile.email,
            });

            setProfile({
                first_name: updated?.first_name ?? profile.first_name,
                last_name: updated?.last_name ?? profile.last_name,
                email: updated?.email ?? profile.email,
            });

            setEditMode(false);
            setStatusMsg("Profile updated successfully.");

        } catch (err) {
            setErrorMsg(getApiErrorMessage(err, "Failed to save profile"));
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    const displayName = (profile.first_name || profile.last_name)
        ? `${profile.first_name} ${profile.last_name}`.trim()
        : "Explorer";
    const initials = `${profile.first_name?.[0] ?? ""}${profile.last_name?.[0] ?? ""}`.toUpperCase();

    return (
        <div className="min-h-screen bg-[#0f172a] text-white">

            {/* ── Hero Banner ── */}
            <div className="relative h-56 sm:h-72 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b"
                    alt="Adventure banner"
                    className="w-full h-full object-cover"
                    style={{ filter: "brightness(0.38)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f172a]/30 to-[#0f172a]" />
                <div className="absolute top-6 right-8 hidden sm:flex items-center gap-2">
                    <span className="font-bebas text-2xl tracking-widest text-white/60 uppercase">
                        My Profile
                    </span>
                </div>
            </div>

            {/* ── Page body ── */}
            <div className="pl-16 sm:pl-20 pr-4 sm:pr-8 pb-24">
                <div className="max-w-5xl mx-auto">

                    {/* ── Avatar row ── */}
                    <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-16 relative z-10">

                        {/* Avatar */}
                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#1e293b] border-4 border-[#0f172a] shadow-2xl flex items-center justify-center shrink-0">
                            {initials
                                ? <span className="font-bebas text-4xl sm:text-5xl text-white tracking-wider select-none">{initials}</span>
                                : <FaUserCircle className="text-6xl text-gray-500" />
                            }
                        </div>

                        {/* Name block */}
                        <div className="flex-1 pb-2 min-w-0">
                            <h1 className="font-bebas text-3xl sm:text-4xl tracking-wider text-white leading-none">
                                {displayName}
                            </h1>
                            <div className="flex items-center gap-2 mt-1.5">
                                <FaPhone className="text-gray-500 text-xs" />
                                <p className="text-sm text-gray-400">{user.phoneNumber}</p>
                            </div>
                            <span className="inline-block mt-2 text-xs text-gray-500 uppercase tracking-widest border border-gray-700 rounded px-2 py-0.5">
                                Adventure Explorer
                            </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-3 pb-2 shrink-0">
                            {!editMode ? (
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-600 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200"
                                >
                                    <FaEdit className="text-xs" /> Edit Profile
                                </button>
                            ) : (
                                <>
                                    <button
                                        disabled={saving}
                                        onClick={handleSave}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-all duration-200"
                                    >
                                        <FaSave className="text-xs" />
                                        {saving ? "Saving..." : "Save Changes"}
                                    </button>
                                    <button
                                        onClick={() => setEditMode(false)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-600 bg-white/5 text-gray-300 hover:bg-white/10 transition-all duration-200"
                                    >
                                        <FaTimes className="text-xs" /> Cancel
                                    </button>
                                </>
                            )}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all duration-200"
                            >
                                <FaSignOutAlt className="text-xs" /> Logout
                            </button>
                        </div>
                    </div>

                    {/* ── Divider ── */}
                    <div className="h-px bg-gray-800 mt-6 mb-6" />

                    {/* ── Toast messages ── */}
                    {(statusMsg || errorMsg) && (
                        <div className="mb-6 space-y-2">
                            {statusMsg && (
                                <div className="flex items-center gap-2.5 text-sm bg-green-500/10 border border-green-500/20 text-green-300 rounded-lg px-4 py-3">
                                    <FaCheckCircle className="shrink-0" /> {statusMsg}
                                </div>
                            )}
                            {errorMsg && (
                                <div className="flex items-center gap-2.5 text-sm bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg px-4 py-3">
                                    <FaExclamationTriangle className="shrink-0" /> {errorMsg}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Profile Card ── */}
                    <div className="bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden mb-8">

                        {/* Card header */}
                        <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-3">
                            <FaUser className="text-gray-500 text-sm" />
                            <span className="font-semibold text-sm text-gray-200 tracking-wide uppercase">Account Details</span>
                        </div>

                        <div className="p-6 space-y-5">

                            {/* Phone (locked) */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <label className="text-xs text-gray-500 uppercase tracking-wider sm:w-32 shrink-0">
                                    Phone Number
                                </label>
                                <div className="flex-1 flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={user.phoneNumber || "—"}
                                        disabled
                                        className="flex-1 bg-[#020617]/50 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
                                    />
                                    <span className="text-xs text-gray-700 border border-gray-800 rounded px-2 py-1">locked</span>
                                </div>
                            </div>

                            {/* First Name */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <label className="text-xs text-gray-500 uppercase tracking-wider sm:w-32 shrink-0">
                                    First Name
                                </label>
                                <div className="flex-1">
                                    {editMode ? (
                                        <input
                                            name="first_name"
                                            value={profile.first_name}
                                            onChange={handleChange}
                                            placeholder="Enter your first name"
                                            className="w-full bg-[#020617] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-gray-500 transition-colors"
                                        />
                                    ) : (
                                        <div className="px-4 py-2.5 text-sm text-gray-200">
                                            {profile.first_name || <span className="text-gray-600 italic">Not set</span>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Last Name */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <label className="text-xs text-gray-500 uppercase tracking-wider sm:w-32 shrink-0">
                                    Last Name
                                </label>
                                <div className="flex-1">
                                    {editMode ? (
                                        <input
                                            name="last_name"
                                            value={profile.last_name}
                                            onChange={handleChange}
                                            placeholder="Enter your last name"
                                            className="w-full bg-[#020617] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-gray-500 transition-colors"
                                        />
                                    ) : (
                                        <div className="px-4 py-2.5 text-sm text-gray-200">
                                            {profile.last_name || <span className="text-gray-600 italic">Not set</span>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                                <label className="text-xs text-gray-500 uppercase tracking-wider sm:w-32 shrink-0 sm:pt-2.5">
                                    Email Address
                                </label>
                                <div className="flex-1">
                                    {editMode ? (
                                        <>
                                            <input
                                                name="email"
                                                type="email"
                                                value={profile.email}
                                                onChange={handleChange}
                                                placeholder="your.email@example.com"
                                                className="w-full bg-[#020617] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-gray-500 transition-colors"
                                            />
                                            <div className="mt-3 flex items-start gap-2 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                                                <FaEnvelope className="text-blue-400 text-xs mt-0.5 shrink-0" />
                                                <p className="text-xs text-blue-300 leading-relaxed">
                                                    All important updates and booking details will be sent to this email. Please make sure it is correct.
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="px-4 py-2.5 text-sm text-gray-200 break-all">
                                            {profile.email || <span className="text-gray-600 italic">Not set</span>}
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* ── Tabs Section ── */}
                    <div>
                        {/* Tab Navigation */}
                        <div className="flex items-center gap-1 border-b border-gray-800 mb-6">
                            <button
                                onClick={() => setActiveTab("favourites")}
                                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${activeTab === "favourites"
                                    ? "border-white text-white"
                                    : "border-transparent text-gray-500 hover:text-gray-300"
                                    }`}
                            >
                                <FaHeart className="text-xs" />
                                <span>Favourites</span>
                                {favouriteIds.length > 0 && (
                                    <span className="ml-1 px-2 py-0.5 text-xs bg-gray-800 rounded-full">
                                        {favouriteIds.length}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setActiveTab("bookings")}
                                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${activeTab === "bookings"
                                    ? "border-white text-white"
                                    : "border-transparent text-gray-500 hover:text-gray-300"
                                    }`}
                            >
                                <FaCalendarAlt className="text-xs" />
                                <span>Current Bookings</span>
                                {currentBookings.length > 0 && (
                                    <span className="ml-1 px-2 py-0.5 text-xs bg-gray-800 rounded-full">
                                        {currentBookings.length}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setActiveTab("previous")}
                                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${activeTab === "previous"
                                    ? "border-white text-white"
                                    : "border-transparent text-gray-500 hover:text-gray-300"
                                    }`}
                            >
                                <FaHistory className="text-xs" />
                                <span>Previous Events</span>
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[400px]">
                            {/* Favourites Tab */}
                            {activeTab === "favourites" && (
                                <FavouritesTab
                                    loading={favLoading}
                                    favourites={favouriteEvents}
                                    count={favouriteIds.length}
                                />
                            )}

                            {/* Current Bookings Tab */}
                            {activeTab === "bookings" && (
                                <CurrentBookingsTab
                                    loading={bookingsLoading}
                                    bookings={currentBookings}
                                />
                            )}

                            {/* Previous Events Tab */}
                            {activeTab === "previous" && (
                                <PreviousEventsTab
                                    loading={previousLoading}
                                    events={previousEvents}
                                />
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

/* ── Tab Components ── */

function FavouritesTab({ loading, favourites, count }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center gap-3 text-gray-500 text-sm py-16">
                <div className="w-5 h-5 border-2 border-gray-700 border-t-gray-400 rounded-full animate-spin" />
                Loading favourites...
            </div>
        );
    }

    if (count === 0) {
        return (
            <div className="bg-[#1e293b] rounded-xl border border-gray-800 py-20 px-6 text-center">
                <FaHeart className="mx-auto text-4xl text-gray-700 mb-4" />
                <p className="text-gray-400 text-base font-medium">No favourites yet</p>
                <p className="text-gray-600 text-sm mt-2">Explore adventures and save the ones you love</p>
                <a
                    href="/"
                    className="inline-block mt-6 text-sm text-white bg-white/10 border border-gray-700 rounded-lg px-6 py-2.5 hover:bg-white/15 hover:border-gray-600 transition-colors"
                >
                    Explore Adventures
                </a>
            </div >
        );
    }

    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {favourites.map((ev) => (
                <a
                    key={ev.event_uuid ?? ev.id}
                    href={`/eventDetails/${ev.id}`}
                    className="group bg-[#1e293b] rounded-xl border border-gray-800 hover:border-gray-700 transition-all duration-300 block overflow-hidden"
                >
                    {/* Cover image */}
                    <div className="aspect-[16/9] overflow-hidden bg-[#020617] relative">
                        <img
                            src={ev.cover_image_url}
                            alt={ev.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            style={{ filter: "brightness(0.85)" }}
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b]/80 to-transparent" />
                        {/* Heart badge */}
                        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center border border-white/10">
                            <FaHeart className="text-sm text-red-400" />
                        </div>
                    </div>
                    {/* Info */}
                    <div className="p-4">
                        <p className="text-sm font-semibold text-white line-clamp-1 group-hover:text-gray-200 transition-colors">
                            {ev.title}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1.5 leading-relaxed">
                            {ev.short_description}
                        </p>
                    </div>
                </a>
            ))
            }
        </div >
    );
}

function CurrentBookingsTab({ loading, bookings }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center gap-3 text-gray-500 text-sm py-16">
                <div className="w-5 h-5 border-2 border-gray-700 border-t-gray-400 rounded-full animate-spin" />
                Loading bookings...
            </div>
        );
    }

    // TODO: Replace with actual booking data
    return (
        <div className="bg-[#1e293b] rounded-xl border border-gray-800 py-20 px-6 text-center">
            <FaCalendarAlt className="mx-auto text-4xl text-gray-700 mb-4" />
            <p className="text-gray-400 text-base font-medium">No current bookings</p>
            <p className="text-gray-600 text-sm mt-2">Book an adventure to see it here</p>
            <a
                href="/"
                className="inline-block mt-6 text-sm text-white bg-white/10 border border-gray-700 rounded-lg px-6 py-2.5 hover:bg-white/15 hover:border-gray-600 transition-colors"
            >
                Browse Events
            </a>
        </div >
    );
}

function PreviousEventsTab({ loading, events }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center gap-3 text-gray-500 text-sm py-16">
                <div className="w-5 h-5 border-2 border-gray-700 border-t-gray-400 rounded-full animate-spin" />
                Loading previous events...
            </div>
        );
    }

    // TODO: Replace with actual previous events data
    return (
        <div className="bg-[#1e293b] rounded-xl border border-gray-800 py-20 px-6 text-center">
            <FaHistory className="mx-auto text-4xl text-gray-700 mb-4" />
            <p className="text-gray-400 text-base font-medium">No previous events</p>
            <p className="text-gray-600 text-sm mt-2">Your completed adventures will appear here</p>
        </div>
    );
}

export default Profile;