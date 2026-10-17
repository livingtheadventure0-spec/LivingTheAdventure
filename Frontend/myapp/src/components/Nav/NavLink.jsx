const NavLink = ({ icon, label, expanded = false, active = false }) => (
    <span
        className={`group relative flex h-12 items-center overflow-hidden rounded-xl px-3 transition-[background-color,color,transform] duration-200 ease-out motion-reduce:transition-none ${active ? "bg-white text-black shadow-[0_3px_16px_rgba(255,255,255,.12)]" : "text-white/55 hover:bg-white/[.08] hover:text-white"} ${expanded ? "w-full gap-4" : "mx-auto w-12 justify-center"}`}
    >
        <span className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center text-[18px] transition-transform duration-200 ease-out group-hover:scale-110 group-active:scale-95 ${active ? "text-black" : ""}`}>{icon}</span>
        <span
            className={`overflow-hidden whitespace-nowrap text-left text-[13px] font-medium tracking-[.01em] transition-[opacity,transform,max-width] duration-200 ease-out ${expanded ? "max-w-44 translate-x-0 opacity-100" : "max-w-0 -translate-x-2 opacity-0"}`}
        >
            {label}
        </span>
        {active && expanded && <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-black" />}
        {!expanded && (
            <span
                role="tooltip"
                className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-[60] -translate-x-1.5 -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#111214]/95 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-xl backdrop-blur-xl transition-[opacity,transform] duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
            >
                {label}
            </span>
        )}
    </span>
);

export default NavLink;
