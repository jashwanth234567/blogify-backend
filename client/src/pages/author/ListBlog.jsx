import { useEffect, useState } from "react";
import BlogTableItem from "../../components/author/BlogTableItem";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ListBlog = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { axios } = useAppContext();

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get("/api/user/blogs");
            if (data.success) {
                setBlogs(data.blogs);
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
        fetchBlogs();
    }, []);

    return (
        <div className="flex-1 p-10 bg-transparent dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-y-auto transition-colors duration-300">
            {/* Page Header */}
            <div className="saas-container" style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="text-[22px] font-extrabold text-slate-900 dark:text-white mb-1">Blogs &amp; Drafts</h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold">
                        {blogs.length} article{blogs.length !== 1 ? "s" : ""} total
                    </p>
                </div>
                <div className="flex gap-3">
                    <span className="bg-violet-600/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-bold px-3.5 py-1.5 rounded-full border border-violet-500/20">
                        {blogs.filter(b => b.isPublished).length} Published
                    </span>
                    <span className="bg-amber-600/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold px-3.5 py-1.5 rounded-full border border-amber-500/20">
                        {blogs.filter(b => !b.isPublished).length} Drafts
                    </span>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="pb-10">
                {loading ? (
                    <div className="flex justify-center items-center p-20">
                        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-violet-600 animate-spin" />
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="text-center p-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 font-medium shadow-sm">
                        No blogs found. Create your first blog!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {blogs.map((blog, index) => (
                            <BlogTableItem key={blog._id} blog={blog} fetchBlogs={fetchBlogs} index={index + 1} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListBlog;
