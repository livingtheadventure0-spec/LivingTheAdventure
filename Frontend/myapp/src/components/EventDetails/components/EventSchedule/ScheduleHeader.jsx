import { MdOutlineAccessTime, MdOutlinePeople } from 'react-icons/md';
function ScheduleHeader({ start, end, duration, seats }) {
    return (
        <div className="text-center space-y-4 bg-neutral-950">
            <h2 className="text-3xl md:text-4xl font-semibold text-white">
                Event Schedule
            </h2>

            <p className="text-gray-400">
                {new Date(start).toDateString()} → {new Date(end).toDateString()}
            </p>

            <div className="flex justify-center gap-8 mt-6 text-gray-300">
                <span className="flex items-center gap-2">
                    <MdOutlineAccessTime /> {duration} Days
                </span>
                <span className="flex items-center gap-2">
                    <MdOutlinePeople /> {seats} Seats Available
                </span>
            </div>
        </div>
    );
}
export default ScheduleHeader;