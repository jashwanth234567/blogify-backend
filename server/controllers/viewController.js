import View from "../models/View.js";
import Blog from "../models/Blog.js";
import User from "../models/User.js";

// POST /api/posts/:id/view
export const recordView = async (req, res) => {
  try {
    const userId = req.userId;
    const postId = req.params.id;

    if (!userId) {
      return res.json({ success: false, message: "Authentication required to view" });
    }

    const windowMs = 30 * 60 * 1000; // 30 minutes window
    const threshold = new Date(Date.now() - windowMs);

    // Check if viewed within the window
    const recentView = await View.findOne({
      user: userId,
      post: postId,
      viewedAt: { $gt: threshold },
    });

    if (recentView) {
      return res.json({ success: true, message: "View already counted recently" });
    }

    // Create a new view
    await View.create({ user: userId, post: postId, viewedAt: new Date() });

    // Increment blog views
    const blog = await Blog.findByIdAndUpdate(postId, { $inc: { views: 1 } });

    // Increment author views received
    if (blog && blog.author) {
      await User.findByIdAndUpdate(blog.author, { $inc: { totalViewsReceived: 1 } });
    }

    res.json({ success: true, message: "View recorded successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
