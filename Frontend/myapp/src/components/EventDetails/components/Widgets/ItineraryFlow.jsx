import React from "react";

function formatActivity(activity) {
    if (typeof activity === "string" || typeof activity === "number") return String(activity);
    if (!activity || typeof activity !== "object") return "";
    const time = activity.time || activity.start_time || "";
    const description = activity.activity || activity.description || activity.title || activity.name || "";
    return [time, description].filter(Boolean).join(" — ");
}

function normalizeItinerary(value) {
    if (Array.isArray(value)) return value;
    if (typeof value !== "string" || !value.trim()) return [];

    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
    } catch {
        // Older events store itinerary as plain text.
    }

    return value
        .split(/[;,]\s*|\n+/)
        .map((item) => item.trim())
        .filter(Boolean)
        .map((title, index) => ({ day: index + 1, title, description: "" }));
}

const Itinerary = ({ itinerary, gallery_image_urls }) => {
    const days = normalizeItinerary(itinerary);
    const galleryImages = (gallery_image_urls || []).slice(0, 4);

    if (days.length === 0 && galleryImages.length === 0) return null;

    return (
        <section className="bg-neutral-950 py-12 sm:py-16 lg:py-20">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mb-8 text-center sm:mb-12">
                    <h2 className="text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">Trip Itinerary</h2>
                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-neutral-400 sm:text-base">
                        A day-by-day plan for your adventure
                    </p>
                </header>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12">
                    {days.length > 0 && (
                        <div className="space-y-4">
                            {days.map((day, index) => {
                                const activities = Array.isArray(day.activities) ? day.activities.map(formatActivity).filter(Boolean) : [];
                                const title = day.title || `Day ${index + 1}`;
                                return (
                                    <article key={`${day.day || index + 1}-${index}`} className="flex min-w-0 gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:bg-white/[0.06] sm:gap-5 sm:p-5">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/25 bg-neutral-900 text-sm font-semibold text-white sm:h-12 sm:w-12">
                                            {day.day || index + 1}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="break-words text-base font-semibold leading-snug text-white sm:text-lg">{title}</h3>
                                            {day.description && <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-neutral-300">{day.description}</p>}
                                            {activities.length > 0 && (
                                                <ul className="mt-3 space-y-2">
                                                    {activities.map((activity, activityIndex) => (
                                                        <li key={activityIndex} className="flex gap-2 text-sm leading-5 text-neutral-300">
                                                            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
                                                            <span className="break-words">{activity}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {Array.isArray(day.meals) && day.meals.length > 0 && (
                                                <p className="mt-3 text-xs leading-5 text-neutral-400">Meals: {day.meals.join(", ")}</p>
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}

                    {galleryImages.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            {galleryImages.map((url, index) => (
                                <div key={url || index} className="group relative aspect-[4/4.5] overflow-hidden rounded-xl bg-neutral-900">
                                    <img src={url} alt={`Trip itinerary gallery ${index + 1}`} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default Itinerary;