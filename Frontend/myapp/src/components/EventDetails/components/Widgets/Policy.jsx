import { FiPackage, FiShield, FiXCircle } from "react-icons/fi";

const policySections = [
    {
        key: "things_to_carry_text",
        title: "Things to Carry",
        description: "Pack the essentials for a comfortable trip.",
        icon: FiPackage,
    },
    {
        key: "safety_guidelines_text",
        title: "Safety Guidelines",
        description: "Keep these important safety notes in mind.",
        icon: FiShield,
    },
    {
        key: "cancellation_policy_text",
        title: "Cancellation Policy",
        description: "Review the terms before confirming your booking.",
        icon: FiXCircle,
    },
];

function PolicyCard({ title, description, icon: Icon, children }) {
    if (!children || (typeof children === "string" && !children.trim())) {
        return null;
    }

    return (
        <article className="group h-full rounded-2xl border border-white/10 bg-neutral-900/70 p-5 transition-colors duration-200 hover:border-white/20 hover:bg-neutral-900 sm:p-6">
            <div className="mb-5 flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-white">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-base font-semibold text-white sm:text-lg">{title}</h3>
                    <p className="mt-1 text-xs leading-5 text-neutral-400 sm:text-sm">{description}</p>
                </div>
            </div>
            <div className="whitespace-pre-line break-words text-sm leading-7 text-neutral-300 sm:text-[15px]">
                {children}
            </div>
        </article>
    );
}

export default function Policy({ event }) {
    const visibleSections = policySections.filter(({ key }) => {
        const value = event?.[key];
        return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
    });

    if (!visibleSections.length) return null;

    return (
        <section className="border-t border-white/[0.06] bg-[#0a0a0a] py-14 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-12">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
                        Before you book
                    </p>
                    <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
                        Good to know
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-neutral-400 sm:text-base">
                        A few important details to help you prepare and book with confidence.
                    </p>
                </div>

                <div className={`grid grid-cols-1 items-stretch gap-4 md:gap-5 ${visibleSections.length > 1 ? "md:grid-cols-2" : ""} ${visibleSections.length === 3 ? "xl:grid-cols-3" : ""}`}>
                    {visibleSections.map(({ key, title, description, icon }) => (
                        <PolicyCard
                            key={key}
                            title={title}
                            description={description}
                            icon={icon}
                        >
                            {event[key]}
                        </PolicyCard>
                    ))}
                </div>
            </div>
        </section>
    );
}
