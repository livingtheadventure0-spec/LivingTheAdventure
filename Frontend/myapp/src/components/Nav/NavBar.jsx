import NavLink from './NavLink';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Common/Logo/logo';
import {
    FaHome,
    FaSuitcaseRolling,
    FaHiking,
    FaCampground,
    FaMountain,
    FaTree,
    FaUserCircle
} from 'react-icons/fa';

function NavBar() {
    const { user } = useAuth();

    return (
        <aside
            aria-label="Main navigation"
            className="
                group/sidebar fixed inset-y-0 left-0 z-40
                flex w-[68px] flex-col items-center
                overflow-visible py-5
                transition-[width,background-color,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)]
                hover:w-[248px] focus-within:w-[248px]
                hover:items-stretch hover:shadow-[18px_0_50px_rgba(0,0,0,0.28)]
                motion-reduce:transition-none
                max-sm:hover:w-[220px] max-sm:focus-within:w-[220px]
            "
        >
            {/* A soft black fade provides contrast without a hard-edged panel. */}
            <div
                aria-hidden="true"
                className="
                    pointer-events-none absolute inset-0 -z-10
                    bg-gradient-to-r from-black/95 via-black/80 to-black/0
                    opacity-0 transition-opacity duration-300
                    group-hover/sidebar:opacity-100 group-focus-within/sidebar:opacity-100
                    motion-reduce:transition-none
                "
            />

            <div className="relative mb-8 flex h-14 shrink-0 items-center justify-center px-3 group-hover/sidebar:justify-start group-hover/sidebar:px-5 group-focus-within/sidebar:justify-start group-focus-within/sidebar:px-5">
                <div className="h-10 w-10 shrink-0 transition-transform duration-300 group-hover/sidebar:scale-105 motion-reduce:transition-none">
                    <Logo />
                </div>
            </div>

            <nav className="flex min-h-0 flex-1 flex-col justify-center gap-2 px-2" aria-label="Explore">
                <a href="/" aria-label="Home" className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                    <NavLink icon={<FaHome className="h-5 w-5 shrink-0 sm:h-[21px] sm:w-[21px]" />} label="Home" />
                </a>
                <a href="/trips" aria-label="Trips" className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                    <NavLink icon={<FaSuitcaseRolling className="h-5 w-5 shrink-0 sm:h-[21px] sm:w-[21px]" />} label="Trips" />
                </a>
                <a href="/treks" aria-label="Treks" className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                    <NavLink icon={<FaHiking className="h-5 w-5 shrink-0 sm:h-[21px] sm:w-[21px]" />} label="Treks" />
                </a>
                <a href="/adventure-activity" aria-label="Adventure Activity" className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                    <NavLink icon={<FaCampground className="h-5 w-5 shrink-0 sm:h-[21px] sm:w-[21px]" />} label="Adventure Activity" />
                </a>
                <a href="/peak-expedition" aria-label="Peak Expedition" className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                    <NavLink icon={<FaMountain className="h-5 w-5 shrink-0 sm:h-[21px] sm:w-[21px]" />} label="Peak Expedition" />
                </a>
                <a href="/park-development-design" aria-label="Park Development and Design" className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                    <NavLink icon={<FaTree className="h-5 w-5 shrink-0 sm:h-[21px] sm:w-[21px]" />} label="Park Development" />
                </a>
            </nav>

            <div className="mt-3 border-t border-white/10 px-2 pt-3">
                <a href={user ? "/profile" : "/auth"} aria-label="Profile" className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                    <NavLink icon={<FaUserCircle className="h-5 w-5 shrink-0 sm:h-[21px] sm:w-[21px]" />} label="Profile" />
                </a>
            </div>
        </aside>
    );
}

export default NavBar;