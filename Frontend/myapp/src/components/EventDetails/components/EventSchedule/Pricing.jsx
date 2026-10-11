import { MdOutlineCurrencyRupee } from 'react-icons/md';
function Pricing({ pricing }) {
    return (
        <div className="
      p-8 rounded-3xl
      bg-neutral-900
      border border-white/10
      text-center
    ">
            <h3 className="text-2xl font-semibold text-white mb-4">
                Pricing Details
            </h3>

            <p className="text-gray-400 mb-6">
                Base price per person
            </p>

            <div className="text-4xl font-bold text-white flex justify-center items-center gap-1">
                <MdOutlineCurrencyRupee />
                {pricing.base_price_per_person}
            </div>

            <p className="text-gray-500 mt-3">
                Currency: {pricing.currency}
            </p>
        </div>
    );
}
export default Pricing;