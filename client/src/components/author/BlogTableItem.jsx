import { useState } from "react";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "../DeleteConfirmationModal";

const BlogTableItem = ({ blog, fetchBlogs, index }) => {
    const { title, createdAt } = blog;
    const BlogDate = new Date(createdAt);

    const { axios, fetchBlogs: fetchPublicBlogs, token } = useAppContext();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteBlog = async () => {
        setIsDeleting(true);
        try {
            const { data } = await axios.delete(`/api/blogs/${blog._id}`, {
                headers: { Authorization: token }
            });
            if (data.success) {
                toast.success(data.message || "Blog deleted successfully");
                setIsDeleteModalOpen(false);
                if (fetchBlogs) await fetchBlogs();
                if (fetchPublicBlogs) await fetchPublicBlogs();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const togglePublish = async () => {
        try {
            const { data } = await axios.put("/api/blog/toggle-publish/" + blog._id);
            if (data.success) {
                toast.success(data.message);
                if (fetchBlogs) await fetchBlogs();
                if (fetchPublicBlogs) await fetchPublicBlogs();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <>
            <tr className="border-y border-transparent dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors">
                <th className="px-4 py-4 font-semibold text-slate-500 dark:text-slate-400 text-left">{index}</th>
                <td className="px-4 py-4 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span>{title}</span>
                    {blog.isAiGenerated && (
                        <span className="px-1.5 py-0.5 bg-violet-100 dark:bg-violet-950/40 text-violet-750 dark:text-violet-300 rounded text-[10px] font-bold">
                            AI
                        </span>
                    )}
                </td>
                <td className="px-4 py-4 text-slate-500 dark:text-slate-400 max-sm:hidden text-sm"> {BlogDate.toDateString()} </td>
                <td className="px-4 py-4 max-sm:hidden">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        blog.isPublished 
                            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30" 
                            : "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30"
                    }`}>
                        {blog.isPublished ? "Published" : "Unpublished"}
                    </span>
                </td>
                <td className="px-4 py-4 flex items-center gap-3">
                    <button 
                        onClick={togglePublish} 
                        className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all duration-200 cursor-pointer ${
                            blog.isPublished 
                                ? "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800" 
                                : "border-violet-200 dark:border-violet-900/50 text-violet-600 dark:text-violet-400 bg-violet-50/30 dark:bg-violet-950/20 hover:bg-violet-50 dark:hover:bg-violet-900/30 shadow-sm"
                        }`}
                    >
                        {blog.isPublished ? "Unpublish" : "Publish"}
                    </button>
                    <button 
                        onClick={() => setIsDeleteModalOpen(true)} 
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                        title="Delete Blog"
                    >
                        <img src={assets.cross_icon} className="w-4 h-4" alt="Delete" />
                    </button>
                </td>
            </tr>

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteBlog}
                title={title}
                isDeleting={isDeleting}
            />
        </>
    );
};

export default BlogTableItem;
