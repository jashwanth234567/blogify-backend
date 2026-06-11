import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const AITranslationCenter = () => {
    const { axios } = useAppContext();
    const [sourceText, setSourceText] = useState("");
    const [lang, setLang] = useState("Hindi");
    const [translatedText, setTranslatedText] = useState("");
    const [loading, setLoading] = useState(false);

    const handleTranslate = async (e) => {
        if (e) e.preventDefault();
        if (!sourceText.trim()) return toast.error("Please enter some text to translate");
        setLoading(true);
        try {
            const { data } = await axios.post("/api/ai/translate", {
                description: sourceText,
                targetLanguage: lang
            });
            if (data.success) {
                setTranslatedText(data.translated.description);
                toast.success("Translation Complete");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 bg-transparent dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-4 md:p-6 lg:p-10 overflow-y-auto font-sans relative">
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🌐</span> AI Translation Center
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Translate content across multiple languages while preserving HTML structures.</p>
            </div>

            {/* Top Toolbar (Tablet / Desktop) */}
            <div className="hidden md:flex justify-between items-center mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Target Language:</span>
                    <select
                        value={lang}
                        onChange={(e) => setLang(e.target.value)}
                        className="bg-transparent dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none text-sm text-slate-700 dark:text-slate-300 focus:border-violet-500 transition-all shadow-sm"
                    >
                        <option value="Hindi">Hindi (हिंदी)</option>
                        <option value="Telugu">Telugu (తెలుగు)</option>
                        <option value="Tamil">Tamil (தமிழ்)</option>
                        <option value="Spanish">Spanish (Español)</option>
                        <option value="French">French (Français)</option>
                    </select>
                </div>
                <button
                    onClick={handleTranslate}
                    disabled={loading || !sourceText.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-lg cursor-pointer disabled:opacity-50 transition shadow-md shadow-violet-500/20"
                >
                    {loading ? "Translating..." : "Translate Content"}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start pb-24 md:pb-0">
                
                {/* Source Column */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 md:p-6 flex flex-col shadow-sm">
                    {/* Mobile Language Selector */}
                    <div className="md:hidden mb-4">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Target Language</label>
                        <select
                            value={lang}
                            onChange={(e) => setLang(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none text-sm text-slate-700 dark:text-slate-300 focus:border-violet-500 transition-all"
                        >
                            <option value="Hindi">Hindi (हिंदी)</option>
                            <option value="Telugu">Telugu (తెలుగు)</option>
                            <option value="Tamil">Tamil (தமிழ்)</option>
                            <option value="Spanish">Spanish (Español)</option>
                            <option value="French">French (Français)</option>
                        </select>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Source Content</label>
                    </div>
                    <textarea
                        value={sourceText}
                        onChange={(e) => setSourceText(e.target.value)}
                        placeholder="Paste text or HTML here..."
                        className="w-full h-64 md:h-[400px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all resize-none shadow-inner"
                    />
                </div>

                {/* Target Column */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 md:p-6 flex flex-col min-h-[300px] md:min-h-[450px] shadow-sm">
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">
                        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Translation Output</h3>
                        {translatedText && (
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(translatedText.replace(/<[^>]*>/g, ""));
                                    toast.success("Translation copied");
                                }}
                                className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 cursor-pointer"
                            >
                                Copy Plain Text
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center flex-grow justify-center py-10">
                            <div className="w-8 h-8 rounded-full border-2 border-t-violet-600 animate-spin" />
                            <p className="text-xs text-slate-400 mt-4">Translating formatting...</p>
                        </div>
                    ) : translatedText ? (
                        <div className="reset-tw text-sm leading-relaxed overflow-y-auto max-h-[350px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl shadow-inner" dangerouslySetInnerHTML={{ __html: translatedText }}></div>
                    ) : (
                        <div className="text-center py-24 text-slate-400 dark:text-slate-500 text-sm flex-grow flex items-center justify-center">
                            Output will appear here.
                        </div>
                    )}
                </div>

                {/* Right Sidebar (Laptop Only) */}
                <div className="hidden xl:flex flex-col space-y-6">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Presets</h3>
                        <div className="space-y-2">
                            <button onClick={() => setLang("Spanish")} className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-100 dark:border-slate-700/50 cursor-pointer">🇺🇸 To Español</button>
                            <button onClick={() => setLang("French")} className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-100 dark:border-slate-700/50 cursor-pointer">🇺🇸 To Français</button>
                            <button onClick={() => setLang("Hindi")} className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-100 dark:border-slate-700/50 cursor-pointer">🇺🇸 To Hindi</button>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex-grow">
                        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Recent History</h3>
                        <div className="text-xs text-slate-400 text-center py-8">
                            No recent translations.
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Mobile Footer */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
                <button
                    onClick={handleTranslate}
                    disabled={loading || !sourceText.trim()}
                    className="w-full h-[48px] bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl cursor-pointer disabled:opacity-50 transition shadow-md flex items-center justify-center"
                >
                    {loading ? "Translating..." : "Translate Now"}
                </button>
            </div>
        </div>
    );
};

export default AITranslationCenter;
