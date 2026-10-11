import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api";
import Navbar from "../components/Navbar/NavBar";

/**
 * Same "Basecamp" palette as the login page and navbar — ink / paper /
 * brass — kept consistent across the whole admin surface.
 */

const EASE = [0.16, 1, 0.3, 1];
const PAGE_SIZE_OPTIONS = [10, 25, 50];

const DIFFICULTY_RANK = {
    easy: 1,
    moderate: 2,
    difficult: 3,
    strenuous: 3,
    hard: 3,
    "very hard": 4,
    extreme: 4,
};

// Raw `event_type` values from the API are inconsistent ("adventure ",
// "peek" instead of "peak"), so normalize before using them to filter/group.
function normalizeType(rawType) {
    const t = (rawType || "").trim().toLowerCase();
    if (t === "peek") return "peak";
    if (t === "special_event") return "special event";
    return t || "unknown";
}

function difficultyOf(event) {
    return (
        event.adventure_difficulty_level ||
        event.trek_difficulty_level ||
        event.peak_difficulty_level ||
        null
    );
}

function difficultyRank(event) {
    const d = (difficultyOf(event) || "").toLowerCase();
    return DIFFICULTY_RANK[d] ?? 0;
}

function durationOf(event) {
    return event.duration_days ?? 0;
}

// Loosely groups the many free-text `state` values seen from the API into a
// small set of visual buckets, without discarding the original label.
function stateBucket(state) {
    const s = (state || "").toLowerCase();
    if (s.includes("launch")) return "live";
    if (s.includes("progress")) return "active";
    if (s.includes("completed")) return "done";
    if (s.includes("upcoming")) return "upcoming";
    return "other";
}

const STATE_STYLES = {
    live: "bg-[#4B5842]/10 text-[#4B5842] border border-[#4B5842]/25",
    active: "bg-[#A9782F]/10 text-[#A9782F] border border-[#A9782F]/30",
    upcoming: "bg-[#1B222C]/[0.06] text-[#1B222C]/70 border border-[#1B222C]/15",
    done: "bg-[#6E6A5E]/10 text-[#6E6A5E] border border-[#6E6A5E]/20",
    other: "bg-[#9C4A3C]/[0.08] text-[#9C4A3C] border border-[#9C4A3C]/20",
};

const TYPE_LABELS = {
    trek: "Trek",
    adventure: "Adventure",
    trip: "Trip",
    peak: "Peak",
    "special event": "Special Event",
    unknown: "Other",
};

function SortIcon({ direction }) {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            {direction === "asc" ? <path d="m18 15-6-6-6 6" /> : <path d="m6 9 6 6 6-6" />}
        </svg>
    );
}

export default function EventsListPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [stateFilter, setStateFilter] = useState("all");
    const [sortKey, setSortKey] = useState("created_desc");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    const navigate = useNavigate();

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            setError("");
            try {
                const res = await API.get("/events/", {
                    params: { skip: 0, limit: 200 },
                });
                if (!cancelled) setEvents(res.data || []);
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                        "Couldn't load events. Try refreshing the page."
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const typeOptions = useMemo(() => {
        const set = new Set(events.map((e) => normalizeType(e.event_type)));
        return Array.from(set).sort();
    }, [events]);

    const stateOptions = useMemo(() => {
        const set = new Set(events.map((e) => e.state).filter(Boolean));
        return Array.from(set).sort();
    }, [events]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return events.filter((e) => {
            if (typeFilter !== "all" && normalizeType(e.event_type) !== typeFilter) return false;
            if (stateFilter !== "all" && e.state !== stateFilter) return false;
            if (q) {
                const hay = `${e.title} ${e.location}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [events, search, typeFilter, stateFilter]);

    const sorted = useMemo(() => {
        const arr = [...filtered];
        switch (sortKey) {
            case "created_desc":
                return arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            case "created_asc":
                return arr.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            case "title_asc":
                return arr.sort((a, b) => a.title.localeCompare(b.title));
            case "title_desc":
                return arr.sort((a, b) => b.title.localeCompare(a.title));
            case "type_asc":
                return arr.sort((a, b) =>
                    normalizeType(a.event_type).localeCompare(normalizeType(b.event_type))
                );
            case "duration_asc":
                return arr.sort((a, b) => durationOf(a) - durationOf(b));
            case "duration_desc":
                return arr.sort((a, b) => durationOf(b) - durationOf(a));
            case "difficulty_asc":
                return arr.sort((a, b) => difficultyRank(a) - difficultyRank(b));
            case "difficulty_desc":
                return arr.sort((a, b) => difficultyRank(b) - difficultyRank(a));
            default:
                return arr;
        }
    }, [filtered, sortKey]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const clampedPage = Math.min(page, totalPages);
    const pageItems = sorted.slice(
        (clampedPage - 1) * pageSize,
        clampedPage * pageSize
    );

    // Reset to page 1 whenever the result set changes shape
    useEffect(() => {
        setPage(1);
    }, [search, typeFilter, stateFilter, sortKey, pageSize]);

    const resetFilters = () => {
        setSearch("");
        setTypeFilter("all");
        setStateFilter("all");
        setSortKey("created_desc");
    };

    return (
        <div className="min-h-screen bg-[#F5F2E9]">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                    <div>
                        <p className="text-[11px] font-medium tracking-[0.3em] text-[#4B5842] uppercase mb-1">
                            Basecamp
                        </p>
                        <h1 className="text-3xl font-serif text-[#1B222C]">Events</h1>
                    </div>
                    <button
                        onClick={() => navigate("/admin/events/new")}
                        className="bg-[#1B222C] hover:bg-[#A9782F] text-[#F5F2E9] text-sm font-medium px-5 py-2.5 rounded-sm transition-colors"
                    >
                        + New event
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3 mb-5">
                    <div className="relative flex-1 min-w-[220px]">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6A5E]/60"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <circle cx="11" cy="11" r="7" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by title or location"
                            className="w-full bg-white border border-[#1B222C]/12 rounded-sm pl-9 pr-3 py-2.5 text-sm text-[#1B222C] placeholder:text-[#6E6A5E]/50 outline-none focus:border-[#A9782F] transition-colors"
                        />
                    </div>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="bg-white border border-[#1B222C]/12 rounded-sm px-3 py-2.5 text-sm text-[#1B222C] outline-none focus:border-[#A9782F] transition-colors"
                    >
                        <option value="all">All types</option>
                        {typeOptions.map((t) => (
                            <option key={t} value={t}>
                                {TYPE_LABELS[t] || t}
                            </option>
                        ))}
                    </select>

                    <select
                        value={stateFilter}
                        onChange={(e) => setStateFilter(e.target.value)}
                        className="bg-white border border-[#1B222C]/12 rounded-sm px-3 py-2.5 text-sm text-[#1B222C] outline-none focus:border-[#A9782F] transition-colors"
                    >
                        <option value="all">All states</option>
                        {stateOptions.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>

                    <select
                        value={sortKey}
                        onChange={(e) => setSortKey(e.target.value)}
                        className="bg-white border border-[#1B222C]/12 rounded-sm px-3 py-2.5 text-sm text-[#1B222C] outline-none focus:border-[#A9782F] transition-colors"
                    >
                        <option value="created_desc">Newest first</option>
                        <option value="created_asc">Oldest first</option>
                        <option value="title_asc">Title A–Z</option>
                        <option value="title_desc">Title Z–A</option>
                        <option value="type_asc">Type</option>
                        <option value="duration_asc">Shortest duration</option>
                        <option value="duration_desc">Longest duration</option>
                        <option value="difficulty_asc">Easiest first</option>
                        <option value="difficulty_desc">Hardest first</option>
                    </select>

                    {(search || typeFilter !== "all" || stateFilter !== "all" || sortKey !== "created_desc") && (
                        <button
                            onClick={resetFilters}
                            className="text-sm text-[#9C4A3C] hover:underline"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="bg-white rounded-sm border border-[#1B222C]/8 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[#1B222C]/8 text-left">
                                    <th className="px-5 py-3 font-medium text-[#6E6A5E] w-[34%]">Event</th>
                                    <th className="px-5 py-3 font-medium text-[#6E6A5E]">Type</th>
                                    <th className="px-5 py-3 font-medium text-[#6E6A5E]">Difficulty</th>
                                    <th className="px-5 py-3 font-medium text-[#6E6A5E]">Duration</th>
                                    <th className="px-5 py-3 font-medium text-[#6E6A5E]">Capacity</th>
                                    <th className="px-5 py-3 font-medium text-[#6E6A5E]">State</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading &&
                                    Array.from({ length: 6 }).map((_, i) => (
                                        <tr key={i} className="border-b border-[#1B222C]/6 last:border-0">
                                            <td className="px-5 py-4" colSpan={6}>
                                                <div className="h-10 bg-[#1B222C]/5 rounded-sm animate-pulse" />
                                            </td>
                                        </tr>
                                    ))}

                                {!loading && error && (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-10 text-center text-[#9C4A3C]">
                                            {error}
                                        </td>
                                    </tr>
                                )}

                                {!loading && !error && pageItems.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-10 text-center text-[#6E6A5E]">
                                            No events match these filters.
                                        </td>
                                    </tr>
                                )}

                                {!loading &&
                                    !error &&
                                    pageItems.map((event, i) => {
                                        const bucket = stateBucket(event.state);
                                        return (
                                            <motion.tr
                                                key={event.event_id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.25, ease: EASE, delay: i * 0.02 }}
                                                onClick={() => navigate(`/admin/events/${event.event_id}`)}
                                                className="border-b border-[#1B222C]/6 last:border-0 cursor-pointer hover:bg-[#A9782F]/[0.04] transition-colors"
                                            >
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={event.cover_image_url}
                                                            alt=""
                                                            className="h-11 w-11 rounded-sm object-cover shrink-0 bg-[#1B222C]/5"
                                                        />
                                                        <div className="min-w-0">
                                                            <p className="text-[#1B222C] font-medium truncate">
                                                                {event.title}
                                                            </p>
                                                            <p className="text-[#6E6A5E] text-xs truncate">
                                                                {event.location}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-[#1B222C]/[0.06] text-[#1B222C]/75">
                                                        {TYPE_LABELS[normalizeType(event.event_type)] ||
                                                            event.event_type}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-[#1B222C]/80">
                                                    {difficultyOf(event) || "—"}
                                                </td>
                                                <td className="px-5 py-3.5 text-[#1B222C]/80">
                                                    {event.duration_days}D / {event.duration_nights}N
                                                </td>
                                                <td className="px-5 py-3.5 text-[#1B222C]/80">
                                                    {event.max_participants_allowed ?? "—"}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span
                                                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATE_STYLES[bucket]}`}
                                                    >
                                                        {event.state}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {!loading && !error && sorted.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-5">
                        <p className="text-sm text-[#6E6A5E]">
                            Showing {(clampedPage - 1) * pageSize + 1}–
                            {Math.min(clampedPage * pageSize, sorted.length)} of {sorted.length}
                        </p>

                        <div className="flex items-center gap-3">
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                className="bg-white border border-[#1B222C]/12 rounded-sm px-2.5 py-1.5 text-sm text-[#1B222C] outline-none focus:border-[#A9782F]"
                            >
                                {PAGE_SIZE_OPTIONS.map((n) => (
                                    <option key={n} value={n}>
                                        {n} / page
                                    </option>
                                ))}
                            </select>

                            <div className="flex items-center gap-1">
                                <button
                                    disabled={clampedPage === 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className="h-8 w-8 flex items-center justify-center rounded-sm border border-[#1B222C]/12 text-[#1B222C] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#A9782F] transition-colors"
                                    aria-label="Previous page"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="m15 18-6-6 6-6" />
                                    </svg>
                                </button>
                                <span className="px-3 text-sm text-[#1B222C]">
                                    {clampedPage} / {totalPages}
                                </span>
                                <button
                                    disabled={clampedPage === totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    className="h-8 w-8 flex items-center justify-center rounded-sm border border-[#1B222C]/12 text-[#1B222C] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#A9782F] transition-colors"
                                    aria-label="Next page"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="m9 18 6-6-6-6" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}