import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const BlogCard = ({ blog, onDeleteSuccess }) => {
    const { title, description, category, image, _id, author, isAiGenerated, views } = blog;
    const navigate = useNavigate();
    const { user: currentUser, token, axios } = useAppContext();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Check ownership or admin rights
    const authorId = typeof author === "object" ? author?._id : author;
    const isOwner = currentUser && (currentUser._id === authorId || currentUser.isAdmin || currentUser.role === "ADMIN");

    // Strip HTML tags for clean card excerpt display
    const cleanText = description ? description.replace(/<[^>]*>?/gm, '').trim() : "";
    const excerpt = cleanText.length > 90 ? cleanText.slice(0, 90) + "..." : cleanText;
    const readTime = Math.max(1, Math.ceil(cleanText.split(/\s+/).length / 180));

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            const { data } = await axios.delete(`/api/blogs/${_id}`, {
                headers: { Authorization: token }
            });

            if (data.success) {
                toast.success("Post deleted successfully!");
                setIsDeleteModalOpen(false);
                if (onDeleteSuccess) {
                    onDeleteSuccess(_id);
                }
            } else {
                toast.error(data.message || "Failed to delete post.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Server error while deleting post.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <motion.div 
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onClick={() => navigate(`/blog/${_id}`)} 
                className="group relative w-full bz-card bz-card-interactive !p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between rounded-3xl"
            >
                <div>
                    <div className="relative aspect-[16/9] overflow-hidden">
                        <img 
                            src={image || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800"} 
                            alt={title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                        <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200/80 dark:border-slate-700/50 uppercase tracking-wider shadow-sm">
                            {category}
                        </div>

                        {isAiGenerated && (
                            <div className="absolute top-3 left-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md flex items-center gap-1">
                                ✨ AI Story
                            </div>
                        )}

                        {/* Owner Delete Button */}
                        {isOwner && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleDeleteClick}
                                title="Delete Story"
                                className="absolute bottom-3 right-3 bg-zinc-950/80 hover:bg-rose-600/90 text-rose-400 hover:text-white backdrop-blur-md p-2 rounded-xl border border-rose-500/30 transition-all duration-200 cursor-pointer shadow-lg"
                            >
                                <Trash2 className="w-4 h-4" />
                            </motion.button>
                        )}
                    </div>

                    <div className="p-5">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-2">
                            <span>{readTime} min read</span>
                            <span>•</span>
                            <span>{views || 0} views</span>
                        </div>
                        
                        <h5 className="mb-2 font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200 leading-snug line-clamp-2">
                            {title}
                        </h5>
                        
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                            {excerpt}
                        </p>
                    </div>
                </div>

                {/* Author Footer Chip */}
                <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img 
                            src={typeof author === 'object' && author?.image ? author.image : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"} 
                            alt={typeof author === 'object' && author?.name ? author.name : "Author"} 
                            className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700" 
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {typeof author === 'object' && author?.name ? author.name : "Anonymous Author"}
                        </span>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Read →
                    </span>
                </div>
            </motion.div>

            {/* Framer Motion Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title={title}
                isDeleting={isDeleting}
            />
        </>
    );
};

export default BlogCard;
