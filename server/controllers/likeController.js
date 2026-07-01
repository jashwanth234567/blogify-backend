import Like from "../models/Like.js";
import Blog from "../models/Blog.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

// POST /api/posts/:id/like
export const likePost = async (req, res) => {
  try {
    const userId = req.userId;
    const postId = req.params.id;

    // Check if post exists
    const blog = await Blog.findById(postId).populate("author");
    if (!blog) {
      return res.json({ success: false, message: "Post not found" });
    }

    // Create like (unique index user-post will prevent duplicates)
    await Like.create({ user: userId, post: postId });

    // Increment count on post
    await Blog.findByIdAndUpdate(postId, { $inc: { likes: 1 } });

    // Increment author totalLikesReceived
    if (blog.author) {
      await User.findByIdAndUpdate(blog.author._id, { $inc: { totalLikesReceived: 1 } });

      // Create notification
      if (blog.author._id.toString() !== userId.toString() && blog.author.notificationSettings?.likes !== false) {
        await Notification.create({
          user: blog.author._id,
          message: `${req.user.name} liked your post "${blog.title}"`,
          type: "like",
          link: `/blog/${postId}`,
        });
      }
    }

    res.json({ success: true, message: "Liked successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.json({ success: false, message: "Already liked" });
    }
    res.json({ success: false, message: error.message });
  }
};

// DELETE /api/posts/:id/like
export const unlikePost = async (req, res) => {
  try {
    const userId = req.userId;
    const postId = req.params.id;

    const result = await Like.findOneAndDelete({ user: userId, post: postId });
    if (!result) {
      return res.json({ success: false, message: "Post was not liked" });
    }

    // Decrement count on post
    const blog = await Blog.findByIdAndUpdate(postId, { $inc: { likes: -1 } });

    // Decrement author totalLikesReceived
    if (blog && blog.author) {
      await User.findByIdAndUpdate(blog.author, { $inc: { totalLikesReceived: -1 } });
    }

    res.json({ success: true, message: "Unliked successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// GET /api/posts/:id/likes
export const getPostLikes = async (req, res) => {
  try {
    const postId = req.params.id;
    const likes = await Like.find({ post: postId })
      .populate("user", "name username image")
      .sort({ createdAt: -1 });

    res.json({ success: true, likes });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
