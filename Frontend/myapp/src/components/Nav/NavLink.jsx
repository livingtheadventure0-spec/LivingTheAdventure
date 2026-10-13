const NavLink = ({ icon, label, active = false }) => (
    <span
        className={`group relative flex h-10 w-10 items-center justify-center rounded-full transition-[background-color,color,transform,box-shadow] duration-250 ease-out motion-reduce:transition-none ${active ? "scale-[1.03] bg-white text-black shadow-[0_2px_12px_rgba(255,255,255,.14)]" : "text-white/60 hover:scale-105 hover:bg-white/[.10] hover:text-white"}`}
    >
        {active && <span className="absolute -left-[7px] h-4 w-[2px] rounded-full bg-white" />}
        <span className="transition-transform duration-200 ease-out group-hover:scale-110 group-active:scale-95">{icon}</span>
        <span
            role="tooltip"
            className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-[60] -translate-x-1.5 -translate-y-1/2 scale-95 whitespace-nowrap rounded-md border border-white/10 bg-[#0b0b0b]/95 px-3 py-2 text-xs font-medium tracking-wide text-white opacity-0 shadow-[0_8px_24px_rgba(0,0,0,.35)] backdrop-blur-xl transition-[opacity,transform] duration-180 ease-out group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:scale-100 group-focus-visible:opacity-100"
        >
            {label}
        </span>
    </span>
);

export default NavLink;
