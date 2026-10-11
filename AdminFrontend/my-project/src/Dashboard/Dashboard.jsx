import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../api";
import Navbar from "../components/Navbar/NavBar";

const EASE = [0.16, 1, 0.3, 1];

function getAuthHeaders() {
    const token = localStorage.getItem("admin_token");
    return token ? { token } : {};
}

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

function Section({ title, description, children, className = "" }) {
    return (
        <div className={`bg-white rounded-sm border border-[#1B222C]/8 p-6 md:p-7 mb-5 ${className}`}>
            <div className="mb-5">
                <h3 className="text-lg font-serif text-[#1B222C]">{title}</h3>
                {description && (
                    <p className="text-sm text-[#6E6A5E] mt-0.5">{description}</p>
                )}
            </div>
            {children}
        </div>
    );
}

/* ---------- Icons (same stroke style as Navbar / other pages) ---------- */

function IconCalendar() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
    );
}
function IconCheck() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M20 6 9 17l-5-5" />
        </svg>
    );
}
function IconDraft() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
    );
}
function IconArchive() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <rect x="3" y="4" width="18" height="4" rx="1" />
            <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8M10 12h4" />
        </svg>
    );
}
function IconClock() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" />
        </svg>
    );
}
function IconTrend() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="m3 17 6-6 4 4 8-8M15 7h6v6" />
        </svg>
    );
}
function IconUsers() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}
function IconShieldCheck() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5Z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
/* ---------- Small building blocks ---------- */

function StatCard({ icon, label, value, tint, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE, delay }}
            className="bg-white rounded-sm border border-[#1B222C]/8 p-5 flex items-center gap-4"
        >
            <div className={`h-11 w-11 rounded-sm flex items-center justify-center shrink-0 ${tint}`}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-2xl font-serif text-[#1B222C] leading-none">{value}</p>
                <p className="text-xs text-[#6E6A5E] uppercase tracking-wide mt-1.5 truncate">
                    {label}
                </p>
            </div>
        </motion.div>
    );
}

function BarRow({ label, value, max, barClass, delay = 0 }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-[#1B222C]">{label}</span>
                <span className="text-sm font-medium text-[#1B222C]">{value}</span>
            </div>
            <div className="h-2 rounded-full bg-[#1B222C]/[0.06] overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: EASE, delay }}
                    className={`h-full rounded-full ${barClass}`}
                />
            </div>
        </div>
    );
}

function StatePill({ label, value, styleClass, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE, delay }}
            className="flex items-center justify-between px-4 py-3.5 rounded-sm border border-[#1B222C]/8 bg-white"
        >
            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${styleClass}`}>
                {label}
            </span>
            <span className="text-lg font-serif text-[#1B222C]">{value}</span>
        </motion.div>
    );
}

/* ---------- Page ---------- */

export default function DashboardPage() {
    const [meta, setMeta] = useState(null);
    const [userMeta, setUserMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            setError("");
            try {
                const [eventsRes, usersRes] = await Promise.all([
                    API.get("/metadata/events", { headers: getAuthHeaders() }),
                    API.get("/metadata/users", { headers: getAuthHeaders() }),
                ]);
                if (!cancelled) {
                    setMeta(eventsRes.data);
                    setUserMeta(usersRes.data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                        "Couldn't load dashboard metrics. Try refreshing the page."
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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F2E9]">
                <Navbar />
                <main className="max-w-7xl mx-auto px-6 py-10">
                    <div className="h-8 w-48 bg-[#1B222C]/5 rounded-sm animate-pulse mb-8" />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-20 bg-[#1B222C]/5 rounded-sm animate-pulse" />
                        ))}
                    </div>
                    <div className="h-56 bg-[#1B222C]/5 rounded-sm animate-pulse mb-5" />
                    <div className="h-56 bg-[#1B222C]/5 rounded-sm animate-pulse" />
                </main>
            </div>
        );
    }

    if (error || !meta) {
        return (
            <div className="min-h-screen bg-[#F5F2E9]">
                <Navbar />
                <main className="max-w-7xl mx-auto px-6 py-10">
                    <div className="pl-4 py-3 border-l-2 border-[#9C4A3C] bg-[#9C4A3C]/[0.06]">
                        <p className="text-sm text-[#9C4A3C]">{error || "No data available."}</p>
                    </div>
                </main>
            </div>
        );
    }

    const typeStats = [
        { key: "trek_events", label: "Trek" },
        { key: "trip_events", label: "Trip" },
        { key: "adventure_events", label: "Adventure" },
        { key: "peak_events", label: "Peak" },
        { key: "special_events", label: "Special Event" },
    ].map((t) => ({ ...t, value: meta[t.key] ?? 0 }));
    const maxTypeValue = Math.max(1, ...typeStats.map((t) => t.value));

    const labelEntries = Object.entries(meta.labels || {}).sort((a, b) => b[1] - a[1]);
    const maxLabelValue = Math.max(1, ...labelEntries.map(([, v]) => v));

    const TYPE_BAR_COLORS = [
        "bg-[#A9782F]",
        "bg-[#4B5842]",
        "bg-[#1B222C]",
        "bg-[#9C4A3C]",
        "bg-[#C9A55C]",
    ];

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
                        <h1 className="text-3xl font-serif text-[#1B222C]">Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#6E6A5E]">
                        <IconClock />
                        Last updated {fmtDate(meta.last_updated)}
                    </div>
                </div>

                {/* Top stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                    <StatCard
                        icon={<IconCalendar />}
                        label="Total events"
                        value={meta.total_events}
                        tint="bg-[#1B222C]/[0.06] text-[#1B222C]"
                        delay={0}
                    />
                    <StatCard
                        icon={<IconCheck />}
                        label="Published"
                        value={meta.published_events}
                        tint="bg-[#4B5842]/10 text-[#4B5842]"
                        delay={0.04}
                    />
                    <StatCard
                        icon={<IconDraft />}
                        label="Draft"
                        value={meta.draft_events}
                        tint="bg-[#A9782F]/10 text-[#A9782F]"
                        delay={0.08}
                    />
                    <StatCard
                        icon={<IconArchive />}
                        label="Archived"
                        value={meta.archived_events}
                        tint="bg-[#6E6A5E]/10 text-[#6E6A5E]"
                        delay={0.12}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Left column */}
                    <div className="lg:col-span-2">
                        {/* Event states */}
                        <Section title="Event states" description="Where events currently stand.">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <StatePill
                                    label="Upcoming"
                                    value={meta.upcoming_events}
                                    styleClass="bg-[#1B222C]/[0.06] text-[#1B222C]/70 border border-[#1B222C]/15"
                                    delay={0}
                                />
                                <StatePill
                                    label="In Progress"
                                    value={meta.in_progress_events}
                                    styleClass="bg-[#A9782F]/10 text-[#A9782F] border border-[#A9782F]/30"
                                    delay={0.04}
                                />
                                <StatePill
                                    label="Completed"
                                    value={meta.completed_events}
                                    styleClass="bg-[#6E6A5E]/10 text-[#6E6A5E] border border-[#6E6A5E]/20"
                                    delay={0.08}
                                />
                                <StatePill
                                    label="Sold Out"
                                    value={meta.sold_out_events}
                                    styleClass="bg-[#9C4A3C]/[0.08] text-[#9C4A3C] border border-[#9C4A3C]/20"
                                    delay={0.12}
                                />
                            </div>
                        </Section>

                        {/* Event types */}
                        <Section title="Events by type" description="Breakdown across event categories.">
                            <div className="space-y-4">
                                {typeStats.map((t, i) => (
                                    <BarRow
                                        key={t.key}
                                        label={t.label}
                                        value={t.value}
                                        max={maxTypeValue}
                                        barClass={TYPE_BAR_COLORS[i % TYPE_BAR_COLORS.length]}
                                        delay={i * 0.05}
                                    />
                                ))}
                            </div>
                        </Section>

                        {/* Labels */}
                        <Section
                            title="Labels"
                            description="Display labels currently assigned across events."
                        >
                            {labelEntries.length === 0 ? (
                                <p className="text-sm text-[#6E6A5E]/60">No labels assigned yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {labelEntries.map(([label, value], i) => (
                                        <BarRow
                                            key={label}
                                            label={label}
                                            value={value}
                                            max={maxLabelValue}
                                            barClass="bg-[#A9782F]"
                                            delay={i * 0.04}
                                        />
                                    ))}
                                </div>
                            )}
                        </Section>
                        {userMeta && (
                            <Section title="Users" description="Account activity and verification status.">
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <StatCard
                                        icon={<IconUsers />}
                                        label="Total users"
                                        value={userMeta.total_users}
                                        tint="bg-[#1B222C]/[0.06] text-[#1B222C]"
                                        delay={0}
                                    />
                                    <StatCard
                                        icon={<IconShieldCheck />}
                                        label="Verified"
                                        value={userMeta.verified_users}
                                        tint="bg-[#4B5842]/10 text-[#4B5842]"
                                        delay={0.04}
                                    />
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <StatePill
                                        label="Active"
                                        value={userMeta.active_users}
                                        styleClass="bg-[#4B5842]/10 text-[#4B5842] border border-[#4B5842]/25"
                                        delay={0}
                                    />
                                    <StatePill
                                        label="Inactive"
                                        value={userMeta.inactive_users}
                                        styleClass="bg-[#6E6A5E]/10 text-[#6E6A5E] border border-[#6E6A5E]/20"
                                        delay={0.04}
                                    />
                                    <StatePill
                                        label="With email"
                                        value={userMeta.users_with_email}
                                        styleClass="bg-[#A9782F]/10 text-[#A9782F] border border-[#A9782F]/30"
                                        delay={0.08}
                                    />
                                    <StatePill
                                        label="Without email"
                                        value={userMeta.users_without_email}
                                        styleClass="bg-[#9C4A3C]/[0.08] text-[#9C4A3C] border border-[#9C4A3C]/20"
                                        delay={0.12}
                                    />
                                </div>
                            </Section>
                        )}
                    </div>

                    {/* Right column */}
                    <div>
                        <Section
                            title="Recent activity"
                            description="New events and users added to Basecamp."
                        >
                            <p className="text-xs font-medium tracking-wide text-[#6E6A5E] uppercase mb-2">
                                Events
                            </p>
                            <div className="space-y-3 mb-5">
                                <div className="flex items-center justify-between px-4 py-3.5 rounded-sm border border-[#1B222C]/8">
                                    <span className="text-sm text-[#1B222C]/80 flex items-center gap-2">
                                        <IconTrend /> Today
                                    </span>
                                    <span className="text-lg font-serif text-[#1B222C]">
                                        {meta.created_today}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3.5 rounded-sm border border-[#1B222C]/8">
                                    <span className="text-sm text-[#1B222C]/80 flex items-center gap-2">
                                        <IconTrend /> This week
                                    </span>
                                    <span className="text-lg font-serif text-[#1B222C]">
                                        {meta.created_this_week}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3.5 rounded-sm border border-[#1B222C]/8">
                                    <span className="text-sm text-[#1B222C]/80 flex items-center gap-2">
                                        <IconTrend /> This month
                                    </span>
                                    <span className="text-lg font-serif text-[#1B222C]">
                                        {meta.created_this_month}
                                    </span>
                                </div>
                            </div>

                            {userMeta && (
                                <>
                                    <p className="text-xs font-medium tracking-wide text-[#6E6A5E] uppercase mb-2">
                                        Users
                                    </p>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between px-4 py-3.5 rounded-sm border border-[#1B222C]/8">
                                            <span className="text-sm text-[#1B222C]/80 flex items-center gap-2">
                                                <IconUsers /> Today
                                            </span>
                                            <span className="text-lg font-serif text-[#1B222C]">
                                                {userMeta.new_users_today}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-3.5 rounded-sm border border-[#1B222C]/8">
                                            <span className="text-sm text-[#1B222C]/80 flex items-center gap-2">
                                                <IconUsers /> This week
                                            </span>
                                            <span className="text-lg font-serif text-[#1B222C]">
                                                {userMeta.new_users_this_week}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-3.5 rounded-sm border border-[#1B222C]/8">
                                            <span className="text-sm text-[#1B222C]/80 flex items-center gap-2">
                                                <IconUsers /> This month
                                            </span>
                                            <span className="text-lg font-serif text-[#1B222C]">
                                                {userMeta.new_users_this_month}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </Section>

                        <Section title="Quick summary">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-[#6E6A5E]">Publish rate</span>
                                    <span className="text-[#1B222C] font-medium">
                                        {meta.total_events > 0
                                            ? Math.round((meta.published_events / meta.total_events) * 100)
                                            : 0}
                                        %
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#6E6A5E]">Distinct labels</span>
                                    <span className="text-[#1B222C] font-medium">
                                        {labelEntries.length}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#6E6A5E]">Event types in use</span>
                                    <span className="text-[#1B222C] font-medium">
                                        {typeStats.filter((t) => t.value > 0).length}
                                    </span>
                                </div>
                            </div>
                        </Section>
                    </div>
                </div>

                <div className="mb-16" />
            </main>
        </div>
    );
}