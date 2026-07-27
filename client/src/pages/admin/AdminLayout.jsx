import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAdmin } from "../../context/AdminContext";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminLayout = () => {
  const navigate = useNavigate();
  const { adminUser, loading, logoutAdmin } = useAdmin();

  const [collapsed, setCollapsed] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get("/api/admin/settings");
      if (data.success && data.settings) {
        setMaintenanceMode(!!data.settings.maintenanceMode);
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!loading && !adminUser) {
      navigate("/admin/login");
    }
  }, [adminUser, loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-violet-600/30 border-t-violet-600 animate-spin" />
        <p className="text-xs font-bold text-slate-400 tracking-wider animate-pulse">Verifying Admin Session...</p>
      </div>
    );
  }

  if (!adminUser) return null;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar
        collapsed={collapsed}
        toggleCollapse={() => setCollapsed(!collapsed)}
        adminRole={adminUser?.adminRole || adminUser?.role}
        maintenanceMode={maintenanceMode}
      />

      {/* Main Layout Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Blogify Admin Control Panel
            </span>
            {maintenanceMode && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                ⚠️ MAINTENANCE MODE ACTIVE
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src={adminUser?.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80"}
                alt={adminUser?.name}
                className="w-9 h-9 rounded-xl object-cover border border-slate-700"
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white leading-tight">{adminUser?.name}</p>
                <span className="text-[10px] text-violet-400 font-semibold">{adminUser?.adminRole || adminUser?.role || "Admin"}</span>
              </div>
            </div>

            <button
              onClick={logoutAdmin}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-red-950/60 hover:text-red-400 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 hover:border-red-800 transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Dynamic View Router */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950 relative">
          <Outlet context={{ admin: adminUser, maintenanceMode, setMaintenanceMode }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
