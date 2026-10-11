import { FiCheck, FiX } from 'react-icons/fi';
const InclusionsExclusions = ({ event }) => {
    // API provides a parsed array directly
    const included = event.included_services || [];
    const excluded = event.excluded_services || [];
    return (
        <section className="py-20 bg-[#111111]">
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12">
                <div className="bg-neutral-900/50 p-8 rounded-2xl border border-neutral-800">
                    <h3 className="text-3xl font-bold mb-6 text-white">What's Included</h3>
                    <ul className="space-y-3">
                        {included.map((item, i) => <li key={i} className="flex items-center gap-3 text-neutral-300"><FiCheck className="text-green-500 flex-shrink-0" /> {item}</li>)}
                    </ul>
                </div>
                <div className="bg-neutral-900/50 p-8 rounded-2xl border border-neutral-800">
                    <h3 className="text-3xl font-bold mb-6 text-white">What's Not Included</h3>
                    <ul className="space-y-3">
                        {excluded.map((item, i) => <li key={i} className="flex items-center gap-3 text-neutral-300"><FiX className="text-red-500 flex-shrink-0" /> {item}</li>)}
                    </ul>
                </div>
            </div>
        </section>
    );
};
export default InclusionsExclusions;