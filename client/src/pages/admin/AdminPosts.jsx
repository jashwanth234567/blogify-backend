import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `/api/admin/posts?page=${page}&limit=10&search=${encodeURIComponent(debouncedSearch)}&filter=${filter}`
      );
      if (data.success) {
        setPosts(data.posts);
        setTotal(data.total);
      }
    } catch (err) {
      toast.error("Failed to load posts list");
    } finally {
      setLoading(false);
    }
  };

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      if (search) setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchPosts();
  }, [page, debouncedSearch, filter]);

  const handlePostAction = async (postId, action) => {
    try {
      const { data } = await axios.put(`/api/admin/posts/${postId}/action`, { action });
      if (data.success) {
        toast.success(data.message);
        fetchPosts();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Post action failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">📝 Post Management</h1>
          <p className="text-xs text-slate-400 mt-1">Review, moderate, feature, pin, or lock any post on the platform.</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by Title or Category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-500 focus:border-violet-500 outline-none"
          />
          <span className="absolute left-3 top-3 text-slate-500 text-xs">🔍</span>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2.5 text-xs font-bold rounded-xl border border-slate-800 bg-slate-950 text-slate-300 outline-none cursor-pointer"
        >
          <option value="all">All Posts</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
          <option value="hidden">Hidden</option>
          <option value="pinned">Pinned</option>
          <option value="featured">Featured</option>
          <option value="deleted">Deleted</option>
        </select>
      </div>

      {/* Posts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/50">
              <th className="p-4">Post Info</th>
              <th className="p-4">Author</th>
              <th className="p-4">Stats</th>
              <th className="p-4">Status & Badges</th>
              <th className="p-4 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500 animate-pulse">Loading posts records...</td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">No posts found matching filter.</td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post._id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.image || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=100&h=80"}
                        alt={post.title}
                        className="w-12 h-10 rounded-xl object-cover border border-slate-800 flex-shrink-0 bg-slate-950"
                      />
                      <div className="min-w-0 max-w-xs">
                        <p className="font-bold text-white truncate leading-tight">{post.title}</p>
                        <span className="text-[10px] text-violet-400 font-semibold">{post.category}</span>
                        <span className="text-[10px] text-slate-500 block">{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.author?.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80"}
                        alt={post.author?.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-800"
                      />
                      <div className="truncate">
                        <p className="font-bold text-slate-200 truncate">{post.author?.name || "Unknown Author"}</p>
                        <p className="text-[10px] text-slate-500 truncate">@{post.author?.username || "user"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-[11px] text-slate-300">
                    <p>👁️ {post.views} views</p>
                    <p>❤️ {post.likes} likes</p>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {post.isPinned && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-500/20 text-violet-400">📌 Pinned</span>}
                      {post.isFeatured && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">✨ Featured</span>}
                      {post.isHidden && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300">🙈 Hidden</span>}
                      {post.isDeleted && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400">🗑️ Deleted</span>}
                      {post.isLocked && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400">🔒 Locked</span>}
                      {!post.isDeleted && !post.isHidden && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">Live</span>}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1 flex-wrap">
                      <button onClick={() => handlePostAction(post._id, post.isPinned ? "pin" : "pin")} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-violet-300 font-bold rounded-lg text-[10px] cursor-pointer">{post.isPinned ? "Unpin" : "Pin"}</button>
                      <button onClick={() => handlePostAction(post._id, "feature")} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-lg text-[10px] cursor-pointer">{post.isFeatured ? "Unfeature" : "Feature"}</button>
                      <button onClick={() => handlePostAction(post._id, "hide")} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-[10px] cursor-pointer">{post.isHidden ? "Unhide" : "Hide"}</button>
                      <button onClick={() => handlePostAction(post._id, "lock")} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-orange-300 font-bold rounded-lg text-[10px] cursor-pointer">{post.isLocked ? "Unlock" : "Lock"}</button>
                      <button onClick={() => handlePostAction(post._id, "disable_comments")} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold rounded-lg text-[10px] cursor-pointer">{post.commentsDisabled ? "Enable Comms" : "Disable Comms"}</button>
                      {post.isDeleted ? (
                        <button onClick={() => handlePostAction(post._id, "restore")} className="px-2 py-1 bg-emerald-950 text-emerald-400 font-bold rounded-lg text-[10px] cursor-pointer">Restore</button>
                      ) : (
                        <button onClick={() => handlePostAction(post._id, "delete")} className="px-2 py-1 bg-red-950 text-red-400 font-bold rounded-lg text-[10px] cursor-pointer">Delete</button>
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

export default AdminPosts;
