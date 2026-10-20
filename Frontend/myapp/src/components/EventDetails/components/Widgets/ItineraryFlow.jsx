import React, { useEffect, useState } from "react";

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
    const galleryImages = [...new Set(
        (Array.isArray(gallery_image_urls) ? gallery_image_urls : [])
            .filter((url) => typeof url === "string" && url.trim())
            .map((url) => url.trim())
    )];
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        if (!galleryOpen && !selectedImage) return undefined;
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                if (selectedImage) setSelectedImage(null);
                else setGalleryOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [galleryOpen, selectedImage]);
    const hasItineraryAndGallery = days.length > 0 && galleryImages.length > 0;

    if (days.length === 0 && galleryImages.length === 0) return null;

    return (
        <section className="bg-neutral-950 py-12 sm:py-16 lg:py-20">
            <style>{`.itinerary-scrollbar-hidden { scrollbar-width: none; -ms-overflow-style: none; } .itinerary-scrollbar-hidden::-webkit-scrollbar { display: none; }`}</style>
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mb-8 text-center sm:mb-12">
                    <h2 className="text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">Trip Itinerary</h2>
                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-neutral-400 sm:text-base">
                        A day-by-day plan for your adventure
                    </p>
                </header>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12">
                    {days.length > 0 && (
                        <div
                            className={`min-w-0 space-y-4 ${hasItineraryAndGallery ? "lg:h-[42rem] lg:overflow-y-auto lg:overscroll-contain lg:pr-3 itinerary-scrollbar-hidden" : ""}`}
                            aria-label={hasItineraryAndGallery ? "Scrollable trip itinerary" : undefined}
                            tabIndex={hasItineraryAndGallery ? 0 : undefined}
                        >
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
                        <div className={`grid grid-cols-2 gap-3 sm:gap-4 ${hasItineraryAndGallery ? "lg:h-[42rem] lg:grid-rows-2" : ""}`}>
                            {galleryImages.slice(0, 4).map((url, index) => (
                                <button key={url} type="button" onClick={() => setSelectedImage({ url, index })} aria-label={`View photo ${index + 1} of ${galleryImages.length}`} className="group relative aspect-[4/4.5] min-w-0 overflow-hidden rounded-xl bg-neutral-900 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white lg:aspect-auto lg:min-h-0">
                                    <img src={url} alt={`Trip gallery photo ${index + 1}`} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                    {index === 3 && galleryImages.length > 4 && <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/65 text-center text-white"><span className="text-2xl font-semibold">+{galleryImages.length - 4}</span><span className="text-sm font-medium">See all photos</span></span>}
                                </button>
                            ))}
                            {galleryImages.length > 4 && <button type="button" onClick={() => setGalleryOpen(true)} className="col-span-2 inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white hover:bg-white/10">See all {galleryImages.length} photos</button>}
                        </div>
                    )}
                </div>
            </div>
            {galleryOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="event-gallery-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setGalleryOpen(false); }}>
                <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 shadow-2xl">
                    <header className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6"><div><h3 id="event-gallery-title" className="text-lg font-semibold text-white sm:text-xl">Photo gallery</h3><p className="mt-1 text-sm text-neutral-400">{galleryImages.length} photos</p></div><button type="button" onClick={() => setGalleryOpen(false)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/10">Close</button></header>
                    <div className="grid grid-cols-2 gap-3 overflow-y-auto p-4 sm:grid-cols-3 sm:gap-4 sm:p-6 lg:grid-cols-4">{galleryImages.map((url,index)=><button key={url} type="button" onClick={() => setSelectedImage({url,index})} className="group relative aspect-square overflow-hidden rounded-lg bg-neutral-900" aria-label={`Open photo ${index+1}`}><img src={url} alt={`Event gallery photo ${index+1}`} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /></button>)}</div>
                </div>
            </div>}
            {selectedImage && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 p-4" role="dialog" aria-modal="true" aria-label={`Photo ${selectedImage.index+1} of ${galleryImages.length}`} onMouseDown={(event) => {if(event.target===event.currentTarget)setSelectedImage(null);}}>
                <button type="button" onClick={() => setSelectedImage(null)} className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-sm text-white">Close</button>
                <button type="button" onClick={() => {const index=(selectedImage.index-1+galleryImages.length)%galleryImages.length;setSelectedImage({url:galleryImages[index],index});}} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-4 py-3 text-white sm:left-6" aria-label="Previous photo">‹</button>
                <img src={selectedImage.url} alt={`Event gallery photo ${selectedImage.index+1}`} className="max-h-[85vh] max-w-[85vw] object-contain" />
                <button type="button" onClick={() => {const index=(selectedImage.index+1)%galleryImages.length;setSelectedImage({url:galleryImages[index],index});}} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-4 py-3 text-white sm:right-6" aria-label="Next photo">›</button>
                <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white">{selectedImage.index+1} / {galleryImages.length}</span>
            </div>}
        </section>
    );
}

export default Itinerary;
