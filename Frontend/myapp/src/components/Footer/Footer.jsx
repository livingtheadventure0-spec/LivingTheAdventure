import { Link } from "react-router-dom";
import {
    FaFacebookF,
    FaXTwitter,
    FaWhatsapp,
    FaPhone,
    FaLocationDot,
    FaArrowUpRightFromSquare,
} from "react-icons/fa6";

const PHONE_NUMBER = "+919307785807";
const DISPLAY_PHONE = "+91 93077 85807";
const WHATSAPP_URL = "https://wa.me/919307785807";

const ADDRESS =
    "Benkar Nagar, Dhayari, Pune, Khadewadi, Maharashtra 411041, India";

const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    ADDRESS
)}`;

const footerSections = [
    {
        title: "Company",
        links: [
            { label: "About Us", to: "/about" },
            { label: "Contact Us", to: "/contact-us" },
        ],
    },
    {
        title: "Legal",
        links: [
            { label: "Privacy Policy", to: "/privacy-policy" },
            { label: "Terms & Conditions", to: "/terms-conditions" },
            { label: "Refund Policy", to: "/refund-policy" },
        ],
    },
    {
        title: "Explore",
        links: [
            { label: "Help Center", to: "/help" },
            { label: "Share Feedback", to: "/contact-us" },
        ],
    },
];

const socialLinkClass =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-gray-300 transition-colors hover:border-white hover:bg-white hover:text-black";

const Footer = () => {
    return (
        <footer className="relative z-0 w-full min-w-0 border-t border-white/10 bg-black text-gray-400">
            <div className="mx-auto w-full max-w-7xl pl-16 pr-4 py-7 sm:pl-20 sm:pr-6 sm:py-9 lg:px-8 lg:py-10">

                {/* TOP ROW: Brand + Company + Legal + Explore */}
                <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-12 lg:gap-x-10">

                    {/* Brand */}
                    <section className="col-span-2 min-w-0 sm:col-span-3 lg:col-span-5">
                        <Link
                            to="/"
                            aria-label="Living The Adventure home"
                            className="inline-block text-lg font-bold leading-tight tracking-wide text-white sm:text-xl lg:text-2xl"
                        >
                            Living The Adventure
                        </Link>

                        <p className="mt-2 max-w-md text-xs leading-5 text-gray-400 sm:text-sm sm:leading-6">
                            Discover new places, create unforgettable memories,
                            and make every adventure count.
                        </p>

                        <div className="mt-4 flex items-center gap-2.5">
                            <a
                                href="https://www.facebook.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                                className={socialLinkClass}
                            >
                                <FaFacebookF aria-hidden="true" />
                            </a>

                            <a
                                href="https://x.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="X"
                                className={socialLinkClass}
                            >
                                <FaXTwitter aria-hidden="true" />
                            </a>

                            <a
                                href={WHATSAPP_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Chat with us on WhatsApp"
                                className={socialLinkClass}
                            >
                                <FaWhatsapp
                                    aria-hidden="true"
                                    className="text-base"
                                />
                            </a>
                        </div>
                    </section>

                    {/* Company, Legal and Explore */}
                    {footerSections.map((section) => (
                        <section
                            key={section.title}
                            className="min-w-0 lg:col-span-2"
                        >
                            <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-white sm:text-xs">
                                {section.title}
                            </h3>

                            <ul className="space-y-2.5">
                                {section.links.map((item) => (
                                    <li key={item.label}>
                                        <Link
                                            to={item.to}
                                            className="inline-block max-w-full break-words text-xs leading-5 text-gray-400 transition-colors hover:text-white sm:text-sm"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>

                {/* BOTTOM ROW: Contact and bookings */}
                <section className="mt-8 border-t border-white/10 pt-6 sm:mt-9 sm:pt-7">
                    <div className="mb-4">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white sm:text-sm">
                            Contact & Bookings
                        </h3>

                        <p className="mt-2 max-w-lg text-xs leading-5 text-gray-400 sm:text-sm sm:leading-6">
                            Need help or planning your next adventure? Contact
                            us directly for bookings and assistance.
                        </p>
                    </div>

                    {/* Three evenly sized contact cards on desktop */}
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">

                        {/* Phone */}
                        <a
                            href={`tel:${PHONE_NUMBER}`}
                            className="group flex min-w-0 items-center gap-3 rounded-lg border border-white/10 p-3 transition-colors hover:border-white/30 hover:bg-white/[0.03]"
                        >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10 text-white">
                                <FaPhone aria-hidden="true" className="text-xs" />
                            </span>

                            <span className="min-w-0">
                                <span className="block text-[11px] text-gray-500">
                                    Call us directly
                                </span>
                                <span className="mt-1 block break-words text-sm font-medium text-white">
                                    {DISPLAY_PHONE}
                                </span>
                            </span>
                        </a>

                        {/* WhatsApp */}
                        <a
                            href={WHATSAPP_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Message Living The Adventure on WhatsApp"
                            className="group flex min-w-0 items-center gap-3 rounded-lg border border-white/10 p-3 transition-colors hover:border-white/30 hover:bg-white/[0.03]"
                        >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10 text-white">
                                <FaWhatsapp
                                    aria-hidden="true"
                                    className="text-base"
                                />
                            </span>

                            <span className="min-w-0">
                                <span className="block text-[11px] text-gray-500">
                                    WhatsApp us
                                </span>
                                <span className="mt-1 block text-sm font-medium text-white">
                                    Chat for bookings
                                </span>
                            </span>
                        </a>

                        {/* Location */}
                        <a
                            href={MAPS_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex min-w-0 items-start gap-3 rounded-lg border border-white/10 p-3 transition-colors hover:border-white/30 hover:bg-white/[0.03] sm:col-span-2 lg:col-span-1"
                        >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10 text-white">
                                <FaLocationDot
                                    aria-hidden="true"
                                    className="text-xs"
                                />
                            </span>

                            <span className="min-w-0">
                                <span className="block text-[11px] text-gray-500">
                                    Our location
                                </span>

                                <span className="mt-1 block break-words text-xs leading-5 text-gray-300 sm:text-sm">
                                    {ADDRESS}
                                </span>

                                <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-white">
                                    Get directions
                                    <FaArrowUpRightFromSquare
                                        aria-hidden="true"
                                        className="text-[9px]"
                                    />
                                </span>
                            </span>
                        </a>
                    </div>
                </section>

                {/* Copyright */}
                <div className="mt-7 flex flex-col gap-2 border-t border-white/10 pt-4 text-center sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:text-left">
                    <p className="text-[10px] leading-5 text-gray-500 sm:text-xs">
                        © {new Date().getFullYear()} Living The Adventure.
                        All Rights Reserved.
                    </p>

                    <Link
                        to="/contact-us"
                        className="text-[10px] font-medium text-gray-400 transition-colors hover:text-white sm:text-xs"
                    >
                        We're here to help.
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;