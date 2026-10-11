const NavLink = ({ icon, label, onHover }) => (
    <div
        className="relative flex justify-center items-center w-full group"
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
    >
        <div className="flex items-center justify-center w-12 h-12 text-gray-400 hover:text-white transition-colors duration-300">
            <div className="flex items-center justify-center w-10 h-10">{icon}</div>
        </div>
        <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
            {label}
        </span>
    </div>
);
export default NavLink;