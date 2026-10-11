import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "../api";

/**
 * Palette — "Basecamp" (expedition-journal identity, independent of the
 * black/gold client-facing brand):
 *
 *   Paper       #F5F2E9   warm parchment background
 *   Ink         #1B222C   deep navy-charcoal (panel, primary text)
 *   Ink Deep    #12171E   darker ink, gradient floor of the right panel
 *   Brass       #A9782F   primary accent — buttons, links, active states
 *   Brass Light #C9A55C   hover / glow accent
 *   Moss        #4B5842   secondary accent — icons, dividers
 *   Rust        #9C4A3C   errors (muted, not alarm-red)
 *
 * Optional: pair a serif display face (e.g. "Fraunces" or "Libre Caslon
 * Text") with a clean grotesk body face (e.g. "Public Sans") via Google
 * Fonts for the closest match to the mockup — falls back cleanly to the
 * Tailwind font-serif / font-sans stacks used below.
 */

const EASE = [0.16, 1, 0.3, 1];

const fieldVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: EASE, delay: 0.15 + i * 0.08 },
    }),
};

function EyeIcon({ open }) {
    return open ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M3 3l18 18" />
            <path d="M10.6 5.2A11 11 0 0 1 12 5c7 0 11 7 11 7a13.5 13.5 0 0 1-3.4 4M6.6 6.6C3.4 8.6 1 12 1 12s4 7 11 7a10.4 10.4 0 0 0 4.4-.9" />
            <path d="M9.5 9.5a3 3 0 0 0 4.2 4.2" />
        </svg>
    );
}

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await API.post("/admin/login", { email, password });
            localStorage.setItem("admin_token", res.data.access_token);
            window.location.replace("/admin/home");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#F5F2E9]">
            {/* ---------------- Left — form ---------------- */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Wordmark */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: EASE }}
                        className="mb-10"
                    >
                        <p className="text-[11px] font-medium tracking-[0.35em] text-[#4B5842] uppercase mb-1">
                            Living The
                        </p>
                        <h1 className="text-4xl font-serif text-[#1B222C] tracking-wide">
                            Adventure
                        </h1>
                        <div className="w-10 h-[3px] bg-[#A9782F] mt-4 rounded-full" />
                    </motion.div>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
                        className="mb-9"
                    >
                        <h2 className="text-2xl font-serif text-[#1B222C] mb-1.5">
                            Basecamp Access
                        </h2>
                        <p className="text-[#6E6A5E] text-[15px]">
                            Sign in to manage bookings, content, and expeditions.
                        </p>
                    </motion.div>

                    {/* Error */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.35, ease: EASE }}
                            className="mb-6 pl-4 py-3 border-l-2 border-[#9C4A3C] bg-[#9C4A3C]/[0.06]"
                            role="alert"
                            aria-live="polite"
                        >
                            <p className="text-sm text-[#9C4A3C]">{error}</p>
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-7">
                        <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
                            <label
                                htmlFor="email"
                                className="block text-xs font-medium tracking-wide text-[#6E6A5E] uppercase mb-2"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="your.email@example.com"
                                autoComplete="email"
                                className="w-full bg-transparent border-b border-[#1B222C]/15 pb-3 text-[#1B222C] placeholder:text-[#6E6A5E]/50 outline-none transition-colors focus:border-[#A9782F]"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </motion.div>

                        <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
                            <label
                                htmlFor="password"
                                className="block text-xs font-medium tracking-wide text-[#6E6A5E] uppercase mb-2"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    className="w-full bg-transparent border-b border-[#1B222C]/15 pb-3 pr-9 text-[#1B222C] placeholder:text-[#6E6A5E]/50 outline-none transition-colors focus:border-[#A9782F]"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-0 bottom-2.5 text-[#6E6A5E] hover:text-[#1B222C] transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    <EyeIcon open={showPassword} />
                                </button>
                            </div>
                        </motion.div>

                        <motion.button
                            custom={2}
                            variants={fieldVariants}
                            initial="hidden"
                            animate="visible"
                            type="submit"
                            disabled={loading}
                            whileHover={{ y: -1 }}
                            whileTap={{ y: 0, scale: 0.99 }}
                            className="w-full bg-[#1B222C] hover:bg-[#A9782F] disabled:bg-[#1B222C]/40 text-[#F5F2E9] font-medium py-3.5 rounded-sm transition-colors duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && (
                                <span className="h-3.5 w-3.5 rounded-full border-2 border-[#F5F2E9]/40 border-t-[#F5F2E9] animate-spin" />
                            )}
                            {loading ? "Signing in" : "Sign in"}
                        </motion.button>
                    </form>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="mt-12 pt-7 border-t border-[#1B222C]/10"
                    >
                        <p className="text-xs text-[#6E6A5E]/70 text-center tracking-wide">
                            Authorized personnel only
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* ---------------- Right — expedition map panel ---------------- */}
            <div className="hidden lg:block lg:w-1/2 relative bg-[#1B222C] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#1B222C] to-[#12171E]" />

                {/* Contour lines — draw in on load */}
                <svg
                    className="absolute inset-0 h-full w-full opacity-70"
                    viewBox="0 0 600 800"
                    preserveAspectRatio="xMidYMid slice"
                    fill="none"
                >
                    {[
                        "M-20 140 C 120 100, 220 200, 340 150 S 560 120, 640 170",
                        "M-20 230 C 100 190, 240 280, 360 235 S 560 210, 640 260",
                        "M-20 320 C 140 275, 230 360, 380 320 S 560 300, 640 350",
                        "M-20 420 C 120 470, 260 400, 400 450 S 560 480, 640 430",
                        "M-20 520 C 140 560, 250 500, 390 540 S 560 570, 640 520",
                        "M-20 610 C 130 650, 260 600, 400 640 S 560 660, 640 620",
                    ].map((d, i) => (
                        <motion.path
                            key={i}
                            d={d}
                            stroke={i === 2 ? "#A9782F" : "rgba(245,242,233,0.14)"}
                            strokeWidth={i === 2 ? 1.6 : 1}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1.8, ease: EASE, delay: 0.2 + i * 0.12 }}
                        />
                    ))}
                </svg>

                {/* Location pin */}
                <div className="absolute" style={{ top: "34%", left: "62%" }}>
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.6, 1] }}
                        transition={{ duration: 0.6, ease: EASE, delay: 1.1 }}
                        className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-[#A9782F]/40"
                    />
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.4, ease: EASE, delay: 1.2 }}
                        className="relative block h-2.5 w-2.5 rounded-full bg-[#C9A55C] ring-4 ring-[#C9A55C]/20"
                    />
                </div>

                {/* Copy */}
                <div className="relative z-10 flex h-full items-center p-14">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: EASE, delay: 0.6 }}
                    >
                        <p className="text-[11px] tracking-[0.35em] text-[#C9A55C] uppercase mb-4">
                            Current Expedition
                        </p>
                        <h2 className="text-5xl font-serif text-[#F5F2E9] mb-6 leading-tight">
                            Chart every
                            <br />
                            journey.
                        </h2>
                        <p className="text-lg text-[#F5F2E9]/60 leading-relaxed max-w-sm">
                            One basecamp for bookings, guests, and every trip
                            your team runs.
                        </p>

                        <div className="mt-14 space-y-5">
                            {[
                                "Real-time analytics",
                                "Customer management",
                                "Content control",
                            ].map((label, i) => (
                                <motion.div
                                    key={label}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, ease: EASE, delay: 1.0 + i * 0.1 }}
                                    className="flex items-center gap-4"
                                >
                                    <span className="h-8 w-8 flex items-center justify-center rounded-full border border-[#A9782F]/40 text-[#C9A55C]">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                            <path d="M20 6 9 17l-5-5" />
                                        </svg>
                                    </span>
                                    <span className="text-[#F5F2E9]/85">{label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}