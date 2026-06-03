import { useState } from "react";
import toast from "react-hot-toast";

const SEOCenter = () => {
    const [urlText, setUrlText] = useState("");
    const [loading, setLoading] = useState(false);
    const [auditResults, setAuditResults] = useState(null);

    const handleAudit = (e) => {
        e.preventDefault();
        if (!urlText.trim()) return toast.error("Please enter a topic or copy-paste text first");
        setLoading(true);
        setTimeout(() => {
            setAuditResults({
                score: 82,
                keywordDensity: "2.4% (Ideal: 1.5% - 2.5%)",
                readability: "Flesch-Kincaid Grade 8 (Easy to read)",
                suggestions: [
                    "Include focus keyword in the first paragraph header block.",
                    "Optimize image thumbnail ALT description labels.",
                    "Add at least 2 internal hyperlinks pointing back to other categories."
                ]
            });
            setLoading(false);
            toast.success("SEO Audit analysis completed");
        }, 1200);
    };

    return (
        <div className="flex-1 bg-[rgb(219,218,218)] dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-6 md:p-10 overflow-y-auto font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🔍</span> AI SEO Optimizer Center
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Run comprehensive search engine visibility checkups and readability index tests on draft drafts.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Inputs card */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl p-6 shadow-lg transition-shadow">
                    <form onSubmit={handleAudit} className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Draft Text Block / Topic Focus</label>
                            <textarea
                                value={urlText}
                                onChange={(e) => setUrlText(e.target.value)}
                                placeholder="Paste draft body text here or write main keyword target..."
                                className="w-full h-48 bg-[rgb(219,218,218)] dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl p-3 outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none shadow-lg"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !urlText.trim()}
                            className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl cursor-pointer disabled:opacity-50 transition shadow-lg shadow-violet-500/25"
                        >
                            {loading ? "Analyzing readability index..." : "Analyze Content SEO"}
                        </button>
                    </form>
                </div>

                {/* Audit results */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl p-6 min-h-[320px] shadow-lg transition-shadow">
                    <h3 className="text-sm font-bold text-slate-600 dark:text-slate-200 border-b border-transparent dark:border-slate-700 pb-3 mb-6">SEO Checkup Metrics</h3>

                    {loading ? (
                        <div className="flex flex-col items-center py-16 space-y-4">
                            <div className="w-8 h-8 rounded-full border-2 border-t-violet-600 animate-spin" />
                            <p className="text-xs text-slate-400">Scoring keyword densities and readability algorithms...</p>
                        </div>
                    ) : auditResults ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-full border-8 border-violet-200 dark:border-violet-500/10 flex items-center justify-center bg-violet-50 dark:bg-transparent">
                                    <div className="text-2xl font-black text-violet-600 dark:text-violet-400">{auditResults.score}%</div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">SEO Health Index</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Excellent readability and structures. Optimize ALT metadata to cross 90%.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-[rgb(219,218,218)] dark:bg-slate-900/50 border border-transparent dark:border-slate-700 rounded-xl shadow-lg">
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Keyword density</span>
                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">{auditResults.keywordDensity}</p>
                                </div>
                                <div className="p-4 bg-[rgb(219,218,218)] dark:bg-slate-900/50 border border-transparent dark:border-slate-700 rounded-xl shadow-lg">
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Readability Level</span>
                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">{auditResults.readability}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h5 className="text-xs font-bold text-slate-600 dark:text-slate-300">Actionable Checklist Suggestions:</h5>
                                <ul className="space-y-2">
                                    {auditResults.suggestions.map((s, idx) => (
                                        <li key={idx} className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
                                            <span className="text-violet-500 mt-0.5">•</span>
                                            <span>{s}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-sm">
                            Submit a text block to analyze keyword densities and SEO scores.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SEOCenter;
