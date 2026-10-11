import { useEffect, useState } from "react";

import {
    createPaymentOrder,
    verifyPayment,
} from "../components/utils/payment.js";


function usePayment({
    user,
    event,
    schedule,
    selectedPickup,
    numberOfPeople,
    navigate,
}) {

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState(null);

    const [razorpayReady, setRazorpayReady] =
        useState(false);


    // =====================================================
    // LOAD RAZORPAY
    // =====================================================

    useEffect(() => {

        if (window.Razorpay) {

            setRazorpayReady(true);

            return;
        }


        const existing =
            document.querySelector(
                'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
            );


        if (existing) {

            existing.addEventListener(
                "load",
                () => setRazorpayReady(true)
            );

            return;
        }


        const script =
            document.createElement("script");


        script.src =
            "https://checkout.razorpay.com/v1/checkout.js";

        script.async = true;


        script.onload = () => {
            setRazorpayReady(true);
        };


        script.onerror = () => {

            setError(
                "Unable to load Razorpay."
            );
        };


        document.body.appendChild(
            script
        );

    }, []);


    // =====================================================
    // PAYMENT
    // =====================================================

    const handlePayment = async () => {

        setError(null);


        // -------------------------------------------------
        // LOGIN
        // -------------------------------------------------

        if (!user) {

            navigate("/auth", {
                state: {
                    from:
                        window.location.pathname,
                },
            });

            return;
        }


        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (!selectedPickup) {

            setError(
                "Please select a pickup location."
            );

            return;
        }


        if (!numberOfPeople || numberOfPeople < 1) {

            setError(
                "Please select at least one participant."
            );

            return;
        }


        if (!schedule?.schedule_id) {

            setError(
                "Schedule is not available."
            );

            return;
        }


        if (!razorpayReady || !window.Razorpay) {

            setError(
                "Payment gateway is still loading."
            );

            return;
        }


        try {

            setLoading(true);


            // -------------------------------------------------
            // FIREBASE TOKEN
            // -------------------------------------------------

            const token =
                await user.getIdToken();


            // -------------------------------------------------
            // CREATE BACKEND ORDER
            // -------------------------------------------------

            const order =
                await createPaymentOrder({

                    event_id:
                        event.event_id,

                    schedule_id:
                        schedule.schedule_id,

                    pickup_uuid:
                        selectedPickup.pickup_uuid,

                    number_of_people:
                        numberOfPeople,

                    token,
                });


            if (!order?.booking_id) {

                throw new Error(
                    "Booking ID was not returned."
                );
            }


            // -------------------------------------------------
            // RAZORPAY
            // -------------------------------------------------

            const options = {

                key:
                    order.razorpay_key,

                amount:
                    order.amount,

                currency:
                    order.currency || "INR",

                name:
                    "Living The Adventure",

                description:
                    event.title,

                order_id:
                    order.razorpay_order_id,


                prefill: {

                    name:
                        user.displayName || "",

                    email:
                        user.email || "",

                    contact:
                        user.phoneNumber || "",
                },


                theme: {
                    color: "#000000",
                },


                handler:
                    async (response) => {

                        try {

                            setLoading(true);


                            const freshToken =
                                await user.getIdToken();


                            const result =
                                await verifyPayment({

                                    booking_id:
                                        order.booking_id,

                                    razorpay_order_id:
                                        response.razorpay_order_id,

                                    razorpay_payment_id:
                                        response.razorpay_payment_id,

                                    razorpay_signature:
                                        response.razorpay_signature,

                                    token:
                                        freshToken,
                                });


                            if (
                                result?.success ||
                                result?.payment_status ===
                                "SUCCESS"
                            ) {

                                alert(
                                    "Payment successful! Your booking is confirmed."
                                );

                                /*
                                navigate(
                                    `/booking/${order.booking_id}`
                                );
                                */

                            } else {

                                setError(
                                    "Payment verification failed."
                                );
                            }


                        } catch (err) {

                            console.error(
                                "Payment verification failed:",
                                err
                            );

                            setError(
                                err?.message ||
                                "Payment was completed but verification failed."
                            );

                        } finally {

                            setLoading(false);
                        }
                    },


                modal: {

                    ondismiss: () => {
                        setLoading(false);
                    },
                },
            };


            const razorpay =
                new window.Razorpay(
                    options
                );


            razorpay.on(
                "payment.failed",
                (response) => {

                    console.error(
                        response?.error
                    );


                    setError(
                        response?.error?.description ||
                        "Payment failed."
                    );


                    setLoading(false);
                }
            );


            setLoading(false);

            razorpay.open();


        } catch (err) {

            console.error(
                "Payment error:",
                err
            );


            setError(
                err?.response?.data?.detail ||
                err?.message ||
                "Unable to start payment."
            );


            setLoading(false);
        }
    };


    return {
        handlePayment,
        paymentLoading: loading,
        paymentError: error,
        razorpayReady,
    };
}


export default usePayment;