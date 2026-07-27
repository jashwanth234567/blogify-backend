import Blog from "../models/Blog.js";
import User from "../models/User.js";

// Cache trending posts in memory for 5 minutes
let cachedTrending = null;
let lastCacheTime = null;

// Helper to get admin IDs
const getAdminIds = async () => {
  const admins = await User.find({ $or: [{ isAdmin: true }, { role: { $in: ["ADMIN", "SUPER_ADMIN"] } }] }).select("_id").lean();
  return admins.map(a => a._id);
};

// GET /api/posts/trending
export const getTrendingPosts = async (req, res) => {
  try {
    const now = Date.now();
    // Cache for 5 minutes (300,000 ms)
    if (cachedTrending && lastCacheTime && now - lastCacheTime < 300000) {
      return res.json({ success: true, blogs: cachedTrending, cached: true });
    }

    const adminIds = await getAdminIds();

    // Formula: (likes * 3) + views + (recent boost)
    // Recent boost: +50 for blogs posted within last 3 days (259200000 ms)
    const threeDaysAgo = new Date(now - 259200000);

    const blogs = await Blog.aggregate([
      { $match: { isPublished: true, author: { $nin: adminIds } } },
      {
        $addFields: {
          trendingScore: {
            $add: [
              { $multiply: [{ $ifNull: ["$likes", 0] }, 3] },
              { $ifNull: ["$views", 0] },
              {
                $cond: [
                  { $gt: ["$createdAt", threeDaysAgo] },
                  50,
                  0
                ]
              }
            ]
          }
        }
      },
      { $sort: { trendingScore: -1 } },
      { $limit: 20 }
    ]);

    // Populate authors manually since aggregate doesn't run populate automatically
    const populatedBlogs = await Blog.populate(blogs, {
      path: "author",
      select: "name username image"
    });

    cachedTrending = populatedBlogs;
    lastCacheTime = now;

    res.json({ success: true, blogs: populatedBlogs });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// GET /api/posts/most-liked
export const getMostLikedPosts = async (req, res) => {
  try {
    const adminIds = await getAdminIds();
    const blogs = await Blog.find({ isPublished: true, author: { $nin: adminIds } })
      .sort({ likes: -1 })
      .limit(20)
      .populate("author", "name username image")
      .lean();

    res.json({ success: true, blogs });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// GET /api/posts/most-viewed
export const getMostViewedPosts = async (req, res) => {
  try {
    const adminIds = await getAdminIds();
    const blogs = await Blog.find({ isPublished: true, author: { $nin: adminIds } })
      .sort({ views: -1 })
      .limit(20)
      .populate("author", "name username image")
      .lean();

    res.json({ success: true, blogs });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
