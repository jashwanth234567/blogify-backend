import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, chartsRes] = await Promise.all([
        axios.get("/api/admin/dashboard/stats"),
        axios.get("/api/admin/dashboard/charts")
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (chartsRes.data.success) setCharts(chartsRes.data.charts);
    } catch (err) {
      toast.error("Failed to load real-time statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 animate-pulse">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="h-28 bg-slate-900 border border-slate-800 rounded-2xl" />
        ))}
      </div>
    );
  }

  const statCardItems = [
    { title: "Total Users", count: stats?.totalUsers, icon: "👥", color: "text-white", badge: "Registered" },
    { title: "Active Users", count: stats?.activeUsers, icon: "⚡", color: "text-emerald-400", badge: "Good Standing" },
    { title: "Online Users", count: stats?.onlineUsers, icon: "🟢", color: "text-emerald-400", badge: "Last 15m" },
    { title: "Blocked Users", count: stats?.blockedUsers, icon: "🚫", color: "text-red-400", badge: "Permanently" },
    { title: "Suspended Users", count: stats?.suspendedUsers, icon: "⏳", color: "text-amber-400", badge: "Temporary" },
    { title: "Verified Users", count: stats?.verifiedUsers, icon: "✓", color: "text-blue-400", badge: "Badge Active" },
    { title: "Total Posts", count: stats?.totalPosts, icon: "📝", color: "text-violet-400", badge: "Published" },
    { title: "Draft Posts", count: stats?.draftPosts, icon: "📄", color: "text-slate-400", badge: "Unpublished" },
    { title: "Deleted Posts", count: stats?.deletedPosts, icon: "🗑️", color: "text-rose-400", badge: "Soft Deleted" },
    { title: "Total Comments", count: stats?.totalComments, icon: "💬", color: "text-cyan-400", badge: "Community" },
    { title: "Total Likes", count: stats?.totalLikes, icon: "❤️", color: "text-pink-400", badge: "Reactions" },
    { title: "Total Followers", count: stats?.totalFollowers, icon: "🤝", color: "text-indigo-400", badge: "Connections" },
    { title: "Total Views", count: stats?.totalViews, icon: "👁️", color: "text-teal-400", badge: "Platform Traffic" },
    { title: "Reports Pending", count: stats?.reportsPending, icon: "🚨", color: stats?.reportsPending > 0 ? "text-red-500 font-black animate-pulse" : "text-slate-300", badge: "Action Needed" },
    { title: "Reports Resolved", count: stats?.reportsResolved, icon: "✅", color: "text-emerald-400", badge: "Moderated" },
  ];

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Real-Time Platform Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Live metrics across users, content, interactions, and moderation queue.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer self-start sm:self-auto"
        >
          🔄 Refresh Live Metrics
        </button>
      </div>

      {/* 15 Statistics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCardItems.map((item, idx) => (
          <div
            key={idx}
            className="p-5 bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-2xl shadow-sm transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                {item.badge}
              </span>
            </div>
            <div className="mt-3">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.title}</p>
              <p className={`text-2xl font-black mt-1 ${item.color}`}>{item.count ?? 0}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Viewed Content */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-sm">
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>🔥</span> Most Viewed Posts
          </h3>
          <div className="space-y-3">
            {charts?.mostViewedPosts?.map((post) => (
              <div key={post._id} className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-850">
                <div className="min-w-0 flex-1 pr-3">
                  <p className="text-xs font-bold text-slate-100 truncate">{post.title}</p>
                  <p className="text-[11px] text-slate-500 truncate">by @{post.author?.username || "author"} • {post.category}</p>
                </div>
                <span className="text-xs font-black text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-xl border border-violet-500/20">
                  👁️ {post.views}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Active Creators */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-sm">
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>🏆</span> Most Active Creators
          </h3>
          <div className="space-y-3">
            {charts?.mostActiveUsers?.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-850">
                <div className="flex items-center gap-3">
                  <img
                    src={user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80"}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-800"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-bold text-slate-100">{user.name}</p>
                      {user.verified && <span className="text-blue-400 text-[10px]">✓</span>}
                    </div>
                    <p className="text-[11px] text-slate-500">@{user.username}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-300">
                  👥 {user.followersCount} followers
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
