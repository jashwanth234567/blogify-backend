import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AdminAnalytics = () => {
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/admin/dashboard/charts");
      if (data.success) {
        setCharts(data.charts);
      }
    } catch (err) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">📈 Platform Analytics & Insights</h1>
        <p className="text-xs text-slate-400 mt-1">Growth trends, engagement metrics, and top content breakdown.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 animate-pulse">Loading analytics charts...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Categories Distribution */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">🏷️ Top Categories Breakdown</h3>
            <div className="space-y-3">
              {charts?.topCategories?.map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>{c.category}</span>
                    <span className="text-violet-400">{c.count} posts</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
                    <div
                      className="bg-gradient-to-r from-violet-600 to-indigo-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, c.count * 10)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Engagement Overview */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">⚡ Platform Engagement Rate</h3>
              <p className="text-xs text-slate-400">High activity across comments, post reactions, and daily readership.</p>
            </div>
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-850 text-center space-y-2">
              <p className="text-4xl font-black text-emerald-400">84.2%</p>
              <p className="text-xs font-bold text-slate-300">Monthly Reader Engagement</p>
              <p className="text-[11px] text-slate-500">+12% increase compared to last month</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
