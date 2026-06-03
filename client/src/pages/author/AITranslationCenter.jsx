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
        e.preventDefault();
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
        <div className="flex-1 bg-[rgb(219,218,218)] dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-6 md:p-10 overflow-y-auto font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🌐</span> AI Translation Center Workspace
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Translate entire blog posts, paragraphs, or outline metadata while preserving formatting.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                {/* Source Column */}
                <div className="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl p-6 flex flex-col justify-between shadow-lg transition-shadow">
                    <form onSubmit={handleTranslate} className="space-y-5 flex-grow flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Source Content (HTML / Text)</label>
                                <select
                                    value={lang}
                                    onChange={(e) => setLang(e.target.value)}
                                    className="bg-[rgb(219,218,218)] dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl px-3 py-1.5 outline-none text-xs text-slate-700 dark:text-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all shadow-lg"
                                >
                                    <option value="Hindi">Hindi (हिंदी)</option>
                                    <option value="Telugu">Telugu (తెలుగు)</option>
                                    <option value="Tamil">Tamil (தமிழ்)</option>
                                    <option value="Spanish">Spanish (Español)</option>
                                    <option value="French">French (Français)</option>
                                </select>
                            </div>
                            <textarea
                                value={sourceText}
                                onChange={(e) => setSourceText(e.target.value)}
                                placeholder="Paste paragraph or HTML block here..."
                                className="w-full h-80 bg-[rgb(219,218,218)] dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl p-3 outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none shadow-lg"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !sourceText.trim()}
                            className="mt-4 w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl cursor-pointer disabled:opacity-50 transition shadow-lg shadow-violet-500/25"
                        >
                            {loading ? "Translating Content..." : "Translate Block"}
                        </button>
                    </form>
                </div>

                {/* Target Column */}
                <div className="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl p-6 flex flex-col min-h-[400px] shadow-lg transition-shadow">
                    <div className="flex justify-between items-center border-b border-transparent dark:border-slate-700 pb-3 mb-4">
                        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Translation Output ({lang})</h3>
                        {translatedText && (
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(translatedText.replace(/<[^>]*>/g, ""));
                                    toast.success("Translation copied");
                                }}
                                className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                            >
                                Copy Plain Text
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center py-24 space-y-4 flex-grow justify-center">
                            <div className="w-8 h-8 rounded-full border-2 border-t-violet-600 animate-spin" />
                            <p className="text-xs text-slate-400">Gemini translating while maintaining structures...</p>
                        </div>
                    ) : translatedText ? (
                        <div className="reset-tw text-sm leading-relaxed overflow-y-auto max-h-[350px] border border-transparent dark:border-slate-700 bg-[rgb(219,218,218)] dark:bg-slate-900/35 p-4 rounded-xl shadow-lg" dangerouslySetInnerHTML={{ __html: translatedText }}></div>
                    ) : (
                        <div className="text-center py-24 text-slate-400 dark:text-slate-500 text-sm flex-grow flex items-center justify-center">
                            Translated content outputs will render here side-by-side.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AITranslationCenter;
