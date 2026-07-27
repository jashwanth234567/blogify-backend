import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(localStorage.getItem("admin_token") || null);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verifies the stored admin session
  const verifyAdminSession = async (tokenToCheck) => {
    try {
      setLoading(true);
      const activeToken = tokenToCheck || adminToken;
      if (!activeToken) {
        setAdminUser(null);
        setLoading(false);
        return false;
      }

      // Configure axios authorization header specifically for admin API session checks
      const response = await axios.get("/api/admin/auth/me", {
        headers: { Authorization: activeToken }
      });

      if (response.data.success) {
        setAdminUser(response.data.admin);
        setAdminToken(activeToken);
        localStorage.setItem("admin_token", activeToken);
        return true;
      } else {
        throw new Error(response.data.message || "Session invalid");
      }
    } catch (err) {
      console.error("[Admin Session Verification Failed]:", err);
      logoutAdmin();
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login handler specifically for admins
  const loginAdmin = async (token, adminInfo) => {
    localStorage.setItem("admin_token", token);
    setAdminToken(token);
    setAdminUser(adminInfo);
    axios.defaults.headers.common["Authorization"] = token;
  };

  // Logout handler specifically for admins
  const logoutAdmin = async () => {
    try {
      if (adminToken) {
        await axios.post("/api/admin/auth/logout", {}, {
          headers: { Authorization: adminToken }
        });
      }
    } catch (e) {
      // Ignore network errors on logout
    }
    localStorage.removeItem("admin_token");
    setAdminToken(null);
    setAdminUser(null);
    delete axios.defaults.headers.common["Authorization"];
    toast.success("Admin session terminated");
  };

  useEffect(() => {
    if (adminToken) {
      verifyAdminSession(adminToken);
    } else {
      setLoading(false);
    }
  }, [adminToken]);

  return (
    <AdminContext.Provider
      value={{
        adminToken,
        adminUser,
        loading,
        setLoading,
        verifyAdminSession,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
