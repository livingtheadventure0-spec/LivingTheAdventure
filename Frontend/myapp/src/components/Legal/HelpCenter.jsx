import { useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronRight, FaChevronDown, FaChevronUp } from "react-icons/fa";

const FAQ_CATEGORIES = [
    {
        category: "Bookings",
        faqs: [
            {
                q: "How do I book an adventure?",
                a: "Browse adventures on our home page, click on an event, review the details and schedule, then click 'Book Now'. You'll be prompted to log in / create an account and complete payment via Razorpay.",
            },
            {
                q: "Is my booking confirmed immediately?",
                a: "Yes. Once your payment is processed successfully, you will receive a booking confirmation via email and SMS on your registered contact details.",
            },
            {
                q: "Can I book for a group?",
                a: "Yes. During the booking process you can specify the number of participants. Group discounts may apply for certain events — check the event listing.",
            },
            {
                q: "Do I need prior experience to join?",
                a: "It depends on the event. Each listing clearly mentions the fitness requirement, age requirement, and difficulty level. Choose one that matches your experience.",
            },
        ],
    },
    {
        category: "Payments",
        faqs: [
            {
                q: "What payment methods are accepted?",
                a: "We accept UPI, credit cards, debit cards, net banking, and wallets through our payment partner Razorpay.",
            },
            {
                q: "Is my payment information secure?",
                a: "Yes. Payments are processed by Razorpay, a PCI-DSS compliant payment gateway. We never store your card or banking details on our servers.",
            },
            {
                q: "My payment failed but money was deducted. What do I do?",
                a: "If your bank was debited but the booking wasn't confirmed, the amount is automatically refunded within 5–7 business days. If you don't receive it, contact us at living.the.adventure0@gmail.com.",
            },
            {
                q: "Will I get an invoice / receipt?",
                a: "Yes, a payment receipt is sent to your registered email address after a successful booking.",
            },
        ],
    },
    {
        category: "Cancellations & Refunds",
        faqs: [
            {
                q: "How do I cancel my booking?",
                a: "Contact us at living.the.adventure0@gmail.com with your booking reference number. Our team will process the cancellation as per our Refund Policy.",
            },
            {
                q: "How long does a refund take?",
                a: "Approved refunds are initiated within 3–5 business days. Depending on your bank, it may take an additional 3–5 days to reflect in your account.",
            },
            {
                q: "What if the event is cancelled by you?",
                a: "You receive a full refund or the option to reschedule to another batch — whichever you prefer.",
            },
        ],
    },
    {
        category: "Account & Profile",
        faqs: [
            {
                q: "How do I create an account?",
                a: "Click the profile icon in the sidebar and select 'Login'. We use OTP-based login — enter your phone number to receive a one-time password and get started.",
            },
            {
                q: "How do I update my profile details?",
                a: "Go to your Profile page and click 'Edit'. You can update your first name, last name, and email address.",
            },
            {
                q: "Why should I verify my email?",
                a: "A verified email allows us to send booking confirmations, important updates, and refund notifications reliably.",
            },
        ],
    },
    {
        category: "On the Day of the Event",
        faqs: [
            {
                q: "What should I bring?",
                a: "Each event listing includes a 'What to Bring' section in the itinerary. Always carry a government-issued photo ID.",
            },
            {
                q: "What if I'm late to the pickup point?",
                a: "Please inform the organizer immediately. Delays may not be possible to accommodate depending on the event logistics. No refund is provided for missed departures.",
            },
            {
                q: "Is there an age limit?",
                a: "Yes, each event specifies minimum and maximum age requirements. Participants outside the range need special approval from the organizers.",
            },
        ],
    },
];

function FAQItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-gray-800 rounded-lg overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-gray-200 hover:bg-white/[0.03] transition-colors cursor-pointer"
            >
                <span>{q}</span>
                {open ? <FaChevronUp className="text-gray-500 text-xs shrink-0 ml-4" /> : <FaChevronDown className="text-gray-500 text-xs shrink-0 ml-4" />}
            </button>
            {open && (
                <div className="px-5 pb-5 pt-1 text-sm text-gray-400 leading-relaxed border-t border-gray-800 bg-[#020617]/40">
                    {a}
                </div>
            )}
        </div>
    );
}

export default function HelpCenter() {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white">

            {/* Hero strip */}
            <div className="bg-black border-b border-gray-800 py-12 px-4 pl-20 sm:pl-24">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                        <Link to="/" className="hover:text-gray-300 transition-colors">Home</Link>
                        <FaChevronRight className="text-[10px]" />
                        <span className="text-gray-400">Help Center</span>
                    </div>
                    <h1 className="font-bebas text-4xl sm:text-5xl tracking-widest text-white uppercase">Help Center</h1>
                    <p className="mt-2 text-sm text-gray-400">Find answers to common questions about bookings, payments, and more.</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 pl-20 sm:pl-24 pr-6 sm:pr-8 py-12 pb-24 space-y-10">

                {/* Quick Links */}
                <div className="grid sm:grid-cols-3 gap-4">
                    {[
                        { label: "Contact Us", desc: "Reach our support team", href: "/contact-us" },
                        { label: "Refund Policy", desc: "Cancellation & refunds", href: "/refund-policy" },
                        { label: "Terms & Conditions", desc: "Rules of the platform", href: "/terms-conditions" },
                    ].map((link) => (
                        <Link
                            key={link.href}
                            to={link.href}
                            className="bg-[#1e293b] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors group"
                        >
                            <p className="text-sm font-semibold text-white group-hover:text-gray-100">{link.label}</p>
                            <p className="text-xs text-gray-500 mt-1">{link.desc}</p>
                        </Link>
                    ))}
                </div>

                {/* FAQ Sections */}
                {FAQ_CATEGORIES.map((cat) => (
                    <div key={cat.category}>
                        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-3">
                            <span className="h-px flex-1 bg-gray-800" />
                            {cat.category}
                            <span className="h-px flex-1 bg-gray-800" />
                        </h2>
                        <div className="space-y-2">
                            {cat.faqs.map((faq) => (
                                <FAQItem key={faq.q} q={faq.q} a={faq.a} />
                            ))}
                        </div>
                    </div>
                ))}

                {/* Still stuck */}
                <div className="bg-[#1e293b] border border-gray-800 rounded-xl p-8 text-center">
                    <p className="text-white font-semibold text-lg">Still need help?</p>
                    <p className="text-sm text-gray-400 mt-2 mb-5">Our support team is happy to assist you directly.</p>
                    <Link
                        to="/contact-us"
                        className="inline-block bg-white text-black rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-gray-200 transition-colors"
                    >
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
}
