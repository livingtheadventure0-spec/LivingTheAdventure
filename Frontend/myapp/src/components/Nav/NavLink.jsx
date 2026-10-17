const NavLink = ({ icon, label }) => (
    <div
        className="
            group/navitem relative flex h-12 w-full min-w-0 items-center
            justify-center gap-3 overflow-hidden rounded-xl px-0
            text-white/65
            transition-[background-color,color,box-shadow,padding] duration-250 ease-out
            group-hover/sidebar:justify-start group-hover/sidebar:px-3
            group-focus-within/sidebar:justify-start group-focus-within/sidebar:px-3
            hover:bg-white/[0.14] hover:text-white hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16),0_0_22px_rgba(255,255,255,0.08)]
            focus-within:bg-white/[0.14] focus-within:text-white
            active:bg-white/20
            motion-reduce:transition-none
        "
    >
        <span
            className="
                flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
                transition-[transform,color] duration-250 ease-out
                group-hover/navitem:scale-105 group-hover/navitem:text-white
                motion-reduce:transition-none motion-reduce:transform-none
            "
        >
            {icon}
        </span>
        <span
            className="
                pointer-events-none absolute left-[58px] whitespace-nowrap
                text-[14px] font-medium tracking-[0.01em] text-white
                opacity-0 translate-x-2
                transition-[opacity,transform] duration-200 ease-out
                group-hover/sidebar:static group-hover/sidebar:translate-x-0 group-hover/sidebar:opacity-100
                group-focus-within/sidebar:static group-focus-within/sidebar:translate-x-0 group-focus-within/sidebar:opacity-100
                motion-reduce:transition-none
            "
        >
            {label}
        </span>
    </div>
);
export default NavLink;
