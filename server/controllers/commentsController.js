import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";
import Notification from "../models/Notification.js";
import { logActivity } from "../middleware/activityLogger.js";
import { sendCommentAddedEmail } from "../configs/emailService.js";

// Add Comment ( Public Route , No Auth Required )
// POST /api/comment/add
export const addComment = async (req, res) => {
    try {
        const { blog, name, content } = req.body;
        const blogData = await Blog.findById(blog).populate("author");
        
        if (!blogData) {
            return res.json({ success: false, message: "Blog not found" });
        }

        const newComment = await Comment.create({ 
            blog, 
            name, 
            content, 
            author: blogData.author._id 
        });

        // 1. Log Activity
        await logActivity(null, "comment_add", `New comment by "${name}" on blog: "${blogData.title}"`);

        // 2. Create Notification for Author
        await Notification.create({
            user: blogData.author._id,
            message: `New Comment: "${name}" commented on your blog "${blogData.title}"`,
            type: "comment",
            link: "/author/list-comment",
        });

        // 3. Send Notification Email to Author
        if (blogData.author && blogData.author.email) {
            sendCommentAddedEmail(
                blogData.author.email,
                blogData.author.name,
                name,
                blogData.title,
                content,
                blog
            ).catch(err => console.error("Error sending comment email notification:", err));
        }

        res.json({ success: true, message: "Comment added for review" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Blog Approved Comments ( Public Route , No Auth Required )
// GET /api/comment/blog/:blogId
export const getBlogApprovedComments = async (req, res) => {
    try {
        const { blogId } = req.params;
        const comments = await Comment.find({ blog: blogId, isApproved: true }).sort({ createdAt: -1 });
        res.json({ success: true, comments });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Author Comments ( Private Route , Auth Required )
// GET /api/comment/author
export const getAuthorComments = async (req, res) => {
    try {
        const userId = req.userId;
        const query = req.isAdmin ? {} : { author: userId };
        const comments = await Comment.find(query).populate("blog").sort({ createdAt: -1 });

        res.json({ success: true, comments });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Approve Comment By Id ( Private Route , Auth Required )
// PUT /api/comment/approve/:commentId
export const approveCommentById = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.userId;
        const query = req.isAdmin ? {} : { author: userId };

        const comment = await Comment.findOne({ _id: commentId, ...query }).populate("blog");

        if (!comment) {
            return res.json({ success: false, message: "Comment not found or not authorized" });
        }

        comment.isApproved = true;
        await comment.save();

        // 1. Log Activity
        await logActivity(userId, "comment_approve", `Approved comment by "${comment.name}" on blog: "${comment.blog?.title || 'Unknown'}"`);

        // 2. Create Notification
        await Notification.create({
            user: comment.author, // blog author
            message: `Comment Approved: Comment by "${comment.name}" is approved.`,
            type: "approval",
            link: "/author/list-comment",
        });

        res.json({ success: true, message: "Comment approved successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete Comment By Id ( Private Route , Auth Required )
// DELETE /api/comment/:commentId
export const deleteCommentById = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.userId;
        const query = req.isAdmin ? {} : { author: userId };

        const comment = await Comment.findOne({ _id: commentId, ...query }).populate("blog");

        if (!comment) {
            return res.json({ success: false, message: "Comment not found or not authorized" });
        }

        const commentName = comment.name;
        const blogTitle = comment.blog?.title || "Unknown";

        await Comment.findByIdAndDelete(commentId);

        // 1. Log Activity
        await logActivity(userId, "comment_delete", `Deleted comment by "${commentName}" on blog: "${blogTitle}"`);

        res.json({ success: true, message: "Comment deleted successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
