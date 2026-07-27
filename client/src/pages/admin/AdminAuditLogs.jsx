import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `/api/admin/audit-logs?page=${page}&limit=15&search=${encodeURIComponent(search)}`
      );
      if (data.success) {
        setLogs(data.logs);
        setTotal(data.total);
      }
    } catch (err) {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, search]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">📜 Security Audit Logs</h1>
          <p className="text-xs text-slate-400 mt-1">Immutable security ledger of every administrator action, target, IP address, and device.</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search logs by Admin Name, Action, or Target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-500 focus:border-violet-500 outline-none"
          />
          <span className="absolute left-3 top-3 text-slate-500 text-xs">🔍</span>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/50">
              <th className="p-4">Admin Operator</th>
              <th className="p-4">Action Performed</th>
              <th className="p-4">Target Entity</th>
              <th className="p-4">IP & Device Meta</th>
              <th className="p-4 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500 animate-pulse">Loading security audit records...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">No audit logs recorded matching filter.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-white">{log.adminName}</p>
                    <span className="text-[10px] text-violet-400 font-semibold uppercase">{log.adminRole || "Admin"}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-violet-500/10 text-violet-300 font-mono text-[11px] font-bold rounded-lg border border-violet-500/20">
                      {log.action}
                    </span>
                    {log.details && <p className="text-[11px] text-slate-400 italic mt-1">{log.details}</p>}
                  </td>
                  <td className="p-4">
                    <span className="text-slate-300 font-bold capitalize">{log.targetType}: </span>
                    <span className="text-slate-400">{log.targetName || log.targetId || "N/A"}</span>
                  </td>
                  <td className="p-4 text-[11px] text-slate-400">
                    <p className="text-slate-300 font-medium">💻 {log.device || "Browser"}</p>
                    <p className="text-slate-500">IP: {log.ipAddress || "127.0.0.1"}</p>
                  </td>
                  <td className="p-4 text-right text-[11px] text-slate-400">
                    {new Date(log.createdAt).toLocaleString()}
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

export default AdminAuditLogs;
