import { useState, useEffect } from "react";
import axios from "axios";
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { auth } from "./firebase";
import { apiUrl } from "../api/config.js";
import { FaUser, FaPhone, FaKey, FaSpinner, FaCheckCircle, FaArrowRight } from "react-icons/fa";
import Logo from "../components/Common/Logo/logo.jsx";
import { Link } from "react-router-dom";
export default function Signup() {
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        phone: "",
        otp: ""
    });

    const [otpSent, setOtpSent] = useState(false);
    const [confirmation, setConfirmation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [timer, setTimer] = useState(0);

    // Timer countdown
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Auto-focus OTP input when sent
    useEffect(() => {
        if (otpSent) {
            document.getElementById("otp-input")?.focus();
        }
    }, [otpSent]);

    const normalizePhone = (phone) => {
        const digits = phone.replace(/\D/g, "");
        if (digits.length === 10) return `+91${digits}`;
        if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
        throw new Error("Enter valid Indian phone number");
    };

    const setupRecaptcha = () => {
        if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
        }
        window.recaptchaVerifier = new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            { size: "invisible" }
        );
    };

    const sendOtp = async () => {
        try {
            setError("");
            setSuccess("");
            setLoading(true);

            // Validation
            if (!form.first_name.trim()) {
                setError("First name is required");
                setLoading(false);
                return;
            }
            if (!form.last_name.trim()) {
                setError("Last name is required");
                setLoading(false);
                return;
            }
            if (!form.phone || form.phone.trim().length < 10) {
                setError("Please enter a valid phone number");
                setLoading(false);
                return;
            }

            setupRecaptcha();

            const confirmationResult = await signInWithPhoneNumber(
                auth,
                normalizePhone(form.phone),
                window.recaptchaVerifier
            );

            setConfirmation(confirmationResult);
            setOtpSent(true);
            setTimer(60);
            setSuccess("OTP sent successfully to your phone");

        } catch (err) {
            console.error(err);

            if (err.code === "auth/invalid-phone-number") {
                setError("Invalid phone number format");
            } else if (err.code === "auth/too-many-requests") {
                setError("Too many requests. Please try again later.");
            } else if (err.message?.includes("valid Indian")) {
                setError(err.message);
            } else {
                setError("Failed to send OTP. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const verifyOtpAndSignup = async () => {
        try {
            setError("");
            setSuccess("");
            setLoading(true);

            if (!form.otp || form.otp.length !== 6) {
                setError("Please enter a valid 6-digit OTP");
                setLoading(false);
                return;
            }

            if (!confirmation) {
                setError("Session expired. Please resend OTP.");
                setLoading(false);
                return;
            }

            const result = await confirmation.confirm(form.otp);
            const token = await result.user.getIdToken();

            await axios.post(
                apiUrl("/auth/signup/complete"),
                {
                    first_name: form.first_name,
                    last_name: form.last_name
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSuccess("Account created successfully! Redirecting...");

            setTimeout(() => {
                window.location.href = "/";
            }, 1000);

        } catch (err) {
            console.error(err);

            if (err.code === "auth/invalid-verification-code") {
                setError("Invalid OTP. Please check and try again.");
            } else if (err.code === "auth/code-expired") {
                setError("OTP expired. Please resend OTP.");
            } else if (err.response?.status === 409) {
                setError("Account already exists. Please login instead.");
            } else {
                setError("Signup failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = () => {
        setForm({ ...form, otp: "" });
        setOtpSent(false);
        setConfirmation(null);
        sendOtp();
    };

    return (
        <div className="relative isolate min-h-screen overflow-hidden bg-slate-950">
            <div className="absolute left-3 top-3 z-30 sm:left-6 sm:top-5">
                <Link to="/">
                    <Logo />
                </Link>
            </div>
            <div>
                <div className="fixed inset-0 z-0">
                    <img src="https://images.pexels.com/photos/29731433/pexels-photo-29731433.jpeg" alt="" className="h-full w-full object-cover object-center" />
                    <div className="absolute inset-0 bg-slate-950/60" />
                </div>
                <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-24 sm:py-12">


                    <div id="recaptcha-container"></div>

                    {/* Background decorative elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                    </div>

                    <div className="w-full max-w-md relative z-10">

                        {/* Card */}
                        <div className="w-full rounded-2xl border border-white/25 bg-black/90 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-7">

                            {/* Header */}
                            <div className="text-center mb-8">
                                <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">Create Account</h1>
                                <p className="text-sm text-slate-300">Join us for amazing adventures</p>
                            </div>

                            {/* Success Message */}
                            {success && (
                                <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 animate-fade-in">
                                    <FaCheckCircle className="text-green-400 shrink-0" />
                                    <p className="text-green-300 text-sm">{success}</p>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg animate-shake">
                                    <p className="text-red-300 text-sm">{error}</p>
                                </div>
                            )}

                            {/* Form Fields */}
                            <div className="space-y-4 mb-6">

                                {/* First Name */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-200 mb-2">
                                        First Name
                                    </label>
                                    <div className="relative">
                                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Enter your first name"
                                            value={form.first_name}
                                            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                                            disabled={otpSent}
                                            className="w-full pl-12 pr-4 py-3.5 bg-[#0f172a]/50 text-white rounded-lg border border-white/20 focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Last Name
                                    </label>
                                    <div className="relative">
                                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                                        <input
                                            type="text"
                                            placeholder="Enter your last name"
                                            value={form.last_name}
                                            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                                            disabled={otpSent}
                                            className="w-full pl-12 pr-4 py-3.5 bg-[#0f172a]/50 text-white rounded-lg border border-neutral-600 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                                        <input
                                            type="tel"
                                            placeholder="Enter your phone number"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            disabled={otpSent}
                                            className="w-full pl-12 pr-4 py-3.5 bg-[#0f172a]/50 text-white rounded-lg border border-neutral-600 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            maxLength="10"
                                        />
                                    </div>
                                    <p className="text-xs text-neutral-400 mt-1.5">Enter 10-digit Indian mobile number</p>
                                </div>

                                {/* OTP Input */}
                                {otpSent && (
                                    <div className="animate-slide-down">
                                        <label className="block text-sm font-medium text-white mb-2">
                                            Verification Code
                                        </label>
                                        <div className="relative">
                                            <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                                            <input
                                                id="otp-input"
                                                type="text"
                                                placeholder="Enter 6-digit OTP"
                                                value={form.otp}
                                                onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, "") })}
                                                className="w-full pl-12 pr-4 py-3.5 bg-[#0f172a]/50 text-white rounded-lg border border-neutral-600 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all tracking-widest text-center text-lg font-semibold"
                                                maxLength="6"
                                                autoComplete="one-time-code"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Main Action Button */}
                            <button
                                onClick={otpSent ? verifyOtpAndSignup : sendOtp}
                                disabled={
                                    loading ||
                                    (!otpSent && (!form.first_name || !form.last_name || !form.phone)) ||
                                    (otpSent && form.otp.length !== 6)
                                }
                                className="w-full bg-black text-white py-3.5 rounded-lg font-semibold hover:bg-neutral-800 disabled:opacity-90 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        <span>Please wait...</span>
                                    </>
                                ) : otpSent ? (
                                    <>
                                        <span>Verify & Create Account</span>
                                        <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                ) : (
                                    <>
                                        <span>Send OTP</span>
                                        {/* <FaArrowRight className="group-hover:translate-x-1 transition-transform" /> */}
                                    </>
                                )}
                            </button>

                            {/* Resend OTP */}
                            {otpSent && (
                                <div className="mt-4 text-center animate-fade-in">
                                    {timer > 0 ? (
                                        <p className="text-sm text-neutral-300">
                                            Resend OTP in <span className="text-neutral-300 font-semibold">{timer}s</span>
                                        </p>
                                    ) : (
                                        <button
                                            onClick={handleResend}
                                            disabled={loading}
                                            className="text-sm text-neutral-300 hover:text-white font-medium disabled:opacity-50 transition-colors"
                                        >
                                            Resend OTP
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Divider */}
                            <div className="flex items-center gap-4 my-6">
                                <div className="flex-1 h-px bg-neutral-700"></div>
                                <span className="text-neutral-400 text-sm">OR</span>
                                <div className="flex-1 h-px bg-neutral-700"></div>
                            </div>

                            {/* Login Link */}
                            <p className="text-center text-sm text-neutral-300">
                                Already have an account?{" "}
                                <a href="/auth" className="text-neutral-300 hover:text-white font-medium transition-colors">
                                    Login
                                </a>
                            </p>
                        </div>

                        {/* Footer */}
                        <p className="text-center text-xs text-white mt-6">
                            By creating an account, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>

                    <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slide-down {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
                
                .animate-slide-down {
                    animation: slide-down 0.3s ease-out;
                }
                
                .animate-shake {
                    animation: shake 0.3s ease-out;
                }
            `}</style>
                </div>
            </div>
        </div>
    );
}