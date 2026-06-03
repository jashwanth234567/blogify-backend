import { useState } from "react";
import toast from "react-hot-toast";

const AIAudioStudio = () => {
    const [text, setText] = useState("");
    const [rate, setRate] = useState(1);
    const [status, setStatus] = useState("Idle");

    const playSpeech = () => {
        if (!text.trim()) return toast.error("Please enter some text to speak");
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.onend = () => setStatus("Idle");
        utterance.onerror = () => setStatus("Idle");
        window.speechSynthesis.speak(utterance);
        setStatus("Speaking");
    };

    const pauseSpeech = () => { window.speechSynthesis.pause(); setStatus("Paused"); };
    const resumeSpeech = () => { window.speechSynthesis.resume(); setStatus("Speaking"); };
    const stopSpeech = () => { window.speechSynthesis.cancel(); setStatus("Idle"); };

    return (
        <div className="flex-1 bg-[rgb(219,218,218)] dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-6 md:p-10 overflow-y-auto font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🎙️</span> AI Audio Reader Studio
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Generate human-like voice synthesis profiles for your written blogs using standard browser APIs.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Inputs card */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl p-6 flex flex-col shadow-lg transition-shadow">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-3">Vocalizer Source Text</label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter article text or paste paragraph block here..."
                        className="w-full flex-1 h-80 bg-[rgb(219,218,218)] dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl p-3 outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none shadow-lg"
                    />
                </div>

                {/* Player card */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl p-6 flex flex-col justify-between shadow-lg transition-shadow">
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 border-b border-transparent dark:border-slate-700 pb-3">Audio Mixer &amp; Controls</h3>

                        {/* Status bar */}
                        <div className="flex items-center gap-3 bg-[rgb(219,218,218)] dark:bg-slate-900/60 p-4 rounded-xl border border-transparent dark:border-slate-700 shadow-lg">
                            <div className="flex gap-0.5 items-end h-5 w-5">
                                {status === "Speaking" ? (
                                    <>
                                        <span className="w-0.5 bg-violet-500 rounded-sm animate-pulse h-full"></span>
                                        <span className="w-0.5 bg-violet-500 rounded-sm animate-pulse h-2/3" style={{ animationDelay: '0.2s' }}></span>
                                        <span className="w-0.5 bg-violet-500 rounded-sm animate-pulse h-3/4" style={{ animationDelay: '0.4s' }}></span>
                                    </>
                                ) : (
                                    <>
                                        <span className="w-0.5 bg-slate-300 dark:bg-slate-700 rounded-sm h-1/2"></span>
                                        <span className="w-0.5 bg-slate-300 dark:bg-slate-700 rounded-sm h-1/3"></span>
                                        <span className="w-0.5 bg-slate-300 dark:bg-slate-700 rounded-sm h-1/4"></span>
                                    </>
                                )}
                            </div>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                Synthesis State: <span className={status === "Speaking" ? "text-violet-600 dark:text-violet-400" : "text-amber-600 dark:text-amber-500"}>{status}</span>
                            </span>
                        </div>

                        {/* Speech Rate */}
                        <div>
                            <label className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex justify-between mb-2">
                                <span>Voice Pitch &amp; Rate</span>
                                <span>{rate}x Speed</span>
                            </label>
                            <input
                                type="range"
                                min="0.75"
                                max="2"
                                step="0.25"
                                value={rate}
                                onChange={(e) => setRate(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                            />
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-6 border-t border-transparent dark:border-slate-700 mt-6">
                        {status === "Speaking" ? (
                            <button onClick={pauseSpeech} className="flex-1 py-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20 font-bold rounded-xl cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-500/20 transition text-sm">
                                Pause Mixer
                            </button>
                        ) : status === "Paused" ? (
                            <button onClick={resumeSpeech} className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl cursor-pointer hover:opacity-90 transition text-sm shadow-lg shadow-violet-500/25">
                                Resume Synthesis
                            </button>
                        ) : (
                            <button onClick={playSpeech} className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl cursor-pointer hover:opacity-90 transition text-sm shadow-lg shadow-violet-500/25">
                                Play Audio Blog
                            </button>
                        )}
                        <button onClick={stopSpeech} className="px-5 py-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500 border border-rose-200 dark:border-rose-500/20 font-bold rounded-xl cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-500/20 transition text-sm">
                            Stop
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAudioStudio;
