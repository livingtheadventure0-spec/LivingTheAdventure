function PaymentButton({
    onClick,
    loading,
    ready,
    disabled,
}) {

    const isDisabled =
        disabled ||
        loading ||
        !ready;


    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isDisabled}
            className="
                w-full
                md:w-auto
                px-8
                py-4
                rounded-xl
                bg-white
                text-black
                font-semibold
                transition
                hover:bg-gray-200
                disabled:opacity-50
                disabled:cursor-not-allowed
            "
        >

            {loading
                ? "Processing..."
                : !ready
                    ? "Loading Payment..."
                    : "Proceed to Payment"
            }

        </button>
    );
}

export default PaymentButton;