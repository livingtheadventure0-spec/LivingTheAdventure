import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import API from "../api";
import Logo from "../assets/LTA_2.png";

const EASE = [0.16, 1, 0.3, 1];

const fieldVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: EASE,
            delay: 0.15 + i * 0.08,
        },
    }),
};

function EyeIcon({ open }) {
    return open ? (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
        >
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ) : (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
        >
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

    const handleLogin = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await API.post("/admin/login", { email, password });

            localStorage.setItem("admin_token", res.data.access_token);
            localStorage.setItem("admin_email", email);

            window.location.replace("/admin/home");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.detail ||
                "Invalid credentials. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen bg-[#F5F2E9]">
            {/* Company logo — subtle top-left placement */}
            <Link
                to="/"
                aria-label="Living The Adventure home"
                className="absolute left-5 top-5 z-20 inline-flex items-center sm:left-8 sm:top-6"
            >
                <img
                    src={Logo}
                    alt="Living The Adventure"
                    className="h-auto max-h-12 w-auto max-w-[150px] object-contain sm:max-w-[175px]"
                />
            </Link>
            {/* Left — login form */}
            <div className="flex w-full items-center justify-center px-6 pb-10 pt-24 sm:px-8 sm:pt-28 lg:w-1/2 lg:py-12">
                <div className="w-full max-w-md">
                    {/* Living The Adventure wordmark — preserved below the corner logo */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: EASE }}
                        className="mb-10"
                    >
                        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.35em] text-[#4B5842]">
                            Living The
                        </p>
                        <h2 className="font-serif text-4xl tracking-wide text-[#1B222C]">
                            Adventure
                        </h2>
                        <div className="mt-4 h-[3px] w-10 rounded-full bg-[#A9782F]" />
                    </motion.div>

                    {/* Login heading */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.6,
                            ease: EASE,
                            delay: 0.08,
                        }}
                        className="mb-9"
                    >
                        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#A9782F]">
                            Administration
                        </p>
                        <h1 className="mb-2 font-serif text-3xl tracking-tight text-[#1B222C]">
                            Basecamp Access
                        </h1>
                        <p className="max-w-sm text-[15px] leading-6 text-[#6E6A5E]">
                            Sign in to manage bookings, content, and expeditions.
                        </p>
                    </motion.div>

                    {/* Error message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.35, ease: EASE }}
                            className="mb-6 border-l-2 border-[#9C4A3C] bg-[#9C4A3C]/[0.06] py-3 pl-4"
                            role="alert"
                            aria-live="polite"
                        >
                            <p className="text-sm text-[#9C4A3C]">{error}</p>
                        </motion.div>
                    )}

                    {/* Login form */}
                    <form onSubmit={handleLogin} className="space-y-7">
                        <motion.div
                            custom={0}
                            variants={fieldVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <label
                                htmlFor="email"
                                className="mb-2 block text-xs font-medium uppercase tracking-wide text-[#6E6A5E]"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="your.email@example.com"
                                autoComplete="username"
                                className="w-full border-b border-[#1B222C]/15 bg-transparent pb-3 text-[#1B222C] outline-none transition-colors placeholder:text-[#6E6A5E]/50 focus:border-[#A9782F]"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />
                        </motion.div>

                        <motion.div
                            custom={1}
                            variants={fieldVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <label
                                htmlFor="password"
                                className="mb-2 block text-xs font-medium uppercase tracking-wide text-[#6E6A5E]"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    className="w-full border-b border-[#1B222C]/15 bg-transparent pb-3 pr-9 text-[#1B222C] outline-none transition-colors placeholder:text-[#6E6A5E]/50 focus:border-[#A9782F]"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword((previous) => !previous)
                                    }
                                    className="absolute bottom-2.5 right-0 text-[#6E6A5E] transition-colors hover:text-[#1B222C]"
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
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
                            className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#1B222C] py-3.5 font-medium text-[#F5F2E9] transition-colors duration-300 hover:bg-[#A9782F] disabled:cursor-not-allowed disabled:bg-[#1B222C]/40"
                        >
                            {loading && (
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#F5F2E9]/40 border-t-[#F5F2E9]" />
                            )}
                            {loading ? "Signing in..." : "Sign in"}
                        </motion.button>
                    </form>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="mt-12 border-t border-[#1B222C]/10 pt-7"
                    >
                        <p className="text-center text-xs tracking-wide text-[#6E6A5E]/70">
                            Authorized personnel only
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right — expedition panel */}
            <div className="relative hidden overflow-hidden bg-[#1B222C] lg:block lg:w-1/2">
                <div className="absolute inset-0 bg-gradient-to-b from-[#1B222C] to-[#12171E]" />

                {/* Decorative contour lines */}
                <svg
                    className="absolute inset-0 h-full w-full opacity-70"
                    viewBox="0 0 600 800"
                    preserveAspectRatio="xMidYMid slice"
                    fill="none"
                    aria-hidden="true"
                >
                    {[
                        "M-20 140 C 120 100, 220 200, 340 150 S 560 120, 640 170",
                        "M-20 230 C 100 190, 240 280, 360 235 S 560 210, 640 260",
                        "M-20 320 C 140 275, 230 360, 380 320 S 560 300, 640 350",
                        "M-20 420 C 120 470, 260 400, 400 450 S 560 480, 640 430",
                        "M-20 520 C 140 560, 250 500, 390 540 S 560 570, 640 520",
                        "M-20 610 C 130 650, 260 600, 400 640 S 560 660, 640 620",
                    ].map((path, index) => (
                        <motion.path
                            key={path}
                            d={path}
                            stroke={
                                index === 2
                                    ? "#A9782F"
                                    : "rgba(245,242,233,0.14)"
                            }
                            strokeWidth={index === 2 ? 1.6 : 1}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{
                                duration: 1.8,
                                ease: EASE,
                                delay: 0.2 + index * 0.12,
                            }}
                        />
                    ))}
                </svg>

                {/* Decorative location marker */}
                <div
                    className="absolute"
                    style={{ top: "34%", left: "62%" }}
                    aria-hidden="true"
                >
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.6, 1] }}
                        transition={{
                            duration: 0.6,
                            ease: EASE,
                            delay: 1.1,
                        }}
                        className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-[#A9782F]/40"
                    />
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            duration: 0.4,
                            ease: EASE,
                            delay: 1.2,
                        }}
                        className="relative block h-2.5 w-2.5 rounded-full bg-[#C9A55C] ring-4 ring-[#C9A55C]/20"
                    />
                </div>

                {/* Panel copy */}
                <div className="relative z-10 flex h-full items-center p-10 xl:p-14">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.7,
                            ease: EASE,
                            delay: 0.6,
                        }}
                    >
                        <p className="mb-4 text-[11px] uppercase tracking-[0.35em] text-[#C9A55C]">
                            Current Expedition
                        </p>

                        <h2 className="mb-6 font-serif text-5xl leading-tight text-[#F5F2E9]">
                            Chart every
                            <br />
                            journey.
                        </h2>

                        <p className="max-w-sm text-lg leading-relaxed text-[#F5F2E9]/60">
                            One basecamp for bookings, guests, and every trip
                            your team runs.
                        </p>

                        <div className="mt-14 space-y-5">
                            {[
                                "Real-time analytics",
                                "Customer management",
                                "Content control",
                            ].map((label, index) => (
                                <motion.div
                                    key={label}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        duration: 0.5,
                                        ease: EASE,
                                        delay: 1 + index * 0.1,
                                    }}
                                    className="flex items-center gap-4"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#A9782F]/40 text-[#C9A55C]">
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.2"
                                            aria-hidden="true"
                                        >
                                            <path d="M20 6 9 17l-5-5" />
                                        </svg>
                                    </span>
                                    <span className="text-[#F5F2E9]/85">
                                        {label}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}