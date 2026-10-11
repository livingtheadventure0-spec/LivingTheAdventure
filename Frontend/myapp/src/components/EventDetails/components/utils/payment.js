import axios from "axios";
import { apiUrl } from "../../../../api/config.js";
import { ApiError } from "../../../../api/errors.js";


export const createPaymentOrder = async ({
    event_id,
    schedule_id,
    pickup_uuid,
    number_of_people,
    token,
}) => {

    try {

        const response = await axios.post(
            apiUrl("/payments/create-order"),
            {
                event_id,
                schedule_id,
                pickup_uuid,
                number_of_people,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response.data;

    } catch (err) {

        const status =
            err?.response?.status;

        const detail =
            err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "";

        throw new ApiError(
            detail ||
            "Failed to create payment order",
            {
                status,
                detail,
            }
        );
    }
};


export const verifyPayment = async ({
    booking_id,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    token,
}) => {

    try {

        const response = await axios.post(
            apiUrl("/payments/verify"),
            {
                booking_id,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response.data;

    } catch (err) {

        const status =
            err?.response?.status;

        const detail =
            err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "";

        throw new ApiError(
            detail ||
            "Payment verification failed",
            {
                status,
                detail,
            }
        );
    }
};