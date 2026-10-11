function Extras({ extras }) {
    return (
        <div className="grid md:grid-cols-2 gap-10">

            {/* Inclusions */}
            <div>
                <h4 className="text-xl font-semibold text-white mb-4">
                    Included
                </h4>
                <ul className="space-y-2 text-gray-400">
                    {extras.inclusions.map((item, i) => (
                        <li key={i}>• {item}</li>
                    ))}
                </ul>
            </div>

            {/* Exclusions */}
            <div>
                <h4 className="text-xl font-semibold text-white mb-4">
                    Not Included
                </h4>
                <ul className="space-y-2 text-gray-400">
                    {extras.exclusions.map((item, i) => (
                        <li key={i}>• {item}</li>
                    ))}
                </ul>
            </div>

            {/* Notes */}
            {extras.custom_notes && (
                <div className="md:col-span-2 mt-6 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-2">
                        Important Notes
                    </h4>
                    <p className="text-gray-400">
                        {extras.custom_notes}
                    </p>
                </div>
            )}
        </div>
    );
}
export default Extras;