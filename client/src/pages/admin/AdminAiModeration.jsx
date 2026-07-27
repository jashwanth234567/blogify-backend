import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AdminAiModeration = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchModerationData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/admin/ai-moderation");
      if (data.success) {
        setData(data);
      }
    } catch (err) {
      toast.error("Failed to load AI Moderation dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModerationData();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 animate-pulse">
        <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-violet-600 animate-spin mb-4" />
        <p className="text-xs font-bold">Initiating AI Coprocessor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">🤖 AI Moderation Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Leverage automated natural language models to audit spam, toxicity, and duplicate contents.</p>
        </div>
        <button
          onClick={fetchModerationData}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          🔄 Restart Integrity Checks
        </button>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <span className="text-xl">📊</span>
          <div className="mt-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Reports Analyzed</p>
            <p className="text-2xl font-black text-white mt-1">{data?.spamStats?.totalReports || 0}</p>
          </div>
        </div>
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <span className="text-xl">⚠️</span>
          <div className="mt-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Audit Queue</p>
            <p className="text-2xl font-black text-amber-400 mt-1">{data?.spamStats?.pendingReports || 0}</p>
          </div>
        </div>
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <span className="text-xl">✅</span>
          <div className="mt-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resolved Conflicts</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{data?.spamStats?.resolvedReports || 0}</p>
          </div>
        </div>
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <span className="text-xl">🚫</span>
          <div className="mt-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Toxicity Ban List</p>
            <p className="text-2xl font-black text-rose-500 mt-1">{data?.spamStats?.flaggedUsers || 0}</p>
          </div>
        </div>
      </div>

      {/* Flagged content list */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <span>🛡️</span> AI System Flagged Queue
        </h3>
        <div className="space-y-3">
          {data?.reportedPosts?.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">All clear! No pending flagged reports.</p>
          ) : (
            data?.reportedPosts?.map((item) => (
              <div key={item._id} className="p-4 bg-slate-950 rounded-2xl border border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-white text-sm capitalize">Reason: {item.reason || "Toxicity"}</p>
                  <p className="text-slate-400">Post Ref: {item.post?.title || "Deleted/Missing Content"}</p>
                  <p className="text-[10px] text-slate-500">Reported By: {item.reportedBy?.name} ({item.reportedBy?.email})</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    High Confidence
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAiModeration;
