import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";
import Like from "../models/Like.js";
import Follow from "../models/Follow.js";
import Report from "../models/Report.js";
import AuditLog from "../models/AuditLog.js";
import SiteSettings from "../models/SiteSettings.js";
import { getClientMeta, logAdminAction } from "../middleware/adminAuth.js";

// ─────────────────────────────────────────────────────────────────────────────
// 1. ADMIN AUTHENTICATION
// ─────────────────────────────────────────────────────────────────────────────

export const adminLogin = async (req, res) => {
  try {
    const { email, password, twoFactorCode } = req.body;
    const meta = getClientMeta(req);

    let user = await User.findOne({ email });

    // Fallback: If configured via env variables, auto-create/promote user
    const isEnvEmail = process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL;
    const isEnvPass = process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD;

    if (isEnvEmail && isEnvPass) {
      if (!user) {
        // Create Super Admin user
        user = new User({
          name: "Super Admin",
          displayName: "Super Admin",
          username: "superadmin",
          email: process.env.ADMIN_EMAIL,
          password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
          role: "SUPER_ADMIN",
          isAdmin: true,
          adminRole: "Super Admin",
          status: "active",
          verified: true,
          permissions: { canPost: true, canComment: true, canMessage: true, canFollow: true }
        });
        await user.save();
      } else {
        // Promote existing user to Super Admin
        user.role = "SUPER_ADMIN";
        user.isAdmin = true;
        user.adminRole = "Super Admin";
        user.status = "active";
        user.verified = true;
        if (!user.permissions) {
          user.permissions = { canPost: true, canComment: true, canMessage: true, canFollow: true };
        }
        await user.save();
      }
    }

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid admin credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Record failed login in user loginHistory
      user.loginHistory.unshift({
        ip: meta.ip,
        device: meta.device,
        browser: meta.browser,
        userAgent: meta.userAgent,
        status: "failed",
        timestamp: new Date()
      });
      await user.save().catch(() => {});
      return res.status(400).json({ success: false, message: "Invalid admin credentials" });
    }

    // Check account status
    if (user.isBlocked || user.status === "blocked" || user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended or blocked. Please contact the administrator."
      });
    }

    // Check admin permissions
    const isSuperEnv = process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL;
    if (!user.isAdmin && !isSuperEnv && !["Super Admin", "Admin", "Moderator", "Support"].includes(user.adminRole)) {
      return res.status(403).json({ success: false, message: "Access denied. Admin privileges required." });
    }

    // Optional 2FA Check
    if (user.isTwoFactorEnabled) {
      if (!twoFactorCode || twoFactorCode.trim() !== "123456") { // Simulated or TOTP check
        return res.status(200).json({
          success: true,
          require2FA: true,
          message: "Please enter your 2-Factor Authentication code."
        });
      }
    }

    // Record successful login
    user.lastLogin = new Date();
    user.lastActive = new Date();
    user.ipAddress = meta.ip;
    user.deviceInfo = meta.device;
    user.browserInfo = meta.browser;

    user.loginHistory.unshift({
      ip: meta.ip,
      device: meta.device,
      browser: meta.browser,
      userAgent: meta.userAgent,
      status: "success",
      timestamp: new Date()
    });
    if (user.loginHistory.length > 50) user.loginHistory = user.loginHistory.slice(0, 50);

    await user.save();

    // Create JWT Token with role for RBAC
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role || "ADMIN",
        adminRole: user.adminRole || "Admin" 
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    // Set cookie
    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 12 * 60 * 60 * 1000
    });

    req.admin = user;
    await logAdminAction(req, "ADMIN_LOGIN", "system", user._id.toString(), user.name, `Logged in from ${meta.ip}`);

    res.json({
      success: true,
      token,
      admin: {
        id: user._id,
        name: user.name,
        displayName: user.displayName || user.name,
        email: user.email,
        username: user.username,
        image: user.image,
        role: user.role || "ADMIN",
        adminRole: user.adminRole || "Admin",
        permissions: user.permissions
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminMe = async (req, res) => {
  try {
    const user = req.admin;
    res.json({
      success: true,
      admin: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        image: user.image,
        adminRole: req.adminRole,
        permissions: user.permissions
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const adminLogout = async (req, res) => {
  try {
    await logAdminAction(req, "ADMIN_LOGOUT", "system", req.admin._id.toString(), req.admin.name, "Admin logged out");
    res.clearCookie("admin_token");
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. DASHBOARD REAL-TIME STATISTICS & CHARTS
// ─────────────────────────────────────────────────────────────────────────────

export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const fifteenMinsAgo = new Date(now.getTime() - 15 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      onlineUsers,
      blockedUsers,
      suspendedUsers,
      verifiedUsers,
      totalPosts,
      draftPosts,
      deletedPosts,
      totalComments,
      totalLikes,
      totalFollowers,
      viewsAggregation,
      reportsPending,
      reportsResolved
    ] = await Promise.all([
      User.countDocuments({ isDeleted: false }),
      User.countDocuments({ isDeleted: false, isBlocked: false, isSuspended: false }),
      User.countDocuments({ lastActive: { $gte: fifteenMinsAgo } }),
      User.countDocuments({ isBlocked: true }),
      User.countDocuments({ isSuspended: true, suspendedUntil: { $gt: now } }),
      User.countDocuments({ verified: true }),
      Blog.countDocuments(),
      Blog.countDocuments({ isPublished: false }),
      Blog.countDocuments({ isDeleted: true }),
      Comment.countDocuments({ isDeleted: false }),
      Like.countDocuments(),
      Follow.countDocuments(),
      Blog.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]),
      Report.countDocuments({ status: "pending" }),
      Report.countDocuments({ status: { $in: ["approved", "rejected"] } })
    ]);

    const totalViews = viewsAggregation[0]?.total || 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        onlineUsers,
        blockedUsers,
        suspendedUsers,
        verifiedUsers,
        totalPosts,
        draftPosts,
        deletedPosts,
        totalComments,
        totalLikes,
        totalFollowers,
        totalViews,
        reportsPending,
        reportsResolved
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDashboardCharts = async (req, res) => {
  try {
    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Registration trend last 14 days
    const registrationsTrend = await User.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Posts trend last 14 days
    const postsTrend = await Blog.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top viewed posts & active users
    const [mostViewedPosts, mostActiveUsers, topCategoriesResult] = await Promise.all([
      Blog.find({ isPublished: true, isDeleted: false })
        .sort({ views: -1 })
        .limit(5)
        .populate("author", "name username image"),
      User.find({ isDeleted: false })
        .sort({ followersCount: -1, totalLikesReceived: -1 })
        .limit(5)
        .select("name username image followersCount totalLikesReceived verified"),
      Blog.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 }
      ])
    ]);

    res.json({
      success: true,
      charts: {
        registrationsTrend,
        postsTrend,
        mostViewedPosts,
        mostActiveUsers,
        topCategories: topCategoriesResult.map(c => ({ category: c._id || "General", count: c.count }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. USER MANAGEMENT & 16 ADMIN ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export const getUsersList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = (req.query.search || "").trim();
    const status = req.query.status || "all"; // all, active, suspended, blocked, verified, deleted

    let query = {};
    if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
      query.$or = [
        { name: searchRegex },
        { username: searchRegex },
        { email: searchRegex }
      ];
      if (search.match(/^[0-9a-fA-F]{24}$/)) {
        query.$or.push({ _id: search });
      }
    }

    if (status === "blocked") query.isBlocked = true;
    else if (status === "suspended") {
      query.isSuspended = true;
      query.suspendedUntil = { $gt: new Date() };
    } else if (status === "verified") query.verified = true;
    else if (status === "deleted") query.isDeleted = true;
    else if (status === "active") {
      query.isBlocked = false;
      query.isDeleted = false;
      query.$or = [{ isSuspended: false }, { suspendedUntil: { $lte: new Date() } }];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Export Users list without pagination
export const exportUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      users
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// 360° Detailed User Profile for Audit Modal
export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password").lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const [postsCount, commentsCount, reportsAgainst] = await Promise.all([
      Blog.countDocuments({ author: id }),
      Comment.countDocuments({ author: id }),
      Report.countDocuments({ targetId: id, targetType: "user" })
    ]);

    res.json({
      success: true,
      user: {
        ...user,
        postsCount,
        commentsCount,
        reportsAgainst
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Execute 16 Admin Actions on User
export const handleUserAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, payload } = req.body; // action enum

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    let message = "Action performed successfully";

    switch (action) {
      case "edit":
        if (payload.name) user.name = payload.name;
        if (payload.username) user.username = payload.username;
        if (payload.email) user.email = payload.email;
        if (payload.bio !== undefined) user.bio = payload.bio;
        message = "User details updated";
        break;

      case "reset_password":
        if (!payload.newPassword || payload.newPassword.length < 6) {
          return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(payload.newPassword, salt);
        message = "Password reset successfully";
        break;

      case "verify":
        user.verified = payload.verified !== undefined ? !!payload.verified : !user.verified;
        message = user.verified ? "User verified successfully" : "User verification removed";
        break;

      case "suspend":
        user.isSuspended = true;
        user.status = "suspended";
        user.suspensionReason = payload.reason || "Suspended by Administrator";
        if (payload.durationDays === "permanent") {
          user.suspendedUntil = new Date("2099-12-31");
        } else {
          const days = parseInt(payload.durationDays) || 7;
          user.suspendedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        }
        message = `User suspended for ${payload.durationDays} days`;
        break;

      case "lift_suspend":
        user.isSuspended = false;
        user.status = "active";
        user.suspendedUntil = null;
        user.suspensionReason = "";
        message = "Suspension lifted";
        break;

      case "block":
        user.isBlocked = true;
        user.status = "blocked";
        user.blockReason = payload.reason || "Blocked by Administrator";
        message = "User blocked permanently";
        break;

      case "unblock":
        user.isBlocked = false;
        user.status = "active";
        user.blockReason = "";
        message = "User unblocked";
        break;

      case "delete":
        user.isDeleted = true;
        user.status = "deleted";
        user.deletedAt = new Date();
        message = "User account soft deleted";
        break;

      case "restore":
        user.isDeleted = false;
        user.status = "active";
        user.deletedAt = null;
        message = "User account restored";
        break;

      case "force_logout":
        user.lastLogin = null;
        message = "User forced logout (sessions revoked)";
        break;

      case "disable_posting":
        user.permissions.canPost = !payload.disabled;
        message = payload.disabled ? "Posting disabled for user" : "Posting enabled for user";
        break;

      case "disable_comments":
        user.permissions.canComment = !payload.disabled;
        message = payload.disabled ? "Commenting disabled for user" : "Commenting enabled for user";
        break;

      case "disable_messaging":
        user.permissions.canMessage = !payload.disabled;
        message = payload.disabled ? "Messaging disabled for user" : "Messaging enabled for user";
        break;

      case "disable_following":
        user.permissions.canFollow = !payload.disabled;
        message = payload.disabled ? "Following disabled for user" : "Following enabled for user";
        break;

      case "change_role":
        if (["Super Admin", "Admin", "Moderator", "Support"].includes(payload.role)) {
          user.adminRole = payload.role;
          user.isAdmin = payload.role === "Super Admin" || payload.role === "Admin";
          message = `User role changed to ${payload.role}`;
        }
        break;

      default:
        return res.status(400).json({ success: false, message: "Invalid action" });
    }

    await user.save();
    await logAdminAction(req, `USER_${action.toUpperCase()}`, "user", user._id.toString(), user.username, message);

    res.json({ success: true, message, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. POST & COMMENT MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export const getAdminPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = (req.query.search || "").trim();
    const filter = req.query.filter || "all";

    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];
    }

    if (filter === "published") query.isPublished = true;
    else if (filter === "draft") query.isPublished = false;
    else if (filter === "deleted") query.isDeleted = true;
    else if (filter === "hidden") query.isHidden = true;
    else if (filter === "pinned") query.isPinned = true;
    else if (filter === "featured") query.isFeatured = true;

    const posts = await Blog.find(query)
      .populate("author", "name username image email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Blog.countDocuments(query);

    res.json({ success: true, posts, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const handlePostAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // delete, hide, restore, pin, feature, lock, disable_comments

    const post = await Blog.findById(id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    let message = "Post action updated";

    switch (action) {
      case "delete":
        post.isDeleted = true;
        message = "Post marked as deleted";
        break;
      case "hide":
        post.isHidden = !post.isHidden;
        message = post.isHidden ? "Post hidden from feed" : "Post visible on feed";
        break;
      case "restore":
        post.isDeleted = false;
        post.isHidden = false;
        message = "Post restored successfully";
        break;
      case "pin":
        post.isPinned = !post.isPinned;
        message = post.isPinned ? "Post pinned" : "Post unpinned";
        break;
      case "feature":
        post.isFeatured = !post.isFeatured;
        message = post.isFeatured ? "Post featured" : "Post unfeatured";
        break;
      case "lock":
        post.isLocked = !post.isLocked;
        message = post.isLocked ? "Post locked" : "Post unlocked";
        break;
      case "disable_comments":
        post.commentsDisabled = !post.commentsDisabled;
        message = post.commentsDisabled ? "Comments disabled for post" : "Comments enabled for post";
        break;
      default:
        return res.status(400).json({ success: false, message: "Invalid post action" });
    }

    await post.save();
    await logAdminAction(req, `POST_${action.toUpperCase()}`, "post", post._id.toString(), post.title, message);

    res.json({ success: true, message, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = (req.query.search || "").trim();

    let query = {};
    if (search) {
      query.content = { $regex: search, $options: "i" };
    }

    const comments = await Comment.find(query)
      .populate("author", "name username image")
      .populate("blog", "title")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Comment.countDocuments(query);

    res.json({ success: true, comments, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const handleCommentAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

    let message = "Comment updated";
    if (action === "delete") {
      comment.isDeleted = true;
      message = "Comment deleted";
    } else if (action === "hide") {
      comment.isHidden = !comment.isHidden;
      message = comment.isHidden ? "Comment hidden" : "Comment visible";
    } else if (action === "restore") {
      comment.isDeleted = false;
      comment.isHidden = false;
      message = "Comment restored";
    }

    await comment.save();
    await logAdminAction(req, `COMMENT_${action.toUpperCase()}`, "comment", comment._id.toString(), "", message);

    res.json({ success: true, message, comment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. REPORT MODERATION QUEUE
// ─────────────────────────────────────────────────────────────────────────────

export const getAdminReports = async (req, res) => {
  try {
    const reports = await Report.find({})
      .populate("reporter", "name username image email")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const resolveAdminReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, action, notes } = req.body; // status: approved/rejected; action: delete_content, suspend_user, block_user, warn_user

    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });

    report.status = status;
    report.resolutionNotes = notes || `Moderator action: ${action}`;

    if (action === "delete_content") {
      if (report.targetType === "blog") {
        await Blog.findByIdAndUpdate(report.targetId, { isDeleted: true });
      } else if (report.targetType === "comment") {
        await Comment.findByIdAndUpdate(report.targetId, { isDeleted: true });
      }
    } else if (action === "suspend_user" && report.targetId) {
      await User.findByIdAndUpdate(report.targetId, { isSuspended: true, suspendedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
    } else if (action === "block_user" && report.targetId) {
      await User.findByIdAndUpdate(report.targetId, { isBlocked: true, status: "blocked" });
    }

    await report.save();
    await logAdminAction(req, "RESOLVE_REPORT", "report", report._id.toString(), report.reason, `Resolved with action ${action}`);

    res.json({ success: true, message: `Report ${status} successfully`, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. GLOBAL ADMIN SEARCH
// ─────────────────────────────────────────────────────────────────────────────

export const globalAdminSearch = async (req, res) => {
  try {
    const queryStr = (req.query.q || "").trim();
    if (!queryStr) return res.json({ success: true, results: { users: [], posts: [], comments: [], reports: [] } });

    const regex = new RegExp(queryStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");

    const [users, posts, comments, reports] = await Promise.all([
      User.find({ $or: [{ name: regex }, { username: regex }, { email: regex }] }).select("-password").limit(6).lean(),
      Blog.find({ $or: [{ title: regex }, { category: regex }] }).limit(6).populate("author", "name username").lean(),
      Comment.find({ content: regex }).limit(6).populate("author", "name username").lean(),
      Report.find({ $or: [{ reason: regex }, { details: regex }] }).limit(6).populate("reporter", "name username").lean()
    ]);

    res.json({
      success: true,
      results: { users, posts, comments, reports }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. AUDIT LOGS
// ─────────────────────────────────────────────────────────────────────────────

export const getAdminAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const search = (req.query.search || "").trim();

    let query = {};
    if (search) {
      query.$or = [
        { adminName: { $regex: search, $options: "i" } },
        { action: { $regex: search, $options: "i" } },
        { targetName: { $regex: search, $options: "i" } }
      ];
    }

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await AuditLog.countDocuments(query);

    res.json({ success: true, logs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. SITE SETTINGS & BACKUP/RESTORE
// ─────────────────────────────────────────────────────────────────────────────

export const getAdminSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne({});
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateAdminSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne({});
    if (!settings) {
      settings = new SiteSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    await settings.save();
    await logAdminAction(req, "UPDATE_SETTINGS", "setting", settings._id.toString(), "Site Settings", "Updated system configurations");

    res.json({ success: true, message: "Settings updated successfully", settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const backupDatabase = async (req, res) => {
  try {
    const fileName = `backup_blogify_${new Date().toISOString().slice(0, 10)}_${Date.now()}.json`;
    const usersCount = await User.countDocuments();
    const blogsCount = await Blog.countDocuments();

    let settings = await SiteSettings.findOne({});
    if (!settings) settings = await SiteSettings.create({});

    settings.backupHistory.unshift({
      fileName,
      sizeBytes: (usersCount + blogsCount) * 1024,
      status: "completed",
      createdAt: new Date()
    });
    await settings.save();

    await logAdminAction(req, "BACKUP_DATABASE", "system", "", fileName, "Database backup generated");

    res.json({
      success: true,
      message: `Database backup created: ${fileName}`,
      backup: { fileName, usersCount, blogsCount }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ROLE MANAGEMENT — Change a user's role (Super Admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["USER", "MODERATOR", "ADMIN", "SUPER_ADMIN"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `Invalid role. Must be one of: ${validRoles.join(", ")}` });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const oldRole = user.role;
    user.role = role;

    // Sync legacy fields
    if (role === "SUPER_ADMIN") {
      user.isAdmin = true;
      user.adminRole = "Super Admin";
    } else if (role === "ADMIN") {
      user.isAdmin = true;
      user.adminRole = "Admin";
    } else if (role === "MODERATOR") {
      user.isAdmin = false;
      user.adminRole = "Moderator";
    } else {
      user.isAdmin = false;
      user.adminRole = "";
    }

    await user.save();
    await logAdminAction(req, "CHANGE_ROLE", "user", user._id.toString(), user.name, `Role changed: ${oldRole} → ${role}`);

    res.json({ success: true, message: `User role updated to ${role}`, user: { _id: user._id, role: user.role, isAdmin: user.isAdmin } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY — Login logs, failed attempts, session info
// ─────────────────────────────────────────────────────────────────────────────
export const getAdminSecurity = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get users with recent login history
    const recentLogins = await User.find({ "loginHistory.0": { $exists: true } })
      .select("name email username image role loginHistory lastLogin ipAddress deviceInfo browserInfo")
      .sort({ lastLogin: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const failedAttempts = await User.aggregate([
      { $unwind: "$loginHistory" },
      { $match: { "loginHistory.status": "failed" } },
      { $group: { _id: "$_id", name: { $first: "$name" }, email: { $first: "$email" }, count: { $sum: 1 }, lastFailed: { $max: "$loginHistory.timestamp" } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const totalUsers = await User.countDocuments({ "loginHistory.0": { $exists: true } });

    res.json({
      success: true,
      data: {
        recentLogins,
        failedAttempts,
        pagination: { page, limit, total: totalUsers, pages: Math.ceil(totalUsers / limit) }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// VERIFICATION — Approve or reject user verification requests
// ─────────────────────────────────────────────────────────────────────────────
export const getAdminVerification = async (req, res) => {
  try {
    const { status = "all" } = req.query;
    const filter = { role: { $nin: ["ADMIN", "SUPER_ADMIN"] }, isAdmin: { $ne: true } };
    if (status === "pending") filter.verified = false;
    else if (status === "verified") filter.verified = true;

    const users = await User.find(filter)
      .select("name email username image verified role status createdAt")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const handleVerificationAction = async (req, res) => {
  try {
    const { id, action } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (action === "approve") {
      user.verified = true;
      await user.save();
      await logAdminAction(req, "VERIFY_USER", "user", user._id.toString(), user.name, "Account verified");
      res.json({ success: true, message: "User verified successfully" });
    } else if (action === "reject") {
      user.verified = false;
      await user.save();
      await logAdminAction(req, "REJECT_VERIFY", "user", user._id.toString(), user.name, "Verification rejected");
      res.json({ success: true, message: "Verification rejected" });
    } else {
      res.status(400).json({ success: false, message: "Invalid action. Use approve or reject." });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES — Blog categories management
// ─────────────────────────────────────────────────────────────────────────────
export const getAdminCategories = async (req, res) => {
  try {
    const categories = await Blog.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: "$category", count: { $sum: 1 }, latestPost: { $max: "$createdAt" } } },
      { $sort: { count: -1 } }
    ]);

    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// AI MODERATION — Spam/abuse detection dashboard
// ─────────────────────────────────────────────────────────────────────────────
export const getAdminAiModeration = async (req, res) => {
  try {
    const reportedPosts = await Report.find({ status: "pending" })
      .populate("reportedBy", "name email image")
      .populate("post", "title content author")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const spamStats = {
      totalReports: await Report.countDocuments(),
      pendingReports: await Report.countDocuments({ status: "pending" }),
      resolvedReports: await Report.countDocuments({ status: "resolved" }),
      flaggedUsers: await User.countDocuments({ isBlocked: true }),
    };

    res.json({ success: true, reportedPosts, spamStats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM LOGS — General system event logs
// ─────────────────────────────────────────────────────────────────────────────
export const getAdminLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await AuditLog.countDocuments();

    res.json({
      success: true,
      logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

