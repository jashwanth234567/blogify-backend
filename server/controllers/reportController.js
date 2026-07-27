import Report from "../models/Report.js";
import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";

// @desc Submit a new report (post, comment, user)
export const createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, details } = req.body;
    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ success: false, message: "Target type, target ID, and reason are required." });
    }

    const report = await Report.create({
      reporter: req.userId,
      targetType,
      targetId,
      reason,
      details: details || ""
    });

    res.status(201).json({ success: true, message: "Report submitted successfully. Administrators will review it.", report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get list of reports for Admin
export const getReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || "all";

    const query = {};
    if (status !== "all") query.status = status;

    const reports = await Report.find(query)
      .populate("reporter", "name username email image")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      reports,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Resolve report (Approve/Reject) with optional admin action
export const resolveReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, action, resolutionNotes } = req.body; // action: 'delete_post', 'suspend_user', 'block_user', 'none'

    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });

    report.status = status || "approved";
    report.resolutionNotes = resolutionNotes || "";
    report.resolvedBy = req.userId;
    report.resolvedAt = new Date();
    await report.save();

    // Perform requested moderation action if specified
    if (action === "delete_post" && report.targetType === "blog") {
      await Blog.findByIdAndDelete(report.targetId);
    } else if (action === "delete_comment" && report.targetType === "comment") {
      await Comment.findByIdAndDelete(report.targetId);
    } else if (action === "suspend_user") {
      const targetUserId = report.targetType === "user" ? report.targetId : null;
      if (targetUserId) {
        await User.findByIdAndUpdate(targetUserId, {
          isSuspended: true,
          suspendedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
          suspensionReason: `Reported for ${report.reason}`
        });
      }
    } else if (action === "block_user") {
      const targetUserId = report.targetType === "user" ? report.targetId : null;
      if (targetUserId) {
        await User.findByIdAndUpdate(targetUserId, {
          isBlocked: true,
          blockReason: `Reported for ${report.reason}`
        });
      }
    }

    res.json({ success: true, message: `Report marked as ${report.status}`, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
