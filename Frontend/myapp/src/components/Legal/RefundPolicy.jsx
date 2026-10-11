import PolicyLayout from "../Legal/PolicyLayout";

const EFFECTIVE = "April 9, 2026";

const sections = [
    {
        id: "overview",
        heading: "Overview",
        content: (
            <p>
                LivingTheAdventure strives to ensure a fair and transparent refund process. This Refund Policy
                outlines the conditions under which refunds are granted for bookings made on our platform.
                Refunds are processed back to the original payment source via Razorpay.
            </p>
        ),
    },
    {
        id: "user-cancellation",
        heading: "User-Initiated Cancellations",
        content: (
            <>
                <p>If you wish to cancel your booking, the following schedule applies based on how far in advance the cancellation is made relative to the event start date:</p>
                <div className="mt-4 rounded-xl overflow-hidden border border-gray-700">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[#1e293b] border-b border-gray-700">
                                <th className="text-left px-4 py-3 text-gray-300 font-semibold">Cancellation Period</th>
                                <th className="text-left px-4 py-3 text-gray-300 font-semibold">Refund Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            <tr className="bg-[#020617]/60">
                                <td className="px-4 py-3 text-gray-400">15 or more days before event</td>
                                <td className="px-4 py-3 text-green-400 font-medium">80% of booking amount</td>
                            </tr>
                            <tr className="bg-[#020617]/40">
                                <td className="px-4 py-3 text-gray-400">7–14 days before event</td>
                                <td className="px-4 py-3 text-yellow-400 font-medium">50% of booking amount</td>
                            </tr>
                            <tr className="bg-[#020617]/60">
                                <td className="px-4 py-3 text-gray-400">Less than 7 days before event</td>
                                <td className="px-4 py-3 text-red-400 font-medium">No refund</td>
                            </tr>
                            <tr className="bg-[#020617]/40">
                                <td className="px-4 py-3 text-gray-400">No-show on event day</td>
                                <td className="px-4 py-3 text-red-400 font-medium">No refund</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                    * Specific events may have different cancellation policies displayed at the time of booking.
                    Event-specific policies override the general schedule above.
                </p>
            </>
        ),
    },
    {
        id: "our-cancellation",
        heading: "Cancellation by LivingTheAdventure",
        content: (
            <>
                <p>If we or the event organizer cancels an event, you will receive:</p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>A <strong className="text-gray-300">full refund</strong> of the booking amount, OR</li>
                    <li>An option to reschedule to an upcoming batch of the same or similar event at no extra charge.</li>
                </ul>
                <p className="mt-2">
                    Notification of such cancellations will be communicated via email and/or SMS to the registered contact details.
                </p>
            </>
        ),
    },
    {
        id: "failed-payments",
        heading: "Failed & Duplicate Payments",
        content: (
            <>
                <p>
                    In the event of a payment failure where your bank or payment instrument has been debited
                    but the booking was not confirmed, the amount will be automatically refunded within
                    <strong className="text-gray-300"> 5–7 business days</strong> via Razorpay to your original payment method.
                </p>
                <p>
                    For duplicate charges (same booking charged more than once), please contact us immediately
                    at <a href="mailto:living.the.adventure0@gmail.com" className="text-gray-300 underline hover:text-white">living.the.adventure0@gmail.com</a>.
                    Duplicate charges are refunded within 5–7 business days after verification.
                </p>
            </>
        ),
    },
    {
        id: "refund-process",
        heading: "Refund Process & Timeline",
        content: (
            <>
                <p>
                    To request a cancellation and refund, please contact us at{" "}
                    <a href="mailto:living.the.adventure0@gmail.com" className="text-gray-300 underline hover:text-white">living.the.adventure0@gmail.com</a>{" "}
                    with your booking reference number.
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>Approved refunds are initiated within <strong className="text-gray-300">3–5 business days</strong> of cancellation approval.</li>
                    <li>Funds are transferred to your original payment source (bank account, card, wallet) via Razorpay.</li>
                    <li>Credit card refunds may take an additional 3–5 business days to reflect depending on your bank.</li>
                    <li>UPI and wallet refunds typically reflect within 1–3 business days.</li>
                </ul>
            </>
        ),
    },
    {
        id: "non-refundable",
        heading: "Non-Refundable Items",
        content: (
            <ul className="list-disc pl-5 space-y-2">
                <li>Convenience fees or platform service charges (if any) are non-refundable.</li>
                <li>Add-on services separately purchased (e.g., travel insurance, merchandise) are non-refundable unless otherwise stated.</li>
                <li>Bookings for special events or limited-capacity programs may have stricter cancellation terms explicitly noted during checkout.</li>
            </ul>
        ),
    },
    {
        id: "disputes",
        heading: "Disputes & Escalations",
        content: (
            <>
                <p>
                    If you believe a refund has been incorrectly processed or denied, please write to us at{" "}
                    <a href="mailto:living.the.adventure0@gmail.com" className="text-gray-300 underline hover:text-white">living.the.adventure0@gmail.com</a>{" "}
                    with full details. We aim to resolve all disputes within 7 business days.
                </p>
                <p>
                    If unresolved, disputes may be escalated to the Razorpay grievance team or relevant consumer
                    protection forums as applicable under Indian law.
                </p>
            </>
        ),
    },
    {
        id: "contact",
        heading: "Contact",
        content: (
            <>
                <p>For any refund or cancellation queries:</p>
                <ul className="list-none space-y-1 mt-2">
                    <li>📧 <a href="mailto:living.the.adventure0@gmail.com" className="text-gray-300 hover:text-white underline">living.the.adventure0@gmail.com</a></li>
                    <li>⏰ Mon–Sat, 9 AM – 6 PM IST</li>
                </ul>
            </>
        ),
    },
];

export default function RefundPolicy() {
    return (
        <PolicyLayout
            title="Refund Policy"
            subtitle="Cancellation and refund terms for all bookings on LivingTheAdventure"
            lastUpdated={EFFECTIVE}
            sections={sections}
        />
    );
}
