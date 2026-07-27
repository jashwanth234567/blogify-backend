import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const OtpVerification = () => {
    const { axios, setToken, setUser } = useAppContext();
    const location = useLocation();
    const navigate = useNavigate();

    // Retrieve email passed from Registration screen or state
    const initialEmail = location.state?.email || sessionStorage.getItem("pending_otp_email") || "";

    const [email, setEmail] = useState(initialEmail);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(60); // 60-second cooldown timer

    const inputRefs = useRef([]);

    // 60-second countdown timer effect
    useEffect(() => {
        let interval = null;
        if (cooldown > 0) {
            interval = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [cooldown]);

    useEffect(() => {
        if (initialEmail) {
            sessionStorage.setItem("pending_otp_email", initialEmail);
        }
    }, [initialEmail]);

    // Handle digit input & auto-focus next input
    const handleChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle backspace navigation
    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Handle paste event (e.g., pasting "123456")
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").trim();
        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split("");
            setOtp(digits);
            inputRefs.current[5]?.focus();
        } else {
            toast.error("Please paste a valid 6-digit numeric OTP");
        }
    };



    // Submit OTP verification
    const handleVerify = async (e) => {
        e.preventDefault();
        const fullOtp = otp.join("");
        if (fullOtp.length !== 6) {
            return toast.error("Please enter the complete 6-digit OTP code");
        }
        if (!email) {
            return toast.error("Email address missing. Please register or log in again.");
        }

        setLoading(true);
        try {
            const { data } = await axios.post("/api/auth/verify-otp", {
                email,
                otp: fullOtp
            });

            if (data.success) {
                toast.success(data.message || "Email verified successfully!");
                sessionStorage.removeItem("pending_otp_email");
                sessionStorage.removeItem("latest_dev_otp");
                
                if (data.token) {
                    setToken(data.token);
                    setUser(data.user);
                    navigate("/author");
                } else {
                    navigate("/login");
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "OTP verification failed");
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP with 60-second cooldown
    const handleResendOtp = async () => {
        if (cooldown > 0) return;
        if (!email) return toast.error("Email address is required.");

        setResending(true);
        try {
            const { data } = await axios.post("/api/auth/resend-otp", {
                email,
                purpose: "register"
            });

            if (data.success) {
                toast.success("A new 6-digit OTP has been sent to your email!");
                setCooldown(60); // Reset 60s cooldown timer
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to resend OTP");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-950 py-10 px-4">
            {/* Ambient glows */}
            <div className="absolute top-[-100px] left-[-10%] w-[450px] h-[450px] rounded-full bg-violet-400/20 blur-[80px] -z-10 animate-float-slow" />
            <div className="absolute bottom-[-100px] right-[-10%] w-[450px] h-[450px] rounded-full bg-indigo-400/25 blur-[80px] -z-10 animate-float-medium" />

            <div className="w-full max-w-md p-8 border border-violet-200/50 bg-white/70 dark:bg-slate-900/70 dark:border-slate-800/60 backdrop-blur-xl shadow-2xl rounded-3xl animate-scale-in">
                <div className="text-center space-y-3 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-2xl text-white mx-auto shadow-lg shadow-violet-500/30">
                        🔑
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
                        Verify Your Email
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                        Enter the 6-digit OTP code sent to <br />
                        <strong className="text-violet-600 dark:text-violet-400 font-semibold">{email || "your registered email"}</strong>
                    </p>
                </div>



                {!email && (
                    <div className="mb-6">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Confirm Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full bz-input"
                        />
                    </div>
                )}

                <form onSubmit={handleVerify} className="space-y-6">
                    {/* 6 Digit Numeric Boxes */}
                    <div className="flex justify-between gap-2" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-14 text-center text-xl font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-500/20 transition-all duration-200 shadow-sm"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otp.join("").length !== 6}
                        className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-600/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {loading ? "Verifying OTP..." : "Verify & Activate Account"}
                    </button>
                </form>

                {/* Resend OTP Section with 60-Second Cooldown */}
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Didn't receive the OTP code?
                    </p>
                    <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={cooldown > 0 || resending}
                        className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline disabled:text-slate-400 disabled:no-underline cursor-pointer transition-colors"
                    >
                        {resending ? "Sending..." : cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP Now"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OtpVerification;
