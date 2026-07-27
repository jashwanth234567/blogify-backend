import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AdminSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ users: [], posts: [], comments: [], reports: [] });
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      const { data } = await axios.get(`/api/admin/global-search?q=${encodeURIComponent(query.trim())}`);
      if (data.success) {
        setResults(data.results);
      }
    } catch (err) {
      toast.error("Global search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">🔍 Global Admin Search</h1>
        <p className="text-xs text-slate-400 mt-1">Cross-entity search across registered Users, Posts, Comments, Reports, Emails, and Object IDs.</p>
      </div>

      {/* Big Search Input */}
      <form onSubmit={handleSearch} className="relative max-w-2xl">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by Username, Display Name, Email, Post Title, Category, Comment or ID..."
          className="w-full pl-12 pr-28 py-3.5 bg-slate-900 border border-slate-800 focus:border-violet-500 rounded-2xl text-slate-100 text-sm outline-none transition-all"
        />
        <span className="absolute left-4 top-4 text-slate-400 text-base">🔍</span>
        <button
          type="submit"
          className="absolute right-2 top-2 px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
        >
          {loading ? "Searching..." : "Search All"}
        </button>
      </form>

      {/* Results Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Match */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center justify-between">
            <span>👥 Matching Users</span>
            <span className="text-xs font-bold text-violet-400">{results.users?.length || 0}</span>
          </h3>
          <div className="space-y-2">
            {results.users?.map((u) => (
              <div key={u._id} className="p-3 bg-slate-950 rounded-2xl flex items-center justify-between border border-slate-850">
                <div className="flex items-center gap-3">
                  <img src={u.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80"} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <p className="text-xs font-bold text-slate-100">{u.name}</p>
                    <p className="text-[11px] text-slate-500">@{u.username} • {u.email}</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">ID: {u._id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Posts Match */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center justify-between">
            <span>📝 Matching Posts</span>
            <span className="text-xs font-bold text-violet-400">{results.posts?.length || 0}</span>
          </h3>
          <div className="space-y-2">
            {results.posts?.map((p) => (
              <div key={p._id} className="p-3 bg-slate-950 rounded-2xl flex items-center justify-between border border-slate-850">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-xs font-bold text-slate-100 truncate">{p.title}</p>
                  <p className="text-[11px] text-slate-500 truncate">Category: {p.category} • by @{p.author?.username || "author"}</p>
                </div>
                <span className="text-[10px] text-slate-400">👁️ {p.views}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSearch;
