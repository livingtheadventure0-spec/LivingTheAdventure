import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar/NavBar";

const EASE = [0.16, 1, 0.3, 1];

/**
 * Generic placeholder for any admin section that isn't built yet.
 * Usage: <ComingSoonPage pageName="Bookings" />
 * Optional: pass a `description` for extra context, or `backTo` to
 * override the default back-link destination (defaults to /dashboard).
 */
export default function ComingSoonPage({
    pageName = "This page",
    description,
    backTo = "/admin/home",
    backLabel = "Back to home",
}) {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F5F2E9]">
            <Navbar />

            <main className="max-w-3xl mx-auto px-6 py-24 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="w-full"
                >
                    {/* Icon badge */}
                    <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-[#A9782F]/10 border border-[#A9782F]/25 flex items-center justify-center">
                        <svg
                            width="26"
                            height="26"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            className="text-[#A9782F]"
                        >
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3.5 2" />
                        </svg>
                    </div>

                    <p className="text-[11px] font-medium tracking-[0.3em] text-[#4B5842] uppercase mb-2">
                        Basecamp
                    </p>

                    <h1 className="text-3xl md:text-4xl font-serif text-[#1B222C] mb-3">
                        {pageName} is on its way
                    </h1>

                    <p className="text-sm md:text-base text-[#6E6A5E] max-w-md mx-auto leading-relaxed mb-8">
                        {description ||
                            `We're still building out the ${pageName.toLowerCase()} section. Check back soon — it'll be ready before your next expedition.`}
                    </p>

                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-5 py-2.5 text-sm font-medium text-[#1B222C] border border-[#1B222C]/15 rounded-sm hover:border-[#A9782F] hover:text-[#A9782F] transition-colors"
                        >
                            Go back
                        </button>
                        <Link
                            to={backTo}
                            className="bg-[#1B222C] hover:bg-[#A9782F] text-[#F5F2E9] text-sm font-medium px-5 py-2.5 rounded-sm transition-colors"
                        >
                            {backLabel}
                        </Link>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}