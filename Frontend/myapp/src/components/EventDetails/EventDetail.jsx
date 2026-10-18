import React, { useEffect, useState } from "react";
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


function EventDetail() {

    const { id } = useParams();

    const navigate = useNavigate();

    const { user } = useAuth();


    // =========================================================
    // EVENT / SCHEDULE STATE
    // =========================================================

    const [event, setEvent] = useState(null);

    const [eventSchedule, setEventSchedule] =
        useState(null);

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

                const schedule =
                    Array.isArray(data)
                        ? data.find((item) => item && typeof item === "object")
                        : data;

                // A schedule record can exist even when its details are not
                // configured. Only show booking UI when valid dates are present.
                const scheduleData = schedule?.schedule_data || {};
                const basicDetails = scheduleData.basic_details || {};
                const startDate = basicDetails.start_datetime;
                const endDate = basicDetails.end_datetime;
                const hasValidScheduleDates =
                    Boolean(startDate && endDate) &&
                    !Number.isNaN(new Date(startDate).getTime()) &&
                    !Number.isNaN(new Date(endDate).getTime());

                setEventSchedule(
                    hasValidScheduleDates ? schedule : null
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
            {/* ITINERARY */}
            {/* ================================================= */}

            <Itinerary
                itinerary={
                    event.itinerary
                }

                gallery_image_urls={
                    event.gallery_image_urls || []
                }
            />


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

        </div>
    );
}


export default EventDetail;