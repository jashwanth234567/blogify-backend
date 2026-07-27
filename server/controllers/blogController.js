import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { v2 as cloudinary } from "cloudinary";
import { aiProvider } from "../services/aiProvider.js";
import { logActivity } from "../middleware/activityLogger.js";
import { sendBlogPublishedEmail } from "../configs/emailService.js";

// Add Blog ( Private Route , Auth Required )
// POST /api/blog/add
export const addBlog = async (req, res) => {
    try {
        const userId = req.userId;

        const {
            title,
            subTitle,
            description,
            category,
            isPublished,
            isAiGenerated
        } = JSON.parse(req.body.blog);

        const imageFile = req.file;

        if (!title || !description || !category || !imageFile) {
            return res.json({
                success: false,
                message: "Missing required fields"
            });
        }

        const uploadResult = await cloudinary.uploader.upload(
            imageFile.path,
            {
                folder: "blogs",
                resource_type: "image",
            }
        );

        const image = uploadResult.secure_url;

        const newBlog = await Blog.create({
            title,
            subTitle,
            description,
            category,
            image,
            isPublished: !!isPublished,
            isAiGenerated: !!isAiGenerated,
            author: userId,
        });

        // Log Activity
        await logActivity(userId, "blog_create", `Created blog: "${title}" (AI: ${!!isAiGenerated}, Published: ${!!isPublished})`);

        // If published immediately, send emails & notify
        if (newBlog.isPublished) {
            // Notification
            await Notification.create({
                user: null, // broadcast to all
                message: `New Blog Published: "${title}" by ${req.user.name}`,
                type: "publication",
                link: `/blog/${newBlog._id}`,
            });

            // Email notifications
            try {
                const allUsers = await User.find({});
                for (const u of allUsers) {
                    sendBlogPublishedEmail(u.email, u.name, title, req.user.name, newBlog._id).catch(err =>
                        console.error("Error sending publication email:", err)
                    );
                }
            } catch (err) {
                console.error("Error fetching users for publication emails:", err);
            }
        }

        res.json({
            success: true,
            message: "Blog added successfully",
            blog: newBlog,
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message,
        });
    }
};

// AI Generate Blog Content
// POST /api/blog/generate
export const generateBlog = async (req, res) => {
    try {
        const { title } = req.body;

        if (!title) {
            return res.json({
                success: false,
                message: "Title is required",
            });
        }

        const content = await aiProvider.generateBlog(title);

        if (!content) {
            return res.json({
                success: false,
                message: "Failed to generate content",
            });
        }

        res.json({
            success: true,
            data: content,
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message,
        });
    }
};

import { getCachedData, setCachedData, clearCache } from "../utils/fastCache.js";

// Get All Published Blogs ( Public Route with Feed Filtering & Fast Cache )
// GET /api/blog/all?feed=latest|friends|recommended|trending&category=...
export const getAllPublishedBlogs = async (req, res) => {
    try {
        const { feed = "latest", category, page = 1, limit = 20 } = req.query;
        const cacheKey = `blogs_${feed}_${category || "all"}_${page}_${limit}`;

        const cachedResponse = getCachedData(cacheKey);
        if (cachedResponse) {
            return res.json(cachedResponse);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const admins = await User.find({ $or: [{ isAdmin: true }, { role: { $in: ["ADMIN", "SUPER_ADMIN"] } }] }).select("_id").lean();
        const adminIds = admins.map(a => a._id);

        let query = { 
            isPublished: true,
            author: { $nin: adminIds }
        };

        if (category && category !== "All") {
            query.category = category;
        }

        let sortOption = { createdAt: -1 }; // Feature 3: Default ORDER BY created_at DESC

        if (feed === "friends") {
            let token = req.headers.authorization;
            if (token && token.startsWith("Bearer ")) token = token.split(" ")[1];
            
            let currentUserId = null;
            if (token) {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    currentUserId = decoded.userId;
                } catch (e) {}
            }

            if (currentUserId) {
                const Follow = (await import("../models/Follow.js")).default;
                const follows = await Follow.find({ follower: currentUserId }).select("following");
                const followingIds = follows.map(f => f.following);
                query.author = { $in: followingIds };
            }
        } else if (feed === "trending") {
            sortOption = { views: -1, likes: -1, createdAt: -1 };
        } else if (feed === "recommended") {
            sortOption = { likes: -1, views: -1, createdAt: -1 };
        }

        const blogs = await Blog.find(query)
            .populate("author", "name username image bio")
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Blog.countDocuments(query);

        const responsePayload = {
            success: true,
            blogs,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
        };

        setCachedData(cacheKey, responsePayload, 15000);

        res.json(responsePayload);

    } catch (error) {
        res.json({
            success: false,
            message: error.message,
        });
    }
};


// Get Published Blog By Id ( Public Route )
// GET /api/blog/published/:blogId
export const getPublishedBlogById = async (req, res) => {
    try {
        const { blogId } = req.params;

        // Increment views
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            { $inc: { views: 1 } },
            { returnDocument: 'after' }
        ).populate("author");

        if (!blog) {
            return res.json({
                success: false,
                message: "Blog not found",
            });
        }

        res.json({
            success: true,
            blog,
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message,
        });
    }
};

import { emitBlogDeleted } from "../utils/socket.js";

// Delete Blog By Id ( Private Route , Auth Required )
// DELETE /api/blogs/:id or DELETE /api/blog/delete/:blogId
export const deleteBlogById = async (req, res) => {
    try {
        const userId = req.userId;
        const targetId = req.params.id || req.params.blogId;

        const blogToDelete = await Blog.findById(targetId);

        if (!blogToDelete) {
            return res.status(404).json({
                success: false,
                message: "Blog post not found",
            });
        }

        // Authorization check: User must be author OR admin
        const isAuthor = blogToDelete.author.toString() === userId.toString();
        const isAdminUser = req.isAdmin || (req.user && ["ADMIN", "SUPER_ADMIN"].includes(req.user.role));

        if (!isAuthor && !isAdminUser) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You can only delete your own blog posts.",
            });
        }

        const title = blogToDelete.title;

        // Perform Soft Delete for data retention or hard delete
        blogToDelete.isDeleted = true;
        blogToDelete.isPublished = false;
        blogToDelete.deletedAt = new Date();
        await blogToDelete.save();

        // Cascade cleanup comments
        await Comment.updateMany({ blog: targetId }, { isDeleted: true });

        // Clear fast cache
        clearCache("blogs_");

        // Log Activity
        await logActivity(userId, "blog_delete", `Deleted blog: "${title}"`);

        // Real-time Socket.io notification broadcast
        emitBlogDeleted(targetId);

        res.json({
            success: true,
            message: "Blog post deleted successfully",
            deletedId: targetId
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Toggle Publish ( Private Route , Auth Required )
// PUT /api/blog/toggle-publish/:blogId
export const togglePublish = async (req, res) => {
    try {
        const { blogId } = req.params;
        const userId = req.userId;

        const query = req.isAdmin
            ? {}
            : { author: userId };

        const blog = await Blog.findOne({
            _id: blogId,
            ...query,
        });

        if (!blog) {
            return res.json({
                success: false,
                message: "Blog not found",
            });
        }

        blog.isPublished = !blog.isPublished;

        await blog.save();

        // Log Activity
        await logActivity(userId, "blog_update", `Blog status updated: ${blog.isPublished ? 'Published' : 'Draft'} "${blog.title}"`);

        // If changed to published, send emails & notify
        if (blog.isPublished) {
            // Notification
            await Notification.create({
                user: null, // broadcast to all
                message: `New Blog Published: "${blog.title}" by ${req.user.name}`,
                type: "publication",
                link: `/blog/${blog._id}`,
            });

            // Email notifications
            try {
                const allUsers = await User.find({});
                for (const u of allUsers) {
                    sendBlogPublishedEmail(u.email, u.name, blog.title, req.user.name, blog._id).catch(err =>
                        console.error("Error sending publication email:", err)
                    );
                }
            } catch (err) {
                console.error("Error fetching users for publication emails:", err);
            }
        }

        res.json({
            success: true,
            message: "Blog status updated",
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message,
        });
    }
};