const NavLink = ({ icon, label, expanded = false, active = false }) => (
    <div
        className={`group relative flex h-[50px] items-center overflow-hidden rounded-2xl px-3 transition-all duration-200 ease-out ${active ? "bg-white text-[#080a0e] shadow-[0_5px_22px_rgba(255,255,255,.13)]" : "text-white/55 hover:bg-white/[.08] hover:text-white"}`}
    >
        {active && <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#111318]" />}
        <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center transition-transform duration-200 ${active ? "scale-105" : "group-hover:scale-110"}`}>
            <span className="text-[19px]">{icon}</span>
        </span>
        <span
            className={`ml-3 overflow-hidden whitespace-nowrap text-left text-[13px] font-semibold tracking-[.01em] transition-all duration-200 ${expanded ? "w-[160px] translate-x-0 opacity-100" : "w-0 -translate-x-2 opacity-0"}`}
            aria-hidden={!expanded}
        >
            {label}
        </span>
        {active && expanded && <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#111318]" />}
        {!expanded && (
            <span className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-50 -translate-y-1/2 translate-x-1 rounded-lg border border-white/10 bg-[#171a20] px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-xl transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                {label}
            </span>
        )}
    </div>
);

export default NavLink;
