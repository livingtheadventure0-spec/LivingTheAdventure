import PolicyLayout from "./PolicyLayout";

const EFFECTIVE = "April 9, 2026";

const sections = [
    {
        id: "intro",
        heading: "Introduction",
        content: (
            <>
                <p>
                    LivingTheAdventure ("we", "us", or "our") is committed to protecting your personal information.
                    This Privacy Policy explains how we collect, use, store, and share your data when you use our
                    website and services, including payments processed via Razorpay.
                </p>
                <p>
                    By accessing or using our platform, you agree to the practices described in this policy.
                    If you do not agree, please discontinue use of our services.
                </p>
            </>
        ),
    },
    {
        id: "data-collected",
        heading: "Information We Collect",
        content: (
            <>
                <p>We collect the following categories of information:</p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li><span className="text-gray-200 font-medium">Identity & Contact:</span> First name, last name, phone number, email address.</li>
                    <li><span className="text-gray-200 font-medium">Account Data:</span> Login credentials, profile information, preferences.</li>
                    <li><span className="text-gray-200 font-medium">Transaction Data:</span> Booking details, payment amounts, and order history. Payment card details are <strong className="text-gray-300">never stored</strong> on our servers — they are processed securely by Razorpay.</li>
                    <li><span className="text-gray-200 font-medium">Technical Data:</span> IP address, browser type, device identifiers, and usage logs via cookies and analytics tools.</li>
                    <li><span className="text-gray-200 font-medium">Communications:</span> Messages you send us via contact forms or email.</li>
                </ul>
            </>
        ),
    },
    {
        id: "how-we-use",
        heading: "How We Use Your Information",
        content: (
            <ul className="list-disc pl-5 space-y-2">
                <li>To process bookings and facilitate payments via Razorpay.</li>
                <li>To create and manage your account.</li>
                <li>To send booking confirmations, updates, and support communications.</li>
                <li>To personalise your experience and show relevant adventures.</li>
                <li>To comply with legal obligations and resolve disputes.</li>
                <li>To improve our platform through analytics and feedback.</li>
            </ul>
        ),
    },
    {
        id: "payment-processing",
        heading: "Payment Processing (Razorpay)",
        content: (
            <>
                <p>
                    All online payments on our platform are processed by <strong className="text-gray-300">Razorpay Software Private Limited</strong>,
                    a PCI-DSS compliant payment gateway. When you make a payment, you are redirected to or interact
                    with Razorpay's secure payment interface.
                </p>
                <p>
                    We do <strong className="text-gray-300">not</strong> store your card number, CVV, UPI PIN, or net banking credentials.
                    Razorpay's handling of your payment data is governed by their own{" "}
                    <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-gray-300 underline hover:text-white">
                        Privacy Policy
                    </a>.
                </p>
            </>
        ),
    },
    {
        id: "data-sharing",
        heading: "Sharing Your Information",
        content: (
            <>
                <p>We do not sell your personal data. We may share it with:</p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li><span className="text-gray-200 font-medium">Event Organizers:</span> Your name and contact details shared to facilitate your booked adventure.</li>
                    <li><span className="text-gray-200 font-medium">Payment Partners:</span> Razorpay, for processing transactions.</li>
                    <li><span className="text-gray-200 font-medium">Service Providers:</span> Analytics, cloud hosting, and email services under strict confidentiality agreements.</li>
                    <li><span className="text-gray-200 font-medium">Legal Authorities:</span> When required by law, court order, or to protect legal rights.</li>
                </ul>
            </>
        ),
    },
    {
        id: "cookies",
        heading: "Cookies & Tracking",
        content: (
            <>
                <p>
                    We use cookies and similar technologies to keep you logged in, remember preferences,
                    and analyse site traffic. You can disable cookies in your browser settings, but some
                    features may not work correctly.
                </p>
                <p>Types of cookies used: Essential, Analytics (e.g., Google Analytics), and Preferences.</p>
            </>
        ),
    },
    {
        id: "data-retention",
        heading: "Data Retention",
        content: (
            <p>
                We retain your personal data for as long as your account is active or as needed to provide
                services. Transaction records are retained for a minimum of 7 years as required by Indian
                financial regulations. You may request deletion of your account data by contacting us, subject
                to legal retention requirements.
            </p>
        ),
    },
    {
        id: "your-rights",
        heading: "Your Rights",
        content: (
            <ul className="list-disc pl-5 space-y-2">
                <li>Access the personal data we hold about you.</li>
                <li>Request correction of inaccurate data.</li>
                <li>Request deletion of your data (subject to legal obligations).</li>
                <li>Withdraw consent for marketing communications at any time.</li>
                <li>Lodge a complaint with the relevant data protection authority.</li>
            </ul>
        ),
    },
    {
        id: "security",
        heading: "Security",
        content: (
            <p>
                We implement industry-standard security measures including HTTPS encryption, secure token-based
                authentication, and regular security audits. However, no method of transmission over the internet
                is 100% secure. We encourage you to use strong, unique passwords and keep your account details confidential.
            </p>
        ),
    },
    {
        id: "changes",
        heading: "Changes to This Policy",
        content: (
            <p>
                We may update this Privacy Policy from time to time. We will notify you of material changes by
                posting the updated policy on this page with a revised effective date. Continued use of our
                platform after changes constitutes your acceptance of the updated policy.
            </p>
        ),
    },
    {
        id: "contact",
        heading: "Contact Us",
        content: (
            <>
                <p>For privacy-related questions or requests, please contact us at:</p>
                <ul className="list-none space-y-1 mt-2">
                    <li>📧 <a href="mailto:living.the.adventure0@gmail.com" className="text-gray-300 hover:text-white underline">living.the.adventure0@gmail.com</a></li>
                </ul>
            </>
        ),
    },
];

export default function PrivacyPolicyPage() {
    return (
        <PolicyLayout
            title="Privacy Policy"
            subtitle="How we collect, use, and protect your personal information"
            lastUpdated={EFFECTIVE}
            sections={sections}
        />
    );
}
