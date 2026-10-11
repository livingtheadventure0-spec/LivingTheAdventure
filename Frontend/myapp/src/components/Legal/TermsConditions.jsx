import PolicyLayout from "../Legal/PolicyLayout";

const EFFECTIVE = "April 9, 2026";

const sections = [
    {
        id: "intro",
        heading: "Introduction",
        content: (
            <p>
                These Terms and Conditions ("Terms") govern your use of the LivingTheAdventure platform and
                the booking of adventure services offered through it. By accessing our website or making a
                booking, you agree to be bound by these Terms. Please read them carefully.
            </p>
        ),
    },
    {
        id: "eligibility",
        heading: "Eligibility",
        content: (
            <ul className="list-disc pl-5 space-y-2">
                <li>You must be at least 18 years of age to create an account and make bookings.</li>
                <li>Participants under 18 may join events only with verifiable guardian consent as required by the event organizer.</li>
                <li>You must provide accurate, current, and complete information during registration and booking.</li>
            </ul>
        ),
    },
    {
        id: "bookings",
        heading: "Bookings & Payments",
        content: (
            <>
                <p>
                    All bookings are subject to availability. A booking is confirmed only upon successful
                    payment. Prices displayed are inclusive of applicable GST unless stated otherwise.
                </p>
                <p>
                    Payments are processed securely by <strong className="text-gray-300">Razorpay Software Private Limited</strong>.
                    By proceeding with payment, you also agree to Razorpay's{" "}
                    <a href="https://razorpay.com/terms/" target="_blank" rel="noopener noreferrer" className="text-gray-300 underline hover:text-white">
                        Terms of Service
                    </a>.
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>Accepted payment methods include UPI, credit/debit cards, net banking, and wallets as offered by Razorpay.</li>
                    <li>LivingTheAdventure does not store payment card information.</li>
                    <li>Failed transactions will not be charged. If an amount is debited for a failed booking, it will be refunded as per our Refund Policy.</li>
                </ul>
            </>
        ),
    },
    {
        id: "cancellation",
        heading: "Cancellation by User",
        content: (
            <>
                <p>
                    Cancellations made by users are subject to the cancellation policy of the respective event.
                    The applicable cancellation schedule will be displayed at the time of booking.
                    In general:
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>Cancellations made <strong className="text-gray-300">15+ days</strong> before event start: Up to 80% refund.</li>
                    <li>Cancellations made <strong className="text-gray-300">7–14 days</strong> before: Up to 50% refund.</li>
                    <li>Cancellations made <strong className="text-gray-300">less than 7 days</strong> before: No refund.</li>
                </ul>
                <p className="mt-2">Please refer to our <a href="/refund-policy" className="text-gray-300 underline hover:text-white">Refund Policy</a> for full details.</p>
            </>
        ),
    },
    {
        id: "cancellation-by-us",
        heading: "Cancellation by LivingTheAdventure",
        content: (
            <p>
                We reserve the right to cancel or reschedule events due to safety concerns, adverse weather,
                insufficient participation, or force majeure events. In such cases, users will receive a
                full refund or the option to reschedule without additional charges.
            </p>
        ),
    },
    {
        id: "conduct",
        heading: "User Conduct",
        content: (
            <ul className="list-disc pl-5 space-y-2">
                <li>You must comply with all instructions from event organizers and guides.</li>
                <li>You must not misrepresent your fitness level, age, or any other relevant information.</li>
                <li>Participants engaging in misconduct may be removed from the event without refund.</li>
                <li>You must not use our platform for any fraudulent, illegal, or harmful activities.</li>
            </ul>
        ),
    },
    {
        id: "liability",
        heading: "Liability & Disclaimer",
        content: (
            <>
                <p>
                    Adventure activities involve inherent risks including personal injury, illness, or death.
                    By booking an event, you acknowledge and accept these risks voluntarily.
                </p>
                <p>
                    LivingTheAdventure acts as an intermediary platform. We are not directly liable for
                    actions or omissions of event organizers, guides, or third-party service providers.
                    Our total liability to you shall not exceed the amount paid for the specific booking
                    giving rise to the claim.
                </p>
            </>
        ),
    },
    {
        id: "ip",
        heading: "Intellectual Property",
        content: (
            <p>
                All content on this platform including text, images, logos, and software is the property of
                LivingTheAdventure or its licensors. You may not reproduce, distribute, or create derivative
                works without our express written consent.
            </p>
        ),
    },
    {
        id: "governing-law",
        heading: "Governing Law",
        content: (
            <p>
                These Terms are governed by the laws of India. Any disputes arising from or relating to
                these Terms shall be subject to the exclusive jurisdiction of competent courts in India.
                Disputes shall first be attempted to be resolved through good faith negotiation.
            </p>
        ),
    },
    {
        id: "changes",
        heading: "Changes to These Terms",
        content: (
            <p>
                We may update these Terms from time to time. We will notify you by updating the effective date
                at the top of this page. Continued use of our platform after changes constitutes your
                acceptance of the revised Terms.
            </p>
        ),
    },
    {
        id: "contact",
        heading: "Contact",
        content: (
            <>
                <p>Questions about these Terms? Reach us at:</p>
                <ul className="list-none space-y-1 mt-2">
                    <li>📧 <a href="mailto:living.the.adventure0@gmail.com" className="text-gray-300 hover:text-white underline">living.the.adventure0@gmail.com</a></li>
                </ul>
            </>
        ),
    },
];

export default function TermsConditions() {
    return (
        <PolicyLayout
            title="Terms & Conditions"
            subtitle="Please read these terms carefully before using our platform"
            lastUpdated={EFFECTIVE}
            sections={sections}
        />
    );
}
