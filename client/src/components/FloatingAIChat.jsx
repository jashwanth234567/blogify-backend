import { useState, useRef, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const FloatingAIChat = () => {
    const { axios, token } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([
        { role: "model", text: "Hello! I am your Blogify AI writing partner. How can I help you write, optimize, or check grammar today?" }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [chatHistory, isOpen]);

    const handleSendMessage = async (e, customMsg = null) => {
        if (e) e.preventDefault();
        const textToSend = customMsg || message;
        if (!textToSend.trim()) return;

        const newHistory = [...chatHistory, { role: "user", text: textToSend }];
        setChatHistory(newHistory);
        setMessage("");
        setLoading(true);

        try {
            const { data } = await axios.post("/api/ai/chat", {
                message: textToSend,
                history: chatHistory.map(h => ({ role: h.role, text: h.text }))
            });

            if (data.success) {
                setChatHistory([...newHistory, { role: "model", text: data.reply }]);
            } else {
                toast.error(data.message || "Failed to generate reply");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAction = (action) => {
        let msg = "";
        switch (action) {
            case "grammar":
                msg = "Can you check and improve the grammar of this text: [Paste text]";
                break;
            case "seo":
                msg = "Generate some SEO keywords and suggestions for a blog about: [Enter topic]";
                break;
            case "outline":
                msg = "Create a detailed outline for an article about: [Enter topic]";
                break;
            case "titles":
                msg = "Suggest 3 catchy blog titles about: [Enter topic]";
                break;
            default:
                break;
        }
        setMessage(msg);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-full flex items-center justify-center text-2xl shadow-xl shadow-violet-600/30 text-white cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 relative group glow-purple"
                aria-label="AI Chat Assistant"
            >
                {isOpen ? "✕" : "✨"}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500"></span>
                    </span>
                )}
                {/* Tooltip */}
                <span className="absolute right-16 scale-0 group-hover:scale-100 bg-slate-900 border border-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap duration-200 shadow shadow-violet-600/10">
                    Blogify AI Assistant
                </span>
            </button>

            {/* Chat Dialog Widget */}
            {isOpen && (
                <div className="absolute bottom-18 right-0 w-80 sm:w-96 h-[500px] bg-slate-900/95 border border-violet-500/20 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">✨</span>
                            <div>
                                <h4 className="text-sm font-bold text-slate-100">AI Writing Partner</h4>
                                <span className="text-[10px] text-violet-400 font-semibold flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Powered by Gemini 2.5
                                </span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-200">✕</button>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {chatHistory.map((h, i) => (
                            <div key={i} className={`flex ${h.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed ${h.role === "user" ? "bg-violet-600 text-white rounded-tr-none" : "bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-none"}`}>
                                    <p className="whitespace-pre-line">{h.text}</p>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-tl-none p-3 text-sm flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Action Suggestion pills */}
                    <div className="px-4 py-2 border-t border-slate-800/50 flex gap-2 overflow-x-auto scrollbar-none whitespace-nowrap bg-slate-950/20">
                        <button onClick={() => handleQuickAction("grammar")} className="px-3 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs rounded-full border border-slate-700/50 cursor-pointer">✍️ Fix Grammar</button>
                        <button onClick={() => handleQuickAction("outline")} className="px-3 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs rounded-full border border-slate-700/50 cursor-pointer">📋 Outline</button>
                        <button onClick={() => handleQuickAction("seo")} className="px-3 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs rounded-full border border-slate-700/50 cursor-pointer">🔍 Keywords</button>
                        <button onClick={() => handleQuickAction("titles")} className="px-3 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs rounded-full border border-slate-700/50 cursor-pointer">💡 Titles</button>
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2 items-center">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ask Gemini..."
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-violet-500/50"
                        />
                        <button
                            type="submit"
                            disabled={loading || !message.trim()}
                            className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center text-white cursor-pointer hover:bg-violet-750 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            ➤
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default FloatingAIChat;
