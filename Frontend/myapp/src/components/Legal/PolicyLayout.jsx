import { Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import Footer from "../Footer/Footer";
/**
 * Shared layout for all legal / info pages.
 * Props:
 *   title      – page heading
 *   subtitle   – small tagline under heading
 *   lastUpdated – e.g. "April 9, 2026"
 *   sections   – [{ id, heading, content: ReactNode }]
 */
export default function PolicyLayout({ title, subtitle, lastUpdated, sections = [] }) {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white">

            {/* ── Hero strip ── */}
            <div className="bg-black border-b border-gray-800 py-12 px-4 pl-20 sm:pl-24">
                <div className="max-w-5xl mx-auto">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                        <Link to="/" className="hover:text-gray-300 transition-colors">Home</Link>
                        <FaChevronRight className="text-[10px]" />
                        <span className="text-gray-400">{title}</span>
                    </div>
                    <h1 className="font-bebas text-4xl sm:text-5xl tracking-widest text-white uppercase">{title}</h1>
                    {subtitle && <p className="mt-2 text-sm text-gray-400">{subtitle}</p>}
                    {lastUpdated && (
                        <p className="mt-3 text-xs text-gray-600 uppercase tracking-wider">
                            Last updated: {lastUpdated}
                        </p>
                    )}
                </div>
            </div>

            {/* ── Body ── */}
            <div className="max-w-5xl mx-auto px-4 pl-20 sm:pl-24 pr-6 sm:pr-8 py-12 pb-24">
                <div className="flex flex-col lg:flex-row gap-10">

                    {/* Sidebar TOC */}
                    {sections.length > 1 && (
                        <aside className="lg:w-56 shrink-0">
                            <div className="lg:sticky lg:top-8 bg-[#1e293b] rounded-xl border border-gray-800 p-5">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Contents</p>
                                <nav className="space-y-1">
                                    {sections.map((s) => (
                                        <a
                                            key={s.id}
                                            href={`#${s.id}`}
                                            className="block text-sm text-gray-500 hover:text-gray-200 py-1 border-l-2 border-transparent hover:border-gray-500 pl-3 transition-all duration-150"
                                        >
                                            {s.heading}
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        </aside>
                    )}

                    {/* Main content */}
                    <div className="flex-1 min-w-0 space-y-10">
                        {sections.map((s) => (
                            <section key={s.id} id={s.id} className="scroll-mt-6">
                                <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-gray-800">
                                    {s.heading}
                                </h2>
                                <div className="text-sm text-gray-400 leading-relaxed space-y-3">
                                    {s.content}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
