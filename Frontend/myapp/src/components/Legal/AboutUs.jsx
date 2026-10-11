import PolicyLayout from "../Legal/PolicyLayout";

const sections = [
    {
        id: "overview",
        heading: "Overview",
        content: (
            <>
                <p>
                    LivingTheAdventure is India's premier platform for curated outdoor adventures — treks,
                    trips, peak expeditions, adventure activities, and more. We connect adventure seekers
                    with hand-picked experiences across the most breathtaking landscapes in India and beyond.
                </p>
                <p>
                    We believe that the mountains teach patience, rivers teach resilience, and every trail
                    has a story. Our mission is to make those stories accessible to everyone.
                </p>
            </>
        ),
    },
    {
        id: "mission",
        heading: "Our Mission",
        content: (
            <>
                <p>
                    Our mission is simple: make responsible, safe, and unforgettable adventure experiences
                    accessible to every person who has ever looked at a mountain and thought "I want to be
                    up there."
                </p>
                <p>
                    We do this by partnering with certified guides and organizers, enforcing strict safety
                    standards, and providing transparent pricing with no hidden fees.
                </p>
            </>
        ),
    },
    {
        id: "what-we-offer",
        heading: "What We Offer",
        content: (
            <ul className="list-disc pl-5 space-y-2">
                <li><span className="text-gray-200 font-medium">Treks</span> — Day hikes to multi-day Himalayan expeditions</li>
                <li><span className="text-gray-200 font-medium">Trips</span> — Guided group and private travel experiences</li>
                <li><span className="text-gray-200 font-medium">Adventure Activities</span> — Paragliding, river rafting, rock climbing, and more</li>
                <li><span className="text-gray-200 font-medium">Peak Expeditions</span> — Technical climbs and summit challenges</li>
                <li><span className="text-gray-200 font-medium">Park & Wilderness Programs</span> — Eco-tourism and conservation experiences</li>
            </ul>
        ),
    },
    {
        id: "safety",
        heading: "Safety & Standards",
        content: (
            <>
                <p>
                    Every adventure listed on our platform undergoes a thorough vetting process. All
                    organizers are required to meet our safety standards including certified guides,
                    proper equipment, emergency protocols, and adequate insurance coverage.
                </p>
                <p>
                    Participant safety is our highest priority. We conduct regular audits, gather feedback,
                    and remove operators that do not meet our standards.
                </p>
            </>
        ),
    },
    {
        id: "contact",
        heading: "Get in Touch",
        content: (
            <>
                <p>Have questions or want to partner with us?</p>
                <ul className="list-none space-y-1 mt-2">
                    <li>📧 <a href="mailto:living.the.adventure0@gmail.com" className="text-gray-300 hover:text-white underline">living.the.adventure0@gmail.com</a></li>
                    <li>🌐 <a href="/" className="text-gray-300 hover:text-white underline">www.livingtheadventure.in</a></li>
                </ul>
            </>
        ),
    },
];

export default function AboutUs() {
    return (
        <PolicyLayout
            title="About Us"
            subtitle="Who we are and what drives us"
            sections={sections}
        />
    );
}
