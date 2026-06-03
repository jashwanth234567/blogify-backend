import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { v2 as cloudinary } from "cloudinary";
import { generateBlogContent } from "../configs/gemini.js";
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

        const content = await generateBlogContent(title);

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

// Get All Published Blogs ( Public Route )
// GET /api/blog/all
export const getAllPublishedBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ isPublished: true });

        res.json({
            success: true,
            blogs,
        });

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

// Delete Blog By Id ( Private Route , Auth Required )
// DELETE /api/blog/delete/:blogId
export const deleteBlogById = async (req, res) => {
    try {
        const userId = req.userId;

        const query = req.isAdmin
            ? {}
            : { author: userId };

        const { blogId } = req.params;

        const blogToDelete = await Blog.findOne({
            _id: blogId,
            ...query,
        });

        if (!blogToDelete) {
            return res.json({
                success: false,
                message: "Blog not found or unauthorized",
            });
        }

        const title = blogToDelete.title;

        await Blog.findByIdAndDelete(blogId);

        await Comment.deleteMany({
            blog: blogId,
        });

        // Log Activity
        await logActivity(userId, "blog_delete", `Deleted blog: "${title}"`);

        res.json({
            success: true,
            message: "Blog deleted successfully",
        });

    } catch (error) {
        res.json({
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