import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api";
import Navbar from "../components/Navbar/NavBar";
import EventScheduleSection from "../CreateEvent/Eventschedulesection";
import { downloadEventPdf } from "../utils/eventPdf.js";

const EASE = [0.16, 1, 0.3, 1];

const TYPE_LABELS = {
    trek: "Trek",
    adventure: "Adventure",
    // UI copy change: display "Tour" while retaining the API event_type value "trip".
    trip: "Tour",
    peak: "Peak",
    special_event: "Special Event",
};

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

const STATUS_STYLES = {
    published: "bg-[#4B5842]/10 text-[#4B5842] border border-[#4B5842]/25",
    draft: "bg-[#1B222C]/[0.06] text-[#1B222C]/70 border border-[#1B222C]/15",
    archived: "bg-[#6E6A5E]/10 text-[#6E6A5E] border border-[#6E6A5E]/20",
};

function fmtDate(iso) {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        });
    } catch {
        return iso;
    }
}

function Section({ title, description, children }) {
    return (
        <div className="bg-white rounded-sm border border-[#1B222C]/8 p-6 md:p-7 mb-5">
            <div className="mb-5">
                <h3 className="text-lg font-serif text-[#1B222C]">{title}</h3>
                {description && (
                    <p className="text-sm text-[#6E6A5E] mt-0.5">{description}</p>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">{children}</div>
        </div>
    );
}

function Field({ label, full, children }) {
    return (
        <div className={full ? "md:col-span-2" : ""}>
            {label && (
                <p className="text-xs font-medium tracking-wide text-[#6E6A5E] uppercase mb-1">
                    {label}
                </p>
            )}
            <div className="text-sm text-[#1B222C]">{children}</div>
        </div>
    );
}

function Value({ children }) {
    const isEmpty =
        children === null ||
        children === undefined ||
        children === "" ||
        (Array.isArray(children) && children.length === 0);
    if (isEmpty) return <span className="text-[#6E6A5E]/50">—</span>;
    return children;
}

function Prose({ children }) {
    const isEmpty = !children;
    if (isEmpty) return <span className="text-[#6E6A5E]/50">—</span>;
    return <p className="whitespace-pre-wrap leading-relaxed text-[#1B222C]/85">{children}</p>;
}

function TagList({ items }) {
    if (!items || items.length === 0) return <span className="text-[#6E6A5E]/50">—</span>;
    return (
        <div className="flex flex-wrap gap-2">
            {items.map((v, i) => (
                <span
                    key={v + i}
                    className="inline-flex items-center gap-1.5 bg-[#1B222C]/[0.05] text-[#1B222C] text-xs px-3 py-1.5 rounded-full"
                >
                    {v}
                </span>
            ))}
        </div>
    );
}

function MediaTile({ label, url, kind = "image" }) {
    return (
        <div>
            <p className="text-xs font-medium tracking-wide text-[#6E6A5E] uppercase mb-2">
                {label}
            </p>
            <div className="h-40 rounded-sm border border-[#1B222C]/10 bg-[#1B222C]/[0.03] overflow-hidden flex items-center justify-center">
                {url ? (
                    kind === "video" ? (
                        <video src={url} className="h-full w-full object-cover" muted controls />
                    ) : (
                        <a href={url} target="_blank" rel="noreferrer" className="block h-full w-full">
                            <img src={url} alt="" className="h-full w-full object-cover" />
                        </a>
                    )
                ) : (
                    <span className="text-xs text-[#6E6A5E]/50">Not uploaded</span>
                )}
            </div>
        </div>
    );
}

export default function EventDetailPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingEvent, setDeletingEvent] = useState(false);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            setError("");
            try {
                const res = await API.get(`/events/by-uuid/${eventId}`);
                if (!cancelled) setEvent(res.data);
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.status === 404
                            ? "This event doesn't exist or was removed."
                            : err.response?.data?.message ||
                            "Couldn't load this event. Try refreshing the page."
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        if (eventId) load();
        return () => {
            cancelled = true;
        };
    }, [eventId]);

    const handleDeleteEvent = async () => {
        const title = event?.title || "this event";
        if (!window.confirm("Delete \"" + title + "\"? All schedules attached to this event will also be deleted. This cannot be undone.")) return;

        setDeletingEvent(true);
        setError("");
        try {
            const token = localStorage.getItem("admin_token");
            await API.delete("/events/" + event.id, { headers: token ? { token } : {} });
            navigate("/admin/events", { replace: true });
        } catch (err) {
            setError(err.readableMessage || err.response?.data?.detail || err.response?.data?.message || "Could not delete this event.");
            setDeletingEvent(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F2E9]">
                <Navbar />
                <main className="max-w-5xl mx-auto px-6 py-10">
                    <div className="h-8 w-40 bg-[#1B222C]/5 rounded-sm animate-pulse mb-6" />
                    <div className="h-56 bg-[#1B222C]/5 rounded-sm animate-pulse mb-5" />
                    <div className="h-40 bg-[#1B222C]/5 rounded-sm animate-pulse mb-5" />
                    <div className="h-40 bg-[#1B222C]/5 rounded-sm animate-pulse" />
                </main>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-[#F5F2E9]">
                <Navbar />
                <main className="max-w-5xl mx-auto px-6 py-10">
                    <div className="pl-4 py-3 border-l-2 border-[#9C4A3C] bg-[#9C4A3C]/[0.06] mb-6">
                        <p className="text-sm text-[#9C4A3C]">{error || "Event not found."}</p>
                    </div>
                    <Link to="/admin/home" className="text-sm text-[#1B222C] hover:text-[#A9782F]">
                        ← Back to events
                    </Link>
                </main>
            </div>
        );
    }

    const difficulty =
        event.adventure_difficulty_level ||
        event.trek_difficulty_level ||
        event.peak_difficulty_level;

    return (
        <div className="min-h-screen bg-[#F5F2E9]">
            <Navbar />

            <main className="max-w-5xl mx-auto px-6 py-10">
                {/* Breadcrumb + actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <Link
                        to="/admin/events"
                        className="text-sm text-[#6E6A5E] hover:text-[#A9782F] flex items-center gap-1.5"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                        Events
                    </Link>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => downloadEventPdf(event)}
                            className="inline-flex items-center gap-2 border border-[#1B222C]/25 bg-white px-4 py-2.5 text-sm font-medium text-[#1B222C] transition-colors hover:bg-[#1B222C]/[0.04] rounded-sm"
                        >
                            Download PDF
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(`/admin/events/${event.event_id}/edit`)}
                            className="bg-[#1B222C] hover:bg-[#A9782F] text-[#F5F2E9] text-sm font-medium px-5 py-2.5 rounded-sm transition-colors"
                        >
                            Edit event
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteEvent}
                            disabled={deletingEvent}
                            className="border border-[#9C4A3C]/35 bg-white px-4 py-2.5 text-sm font-medium text-[#9C4A3C] rounded-sm transition-colors hover:bg-[#9C4A3C]/[0.06] disabled:opacity-50"
                        >
                            {deletingEvent ? "Deleting…" : "Delete event"}
                        </button>
                    </div>
                </div>

                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="bg-white rounded-sm border border-[#1B222C]/8 overflow-hidden mb-5"
                >
                    <div className="h-64 md:h-80 bg-[#1B222C]/[0.04] overflow-hidden">
                        {event.cover_image_url ? (
                            <img
                                src={event.cover_image_url}
                                alt={event.title}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-[#6E6A5E]/50 text-sm">
                                No cover image
                            </div>
                        )}
                    </div>

                    <div className="p-6 md:p-7">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-[#1B222C]/[0.06] text-[#1B222C]/75">
                                {TYPE_LABELS[event.event_type] || event.event_type}
                            </span>
                            {event.label && (
                                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-[#A9782F]/10 text-[#A9782F] border border-[#A9782F]/25">
                                    {event.label}
                                </span>
                            )}
                            {event.state && (
                                <span
                                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATE_STYLES[stateBucket(event.state)]}`}
                                >
                                    {event.state}
                                </span>
                            )}
                            <span
                                className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[event.status] || STATUS_STYLES.draft}`}
                            >
                                {event.status}
                            </span>
                        </div>

                        <h1 className="text-3xl font-serif text-[#1B222C] mb-2">{event.title}</h1>
                        <p className="text-sm text-[#6E6A5E] flex items-center gap-1.5">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            {event.location}
                        </p>

                        {event.short_description && (
                            <p className="mt-4 text-[#1B222C]/80 leading-relaxed">
                                {event.short_description}
                            </p>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#1B222C]/8">
                            <div>
                                <p className="text-xs text-[#6E6A5E] uppercase tracking-wide mb-1">Duration</p>
                                <p className="text-sm font-medium text-[#1B222C]">
                                    {event.duration_days}D / {event.duration_nights}N
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-[#6E6A5E] uppercase tracking-wide mb-1">Difficulty</p>
                                <p className="text-sm font-medium text-[#1B222C]">
                                    <Value>{difficulty}</Value>
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-[#6E6A5E] uppercase tracking-wide mb-1">Min. age</p>
                                <p className="text-sm font-medium text-[#1B222C]">
                                    <Value>{event.age_requirement}</Value>
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-[#6E6A5E] uppercase tracking-wide mb-1">Max participants</p>
                                <p className="text-sm font-medium text-[#1B222C]">
                                    <Value>{event.max_participants_allowed}</Value>
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Schedule — departures, pickups, capacity, pricing */}
                <EventScheduleSection eventId={event.event_id} />

                {/* Classification */}
                <Section title="Classification & requirements">
                    <Field label="Activity category">
                        <Value>{event.adventure_activity_category}</Value>
                    </Field>
                    <Field label="Peak group type">
                        <Value>{event.peak_group_type}</Value>
                    </Field>
                    <Field label="Adventure difficulty">
                        <Value>{event.adventure_difficulty_level}</Value>
                    </Field>
                    <Field label="Trek difficulty">
                        <Value>{event.trek_difficulty_level}</Value>
                    </Field>
                    <Field label="Peak difficulty">
                        <Value>{event.peak_difficulty_level}</Value>
                    </Field>
                    <Field label="Fitness requirement" full>
                        <Prose>{event.fitness_requirement}</Prose>
                    </Field>
                </Section>

                {/* Content */}
                <Section title="Content">
                    <Field label="Itinerary" full>
                        <Prose>{event.itinerary}</Prose>
                    </Field>
                    <Field label="Highlights" full>
                        <TagList items={event.highlights} />
                    </Field>
                </Section>

                {/* Media */}
                <Section
                    title="Media"
                    description="Uploaded assets attached to this event."
                >
                    <MediaTile label="Cover image" url={event.cover_image_url} />
                    <MediaTile label="Promo video" url={event.promo_video_url} kind="video" />
                    <MediaTile label="Horizontal poster 1" url={event.poster_horizontal_1_url} />
                    <MediaTile label="Horizontal poster 2" url={event.poster_horizontal_2_url} />
                    <MediaTile label="Vertical poster" url={event.poster_vertical_3_url} />

                    <Field label="Gallery images" full>
                        {event.gallery_image_urls?.length ? (
                            <div className="flex flex-wrap gap-3">
                                {event.gallery_image_urls.map((url, i) => (
                                    <a
                                        key={url + i}
                                        href={url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="h-24 w-24 rounded-sm overflow-hidden border border-[#1B222C]/10 block"
                                    >
                                        <img src={url} alt="" className="h-full w-full object-cover" />
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <Value>{null}</Value>
                        )}
                    </Field>
                </Section>

                {/* Inclusions */}
                <Section title="Inclusions & exclusions">
                    <Field label="Included services" full>
                        <TagList items={event.included_services} />
                    </Field>
                    <Field label="Excluded services" full>
                        <TagList items={event.excluded_services} />
                    </Field>
                </Section>

                {/* Things to carry */}
                <Section title="Things to Carry" description="What participants should bring for this event.">
                    <Field label="Things to carry" full>
                        <Prose>{event.things_to_carry_text}</Prose>
                    </Field>
                </Section>

                {/* Policies */}
                <Section title="Policies">
                    <Field label="Safety guidelines" full>
                        <Prose>{event.safety_guidelines_text}</Prose>
                    </Field>
                    <Field label="Cancellation policy" full>
                        <Prose>{event.cancellation_policy_text}</Prose>
                    </Field>
                </Section>

                {/* SEO */}
                <Section title="SEO">
                    <Field label="SEO title" full>
                        <Value>{event.seo_title}</Value>
                    </Field>
                    <Field label="SEO description" full>
                        <Prose>{event.seo_description}</Prose>
                    </Field>
                    <Field label="SEO tags" full>
                        <TagList items={event.seo_tags} />
                    </Field>
                </Section>

                {/* Meta */}
                <Section title="Record info">
                    <Field label="Event ID">
                        <code className="text-xs bg-[#1B222C]/[0.05] px-2 py-1 rounded-sm text-[#1B222C]/70">
                            {event.event_id}
                        </code>
                    </Field>
                    <Field label="Internal ID">
                        <Value>{event.id}</Value>
                    </Field>
                    <Field label="Created">{fmtDate(event.created_at)}</Field>
                    <Field label="Updated">{fmtDate(event.updated_at)}</Field>
                </Section>

                <div className="mb-16" />
            </main>
        </div >
    );
}