import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  // Selected user for modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  // Modal controls
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({ name: "", username: "", email: "", bio: "" });
  const [suspendDuration, setSuspendDuration] = useState("7");
  const [suspendReason, setSuspendReason] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("Admin");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `/api/admin/users?page=${page}&limit=10&search=${encodeURIComponent(debouncedSearch)}&status=${statusFilter}`
      );
      if (data.success) {
        setUsers(data.users);
        setTotal(data.total);
      }
    } catch (err) {
      toast.error("Failed to load user list");
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
    fetchUsers();
  }, [page, debouncedSearch, statusFilter]);

  const handleAction = async (user, action, payload = {}) => {
    try {
      const { data } = await axios.put(`/api/admin/users/${user._id}/action`, {
        action,
        payload
      });
      if (data.success) {
        toast.success(data.message);
        fetchUsers();
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
      return false;
    }
  };

  const open360Profile = async (u) => {
    setSelectedUser(u);
    setShowDetailModal(true);
    try {
      const { data } = await axios.get(`/api/admin/users/${u._id}`);
      if (data.success) {
        setUserDetails(data.user);
      }
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">👥 User Management</h1>
          <p className="text-xs text-slate-400 mt-1">Search, inspect 360° audit logs, and execute admin actions.</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by Username, Display Name, Email, or User ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-500 focus:border-violet-500 outline-none"
          />
          <span className="absolute left-3 top-3 text-slate-500 text-xs">🔍</span>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-xs font-bold rounded-xl border border-slate-800 bg-slate-950 text-slate-300 outline-none cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Users</option>
          <option value="suspended">Suspended Users</option>
          <option value="blocked">Blocked Users</option>
          <option value="verified">Verified Users</option>
          <option value="deleted">Deleted Users</option>
        </select>
      </div>

      {/* User Management Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/50">
              <th className="p-4">User Details</th>
              <th className="p-4">Role & Status</th>
              <th className="p-4">Device & IP</th>
              <th className="p-4">Permissions</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500 animate-pulse">Loading user records...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">No users found matching filter.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80"}
                        alt={u.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-white truncate">{u.name}</p>
                          {u.verified && <span className="text-blue-400 text-[10px]" title="Verified">✓</span>}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">@{u.username || "user"} • {u.email}</p>
                        <span className="text-[10px] text-slate-500 block">ID: {u._id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-violet-500/20 text-violet-400 border border-violet-500/30">
                        {u.adminRole || (u.isAdmin ? "Admin" : "User")}
                      </span>
                      {u.isBlocked ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/30">BLOCKED</span>
                      ) : u.isSuspended ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">SUSPENDED</span>
                      ) : u.isDeleted ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30">DELETED</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ACTIVE</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-[11px] text-slate-400">
                    <p className="text-slate-300 font-medium">💻 {u.deviceInfo || u.loginHistory?.[0]?.device || "Desktop"}</p>
                    <p className="text-slate-500">IP: {u.ipAddress || u.loginHistory?.[0]?.ip || "127.0.0.1"}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-[10px]">
                      <button onClick={() => handleAction(u, "disable_posting", { disabled: u.permissions?.canPost })} title="Toggle Post Permission" className={`px-1.5 py-0.5 rounded font-bold ${u.permissions?.canPost !== false ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>Post</button>
                      <button onClick={() => handleAction(u, "disable_comments", { disabled: u.permissions?.canComment })} title="Toggle Comment Permission" className={`px-1.5 py-0.5 rounded font-bold ${u.permissions?.canComment !== false ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>Comment</button>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1 flex-wrap">
                      <button onClick={() => open360Profile(u)} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-[11px] cursor-pointer">View 360°</button>
                      <button onClick={() => { setSelectedUser(u); setEditForm({ name: u.name, username: u.username || "", email: u.email, bio: u.bio || "" }); setShowEditModal(true); }} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-[11px] cursor-pointer">Edit</button>
                      <button onClick={() => handleAction(u, "verify", { verified: !u.verified })} className="px-2 py-1 bg-blue-950 text-blue-400 font-bold rounded-lg text-[11px] cursor-pointer">{u.verified ? "Unverify" : "Verify"}</button>
                      <button onClick={() => { setSelectedUser(u); setShowSuspendModal(true); }} className="px-2 py-1 bg-amber-950 text-amber-400 font-bold rounded-lg text-[11px] cursor-pointer">{u.isSuspended ? "Lift Suspend" : "Suspend"}</button>
                      <button onClick={() => handleAction(u, u.isBlocked ? "unblock" : "block", { reason: "Admin Block" })} className="px-2 py-1 bg-red-950 text-red-400 font-bold rounded-lg text-[11px] cursor-pointer">{u.isBlocked ? "Unblock" : "Block"}</button>
                      <button onClick={() => { setSelectedUser(u); setSelectedRole(u.adminRole || "Admin"); setShowRoleModal(true); }} className="px-2 py-1 bg-violet-950 text-violet-400 font-bold rounded-lg text-[11px] cursor-pointer">Role</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Export controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => {
            const headers = ["User ID,Name,Username,Email,Role,Status,Verified,Followers,Following"];
            const rows = users.map(u => 
              `"${u._id}","${u.name}","${u.username || ''}","${u.email}","${u.role || 'USER'}","${u.status}","${!!u.verified}","${u.followersCount || 0}","${u.followingCount || 0}"`
            );
            const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `blogify_users_export_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Users exported successfully!");
          }}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
        >
          📥 Export User Database (CSV)
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 disabled:opacity-50 text-xs font-bold rounded-lg border border-slate-800"
          >
            Previous
          </button>
          <span className="text-xs font-bold text-slate-400">Page {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={users.length < 10}
            className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 disabled:opacity-50 text-xs font-bold rounded-lg border border-slate-800"
          >
            Next
          </button>
        </div>
      </div>

      {/* 360° User Profile Drawer Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 text-slate-100 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-lg font-black">360° User Audit Details</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 font-bold text-xl cursor-pointer">✕</button>
            </div>
            
            <div className="flex items-center gap-4">
              <img src={selectedUser.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80"} className="w-16 h-16 rounded-full object-cover border-2 border-violet-500" />
              <div>
                <h4 className="text-base font-bold">{selectedUser.name}</h4>
                <p className="text-xs text-slate-400">@{selectedUser.username} • {selectedUser.email}</p>
                <p className="text-[11px] text-slate-500">Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800"><p className="font-black text-violet-400 text-base">{userDetails?.postsCount || 0}</p><p className="text-slate-400">Posts</p></div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800"><p className="font-black text-indigo-400 text-base">{userDetails?.followersCount || 0}</p><p className="text-slate-400">Followers</p></div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800"><p className="font-black text-red-400 text-base">{userDetails?.reportsAgainst || 0}</p><p className="text-slate-400">Reports Against</p></div>
            </div>

            <div>
              <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">Login Audit Trail (IP & Device)</h5>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedUser.loginHistory?.map((h, i) => (
                  <div key={i} className="p-2.5 bg-slate-950 rounded-xl text-[11px] flex justify-between border border-slate-850">
                    <span>💻 {h.device || "Browser"} • IP: {h.ip || "127.0.0.1"}</span>
                    <span className="text-slate-500">{new Date(h.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full text-slate-100">
            <h3 className="text-base font-bold mb-4">Edit User Profile</h3>
            <div className="space-y-3 text-xs">
              <div><label className="block text-slate-400 font-bold mb-1">Name</label><input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800" /></div>
              <div><label className="block text-slate-400 font-bold mb-1">Username</label><input type="text" value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800" /></div>
              <div><label className="block text-slate-400 font-bold mb-1">Email</label><input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-5 text-xs">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-slate-800 rounded-xl font-bold">Cancel</button>
              <button onClick={async () => { const ok = await handleAction(selectedUser, "edit", editForm); if (ok) setShowEditModal(false); }} className="px-4 py-2 bg-violet-600 font-bold rounded-xl text-white">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full text-slate-100 space-y-4">
            <h3 className="text-base font-bold">Suspend Account: @{selectedUser.username}</h3>
            <div className="text-xs space-y-3">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Duration</label>
                <select value={suspendDuration} onChange={e => setSuspendDuration(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-bold">
                  <option value="1">1 Day</option>
                  <option value="7">7 Days</option>
                  <option value="30">30 Days</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-400 mb-1">Reason</label>
                <textarea value={suspendReason} onChange={e => setSuspendReason(e.target.value)} placeholder="Reason for suspension..." rows="3" className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800" />
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xs">
              <button onClick={() => setShowSuspendModal(false)} className="px-4 py-2 bg-slate-800 rounded-xl font-bold">Cancel</button>
              <button onClick={async () => { const ok = await handleAction(selectedUser, "suspend", { durationDays: suspendDuration, reason: suspendReason }); if (ok) setShowSuspendModal(false); }} className="px-4 py-2 bg-amber-600 font-bold rounded-xl text-white">Apply Suspension</button>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full text-slate-100 space-y-4">
            <h3 className="text-base font-bold">Change Role: @{selectedUser.username}</h3>
            <div className="text-xs">
              <label className="block font-bold text-slate-400 mb-1">Select Role</label>
              <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-bold">
                <option value="USER">USER</option>
                <option value="MODERATOR">MODERATOR</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 text-xs">
              <button onClick={() => setShowRoleModal(false)} className="px-4 py-2 bg-slate-800 rounded-xl font-bold">Cancel</button>
              <button onClick={async () => {
                try {
                  const { data } = await axios.put(`/api/admin/users/${selectedUser._id}/role`, { role: selectedRole });
                  if (data.success) {
                    toast.success(data.message);
                    setShowRoleModal(false);
                    fetchUsers();
                  } else {
                    toast.error(data.message);
                  }
                } catch (err) {
                  toast.error(err.response?.data?.message || "Failed to update role");
                }
              }} className="px-4 py-2 bg-violet-600 font-bold rounded-xl text-white">Update Role</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
