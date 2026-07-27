import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

const AdminDashboard = () => {
  const { token, user: currentUser } = useAppContext();

  const [activeTab, setActiveTab] = useState("overview"); // overview, users, reports, analytics
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Users State
  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersStatusFilter, setUsersStatusFilter] = useState("all");
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Selected User for Modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  // Edit User Form State
  const [editForm, setEditForm] = useState({ name: "", username: "", email: "", isAdmin: false, verified: false });
  const [suspendDuration, setSuspendDuration] = useState("7");
  const [suspendReason, setSuspendReason] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");

  // Reports State
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Analytics State
  const [analytics, setAnalytics] = useState(null);

  // Fetch Overview Stats
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const { data } = await axios.get("/api/admin/stats", {
        headers: { Authorization: token },
      });
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      toast.error("Failed to load admin dashboard statistics.");
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch Users List
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data } = await axios.get(
        `/api/admin/users?page=${usersPage}&limit=10&search=${encodeURIComponent(usersSearch)}&status=${usersStatusFilter}`,
        { headers: { Authorization: token } }
      );
      if (data.success) {
        setUsers(data.users);
        setUsersTotal(data.total);
      }
    } catch (err) {
      toast.error("Failed to fetch user list.");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch Reports
  const fetchReports = async () => {
    try {
      setLoadingReports(true);
      const { data } = await axios.get("/api/reports/admin", {
        headers: { Authorization: token },
      });
      if (data.success) {
        setReports(data.reports);
      }
    } catch (err) {
      toast.error("Failed to fetch moderation reports.");
    } finally {
      setLoadingReports(false);
    }
  };

  // Fetch Analytics
  const fetchAnalytics = async () => {
    try {
      const { data } = await axios.get("/api/admin/analytics", {
        headers: { Authorization: token },
      });
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (err) {
      toast.error("Failed to load analytics.");
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "reports") fetchReports();
    if (activeTab === "analytics") fetchAnalytics();
  }, [activeTab, usersPage, usersSearch, usersStatusFilter]);

  // Actions
  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(`/api/admin/users/${selectedUser._id}/edit`, editForm, {
        headers: { Authorization: token },
      });
      if (data.success) {
        toast.success("User updated successfully!");
        setShowEditModal(false);
        fetchUsers();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to update user.");
    }
  };

  const handleToggleBlock = async (u) => {
    const isBlocking = !u.isBlocked;
    const reason = isBlocking ? prompt("Enter reason for blocking user:") : "";
    if (isBlocking && reason === null) return;

    try {
      const { data } = await axios.put(
        `/api/admin/users/${u._id}/block`,
        { isBlocked: isBlocking, blockReason: reason },
        { headers: { Authorization: token } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchUsers();
      }
    } catch (err) {
      toast.error("Failed to update block status.");
    }
  };

  const handleSuspendSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        `/api/admin/users/${selectedUser._id}/suspend`,
        { durationDays: suspendDuration, suspensionReason: suspendReason },
        { headers: { Authorization: token } }
      );
      if (data.success) {
        toast.success(data.message);
        setShowSuspendModal(false);
        fetchUsers();
      }
    } catch (err) {
      toast.error("Failed to suspend user.");
    }
  };

  const handleLiftSuspension = async (u) => {
    try {
      const { data } = await axios.put(
        `/api/admin/users/${u._id}/suspend`,
        { lift: true },
        { headers: { Authorization: token } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchUsers();
      }
    } catch (err) {
      toast.error("Failed to lift suspension.");
    }
  };

  const handleDeleteUser = async (u) => {
    if (!window.confirm(`Are you sure you want to permanently delete user @${u.username}? All their posts will be removed.`)) return;
    try {
      const { data } = await axios.delete(`/api/admin/users/${u._id}`, {
        headers: { Authorization: token },
      });
      if (data.success) {
        toast.success("User deleted successfully.");
        fetchUsers();
      }
    } catch (err) {
      toast.error("Delete failed.");
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `/api/admin/users/${selectedUser._id}/reset-password`,
        { newPassword: resetNewPassword },
        { headers: { Authorization: token } }
      );
      if (data.success) {
        toast.success("Password reset successfully!");
        setShowResetPasswordModal(false);
        setResetNewPassword("");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to reset password.");
    }
  };

  const handleExportUsers = async () => {
    try {
      const { data } = await axios.get("/api/admin/users/export", {
        headers: { Authorization: token },
      });
      if (data.success) {
        const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data.users, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", jsonStr);
        downloadAnchor.setAttribute("download", `blogify_users_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        toast.success("Users exported successfully!");
      }
    } catch (err) {
      toast.error("Failed to export users.");
    }
  };

  const handleResolveReport = async (reportId, status, action) => {
    try {
      const { data } = await axios.put(
        `/api/reports/admin/${reportId}`,
        { status, action, resolutionNotes: `Action taken: ${action}` },
        { headers: { Authorization: token } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchReports();
      }
    } catch (err) {
      toast.error("Action failed.");
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto text-slate-850 dark:text-slate-100">
      
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            👑 System Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage users, monitor platform analytics, and handle moderation reports.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.href = "/"}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            🏠 Back to Home
          </button>
          <button
            onClick={handleExportUsers}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            📥 Export Users CSV/JSON
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-5 py-2.5 rounded-t-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "overview"
              ? "bg-violet-600 text-white"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          📊 Overview Stats
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-5 py-2.5 rounded-t-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "users"
              ? "bg-violet-600 text-white"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          👥 User Management ({usersTotal})
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-5 py-2.5 rounded-t-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "reports"
              ? "bg-violet-600 text-white"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          🚨 Moderation Reports ({reports.filter(r => r.status === "pending").length})
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-5 py-2.5 rounded-t-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "analytics"
              ? "bg-violet-600 text-white"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          📈 Analytics & Charts
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {loadingStats ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
              ))}
            </div>
          ) : stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{stats.totalUsers}</p>
                <span className="text-[11px] font-bold text-emerald-500 mt-1 block">+{stats.monthlyGrowth} monthly</span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Online Users</p>
                <p className="text-3xl font-black text-emerald-500 mt-2">🟢 {stats.onlineUsers}</p>
                <span className="text-[11px] text-slate-400 mt-1 block">Active in last 15 min</span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's New Users</p>
                <p className="text-3xl font-black text-violet-600 dark:text-violet-400 mt-2">{stats.todaysUsers}</p>
                <span className="text-[11px] text-slate-400 mt-1 block">Registered today</span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Active (DAU)</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{stats.dailyActiveUsers}</p>
                <span className="text-[11px] text-slate-400 mt-1 block">Logged in today</span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Posts</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">📝 {stats.totalPosts}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Comments</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">💬 {stats.totalComments}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Likes</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">❤️ {stats.totalLikes}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Reports</p>
                <p className={`text-3xl font-black mt-2 ${stats.pendingReports > 0 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                  🚨 {stats.pendingReports}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* USER MANAGEMENT TAB */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Search by Name, Username, Email..."
                value={usersSearch}
                onChange={(e) => setUsersSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-violet-500 outline-none"
              />
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={usersStatusFilter}
                onChange={(e) => setUsersStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Users</option>
                <option value="blocked">Blocked Users</option>
                <option value="suspended">Suspended Users</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-950/50">
                  <th className="p-4">User</th>
                  <th className="p-4">Role & Status</th>
                  <th className="p-4">Last Login</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
                {loadingUsers ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-400 animate-pulse">Loading users list...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-400">No users found matching query</td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={u.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80"} alt={u.name} className="w-9 h-9 rounded-full object-cover bg-slate-200" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                            <p className="text-xs text-slate-450">@{u.username} • {u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {u.isAdmin && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-500">ADMIN</span>}
                          {u.isBlocked ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-500">BLOCKED</span>
                          ) : u.isSuspended && u.suspendedUntil && new Date(u.suspendedUntil) > new Date() ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-500">SUSPENDED</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-500">ACTIVE</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-xs text-slate-500 dark:text-slate-400">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "Never"}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setEditForm({ name: u.name, username: u.username || "", email: u.email, isAdmin: u.isAdmin, verified: u.verified });
                              setShowEditModal(true);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-xs cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleBlock(u)}
                            className={`px-2.5 py-1 font-bold rounded-lg text-xs cursor-pointer ${
                              u.isBlocked
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                            }`}
                          >
                            {u.isBlocked ? "Unblock" : "Block"}
                          </button>
                          {u.isSuspended && new Date(u.suspendedUntil) > new Date() ? (
                            <button
                              onClick={() => handleLiftSuspension(u)}
                              className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded-lg text-xs cursor-pointer"
                            >
                              Lift Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setShowSuspendModal(true);
                              }}
                              className="px-2.5 py-1 bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-400 font-bold rounded-lg text-xs cursor-pointer"
                            >
                              Suspend
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setShowHistoryModal(true);
                            }}
                            className="px-2.5 py-1 bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400 font-bold rounded-lg text-xs cursor-pointer"
                          >
                            History
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setShowResetPasswordModal(true);
                            }}
                            className="px-2.5 py-1 bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 font-bold rounded-lg text-xs cursor-pointer"
                          >
                            Reset PW
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="px-2 py-1 text-red-500 hover:text-red-700 font-bold text-xs cursor-pointer"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODERATION REPORTS TAB */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">User Reports & Moderation Queue</h3>
          {loadingReports ? (
            <p className="p-8 text-center text-slate-400">Loading reports...</p>
          ) : reports.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
              🎉 No pending reports! Platform is clean.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map(r => (
                <div key={r._id} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 bg-red-500/20 text-red-500 font-extrabold text-[10px] uppercase rounded-full">
                        {r.reason}
                      </span>
                      <span className="text-xs text-slate-450 uppercase font-bold">Target: {r.targetType} ({r.targetId})</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                      Reported by: @{r.reporter?.username || "user"}
                    </p>
                    {r.details && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">"{r.details}"</p>}
                    <span className="text-[10px] text-slate-400 block mt-2">{new Date(r.createdAt).toLocaleString()}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleResolveReport(r._id, "approved", "delete_post")}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
                    >
                      Delete Post
                    </button>
                    <button
                      onClick={() => handleResolveReport(r._id, "approved", "suspend_user")}
                      className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
                    >
                      Suspend User
                    </button>
                    <button
                      onClick={() => handleResolveReport(r._id, "rejected", "none")}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                    >
                      Dismiss Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === "analytics" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">🔥 Most Viewed Posts</h4>
              <div className="space-y-3">
                {analytics?.mostViewedPosts?.map(p => (
                  <div key={p._id} className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{p.title}</p>
                      <p className="text-[11px] text-slate-450">by @{p.author?.username || "author"}</p>
                    </div>
                    <span className="text-xs font-black text-violet-600 dark:text-violet-400">👁 {p.views}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">🏆 Most Active Authors</h4>
              <div className="space-y-3">
                {analytics?.mostActiveUsers?.map(u => (
                  <div key={u._id} className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <img src={u.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80"} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="text-xs font-bold">{u.name}</p>
                        <p className="text-[11px] text-slate-450">@{u.username}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">👥 {u.followersCount} followers</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Edit User Details</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 font-bold text-xl cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleEditUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Name</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" required />
              </div>
              <div>
                <label className="block font-bold mb-1">Username</label>
                <input type="text" value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" required />
              </div>
              <div>
                <label className="block font-bold mb-1">Email</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" required />
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="font-bold">Grant Admin Role</span>
                <input type="checkbox" checked={editForm.isAdmin} onChange={e => setEditForm({ ...editForm, isAdmin: e.target.checked })} className="h-4 w-4" />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-violet-600 text-white rounded-xl font-bold">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suspend User Modal */}
      {showSuspendModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Suspend @{selectedUser.username}</h3>
              <button onClick={() => setShowSuspendModal(false)} className="text-slate-400 font-bold text-xl cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSuspendSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Suspension Duration</label>
                <select value={suspendDuration} onChange={e => setSuspendDuration(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold">
                  <option value="1">1 Day</option>
                  <option value="7">7 Days</option>
                  <option value="30">30 Days</option>
                  <option value="permanent">Permanent Suspension</option>
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">Reason for Suspension</label>
                <textarea value={suspendReason} onChange={e => setSuspendReason(e.target.value)} placeholder="e.g., Harassment or Spam violation" rows="3" className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" required />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowSuspendModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-xl font-bold">Suspend Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Login & Device History (@{selectedUser.username})</h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 font-bold text-xl cursor-pointer">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 text-xs pr-1">
              {!selectedUser.loginHistory || selectedUser.loginHistory.length === 0 ? (
                <p className="text-slate-400 text-center py-6">No login history recorded yet.</p>
              ) : (
                selectedUser.loginHistory.map((h, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-800">
                    <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                      <span>💻 {h.device || "Browser"}</span>
                      <span className="text-violet-600 dark:text-violet-400">IP: {h.ip || "Unknown"}</span>
                    </div>
                    <p className="text-[11px] text-slate-450 truncate">{h.userAgent}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">{new Date(h.timestamp).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Reset Password (@{selectedUser.username})</h3>
              <button onClick={() => setShowResetPasswordModal(false)} className="text-slate-400 font-bold text-xl cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">New Password</label>
                <input type="password" value={resetNewPassword} onChange={e => setResetNewPassword(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" required minLength="6" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowResetPasswordModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold">Set New Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
