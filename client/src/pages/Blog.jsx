import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import Navbar from "../components/Navbar";
import Moment from "moment";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import BlogCard from "../components/BlogCard";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Blog = () => {
    const { id } = useParams();
    const { axios, blogs, fetchBlogs, token, user: currentUser } = useAppContext();

    const [data, setData] = useState(null);
    const [comments, setComments] = useState([]);
    const [name, setName] = useState("");
    const [content, setContent] = useState("");
    const [headings, setHeadings] = useState([]);

    // Likes & Saves
    const [likesCount, setLikesCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Reading progress
    const [scrollProgress, setScrollProgress] = useState(0);

    // AI Summary
    const [summary, setSummary] = useState("");
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);

    // Translation
    const [currentLanguage, setCurrentLanguage] = useState("Original");
    const [translatedContent, setTranslatedContent] = useState(null);
    const [translationsCache, setTranslationsCache] = useState({});
    const [isTranslating, setIsTranslating] = useState(false);

    // Text to Speech
    const [speechStatus, setSpeechStatus] = useState("Idle");
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showAudioPanel, setShowAudioPanel] = useState(false);

    const calculateReadTime = (htmlContent) => {
        if (!htmlContent) return 0;
        const text = htmlContent.replace(/<[^>]*>/g, "");
        const words = text.trim().split(/\s+/).length;
        const wordsPerMinute = 200;
        return Math.ceil(words / wordsPerMinute);
    };

    const handleScroll = () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
            setScrollProgress((window.pageYOffset / totalHeight) * 100);
        }
    };

    const parseHeadings = (html) => {
        if (!html) return [];
        const matches = [];
        const regex = /<h2[^>]*>(.*?)<\/h2>/g;
        let match;
        while ((match = regex.exec(html)) !== null) {
            matches.push(match[1].replace(/<[^>]*>/g, ""));
        }
        return matches;
    };

    // Audio controls
    const getCleanText = () => {
        const textSource = translatedContent ? translatedContent.description : data?.description;
        if (!textSource) return "";
        return textSource.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    };

    const playSpeech = () => {
        const text = getCleanText();
        if (!text) return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = playbackRate;
        utterance.onend = () => setSpeechStatus("Idle");
        utterance.onerror = () => setSpeechStatus("Idle");

        window.speechSynthesis.speak(utterance);
        setSpeechStatus("Speaking");
        setShowAudioPanel(true);
    };

    const pauseSpeech = () => {
        window.speechSynthesis.pause();
        setSpeechStatus("Paused");
    };

    const resumeSpeech = () => {
        window.speechSynthesis.resume();
        setSpeechStatus("Speaking");
    };

    const stopSpeech = () => {
        window.speechSynthesis.cancel();
        setSpeechStatus("Idle");
    };

    const handleSpeedChange = (rate) => {
        setPlaybackRate(rate);
        if (speechStatus === "Speaking") {
            playSpeech();
        }
    };

    // Summarizer
    const handleGenerateSummary = async () => {
        if (!data?.description) return;
        try {
            setIsSummarizing(true);
            setShowSummaryModal(true);
            const { data: res } = await axios.post("/api/ai/summarize", { content: data.description });
            if (res.success) {
                setSummary(res.summary);
            } else {
                toast.error(res.message);
                setShowSummaryModal(false);
            }
        } catch (error) {
            toast.error(error.message);
            setShowSummaryModal(false);
        } finally {
            setIsSummarizing(false);
        }
    };

    const copySummary = () => {
        if (!summary) return;
        navigator.clipboard.writeText(summary);
        toast.success("Summary copied to clipboard!");
    };

    // Translation
    const handleLanguageChange = async (lang) => {
        if (lang === "Original") {
            setCurrentLanguage("Original");
            setTranslatedContent(null);
            if (speechStatus !== "Idle") stopSpeech();
            return;
        }

        if (speechStatus !== "Idle") stopSpeech();

        if (translationsCache[lang]) {
            setTranslatedContent(translationsCache[lang]);
            setCurrentLanguage(lang);
            return;
        }

        try {
            setIsTranslating(true);
            const { data: res } = await axios.post("/api/ai/translate", {
                title: data.title,
                subTitle: data.subTitle,
                description: data.description,
                targetLanguage: lang
            });

            if (res.success) {
                setTranslationsCache(prev => ({ ...prev, [lang]: res.translated }));
                setTranslatedContent(res.translated);
                setCurrentLanguage(lang);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsTranslating(false);
        }
    };

    const handleLike = async () => {
        if (!token) {
            toast.error("Please login to like posts");
            return;
        }
        try {
            const endpoint = `/api/posts/${id}/like`;
            const config = { headers: { Authorization: token } };
            const { data: res } = isLiked
                ? await axios.delete(endpoint, config)
                : await axios.post(endpoint, {}, config);
            if (res.success) {
                setIsLiked(!isLiked);
                setLikesCount(prev => prev + (isLiked ? -1 : 1));
                toast.success(isLiked ? "Unlike post" : "Liked post");
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleSave = async () => {
        if (!token) {
            toast.error("Please login to save posts");
            return;
        }
        try {
            const endpoint = `/api/posts/${id}/save`;
            const config = { headers: { Authorization: token } };
            const { data: res } = isSaved
                ? await axios.delete(endpoint, config)
                : await axios.post(endpoint, {}, config);
            if (res.success) {
                setIsSaved(!isSaved);
                toast.success(isSaved ? "Removed from saved" : "Saved to bookmarks");
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const fetchBlogData = async () => {
        try {
            const { data: res } = await axios.get(`/api/blog/published/${id}`);
            if (res.success && res.blog) {
                setData(res.blog);
                setHeadings(parseHeadings(res.blog.description));
                
                // Record view count
                if (token) {
                    await axios.post(`/api/posts/${id}/view`, {}, {
                        headers: { Authorization: token }
                    });
                }

                // Check likes and saves
                if (token && currentUser) {
                    const { data: likesData } = await axios.get(`/api/posts/${id}/likes`, {
                        headers: { Authorization: token }
                    });
                    if (likesData.success) {
                        const hasLiked = likesData.likes.some(l => 
                            (l.user?._id || l.user) === currentUser._id
                        );
                        setIsLiked(hasLiked);
                        setLikesCount(likesData.likes.length);
                    } else {
                        setLikesCount(res.blog.likes || 0);
                    }

                    const { data: savedData } = await axios.get(`/api/posts/saved`, {
                        headers: { Authorization: token }
                    });
                    if (savedData.success) {
                        const hasSaved = savedData.blogs.some(b => b._id === id);
                        setIsSaved(hasSaved);
                    }
                } else {
                    setLikesCount(res.blog.likes || 0);
                }
            } else {
                // Try to find the blog in local mock data
                import("../assets/assets").then(({ blog_data }) => {
                    const localBlog = blog_data.find((b) => b._id === id);
                    if (localBlog) {
                        setData(localBlog);
                        setHeadings(parseHeadings(localBlog.description));
                    } else {
                        toast.error(res.message || "Blog not found");
                    }
                });
            }
        } catch (error) {
            import("../assets/assets").then(({ blog_data }) => {
                const localBlog = blog_data.find((b) => b._id === id);
                if (localBlog) {
                    setData(localBlog);
                    setHeadings(parseHeadings(localBlog.description));
                } else {
                    toast.error(error.message);
                }
            });
        }
    };

    const fetchComments = async () => {
        try {
            const { data } = await axios.get("/api/comment/blog/" + id);
            if (data.success && data.comments && data.comments.length > 0) {
                setComments(data.comments);
            } else {
                import("../assets/assets").then(({ comments_data }) => {
                    const localComments = comments_data.filter((c) => c.blog?._id === id || c.blog === id);
                    setComments(localComments);
                });
            }
        } catch (error) {
            import("../assets/assets").then(({ comments_data }) => {
                const localComments = comments_data.filter((c) => c.blog?._id === id || c.blog === id);
                setComments(localComments);
            });
        }
    };

    const addComment = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post("/api/comment/add", { blog: id, name, content });
            data.success ? toast.success(data.message) : toast.error(data.message);
            setName("");
            setContent("");
            fetchComments(); // Reload comments
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchBlogData();
        fetchComments();
        if (blogs.length === 0) fetchBlogs();
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.speechSynthesis.cancel();
        };
    }, [id]);

    const activeTitle = translatedContent ? translatedContent.title : data?.title;
    const activeSubTitle = translatedContent ? translatedContent.subTitle : data?.subTitle;
    const activeDescription = translatedContent ? translatedContent.description : data?.description;

    // Filter related blogs matching same category (max 3, exclude current)
    const relatedBlogs = blogs
        .filter(b => b.category === data?.category && b._id !== data?._id)
        .slice(0, 3);

    return data ? (
        <div className="relative overflow-hidden min-h-screen bg-[rgb(219,218,218)] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
            {/* Progress bar */}
            <div className="fixed top-0 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 z-50">
                <div 
                    className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-100" 
                    style={{ width: `${scrollProgress}%` }}
                />
            </div>

            {/* Ambient glows */}
            <div className="absolute top-[-100px] left-[-10%] w-[450px] h-[450px] rounded-full bg-violet-400/5 blur-[90px] -z-10 animate-float-slow" />
            <div className="absolute top-[-120px] right-[-5%] w-[400px] h-[400px] rounded-full bg-indigo-400/5 blur-[95px] -z-10 animate-float-medium" />

            <Navbar />

            {isTranslating && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex flex-col items-center justify-center z-50">
                    <div className="w-10 h-10 rounded-full border-4 border-t-violet-600 animate-spin mb-4" />
                    <p className="text-white text-sm font-bold uppercase tracking-wider">Translating article content...</p>
                </div>
            )}

            <div className="text-center mt-20 max-w-4xl mx-auto px-6 space-y-6">
                <div className="flex justify-center items-center gap-3 flex-wrap">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                        Published on {Moment(data.createdAt).format("MMMM Do YYYY")} • {calculateReadTime(data.description)} min read
                    </p>
                    {data.isAiGenerated && (
                        <span className="text-[10px] font-bold text-violet-500 dark:text-violet-400 bg-violet-600/10 border border-violet-500/20 px-2.5 py-0.5 rounded-full">
                            ✨ AI Generated
                        </span>
                    )}
                </div>

                <h1 className="text-3xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight font-heading transition-colors duration-300">{activeTitle}</h1>
                <h2 className="max-w-xl mx-auto text-slate-500 dark:text-slate-400 truncate text-sm sm:text-base font-semibold transition-colors duration-300">{activeSubTitle}</h2>

                {/* Actions row */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-b border-slate-200 dark:border-slate-800 pb-6 transition-colors duration-300">
                    {data?.author && (
                        <a href={`/profile/${data.author.username || data.author._id}`} className="text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold px-3 py-1 rounded-full border border-slate-250 dark:border-slate-700 transition-colors duration-300 hover:text-violet-600 dark:hover:text-violet-400">
                            👤 {data.author.name}
                        </a>
                    )}
                    
                    <button
                        onClick={handleLike}
                        className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl border text-xs border-slate-200 dark:border-slate-800 bg-white hover:bg-[rgb(219,218,218)] dark:bg-slate-900 text-red-500 font-bold transition-all duration-200 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    >
                        {isLiked ? "❤️" : "🤍"} {likesCount}
                    </button>

                    <button
                        onClick={handleSave}
                        className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl border text-xs border-slate-200 dark:border-slate-800 bg-white hover:bg-[rgb(219,218,218)] dark:bg-slate-900 text-yellow-500 font-bold transition-all duration-200 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    >
                        {isSaved ? "★ Saved" : "☆ Save"}
                    </button>

                    <span className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl border text-xs border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold transition-all">
                        👁 {data.views} Views
                    </span>
                    
                    <button
                        onClick={() => {
                            if (speechStatus === "Idle") {
                                playSpeech();
                            } else {
                                setShowAudioPanel(true);
                            }
                        }}
                        className="inline-flex items-center gap-2 py-2 px-4 rounded-xl border text-xs border-slate-200 dark:border-slate-800 bg-white hover:bg-[rgb(219,218,218)] dark:bg-slate-900 text-violet-600 dark:text-violet-400 font-bold transition-all duration-200 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    >
                        🎙️ Listen to Blog
                    </button>

                    <button
                        onClick={handleGenerateSummary}
                        className="inline-flex items-center gap-2 py-2 px-4 rounded-xl border text-xs border-slate-200 dark:border-slate-800 bg-white hover:bg-[rgb(219,218,218)] dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold transition-all duration-200 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    >
                        ✨ AI Summary
                    </button>

                    <select
                        value={currentLanguage}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="inline-flex items-center py-2 px-4 rounded-xl border text-xs border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold cursor-pointer hover:bg-[rgb(219,218,218)] dark:hover:bg-slate-800 focus:outline-none transition-all duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    >
                        <option value="Original">🌐 Original</option>
                        <option value="Hindi">Hindi (हिंदी)</option>
                        <option value="Telugu">Telugu (తెలుగు)</option>
                        <option value="Tamil">Tamil (தமிழ்)</option>
                        <option value="Spanish">Spanish (Español)</option>
                        <option value="French">French (Français)</option>
                    </select>
                </div>
            </div>

            {/* Main Content with Table of Contents Layout */}
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 my-12">
                
                {/* Related / TOC Sidebar Left */}
                <div className="lg:col-span-3 hidden lg:block space-y-8">
                    {headings.length > 0 && (
                        <div className="sticky top-24 bz-card border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 rounded-2xl space-y-4 shadow-xl transition-all duration-300">
                            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Table of Contents</h3>
                            <ul className="space-y-3">
                                {headings.map((h, i) => (
                                    <li key={i} className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition duration-200 font-medium list-none">
                                        <a href={`#heading-${i}`}>• {h}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Article Body */}
                <div className="lg:col-span-9 space-y-8 max-w-3xl">
                    <img src={data.image} alt="" className="rounded-3xl shadow-xl w-full max-h-[520px] object-cover" />
                    
                    {/* Render with simulated anchor headings */}
                    <div 
                        className="reset-tw text-slate-700 dark:text-slate-300 transition-colors duration-300" 
                        dangerouslySetInnerHTML={{ 
                            __html: activeDescription?.replace(
                                /<h2[^>]*>/g, 
                                (match, offset) => `<h2 id="heading-${offset}">`
                            ) 
                        }}
                    />

                    {/* Comments section */}
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-8 space-y-6 transition-colors duration-300">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors duration-300">Comments ({comments.length})</h3>
                        <div className="space-y-4 max-w-xl">
                            {comments.map((comment, i) => (
                                <div key={i} className="p-4 bz-card border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-2xl space-y-2 relative shadow transition-all duration-300">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-white text-[10px] font-bold">
                                            {comment.name.substring(0, 1).toUpperCase()}
                                        </div>
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors duration-300">{comment.name}</p>
                                    </div>
                                    <p className="text-xs text-slate-650 dark:text-slate-400 ml-8 leading-relaxed font-medium transition-colors duration-300">{comment.content}</p>
                                    <span className="absolute right-4 bottom-3 text-[10px] text-slate-500 font-semibold">{Moment(comment.createdAt).fromNow()}</span>
                                </div>
                            ))}
                        </div>

                        {/* Add Comment form */}
                        <form onSubmit={addComment} className="max-w-lg bz-card border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 rounded-2xl space-y-4 transition-all duration-300 shadow-md">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 transition-colors duration-300">Share your thoughts</h4>
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bz-input"
                                required
                            />
                            <textarea
                                placeholder="Write comment details..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full h-32 bz-input"
                                required
                            />
                            <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs rounded-xl hover:shadow cursor-pointer transition">
                                Submit Comment
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Related Blogs Block */}
            {relatedBlogs.length > 0 && (
                <div className="max-w-7xl mx-auto px-6 border-t border-slate-200 dark:border-slate-800 pt-16 mb-20 transition-colors duration-300">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-8 tracking-tight font-heading transition-colors duration-300">Related Articles You May Like</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {relatedBlogs.map((b) => (
                            <BlogCard key={b._id} blog={b} />
                        ))}
                    </div>
                </div>
            )}

            {/* Audio mixer panel floating */}
            {showAudioPanel && speechStatus !== "Idle" && (
                <div className="fixed bottom-6 right-6 z-40 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-5 rounded-3xl shadow-2xl w-80 animate-in slide-in-from-bottom-3 duration-250 transition-colors duration-300">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mixer Controls</span>
                        <button onClick={() => setShowAudioPanel(false)} className="text-slate-500 hover:text-slate-350 text-xs">✕</button>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4 bg-slate-100 dark:bg-slate-950/40 p-2 rounded-xl transition-colors duration-300">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors duration-300">
                            State: <span className={speechStatus === "Speaking" ? "text-violet-600 dark:text-violet-400 font-bold" : "text-amber-500 font-bold"}>{speechStatus}</span>
                        </span>
                    </div>

                    <div className="flex justify-center items-center gap-3">
                        {speechStatus === "Speaking" ? (
                            <button onClick={pauseSpeech} className="w-10 h-10 rounded-full flex items-center justify-center bg-violet-600/10 text-violet-600 border border-violet-500/20 cursor-pointer">⏸</button>
                        ) : (
                            <button onClick={resumeSpeech} className="w-10 h-10 rounded-full flex items-center justify-center bg-violet-600 text-white cursor-pointer shadow">▶</button>
                        )}
                        <button onClick={stopSpeech} className="w-10 h-10 rounded-full flex items-center justify-center bg-rose-600/10 text-rose-600 border border-rose-500/20 cursor-pointer dark:text-rose-500">⏹</button>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
                        <label className="text-[10px] text-slate-500 font-bold uppercase flex justify-between">
                            <span>Vocal Speed</span>
                            <span>{playbackRate}x</span>
                        </label>
                        <input
                            type="range"
                            min="0.75"
                            max="2"
                            step="0.25"
                            value={playbackRate}
                            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                            className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-600 mt-2 transition-colors duration-300"
                        />
                    </div>
                </div>
            )}

            {/* AI Summary Modal */}
            {showSummaryModal && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in-50 duration-200">
                    <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 max-w-lg w-full p-6 sm:p-8 rounded-3xl shadow-2xl relative transition-colors duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-colors duration-300">
                                <span>✨</span> AI Blog Summary
                            </h3>
                            <button onClick={() => setShowSummaryModal(false)} className="text-slate-500 hover:text-slate-350">✕</button>
                        </div>

                        {isSummarizing ? (
                            <div className="flex flex-col items-center py-10 space-y-4">
                                <div className="w-8 h-8 rounded-full border-2 border-t-violet-600 animate-spin" />
                                <p className="text-xs text-slate-550 dark:text-slate-400">Gemini analyzing content body...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed transition-colors duration-300">{summary}</p>
                                <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
                                    <button onClick={copySummary} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer transition-colors duration-200">Copy Summary</button>
                                    <button onClick={() => setShowSummaryModal(false)} className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer">Close</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Footer />
        </div>
    ) : (
        <Loader />
    );
};

export default Blog;
