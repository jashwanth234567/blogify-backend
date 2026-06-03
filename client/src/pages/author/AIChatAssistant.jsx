import { useState, useRef, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const AIChatAssistant = () => {
    const { axios } = useAppContext();
    const [message, setMessage] = useState("");
    const [history, setHistory] = useState([
        { role: "model", text: "Welcome to the Dedicated AI Chat Studio. Ask me to refine drafts, brainstorm titles, structure newsletters, or build outlines!" }
    ]);
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    const handleSendMessage = async (e, customMsg = null) => {
        if (e) e.preventDefault();
        const sendText = customMsg || message;
        if (!sendText.trim()) return;

        const updatedHistory = [...history, { role: "user", text: sendText }];
        setHistory(updatedHistory);
        setMessage("");
        setLoading(true);

        try {
            const { data } = await axios.post("/api/ai/chat", {
                message: sendText,
                history: history.map(h => ({ role: h.role, text: h.text }))
            });
            if (data.success) {
                setHistory([...updatedHistory, { role: "model", text: data.reply }]);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);

    return (
        <div className="flex-1 bg-[rgb(219,218,218)] dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col h-full overflow-hidden font-sans">
            {/* Top Workspace Header */}
            <div className="p-5 border-b border-transparent dark:border-slate-800 bg-white dark:bg-slate-900/80 flex justify-between items-center shadow-lg">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <span>✨</span> AI Chat Assistant Workspace
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Chat directly with Gemini API to co-write, refine, or review content assets.</p>
                </div>
                <button
                    onClick={() => setHistory([{ role: "model", text: "History cleared. How can I help you write today?" }])}
                    className="px-3.5 py-1.5 border border-transparent dark:border-slate-700 hover:border-transparent dark:hover:border-slate-600 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-[rgb(219,218,218)] dark:hover:bg-slate-700 text-xs rounded-xl transition duration-200 cursor-pointer font-semibold"
                >
                    Clear History
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Chat Panel */}
                <div className="flex-grow flex flex-col justify-between overflow-hidden">
                    <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-[rgb(219,218,218)] dark:bg-slate-900/30">
                        {history.map((item, idx) => (
                            <div key={idx} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[75%] p-4 rounded-2xl leading-relaxed text-sm shadow-lg ${
                                    item.role === "user"
                                        ? "bg-violet-600 text-white rounded-tr-none shadow-violet-500/20"
                                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-transparent dark:border-slate-700 rounded-tl-none shadow-lg"
                                }`}>
                                    <p className="whitespace-pre-line">{item.text}</p>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl rounded-tl-none p-4 flex items-center gap-2 shadow-lg">
                                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Entry Form */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-900/80 border-t border-transparent dark:border-slate-800/80 flex gap-3 shadow-lg">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type writing instruction..."
                            className="flex-grow bg-[rgb(219,218,218)] dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl px-4 py-3 outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-505 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all shadow-lg"
                        />
                        <button
                            type="submit"
                            disabled={loading || !message.trim()}
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition duration-200 px-6 py-3 text-white text-sm font-semibold rounded-2xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25"
                        >
                            Send
                        </button>
                    </form>
                </div>

                {/* Prompts Guide Sidebar */}
                <div className="w-72 border-l border-transparent dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 hidden xl:block space-y-5 overflow-y-auto shadow-lg">
                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Recommended Actions</h3>
                    <div className="space-y-3">
                        {[
                            { icon: "✍️", title: "Rewrite Text", desc: "Improve vocabulary and style flow.", msg: "Rewrite the following text to sound more engaging and professional: [Paste text]" },
                            { icon: "🔍", title: "Keyword Suggestions", desc: "Get tag and query options for SEO ranking.", msg: "Suggest 5 high-converting SEO keyword queries for a blog post about: [Topic]" },
                            { icon: "📋", title: "Outline Builder", desc: "Map sub-sections before drafting.", msg: "Generate an outline with headings and bullet points for an article titled: [Topic]" },
                            { icon: "💡", title: "Title Generator", desc: "Generate titles with high click-rates.", msg: "Create an optimized meta description and title tags for an article about: [Topic]" },
                        ].map((item, i) => (
                            <div
                                key={i}
                                onClick={() => setMessage(item.msg)}
                                className="p-3 border border-transparent dark:border-slate-700/80 hover:border-violet-300 dark:hover:border-slate-600 hover:bg-violet-50/50 dark:hover:bg-slate-800/30 bg-[rgb(219,218,218)] dark:bg-transparent rounded-xl cursor-pointer transition-all duration-200 shadow-lg"
                            >
                                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">{item.icon} {item.title}</h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChatAssistant;
