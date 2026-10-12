import { Link, useLocation } from "react-router-dom";
import NavLink from "./NavLink";
import { useAuth } from "../../context/AuthContext";
import Logo from "../Common/Logo/logo";
import {
    FaHome,
    FaSuitcaseRolling,
    FaHiking,
    FaCampground,
    FaMountain,
    FaTree,
    FaUserCircle,
} from "react-icons/fa";

const navigation = [
    { to: "/", label: "Home", icon: FaHome, end: true },
    { to: "/trips", label: "Trips", icon: FaSuitcaseRolling },
    { to: "/treks", label: "Treks", icon: FaHiking },
    { to: "/adventure-activity", label: "Adventure Activity", icon: FaCampground },
    { to: "/peak-expedition", label: "Peak Expedition", icon: FaMountain },
    { to: "/park-development-design", label: "Park Development", icon: FaTree },
];

function NavBar() {
    const { user } = useAuth();
    const location = useLocation();
    const profilePath = user ? "/profile" : "/auth";
    const profileActive = location.pathname === "/profile" || location.pathname === "/auth";

    return (
        <aside
            aria-label="Main navigation"
            className="fixed left-3 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-center rounded-full border border-white/[.12] bg-[#090b0e]/75 px-2 py-3 shadow-[0_8px_32px_rgba(0,0,0,.24)] backdrop-blur-xl md:flex"
        >
            <Link
                to="/"
                aria-label="Living the Adventure home"
                className="mb-3 flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/[.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full">
                    <Logo />
                </span>
            </Link>

            <span className="mb-2 h-px w-7 bg-white/15" />

            <nav className="flex flex-col items-center gap-1" aria-label="Explore">
                {navigation.map(({ to, label, icon: Icon, end }) => {
                    const active = end
                        ? location.pathname === "/"
                        : location.pathname === to || location.pathname.startsWith(`${to}/`);
                    return (
                        <Link
                            key={to}
                            to={to}
                            aria-label={label}
                            aria-current={active ? "page" : undefined}
                            className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                        >
                            <NavLink icon={<Icon />} label={label} active={active} />
                        </Link>
                    );
                })}
            </nav>

            <span className="my-2 h-px w-7 bg-white/15" />

            <Link
                to={profilePath}
                aria-label={user ? "Your profile" : "Sign in"}
                aria-current={profileActive ? "page" : undefined}
                className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
                <NavLink icon={<FaUserCircle />} label={user ? "Your profile" : "Sign in"} active={profileActive} />
            </Link>
        </aside>
    );
}

export default NavBar;
