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
            className="group/sidebar fixed inset-y-0 left-0 z-40 flex w-[68px] flex-col items-center overflow-visible py-5 motion-reduce:transition-none"
        >
            {/* This overlay fades away instead of creating a hard-edged panel. It never affects layout. */}
            <div
                aria-hidden="true"
                className="
                    pointer-events-none absolute inset-y-0 left-0 -z-10 w-[360px]
                    bg-gradient-to-r from-black/90 via-black/65 via-[55%] to-transparent
                    opacity-0 transition-opacity duration-500 ease-out
                    group-hover/sidebar:opacity-100 group-focus-within/sidebar:opacity-100
                    motion-reduce:transition-none
                "
            />

            <div className="relative mb-8 flex h-14 w-full shrink-0 items-center justify-center">
                <div className="h-10 w-10 shrink-0">
                    <Logo />
                </div>
            </div>

            <nav className="flex min-h-0 w-full flex-1 flex-col justify-center gap-2 px-2" aria-label="Explore">
                <a href="/" aria-label="Home" className="block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                    <NavLink icon={<FaHome className="h-5 w-5 sm:h-[21px] sm:w-[21px]" />} label="Home" />
                </a>
                <a href="/trips" aria-label="Trips" className="block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                    <NavLink icon={<FaSuitcaseRolling className="h-5 w-5 sm:h-[21px] sm:w-[21px]" />} label="Trips" />
                </a>
                <a href="/treks" aria-label="Treks" className="block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                    <NavLink icon={<FaHiking className="h-5 w-5 sm:h-[21px] sm:w-[21px]" />} label="Treks" />
                </a>
                <a href="/adventure-activity" aria-label="Adventure Activity" className="block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                    <NavLink icon={<FaCampground className="h-5 w-5 sm:h-[21px] sm:w-[21px]" />} label="Adventure Activity" />
                </a>
                <a href="/peak-expedition" aria-label="Peak Expedition" className="block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                    <NavLink icon={<FaMountain className="h-5 w-5 sm:h-[21px] sm:w-[21px]" />} label="Peak Expedition" />
                </a>
                <a href="/park-development-design" aria-label="Park Development and Design" className="block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                    <NavLink icon={<FaTree className="h-5 w-5 sm:h-[21px] sm:w-[21px]" />} label="Park Development" />
                </a>
            </nav>

            <div className="mt-3 w-full px-2 pt-3">
                <a href={user ? "/profile" : "/auth"} aria-label="Profile" className="block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                    <NavLink icon={<FaUserCircle className="h-5 w-5 sm:h-[21px] sm:w-[21px]" />} label="Profile" />
                </a>
            </div>
        </aside>
    );
}

export default NavBar;