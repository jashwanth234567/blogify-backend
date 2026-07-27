import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { useAdmin } from "../../context/AdminContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useAppContext();
  const { loginAdmin } = useAdmin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [show2FA, setShow2FA] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res;
      try {
        res = await axios.post("/api/admin/login", { email, password, twoFactorCode });
      } catch (err1) {
        if (err1.response?.status === 404) {
          res = await axios.post("/api/admin/auth/login", { email, password, twoFactorCode });
        } else {
          throw err1;
        }
      }

      const data = res.data;

      if (data.success) {
        if (data.require2FA) {
          setShow2FA(true);
          toast.success("2-Factor Authentication required. Enter code 123456.");
        } else {
          await loginAdmin(data.token, data.admin);
          toast.success(`Welcome Admin ${data.admin?.name || "User"}!`);
          navigate("/admin/dashboard");
        }
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("[Admin Login Error]:", err);
      toast.error(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden font-sans">
      {/* Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md p-8 bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl shadow-2xl z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl shadow-lg shadow-violet-500/30 mb-4">
            <span className="text-2xl">👑</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">System Admin Control</h1>
          <p className="text-xs text-slate-400 mt-1">Enterprise Moderation & Governance Panel</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@blogify.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
            />
          </div>

          {show2FA && (
            <div className="animate-in fade-in duration-300">
              <label className="block font-bold text-amber-400 mb-1 uppercase tracking-wider">2FA Security Code</label>
              <input
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="123456"
                required
                className="w-full px-4 py-3 rounded-xl border border-amber-500/40 bg-slate-950 text-amber-300 font-mono text-center text-base tracking-widest outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/25 transition-all cursor-pointer disabled:opacity-50 text-sm"
          >
            {loading ? "Authenticating Session..." : show2FA ? "Verify 2FA & Access" : "Admin Sign In"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Return to Blogify Main App
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
