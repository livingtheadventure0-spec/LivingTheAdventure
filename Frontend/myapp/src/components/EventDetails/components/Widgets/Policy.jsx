import { FiBackpack, FiShield, FiXCircle } from "react-icons/fi";

function PolicySection({ title, icon: Icon, children }) {
    if (!children || (typeof children === "string" && !children.trim())) return null;
    return (
        <div>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white sm:text-xl">
                <Icon aria-hidden="true" className="shrink-0 text-neutral-300" />
                {title}
            </h3>
            <p className="whitespace-pre-line break-words text-sm leading-7 text-neutral-300 sm:text-base">{children}</p>
        </div>
    );
}

export default function Policy({ event }) {
    const hasContent = event?.things_to_carry_text || event?.safety_guidelines_text || event?.cancellation_policy_text;
    if (!hasContent) return null;

    return (
        <section className="bg-[#111111] py-14 sm:py-20">
            <div className="container mx-auto max-w-4xl px-4 sm:px-6">
                <h2 className="mb-8 text-center text-2xl font-bold text-white sm:mb-12 sm:text-4xl">Things to Know Before You Go</h2>
                <div className="space-y-8 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 sm:p-8">
                    <PolicySection title="Things to Carry" icon={FiBackpack}>{event.things_to_carry_text}</PolicySection>
                    {event.things_to_carry_text && (event.safety_guidelines_text || event.cancellation_policy_text) && <div className="border-t border-neutral-700" />}
                    <PolicySection title="Safety Guidelines" icon={FiShield}>{event.safety_guidelines_text}</PolicySection>
                    {event.safety_guidelines_text && event.cancellation_policy_text && <div className="border-t border-neutral-700" />}
                    <PolicySection title="Cancellation Policy" icon={FiXCircle}>{event.cancellation_policy_text}</PolicySection>
                </div>
            </div>
        </section>
    );
}
