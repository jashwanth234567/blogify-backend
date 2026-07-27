// ─────────────────────────────────────────────────────────────────────────────
// server/middleware/roleGuard.js
// Reusable RBAC middleware factory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * requireRole(...roles)
 * Returns middleware that only allows requests from users with one of the given roles.
 * Must be used AFTER protect or protectAdmin middleware (which sets req.user).
 *
 * @param {...string} roles - allowed roles e.g. "ADMIN", "SUPER_ADMIN"
 */
export const requireRole = (...roles) => (req, res, next) => {
  const user = req.user || req.admin;
  if (!user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const userRole = user.role || (user.isAdmin ? "ADMIN" : "USER");

  if (!roles.includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Requires one of: ${roles.join(", ")}.`,
    });
  }

  next();
};

/**
 * requireAdmin — shorthand for requireRole("ADMIN", "SUPER_ADMIN")
 */
export const requireAdmin = requireRole("ADMIN", "SUPER_ADMIN");

/**
 * requireSuperAdmin — shorthand for requireRole("SUPER_ADMIN")
 */
export const requireSuperAdmin = requireRole("SUPER_ADMIN");

/**
 * requireModerator — shorthand for requireRole("MODERATOR", "ADMIN", "SUPER_ADMIN")
 */
export const requireModerator = requireRole("MODERATOR", "ADMIN", "SUPER_ADMIN");

/**
 * excludeAdmins — middleware that blocks admin accounts from accessing
 * public user routes (e.g. admin cannot use public profile, follow, etc.)
 */
export const excludeAdmins = (req, res, next) => {
  const user = req.user;
  if (user && (user.isAdmin || ["ADMIN", "SUPER_ADMIN"].includes(user.role))) {
    return res.status(403).json({
      success: false,
      message: "Admin accounts cannot perform this action on the public platform.",
    });
  }
  next();
};
