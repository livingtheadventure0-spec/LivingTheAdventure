import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Shares the "Basecamp" palette introduced on the login page so the whole
 * admin experience feels like one product — independent of the client-facing
 * black/gold site.
 *
 *   Ink    #1B222C   nav background
 *   Paper  #F5F2E9   content background (used by pages that mount below this)
 *   Brass  #A9782F   accent / active state
 *   Brass Light #C9A55C
 */

const EASE = [0.16, 1, 0.3, 1];

const NAV_LINKS = [
    { label: "Home", to: "/admin/home" },
    { label: "Heroes", to: "/admin/heroes" },
    { label: "Dashboard", to: "/admin/dashboard" },
    { label: "Bookings", to: "/admin/bookings" },
    { label: "Guides", to: "/admin/guides" },
    { label: "Analytics", to: "/admin/analytics" },
    { label: "Users", to: "/admin/users" },
];

function BellIcon() {
    return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    );
}

function ChevronIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const menuRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    const adminEmail = (() => {
        try {
            return localStorage.getItem("admin_email") || "Admin";
        } catch {
            return "Admin";
        }
    })();
    const initial = adminEmail.charAt(0).toUpperCase();

    useEffect(() => {
        function handleClick(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();

        window.location.replace("/");
    };

    const isActive = (to) => location.pathname.startsWith(to);

    return (
        <header className="sticky top-0 z-40 bg-[#1B222C]">
            <div className="mx-auto max-w-7xl px-6">
                <div className="flex h-16 items-center justify-between">
                    {/* Wordmark */}
                    <Link to="/admin/home" className="flex items-baseline gap-2 shrink-0">
                        <span className="text-[10px] font-medium tracking-[0.3em] text-[#C9A55C]/80 uppercase hidden sm:inline">
                            Living The
                        </span>
                        <span className="text-xl font-serif text-[#F5F2E9] tracking-wide">
                            Adventure
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {NAV_LINKS.map((link) => {
                            const active = isActive(link.to);
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className="relative px-4 py-2 text-sm font-medium transition-colors"
                                >
                                    <span
                                        className={
                                            active
                                                ? "text-[#F5F2E9]"
                                                : "text-[#F5F2E9]/55 hover:text-[#F5F2E9]/85"
                                        }
                                    >
                                        {link.label}
                                    </span>
                                    {active && (
                                        <motion.span
                                            layoutId="nav-underline"
                                            transition={{ duration: 0.35, ease: EASE }}
                                            className="absolute left-4 right-4 -bottom-[1px] h-[2px] bg-[#A9782F] rounded-full"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right cluster */}
                    <div className="flex items-center gap-4">
                        <button
                            className="hidden sm:flex text-[#F5F2E9]/60 hover:text-[#F5F2E9] transition-colors relative"
                            aria-label="Notifications"
                        >
                            <BellIcon />
                            <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-[#A9782F]" />
                        </button>

                        <div className="h-6 w-px bg-[#F5F2E9]/10 hidden sm:block" />

                        {/* Avatar / menu */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setMenuOpen((v) => !v)}
                                className="flex items-center gap-2 group"
                            >
                                <span className="h-8 w-8 rounded-full bg-[#A9782F]/20 border border-[#A9782F]/40 flex items-center justify-center text-[#C9A55C] text-sm font-medium">
                                    {initial}
                                </span>
                                <span className="hidden md:block text-[#F5F2E9]/40 group-hover:text-[#F5F2E9]/70 transition-colors">
                                    <ChevronIcon />
                                </span>
                            </button>

                            <AnimatePresence>
                                {menuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                        transition={{ duration: 0.18, ease: EASE }}
                                        className="absolute right-0 mt-3 w-52 rounded-sm bg-[#F5F2E9] shadow-xl overflow-hidden"
                                    >
                                        <div className="px-4 py-3 border-b border-[#1B222C]/10">
                                            <p className="text-xs text-[#6E6A5E] truncate">{adminEmail}</p>
                                        </div>
                                        <Link
                                            to="/admin/settings"
                                            onClick={() => setMenuOpen(false)}
                                            className="block px-4 py-2.5 text-sm text-[#1B222C] hover:bg-[#1B222C]/5 transition-colors"
                                        >
                                            Settings
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2.5 text-sm text-[#9C4A3C] hover:bg-[#9C4A3C]/5 transition-colors"
                                        >
                                            Log out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Mobile toggle */}
                        <button
                            className="lg:hidden text-[#F5F2E9]/70"
                            onClick={() => setMobileOpen((v) => !v)}
                            aria-label="Toggle menu"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                {mobileOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile nav */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.nav
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="lg:hidden overflow-hidden border-t border-[#F5F2E9]/10"
                    >
                        <div className="px-6 py-3 flex flex-col gap-1">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setMobileOpen(false)}
                                    className={`py-2.5 text-sm font-medium ${isActive(link.to)
                                        ? "text-[#C9A55C]"
                                        : "text-[#F5F2E9]/60"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    );
}