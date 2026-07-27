import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/admin/reports");
      if (data.success) {
        setReports(data.reports);
      }
    } catch (err) {
      toast.error("Failed to load reports queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (reportId, status, action) => {
    try {
      const { data } = await axios.put(`/api/admin/reports/${reportId}/resolve`, {
        status,
        action,
        notes: `Moderator action: ${action}`
      });
      if (data.success) {
        toast.success(data.message);
        fetchReports();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Resolution failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">🚨 Moderation & Report Queue</h1>
          <p className="text-xs text-slate-400 mt-1">Inspect reported content (Spam, Harassment, Fake News, Copyright) and enforce actions.</p>
        </div>
      </div>

      {/* Reports Queue */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-36 bg-slate-900 border border-slate-800 rounded-3xl" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-400">
          🎉 All reports resolved! The platform is clean.
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report._id}
              className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col md:flex-row justify-between gap-6 shadow-sm hover:border-slate-700 transition-colors"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-black uppercase rounded-xl">
                    ⚠️ {report.reason}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Target: {report.targetType} ({report.targetId})
                  </span>
                  <span
                    className={`ml-auto px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      report.status === "pending"
                        ? "bg-amber-500/20 text-amber-400 animate-pulse"
                        : "bg-emerald-500/20 text-emerald-400"
                    }`}
                  >
                    {report.status?.toUpperCase()}
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-200 mt-2">
                  Reported by: @{report.reporter?.username || "user"} ({report.reporter?.name})
                </p>

                {report.details && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-xs text-slate-300 italic">
                    "{report.details}"
                  </div>
                )}

                <span className="text-[10px] text-slate-500 block pt-1">
                  Submitted: {new Date(report.createdAt).toLocaleString()}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap md:flex-col justify-center gap-2 min-w-44">
                <button
                  onClick={() => handleResolve(report._id, "approved", "delete_content")}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Delete Content
                </button>
                <button
                  onClick={() => handleResolve(report._id, "approved", "suspend_user")}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Suspend User
                </button>
                <button
                  onClick={() => handleResolve(report._id, "approved", "block_user")}
                  className="px-4 py-2 bg-rose-950 text-rose-300 font-bold text-xs rounded-xl hover:bg-rose-900 transition-all cursor-pointer border border-rose-800"
                >
                  Block User
                </button>
                <button
                  onClick={() => handleResolve(report._id, "rejected", "none")}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Dismiss Report
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReports;
