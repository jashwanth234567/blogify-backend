import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const { axios } = useAppContext();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [resetLoading, setResetLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);



    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password || !confirmPassword) {
            return toast.error("All fields are required");
        }
        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }

        setResetLoading(true);
        try {
            const { data } = await axios.post("/api/auth/forgot-password", {
                email,
                password
            });
            if (data.success) {
                toast.success("Password reset successfully! Redirecting to login...");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Ambient background glow blobs */}
            <div className="absolute top-[-100px] left-[-10%] w-[450px] h-[450px] rounded-full bg-violet-400/20 blur-[80px] -z-10 animate-float-slow" />
            <div className="absolute bottom-[-100px] right-[-10%] w-[450px] h-[450px] rounded-full bg-indigo-400/25 blur-[80px] -z-10 animate-float-medium" />

            <div className="w-full max-w-md p-8 m-6 border border-violet-200/50 bg-white/60 dark:bg-slate-900/60 dark:border-slate-800/60 backdrop-blur-xl shadow-2xl shadow-violet-300/20 dark:shadow-violet-900/20 rounded-2xl">
                <div className="flex flex-col items-center justify-center">
                    <div className="w-full pb-6 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                            Reset Password
                        </h1>
                        <p className="font-medium text-xs text-slate-400/80 pt-3 max-w-64 mx-auto">Verify your email and set a new password</p>
                    </div>
                    <form onSubmit={handleSubmit} className="w-full text-slate-600 dark:text-slate-350">
                        <div className="flex flex-col gap-1.5 mb-4">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                            <input 
                                onChange={(e) => setEmail(e.target.value)} 
                                value={email} 
                                type="email" 
                                required 
                                placeholder="user@example.com" 
                                className="border border-transparent bg-white/90 dark:bg-slate-800/90 rounded-xl p-2.5 outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all duration-300 text-sm placeholder-slate-400 dark:text-slate-100" 
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 mb-4 relative">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New Password</label>
                            <div className="relative w-full">
                                <input 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    value={password} 
                                    type={showPassword ? "text" : "password"} 
                                    required 
                                    placeholder="New Password" 
                                    className="w-full border border-transparent bg-white/90 dark:bg-slate-800/90 rounded-xl p-2.5 pr-10 outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all duration-300 text-sm placeholder-slate-400 dark:text-slate-100" 
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600 focus:outline-none"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5 mb-6">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                            <input 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                value={confirmPassword} 
                                type={showPassword ? "text" : "password"} 
                                required 
                                placeholder="Confirm New Password" 
                                className="border border-transparent bg-white/90 dark:bg-slate-800/90 rounded-xl p-2.5 outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all duration-300 text-sm placeholder-slate-400 dark:text-slate-100" 
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={resetLoading}
                            className="w-full py-3 font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-lg hover:shadow-violet-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer text-sm disabled:opacity-50"
                        >
                            {resetLoading ? "Resetting..." : "Reset Password"}
                        </button>
                        <p className="mt-4 text-center text-sm py-2 text-slate-500">
                            Back to <Link to="/login" className="text-violet-600 font-semibold hover:underline">Login</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
