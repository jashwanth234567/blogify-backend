import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const ForgotPassword = () => {
    const { axios } = useAppContext();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            return toast.error("Please enter your registered email address.");
        }

        setLoading(true);
        try {
            const { data } = await axios.post("/api/auth/forgot-password", { email });
            if (data.success) {
                toast.success(data.message || "If registered, a 6-digit OTP has been sent to your email.");
                // Redirect to Reset Password screen with email state
                navigate("/reset-password", { state: { email } });
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to process request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-950 py-10 px-4">
            <div className="w-full max-w-md p-8 border border-violet-200/50 bg-white/70 dark:bg-slate-900/70 dark:border-slate-800/60 backdrop-blur-xl shadow-2xl rounded-3xl animate-scale-in">
                <div className="text-center space-y-3 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-2xl text-white mx-auto shadow-lg shadow-violet-500/30">
                        🔒
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
                        Forgot Password
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                        Enter your registered email address below. We'll send you a 6-digit OTP code to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@example.com"
                            className="w-full bz-input"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-600/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-50 text-sm"
                    >
                        {loading ? "Sending OTP..." : "Send Reset OTP"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                    <Link to="/login" className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline">
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
