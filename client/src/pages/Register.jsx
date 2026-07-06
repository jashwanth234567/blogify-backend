import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
    const { axios } = useAppContext();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const [showPassword, setShowPassword] = useState(false);
    const [registerLoading, setRegisterLoading] = useState(false);

    // Password strength states
    const [strength, setStrength] = useState({
        score: 0,
        hasUpper: false,
        hasLower: false,
        hasNumber: false,
        hasSpecial: false,
        hasMinLength: false
    });



    useEffect(() => {
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[\W_]/.test(password);
        const hasMinLength = password.length >= 8;

        let score = 0;
        if (hasUpper) score++;
        if (hasLower) score++;
        if (hasNumber) score++;
        if (hasSpecial) score++;
        if (hasMinLength) score++;

        setStrength({ score, hasUpper, hasLower, hasNumber, hasSpecial, hasMinLength });
    }, [password]);



    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !username || !email || !password) {
            return toast.error("All fields are required");
        }
        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }
        if (strength.score < 5) {
            return toast.error("Password is not strong enough");
        }

        setRegisterLoading(true);
        try {
            const { data } = await axios.post("/api/auth/register", {
                name,
                username,
                email,
                password
            });
            if (data.success) {
                toast.success("Registration successful! Redirecting to login...");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setRegisterLoading(false);
        }
    };

    const getStrengthColor = () => {
        if (strength.score <= 2) return "bg-red-500";
        if (strength.score <= 4) return "bg-amber-500";
        return "bg-green-500";
    };

    const getStrengthLabel = () => {
        if (strength.score <= 2) return "Weak";
        if (strength.score <= 4) return "Medium";
        return "Strong";
    };

    return (
        <div className="flex items-center justify-center min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-950 py-10">
            {/* Ambient background glow blobs */}
            <div className="absolute top-[-100px] left-[-10%] w-[450px] h-[450px] rounded-full bg-violet-400/20 blur-[80px] -z-10 animate-float-slow" />
            <div className="absolute bottom-[-100px] right-[-10%] w-[450px] h-[450px] rounded-full bg-indigo-400/25 blur-[80px] -z-10 animate-float-medium" />

            <div className="w-full max-w-md p-8 m-6 border border-violet-200/50 bg-white/60 dark:bg-slate-900/60 dark:border-slate-800/60 backdrop-blur-xl shadow-2xl shadow-violet-300/20 dark:shadow-violet-900/20 rounded-2xl">
                <div className="flex flex-col items-center justify-center">
                    <div className="w-full pb-4 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Sign</span> Up
                        </h1>
                        <p className="font-medium text-xs text-slate-400/80 pt-2 max-w-64 mx-auto">Create a new account</p>
                    </div>
                    <form onSubmit={handleSubmit} className="w-full text-slate-600 dark:text-slate-350">
                        <div className="flex flex-col gap-1.5 mb-3">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
                            <input 
                                onChange={(e) => setName(e.target.value)} 
                                value={name} 
                                type="text" 
                                required 
                                placeholder="Your Name" 
                                className="border border-transparent bg-white/90 dark:bg-slate-800/90 rounded-xl p-2.5 outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all duration-300 text-sm placeholder-slate-400 dark:text-slate-100" 
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 mb-3">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Username</label>
                            <input 
                                onChange={(e) => setUsername(e.target.value)} 
                                value={username} 
                                type="text" 
                                required 
                                placeholder="Username" 
                                className="border border-transparent bg-white/90 dark:bg-slate-800/90 rounded-xl p-2.5 outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all duration-300 text-sm placeholder-slate-400 dark:text-slate-100" 
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 mb-3">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</label>
                            <input 
                                onChange={(e) => setEmail(e.target.value)} 
                                value={email} 
                                type="email" 
                                required 
                                placeholder="user@example.com" 
                                className="border border-transparent bg-white/90 dark:bg-slate-800/90 rounded-xl p-2.5 outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all duration-300 text-sm placeholder-slate-400 dark:text-slate-100" 
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 mb-3 relative">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                            <div className="relative w-full">
                                <input 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    value={password} 
                                    type={showPassword ? "text" : "password"} 
                                    required 
                                    placeholder="Password" 
                                    className="w-full border border-transparent bg-white/90 dark:bg-slate-800/90 rounded-xl p-2.5 pr-10 outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all duration-300 text-sm placeholder-slate-400 dark:text-slate-100" 
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600 focus:outline-none text-xs"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            
                            {password && (
                                <div className="mt-2">
                                    <div className="flex justify-between items-center text-xs mb-1 text-slate-450">
                                        <span>Password Strength:</span>
                                        <span className="font-semibold">{getStrengthLabel()}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${getStrengthColor()} transition-all duration-300`} 
                                            style={{ width: `${(strength.score / 5) * 100}%` }}
                                        />
                                    </div>
                                    <ul className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-[10px] text-slate-450 list-none p-0">
                                        <li className={strength.hasMinLength ? "text-green-500" : ""}>✓ Min 8 Characters</li>
                                        <li className={strength.hasUpper ? "text-green-500" : ""}>✓ Uppercase Letter</li>
                                        <li className={strength.hasLower ? "text-green-500" : ""}>✓ Lowercase Letter</li>
                                        <li className={strength.hasNumber ? "text-green-500" : ""}>✓ One Number</li>
                                        <li className={strength.hasSpecial ? "text-green-500" : ""}>✓ Special Character</li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5 mb-5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirm Password</label>
                            <input 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                value={confirmPassword} 
                                type={showPassword ? "text" : "password"} 
                                required 
                                placeholder="Confirm Password" 
                                className="border border-transparent bg-white/90 dark:bg-slate-800/90 rounded-xl p-2.5 outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all duration-300 text-sm placeholder-slate-400 dark:text-slate-100" 
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={registerLoading}
                            className="w-full py-3 font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-lg hover:shadow-violet-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer text-sm disabled:opacity-50"
                        >
                            {registerLoading ? "Registering..." : "Register"}
                        </button>
                        <p className="mt-4 text-center text-sm py-2 text-slate-500">
                            Already have an account?
                            <Link to="/login" className="text-violet-600 font-semibold cursor-pointer hover:underline ml-2">
                                Login
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
