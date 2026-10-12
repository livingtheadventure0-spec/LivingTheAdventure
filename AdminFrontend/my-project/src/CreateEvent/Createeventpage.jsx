import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar/NavBar";
import ImageUploadField from "./Imageuploadfield";
import GalleryUploadField from "./Galleryuploadfield";
import TagListInput from "./Taglistinput";

const EVENT_TYPE_OPTIONS = ["trek", "adventure", "trip", "peak", "special_event"];
const DIFFICULTY_OPTIONS = ["Easy", "Moderate", "Difficult", "Strenuous", "Extreme"];
const STATE_SUGGESTIONS = ["Upcoming", "Launched Now!", "In Progress", "Completed", "Sold Out"];
const LABEL_SUGGESTIONS = [
    "Trek",
    "Adventure Activity",
    "Trip",
    "Special Event",
    "Best Of The Year",
    "Popular",
    "Peak Expedition",
];

const createEmptyActivity = () => ({ time: "", activity: "" });
const createEmptyItineraryDay = (day = 1) => ({ day, title: "", description: "", activities: [createEmptyActivity()] });

function normalizeActivities(day) {
    if (Array.isArray(day.activities) && day.activities.length) {
        return day.activities.map((item) => typeof item === "string"
            ? { time: "", activity: item }
            : { time: item.time || "", activity: item.activity || item.description || "" });
    }

    // Migrate older itinerary descriptions into editable activity rows.
    const lines = (day.description || "").split(/\n+/).map((line) => line.replace(/^\s*[•*-]\s*/, "").trim()).filter(Boolean);
    if (!lines.length) return [createEmptyActivity()];

    const parsed = lines.map((line) => {
        const match = line.match(/^(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?):?\s*(.+)$/i);
        return match ? { time: match[1].trim(), activity: match[2].trim() } : { time: "", activity: line };
    });
    return parsed;
}

function parseItinerary(value) {
    if (!value || typeof value !== "string") return [createEmptyItineraryDay()];
    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.map((item, index) => { const day = { ...createEmptyItineraryDay(index + 1), ...item, day: index + 1 }; return { ...day, activities: normalizeActivities(day) }; });
    } catch {
        // Preserve older plain-text itinerary content for editing.
    }
    return value.split(/[;\n]+/).map((title) => title.trim()).filter(Boolean).map((title, index) => ({ ...createEmptyItineraryDay(index + 1), title }));
}
const EMPTY_FORM = {
    title: "",
    event_type: "",
    adventure_activity_category: "",
    adventure_difficulty_level: "",
    trek_difficulty_level: "",
    peak_difficulty_level: "",
    peak_group_type: "",
    age_requirement: "",
    fitness_requirement: "",
    location: "",
    duration_days: "",
    duration_nights: "",
    short_description: "",
    itinerary: [createEmptyItineraryDay()],
    highlights: [],
    cover_image_url: "",
    poster_horizontal_1_url: "",
    poster_horizontal_2_url: "",
    poster_vertical_3_url: "",
    gallery_image_urls: [],
    promo_video_url: "",
    max_participants_allowed: "",
    included_services: [],
    excluded_services: [],
    safety_guidelines_text: "",
    cancellation_policy_text: "",
    seo_tags: [],
    seo_title: "",
    seo_description: "",
    status: "draft",
    state: "",
    label: "",
};

function getAuthHeaders() {
    const token = localStorage.getItem("admin_token");
    return token ? { token } : {};
}

// Backend URL fields (HttpUrl-typed) reject "" as invalid — they need to be
// either a real URL or absent entirely, so blanks get converted to null.
const NULLABLE_IF_BLANK_FIELDS = [
    "adventure_activity_category",
    "adventure_difficulty_level",
    "trek_difficulty_level",
    "peak_difficulty_level",
    "peak_group_type",
    "state",
    "label",
    "cover_image_url",
    "poster_horizontal_1_url",
    "poster_horizontal_2_url",
    "poster_vertical_3_url",
    "promo_video_url",
];

function Section({ title, description, children }) {
    return (
        <div className="bg-white rounded-sm border border-[#1B222C]/8 p-6 md:p-7 mb-5">
            <div className="mb-5">
                <h3 className="text-lg font-serif text-[#1B222C]">{title}</h3>
                {description && (
                    <p className="text-sm text-[#6E6A5E] mt-0.5">{description}</p>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>
        </div>
    );
}

function Field({ label, full, children }) {
    return (
        <div className={full ? "md:col-span-2" : ""}>
            {label && (
                <label className="block text-xs font-medium tracking-wide text-[#6E6A5E] uppercase mb-2">
                    {label}
                </label>
            )}
            {children}
        </div>
    );
}

const inputClass =
    "w-full bg-white border border-[#1B222C]/12 rounded-sm px-3 py-2.5 text-sm text-[#1B222C] placeholder:text-[#6E6A5E]/50 outline-none focus:border-[#A9782F] transition-colors";
const textareaClass = inputClass + " resize-y min-h-[90px]";

export default function CreateEventPage() {
    const { eventId } = useParams();
    const isEditing = Boolean(eventId);
    const [form, setForm] = useState(EMPTY_FORM);
    const [eventRecordId, setEventRecordId] = useState(null);
    const [loadingEvent, setLoadingEvent] = useState(Boolean(eventId));
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!eventId) return undefined;

        let cancelled = false;

        async function loadEvent() {
            setLoadingEvent(true);
            setError("");

            try {
                const response = await API.get(`/events/by-uuid/${eventId}`);
                const event = response.data;

                if (cancelled) return;

                setEventRecordId(event.id);
                setForm({
                    ...EMPTY_FORM,
                    ...event,
                    itinerary: parseItinerary(event.itinerary),
                    age_requirement: event.age_requirement ?? "",
                    duration_days: event.duration_days ?? "",
                    duration_nights: event.duration_nights ?? "",
                    max_participants_allowed: event.max_participants_allowed ?? "",
                    highlights: event.highlights || [],
                    gallery_image_urls: event.gallery_image_urls || [],
                    included_services: event.included_services || [],
                    excluded_services: event.excluded_services || [],
                    seo_tags: event.seo_tags || [],
                    cover_image_url: event.cover_image_url || "",
                    poster_horizontal_1_url: event.poster_horizontal_1_url || "",
                    poster_horizontal_2_url: event.poster_horizontal_2_url || "",
                    poster_vertical_3_url: event.poster_vertical_3_url || "",
                    promo_video_url: event.promo_video_url || "",
                });
            } catch (loadError) {
                if (!cancelled) {
                    setError(
                        loadError.response?.data?.detail ||
                        loadError.response?.data?.message ||
                        "Couldn't load this event for editing."
                    );
                }
            } finally {
                if (!cancelled) setLoadingEvent(false);
            }
        }

        loadEvent();

        return () => {
            cancelled = true;
        };
    }, [eventId]);

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
    const setList = (key) => (values) => setForm((f) => ({ ...f, [key]: values }));
    const setUrl = (key) => (url) => setForm((f) => ({ ...f, [key]: url }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        const payload = {
            ...form,
            itinerary: JSON.stringify(form.itinerary.map((day, index) => ({ day: index + 1, title: day.title.trim(), description: (day.description || "").trim(), activities: (day.activities || []).map((item) => ({ time: (item.time || "").trim(), activity: (item.activity || "").trim() })).filter((item) => item.time || item.activity) })).filter((day) => day.title || day.description || day.activities.length)),
            age_requirement: Number(form.age_requirement) || 0,
            duration_days: Number(form.duration_days) || 0,
            duration_nights: Number(form.duration_nights) || 0,
            max_participants_allowed: Number(form.max_participants_allowed) || 0,
            gallery_image_urls: (form.gallery_image_urls || []).filter(
                (u) => typeof u === "string" && u.trim().length > 0
            ),
        };

        NULLABLE_IF_BLANK_FIELDS.forEach((key) => {
            if (!payload[key] || (typeof payload[key] === "string" && payload[key].trim() === "")) {
                payload[key] = null;
            }
        });
        try {
            const config = { headers: getAuthHeaders() };
            const res = isEditing
                ? await API.put(`/events/${eventRecordId}`, payload, config)
                : await API.post("/events/", payload, config);
            const saved = res.data;

            navigate(
                saved?.event_id
                    ? `/admin/events/${saved.event_id}`
                    : "/admin/home",
                { replace: true }
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Couldn't create the event. Check the required fields and try again."
            );
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F2E9]">
            <Navbar />

            <main className="max-w-4xl mx-auto px-6 py-10">
                <div className="mb-8">
                    <p className="text-[11px] font-medium tracking-[0.3em] text-[#4B5842] uppercase mb-1">
                        Basecamp
                    </p>
                    <h1 className="text-3xl font-serif text-[#1B222C]">{isEditing ? "Edit event" : "New event"}</h1>
                </div>

                {error && (
                    <div className="mb-6 pl-4 py-3 border-l-2 border-[#9C4A3C] bg-[#9C4A3C]/[0.06]">
                        <p className="text-sm text-[#9C4A3C]">{error}</p>
                    </div>
                )}

                {loadingEvent ? (
                    <div className="bg-white border border-[#1B222C]/8 p-6 text-sm text-[#6E6A5E]">Loading event details…</div>
                ) : (
                <form onSubmit={handleSubmit}>
                    <Section title="Basics" description="What the event is and how it's categorized.">
                        <Field label="Title" full>
                            <input
                                required
                                value={form.title}
                                onChange={set("title")}
                                placeholder="Kudremukh Trek – The Green Paradise"
                                className={inputClass}
                            />
                        </Field>

                        <Field label="Event type">
                            <input
                                list="event-type-options"
                                value={form.event_type}
                                onChange={set("event_type")}
                                placeholder="trek"
                                className={inputClass}
                            />
                            <datalist id="event-type-options">
                                {EVENT_TYPE_OPTIONS.map((t) => (
                                    <option key={t} value={t} />
                                ))}
                            </datalist>
                        </Field>

                        <Field label="Activity category">
                            <input
                                value={form.adventure_activity_category}
                                onChange={set("adventure_activity_category")}
                                placeholder="Nature Trek"
                                className={inputClass}
                            />
                        </Field>

                        <Field label="Location" full>
                            <input
                                required
                                value={form.location}
                                onChange={set("location")}
                                placeholder="Kudremukh National Park, Chikmagalur, Karnataka, India"
                                className={inputClass}
                            />
                        </Field>

                        <Field label="Display label">
                            <input
                                list="label-options"
                                value={form.label}
                                onChange={set("label")}
                                placeholder="Trek"
                                className={inputClass}
                            />
                            <datalist id="label-options">
                                {LABEL_SUGGESTIONS.map((l) => (
                                    <option key={l} value={l} />
                                ))}
                            </datalist>
                        </Field>

                        <Field label="State">
                            <input
                                list="state-options"
                                value={form.state}
                                onChange={set("state")}
                                placeholder="Upcoming"
                                className={inputClass}
                            />
                            <datalist id="state-options">
                                {STATE_SUGGESTIONS.map((s) => (
                                    <option key={s} value={s} />
                                ))}
                            </datalist>
                        </Field>

                        <Field label="Status">
                            <select value={form.status} onChange={set("status")} className={inputClass}>
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </Field>
                    </Section>

                    <Section
                        title="Classification & difficulty"
                        description="Fill in whichever difficulty fields apply to this event type."
                    >
                        <Field label="Adventure difficulty">
                            <input
                                list="difficulty-options"
                                value={form.adventure_difficulty_level}
                                onChange={set("adventure_difficulty_level")}
                                className={inputClass}
                            />
                        </Field>
                        <Field label="Trek difficulty">
                            <input
                                list="difficulty-options"
                                value={form.trek_difficulty_level}
                                onChange={set("trek_difficulty_level")}
                                className={inputClass}
                            />
                        </Field>
                        <Field label="Peak difficulty">
                            <input
                                list="difficulty-options"
                                value={form.peak_difficulty_level}
                                onChange={set("peak_difficulty_level")}
                                className={inputClass}
                            />
                        </Field>
                        <datalist id="difficulty-options">
                            {DIFFICULTY_OPTIONS.map((d) => (
                                <option key={d} value={d} />
                            ))}
                        </datalist>

                        <Field label="Peak group type">
                            <input
                                value={form.peak_group_type}
                                onChange={set("peak_group_type")}
                                placeholder="Single Peak"
                                className={inputClass}
                            />
                        </Field>
                        <Field label="Minimum age">
                            <input
                                type="number"
                                min="0"
                                value={form.age_requirement}
                                onChange={set("age_requirement")}
                                className={inputClass}
                            />
                        </Field>

                        <Field label="Fitness requirement" full>
                            <textarea
                                value={form.fitness_requirement}
                                onChange={set("fitness_requirement")}
                                placeholder="Good cardio endurance required. Able to walk 6-8 hours."
                                className={textareaClass}
                            />
                        </Field>
                    </Section>

                    <Section title="Duration & capacity">
                        <Field label="Duration (days)">
                            <input
                                type="number"
                                min="0"
                                value={form.duration_days}
                                onChange={set("duration_days")}
                                className={inputClass}
                            />
                        </Field>
                        <Field label="Duration (nights)">
                            <input
                                type="number"
                                min="0"
                                value={form.duration_nights}
                                onChange={set("duration_nights")}
                                className={inputClass}
                            />
                        </Field>
                        <Field label="Max participants" full>
                            <input
                                type="number"
                                min="0"
                                value={form.max_participants_allowed}
                                onChange={set("max_participants_allowed")}
                                className={inputClass}
                            />
                        </Field>
                    </Section>

                    <Section title="Content">
                        <Field label="Short description" full>
                            <textarea
                                value={form.short_description}
                                onChange={set("short_description")}
                                className={textareaClass}
                            />
                        </Field>
                        <Field label="Trip itinerary" full>
                            <div className="space-y-4">
                                <div className="rounded-lg border border-[#4B5842]/15 bg-[#4B5842]/[0.04] p-4">
                                    <p className="text-sm font-semibold text-[#1B222C]">Build a clear day-by-day schedule</p>
                                    <p className="mt-1 text-sm leading-6 text-[#6E6A5E]">Give each day a heading, then add as many timed activities as needed. Times are optional for flexible activities.</p>
                                </div>
                                {form.itinerary.map((day, index) => {
                                    const activities = day.activities?.length ? day.activities : [createEmptyActivity()];
                                    const updateDay = (changes) => setForm((current) => ({ ...current, itinerary: current.itinerary.map((item, i) => i === index ? { ...item, ...changes } : item) }));
                                    const updateActivity = (activityIndex, changes) => updateDay({ activities: activities.map((item, i) => i === activityIndex ? { ...item, ...changes } : item) });
                                    return (
                                        <section key={index} className="overflow-hidden rounded-xl border border-[#1B222C]/12 bg-white shadow-sm">
                                            <header className="flex items-center justify-between gap-3 border-b border-[#1B222C]/10 bg-[#F9F7F1] px-4 py-3 md:px-5">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4B5842] text-sm font-semibold text-white">{index + 1}</span>
                                                    <div><h4 className="font-semibold text-[#1B222C]">Day {index + 1}</h4><p className="text-xs text-[#6E6A5E]">{activities.filter((item) => item.time || item.activity).length} activities</p></div>
                                                </div>
                                                <button type="button" disabled={form.itinerary.length === 1} onClick={() => setForm((current) => ({ ...current, itinerary: current.itinerary.filter((_, i) => i !== index).map((item, i) => ({ ...item, day: i + 1 })) }))} className="rounded-md px-2 py-1.5 text-xs font-semibold text-[#9C4A3C] hover:bg-[#9C4A3C]/10 disabled:cursor-not-allowed disabled:opacity-40">Remove day</button>
                                            </header>
                                            <div className="space-y-5 p-4 md:p-5">
                                                <Field label="Day title" full>
                                                    <input value={day.title} onChange={(event) => updateDay({ title: event.target.value })} placeholder={index === 0 ? "Saturday Night Departure" : "Sunday — Trek and Return"} className={inputClass} />
                                                </Field>
                                                <div>
                                                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                                        <div><p className="text-sm font-semibold text-[#1B222C]">Schedule & activities</p><p className="text-xs text-[#6E6A5E]">Add one row for each time and activity.</p></div>
                                                        <button type="button" onClick={() => updateDay({ activities: [...activities, createEmptyActivity()] })} className="rounded-md border border-[#4B5842]/30 px-3 py-2 text-xs font-semibold text-[#4B5842] hover:bg-[#4B5842]/[0.06]">+ Add activity</button>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {activities.map((activity, activityIndex) => (
                                                            <div key={activityIndex} className="grid grid-cols-1 items-start gap-2 rounded-lg border border-[#1B222C]/10 bg-[#FCFBF8] p-3 sm:grid-cols-[minmax(130px,0.32fr)_minmax(0,1fr)_36px]">
                                                                <Field label="Time">
                                                                    <input value={activity.time} onChange={(event) => updateActivity(activityIndex, { time: event.target.value })} placeholder="e.g. 05:00 AM" className={inputClass} />
                                                                </Field>
                                                                <Field label="Activity">
                                                                    <input value={activity.activity} onChange={(event) => updateActivity(activityIndex, { activity: event.target.value })} placeholder="e.g. Wake-up call, freshen up and briefing" className={inputClass} />
                                                                </Field>
                                                                <button type="button" disabled={activities.length === 1} onClick={() => updateDay({ activities: activities.filter((_, i) => i !== activityIndex) })} aria-label={`Remove activity ${activityIndex + 1}`} className="mt-5 flex h-9 w-9 items-center justify-center rounded-md text-[#9C4A3C] hover:bg-[#9C4A3C]/10 disabled:opacity-30" title="Remove activity">×</button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <Field label="Additional notes (optional)" full>
                                                    <textarea value={day.description || ""} onChange={(event) => updateDay({ description: event.target.value })} placeholder="Meeting point details, what to carry, meal notes, or other important information..." className={textareaClass} />
                                                </Field>
                                            </div>
                                        </section>
                                    );
                                })}
                                <button type="button" onClick={() => setForm((current) => ({ ...current, itinerary: [...current.itinerary, createEmptyItineraryDay(current.itinerary.length + 1)] }))} className="w-full rounded-lg border border-dashed border-[#4B5842]/45 px-4 py-4 text-sm font-semibold text-[#4B5842] transition-colors hover:bg-[#4B5842]/[0.05]">+ Add another day</button>
                            </div>
                        </Field>
                        <Field full>
                            <TagListInput
                                label="Highlights"
                                values={form.highlights}
                                onChange={setList("highlights")}
                                placeholder="Trek to the 3rd highest peak in Karnataka"
                            />
                        </Field>
                    </Section>

                    <Section
                        title="Media"
                        description="Files upload immediately and attach their storage URL to the event."
                    >
                        <ImageUploadField
                            label="Cover image"
                            folder="cover"
                            value={form.cover_image_url}
                            onChange={setUrl("cover_image_url")}
                        />
                        <ImageUploadField
                            label="Promo video"
                            folder="promo_video"
                            accept="video/*"
                            kind="video"
                            value={form.promo_video_url}
                            onChange={setUrl("promo_video_url")}
                        />
                        <ImageUploadField
                            label="Horizontal poster 1"
                            folder="poster"
                            value={form.poster_horizontal_1_url}
                            onChange={setUrl("poster_horizontal_1_url")}
                        />
                        <ImageUploadField
                            label="Horizontal poster 2"
                            folder="poster"
                            value={form.poster_horizontal_2_url}
                            onChange={setUrl("poster_horizontal_2_url")}
                        />
                        <ImageUploadField
                            label="Vertical poster"
                            folder="poster"
                            value={form.poster_vertical_3_url}
                            onChange={setUrl("poster_vertical_3_url")}
                        />
                        <Field full>
                            <GalleryUploadField
                                label="Gallery images"
                                folder="gallery_image"
                                values={form.gallery_image_urls}
                                onChange={setList("gallery_image_urls")}
                            />
                        </Field>
                    </Section>

                    <Section title="Inclusions & exclusions">
                        <Field full>
                            <TagListInput
                                label="Included services"
                                values={form.included_services}
                                onChange={setList("included_services")}
                                placeholder="Transportation Non-AC Seater"
                            />
                        </Field>
                        <Field full>
                            <TagListInput
                                label="Excluded services"
                                values={form.excluded_services}
                                onChange={setList("excluded_services")}
                                placeholder="Personal expenses"
                            />
                        </Field>
                    </Section>

                    <Section title="Policies">
                        <Field label="Safety guidelines" full>
                            <textarea
                                value={form.safety_guidelines_text}
                                onChange={set("safety_guidelines_text")}
                                className={textareaClass}
                            />
                        </Field>
                        <Field label="Cancellation policy" full>
                            <textarea
                                value={form.cancellation_policy_text}
                                onChange={set("cancellation_policy_text")}
                                className={textareaClass}
                            />
                        </Field>
                    </Section>

                    <Section title="SEO">
                        <Field label="SEO title" full>
                            <input
                                value={form.seo_title}
                                onChange={set("seo_title")}
                                className={inputClass}
                            />
                        </Field>
                        <Field label="SEO description" full>
                            <textarea
                                value={form.seo_description}
                                onChange={set("seo_description")}
                                className={textareaClass}
                            />
                        </Field>
                        <Field full>
                            <TagListInput
                                label="SEO tags"
                                values={form.seo_tags}
                                onChange={setList("seo_tags")}
                                placeholder="Trekking in Karnataka"
                            />
                        </Field>
                    </Section>

                    <div className="flex items-center justify-end gap-3 mt-6 mb-16">
                        <button
                            type="button"
                            onClick={() => navigate("/admin/home")}
                            className="px-5 py-2.5 text-sm font-medium text-[#1B222C] hover:text-[#9C4A3C] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-[#1B222C] hover:bg-[#A9782F] disabled:bg-[#1B222C]/40 text-[#F5F2E9] text-sm font-medium px-6 py-2.5 rounded-sm transition-colors disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {submitting && (
                                <span className="h-3.5 w-3.5 rounded-full border-2 border-[#F5F2E9]/40 border-t-[#F5F2E9] animate-spin" />
                            )}
                            {submitting ? (isEditing ? "Saving changes" : "Publishing") : (isEditing ? "Save changes" : "Create event")}
                        </button>
                    </div>
                </form>
                )}
            </main>
        </div>
    );
}