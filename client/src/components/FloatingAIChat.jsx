import { useState, useRef, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const FloatingAIChat = () => {
    const { token } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([
        { role: "model", text: "Hello! I am your Blogify AI writing partner. How can I help you write, optimize, or check grammar today?" }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [chatHistory, isOpen]);

    const handleSendMessage = async (e, customMsg = null) => {
        if (e) e.preventDefault();
        const textToSend = (customMsg || message).trim();
        if (!textToSend || loading) return;

        const newHistory = [...chatHistory, { role: "user", text: textToSend }];
        setChatHistory([...newHistory, { role: "model", text: "" }]);
        setMessage("");
        setLoading(true);

        try {
            const envUrl = import.meta.env.VITE_BASE_URL;
            const backendUrl = (envUrl && envUrl.trim() !== "") ? envUrl : "https://blogify-backend1.onrender.com";
            const response = await fetch(`${backendUrl}/api/ai/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: token } : {})
                },
                body: JSON.stringify({
                    message: textToSend,
                    history: newHistory.map(h => ({ role: h.role, text: h.text }))
                })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            if (!response.body) {
                throw new Error("Streaming not supported in this browser.");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiText = "";
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                // Accumulate into buffer to handle split SSE events
                buffer += decoder.decode(value, { stream: true });

                // Process complete lines from buffer
                const lines = buffer.split("\n");
                // Keep the last (potentially incomplete) line in the buffer
                buffer = lines.pop() || "";

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || !trimmed.startsWith("data:")) continue;

                    const dataStr = trimmed.slice(5).trim(); // Remove "data:" prefix
                    if (dataStr === "[DONE]") continue; // Stream ended marker

                    try {
                        const parsed = JSON.parse(dataStr);
                        if (parsed.error) {
                            toast.error(parsed.error);
                        } else if (parsed.chunk !== undefined) {
                            aiText += parsed.chunk;
                            setChatHistory(prev => {
                                const updated = [...prev];
                                updated[updated.length - 1] = { role: "model", text: aiText };
                                return updated;
                            });
                            scrollToBottom();
                        }
                    } catch {
                        // Silently ignore malformed JSON lines
                    }
                }
            }

            // If no text was received, set a fallback
            if (!aiText) {
                setChatHistory(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: "model", text: "I couldn't generate a response. Please try again." };
                    return updated;
                });
            }

        } catch (error) {
            console.error("[FloatingAIChat] Error:", error.message);
            setChatHistory(prev => {
                const updated = [...prev];
                // Replace empty model bubble with error message
                updated[updated.length - 1] = { role: "model", text: "Sorry, something went wrong. Please try again." };
                return updated;
            });
            toast.error("AI Chat error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAction = (action) => {
        const msgs = {
            grammar: "Can you check and improve the grammar of this text: [Paste your text here]",
            seo: "Generate SEO keywords and meta description for a blog about: [Enter your topic]",
            outline: "Create a detailed outline for an article about: [Enter your topic]",
            titles: "Suggest 3 catchy SEO-friendly blog titles about: [Enter your topic]"
        };
        const msg = msgs[action];
        if (msg) {
            setMessage(msg);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
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
                    <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">✨</span>
                            <div>
                                <h4 className="text-sm font-bold text-slate-100">AI Writing Partner</h4>
                                <span className="text-[10px] text-violet-400 font-semibold flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Powered by Gemini AI
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-slate-400 hover:text-slate-200 transition-colors text-lg leading-none cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
                        {chatHistory.map((h, i) => (
                            <div key={i} className={`flex ${h.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                                    h.role === "user"
                                        ? "bg-violet-600 text-white rounded-tr-none"
                                        : "bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-none"
                                }`}>
                                    {h.text ? (
                                        <p className="whitespace-pre-line">{h.text}</p>
                                    ) : (
                                        // Pulsing loading dots inside the model bubble
                                        <span className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Action Pills */}
                    <div className="px-3 py-2 border-t border-slate-800/50 flex gap-2 overflow-x-auto scrollbar-none whitespace-nowrap bg-slate-950/30 shrink-0">
                        <button onClick={() => handleQuickAction("grammar")} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-full border border-slate-700/50 cursor-pointer transition-colors shrink-0">✍️ Fix Grammar</button>
                        <button onClick={() => handleQuickAction("outline")} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-full border border-slate-700/50 cursor-pointer transition-colors shrink-0">📋 Outline</button>
                        <button onClick={() => handleQuickAction("seo")} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-full border border-slate-700/50 cursor-pointer transition-colors shrink-0">🔍 Keywords</button>
                        <button onClick={() => handleQuickAction("titles")} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-full border border-slate-700/50 cursor-pointer transition-colors shrink-0">💡 Titles</button>
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2 items-center shrink-0">
                        <input
                            ref={inputRef}
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ask Gemini AI..."
                            disabled={loading}
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-violet-500/50 disabled:opacity-60 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={loading || !message.trim()}
                            className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center text-white cursor-pointer hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
