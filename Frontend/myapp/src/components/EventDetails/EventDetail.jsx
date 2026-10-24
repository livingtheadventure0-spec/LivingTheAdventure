import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Spinner from "../Spinner/Spinner.jsx";

import Hero from "./components/Hero/Hero.jsx";
import StarCard from "./components/Widgets/StarCard.jsx";
import Itinerary from "./components/Widgets/ItineraryFlow.jsx";
import InclusionsExclusions from "./components/Widgets/InclusionsExclusions.jsx";
import { downloadEventPdf } from "../../utils/eventPdf.js";
import Policy from "./components/Widgets/Policy.jsx";

import fetchEventByID from "./components/FetchEventByID.jsx";
import fetchScheduleByID from "./components/FetchScheduleByID.jsx";

import ScheduleHeader from "./components/EventSchedule/ScheduleHeader.jsx";
import BookingSection from "./components/EventSchedule/BookingSection.jsx";

import Highlights from "./components/EventSchedule/Highlighter.jsx";
import InterestButton from "./InterestButton.jsx";
import Footer from "../Footer/Footer.jsx";

import {
    getApiErrorMessage,
    getStatus,
} from "../../api/errors.js";

import { useAuth } from "../../context/AuthContext.jsx";
import { apiUrl } from "../../api/config.js";


function EventDetail() {

    const { id } = useParams();

    const navigate = useNavigate();

    const { user } = useAuth();

    const [shareOpen, setShareOpen] = useState(false);


    // =========================================================
    // EVENT / SCHEDULE STATE
    // =========================================================

    const [event, setEvent] = useState(null);

    const [eventSchedule, setEventSchedule] = useState(null);
    const [eventSchedules, setEventSchedules] = useState([]);

    const [loadingEvent, setLoadingEvent] =
        useState(true);

    const [loadingSchedule, setLoadingSchedule] =
        useState(false);

    const [error, setError] =
        useState(null);


    // =========================================================
    // FETCH EVENT
    // =========================================================

    useEffect(() => {

        let mounted = true;


        const loadEvent = async () => {

            try {

                setLoadingEvent(true);
                setError(null);


                const data =
                    await fetchEventByID(id);


                if (!mounted) return;


                setEvent(data);


            } catch (err) {

                if (!mounted) return;


                const status =
                    getStatus(err);


                if (status === 404) {

                    setError(
                        "Event not found."
                    );

                } else {

                    setError(
                        getApiErrorMessage(
                            err,
                            "Failed to load event."
                        )
                    );
                }


            } finally {

                if (mounted) {

                    setLoadingEvent(false);

                }
            }
        };


        loadEvent();


        return () => {

            mounted = false;

        };

    }, [id]);


    // =========================================================
    // FETCH SCHEDULE
    // =========================================================

    useEffect(() => {

        if (!event?.event_id) {
            return;
        }


        let mounted = true;


        const loadSchedule = async () => {

            try {

                setLoadingSchedule(true);

                setError(null);


                const data =
                    await fetchScheduleByID(
                        event.event_id
                    );


                if (!mounted) return;


                /*
                 * API can return either:
                 *
                 * [
                 *     {...}
                 * ]
                 *
                 * OR:
                 *
                 * {
                 *     ...
                 * }
                 */

                // Keep every valid, active future departure so customers can book different dates.
                // Each EventSchedule keeps its own capacity, pickup times, prices and itinerary.
                const now = Date.now();
                const schedules = (Array.isArray(data) ? data : [data])
                    .filter((item) => {
                        const scheduleData = item?.schedule_data || {};
                        const basic = scheduleData.basic_details || {};
                        const start = new Date(basic.start_datetime).getTime();
                        const end = new Date(basic.end_datetime).getTime();
                        const active = !item?.status || item.status.toLowerCase() === "active";
                        return active && Number.isFinite(start) && Number.isFinite(end) && end >= now;
                    })
                    .sort((a, b) => new Date(a.schedule_data.basic_details.start_datetime) - new Date(b.schedule_data.basic_details.start_datetime));

                setEventSchedules(schedules);
                setEventSchedule((current) =>
                    schedules.find((item) => item.schedule_id === current?.schedule_id) || schedules[0] || null
                );


            } catch (err) {

                if (!mounted) return;


                setError(
                    getApiErrorMessage(
                        err,
                        "Failed to load schedule."
                    )
                );


            } finally {

                if (mounted) {

                    setLoadingSchedule(false);

                }
            }
        };


        loadSchedule();


        return () => {

            mounted = false;

        };

    }, [event?.event_id]);


    // =========================================================
    // EVENT LOADING
    // =========================================================

    if (loadingEvent) {

        return (
            <div className="
                text-white
                text-center
                mt-20
            ">
                <Spinner />
            </div>
        );
    }


    // =========================================================
    // EVENT ERROR
    // =========================================================

    if (error && !event) {

        return (
            <div className="
                text-red-500
                text-center
                mt-20
                px-6
            ">
                {error}
            </div>
        );
    }


    // =========================================================
    // SAFETY CHECK
    // =========================================================

    if (!event) {

        return (
            <div className="
                text-gray-400
                text-center
                mt-20
            ">
                Event not available.
            </div>
        );
    }


    // =========================================================
    // SAFE EVENT DATA
    // =========================================================

    const eventType =
        event.event_type?.toLowerCase();


    // =========================================================
    // SAFE SCHEDULE DATA
    // =========================================================

    const scheduleData =
        eventSchedule?.schedule_data || {};


    const basicDetails =
        scheduleData.basic_details || {};


    const capacityPricing =
        scheduleData.capacity_pricing || {};


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className={event.status?.toLowerCase() === "published" ? "pb-24 sm:pb-20" : ""}>


            {/* ================================================= */}
            {/* HERO */}
            {/* ================================================= */}

            <Hero
                promo_video={
                    event.promo_video_url
                }

                event_type={
                    event.event_type
                }

                event_title={
                    event.title
                }

                event_description={
                    event.short_description
                }

                event_poster={
                    event.poster_horizontal_1_url
                }
            />


            <InterestButton event={event} />

            {/* ================================================= */}
            {/* HIGHLIGHTS */}
            {/* ================================================= */}

            <section className="bg-neutral-950 py-10 sm:py-14 lg:py-16">

                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

                    <div className="
                        text-center
                        mb-10
                    ">

                        <h2 className="
                            text-2xl
                            md:text-3xl
                            font-semibold
                            text-white
                        ">
                            Event Highlights
                        </h2>


                        <p className="
                            text-gray-400
                            mt-2
                        ">
                            Everything you need to know
                            at a glance
                        </p>

                        {/* UI refinement: keep every highlight inside one polished panel instead of separate cards. */}
                        {Array.isArray(event.highlights) && event.highlights.some((highlight) => typeof highlight === "string" && highlight.trim()) && (
                            <div
                                aria-label="Event highlights"
                                className="mx-auto mt-7 w-full max-w-5xl rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.025] px-5 py-6 text-left shadow-lg shadow-black/10 sm:px-8 sm:py-8"
                            >
                                <ul className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                                    {event.highlights
                                        .filter((highlight) => typeof highlight === "string" && highlight.trim())
                                        .map((highlight) => {
                                            const [title, ...descriptionParts] = highlight.trim().split(/:\\s*/);
                                            const description = descriptionParts.join(": ").trim();
                                            const hasDescription = description.length > 0;

                                            return (
                                                <li key={highlight} className="flex min-w-0 items-start gap-3">
                                                    <span
                                                        aria-hidden="true"
                                                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-300/10 text-amber-200"
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
                                                            <path d="m12 3 2.2 5.1L20 10l-4.4 3.5.2 5.8L12 16.4 6.2 19.3l.9-5.8L3 10l5.8-1.9L12 3Z" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block break-words text-sm font-normal leading-6 text-neutral-100 sm:text-[15px]">
                                                            {hasDescription ? title : highlight.trim()}
                                                        </span>
                                                        {hasDescription && (
                                                            <span className="mt-0.5 block break-words text-sm leading-6 text-neutral-400">
                                                                {description}
                                                            </span>
                                                        )}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                </ul>
                            </div>
                        )}

                    </div>


                    <div className="
                        grid items-start sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6
                    ">


                        {/* ===================================== */}
                        {/* ADVENTURE */}
                        {/* ===================================== */}

                        {eventType === "adventure" && (

                            <>

                                <StarCard
                                    title="Location"
                                    value={
                                        event.location
                                    }
                                />


                                <StarCard
                                    title="Category"
                                    value={
                                        event.adventure_activity_category
                                    }
                                />


                                <StarCard
                                    title="Duration"
                                    value={`${event.duration_days} day${Number(event.duration_days) !== 1 ? "s" : ""} • ${event.duration_nights} night${Number(event.duration_nights) !== 1 ? "s" : ""}`}
                                />


                                <StarCard
                                    title="Fitness"
                                    value={
                                        event.fitness_requirement
                                    }
                                />


                                <StarCard
                                    title="Age"
                                    value={`
                                        ${event.age_requirement}+
                                    `}
                                />


                                <StarCard
                                    title="Difficulty"
                                    value={
                                        event.adventure_difficulty_level
                                    }
                                />

                            </>
                        )}


                        {/* ===================================== */}
                        {/* TREK */}
                        {/* ===================================== */}

                        {eventType === "trek" && (

                            <>

                                <StarCard
                                    title="Location"
                                    value={
                                        event.location
                                    }
                                />


                                <StarCard
                                    title="Duration"
                                    value={`${event.duration_days} day${Number(event.duration_days) !== 1 ? "s" : ""} • ${event.duration_nights} night${Number(event.duration_nights) !== 1 ? "s" : ""}`}
                                />


                                <StarCard
                                    title="Fitness"
                                    value={
                                        event.fitness_requirement
                                    }
                                />


                                <StarCard
                                    title="Age"
                                    value={`
                                        ${event.age_requirement}+
                                    `}
                                />


                                <StarCard
                                    title="Difficulty"
                                    value={
                                        event.trek_difficulty_level
                                    }
                                />

                            </>
                        )}


                        {/* ===================================== */}
                        {/* TRIP */}
                        {/* ===================================== */}

                        {eventType === "trip" && (

                            <>

                                <StarCard
                                    title="Location"
                                    value={
                                        event.location
                                    }
                                />


                                <StarCard
                                    title="Duration"
                                    value={`${event.duration_days} day${Number(event.duration_days) !== 1 ? "s" : ""} • ${event.duration_nights} night${Number(event.duration_nights) !== 1 ? "s" : ""}`}
                                />


                                <StarCard
                                    title="Fitness"
                                    value={
                                        event.fitness_requirement
                                    }
                                />


                                <StarCard
                                    title="Age"
                                    value={`
                                        ${event.age_requirement}+
                                    `}
                                />

                            </>
                        )}


                        {/* ===================================== */}
                        {/* PEAK */}
                        {/* ===================================== */}

                        {eventType === "peak" && (

                            <>

                                <StarCard
                                    title="Location"
                                    value={
                                        event.location
                                    }
                                />


                                <StarCard
                                    title="Duration"
                                    value={`${event.duration_days} day${Number(event.duration_days) !== 1 ? "s" : ""} • ${event.duration_nights} night${Number(event.duration_nights) !== 1 ? "s" : ""}`}
                                />


                                <StarCard
                                    title="Fitness"
                                    value={
                                        event.fitness_requirement
                                    }
                                />


                                <StarCard
                                    title="Age"
                                    value={`
                                        ${event.age_requirement}+
                                    `}
                                />


                                <StarCard
                                    title="Difficulty"
                                    value={
                                        event.peak_difficulty_level
                                    }
                                />


                                <StarCard
                                    title="Group Type"
                                    value={
                                        event.peak_group_type
                                    }
                                />

                            </>
                        )}

                    </div>

                </div>

            </section>





            {/* ================================================= */}
            {/* INCLUSIONS / EXCLUSIONS */}
            {/* ================================================= */}

            <InclusionsExclusions
                event={event}
            />


            {/* ================================================= */}
            {/* SCHEDULE + BOOKING */}
            {/* ================================================= */}

            <section id="event-booking-section" className="scroll-mt-24 bg-neutral-950">

                <div className="
                    space-y-10
                    py-20
                    px-6
                    max-w-7xl
                    mx-auto
                ">


                    {/* ========================================= */}
                    {/* SCHEDULE LOADING */}
                    {/* ========================================= */}

                    {loadingSchedule && (

                        <div className="
                            text-center
                            text-gray-400
                        ">
                            Loading schedule...
                        </div>

                    )}


                    {/* ========================================= */}
                    {/* SCHEDULE */}
                    {/* ========================================= */}

                    {!loadingSchedule &&
                        eventSchedule && (

                            <>

                                <div className="rounded-xl border border-neutral-700 bg-neutral-900 p-4 sm:flex sm:items-start sm:gap-3">
                                    <div className="mb-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-600 bg-neutral-800 text-white sm:mb-0" aria-hidden="true">
                                        <span className="text-lg font-bold">!</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">Secure online booking</h3>
                                        <p className="mt-1 text-sm leading-6 text-neutral-300">
                                            Select your pickup point and participants below, then complete payment securely through Razorpay.
                                            Your booking is confirmed only after the backend verifies the payment and its captured status.
                                        </p>
                                    </div>
                                </div>

                                <ScheduleHeader

                                    start={
                                        basicDetails
                                            .start_datetime
                                    }

                                    end={
                                        basicDetails
                                            .end_datetime
                                    }

                                    duration={
                                        basicDetails
                                            .duration_days
                                    }

                                    seats={
                                        capacityPricing
                                            .seats_available
                                    }

                                />

                                {eventSchedules.length > 1 && (
                                    <section
                                        aria-label="Choose departure date"
                                        className="rounded-2xl border border-white/10 bg-neutral-900/60 px-4 py-4 sm:px-5"
                                    >
                                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                                            <div>
                                                <h3 className="text-base font-semibold text-white">Upcoming departures</h3>
                                                <p className="mt-1 text-sm text-neutral-400">Choose the date that suits you.</p>
                                            </div>
                                            <span className="text-xs text-neutral-500">{eventSchedules.length} available dates</span>
                                        </div>

                                        <div className="flex flex-wrap gap-2.5">
                                            {eventSchedules.map((item) => {
                                                const details = item.schedule_data?.basic_details || {};
                                                const start = new Date(details.start_datetime);
                                                const end = new Date(details.end_datetime);
                                                const selected = item.schedule_id === eventSchedule?.schedule_id;

                                                return (
                                                    <button
                                                        key={item.schedule_id || item.id}
                                                        type="button"
                                                        onClick={() => setEventSchedule(item)}
                                                        aria-pressed={selected}
                                                        className={`flex min-w-[148px] items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 sm:min-w-[170px] ${selected
                                                            ? "border-amber-300/70 bg-amber-300/[0.08]"
                                                            : "border-white/10 bg-black/20 hover:border-white/25 hover:bg-white/[0.04]"
                                                            }`}
                                                    >
                                                        <span className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg ${selected ? "bg-amber-300/10 text-amber-200" : "bg-white/[0.05] text-neutral-300"}`}>
                                                            <span className="text-[10px] font-medium uppercase tracking-wide">{start.toLocaleDateString("en-IN", { month: "short" })}</span>
                                                            <span className="text-lg font-semibold leading-5">{start.toLocaleDateString("en-IN", { day: "2-digit" })}</span>
                                                        </span>
                                                        <span className="min-w-0">
                                                            <span className="block text-sm font-medium text-white">{start.toLocaleDateString("en-IN", { weekday: "long" })}</span>
                                                            <span className="mt-0.5 block text-xs text-neutral-400">
                                                                {Math.max(1, Math.round((end - start) / 86400000))} day{Math.max(1, Math.round((end - start) / 86400000)) === 1 ? "" : "s"}
                                                            </span>
                                                        </span>
                                                        {selected && <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-amber-300" aria-hidden="true" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </section>
                                )}


                                {/* ================================= */}
                                {/* BOOKING SECTION */}
                                {/* ================================= */}

                                <BookingSection

                                    event={
                                        event
                                    }

                                    schedule={
                                        eventSchedule
                                    }

                                    user={
                                        user
                                    }

                                    navigate={
                                        navigate
                                    }

                                />

                            </>
                        )}


                    {/* ========================================= */}
                    {/* NO SCHEDULE */}
                    {/* ========================================= */}

                    {!loadingSchedule &&
                        !eventSchedule && (

                            <div className="
                                text-center
                                text-gray-400
                                mt-10
                            ">

                                Schedule is not available
                                for this event yet.

                            </div>

                        )}

                </div>

            </section>

            {/* ================================================= */}
            {/* ITINERARY */}
            {/* ================================================= */}

            <Itinerary
                itinerary={
                    eventSchedule?.schedule_data?.extra_options?.itinerary || eventSchedule?.schedule_data?.itinerary || event.itinerary
                }

                gallery_image_urls={
                    event.gallery_image_urls || []
                }
            />

            {/* Policies are intentionally placed after booking so guests can
                review the essentials after seeing the booking options. */}
            <Policy event={event} />


            {/* ================================================= */}
            {/* ERROR AFTER EVENT LOADED */}
            {/* ================================================= */}

            {error && (

                <div className="
                    text-red-400
                    text-center
                    py-4
                ">
                    {error}
                </div>

            )}


            {/* ================================================= */}
            {/* EVENT STATE */}
            {/* ================================================= */}

            <section className="w-full">
                <Highlights highlights={event.state} />
            </section>

            <Footer />

            {event.status?.toLowerCase() === "published" && (
                <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/15 bg-black/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md sm:px-6 sm:py-4">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white sm:text-sm">
                                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                                Event is live
                            </p>
                            <p className="mt-1 hidden text-sm text-neutral-400 sm:block">Explore the schedule and booking details.</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                            <button
                                type="button"
                                onClick={() => setShareOpen(true)}
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/35 bg-transparent px-3 py-3 text-xs font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:px-5 sm:text-sm"
                                aria-label="Share this event"
                                title="Share this event"
                            >
                                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                    <circle cx="18" cy="5" r="3" />
                                    <circle cx="6" cy="12" r="3" />
                                    <circle cx="18" cy="19" r="3" />
                                    <path d="m8.7 10.6 6.6-4.2M8.7 13.4l6.6 4.2" strokeLinecap="round" />
                                </svg>
                                <span>Share</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => downloadEventPdf(event, eventSchedule)}
                                className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-transparent px-3 py-3 text-xs font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:px-5 sm:text-sm"
                                aria-label="Download event details as PDF"
                            >
                                <span className="hidden sm:inline">Download PDF</span>
                                <span className="sm:hidden">PDF</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => document.getElementById("event-booking-section")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                                className="shrink-0 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:min-w-40 sm:px-8"
                            >
                                Book Now
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {shareOpen && (() => {
                const shareUrl = event?.id ? `https://livingtheadventure.in/api/events/share/${encodeURIComponent(event.id)}` : window.location.href.split("#")[0];
                const posterUrl = event.poster_horizontal_1_url || event.cover_image_url || "";
                const title = event.title || "Living The Adventure";
                const rawDescription = event.short_description || event.seo_description || `Discover ${title} with Living The Adventure.`;
                const description = String(rawDescription)
                    .replace(/<[^>]*>/g, " ")
                    .replace(/[,;|]+/g, " ")
                    .replace(/\s+/g, " ")
                    .trim()
                    .slice(0, 240);
                const marketingMessage = `LIVING THE ADVENTURE

${title}

${description}

Explore upcoming dates, itinerary and booking details:
${shareUrl}

Plan your next adventure with Living The Adventure.`;
                const copyMessage = async () => {
                    try {
                        await navigator.clipboard.writeText(marketingMessage);
                        window.alert("Message copied. Use “Share image + message” to share the poster with its caption where supported.");
                    } catch {
                        window.prompt("Copy your event message:", marketingMessage);
                    }
                };
                const openWhatsAppMessage = () => {
                    const url = "https://wa.me/?text=" + encodeURIComponent(marketingMessage);
                    const popup = window.open(url, "_blank");
                    if (!popup) window.location.assign(url);
                };
                const sharePoster = async () => {
                    if (!posterUrl) {
                        openWhatsAppMessage();
                        return;
                    }

                    // Use our own backend as the image source. It streams only this
                    // published event's stored poster, avoiding browser-to-S3 CORS.
                    // The File remains in memory for the share operation; no persistent
                    // browser storage is used.
                    const fallbackWindow = window.open("", "_blank");
                    try {
                        const response = await fetch(
                            apiUrl(`/events/${encodeURIComponent(event.id)}/poster-image`),
                            { cache: "no-store" }
                        );
                        if (!response.ok) {
                            throw new Error(`Poster download failed (HTTP ${response.status})`);
                        }

                        const blob = await response.blob();
                        if (!blob.type.startsWith("image/")) {
                            throw new Error("Poster response is not an image");
                        }

                        const extension = blob.type.includes("png")
                            ? "png"
                            : blob.type.includes("webp")
                                ? "webp"
                                : blob.type.includes("gif")
                                    ? "gif"
                                    : "jpg";
                        const safeTitle = title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "event";
                        const file = new File([blob], `${safeTitle}-poster.${extension}`, { type: blob.type });

                        if (navigator.share && navigator.canShare?.({ files: [file] })) {
                            fallbackWindow?.close();
                            await navigator.share({ files: [file], title, text: marketingMessage });
                            return;
                        }

                        // Desktop browsers cannot attach files to a WhatsApp URL.
                        // Download a temporary copy for manual attachment, then open
                        // WhatsApp with the prepared message.
                        const objectUrl = URL.createObjectURL(file);
                        const anchor = document.createElement("a");
                        anchor.href = objectUrl;
                        anchor.download = file.name;
                        document.body.appendChild(anchor);
                        anchor.click();
                        anchor.remove();
                        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
                    } catch (error) {
                        console.warn("Poster could not be prepared for sharing:", error);
                        window.alert("Couldn't prepare the poster automatically. WhatsApp will open with your message; use “Open / download poster” to attach the image.");
                    }

                    const whatsappUrl = "https://wa.me/?text=" + encodeURIComponent(marketingMessage);
                    if (fallbackWindow && !fallbackWindow.closed) {
                        fallbackWindow.location.replace(whatsappUrl);
                    } else {
                        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
                    }
                };
                return (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="event-share-title" onClick={(e) => { if (e.target === e.currentTarget) setShareOpen(false); }}>
                        <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/15 bg-neutral-950 p-5 text-white shadow-2xl sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">Living The Adventure</p><h2 id="event-share-title" className="mt-2 text-2xl font-bold sm:text-3xl">Share this adventure</h2><p className="mt-2 text-sm text-neutral-400">A ready-to-send promotional message with your event poster.</p></div>
                                <button type="button" onClick={() => setShareOpen(false)} className="rounded-full border border-white/20 px-3 py-2 text-sm hover:bg-white/10" aria-label="Close share dialog">✕</button>
                            </div>
                            {posterUrl ? <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black"><img src={posterUrl} alt={`${title} event poster`} className="aspect-[1200/630] max-h-64 w-full object-cover" /></div> : <div className="mt-5 rounded-2xl border border-white/10 p-5 text-sm text-neutral-400">No horizontal poster is configured for this event.</div>}
                            <label htmlFor="event-marketing-message" className="mt-5 block text-sm font-semibold">Promotional message</label>
                            <textarea id="event-marketing-message" readOnly value={marketingMessage} className="mt-2 min-h-52 w-full resize-y rounded-2xl border border-white/15 bg-white/[0.04] p-4 text-sm leading-6 text-neutral-200 outline-none focus:border-white/40" />
                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <button type="button" onClick={copyMessage} className="rounded-full border border-white/25 px-5 py-3 text-sm font-semibold hover:bg-white/10">Copy message</button>
                                {posterUrl ? <a href={posterUrl} target="_blank" rel="noreferrer" className="rounded-full border border-white/25 px-5 py-3 text-center text-sm font-semibold hover:bg-white/10">Open / download poster</a> : <button type="button" disabled className="rounded-full border border-white/10 px-5 py-3 text-sm text-neutral-500">Poster unavailable</button>}
                                <button type="button" onClick={sharePoster} className="sm:col-span-2 rounded-full bg-white px-5 py-3.5 text-sm font-bold text-black hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Share image + message</button>
                            </div>
                            <p className="mt-4 text-xs leading-5 text-neutral-500">On supported phones, the share sheet can send the poster and message together. On desktop, the poster downloads and WhatsApp opens with the message; attach the downloaded image in WhatsApp before sending because browsers cannot attach files to WhatsApp automatically.</p>
                        </div>
                    </div>
                );
            })()}

        </div>
    );
}


export default EventDetail;