const EventSchedule = ({ schedule, onBookingUpdate }) => {
    const [selectedPickup, setSelectedPickup] = useState(null);
    const [numTravelers, setNumTravelers] = useState(1);

    useEffect(() => {
        if (schedule?.schedule_data?.pickups?.length > 0) {
            setSelectedPickup(schedule.schedule_data.pickups[0]);
        }
    }, [schedule]);

    useEffect(() => {
        if (selectedPickup) {
            onBookingUpdate({
                price: selectedPickup.price_per_person,
                travelers: numTravelers,
            });
        }
    }, [selectedPickup, numTravelers, onBookingUpdate]);

    if (!schedule) {
        return (
            <section className="py-20 bg-[#111111]" id="booking">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-4 text-white">Booking Not Available</h2>
                    <p className="text-neutral-400">There are no upcoming schedules for this event. Please check back later!</p>
                </div>
            </section>
        )
    }

    const { basic_details, extra_options, capacity_pricing, pickups } = schedule.schedule_data;

    const totalPrice = selectedPickup ? selectedPickup.price_per_person * numTravelers : 0;
    const seatsLeft = capacity_pricing.seats_available;

    return (
        <section className="py-20 bg-[#111111]" id="booking">
            <div className="container mx-auto px-6">
                <h2 className="text-4xl font-bold text-center mb-12 text-white">Schedule & Booking</h2>
                <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-8">

                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-2xl font-bold text-white mb-4">Trip Information</h3>
                        <InfoDetail icon={<FiCalendar />} label="Event Dates" value={`${new Date(basic_details.start_datetime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} to ${new Date(basic_details.end_datetime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`} />
                        <InfoDetail icon={<FiUsers />} label="Capacity" value={<span className={seatsLeft < 10 ? 'text-orange-400' : 'text-green-400'}>{`${seatsLeft} seats left`}</span>} />
                        {extra_options.custom_notes && (
                            <div className="pt-2 flex items-start gap-3 bg-neutral-900/50 p-4 rounded-lg border border-neutral-800">
                                <FiInfo className="text-teal-400 mt-1 flex-shrink-0" />
                                <p className="text-sm text-neutral-300">{extra_options.custom_notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-3 bg-neutral-900/50 p-8 rounded-2xl border border-neutral-800">
                        {selectedPickup && <>
                            <h3 className="text-2xl font-bold text-white mb-6">Select Your Pickup Point</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pickups.map(p => (
                                    <button key={p.pickup_uuid} onClick={() => setSelectedPickup(p)} className={`p-4 rounded-lg text-left transition-all duration-200 border-2 ${selectedPickup.pickup_uuid === p.pickup_uuid ? 'bg-teal-500/10 border-teal-500' : 'bg-neutral-800 border-neutral-700 hover:border-neutral-600'}`}>
                                        <p className="font-bold text-white">{p.pickup_point}, {p.city_name}</p>
                                        <p className="text-sm text-neutral-300">{new Date(p.pickup_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        <p className="text-lg font-bold text-teal-300 mt-2">{formatCurrency(p.price_per_person)} <span className="text-xs font-normal text-neutral-400">/ person</span></p>
                                    </button>
                                ))}
                            </div>

                            <DiscountInfo discounts={selectedPickup.discounts} />

                            <div className="flex items-center justify-between mt-8 mb-8">
                                <label className="font-semibold text-white">How many travelers?</label>
                                <div className="flex items-center gap-4 bg-neutral-800 rounded-full p-1 border border-neutral-700">
                                    <button onClick={() => setNumTravelers(n => Math.max(1, n - 1))} className="w-8 h-8 rounded-full bg-neutral-700 hover:bg-neutral-600 text-white font-bold">-</button>
                                    <span className="font-bold text-lg w-8 text-center">{numTravelers}</span>
                                    <button onClick={() => setNumTravelers(n => Math.min(seatsLeft, n + 1))} className="w-8 h-8 rounded-full bg-neutral-700 hover:bg-neutral-600 text-white font-bold">+</button>
                                </div>
                            </div>

                            <div className="bg-black/20 p-6 rounded-lg border border-neutral-800">
                                <div className="flex justify-between items-center text-neutral-300 mb-4">
                                    <span>{formatCurrency(selectedPickup.price_per_person)} x {numTravelers} Traveler(s)</span>
                                    <span>{formatCurrency(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between items-center text-white font-bold text-2xl border-t border-neutral-700 pt-4">
                                    <span>Total Price</span>
                                    <span>{formatCurrency(totalPrice)}</span>
                                </div>
                            </div>

                            <button className="w-full mt-8 bg-teal-500 text-black font-bold py-4 rounded-full text-lg hover:bg-teal-400 transition-all duration-300 transform hover:scale-105">Book Your Spot</button>
                        </>}
                    </div>
                </div>
            </div>
        </section>
    );
};
export default EventSchedule;