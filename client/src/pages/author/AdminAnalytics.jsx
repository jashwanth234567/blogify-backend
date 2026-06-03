import React, { useState } from "react";
import toast from "react-hot-toast";

const AdminAnalytics = () => {
    const [users, setUsers] = useState([
        { id: 1, name: "Admin User", email: "admin@blogify.com", role: "Admin", status: "Active" },
        { id: 2, name: "Author Sarah", email: "sarah@gmail.com", role: "Author", status: "Active" },
        { id: 3, name: "Editor Alex", email: "alex@yahoo.com", role: "Editor", status: "Suspended" }
    ]);

    const handleRoleChange = (userId, newRole) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        toast.success("User role updated successfully");
    };

    const handleStatusToggle = (userId) => {
        setUsers(prev => prev.map(u => {
            if (u.id === userId) {
                const nextStatus = u.status === "Active" ? "Suspended" : "Active";
                toast.success(`User status changed to ${nextStatus}`);
                return { ...u, status: nextStatus };
            }
            return u;
        }));
    };

    return (
        <div className="flex-1 bg-[rgb(219,218,218)] text-slate-800 dark:text-slate-100 p-6 md:p-10 overflow-y-auto font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🛡️</span> Security &amp; Admin Center
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Manage user permission roles, check active security sessions, and configure platform firewalls.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* User management */}
                <div className="lg:col-span-8 bg-[rgb(219,218,218)] dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl p-6 shadow-lg transition-shadow">
                    <h2 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-4 uppercase tracking-wider">User Directory &amp; Roles</h2>
                    <div className="relative overflow-x-auto rounded-xl border border-transparent dark:border-slate-700/50 shadow-lg">
                        <table className="w-full text-sm text-slate-600 dark:text-slate-400 text-left">
                            <thead className="text-xs uppercase text-slate-500 dark:text-slate-500 border-b border-transparent dark:border-slate-700 bg-[rgb(219,218,218)] dark:bg-slate-900/40">
                                <tr>
                                    <th className="py-3 px-4 font-bold">User Details</th>
                                    <th className="py-3 px-4 font-bold">System Role</th>
                                    <th className="py-3 px-4 font-bold">Status</th>
                                    <th className="py-3 px-4 font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b border-slate-250 dark:border-slate-700/40 hover:bg-[rgb(219,218,218)] dark:hover:bg-slate-700/20 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="font-semibold text-slate-800 dark:text-white">{user.name}</div>
                                            <div className="text-xs text-slate-400 dark:text-slate-500">{user.email}</div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="bg-[rgb(219,218,218)] dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-750 dark:text-slate-200 focus:outline-none focus:border-violet-500 transition-colors shadow-lg"
                                            >
                                                <option value="Admin">Admin</option>
                                                <option value="Author">Author</option>
                                                <option value="Editor">Editor</option>
                                            </select>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                                                user.status === "Active"
                                                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900/20"
                                                    : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-450 border-rose-250 dark:border-rose-900/20"
                                            }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <button
                                                onClick={() => handleStatusToggle(user.id)}
                                                className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-850 dark:hover:text-violet-300 hover:underline cursor-pointer transition-colors"
                                            >
                                                {user.status === "Active" ? "Suspend" : "Activate"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Firewall status */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl p-6 shadow-lg transition-shadow">
                        <h2 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-4 uppercase tracking-wider">Security Shield</h2>
                        <div className="space-y-3">
                            {[
                                { title: "SSL Firewall", desc: "TLS 1.3 Encryption active", pulse: true },
                                { title: "Session Limiter", desc: "Max 5 active keys per user", pulse: true },
                                { title: "IP Geoblocking", desc: "Rate limiter: 60req/min", pulse: false },
                            ].map((item, i) => (
                                <div key={i} className="p-3 bg-[rgb(219,218,218)] dark:bg-slate-900/60 border border-transparent dark:border-slate-700 rounded-xl flex justify-between items-center shadow-lg">
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.title}</h4>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                                    </div>
                                    <span className={`h-2 w-2 rounded-full bg-emerald-500 ${item.pulse ? 'animate-pulse' : ''}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
