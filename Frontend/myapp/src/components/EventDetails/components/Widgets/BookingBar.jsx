const BookingBar = ({ bookingInfo, isVisible }) => {
    if (!bookingInfo.price || !isVisible) return null;

    const totalPrice = bookingInfo.price * bookingInfo.travelers;

    return (
        <div className={`fixed bottom-0 left-0 right-0 bg-neutral-900/80 backdrop-blur-sm border-t border-neutral-800 p-4 z-50 transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="container mx-auto flex justify-between items-center">
                <div>
                    <p className="text-neutral-300 text-sm">Starting from</p>
                    <p className="text-white font-bold text-xl">{formatCurrency(totalPrice)} <span className="text-sm font-normal text-neutral-400">for {bookingInfo.travelers} traveler(s)</span></p>
                </div>
                <a href="#booking" className="bg-teal-500 text-black font-bold py-3 px-8 rounded-full text-lg hover:bg-teal-400 transition-colors">Book Now</a>
            </div>
        </div>
    )
}
export default BookingBar;