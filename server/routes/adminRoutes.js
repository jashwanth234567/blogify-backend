import express from "express";
import {
  adminLogin,
  getAdminMe,
  adminLogout,
  getDashboardStats,
  getDashboardCharts,
  getUsersList,
  exportUsers,
  getUserDetails,
  handleUserAction,
  getAdminPosts,
  handlePostAction,
  getAdminComments,
  handleCommentAction,
  getAdminReports,
  resolveAdminReport,
  globalAdminSearch,
  getAdminAuditLogs,
  getAdminSettings,
  updateAdminSettings,
  backupDatabase,
  changeUserRole,
  getAdminSecurity,
  getAdminVerification,
  handleVerificationAction,
  getAdminCategories,
  getAdminAiModeration,
  getAdminLogs,
} from "../controllers/adminController.js";
import { protectAdmin } from "../middleware/adminAuth.js";
import { requireSuperAdmin } from "../middleware/roleGuard.js";

const router = express.Router();

// ─── Public Admin Auth (no middleware) ───────────────────────────────────────
router.post("/login",        adminLogin);
router.post("/auth/login",   adminLogin);
router.post("/admin-login",  adminLogin);

// ─── All routes below require admin authentication ───────────────────────────
router.use(protectAdmin);

// ─── Admin Identity ───────────────────────────────────────────────────────────
router.get("/auth/me",       getAdminMe);
router.post("/auth/logout",  adminLogout);

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get("/dashboard/stats",  getDashboardStats);
router.get("/dashboard/charts", getDashboardCharts);
router.get("/stats",            getDashboardStats);     // legacy
router.get("/analytics",        getDashboardCharts);    // legacy

// ─── User Management ──────────────────────────────────────────────────────────
router.get("/users/export",           exportUsers);
router.get("/users",                  getUsersList);
router.get("/users/:id",              getUserDetails);
router.put("/users/:id/action",       handleUserAction);
router.put("/users/:id/role",         changeUserRole);   // RBAC role change

// Legacy shorthands
router.put("/users/:id/edit", (req, res) => {
  req.body = { action: "edit", payload: req.body };
  return handleUserAction(req, res);
});
router.put("/users/:id/block", (req, res) => {
  req.body = { action: req.body.isBlocked ? "block" : "unblock", payload: req.body };
  return handleUserAction(req, res);
});
router.put("/users/:id/suspend", (req, res) => {
  req.body = { action: req.body.lift ? "lift_suspend" : "suspend", payload: req.body };
  return handleUserAction(req, res);
});
router.post("/users/:id/reset-password", (req, res) => {
  req.body = { action: "reset_password", payload: req.body };
  return handleUserAction(req, res);
});
router.delete("/users/:id", (req, res) => {
  req.body = { action: "delete", payload: {} };
  return handleUserAction(req, res);
});

// ─── Post Management ──────────────────────────────────────────────────────────
router.get("/posts",             getAdminPosts);
router.put("/posts/:id/action",  handlePostAction);

// ─── Comment Management ───────────────────────────────────────────────────────
router.get("/comments",              getAdminComments);
router.put("/comments/:id/action",   handleCommentAction);

// ─── Reports / Moderation ─────────────────────────────────────────────────────
router.get("/reports",              getAdminReports);
router.put("/reports/:id/resolve",  resolveAdminReport);

// ─── Categories & Tags ────────────────────────────────────────────────────────
router.get("/categories",           getAdminCategories);

// ─── Verification ─────────────────────────────────────────────────────────────
router.get("/verification",                      getAdminVerification);
router.put("/verification/:id/:action",          handleVerificationAction);

// ─── Security & Login Logs ────────────────────────────────────────────────────
router.get("/security",             getAdminSecurity);

// ─── AI Moderation ────────────────────────────────────────────────────────────
router.get("/ai-moderation",        getAdminAiModeration);

// ─── System Logs ─────────────────────────────────────────────────────────────
router.get("/logs",                 getAdminLogs);
router.get("/audit-logs",           getAdminAuditLogs);
router.get("/activities",           getAdminAuditLogs);   // legacy

// ─── Global Search ────────────────────────────────────────────────────────────
router.get("/global-search",        globalAdminSearch);

// ─── Site Settings (Super Admin only for writes) ──────────────────────────────
router.get("/settings",             getAdminSettings);
router.put("/settings",             requireSuperAdmin, updateAdminSettings);
router.post("/database/backup",     requireSuperAdmin, backupDatabase);

export default router;
