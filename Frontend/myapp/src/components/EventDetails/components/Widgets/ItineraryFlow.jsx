import React from "react";

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
        .split(/[;\n]+/)
        .map((item) => item.trim())
        .filter(Boolean)
        .map((title, index) => ({ day: index + 1, title, description: "", activities: [] }));
}

function normalizeActivities(day) {
    if (Array.isArray(day.activities) && day.activities.length) {
        return day.activities
            .map((item) => typeof item === "string"
                ? { time: "", activity: item }
                : { time: item.time || "", activity: item.activity || item.description || "" })
            .filter((item) => item.time || item.activity);
    }

    // Keep existing saved itineraries readable while older content is migrated.
    return (day.description || "")
        .split(/\n+/)
        .map((line) => line.replace(/^\\s*[•*-]\\s*/, "").trim())
        .filter(Boolean)
        .map((line) => {
            const match = line.match(/^(\\d{1,2}(?::\\d{2})?\\s*(?:AM|PM)?):?\\s*(.+)$/i);
            return match
                ? { time: match[1].trim(), activity: match[2].trim() }
                : { time: "", activity: line };
        });
}

const Itinerary = ({ itinerary, gallery_image_urls }) => {
    const days = normalizeItinerary(itinerary);
    const galleryImages = (gallery_image_urls || []).slice(0, 4);

    if (days.length === 0 && galleryImages.length === 0) return null;

    return (
        <section className="bg-neutral-950 py-12 sm:py-16 lg:py-20">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mb-8 text-center sm:mb-12">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300/80">Your adventure, planned</span>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">Trip itinerary</h2>
                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-neutral-400 sm:text-base">
                        A clear day-by-day guide to the highlights, timings and experiences ahead.
                    </p>
                </header>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12">
                    {days.length > 0 && (
                        <div className="space-y-4">
                            {days.map((day, index) => {
                                const activities = normalizeActivities(day);
                                const title = day.title?.trim() || `Day ${index + 1}`;
                                return (
                                    <article key={`${day.day || index + 1}-${index}`} className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-neutral-900 to-neutral-900/70 shadow-[0_12px_35px_rgba(0,0,0,0.18)]">
                                        <header className="flex items-center gap-4 border-b border-white/[0.08] px-4 py-4 sm:px-6 sm:py-5">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-300/30 bg-amber-300/10 text-sm font-bold text-amber-200 sm:h-12 sm:w-12">
                                                {String(day.day || index + 1).padStart(2, "0")}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Day {index + 1}</p>
                                                <h3 className="mt-0.5 break-words text-base font-semibold leading-snug text-white sm:text-lg">{title}</h3>
                                            </div>
                                            {activities.length > 0 && <span className="hidden rounded-full bg-white/[0.06] px-3 py-1 text-xs text-neutral-400 sm:inline-flex">{activities.length} {activities.length === 1 ? "activity" : "activities"}</span>}
                                        </header>

                                        <div className="px-4 py-4 sm:px-6 sm:py-5">
                                            {activities.length > 0 && (
                                                <ol className="space-y-0">
                                                    {activities.map((activity, activityIndex) => (
                                                        <li key={activityIndex} className="relative grid grid-cols-[minmax(78px,0.28fr)_minmax(0,1fr)] gap-3 pb-5 last:pb-0 sm:grid-cols-[minmax(92px,0.3fr)_minmax(0,1fr)] sm:gap-4">
                                                            {activityIndex < activities.length - 1 && <span aria-hidden="true" className="absolute left-[calc(min(28%,92px)-1px)] top-5 bottom-0 w-px bg-white/10 sm:left-[calc(min(30%,92px)+0px)]" />}
                                                            <div className="pt-0.5">
                                                                {activity.time ? (
                                                                    <span className="inline-flex rounded-md border border-amber-300/15 bg-amber-300/[0.07] px-2 py-1 text-[11px] font-semibold leading-4 text-amber-100 sm:text-xs">{activity.time}</span>
                                                                ) : <span className="text-xs text-neutral-600">Anytime</span>}
                                                            </div>
                                                            <div className="relative min-w-0 pl-4 before:absolute before:left-0 before:top-1.5 before:h-2 before:w-2 before:rounded-full before:bg-amber-300/80">
                                                                <p className="break-words text-sm leading-6 text-neutral-200 sm:text-[15px]">{activity.activity || "Activity details to be announced"}</p>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ol>
                                            )}

                                            {day.description && (
                                                <div className={activities.length ? "mt-5 rounded-xl border border-white/[0.07] bg-black/20 p-3.5 sm:p-4" : ""}>
                                                    <p className="whitespace-pre-line break-words text-sm leading-6 text-neutral-400">{day.description}</p>
                                                </div>
                                            )}
                                            {Array.isArray(day.meals) && day.meals.length > 0 && (
                                                <p className="mt-4 border-t border-white/[0.08] pt-3 text-xs leading-5 text-neutral-400"><span className="font-semibold text-neutral-300">Meals:</span> {day.meals.join(", ")}</p>
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}

                    {galleryImages.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:sticky lg:top-24">
                            {galleryImages.map((url, index) => (
                                <div key={url || index} className="group relative aspect-[4/4.5] overflow-hidden rounded-2xl bg-neutral-900">
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
};

export default Itinerary;
