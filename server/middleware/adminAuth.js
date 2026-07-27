import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";

// Helper to extract IP, Device & Browser from request
export const getClientMeta = (req) => {
  const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
  const userAgent = req.headers["user-agent"] || "Unknown Browser";
  const device = userAgent.includes("Mobile")
    ? "Mobile Device"
    : userAgent.includes("Tablet")
    ? "Tablet Device"
    : "Desktop Browser";

  let browser = "Browser";
  if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) browser = "Safari";
  else if (userAgent.includes("Edg")) browser = "Edge";

  return { ip, device, browser, userAgent };
};

// Log Admin Action Helper
export const logAdminAction = async (req, action, targetType, targetId = "", targetName = "", details = "") => {
  try {
    const meta = getClientMeta(req);
    const adminUser = req.admin || req.user;
    
    if (adminUser) {
      await AuditLog.create({
        admin: adminUser._id,
        adminName: adminUser.name || "Admin",
        adminRole: adminUser.adminRole || (adminUser.isAdmin ? "Super Admin" : "Admin"),
        action,
        targetType,
        targetId,
        targetName,
        details,
        ipAddress: meta.ip,
        device: meta.device,
        browser: meta.browser
      });
    }
  } catch (err) {
    console.error("[AuditLog Error]:", err);
  }
};

// Protect Admin Middleware
export const protectAdmin = async (req, res, next) => {
  let token = req.headers.authorization;

  if (!token && req.cookies && req.cookies.admin_token) {
    token = req.cookies.admin_token;
  } else if (!token && req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
  } else if (token && token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Admin authorization token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: "Admin user not found" });
    }

    // Check account status
    if (user.isBlocked || user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended or blocked. Please contact the administrator."
      });
    }

    if (user.isSuspended && user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
      return res.status(403).json({
        success: false,
        message: `Your account has been suspended or blocked. Please contact the administrator.`
      });
    }

    if (user.isDeleted || user.status === "deleted") {
      return res.status(403).json({ success: false, message: "Account has been deleted" });
    }

    // Verify Admin rights — check role field first, then legacy isAdmin
    const isAdminRole = ["ADMIN", "SUPER_ADMIN"].includes(user.role);
    const isLegacyAdmin = user.isAdmin || ["Super Admin", "Admin", "Moderator", "Support"].includes(user.adminRole);
    const isSuperAdminEnv = process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL;

    if (!isAdminRole && !isLegacyAdmin && !isSuperAdminEnv) {
      return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
    }

    req.userId = user._id;
    req.user = user;
    req.admin = user;
    req.adminRole = isSuperAdminEnv ? "Super Admin" : (user.adminRole || "Admin");
    
    // Update last active
    user.lastActive = new Date();
    await user.save().catch(() => {});

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired admin token" });
  }
};

// Role-Based Access Control (RBAC) Guard
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.adminRole || !allowedRoles.includes(req.adminRole)) {
      return res.status(403).json({
        success: false,
        message: `Permission denied. Requires one of roles: ${allowedRoles.join(", ")}`
      });
    }
    next();
  };
};
