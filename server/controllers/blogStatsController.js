import Blog from '../models/Blog.js';

/**
 * Get top viewed blogs.
 * Query param ?limit defaults to 5.
 */
export const getTopViews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const blogs = await Blog.find({ isPublished: true })
      .sort({ views: -1 })
      .limit(limit)
      .select('title views likes author createdAt updatedAt')
      .populate('author', 'name email');
    res.json({ success: true, data: blogs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/** Get bottom viewed blogs */
export const getBottomViews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const blogs = await Blog.find({ isPublished: true })
      .sort({ views: 1 })
      .limit(limit)
      .select('title views likes author createdAt updatedAt')
      .populate('author', 'name email');
    res.json({ success: true, data: blogs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/** Get top liked blogs */
export const getTopLikes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const blogs = await Blog.find({ isPublished: true })
      .sort({ likes: -1 })
      .limit(limit)
      .select('title views likes author createdAt updatedAt')
      .populate('author', 'name email');
    res.json({ success: true, data: blogs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/** Get bottom liked blogs */
export const getBottomLikes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const blogs = await Blog.find({ isPublished: true })
      .sort({ likes: 1 })
      .limit(limit)
      .select('title views likes author createdAt updatedAt')
      .populate('author', 'name email');
    res.json({ success: true, data: blogs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
