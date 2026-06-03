import React from "react";

const SystemReports = () => {
    const logs = [
        { service: "MongoDB Cluster", status: "Healthy", latency: "42ms", time: "Just now" },
        { service: "Cloudinary CDN", status: "Healthy", latency: "124ms", time: "2m ago" },
        { service: "Gemini API Gateway", status: "Healthy", latency: "250ms", time: "5m ago" },
        { service: "Nodemailer SMTP Transporter", status: "Healthy", latency: "89ms", time: "12m ago" }
    ];

    return (
        <div className="flex-1 bg-[rgb(219,218,218)] dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-6 md:p-10 overflow-y-auto font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📡</span> System Analytics &amp; Reports
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Monitor server uptime, diagnostic checks, API response latency, and cluster statistics.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                    { value: "99.98%", label: "Server Uptime", color: "text-slate-900 dark:text-white" },
                    { value: "Active", label: "Mongoose Connection", color: "text-emerald-600 dark:text-emerald-450" },
                    { value: "182ms", label: "Average Response Latency", color: "text-slate-900 dark:text-white" },
                    { value: "0%", label: "HTTP Error Rate", color: "text-slate-900 dark:text-white" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-6 rounded-2xl shadow-lg transition-shadow">
                        <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-bold">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* SVG Latency Chart */}
            <div className="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl p-6 mb-10 shadow-lg transition-shadow">
                <h2 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-6 uppercase tracking-wider">Gateway API Response Latency (24h)</h2>
                <div className="w-full h-64 relative bg-[rgb(219,218,218)] dark:bg-slate-900/50 rounded-xl p-4 border border-transparent dark:border-slate-700/80 shadow-inner">
                    <svg viewBox="0 0 500 150" className="w-full h-full">
                        <line x1="0" y1="30" x2="500" y2="30" stroke="#cbd5e1" strokeDasharray="4" />
                        <line x1="0" y1="75" x2="500" y2="75" stroke="#cbd5e1" strokeDasharray="4" />
                        <line x1="0" y1="120" x2="500" y2="120" stroke="#cbd5e1" strokeDasharray="4" />
                        <defs>
                            <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25"/>
                                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"/>
                            </linearGradient>
                        </defs>
                        <path d="M 0 150 Q 80 130 150 110 T 300 80 T 450 100 T 500 150" fill="url(#latencyGrad)" />
                        <path d="M 0 150 Q 80 130 150 110 T 300 80 T 450 100 T 500 150" fill="none" stroke="#10b981" strokeWidth="3" />
                    </svg>
                    <div className="absolute top-4 left-6 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Optimal Gateway Target: Under 300ms</div>
                </div>
            </div>

            {/* Health logs */}
            <div className="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl p-6 shadow-lg transition-shadow">
                <h2 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-4 uppercase tracking-wider">Service Diagnostics Health Summary</h2>
                <div className="relative overflow-x-auto rounded-xl border border-transparent dark:border-slate-700/50 shadow-lg">
                    <table className="w-full text-sm text-slate-600 dark:text-slate-400 text-left">
                        <thead className="text-xs uppercase text-slate-500 dark:text-slate-500 border-b border-transparent dark:border-slate-700 bg-[rgb(219,218,218)] dark:bg-slate-900/40">
                            <tr>
                                <th className="py-3 px-4 font-bold">Service Gateway</th>
                                <th className="py-3 px-4 font-bold">State</th>
                                <th className="py-3 px-4 font-bold">Latency Rate</th>
                                <th className="py-3 px-4 font-bold">Last Check</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log, idx) => (
                                <tr key={idx} className="border-b border-slate-250 dark:border-slate-700/40 hover:bg-[rgb(219,218,218)] dark:hover:bg-slate-700/20 transition-colors">
                                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-white">{log.service}</td>
                                    <td className="py-3.5 px-4">
                                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-200">{log.latency}</td>
                                    <td className="py-3.5 px-4 text-xs">{log.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SystemReports;
