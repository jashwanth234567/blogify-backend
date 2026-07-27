import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: "Blogify",
    logoUrl: "",
    maintenanceMode: false,
    registrationEnabled: true,
    emailConfig: { smtpHost: "", smtpPort: 587, smtpUser: "", emailFrom: "" },
    securityConfig: { sessionTimeoutMinutes: 120, maxFailedLoginAttempts: 5, enable2FA: false }
  });
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backingUp, setBackingUp] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/admin/settings");
      if (data.success && data.settings) {
        setSettings(data.settings);
        setBackups(data.settings.backupHistory || []);
      }
    } catch (err) {
      toast.error("Failed to load site settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { data } = await axios.put("/api/admin/settings", settings);
      if (data.success) {
        toast.success("Site settings updated successfully!");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setBackingUp(true);
      const { data } = await axios.post("/api/admin/database/backup");
      if (data.success) {
        toast.success(data.message);
        fetchSettings();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Database backup failed");
    } finally {
      setBackingUp(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 animate-pulse">Loading system settings...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">⚙️ Site Settings & Governance</h1>
        <p className="text-xs text-slate-400 mt-1">Manage global system parameters, maintenance mode, security policies, and DB backups.</p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Maintenance Mode & Controls */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">🛠️ System Control & Maintenance</h3>
          
          <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-850">
            <div>
              <p className="text-xs font-bold text-slate-200">Maintenance Mode</p>
              <p className="text-[11px] text-slate-400">Lock platform for regular users during updates.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-850">
            <div>
              <p className="text-xs font-bold text-slate-200">User Registrations</p>
              <p className="text-[11px] text-slate-400">Allow new visitors to register accounts.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.registrationEnabled}
                onChange={(e) => setSettings({ ...settings, registrationEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
            </label>
          </div>
        </div>

        {/* Site Details */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 text-xs">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">🏷️ Platform Identity</h3>
          <div>
            <label className="block font-bold text-slate-400 mb-1">Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-400 mb-1">Logo URL</label>
            <input
              type="text"
              value={settings.logoUrl}
              onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : "Save Settings"}
          </button>
        </div>
      </form>

      {/* Database Backup & Restore */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">💾 Database Backup & Disaster Recovery</h3>
            <p className="text-xs text-slate-400 mt-1">Generate full JSON database backups of all platform models.</p>
          </div>
          <button
            onClick={handleCreateBackup}
            disabled={backingUp}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            {backingUp ? "Generating Backup..." : "📥 Trigger DB Backup"}
          </button>
        </div>

        <div className="space-y-2 text-xs pt-2">
          {backups.length === 0 ? (
            <p className="text-slate-500 italic">No backup files generated yet.</p>
          ) : (
            backups.map((b, i) => (
              <div key={i} className="p-3 bg-slate-950 rounded-xl flex items-center justify-between border border-slate-850">
                <span className="font-mono text-slate-300">{b.fileName}</span>
                <span className="text-[10px] text-slate-500">{new Date(b.createdAt).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
