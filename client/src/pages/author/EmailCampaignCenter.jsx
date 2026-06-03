import { useState } from "react";
import toast from "react-hot-toast";

const EmailCampaignCenter = () => {
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendCampaign = (e) => {
        e.preventDefault();
        if (!subject.trim() || !body.trim()) return toast.error("Please fill in both fields");
        setLoading(true);
        setTimeout(() => {
            setSubject("");
            setBody("");
            setLoading(false);
            toast.success("Newsletter campaign queued for delivery");
        }, 1500);
    };

    return (
        <div className="flex-1 bg-[rgb(219,218,218)] dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-6 md:p-10 overflow-y-auto font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <span>✉️</span> Email Campaign Studio
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Design, preview, and queue automated newsletter campaigns to all subscribed users.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form column */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl p-6 shadow-lg transition-shadow">
                    <form onSubmit={handleSendCampaign} className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Campaign Subject Line</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g. Weekly tech digest: Inside Gemini 2.5 APIs!"
                                className="w-full bg-[rgb(219,218,218)] dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl p-3 outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-505 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all shadow-lg"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Campaign HTML Body</label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="Write email body content..."
                                className="w-full h-64 bg-[rgb(219,218,218)] dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl p-3 outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-505 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none shadow-lg"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !subject.trim() || !body.trim()}
                            className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl cursor-pointer disabled:opacity-50 transition shadow-lg shadow-violet-500/25"
                        >
                            {loading ? "Queueing campaign..." : "Dispatch Campaign"}
                        </button>
                    </form>
                </div>

                {/* Status Column */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl p-6 shadow-lg transition-shadow">
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 border-b border-transparent dark:border-slate-700 pb-3 mb-6">Delivery Statistics</h3>
                        <div className="space-y-4">
                            {[
                                { label: "Total Subscribers", value: "1,480 recipients", color: "text-slate-800 dark:text-white" },
                                { label: "Avg Delivery Success Rate", value: "99.8%", color: "text-emerald-600 dark:text-emerald-400" },
                                { label: "Average Email Open Rate", value: "42.5%", color: "text-slate-800 dark:text-white" },
                            ].map((stat, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-transparent dark:border-slate-700/50 last:border-0">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</span>
                                    <span className={`text-xs font-bold ${stat.color}`}>{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl p-6 shadow-lg transition-shadow">
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 border-b border-transparent dark:border-slate-700 pb-3 mb-4">Historical Campaigns</h3>
                        <div className="space-y-4">
                            {[
                                { title: "Introducing Blogify memberships!", meta: "Sent to 1,420 users • 99.8% Success • 2026-05-15" },
                                { title: "May AI content compilation", meta: "Sent to 1,380 users • 99.5% Success • 2026-05-01" },
                            ].map((c, i) => (
                                <div key={i} className="pb-3 border-b border-transparent dark:border-slate-700/50 last:border-0 last:pb-0">
                                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">{c.title}</h4>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{c.meta}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailCampaignCenter;
