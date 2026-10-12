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
        <>
            <Link
                to="/"
                aria-label="Living the Adventure home"
                className="fixed left-5 top-5 z-[60] flex h-16 w-36 items-center justify-start rounded-xl outline-none transition-opacity duration-200 hover:opacity-85 focus-visible:ring-2 focus-visible:ring-white/80 md:left-7 md:top-6 md:h-[76px] md:w-44"
            >
                <span className="flex h-full w-full items-center justify-start drop-shadow-[0_2px_8px_rgba(0,0,0,.65)]">
                    <Logo />
                </span>
            </Link>

            <aside
                aria-label="Main navigation"
                className="fixed left-3 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-center rounded-full border border-white/[.13] bg-black/75 px-1.5 py-2.5 shadow-[0_8px_28px_rgba(0,0,0,.22)] backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300 hover:border-white/25 hover:bg-black/90 hover:shadow-[0_12px_36px_rgba(0,0,0,.34)] md:flex"
            >
                <nav className="flex flex-col items-center gap-1" aria-label="Explore">
                    {navigation.map(({ to, label, icon: Icon, end }, index) => {
                        const active = end
                            ? location.pathname === "/"
                            : location.pathname === to || location.pathname.startsWith(`${to}/`);
                        return (
                            <Link
                                key={to}
                                to={to}
                                aria-label={label}
                                aria-current={active ? "page" : undefined}
                                className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                                style={{ animationDelay: `${index * 35}ms` }}
                            >
                                <NavLink icon={<Icon />} label={label} active={active} />
                            </Link>
                        );
                    })}
                </nav>

                <span className="my-2 h-px w-6 bg-white/15" />

                <Link
                    to={profilePath}
                    aria-label={user ? "Your profile" : "Sign in"}
                    aria-current={profileActive ? "page" : undefined}
                    className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                >
                    <NavLink icon={<FaUserCircle />} label={user ? "Your profile" : "Sign in"} active={profileActive} />
                </Link>
            </aside>
        </>
    );
}

export default NavBar;
