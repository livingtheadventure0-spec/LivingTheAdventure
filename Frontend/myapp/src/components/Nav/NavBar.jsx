import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../Common/Logo/logo";
import NavLink from "./NavLink";
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
    { to: "/", label: "Home", mobileLabel: "Home", icon: FaHome, end: true },
    { to: "/trips", label: "Trips", mobileLabel: "Trips", icon: FaSuitcaseRolling },
    { to: "/treks", label: "Treks", mobileLabel: "Treks", icon: FaHiking },
    { to: "/adventure-activity", label: "Adventure Activity", mobileLabel: "Adventure", icon: FaCampground },
    { to: "/peak-expedition", label: "Peak Expedition", mobileLabel: "Peaks", icon: FaMountain },
    { to: "/park-development-design", label: "Park Development", mobileLabel: "Parks", icon: FaTree },
];

function NavBar() {
    const { user } = useAuth();
    const location = useLocation();
    const [expanded, setExpanded] = useState(false);
    const profilePath = user ? "/profile" : "/auth";
    const profileActive = location.pathname === "/profile" || location.pathname === "/auth";

    const isActive = (to, end) => end
        ? location.pathname === "/"
        : location.pathname === to || location.pathname.startsWith(`${to}/`);

    return (
        <>
            {/* Desktop hover scrim: softens the page while the navigation is expanded. */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 z-30 hidden bg-transparent md:block"
            />

            <aside
                aria-label="Main navigation"
                onMouseEnter={() => setExpanded(true)}
                onMouseLeave={() => setExpanded(false)}
                onFocus={() => setExpanded(true)}
                onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false);
                }}
                className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-white/[.08] bg-[#090a0c]/95 py-5 text-white shadow-[8px_0_24px_rgba(0,0,0,.18)] backdrop-blur-xl transition-[width,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] md:flex ${expanded ? "w-60 shadow-[12px_0_32px_rgba(0,0,0,.24)]" : "w-[76px]"}`}
            >
                <Link
                    to="/"
                    aria-label="Living the Adventure home"
                    className={`mb-8 flex h-12 shrink-0 items-center overflow-hidden rounded-xl transition-[padding,margin] duration-300 ${expanded ? "mx-4 gap-3 px-2" : "mx-auto w-12 justify-center"}`}
                >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                        <Logo />
                    </span>
                    <span className={`overflow-hidden whitespace-nowrap transition-[opacity,transform,max-width] duration-200 ${expanded ? "max-w-40 translate-x-0 opacity-100" : "max-w-0 -translate-x-2 opacity-0"}`}>
                        <span className="block text-[13px] font-bold tracking-[.16em]">LIVING</span>
                        <span className="block text-[9px] font-medium uppercase tracking-[.22em] text-white/45">the Adventure</span>
                    </span>
                </Link>

                <div className="mx-4 mb-4 h-px bg-gradient-to-r from-white/15 to-transparent" />

                <nav className="flex flex-1 flex-col gap-1 px-2" aria-label="Explore">
                    {navigation.map(({ to, label, icon: Icon, end }, index) => (
                        <Link
                            key={to}
                            to={to}
                            aria-label={label}
                            aria-current={isActive(to, end) ? "page" : undefined}
                            className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                            style={{ transitionDelay: expanded ? `${index * 12}ms` : "0ms" }}
                        >
                            <NavLink icon={<Icon />} label={label} active={isActive(to, end)} expanded={expanded} />
                        </Link>
                    ))}
                </nav>

                <div className="mx-4 mb-3 h-px bg-gradient-to-r from-white/15 to-transparent" />

                <div className="px-2">
                    <Link
                        to={profilePath}
                        aria-label={user ? "Your profile" : "Sign in"}
                        aria-current={profileActive ? "page" : undefined}
                        className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    >
                        <NavLink icon={<FaUserCircle />} label={user ? "Your profile" : "Sign in"} active={profileActive} expanded={expanded} />
                    </Link>
                </div>
            </aside>

            {/* Compact, touch-friendly navigation for phones and small tablets. */}
            <nav
                aria-label="Mobile navigation"
                className="fixed inset-x-0 bottom-0 z-50 flex items-stretch gap-1 overflow-x-auto border-t border-white/10 bg-[#090a0c]/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 text-white shadow-[0_-8px_30px_rgba(0,0,0,.28)] backdrop-blur-2xl md:hidden"
            >
                {navigation.map(({ to, label, mobileLabel, icon: Icon, end }) => {
                    const active = isActive(to, end);
                    return (
                        <Link
                            key={to}
                            to={to}
                            aria-label={label}
                            aria-current={active ? "page" : undefined}
                            className="flex min-w-[58px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-white/70"
                        >
                            <span className={`flex h-8 w-9 items-center justify-center rounded-xl text-[17px] transition-[background-color,color,transform] duration-200 ${active ? "bg-white text-black" : "text-white/55"}`}>
                                <Icon />
                            </span>
                            <span className={`max-w-full truncate text-[10px] font-medium transition-colors duration-200 ${active ? "text-white" : "text-white/50"}`}>{mobileLabel}</span>
                        </Link>
                    );
                })}
                <Link
                    to={profilePath}
                    aria-label={user ? "Your profile" : "Sign in"}
                    aria-current={profileActive ? "page" : undefined}
                    className="flex min-w-[58px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-white/70"
                >
                    <span className={`flex h-8 w-9 items-center justify-center rounded-xl text-[17px] transition-colors duration-200 ${profileActive ? "bg-white text-black" : "text-white/55"}`}><FaUserCircle /></span>
                    <span className={`text-[10px] font-medium ${profileActive ? "text-white" : "text-white/50"}`}>{user ? "Profile" : "Sign in"}</span>
                </Link>
            </nav>
        </>
    );
}

export default NavBar;
