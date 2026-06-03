import jwt from "jsonwebtoken";
import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";
import Notification from "../models/Notification.js";
import bcrypt from "bcryptjs";
import { logActivity } from "../middleware/activityLogger.js";
import { sendWelcomeEmail, sendEmail } from "../configs/emailService.js";

// Register ( Public Route )
// POST /api/user/register
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({ name, email, password: hashedPassword });
        
        // Generate Token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        
        // Log Activity
        await logActivity(user._id, "register", `User registered: ${name} (${email})`);

        // Create Admin Notification
        await Notification.create({
            user: null, // Admin/Broadcast
            message: `New user registration: ${name} (${email})`,
            type: "registration",
            link: "/author", // Can redirect to dashboard
        });

        // Send Welcome Email
        sendWelcomeEmail(email, name).catch(err => console.error("Welcome email error:", err));

        res.json({ success: true, token });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Login ( Public Route )
// POST /api/user/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (!(await bcrypt.compare(password, user.password))) {
            return res.json({ success: false, message: "Invalid Credentials" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

        // Log Activity
        await logActivity(user._id, "login", `User logged in: ${email}`);

        res.json({ success: true, token });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Logout ( Private Route )
// POST /api/user/logout
export const logout = async (req, res) => {
    try {
        const userId = req.userId;
        // Log Activity
        await logActivity(userId, "logout", "User logged out");
        res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get profile details ( Private Route )
// GET /api/user/me
export const getProfile = async (req, res) => {
    try {
        const user = req.user;
        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
                isAdmin: req.isAdmin,
            },
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Activity Logs ( Private Route, Admin Only )
// GET /api/user/activity-logs
export const getActivityLogs = async (req, res) => {
    try {
        if (!req.isAdmin) {
            return res.status(403).json({ success: false, message: "Access Denied: Admin Only" });
        }

        const logs = await ActivityLog.find({})
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .limit(100);

        res.json({ success: true, logs });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get All Author Blogs ( Private Route , Auth Required )
// GET /api/user/blogs
export const getAuthorBlogs = async (req, res) => {
    try {
        const userId = req.userId;
        const query = req.isAdmin ? {} : { author: userId };
        const blogs = await Blog.find(query).sort({ createdAt: -1 });
        res.json({ success: true, blogs });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Author Dashboard ( Private Route , Auth Required )
// GET /api/user/dashboard
export const getAuthorDashboard = async (req, res) => {
    try {
        const userId = req.userId;

        if (req.isAdmin) {
            // Admin aggregates
            const totalUsers = await User.countDocuments({});
            const totalBlogs = await Blog.countDocuments({});
            const totalComments = await Comment.countDocuments({});
            const aiBlogs = await Blog.countDocuments({ isAiGenerated: true });
            const publishedBlogs = await Blog.countDocuments({ isPublished: true });
            const draftBlogs = await Blog.countDocuments({ isPublished: false });

            // Aggregate views
            const viewsResult = await Blog.aggregate([
                { $group: { _id: null, totalViews: { $sum: "$views" } } }
            ]);
            const totalViews = viewsResult[0]?.totalViews || 0;
            const revenue = totalUsers * 19; // $19 premium user tier

            const mostViewedBlogs = await Blog.find({})
                .sort({ views: -1 })
                .limit(5)
                .populate("author", "name email");

            const recentUsers = await User.find({})
                .sort({ createdAt: -1 })
                .limit(5)
                .select("name email createdAt");

            const recentBlogs = await Blog.find({})
                .sort({ createdAt: -1 })
                .limit(5)
                .populate("author", "name email");

            const dashboardData = {
                isAdmin: true,
                totalUsers,
                totalBlogs,
                totalComments,
                aiBlogs,
                publishedBlogs,
                draftBlogs,
                totalViews,
                revenue,
                mostViewedBlogs,
                recentUsers,
                recentBlogs,
            };

            return res.json({ success: true, dashboardData });
        } else {
            // Regular author
            const query = { author: userId };
            const recentBlogs = await Blog.find(query).sort({ createdAt: -1 }).limit(5);
            const blogs = await Blog.countDocuments(query);
            const comments = await Comment.countDocuments(query);
            const publishedBlogs = await Blog.countDocuments({ ...query, isPublished: true });
            const drafts = await Blog.countDocuments({ ...query, isPublished: false });
            const aiBlogs = await Blog.countDocuments({ ...query, isAiGenerated: true });

            // Aggregate author views
            const viewsResult = await Blog.aggregate([
                { $match: { author: userId } },
                { $group: { _id: null, totalViews: { $sum: "$views" } } }
            ]);
            const totalViews = viewsResult[0]?.totalViews || 0;
            const revenue = totalViews * 0.05; // $0.05 per view subscription monetisation model

            const dashboardData = {
                isAdmin: false,
                blogs,
                comments,
                drafts,
                publishedBlogs,
                aiBlogs,
                totalViews,
                revenue,
                recentBlogs,
            };

            return res.json({ success: true, dashboardData });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Subscribe to newsletter
// POST /api/user/subscribe
export const subscribe = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.json({ success: false, message: "Email is required" });
        }

        const subject = "Welcome to the Blogify Newsletter!";
        const htmlBody = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f3ff; padding: 40px 20px; text-align: center;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(124, 58, 237, 0.1);">
                    <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 40px 20px; color: white;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">Subscribed successfully!</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">You will now receive our latest blogs, new tech, and exclusive news.</p>
                    </div>
                    <div style="padding: 40px 30px; text-align: left; color: #1f2937; line-height: 1.6;">
                        <p style="font-size: 18px; font-weight: 600; margin-top: 0; color: #7c3aed;">Hello,</p>
                        <p style="font-size: 15px;">Thank you for subscribing to the Blogify newsletter. We are excited to share high-quality blogs, new technology trends, and industry insights directly to your inbox.</p>
                        <p style="font-size: 15px;">You can look forward to:</p>
                        <ul style="padding-left: 20px; font-size: 14px; color: #4b5563; line-height: 1.8;">
                            <li>Weekly curation of our most popular tech blogs.</li>
                            <li>Updates on new tools and AI integrations.</li>
                            <li>Exclusive announcements and community highlights.</li>
                        </ul>
                    </div>
                    <div style="background-color: #f9fafb; padding: 20px; border-t: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #9ca3af;">
                        <p style="margin: 0 0 5px 0;">© 2026 Blogify GreatStack. All Rights Reserved.</p>
                        <p style="margin: 0;">If you did not subscribe to this list, you can safely unsubscribe at any time.</p>
                    </div>
                </div>
            </div>
        `;

        const emailResult = await sendEmail({ to: email, subject, htmlBody });

        if (emailResult.success) {
            if (emailResult.mock) {
                res.json({ 
                    success: true, 
                    message: "Subscribed successfully! (SMTP not configured, email logged to DB)" 
                });
            } else {
                res.json({ 
                    success: true, 
                    message: "Subscribed successfully! Confirmation email sent." 
                });
            }
        } else {
            res.json({ 
                success: false, 
                message: `Subscribed successfully, but sending confirmation email failed: ${emailResult.error}` 
            });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
