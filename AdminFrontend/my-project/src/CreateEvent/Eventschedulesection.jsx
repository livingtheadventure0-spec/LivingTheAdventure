import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";
import TagListInput from "./Taglistinput";

const EASE = [0.16, 1, 0.3, 1];

const STATUS_SUGGESTIONS = ["active", "draft", "completed", "cancelled"];
const DISCOUNT_TYPES = ["percentage", "fixed"];
const DISCOUNT_SCOPES = ["per_person", "total_amount"];

const inputClass =
    "w-full bg-white border border-[#1B222C]/12 rounded-sm px-3 py-2.5 text-sm text-[#1B222C] placeholder:text-[#6E6A5E]/50 outline-none focus:border-[#A9782F] transition-colors";
const textareaClass = inputClass + " resize-y min-h-[80px]";
const smallInputClass = inputClass.replace("py-2.5", "py-2");

function getAuthHeaders() {
    const token = localStorage.getItem("admin_token");
    return token ? { token } : {};
}

function emptyAddress() {
    return { street_address: "", area: "", city: "", state: "", pincode: "", google_map_url: "" };
}

function emptyDiscount() {
    return { type: "percentage", label: "", scope: "per_person", value: "", min_group_size: "" };
}

function emptyPickup(order) {
    return {
        pickup_uuid: crypto.randomUUID(),
        order_number: order,
        pickup_point: "",
        city_name: "",
        pickup_datetime: "",
        price_per_person: "",
        address: emptyAddress(),
        discounts: [],
    };
}

const EMPTY_ITINERARY_DAY = (day = 1) => ({ day, title: "", description: "" });

// Schedule-specific itinerary editor. Keep the existing extra_options.itinerary API field
// so older schedules and backend contracts remain compatible.
function parseScheduleItinerary(value) {
    if (Array.isArray(value)) return value.map((item, index) => ({ ...EMPTY_ITINERARY_DAY(index + 1), ...(item || {}), day: index + 1 }));
    if (typeof value !== "string" || !value.trim()) return [EMPTY_ITINERARY_DAY()];
    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.map((item, index) => ({ ...EMPTY_ITINERARY_DAY(index + 1), ...(item || {}), day: index + 1 }));
    } catch {
        // Preserve compatibility with older plain-text itinerary values.
    }
    return value.split(/[;\n]+/).map((line) => line.trim()).filter(Boolean).map((line, index) => ({ ...EMPTY_ITINERARY_DAY(index + 1), title: line }));
}
function emptyScheduleForm() {
    return {
        status: "active",
        basic_details: { start_datetime: "", end_datetime: "", duration_days: "", timezone: "Asia/Kolkata" },
        capacity_pricing: { base_price_per_person: "", max_participants: "", seats_available: "", currency: "INR" },
        extra_options: { inclusions: [], exclusions: [], custom_notes: "", itinerary: "" },
        pickups: [],
    };
}

function fmtDateTime(iso) {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    } catch {
        return iso;
    }
}

function Field({ label, full, children }) {
    return (
        <div className={full ? "md:col-span-2" : ""}>
            {label && (
                <label className="block text-xs font-medium tracking-wide text-[#6E6A5E] uppercase mb-1.5">
                    {label}
                </label>
            )}
            {children}
        </div>
    );
}

function StatusBadge({ status }) {
    const s = (status || "").toLowerCase();
    const style =
        s === "active"
            ? "bg-[#4B5842]/10 text-[#4B5842] border border-[#4B5842]/25"
            : s === "completed"
                ? "bg-[#6E6A5E]/10 text-[#6E6A5E] border border-[#6E6A5E]/20"
                : s === "cancelled"
                    ? "bg-[#9C4A3C]/[0.08] text-[#9C4A3C] border border-[#9C4A3C]/20"
                    : "bg-[#1B222C]/[0.06] text-[#1B222C]/70 border border-[#1B222C]/15";
    return (
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${style}`}>
            {status}
        </span>
    );
}

/* ---------- Pickup + discount editing (used inside the create form) ---------- */

function DiscountRow({ discount, onChange, onRemove }) {
    const set = (key) => (e) => onChange({ ...discount, [key]: e.target.value });
    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end bg-[#1B222C]/[0.02] p-3 rounded-sm">
            <Field label="Type">
                <select value={discount.type} onChange={set("type")} className={smallInputClass}>
                    {DISCOUNT_TYPES.map((t) => (
                        <option key={t} value={t}>
                            {t}
                        </option>
                    ))}
                </select>
            </Field>
            <Field label="Label">
                <input
                    value={discount.label}
                    onChange={set("label")}
                    placeholder="Group Discount"
                    className={smallInputClass}
                />
            </Field>
            <Field label="Scope">
                <select value={discount.scope} onChange={set("scope")} className={smallInputClass}>
                    {DISCOUNT_SCOPES.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
            </Field>
            <Field label="Value">
                <input
                    type="number"
                    value={discount.value}
                    onChange={set("value")}
                    className={smallInputClass}
                />
            </Field>
            <div className="flex items-end gap-2">
                <Field label="Min. group">
                    <input
                        type="number"
                        value={discount.min_group_size}
                        onChange={set("min_group_size")}
                        className={smallInputClass}
                    />
                </Field>
                <button
                    type="button"
                    onClick={onRemove}
                    className="h-9 w-9 shrink-0 flex items-center justify-center text-[#9C4A3C] hover:bg-[#9C4A3C]/10 rounded-sm transition-colors"
                    aria-label="Remove discount"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

function PickupCard({ pickup, index, onChange, onRemove }) {
    const set = (key) => (e) => onChange({ ...pickup, [key]: e.target.value });
    const setAddr = (key) => (e) =>
        onChange({ ...pickup, address: { ...pickup.address, [key]: e.target.value } });

    const setDiscounts = (discounts) => onChange({ ...pickup, discounts });
    const updateDiscount = (i, d) => {
        const next = [...pickup.discounts];
        next[i] = d;
        setDiscounts(next);
    };
    const removeDiscount = (i) => setDiscounts(pickup.discounts.filter((_, idx) => idx !== i));
    const addDiscount = () => setDiscounts([...pickup.discounts, emptyDiscount()]);

    return (
        <div className="border border-[#1B222C]/10 rounded-sm p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-[#1B222C]">Pickup {index + 1}</p>
                <button
                    type="button"
                    onClick={onRemove}
                    className="text-xs text-[#9C4A3C] hover:underline"
                >
                    Remove pickup
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <Field label="Pickup point">
                    <input
                        value={pickup.pickup_point}
                        onChange={set("pickup_point")}
                        placeholder="Dadar Station"
                        className={smallInputClass}
                    />
                </Field>
                <Field label="City">
                    <input
                        value={pickup.city_name}
                        onChange={set("city_name")}
                        placeholder="Mumbai"
                        className={smallInputClass}
                    />
                </Field>
                <Field label="Pickup date & time">
                    <input
                        type="datetime-local"
                        value={pickup.pickup_datetime}
                        onChange={set("pickup_datetime")}
                        className={smallInputClass}
                    />
                </Field>
                <Field label="Price per person">
                    <input
                        type="number"
                        value={pickup.price_per_person}
                        onChange={set("price_per_person")}
                        className={smallInputClass}
                    />
                </Field>
            </div>

            <p className="text-xs font-medium tracking-wide text-[#6E6A5E] uppercase mb-2">Address</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input
                    value={pickup.address.street_address}
                    onChange={setAddr("street_address")}
                    placeholder="Street address"
                    className={`md:col-span-3 ${smallInputClass}`}
                />
                <input value={pickup.address.area} onChange={setAddr("area")} placeholder="Area" className={smallInputClass} />
                <input value={pickup.address.city} onChange={setAddr("city")} placeholder="City" className={smallInputClass} />
                <input value={pickup.address.state} onChange={setAddr("state")} placeholder="State" className={smallInputClass} />
                <input
                    value={pickup.address.pincode}
                    onChange={setAddr("pincode")}
                    placeholder="Pincode"
                    className={smallInputClass}
                />
                <input
                    value={pickup.address.google_map_url}
                    onChange={setAddr("google_map_url")}
                    placeholder="Google Maps URL"
                    className={`md:col-span-2 ${smallInputClass}`}
                />
            </div>

            <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium tracking-wide text-[#6E6A5E] uppercase">Discounts</p>
                <button
                    type="button"
                    onClick={addDiscount}
                    className="text-xs font-medium text-[#A9782F] hover:underline"
                >
                    + Add discount
                </button>
            </div>
            {pickup.discounts.map((d, i) => (
                <div key={i} className="mb-2">
                    <DiscountRow
                        discount={d}
                        onChange={(next) => updateDiscount(i, next)}
                        onRemove={() => removeDiscount(i)}
                    />
                </div>
            ))}
        </div>
    );
}

/* ---------- Create-schedule form ---------- */

function toDateTimeInput(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 16);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
}

function formFromSchedule(schedule) {
    const data = schedule?.schedule_data || {};
    const basic = data.basic_details || {};
    const capacity = data.capacity_pricing || {};
    const extra = data.extra_options || {};
    return {
        status: schedule?.status || "active",
        basic_details: { ...emptyScheduleForm().basic_details, ...basic, start_datetime: toDateTimeInput(basic.start_datetime), end_datetime: toDateTimeInput(basic.end_datetime), duration_days: basic.duration_days ?? "" },
        capacity_pricing: { ...emptyScheduleForm().capacity_pricing, ...capacity, base_price_per_person: capacity.base_price_per_person ?? "", max_participants: capacity.max_participants ?? "", seats_available: capacity.seats_available ?? "" },
        extra_options: { ...emptyScheduleForm().extra_options, ...extra, inclusions: Array.isArray(extra.inclusions) ? extra.inclusions : [], exclusions: Array.isArray(extra.exclusions) ? extra.exclusions : [], itinerary: extra.itinerary || "" },
        pickups: Array.isArray(data.pickups) ? data.pickups.map((pickup, index) => ({
            ...emptyPickup(index + 1), ...pickup, pickup_datetime: toDateTimeInput(pickup.pickup_datetime), price_per_person: pickup.price_per_person ?? "",
            address: { ...emptyAddress(), ...(pickup.address || {}) },
            discounts: Array.isArray(pickup.discounts) ? pickup.discounts.map(discount => ({ ...emptyDiscount(), ...discount, value: discount.value ?? "", min_group_size: discount.min_group_size ?? "" })) : [],
        })) : [],
    };
}

function ScheduleForm({ onCancel, onSaved, eventId, schedule = null }) {
    const [form, setForm] = useState(() => formFromSchedule(schedule));
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const setBasic = (key) => (e) =>
        setForm((f) => ({ ...f, basic_details: { ...f.basic_details, [key]: e.target.value } }));
    const setCapacity = (key) => (e) =>
        setForm((f) => ({ ...f, capacity_pricing: { ...f.capacity_pricing, [key]: e.target.value } }));
    const setExtra = (key) => (e) =>
        setForm((f) => ({ ...f, extra_options: { ...f.extra_options, [key]: e.target.value } }));
    const setExtraList = (key) => (values) =>
        setForm((f) => ({ ...f, extra_options: { ...f.extra_options, [key]: values } }));

    const addPickup = () =>
        setForm((f) => ({ ...f, pickups: [...f.pickups, emptyPickup(f.pickups.length + 1)] }));
    const updatePickup = (i, next) =>
        setForm((f) => {
            const pickups = [...f.pickups];
            pickups[i] = next;
            return { ...f, pickups };
        });
    const removePickup = (i) =>
        setForm((f) => ({ ...f, pickups: f.pickups.filter((_, idx) => idx !== i) }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        const startTime = new Date(form.basic_details.start_datetime).getTime();
        const endTime = new Date(form.basic_details.end_datetime).getTime();
        if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime < startTime) {
            setError("Please enter a valid start and end date/time. The end must be on or after the start.");
            setSubmitting(false);
            return;
        }

        const payload = {
            event_id: eventId,
            ...(schedule?.schedule_id ? { schedule_id: schedule.schedule_id } : {}),
            status: form.status,
            schedule_data: {
                basic_details: {
                    ...form.basic_details,
                    duration_days: Number(form.basic_details.duration_days) || 0,
                },
                capacity_pricing: {
                    currency: form.capacity_pricing.currency,
                    seats_available: Number(form.capacity_pricing.seats_available) || 0,
                    max_participants: Number(form.capacity_pricing.max_participants) || 0,
                    base_price_per_person: Number(form.capacity_pricing.base_price_per_person) || 0,
                },
                // Store only completed itinerary days; an empty departure itinerary stays empty
                // so legacy events can continue using their general itinerary as a fallback.
                extra_options: {
                    ...form.extra_options,
                    itinerary: (() => {
                        const days = parseScheduleItinerary(form.extra_options.itinerary)
                            .filter((day) => (day.title || "").trim() || (day.description || "").trim())
                            .map((day, index) => ({ day: index + 1, title: (day.title || "").trim(), description: (day.description || "").trim() }));
                        return days.length ? JSON.stringify(days) : "";
                    })(),
                },
                pickups: form.pickups.map((p, i) => ({
                    ...p,
                    order_number: i + 1,
                    price_per_person: Number(p.price_per_person) || 0,
                    discounts: p.discounts.map((d) => ({
                        ...d,
                        value: Number(d.value) || 0,
                        min_group_size: Number(d.min_group_size) || 0,
                    })),
                })),
            },
        };

        try {
            const res = schedule?.id
                ? await API.put(`/event-schedules/${schedule.id}`, payload, { headers: getAuthHeaders() })
                : await API.post("/event-schedules/", { ...payload, schedule_id: crypto.randomUUID() }, { headers: getAuthHeaders() });
            onSaved(res.data);
        } catch (err) {
            setError(
                err.readableMessage ||
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Couldn't save the schedule. Check the fields and try again."
            );
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="border-t border-[#1B222C]/8 pt-6 mt-2">
            {error && (
                <div className="mb-5 pl-4 py-3 border-l-2 border-[#9C4A3C] bg-[#9C4A3C]/[0.06]">
                    <p className="text-sm text-[#9C4A3C]">
                        {typeof error === "string" ? error : JSON.stringify(error)}
                    </p>
                </div>
            )}

            <p className="text-xs font-medium tracking-wide text-[#6E6A5E] uppercase mb-3">
                Basic details
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Field label="Start date & time">
                    <input
                        type="datetime-local"
                        value={form.basic_details.start_datetime}
                        onChange={setBasic("start_datetime")}
                        className={inputClass}
                    />
                </Field>
                <Field label="End date & time">
                    <input
                        type="datetime-local"
                        value={form.basic_details.end_datetime}
                        onChange={setBasic("end_datetime")}
                        className={inputClass}
                    />
                </Field>
                <Field label="Duration (days)">
                    <input
                        type="number"
                        min="0"
                        value={form.basic_details.duration_days}
                        onChange={setBasic("duration_days")}
                        className={inputClass}
                    />
                </Field>
                <Field label="Timezone">
                    <input
                        value={form.basic_details.timezone}
                        onChange={setBasic("timezone")}
                        className={inputClass}
                    />
                </Field>
                <Field label="Status">
                    <input
                        list="schedule-status-options"
                        value={form.status}
                        onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                        className={inputClass}
                    />
                    <datalist id="schedule-status-options">
                        {STATUS_SUGGESTIONS.map((s) => (
                            <option key={s} value={s} />
                        ))}
                    </datalist>
                </Field>
            </div>

            <p className="text-xs font-medium tracking-wide text-[#6E6A5E] uppercase mb-3">
                Capacity & pricing
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Field label="Currency">
                    <input
                        value={form.capacity_pricing.currency}
                        onChange={setCapacity("currency")}
                        className={inputClass}
                    />
                </Field>
                <Field label="Base price / person">
                    <input
                        type="number"
                        value={form.capacity_pricing.base_price_per_person}
                        onChange={setCapacity("base_price_per_person")}
                        className={inputClass}
                    />
                </Field>
                <Field label="Max participants">
                    <input
                        type="number"
                        value={form.capacity_pricing.max_participants}
                        onChange={setCapacity("max_participants")}
                        className={inputClass}
                    />
                </Field>
                <Field label="Seats available">
                    <input
                        type="number"
                        value={form.capacity_pricing.seats_available}
                        onChange={setCapacity("seats_available")}
                        className={inputClass}
                    />
                </Field>
            </div>

            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium tracking-wide text-[#6E6A5E] uppercase">Pickups</p>
                <button
                    type="button"
                    onClick={addPickup}
                    className="text-xs font-medium text-[#A9782F] hover:underline"
                >
                    + Add pickup
                </button>
            </div>
            {form.pickups.length === 0 && (
                <p className="text-sm text-[#6E6A5E]/70 mb-6">No pickups added yet.</p>
            )}
            {form.pickups.map((p, i) => (
                <PickupCard
                    key={p.pickup_uuid}
                    pickup={p}
                    index={i}
                    onChange={(next) => updatePickup(i, next)}
                    onRemove={() => removePickup(i)}
                />
            ))}

            <p className="text-xs font-medium tracking-wide text-[#6E6A5E] uppercase mb-3 mt-6">
                Extra options
            </p>
            <div className="grid grid-cols-1 gap-4 mb-6">
                <TagListInput
                    label="Inclusions"
                    values={form.extra_options.inclusions}
                    onChange={setExtraList("inclusions")}
                    placeholder="Accommodation"
                />
                <TagListInput
                    label="Exclusions"
                    values={form.extra_options.exclusions}
                    onChange={setExtraList("exclusions")}
                    placeholder="Personal Expenses"
                />
                <Field label="Tour itinerary for this departure" full>
                    <div className="rounded-md border border-[#1B222C]/10 bg-[#F9F7F1] p-4 md:p-5">
                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-sm font-medium text-[#1B222C]">Plan this specific departure</p>
                                <p className="mt-1 text-xs leading-5 text-[#6E6A5E]">Each departure can have its own day-by-day plan. If left empty, the event’s general itinerary remains the fallback for older events.</p>
                            </div>
                            <button type="button" onClick={() => { const days = parseScheduleItinerary(form.extra_options.itinerary); setExtra("itinerary")({ target: { value: JSON.stringify([...days, EMPTY_ITINERARY_DAY(days.length + 1)]) } }); }} className="shrink-0 rounded-sm border border-[#A9782F]/40 px-3 py-2 text-xs font-medium text-[#8A641F] hover:bg-[#A9782F]/[0.08]">+ Add itinerary day</button>
                        </div>
                        <div className="space-y-3">
                            {parseScheduleItinerary(form.extra_options.itinerary).map((day, index, days) => (
                                <div key={index} className="rounded-md border border-[#1B222C]/10 bg-white p-3 md:p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8A641F]">Day {index + 1}</span>
                                        <button type="button" disabled={days.length === 1} onClick={() => { const next = days.filter((_, dayIndex) => dayIndex !== index).map((item, dayIndex) => ({ ...item, day: dayIndex + 1 })); setExtra("itinerary")({ target: { value: JSON.stringify(next) } }); }} className="text-xs font-medium text-[#9C4A3C] disabled:cursor-not-allowed disabled:opacity-40">Remove day</button>
                                    </div>
                                    <div className="space-y-3">
                                        <input value={day.title || ""} onChange={(event) => { const next = days.map((item, dayIndex) => dayIndex === index ? { ...item, title: event.target.value } : item); setExtra("itinerary")({ target: { value: JSON.stringify(next) } }); }} placeholder="Day title (e.g. Trek begins)" className={inputClass} />
                                        <textarea value={day.description || ""} onChange={(event) => { const next = days.map((item, dayIndex) => dayIndex === index ? { ...item, description: event.target.value } : item); setExtra("itinerary")({ target: { value: JSON.stringify(next) } }); }} placeholder="Describe timings, activities, meals and travel details for this day..." className={textareaClass} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Field>
                <Field label="Custom notes">
                    <textarea
                        value={form.extra_options.custom_notes}
                        onChange={setExtra("custom_notes")}
                        placeholder="Carry warm clothes, water bottles, and ID proof"
                        className={textareaClass}
                    />
                </Field>
            </div>

            <div className="flex items-center justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
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
                    {submitting ? "Saving" : schedule ? "Save changes" : "Save schedule"}
                </button>
            </div>
        </form>
    );
}

/* ---------- Read-only schedule summary card ---------- */

function ScheduleCard({ schedule, onEdit, onDelete }) {
    const [expanded, setExpanded] = useState(false);
    const d = schedule.schedule_data || {};
    const basic = d.basic_details || {};
    const capacity = d.capacity_pricing || {};
    const extra = d.extra_options || {};
    const pickups = d.pickups || [];

    return (
        <div className="border border-[#1B222C]/10 rounded-sm mb-4 overflow-hidden">
            <div className="flex flex-wrap items-center justify-end gap-2 border-b border-[#1B222C]/8 px-4 py-2">
                <button type="button" onClick={onEdit} className="text-xs font-medium text-[#1B222C] hover:text-[#A9782F]">Edit schedule</button>
                <button type="button" onClick={onDelete} className="text-xs font-medium text-[#9C4A3C] hover:underline">Delete schedule</button>
            </div>
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex flex-wrap items-center justify-between gap-3 p-4 text-left hover:bg-[#1B222C]/[0.02] transition-colors"
            >
                <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={schedule.status} />
                    <span className="text-sm text-[#1B222C]">
                        {fmtDateTime(basic.start_datetime)} → {fmtDateTime(basic.end_datetime)}
                    </span>
                    <span className="text-xs text-[#6E6A5E]">
                        {basic.duration_days ? `${basic.duration_days} days` : null}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-[#1B222C]">
                        {capacity.currency} {capacity.base_price_per_person}
                        <span className="text-[#6E6A5E] font-normal"> / person</span>
                    </span>
                    <span className="text-xs text-[#6E6A5E]">
                        {capacity.seats_available}/{capacity.max_participants} seats
                    </span>
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`text-[#6E6A5E] transition-transform ${expanded ? "rotate-180" : ""}`}
                    >
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </div>
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="overflow-hidden border-t border-[#1B222C]/8"
                    >
                        <div className="p-4 space-y-5">
                            {pickups.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium tracking-wide text-[#6E6A5E] uppercase mb-2">
                                        Pickups
                                    </p>
                                    <div className="space-y-3">
                                        {pickups.map((p, i) => (
                                            <div key={p.pickup_uuid || i} className="bg-[#1B222C]/[0.02] rounded-sm p-3">
                                                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                                    <p className="text-sm font-medium text-[#1B222C]">
                                                        {p.pickup_point} · {p.city_name}
                                                    </p>
                                                    <p className="text-sm text-[#1B222C]">
                                                        {capacity.currency} {p.price_per_person}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-[#6E6A5E]">
                                                    {fmtDateTime(p.pickup_datetime)}
                                                </p>
                                                {p.address && (
                                                    <p className="text-xs text-[#6E6A5E] mt-1">
                                                        {[
                                                            p.address.street_address,
                                                            p.address.area,
                                                            p.address.city,
                                                            p.address.state,
                                                            p.address.pincode,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(", ")}
                                                    </p>
                                                )}
                                                {p.discounts?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {p.discounts.map((disc, di) => (
                                                            <span
                                                                key={di}
                                                                className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#A9782F]/10 text-[#A9782F] border border-[#A9782F]/25"
                                                            >
                                                                {disc.label}:{" "}
                                                                {disc.type === "percentage"
                                                                    ? `${disc.value}%`
                                                                    : `${capacity.currency} ${disc.value}`}{" "}
                                                                ({disc.scope}, min {disc.min_group_size})
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(extra.inclusions?.length > 0 || extra.exclusions?.length > 0) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {extra.inclusions?.length > 0 && (
                                        <div>
                                            <p className="text-xs font-medium tracking-wide text-[#6E6A5E] uppercase mb-2">
                                                Inclusions
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {extra.inclusions.map((v, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-block px-2.5 py-1 rounded-full text-xs bg-[#4B5842]/10 text-[#4B5842] border border-[#4B5842]/20"
                                                    >
                                                        {v}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {extra.exclusions?.length > 0 && (
                                        <div>
                                            <p className="text-xs font-medium tracking-wide text-[#6E6A5E] uppercase mb-2">
                                                Exclusions
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {extra.exclusions.map((v, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-block px-2.5 py-1 rounded-full text-xs bg-[#9C4A3C]/[0.08] text-[#9C4A3C] border border-[#9C4A3C]/20"
                                                    >
                                                        {v}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {extra.custom_notes && (
                                <div>
                                    <p className="text-xs font-medium tracking-wide text-[#6E6A5E] uppercase mb-1.5">
                                        Notes
                                    </p>
                                    <p className="text-sm text-[#1B222C]/80 whitespace-pre-wrap">
                                        {extra.custom_notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ---------- Top-level exported section ---------- */

export default function EventScheduleSection({ eventId }) {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);

    const loadSchedules = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await API.get(`/event-schedules/by-event/${eventId}`, {
                headers: getAuthHeaders(),
            });
            setSchedules(Array.isArray(res.data) ? res.data : res.data ? [res.data] : []);
        } catch (err) {
            if (err.response?.status === 404) {
                setSchedules([]);
            } else {
                setError(
                    err.readableMessage ||
                    err.response?.data?.detail ||
                    err.response?.data?.message ||
                    "Could not load the schedule for this event."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (eventId) loadSchedules();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId]);

    return (
        <div className="bg-white rounded-sm border border-[#1B222C]/8 p-6 md:p-7 mb-5">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-lg font-serif text-[#1B222C]">Schedule</h3>
                    <p className="text-sm text-[#6E6A5E] mt-0.5">
                        Departure dates, pickups, capacity, and pricing.
                    </p>
                </div>
                {!showForm && !loading && (
                    <button
                        onClick={() => { setEditingSchedule(null); setShowForm(true); }}
                        className="bg-[#1B222C] hover:bg-[#A9782F] text-[#F5F2E9] text-sm font-medium px-4 py-2 rounded-sm transition-colors"
                    >
                        {schedules.length === 0 ? "+ Add schedule" : "+ Add another schedule"}
                    </button>
                )}
            </div>

            {loading && (
                <div className="space-y-3">
                    <div className="h-16 bg-[#1B222C]/5 rounded-sm animate-pulse" />
                    <div className="h-16 bg-[#1B222C]/5 rounded-sm animate-pulse" />
                </div>
            )}

            {!loading && error && (
                <p className="text-sm text-[#9C4A3C]">{error}</p>
            )}

            {!loading && !error && schedules.length === 0 && !showForm && (
                <p className="text-sm text-[#6E6A5E]">
                    No schedule has been set up for this event yet.
                </p>
            )}

            {!loading &&
                !error &&
                schedules.map((s) => (
                    <ScheduleCard
                        key={s.schedule_id || s.id}
                        schedule={s}
                        onEdit={() => { setEditingSchedule(s); setShowForm(true); }}
                        onDelete={async () => {
                            const startDate = s.schedule_data?.basic_details?.start_datetime;
                            const label = startDate ? fmtDateTime(startDate) : "this schedule";
                            if (!window.confirm("Delete " + label + "? The event itself will remain.")) return;
                            setError("");
                            try {
                                await API.delete("/event-schedules/" + s.id, { headers: getAuthHeaders() });
                                setSchedules(current => current.filter(item => item.id !== s.id));
                                if (editingSchedule?.id === s.id) { setEditingSchedule(null); setShowForm(false); }
                            } catch (err) {
                                setError(err.readableMessage || err.response?.data?.detail || err.response?.data?.message || "Could not delete this schedule.");
                            }
                        }}
                    />
                ))}

            {showForm && (
                <ScheduleForm
                    key={editingSchedule?.id || "new-schedule"}
                    schedule={editingSchedule}
                    eventId={eventId}
                    onCancel={() => { setShowForm(false); setEditingSchedule(null); }}
                    onSaved={() => {
                        setShowForm(false);
                        setEditingSchedule(null);
                        loadSchedules();
                    }}
                />
            )}
        </div>
    );
}