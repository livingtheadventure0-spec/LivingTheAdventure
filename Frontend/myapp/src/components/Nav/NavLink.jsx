const NavLink = ({ icon, label }) => (
    <div
        className="
            group/navitem relative flex h-12 w-full items-center justify-start
            rounded-full bg-transparent px-0 text-white/70
            transition-colors duration-300 ease-out
            hover:text-white focus-within:text-white
            motion-reduce:transition-none
        "
    >
        <span
            className="
                relative z-10 flex h-10 w-10 shrink-0 items-center justify-center
                rounded-full bg-transparent
                transition-[color,transform] duration-300 ease-out
                group-hover/navitem:scale-110 group-hover/navitem:text-white
                group-active/navitem:scale-95
                motion-reduce:transition-none motion-reduce:transform-none
            "
        >
            {icon}
        </span>
        <span
            className="
                pointer-events-none absolute left-[58px] whitespace-nowrap
                text-sm font-medium tracking-[0.01em] text-white
                opacity-0 translate-x-[-5px]
                transition-[opacity,transform] duration-300 ease-out
                group-hover/sidebar:translate-x-0 group-hover/sidebar:opacity-100
                group-focus-within/sidebar:translate-x-0 group-focus-within/sidebar:opacity-100
                motion-reduce:transition-none
            "
        >
            {label}
        </span>
        {/* Soft white glow only; intentionally no pill, border, or filled box. */}
        <span
            aria-hidden="true"
            className="
                pointer-events-none absolute left-0 top-1/2 h-9 w-10 -translate-y-1/2
                rounded-full bg-white/0 blur-md
                transition-[background-color,opacity] duration-300
                group-hover/navitem:bg-white/10 group-hover/navitem:opacity-100
                opacity-0 group-hover/navitem:opacity-100
                motion-reduce:transition-none
            "
        />
    </div>
);
export default NavLink;
