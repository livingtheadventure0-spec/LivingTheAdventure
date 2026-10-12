const NavLink = ({ icon, label, active = false }) => (
    <span
        className={`group relative flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-200 ease-out ${active ? "bg-white text-[#101216]" : "text-white/60 hover:bg-white/[.10] hover:text-white"}`}
    >
        {active && <span className="absolute -left-[9px] h-5 w-[2px] rounded-full bg-white" />}
        <span className="text-[18px] transition-transform duration-200 group-hover:scale-105">{icon}</span>
        <span
            role="tooltip"
            className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-[60] -translate-x-1 -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#111318]/95 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg backdrop-blur-xl transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
        >
            {label}
        </span>
    </span>
);

export default NavLink;
