import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const Newsletter = () => {
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;

        try {
            setSubmitting(true);
            const { data } = await axios.post("/api/user/subscribe", { email });
            if (data.success) {
                toast.success(data.message);
                setEmail("");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center text-center space-y-2 my-32 mx-6 p-8 sm:p-12 bz-card border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative overflow-hidden max-w-4xl md:mx-auto transition-colors duration-300 shadow-xl">
            {/* Soft decorative background circles inside the newsletter panel */}
            <div className="absolute top-[-50px] right-[-50px] w-48 h-48 rounded-full bg-violet-500/10 blur-[40px] -z-10" />
            <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 rounded-full bg-indigo-500/10 blur-[40px] -z-10" />

            <h2 className="md:text-4xl text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading transition-colors duration-300">
                Never Miss a Blog!
            </h2>
            <p className="md:text-base text-slate-600 dark:text-slate-400 pb-6 max-w-md font-medium transition-colors duration-300">
                Subscribe to get the latest blog, new tech, and exclusive news.
            </p>
            
            <form onSubmit={handleSubscribe} className="flex items-center justify-between max-w-xl w-full border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-1.5 focus-within:border-violet-500/60 focus-within:ring-4 focus-within:ring-violet-500/10 transition-all duration-300">
                <input 
                    className="w-full pl-4 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-500 font-medium bg-[rgb(219,218,218)] dark:bg-slate-900 text-sm transition-colors duration-300" 
                    type="email" 
                    placeholder="Enter your email id" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button 
                    type="submit" 
                    disabled={submitting}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-8 py-2.5 rounded-xl shadow-[0_4px_12px_rgba(124,58,237,0.2)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer font-bold whitespace-nowrap text-sm disabled:opacity-50"
                >
                    {submitting ? "Subscribing..." : "Subscribe"}
                </button>
            </form>
        </div>
    );
};

export default Newsletter;
