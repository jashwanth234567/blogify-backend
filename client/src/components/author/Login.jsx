import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const Login = () => {
    const { axios, setToken } = useAppContext();

    const [isLoginState, setIsLoginState] = useState(true);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post("/api/user/" + (isLoginState ? "login" : "register"), { name, email, password });
            if (data.success) {
                setToken(data.token);
                localStorage.setItem("token", data.token);
                axios.defaults.headers.common["Authorization"] = data.token;
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen relative overflow-hidden">
            {/* Ambient background glow blobs */}
            <div className="absolute top-[-100px] left-[-10%] w-[450px] h-[450px] rounded-full bg-violet-400/20 blur-[80px] -z-10 animate-float-slow" />
            <div className="absolute bottom-[-100px] right-[-10%] w-[450px] h-[450px] rounded-full bg-indigo-400/25 blur-[80px] -z-10 animate-float-medium" />

            <div className="w-full max-w-md p-8 max-md:m-6 border border-violet-200/50 bg-white/60 dark:bg-slate-900/60 dark:border-slate-800/60 backdrop-blur-xl shadow-2xl shadow-violet-300/20 dark:shadow-violet-900/20 rounded-2xl">
                <div className="flex flex-col items-center justify-center">
                    <div className="w-full pb-6 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Sign</span> {isLoginState ? "In" : "Up"}
                        </h1>
                        <p className="font-medium text-xs text-slate-400/80 pt-3 max-w-64 mx-auto">{isLoginState ? "Enter your credentials to access the author panel" : "Create a new account to add blogs and share your thoughts"}</p>
                    </div>
                    <form onSubmit={handleSubmit} className="w-full text-slate-600">
                        {!isLoginState && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider"> Name </label>
                                <input onChange={(e) => setName(e.target.value)} value={name} type="text" required placeholder="your name" className="border border-transparent bg-white/90 rounded-xl p-2.5 outline-none mb-4 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all duration-300 text-sm placeholder-slate-400" />
                            </div>
                        )}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider"> Email </label>
                            <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" required placeholder="user@example.com" className="border border-transparent bg-white/90 rounded-xl p-2.5 outline-none mb-4 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all duration-300 text-sm placeholder-slate-400" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider"> Password </label>
                            <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" required placeholder="password" className="border border-transparent bg-white/90 rounded-xl p-2.5 outline-none mb-6 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all duration-300 text-sm placeholder-slate-400" />
                        </div>
                        <button type="submit" className="w-full py-3 font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-lg hover:shadow-violet-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer text-sm">
                            {isLoginState ? "Login" : "Sign Up"}
                        </button>
                        <p className="mt-4 text-center text-sm py-2 text-slate-500">
                            {isLoginState ? "Don't have an account?" : "Already have an account?"}
                            <span onClick={() => setIsLoginState(!isLoginState)} className="text-violet-600 font-semibold cursor-pointer hover:underline ml-2">
                                {isLoginState ? "Sign Up" : "Login"}
                            </span>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
