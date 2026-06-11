import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const BlogTableItem = ({ blog, fetchBlogs, index }) => {
    const { title, createdAt } = blog;
    const BlogDate = new Date(createdAt);

    const { axios, fetchBlogs: fetchPublicBlogs } = useAppContext();

    const deleteBlog = async () => {
        const confirm = window.confirm("Are you sure you want to delete this blog?");
        if (!confirm) return;
        try {
            const { data } = await axios.delete("/api/blog/delete/" + blog._id);
            if (data.success) {
                toast.success(data.message);
                await fetchBlogs();
                await fetchPublicBlogs();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const togglePublish = async () => {
        try {
            const { data } = await axios.put("/api/blog/toggle-publish/" + blog._id);
            if (data.success) {
                toast.success(data.message);
                await fetchBlogs();
                await fetchPublicBlogs();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900/50 px-2 py-1 rounded-md">
                        #{index}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        blog.isPublished 
                            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30" 
                            : "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30"
                    }`}>
                        {blog.isPublished ? "Published" : "Draft"}
                    </span>
                </div>
                
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">
                    {title}
                </h3>
                
                <div className="flex items-center gap-2">
                    {blog.isAiGenerated && (
                        <span className="px-1.5 py-0.5 bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 rounded text-[10px] font-bold border border-violet-200 dark:border-violet-800/50">
                            AI Generated
                        </span>
                    )}
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {BlogDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                <button 
                    onClick={togglePublish} 
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all duration-200 cursor-pointer w-full mr-3 ${
                        blog.isPublished 
                            ? "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800" 
                            : "border-violet-200 dark:border-violet-900/50 text-violet-700 dark:text-violet-300 bg-violet-50/50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-800/30 shadow-sm"
                    }`}
                >
                    {blog.isPublished ? "Unpublish" : "Publish Now"}
                </button>
                <button 
                    onClick={deleteBlog} 
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-200 dark:hover:border-rose-900/50 hover:text-rose-600 transition-all cursor-pointer flex-shrink-0"
                    title="Delete Blog"
                >
                    <img src={assets.cross_icon} className="w-4 h-4 opacity-70 group-hover:opacity-100" style={{ filter: 'invert(0.5) sepia(1) saturate(5) hue-rotate(320deg)' }} alt="Delete" />
                </button>
            </div>
        </div>
    );
};

export default BlogTableItem;
