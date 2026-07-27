import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AdminSecurity = () => {
  const [securityData, setSecurityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchSecurityLogs = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/admin/security?page=${page}&limit=15`);
      if (data.success) {
        setSecurityData(data.data);
      }
    } catch (err) {
      toast.error("Failed to load security audit data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityLogs();
  }, [page]);

  if (loading && !securityData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 animate-pulse">
        <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-violet-600 animate-spin mb-4" />
        <p className="text-xs font-bold">Retrieving Security Logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">🛡️ Security & Login Logs</h1>
        <p className="text-xs text-slate-400 mt-1">Audit failed authentication requests, login devices, and active session histories.</p>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Failed Login Attempts */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <h3 className="text-xs font-extrabold uppercase text-red-400 tracking-wider flex items-center gap-1.5">
            <span>🚨</span> Top Failed Login Targets
          </h3>
          <div className="space-y-3">
            {securityData?.failedAttempts?.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No failed attempts logged recently.</p>
            ) : (
              securityData?.failedAttempts?.map((attempt, index) => (
                <div key={index} className="p-3 bg-slate-950 rounded-2xl border border-slate-850 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-white">{attempt.name}</p>
                    <p className="text-[10px] text-slate-500">{attempt.email}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500/10 text-red-400 border border-red-500/20">
                    {attempt.count} failures
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Device History & Logins */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <h3 className="text-xs font-extrabold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
            <span>💻</span> Device & IP History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Device & Browser</th>
                  <th className="pb-3">IP Address</th>
                  <th className="pb-3 text-right">Last Logged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-xs">
                {securityData?.recentLogins?.map((login) => (
                  <tr key={login._id} className="hover:bg-slate-850/30">
                    <td className="py-3">
                      <p className="font-bold text-slate-200">{login.name}</p>
                      <p className="text-[10px] text-slate-500">@{login.username}</p>
                    </td>
                    <td className="py-3 text-[11px] text-slate-400">
                      <p>{login.deviceInfo || "Desktop Browser"}</p>
                      <p className="text-slate-500 text-[10px]">{login.browserInfo || "Chrome"}</p>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-slate-400">
                      {login.ipAddress || "127.0.0.1"}
                    </td>
                    <td className="py-3 text-right text-slate-500 text-[10px]">
                      {login.lastLogin ? new Date(login.lastLogin).toLocaleString() : "Never"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-end gap-2 pt-2 text-xs">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-slate-850 hover:bg-slate-800 disabled:opacity-50 font-bold rounded-lg border border-slate-800 cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!securityData?.recentLogins || securityData?.recentLogins.length < 15}
              className="px-3 py-1 bg-slate-850 hover:bg-slate-800 disabled:opacity-50 font-bold rounded-lg border border-slate-800 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSecurity;
