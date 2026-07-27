import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const AdminSidebar = ({ collapsed, toggleCollapse, adminRole, maintenanceMode }) => {
  const navigate = useNavigate();

  const menuItems = [
    { path: "/admin/dashboard", label: "Overview & Stats", icon: "📊" },
    { path: "/admin/users", label: "User Management", icon: "👥" },
    { path: "/admin/posts", label: "Post Management", icon: "📝" },
    { path: "/admin/comments", label: "Comment Moderation", icon: "💬" },
    { path: "/admin/reports", label: "Report Queue", icon: "🚨" },
    { path: "/admin/categories", label: "Categories & Tags", icon: "🏷️" },
    { path: "/admin/analytics", label: "Analytics & Charts", icon: "📈" },
    { path: "/admin/security", label: "Security & Device Logs", icon: "🛡️" },
    { path: "/admin/site-settings", label: "Site Settings", icon: "⚙️" },
    { path: "/admin/verification", label: "Verification Center", icon: "✔️" },
    { path: "/admin/logs", label: "System Logs", icon: "📜" },
    { path: "/admin/ai-moderation", label: "AI Moderation", icon: "🤖" },
  ];

  return (
    <aside
      className={`bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col transition-all duration-300 relative z-30 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Collapse Toggle */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-6 w-6 h-6 bg-violet-600 text-white rounded-full flex items-center justify-center text-xs shadow-md cursor-pointer hover:bg-violet-500 z-40"
      >
        {collapsed ? "→" : "←"}
      </button>

      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-violet-500/20 flex-shrink-0">
          👑
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h2 className="font-black text-sm text-white tracking-tight leading-none">Blogify Admin</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] uppercase font-bold text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/20">
                {adminRole || "Super Admin"}
              </span>
              {maintenanceMode && (
                <span className="text-[9px] uppercase font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 animate-pulse">
                  Maint.
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`
            }
          >
            <span className="text-base leading-none">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Return to Main App */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
        >
          <span>🏠</span>
          {!collapsed && <span>Main Application</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
