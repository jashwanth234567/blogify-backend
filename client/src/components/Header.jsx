import { useRef } from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const Header = () => {
    const { setInput, input, navigate } = useAppContext();
    const inputRef = useRef();

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setInput(inputRef.current.value);
    };

    const onClear = () => {
        setInput("");
        inputRef.current.value = "";
    };

    return (
        <div className="relative text-slate-800 dark:text-slate-100 overflow-hidden pt-12 pb-20 px-8 sm:px-16 xl:px-24">
            
            {/* Glowing mesh blobs (Animated Particles style background) */}
            <div className="absolute top-[-10%] left-[-15%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[90px] -z-10 animate-float-slow" />
            <div className="absolute top-[20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-indigo-600/10 blur-[85px] -z-10 animate-float-medium" />
            <div className="absolute bottom-[-10%] left-[30%] w-[300px] h-[300px] rounded-full bg-violet-400/5 blur-[70px] -z-10 animate-pulse-slow" />

            {/* Glowing Particle dots */}
            <div className="absolute top-10 left-[20%] w-2 h-2 rounded-full bg-violet-500/40 animate-pulse duration-[3s]" />
            <div className="absolute top-40 right-[15%] w-3 h-3 rounded-full bg-indigo-500/30 animate-pulse duration-[5s]" style={{ animationDelay: "1.5s" }} />
            <div className="absolute bottom-20 left-[15%] w-1.5 h-1.5 rounded-full bg-violet-400/40 animate-pulse duration-[4s]" />

            <div className="text-center max-w-4xl mx-auto space-y-8">
                {/* Feature highlight Pill */}
                <div className="inline-flex items-center gap-2.5 px-4 py-1 bg-slate-100 dark:bg-slate-800/80 border border-transparent/60 dark:border-slate-700/60 rounded-full text-xs text-violet-600 dark:text-violet-300 shadow-lg cursor-default transition hover:border-violet-500/30">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                    </span>
                    <span className="font-semibold tracking-wide">Enterprise SaaS Platform Live</span>
                </div>

                {/* Hero Title */}
                <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] font-heading max-w-3xl mx-auto">
                    The Modern Writing Studio <br />
                    <span className="shimmer-text">Powered by Gemini AI</span>
                </h1>

                <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                    Blogify is the premium SaaS platform built for creators, marketers, and developers. Co-write with AI, translate content instantly, synthesize human-like voice read-alouds, and monitor analytics from a single command center.
                </p>

                {/* CTA Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                    <button
                        onClick={() => navigate("/author")}
                        className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl cursor-pointer shadow-[0_4px_12px_rgba(124,58,237,0.2)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                    >
                        Get Started Free
                    </button>
                    <button
                        onClick={() => {
                            const element = document.getElementById("blog-list");
                            element?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="px-8 py-3.5 bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold rounded-xl cursor-pointer hover:bg-[rgb(219,218,218)] dark:hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    >
                        Explore Articles
                    </button>
                </div>

                {/* Search Bar */}
                <form onSubmit={onSubmitHandler} className="flex justify-between max-w-lg mx-auto border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-1.5 focus-within:ring-4 focus-within:ring-violet-500/10 focus-within:border-violet-500/50 transition duration-300">
                    <input ref={inputRef} type="text" placeholder="Search articles, keywords, categories..." required className="w-full pl-4 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-500 font-bold bg-[rgb(219,218,218)] dark:bg-slate-900 text-sm" />
                    <button type="submit" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-8 py-2.5 rounded-xl hover:shadow hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer font-extrabold text-sm">
                        Search
                    </button>
                </form>

                {input && (
                    <div className="text-center pt-2">
                        <button onClick={onClear} className="border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850 hover:bg-[rgb(219,218,218)] dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs py-1.5 px-4 rounded-full transition cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                            Clear Search
                        </button>
                    </div>
                )}
            </div>

            {/* Statistics Counters */}
            <div className="max-w-5xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="bz-card bz-stat flex flex-col justify-center items-center py-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">15k+</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Blogs Published</p>
                </div>
                <div className="bz-card bz-stat flex flex-col justify-center items-center py-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">4.2M</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Reader Views</p>
                </div>
                <div className="bz-card bz-stat flex flex-col justify-center items-center py-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">99.8%</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Translation Accuracy</p>
                </div>
                <div className="bz-card bz-stat flex flex-col justify-center items-center py-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">1.2s</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">AI Gen Uptime</p>
                </div>
            </div>

            {/* Anchor point for scrolling */}
            <div id="blog-list" />
        </div>
    );
};

export default Header;
