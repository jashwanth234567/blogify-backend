import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const CommentTableItem = ({ comment, fetchComments }) => {
    const { blog, createdAt, _id } = comment;
    const BlogDate = new Date(createdAt);

    const { axios } = useAppContext();

    const approveComment = async () => {
        try {
            const { data } = await axios.put(`/api/comment/approve/${_id}`);
            if (data.success) {
                toast.success(data.message);
                fetchComments();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const deleteComment = async () => {
        try {
            const confirm = window.confirm("Are you sure you want to delete this comment?");
            if (!confirm) return;

            const { data } = await axios.delete(`/api/comment/${_id}`);
            if (data.success) {
                toast.success(data.message);
                fetchComments();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <tr className="border-y border-transparent dark:border-slate-800/60 hover:bg-[rgb(219,218,218)] dark:hover:bg-slate-800/30 transition-colors">
            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                <div className="space-y-1">
                    <div>
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Blog:</span>{" "}
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{blog.title}</span>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Name:</span>{" "}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{comment.name}</span>
                    </div>
                    <div className="bg-[rgb(219,218,218)] dark:bg-slate-900 border border-transparent dark:border-slate-800 p-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-350 mt-2 max-w-xl shadow-lg">
                        {comment.content}
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-sm:hidden text-sm">{BlogDate.toLocaleDateString()}</td>
            <td className="px-6 py-4">
                <div className="inline-flex items-center gap-2">
                    {!comment.isApproved ? (
                        <button
                            onClick={approveComment}
                            className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/30 transition-all cursor-pointer"
                            title="Approve Comment"
                        >
                            <img src={assets.tick_icon} className="w-5" alt="Approve" />
                        </button>
                    ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400">
                            Approved
                        </span>
                    )}
                    <button
                        onClick={deleteComment}
                        className="p-2 rounded-xl text-rose-600 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30 transition-all cursor-pointer"
                        title="Delete Comment"
                    >
                        <img src={assets.bin_icon} className="w-5" alt="Delete" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default CommentTableItem;
