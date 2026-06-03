import React from "react";

const AIAnalytics = () => {
    return (
        <div className="flex-1 bg-[rgb(219,218,218)] dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-6 md:p-10 overflow-y-auto font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📊</span> AI Analytics &amp; Performance
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Track Gemini API credit utilization, token allocation, and article engagement logs.</p>
            </div>

            {/* Stat row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                    { value: "48,250", label: "Tokens Spent This Month" },
                    { value: "150,000", label: "Total Monthly Allowance" },
                    { value: "12.5s", label: "Avg AI Response Latency" },
                    { value: "98.5%", label: "Prompt Success Rate" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-6 rounded-2xl shadow-lg transition-shadow">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-semibold">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* SVG Usage Chart */}
            <div className="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl p-6 mb-10 shadow-lg transition-shadow">
                <h2 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-6 uppercase tracking-wider">AI Generation History (Daily Spends)</h2>
                <div className="w-full h-64 relative bg-[rgb(219,218,218)] dark:bg-slate-900/50 rounded-xl p-4 border border-transparent dark:border-slate-700/80">
                    <svg viewBox="0 0 500 150" className="w-full h-full">
                        <line x1="0" y1="30" x2="500" y2="30" stroke="#cbd5e1" className="dark:stroke-slate-700" strokeDasharray="4" />
                        <line x1="0" y1="75" x2="500" y2="75" stroke="#cbd5e1" className="dark:stroke-slate-700" strokeDasharray="4" />
                        <line x1="0" y1="120" x2="500" y2="120" stroke="#cbd5e1" className="dark:stroke-slate-700" strokeDasharray="4" />
                        <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3"/>
                                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0"/>
                            </linearGradient>
                        </defs>
                        <path d="M 0 150 Q 100 120 150 90 T 300 40 T 450 70 T 500 150" fill="url(#chartGrad)" />
                        <path d="M 0 150 Q 100 120 150 90 T 300 40 T 450 70 T 500 150" fill="none" stroke="#8b5cf6" strokeWidth="3" />
                        <circle cx="300" cy="40" r="5" fill="#f97316" className="animate-pulse" />
                    </svg>
                    <div className="absolute top-4 left-6 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Peak Utilisation: 3,450 tokens</div>
                </div>
            </div>

            {/* AI History Table log */}
            <div className="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl p-6 shadow-lg transition-shadow">
                <h2 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-4 uppercase tracking-wider">AI Operations Log</h2>
                <div className="relative overflow-x-auto rounded-xl border border-transparent dark:border-slate-700/50 shadow-lg">
                    <table className="w-full text-sm text-slate-600 dark:text-slate-400 text-left">
                        <thead className="text-xs uppercase text-slate-500 dark:text-slate-500 border-b border-transparent dark:border-slate-700 bg-[rgb(219,218,218)] dark:bg-slate-900/40">
                            <tr>
                                <th className="py-3 px-4 font-bold">Action</th>
                                <th className="py-3 px-4 font-bold">Prompt Description</th>
                                <th className="py-3 px-4 font-bold">Tokens Used</th>
                                <th className="py-3 px-4 font-bold">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { action: "Generate Blog", desc: "Tailwind CSS v4 upgrades outline...", tokens: "1,850", time: "2026-06-01 14:10" },
                                { action: "Translate Blog", desc: "Taxes on Luxury Houses translated to Spanish...", tokens: "950", time: "2026-06-01 12:45" },
                                { action: "Generate Summary", desc: "study hacks for college students summary...", tokens: "480", time: "2026-05-31 09:30" },
                            ].map((row, i) => (
                                <tr key={i} className="border-b border-transparent dark:border-slate-700/40 hover:bg-[rgb(219,218,218)] dark:hover:bg-slate-700/20 transition-colors">
                                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-white">{row.action}</td>
                                    <td className="py-3.5 px-4 truncate max-w-[200px] text-slate-600 dark:text-slate-400">{row.desc}</td>
                                    <td className="py-3.5 px-4 text-violet-600 dark:text-violet-400 font-bold">{row.tokens}</td>
                                    <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">{row.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AIAnalytics;
