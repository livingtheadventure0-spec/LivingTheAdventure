import { useState, useEffect } from "react";
import axios from "axios";
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { auth } from "./firebase";
import { apiUrl } from "../api/config.js";
import {
    FaPhone,
    FaKey,
    FaSpinner,
    FaCheckCircle,
    FaArrowRight,
    FaUser,
    FaEnvelope,
} from "react-icons/fa";
import Logo from "../components/Common/Logo/logo.jsx";
import { Link, useLocation, useNavigate } from "react-router-dom";

const normalizePhone = (phone) => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
    throw new Error("Enter valid Indian phone number");
};

const inputClass =
    "w-full rounded-xl border border-white/15 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-white/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-white/10 disabled:cursor-not-allowed disabled:opacity-50";

export default function Auth() {
    const location = useLocation();
    const navigate = useNavigate();
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [confirmation, setConfirmation] = useState(null);
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [profileRequired, setProfileRequired] = useState(false);
    const [profile, setProfile] = useState({
        first_name: "",
        last_name: "",
        email: "",
        gender: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        if (!timer) return undefined;
        const interval = setInterval(() => setTimer((value) => value - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    useEffect(() => {
        if (otpSent && !otpVerified) document.getElementById("otp-input")?.focus();
    }, [otpSent, otpVerified]);

    const setupRecaptcha = () => {
        if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
            size: "invisible",
        });
    };

    const sendOtp = async () => {
        setError("");
        setSuccess("");
        const digits = phone.replace(/\D/g, "");
        if (digits.length !== 10) {
            setError("Enter a valid 10-digit Indian mobile number.");
            return;
        }

        setLoading(true);
        try {
            setupRecaptcha();
            const result = await signInWithPhoneNumber(
                auth,
                normalizePhone(phone),
                window.recaptchaVerifier
            );
            setConfirmation(result);
            setOtpSent(true);
            setTimer(60);
            setSuccess("A verification code has been sent to your phone.");
        } catch (err) {
            console.error(err);
            if (err.code === "auth/invalid-phone-number") setError("That phone number is invalid.");
            else if (err.code === "auth/too-many-requests") setError("Too many attempts. Please try again later.");
            else setError(err.message?.includes("valid Indian") ? err.message : "Couldn't send the code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        setError("");
        setSuccess("");
        if (otp.length !== 6) {
            setError("Enter the 6-digit verification code.");
            return;
        }
        if (!confirmation) {
            setError("Your verification session expired. Please request a new code.");
            return;
        }

        setLoading(true);
        try {
            const result = await confirmation.confirm(otp);
            await checkUser(await result.user.getIdToken());
        } catch (err) {
            console.error(err);
            if (err.code === "auth/invalid-verification-code") setError("That code doesn't match. Please try again.");
            else if (err.code === "auth/code-expired") setError("That code has expired. Request a new one.");
            else setError("Verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const checkUser = async (token) => {
        try {
            const res = await axios.post(apiUrl("/auth/firebase/verify"), {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.status === "LOGIN") {
                navigate(location.state?.returnTo || location.state?.from || "/", { replace: true });
            } else if (res.data.status === "SIGNUP_REQUIRED") {
                setOtpVerified(true);
                setProfileRequired(true);
                setSuccess("Phone verified. Add a few details to finish setting up your account.");
            } else {
                setError("We couldn't determine your account status. Please try again.");
            }
        } catch (err) {
            console.error(err);
            setError("We couldn't verify your account right now. Please try again.");
        }
    };

    const completeSignup = async () => {
        setError("");
        setSuccess("");
        if (!profile.first_name.trim() || !profile.last_name.trim() || !profile.email.trim() || !profile.gender) {
            setError("Please complete all profile fields.");
            return;
        }
        const email = profile.email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Enter a valid email address.");
            return;
        }
        if (!auth.currentUser) {
            setError("Your verification session expired. Please verify your phone again.");
            setOtpSent(false);
            setOtpVerified(false);
            setProfileRequired(false);
            return;
        }

        setLoading(true);
        try {
            const token = await auth.currentUser.getIdToken();
            await axios.post(apiUrl("/auth/signup/complete"), {
                first_name: profile.first_name.trim(),
                last_name: profile.last_name.trim(),
                email,
                gender: profile.gender,
            }, { headers: { Authorization: `Bearer ${token}` } });
            setSuccess("Your account is ready. Continuing...");
            navigate(location.state?.returnTo || location.state?.from || "/", { replace: true });
        } catch (err) {
            console.error(err);
            if (err.response?.status === 409) setError(err.response?.data?.detail || "This phone number or email is already registered.");
            else if (err.response?.status === 422) setError("Please check your details and try again.");
            else setError("We couldn't create your account. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = () => {
        setOtp("");
        setOtpSent(false);
        setConfirmation(null);
        sendOtp();
    };

    const updateProfile = (field, value) => setProfile((current) => ({ ...current, [field]: value }));

    return (
        <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#080a0d] px-4 py-24 sm:px-6">
            <div className="fixed inset-0 -z-20">
                <img
                    src="https://images.pexels.com/photos/14394294/pexels-photo-14394294.jpeg"
                    alt=""
                    className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-[#05070a]/75" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />
            </div>

            <Link to="/" aria-label="Living the Adventure home" className="absolute left-5 top-5 z-20 opacity-90 transition hover:opacity-100 sm:left-8 sm:top-7">
                <Logo />
            </Link>

            <div id="recaptcha-container" />

            <section className="relative z-10 w-full max-w-[420px]">
                <div className="rounded-2xl border border-white/15 bg-[#090b0e]/90 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-8">
                    <div className="mb-7">
                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">Living the Adventure</p>
                        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
                            {profileRequired ? "Complete your profile" : otpSent ? "Verify your number" : "Welcome back"}
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-white/60">
                            {profileRequired
                                ? "Just a few details and you're ready to explore."
                                : otpSent
                                    ? `Enter the 6-digit code sent to ${phone}.`
                                    : "Sign in securely with your mobile number."}
                        </p>
                    </div>

                    {success && (
                        <div role="status" className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] p-3 text-sm text-emerald-200">
                            <FaCheckCircle className="mt-0.5 shrink-0" />
                            <span>{success}</span>
                        </div>
                    )}
                    {error && (
                        <div role="alert" className="mb-5 rounded-xl border border-red-400/20 bg-red-400/[0.07] p-3 text-sm leading-5 text-red-200">
                            {error}
                        </div>
                    )}

                    {!profileRequired ? (
                        <>
                            <label htmlFor="phone-input" className="mb-2 block text-xs font-medium text-white/75">Mobile number</label>
                            <div className="relative">
                                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/40" />
                                <span className="absolute left-10 top-1/2 -translate-y-1/2 border-r border-white/15 pr-3 text-sm text-white/55">+91</span>
                                <input
                                    id="phone-input"
                                    type="tel"
                                    inputMode="numeric"
                                    autoComplete="tel-national"
                                    placeholder="10-digit mobile number"
                                    value={phone}
                                    onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
                                    disabled={otpSent || loading}
                                    className={`${inputClass} pl-[82px]`}
                                />
                            </div>

                            {otpSent && !otpVerified && (
                                <div className="mt-5">
                                    <label htmlFor="otp-input" className="mb-2 block text-xs font-medium text-white/75">Verification code</label>
                                    <div className="relative">
                                        <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/40" />
                                        <input
                                            id="otp-input"
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            maxLength={6}
                                            placeholder="Enter 6-digit code"
                                            value={otp}
                                            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                                            className={`${inputClass} tracking-[0.3em]`}
                                        />
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-xs text-white/50">
                                        <span>Didn't receive the code?</span>
                                        {timer > 0 ? (
                                            <span>Resend in {timer}s</span>
                                        ) : (
                                            <button type="button" onClick={handleResend} disabled={loading} className="font-medium text-white/85 underline underline-offset-4 hover:text-white disabled:opacity-50">
                                                Resend code
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="first-name" className="mb-2 block text-xs font-medium text-white/75">First name</label>
                                    <div className="relative">
                                        <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-white/35" />
                                        <input id="first-name" autoComplete="given-name" placeholder="First name" value={profile.first_name} onChange={(e) => updateProfile("first_name", e.target.value)} className={`${inputClass} pl-9`} />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="last-name" className="mb-2 block text-xs font-medium text-white/75">Last name</label>
                                    <input id="last-name" autoComplete="family-name" placeholder="Last name" value={profile.last_name} onChange={(e) => updateProfile("last_name", e.target.value)} className={inputClass.replace("pl-11", "pl-4")} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="email" className="mb-2 block text-xs font-medium text-white/75">Email address</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/40" />
                                    <input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={profile.email} onChange={(e) => updateProfile("email", e.target.value)} className={inputClass} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="gender" className="mb-2 block text-xs font-medium text-white/75">Gender</label>
                                <select id="gender" value={profile.gender} onChange={(e) => updateProfile("gender", e.target.value)} className={`${inputClass} pl-4`}>
                                    <option value="" className="bg-[#090b0e]">Select gender</option>
                                    <option value="Male" className="bg-[#090b0e]">Male</option>
                                    <option value="Female" className="bg-[#090b0e]">Female</option>
                                    <option value="Other" className="bg-[#090b0e]">Other</option>
                                    <option value="Prefer not to say" className="bg-[#090b0e]">Prefer not to say</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={profileRequired ? completeSignup : otpSent ? verifyOtp : sendOtp}
                        disabled={loading || (!profileRequired && !otpSent && phone.length !== 10) || (!profileRequired && otpSent && otp.length !== 6) || (profileRequired && (!profile.first_name.trim() || !profile.last_name.trim() || !profile.email.trim() || !profile.gender))}
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-[#090b0e] transition hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#090b0e] disabled:cursor-not-allowed disabled:bg-white/30 disabled:text-white/50"
                    >
                        {loading ? (
                            <><FaSpinner className="animate-spin" /><span>Please wait…</span></>
                        ) : (
                            <><span>{profileRequired ? "Create account" : otpSent ? "Verify and continue" : "Send verification code"}</span><FaArrowRight /></>
                        )}
                    </button>

                    {!profileRequired && !otpSent && (
                        <p className="mt-5 text-center text-xs leading-5 text-white/45">
                            By continuing, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    )}
                    {!profileRequired && (
                        <div className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-white/55">
                            New to Living the Adventure?{" "}
                            <Link to="/signup" className="font-medium text-white transition hover:text-white/75">Create an account</Link>
                        </div>
                    )}
                </div>
                <p className="mt-5 text-center text-[11px] tracking-wide text-white/40">Your number is used only to verify your account.</p>
            </section>
        </main>
    );
}
