import React from "react";

const AINewsCenter = () => {
    const aiNews = [
        {
            title: "Gemini 2.5 Flash: Revolutionizing Real-time Conversational APIs",
            source: "AI Tech Weekly",
            date: "May 28, 2026",
            summary: "Google introduces Gemini 2.5 Flash with massive latency reductions, making conversational logic and audio synthesis virtually instantaneous.",
            badge: "API Updates"
        },
        {
            title: "The Rise of Agents: Local LLMs Orchestrated via LangGraph Node Workspaces",
            source: "Developer Hub",
            date: "May 25, 2026",
            summary: "Orchestration libraries evolve to support offline local Mongoose models connected to micro-agents for autonomous database management.",
            badge: "Industry Trends"
        },
        {
            title: "Web Speech synthesis adds support for HD human-like vocalizers in browsers",
            source: "W3C Tech Blog",
            date: "May 20, 2026",
            summary: "Browsers implement updated neural TTS pipelines, enabling developers to run lifelike read-aloud widgets with zero API costs.",
            badge: "Web APIs"
        }
    ];

    const aiTools = [
        { name: "Gemini Pro 2.5", desc: "State-of-the-art multimodal logic", cost: "Free / Developer Credits" },
        { name: "LangGraph Studio", desc: "Visualize and debug multi-agent graphs", cost: "Paid Tier Available" },
        { name: "ElevenLabs Reader", desc: "Ultra-realistic text-to-speech engine", cost: "Usage Based Tier" },
        { name: "ScribeAI", desc: "Automate code documentation generation", cost: "Free Trial" }
    ];

    return (
        <div className="flex-1 bg-[rgb(219,218,218)] dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-6 md:p-10 overflow-y-auto font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📰</span> AI News &amp; Resources Center
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Get curated news on modern LLMs, trending developer tools, and tutorials.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* News feed column */}
                <div className="lg:col-span-8 space-y-6">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-transparent dark:border-slate-800 pb-3 flex items-center gap-2">
                        <span>🔥</span> Latest AI Industry News
                    </h2>
                    <div className="space-y-4">
                        {aiNews.map((news, i) => (
                            <div key={i} className="p-6 bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl shadow-lg transition-shadow hover:border-violet-300 dark:hover:border-slate-600 hover:shadow-lg duration-200">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="px-2.5 py-0.5 rounded bg-violet-100 dark:bg-violet-600/20 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/25 text-[10px] font-bold uppercase tracking-wider">
                                        {news.badge}
                                    </span>
                                    <span className="text-xs text-slate-400 dark:text-slate-500">{news.date}</span>
                                </div>
                                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 hover:text-violet-600 dark:hover:text-violet-400 transition cursor-pointer mb-2">
                                    {news.title}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{news.summary}</p>
                                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">Source: {news.source}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar tools column */}
                <div className="lg:col-span-4 space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-transparent dark:border-slate-800 pb-3 mb-4 flex items-center gap-2">
                            <span>🚀</span> Trending AI Tools
                        </h2>
                        <div className="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl p-4 space-y-3 shadow-lg transition-shadow">
                            {aiTools.map((tool, i) => (
                                <div key={i} className="p-3 bg-[rgb(219,218,218)] dark:bg-slate-900 border border-transparent dark:border-slate-700/50 rounded-xl hover:border-violet-300 dark:hover:border-slate-600 transition-all duration-200 shadow-lg">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">{tool.name}</h4>
                                        <span className="text-[9px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-transparent dark:border-slate-700">{tool.cost}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{tool.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-transparent dark:border-slate-800 pb-3 mb-4 flex items-center gap-2">
                            <span>📚</span> Learning Resources
                        </h2>
                        <div className="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl p-5 space-y-4 shadow-lg transition-shadow">
                            {[
                                { title: "Prompt Engineering Guide", desc: "Master few-shot prompts and structural outputs." },
                                { title: "RAG (Retrieval) Architecture", desc: "Connect models to Mongoose datastores securely." },
                                { title: "Multimodal API Walkthroughs", desc: "Generate image and text components simultaneously." },
                            ].map((item, i) => (
                                <div key={i} className="space-y-1 pb-3 border-b border-transparent dark:border-slate-700/50 last:border-0 last:pb-0">
                                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer transition">{item.title}</h4>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AINewsCenter;
