import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AdminComments = () => {
  const [comments, setComments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `/api/admin/comments?page=${page}&limit=10&search=${encodeURIComponent(search)}`
      );
      if (data.success) {
        setComments(data.comments);
        setTotal(data.total);
      }
    } catch (err) {
      toast.error("Failed to load comments list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [page, search]);

  const handleCommentAction = async (commentId, action) => {
    try {
      const { data } = await axios.put(`/api/admin/comments/${commentId}/action`, { action });
      if (data.success) {
        toast.success(data.message);
        fetchComments();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Comment action failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">💬 Comment Moderation</h1>
          <p className="text-xs text-slate-400 mt-1">Review community comments, remove offensive responses, or hide spam.</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search comment text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-500 focus:border-violet-500 outline-none"
          />
          <span className="absolute left-3 top-3 text-slate-500 text-xs">🔍</span>
        </div>
      </div>

      {/* Comments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/50">
              <th className="p-4">Author</th>
              <th className="p-4">Comment Content</th>
              <th className="p-4">Post Title</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500 animate-pulse">Loading comments...</td>
              </tr>
            ) : comments.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">No comments found matching search query.</td>
              </tr>
            ) : (
              comments.map((comment) => (
                <tr key={comment._id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={comment.author?.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80"}
                        alt={comment.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-800 flex-shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-200">{comment.name || comment.author?.name || "User"}</p>
                        <p className="text-[10px] text-slate-500">@{comment.author?.username || "user"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-slate-300 italic max-w-sm">"{comment.content}"</p>
                    <span className="text-[10px] text-slate-500 block mt-1">{new Date(comment.createdAt).toLocaleString()}</span>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-violet-400 truncate max-w-xs">{comment.blog?.title || "Blog Post"}</p>
                  </td>
                  <td className="p-4">
                    {comment.isDeleted ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400">Deleted</span>
                    ) : comment.isHidden ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">Hidden</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">Visible</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => handleCommentAction(comment._id, "hide")} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs cursor-pointer">{comment.isHidden ? "Unhide" : "Hide"}</button>
                      {comment.isDeleted ? (
                        <button onClick={() => handleCommentAction(comment._id, "restore")} className="px-2.5 py-1 bg-emerald-950 text-emerald-400 font-bold rounded-lg text-xs cursor-pointer">Restore</button>
                      ) : (
                        <button onClick={() => handleCommentAction(comment._id, "delete")} className="px-2.5 py-1 bg-red-950 text-red-400 font-bold rounded-lg text-xs cursor-pointer">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminComments;
