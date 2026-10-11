import { useState } from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaCheckCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import Footer from "../Footer/Footer";

export default function ContactUs() {
    const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
    const [sent, setSent] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        setError("");

        const formData = new FormData();

        // Your Web3Forms Access Key
        formData.append("access_key", "9eba54f3-c273-4d08-939b-0fedcc697d8d");

        formData.append("name", form.name);
        formData.append("email", form.email);
        formData.append("phone", form.phone);
        formData.append("subject", form.subject || "Contact Form");
        formData.append("message", form.message);

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setSent(true);
                setForm({
                    name: "",
                    email: "",
                    phone: "",
                    subject: "",
                    message: "",
                });
            } else {
                setError(data.message || "Something went wrong.");
            }
        } catch (error) {
            setError("Network error. Please try again.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white">

            {/* Hero strip */}
            <div className="bg-black border-b border-gray-800 py-12 px-4 pl-20 sm:pl-24">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                        <Link to="/" className="hover:text-gray-300 transition-colors">Home</Link>
                        <FaChevronRight className="text-[10px]" />
                        <span className="text-gray-400">Contact Us</span>
                    </div>
                    <h1 className="font-bebas text-4xl sm:text-5xl tracking-widest text-white uppercase">Contact Us</h1>
                    <p className="mt-2 text-sm text-gray-400">We're here to help — reach out and we'll get back to you quickly.</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 pl-20 sm:pl-24 pr-6 sm:pr-8 py-12 pb-24">
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Left — contact info */}
                    <div className="space-y-5">
                        <div className="bg-[#1e293b] rounded-xl border border-gray-800 p-6 space-y-5">
                            <h2 className="text-base font-semibold text-white">Get in Touch</h2>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                                    <FaEnvelope className="text-gray-400 text-sm" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Email</p>
                                    <a href="mailto:living.the.adventure0@gmail.com" className="text-sm text-gray-300 hover:text-white transition-colors">
                                        living.the.adventure0@gmail.com
                                    </a>
                                </div>
                            </div>

                            {/* <div className="flex items-start gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                                    <FaPhone className="text-gray-400 text-sm" />
                                </div>
                                 <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Phone</p>
                                    <a href="tel:+911234567890" className="text-sm text-gray-300 hover:text-white transition-colors">
                                        +91 12345 67890
                                    </a>
                                    <p className="text-xs text-gray-600 mt-0.5">Mon–Sat, 9 AM – 6 PM IST</p>
                                </div>
                            </div> */}

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                                    <FaMapMarkerAlt className="text-gray-400 text-sm" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Address</p>
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        Samrudhi Angan ,Umbrya Ganpati Chouk dhayari  - 411041
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                            <h2 className="text-base font-semibold text-white mb-3">Response Time</h2>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                We typically respond within <span className="text-gray-200 font-medium">24–48 hours</span> on working days.
                                For urgent booking issues, please call us directly.
                            </p>
                        </div>
                    </div>

                    {/* Right — contact form */}
                    <div className="lg:col-span-2">
                        <div className="bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-800">
                                <h2 className="text-base font-semibold text-white">Send us a Message</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Fill in the form and our team will get back to you.</p>
                            </div>

                            {sent ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-6">
                                    <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                        <FaCheckCircle className="text-2xl text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold">Message Sent!</p>
                                        <p className="text-sm text-gray-400 mt-1">We'll get back to you within 24–48 hours.</p>
                                    </div>
                                    <button
                                        onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); setError(""); }}
                                        className="mt-2 text-sm text-gray-400 border border-gray-700 rounded-lg px-4 py-2 hover:border-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                                    >
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                                            <input
                                                name="name" value={form.name} onChange={handleChange} required
                                                placeholder="Your name"
                                                className="w-full bg-[#020617] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-gray-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Email *</label>
                                            <input
                                                name="email" value={form.email} onChange={handleChange} required type="email"
                                                placeholder="you@example.com"
                                                className="w-full bg-[#020617] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-gray-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Phone</label>
                                            <input
                                                name="phone" value={form.phone} onChange={handleChange}
                                                placeholder="+91 XXXXX XXXXX"
                                                className="w-full bg-[#020617] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-gray-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Subject *</label>
                                            <select
                                                name="subject" value={form.subject} onChange={handleChange} required
                                                className="w-full bg-[#020617] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-gray-500 transition-colors"
                                            >
                                                <option value="">Select a topic</option>
                                                <option value="Booking Enquiry">Booking Enquiry</option>
                                                <option value="Payment Issue">Payment Issue</option>
                                                <option value="Refund Request">Refund Request</option>
                                                <option value="Feedback">Feedback</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Message *</label>
                                        <textarea
                                            name="message" value={form.message} onChange={handleChange} required rows={5}
                                            placeholder="Describe your query in detail..."
                                            className="w-full bg-[#020617] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-gray-500 transition-colors resize-none"
                                        />
                                    </div>

                                    {/* Error message */}
                                    {error && (
                                        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                                            {error}
                                        </p>
                                    )}

                                    <button
                                        type="submit" disabled={sending}
                                        className="w-full bg-white text-black rounded-lg py-3 text-sm font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                    >
                                        {sending ? "Sending..." : "Send Message"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}