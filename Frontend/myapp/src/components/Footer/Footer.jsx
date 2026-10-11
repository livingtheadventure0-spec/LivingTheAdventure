import { Link } from "react-router-dom";
import { FaFacebookF, FaXTwitter } from "react-icons/fa6";

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
        title: "View Website in",
        links: [{ label: "English", to: null }],
    },
    {
        title: "Need Help?",
        links: [
            { label: "Visit Help Center", to: "/help" },
            { label: "Share Feedback", to: "/contact-us" },
        ],
    },
];

const Footer = () => {
    return (
        <footer className="w-full border-t border-gray-800 bg-black py-8 pl-16 pr-4 text-gray-400 sm:py-10 sm:pl-20 sm:pr-8 lg:px-12">
            <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-x-5 gap-y-8 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-5 lg:gap-10">
                {footerSections.map((section) => (
                    <section key={section.title} className="min-w-0">
                        <h3 className="mb-3 text-sm font-semibold leading-snug text-white sm:text-base lg:text-lg">
                            {section.title}
                        </h3>
                        <ul className="space-y-2">
                            {section.links.map((item) => (
                                <li key={item.label}>
                                    {item.to ? (
                                        <Link
                                            to={item.to}
                                            className="inline-block break-words text-xs leading-relaxed transition-colors hover:text-white sm:text-sm lg:text-base"
                                        >
                                            {item.label}
                                        </Link>
                                    ) : (
                                        <span className="text-xs text-gray-300 sm:text-sm lg:text-base">
                                            {item.label}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}

                <section className="min-w-0">
                    <h3 className="mb-3 text-sm font-semibold leading-snug text-white sm:text-base lg:text-lg">
                        Connect with Us
                    </h3>
                    <div className="mt-3 flex items-center gap-5">
                        <a
                            href="https://www.facebook.com/"
                            aria-label="Facebook"
                            target="_blank"
                            rel="noreferrer"
                            className="text-xl transition-colors hover:text-white"
                        >
                            <FaFacebookF aria-hidden="true" />
                        </a>
                        <a
                            href="https://x.com/"
                            aria-label="X"
                            target="_blank"
                            rel="noreferrer"
                            className="text-xl transition-colors hover:text-white"
                        >
                            <FaXTwitter aria-hidden="true" />
                        </a>
                    </div>
                </section>
            </div>

            <div className="mx-auto mt-8 max-w-7xl border-t border-gray-800 pt-4 text-center text-xs leading-relaxed text-gray-500 sm:mt-10 sm:pt-5 sm:text-sm">
                <p>© {new Date().getFullYear()} LivingTheAdventure. All Rights Reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
