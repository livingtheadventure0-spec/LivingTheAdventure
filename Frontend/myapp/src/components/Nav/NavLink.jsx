const NavLink = ({ icon, label }) => (
    <div className="group relative flex w-full items-center justify-center">
        <div
            className="
                relative flex h-11 w-11 items-center justify-center rounded-xl
                text-white/60
                transition-[background-color,color,transform,box-shadow] duration-200 ease-out
                group-hover:scale-[1.04] group-hover:bg-white/[0.09] group-hover:text-white
                group-hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]
                group-active:scale-95
                motion-reduce:transition-none motion-reduce:transform-none
            "
        >
            <span className="transition-transform duration-200 ease-out group-hover:-translate-y-0.5 motion-reduce:transform-none">
                {icon}
            </span>
            <span
                className="
                    pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-50
                    -translate-x-1 -translate-y-1/2 scale-[0.98]
                    rounded-lg border border-white/10 bg-[#111214]/95
                    px-3 py-2 text-sm font-medium tracking-[0.01em] text-white
                    opacity-0 shadow-xl shadow-black/20 backdrop-blur-md
                    transition-[opacity,transform] duration-200 ease-out
                    group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100
                    group-focus-within:translate-x-0 group-focus-within:scale-100 group-focus-within:opacity-100
                    motion-reduce:transition-none
                "
            >
                {label}
                <span className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-l border-white/10 bg-[#111214]/95" />
            </span>
        </div>
    </div>
);
export default NavLink;
