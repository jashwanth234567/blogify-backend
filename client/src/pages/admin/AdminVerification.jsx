import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AdminVerification = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchVerificationRequests = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/admin/verification?status=${statusFilter}`);
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      toast.error("Failed to load verification queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationRequests();
  }, [statusFilter]);

  const handleAction = async (userId, action) => {
    try {
      const { data } = await axios.put(`/api/admin/verification/${userId}/${action}`);
      if (data.success) {
        toast.success(data.message);
        fetchVerificationRequests();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update verification status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">✔️ Verification Center</h1>
          <p className="text-xs text-slate-400 mt-1">Approve and grant verified checkmark badges to creators.</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-800 bg-slate-900 text-slate-300 outline-none cursor-pointer"
        >
          <option value="all">All Accounts</option>
          <option value="pending">Not Verified</option>
          <option value="verified">Verified Badge</option>
        </select>
      </div>

      {/* Grid List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-950/40">
              <th className="p-4">Creator Detail</th>
              <th className="p-4">Account Role</th>
              <th className="p-4">Current Badge</th>
              <th className="p-4 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850/50 text-xs">
            {loading ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-slate-500 animate-pulse">Loading verification data...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-slate-500">No creators in verification queue.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-850/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80"}
                        alt={u.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-800"
                      />
                      <div>
                        <p className="font-bold text-slate-200">{u.name}</p>
                        <p className="text-[10px] text-slate-500">@{u.username || "user"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 border border-slate-800 text-slate-400">
                      {u.role || "USER"}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.verified ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Verified ✓
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-950 text-slate-500 border border-slate-850">
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      {u.verified ? (
                        <button
                          onClick={() => handleAction(u._id, "reject")}
                          className="px-3 py-1 bg-red-950 hover:bg-red-900/60 text-red-400 font-bold rounded-lg text-[11px] cursor-pointer border border-red-900/30 transition-colors"
                        >
                          Revoke Verification
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(u._id, "approve")}
                          className="px-3 py-1 bg-blue-950 hover:bg-blue-900/60 text-blue-400 font-bold rounded-lg text-[11px] cursor-pointer border border-blue-900/30 transition-colors"
                        >
                          Approve Verification
                        </button>
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

export default AdminVerification;
