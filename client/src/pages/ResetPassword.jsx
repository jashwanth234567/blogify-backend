import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const ResetPassword = () => {
    const { axios } = useAppContext();
    const location = useLocation();
    const navigate = useNavigate();

    const [email, setEmail] = useState(location.state?.email || "");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Password strength check
    const [strength, setStrength] = useState({
        score: 0,
        hasUpper: false,
        hasLower: false,
        hasNumber: false,
        hasSpecial: false,
        hasMinLength: false
    });

    useEffect(() => {
        const hasUpper = /[A-Z]/.test(newPassword);
        const hasLower = /[a-z]/.test(newPassword);
        const hasNumber = /[0-9]/.test(newPassword);
        const hasSpecial = /[\W_]/.test(newPassword);
        const hasMinLength = newPassword.length >= 8;

        let score = 0;
        if (hasUpper) score++;
        if (hasLower) score++;
        if (hasNumber) score++;
        if (hasSpecial) score++;
        if (hasMinLength) score++;

        setStrength({ score, hasUpper, hasLower, hasNumber, hasSpecial, hasMinLength });
    }, [newPassword]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !otp || !newPassword) {
            return toast.error("All fields are required.");
        }
        if (otp.trim().length !== 6) {
            return toast.error("OTP code must be exactly 6 digits.");
        }
        if (newPassword !== confirmPassword) {
            return toast.error("New passwords do not match.");
        }
        if (strength.score < 5) {
            return toast.error("Password does not meet security requirements.");
        }

        setLoading(true);
        try {
            const { data } = await axios.post("/api/auth/reset-password", {
                email,
                otp: otp.trim(),
                newPassword,
                confirmPassword
            });

            if (data.success) {
                toast.success("Password reset successfully! Please log in.");
                navigate("/login");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-950 py-10 px-4">
            <div className="w-full max-w-md p-8 border border-violet-200/50 bg-white/70 dark:bg-slate-900/70 dark:border-slate-800/60 backdrop-blur-xl shadow-2xl rounded-3xl animate-scale-in">
                <div className="text-center space-y-3 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-2xl text-white mx-auto shadow-lg shadow-violet-500/30">
                        🛡️
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
                        Reset Your Password
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                        Enter the 6-digit OTP code sent to your email along with your new password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@example.com"
                            className="w-full bz-input"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">6-Digit OTP Code</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            required
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            placeholder="Enter 6-digit OTP"
                            className="w-full bz-input text-center text-lg font-bold tracking-widest"
                        />
                    </div>

                    <div className="relative">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New Password"
                                className="w-full bz-input pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600 text-xs font-bold"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>

                        {newPassword && (
                            <ul className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-[10px] text-slate-400 list-none p-0">
                                <li className={strength.hasMinLength ? "text-green-500 font-semibold" : ""}>✓ Min 8 Characters</li>
                                <li className={strength.hasUpper ? "text-green-500 font-semibold" : ""}>✓ Uppercase Letter</li>
                                <li className={strength.hasLower ? "text-green-500 font-semibold" : ""}>✓ Lowercase Letter</li>
                                <li className={strength.hasNumber ? "text-green-500 font-semibold" : ""}>✓ One Number</li>
                                <li className={strength.hasSpecial ? "text-green-500 font-semibold" : ""}>✓ Special Character</li>
                            </ul>
                        )}
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Confirm New Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm New Password"
                            className="w-full bz-input"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-600/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-50 text-sm mt-2"
                    >
                        {loading ? "Resetting Password..." : "Reset Password & Login"}
                    </button>
                </form>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                    <Link to="/login" className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline">
                        ← Cancel and Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
