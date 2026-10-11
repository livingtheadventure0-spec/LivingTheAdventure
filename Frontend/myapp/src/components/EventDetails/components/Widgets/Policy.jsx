const Policy = ({ event }) => (
    <section className="py-20 bg-[#111111]">
        <div className="container mx-auto px-6 max-w-4xl">
            <h2 className="text-4xl font-bold text-center mb-12 text-white">Good to Know</h2>
            <div className="bg-neutral-900/50 p-8 rounded-2xl space-y-6 border border-neutral-800">
                <div>
                    <h4 className='font-bold flex items-center gap-2 mb-2 text-white text-xl'><FiShield /> Safety Guidelines</h4>
                    <p className="text-neutral-400 text-sm">{event.safety_guidelines_text}</p>
                </div>
                <div className="border-t border-neutral-700"></div>
                <div>
                    <h4 className='font-bold flex items-center gap-2 mb-2 text-white text-xl'><FiXCircle /> Cancellation Policy</h4>
                    <p className="text-neutral-400 text-sm">{event.cancellation_policy_text}</p>
                </div>
            </div>
        </div>
    </section>
);
export default Policy;