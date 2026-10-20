import { MdOutlineAccessTime, MdOutlinePeople } from 'react-icons/md';

function ScheduleHeader({ start, end, duration, seats }) {
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;
    const validStart = startDate && !Number.isNaN(startDate.getTime());
    const validEnd = endDate && !Number.isNaN(endDate.getTime());

    return (
        <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 px-5 py-7 text-center shadow-[0_16px_45px_rgba(0,0,0,0.16)] sm:px-8">
            <div className="pointer-events-none absolute inset-x-1/4 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-300">Your adventure</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">Event Schedule</h2>
            {validStart && validEnd && (
                <p className="mt-3 text-sm font-medium text-neutral-300 sm:text-base">
                    {startDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                    <span className="mx-2 text-amber-300" aria-hidden="true">→</span>
                    {endDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                </p>
            )}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-neutral-200">
                    <MdOutlineAccessTime className="text-amber-300" />
                    {duration} {Number(duration) === 1 ? "Day" : "Days"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-neutral-200">
                    <MdOutlinePeople className="text-amber-300" />
                    {seats} Seats Available
                </span>
            </div>
        </section>
    );
}

export default ScheduleHeader;
