import SavedPost from "../models/SavedPost.js";
import Blog from "../models/Blog.js";

// POST /api/posts/:id/save
export const savePost = async (req, res) => {
  try {
    const userId = req.userId;
    const postId = req.params.id;

    // Check if post exists
    const blog = await Blog.findById(postId);
    if (!blog) {
      return res.json({ success: false, message: "Post not found" });
    }

    await SavedPost.create({ user: userId, post: postId });

    res.json({ success: true, message: "Post saved successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.json({ success: false, message: "Post already saved" });
    }
    res.json({ success: false, message: error.message });
  }
};

// DELETE /api/posts/:id/save
export const unsavePost = async (req, res) => {
  try {
    const userId = req.userId;
    const postId = req.params.id;

    const result = await SavedPost.findOneAndDelete({ user: userId, post: postId });
    if (!result) {
      return res.json({ success: false, message: "Post not saved" });
    }

    res.json({ success: true, message: "Post unsaved successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// GET /api/posts/saved
export const getSavedPosts = async (req, res) => {
  try {
    const userId = req.userId;
    const saved = await SavedPost.find({ user: userId })
      .populate({
        path: "post",
        populate: { path: "author", select: "name username image" }
      })
      .sort({ createdAt: -1 });

    const blogs = saved.map(s => s.post).filter(Boolean);
    res.json({ success: true, blogs });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
