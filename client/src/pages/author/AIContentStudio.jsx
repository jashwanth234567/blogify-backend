import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const AIContentStudio = () => {
    const { axios } = useAppContext();
    const [topic, setTopic] = useState("");
    const [tone, setTone] = useState("Professional");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAction = async (actionType) => {
        if (!topic.trim()) return toast.error("Please specify a topic or text first");
        setLoading(true);
        try {
            const { data } = await axios.post("/api/blog/generate", { prompt: topic });
            if (data.success) {
                setOutput(data.content);
                toast.success("AI Generation Complete");
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
        <div className="flex-1 bg-[rgb(219,218,218)] dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-6 md:p-10 overflow-y-auto font-sans flex flex-col">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🎙️</span> AI Content Studio Workspace
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Brainstorm outlines, draft structures, or generate tags for your upcoming published drafts.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-grow">
                {/* Inputs area */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl p-6 space-y-6 shadow-lg transition-shadow">
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Topic or Keyword Focus</label>
                        <textarea
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Enter a prompt (e.g. 'Benefits of eating apples every morning' or 'Tailwind CSS v4 updates')"
                            className="w-full h-32 bg-[rgb(219,218,218)] dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl p-3 outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none shadow-lg"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Content Tone</label>
                        <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full bg-[rgb(219,218,218)] dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl p-3 outline-none text-slate-700 dark:text-slate-300 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all shadow-lg"
                        >
                            <option value="Professional">💼 Professional &amp; Authoritative</option>
                            <option value="Informal">☕ Casual &amp; Friendly</option>
                            <option value="Technical">💻 Tech-oriented &amp; Detailed</option>
                            <option value="Creative">🎨 Artistic &amp; Inspiring</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => handleAction("outline")}
                            className="py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs text-slate-700 dark:text-white font-bold rounded-xl border border-transparent dark:border-slate-600 transition cursor-pointer"
                        >
                            📋 Outline
                        </button>
                        <button
                            type="button"
                            onClick={() => handleAction("keywords")}
                            className="py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs text-slate-700 dark:text-white font-bold rounded-xl border border-transparent dark:border-slate-600 transition cursor-pointer"
                        >
                            🔍 SEO Tags
                        </button>
                        <button
                            type="button"
                            onClick={() => handleAction("intro")}
                            className="py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-xs text-white font-bold rounded-xl transition cursor-pointer shadow-lg shadow-violet-500/25"
                        >
                            ✍️ Build Intro
                        </button>
                    </div>
                </div>

                {/* Outputs Panel */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl p-6 min-h-[380px] flex flex-col shadow-lg transition-shadow">
                    <div className="flex justify-between items-center border-b border-transparent dark:border-slate-700 pb-3 mb-4">
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Generated Studio Output</h3>
                        {output && (
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(output.replace(/<[^>]*>/g, ""));
                                    toast.success("Text copied to clipboard");
                                }}
                                className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                            >
                                Copy Plain Text
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center py-20 space-y-4 flex-grow">
                            <div className="w-8 h-8 rounded-full border-2 border-t-violet-600 animate-spin" />
                            <p className="text-xs text-slate-400 dark:text-slate-400 font-semibold">Gemini API orchestrating content...</p>
                        </div>
                    ) : output ? (
                        <div className="reset-tw max-w-full text-sm leading-relaxed overflow-y-auto max-h-[300px] border border-transparent dark:border-slate-700 bg-[rgb(219,218,218)] dark:bg-slate-900/30 p-4 rounded-xl flex-grow shadow-lg" dangerouslySetInnerHTML={{ __html: output }}></div>
                    ) : (
                        <div className="text-center py-20 text-slate-400 dark:text-slate-500 text-sm flex-grow flex items-center justify-center">
                            Generated drafts, outlines, or SEO tags will render here.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIContentStudio;
