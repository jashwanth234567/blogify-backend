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
        <div className="flex-1 p-10 bg-[rgb(219,218,218)] dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-y-auto transition-colors duration-300">
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

            {/* Table Card */}
            <div className="saas-container" style={{ padding: 0, overflow: "hidden" }}>
                {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "80px" }}>
                        <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            border: "3px solid var(--color-slate-200, #E2E8F0)",
                            borderTopColor: "#7C3AED",
                            animation: "spin 0.8s linear infinite",
                        }} />
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table className="saas-table">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: "28px" }}>#</th>
                                    <th>Blog Title</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th style={{ paddingRight: "28px" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {blogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center p-16 text-slate-450 dark:text-slate-500 font-medium">
                                            No blogs found. Create your first blog!
                                        </td>
                                    </tr>
                                ) : (
                                    blogs.map((blog, index) => (
                                        <BlogTableItem key={blog._id} blog={blog} fetchBlogs={fetchBlogs} index={index + 1} />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default ListBlog;
