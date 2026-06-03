import { useEffect, useState } from "react";
import CommentTableItem from "../../components/author/CommentTableItem";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const Comments = () => {
    const [comments, setComments] = useState([]);
    const [filter, setFilter] = useState("Not Approved");

    const { axios } = useAppContext();

    const fetchComments = async () => {
        try {
            const { data } = await axios.get("/api/comment/author");
            data.success ? setComments(data.comments) : toast.error(data.message);
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchComments();
    }, []);

    return (
        <div className="flex-1 pt-5 px-5 sm:pt-12 sm:pl-16 bg-[rgb(219,218,218)] dark:bg-slate-950 overflow-scroll">
            <div className="flex justify-between items-center max-w-3xl">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Comments</h1>
                <div className="flex gap-3">
                    <button
                        onClick={() => setFilter("Approved")}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-300 ${
                            filter === "Approved"
                                ? "text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20"
                                : "text-slate-650 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-[rgb(219,218,218)] dark:hover:bg-slate-850 border border-transparent dark:border-slate-800"
                        }`}
                    >
                        Approved
                    </button>

                    <button
                        onClick={() => setFilter("Not Approved")}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-300 ${
                            filter === "Not Approved"
                                ? "text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20"
                                : "text-slate-655 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-[rgb(219,218,218)] dark:hover:bg-slate-850 border border-transparent dark:border-slate-800"
                        }`}
                    >
                        Not Approved
                    </button>
                </div>
            </div>
            <div className="relative h-4/5 max-w-3xl overflow-x-auto mt-6 border border-transparent dark:border-slate-850 bg-white dark:bg-[#111827] rounded-2xl shadow-lg p-2">
                <table className="w-full text-sm text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-500 dark:text-slate-400 text-left uppercase border-b border-transparent dark:border-slate-800">
                        <tr>
                            <th scope="col" className="px-4 py-4 font-bold">
                                Blog Title & Comment
                            </th>
                            <th scope="col" className="px-4 py-4 font-bold max-sm:hidden">
                                Date
                            </th>
                            <th scope="col" className="px-4 py-4 font-bold">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {comments
                            .filter((comment) => {
                                if (filter === "Approved") return comment.isApproved === true;
                                return comment.isApproved === false;
                            })
                            .map((comment, index) => (
                                <CommentTableItem key={comment._id} comment={comment} index={index + 1} fetchComments={fetchComments} />
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Comments;
