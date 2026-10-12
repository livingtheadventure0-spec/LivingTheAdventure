import { useState } from "react";
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
    const [expanded, setExpanded] = useState(false);
    const profilePath = user ? "/profile" : "/auth";
    const isProfileActive = location.pathname === "/profile" || location.pathname === "/auth";

    return (
        <aside
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
            onFocus={() => setExpanded(true)}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false);
            }}
            className={`fixed left-3 top-1/2 z-50 hidden -translate-y-1/2 flex-col rounded-[1.75rem] border border-white/10 bg-[#090b0f]/90 py-4 text-white shadow-[0_20px_70px_rgba(0,0,0,.55)] backdrop-blur-2xl transition-[width] duration-300 ease-out md:flex ${expanded ? "w-[244px]" : "w-[76px]"}`}
            aria-label="Main navigation"
        >
            <Link to="/" aria-label="Living the Adventure home" className={`mx-auto mb-5 flex h-12 items-center overflow-hidden rounded-2xl transition-all duration-300 ${expanded ? "w-[204px] justify-start gap-3 px-3" : "w-12 justify-center"}`}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/5">
                    <Logo />
                </span>
                {expanded && <span className="min-w-0 text-left"><span className="block text-sm font-bold tracking-wide">LIVING</span><span className="block text-[10px] uppercase tracking-[.22em] text-white/50">the Adventure</span></span>}
            </Link>

            <div className="mx-3 mb-3 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            <nav className="flex flex-col gap-1.5 px-2" aria-label="Explore">
                {navigation.map(({ to, label, icon: Icon, end }) => {
                    const active = end ? location.pathname === "/" : location.pathname === to || location.pathname.startsWith(`${to}/`);
                    return (
                        <Link key={to} to={to} aria-current={active ? "page" : undefined} className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-white/70">
                            <NavLink icon={<Icon />} label={label} expanded={expanded} active={active} />
                        </Link>
                    );
                })}
            </nav>

            <div className="mx-3 my-3 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            <div className="px-2">
                <Link to={profilePath} aria-current={isProfileActive ? "page" : undefined} className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-white/70">
                    <NavLink icon={<FaUserCircle />} label={user ? "Your profile" : "Sign in"} expanded={expanded} active={isProfileActive} />
                </Link>
            </div>

            {expanded && (
                <div className="mx-3 mt-4 rounded-2xl border border-white/[.08] bg-white/[.04] px-3 py-3">
                    <p className="text-[9px] font-semibold uppercase tracking-[.24em] text-white/35">Find your next</p>
                    <p className="mt-1 text-xs font-medium text-white/80">great adventure.</p>
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full w-2/3 rounded-full bg-gradient-to-r from-white/40 to-white/90" /></div>
                </div>
            )}
        </aside>
    );
}

export default NavBar;
