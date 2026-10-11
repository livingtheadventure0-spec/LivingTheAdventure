// utils/pricing.js

export const calculateDiscount = ({
    pickup,
    numberOfPeople,
}) => {

    if (!pickup || !numberOfPeople) {
        return {
            subtotal: 0,
            discountAmount: 0,
            finalAmount: 0,
            discount: null,
        };
    }


    const pricePerPerson =
        Number(pickup.price_per_person) || 0;


    const subtotal =
        pricePerPerson * numberOfPeople;


    const discounts =
        Array.isArray(pickup.discounts)
            ? pickup.discounts
            : [];


    const eligibleDiscounts =
        discounts.filter(
            (discount) =>
                numberOfPeople >=
                Number(discount.min_group_size || 0)
        );


    if (!eligibleDiscounts.length) {

        return {
            subtotal,
            discountAmount: 0,
            finalAmount: subtotal,
            discount: null,
        };
    }


    let bestDiscount = null;


    for (const discount of eligibleDiscounts) {

        let discountAmount = 0;


        if (discount.type === "percentage") {

            discountAmount =
                subtotal *
                (Number(discount.value) / 100);

        } else if (discount.type === "fixed") {

            if (
                discount.scope ===
                "per_person"
            ) {

                discountAmount =
                    Number(discount.value) *
                    numberOfPeople;

            } else {

                discountAmount =
                    Number(discount.value);
            }
        }


        discountAmount =
            Math.min(
                discountAmount,
                subtotal
            );


        if (
            !bestDiscount ||
            discountAmount >
            bestDiscount.discountAmount
        ) {

            bestDiscount = {
                ...discount,
                discountAmount,
            };
        }
    }


    const discountAmount =
        bestDiscount?.discountAmount || 0;


    return {

        subtotal,

        discountAmount,

        finalAmount:
            subtotal - discountAmount,

        discount: bestDiscount,
    };
};