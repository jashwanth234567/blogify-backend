import Follow from "../models/Follow.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

// POST /api/users/:id/follow
export const followUser = async (req, res) => {
  try {
    const followerId = req.userId;
    const followingId = req.params.id;

    if (followerId.toString() === followingId) {
      return res.json({ success: false, message: "Cannot follow yourself" });
    }

    // Check if target user exists
    const targetUser = await User.findById(followingId);
    if (!targetUser) {
      return res.json({ success: false, message: "User to follow not found" });
    }

    // Create follow relationship (unique index handles duplication)
    await Follow.create({ follower: followerId, following: followingId });

    // Update counters
    await User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } });
    await User.findByIdAndUpdate(followingId, { $inc: { followersCount: 1 } });

    // Send notifications if enabled
    if (targetUser.notificationSettings?.follows !== false) {
      await Notification.create({
        user: followingId,
        message: `${req.user.name} started following you`,
        type: "follow",
        link: `/profile/${req.user.username || req.user._id}`,
      });
    }

    res.json({ success: true, message: "Followed successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.json({ success: false, message: "Already following" });
    }
    res.json({ success: false, message: error.message });
  }
};

// DELETE /api/users/:id/follow
export const unfollowUser = async (req, res) => {
  try {
    const followerId = req.userId;
    const followingId = req.params.id;

    const result = await Follow.findOneAndDelete({
      follower: followerId,
      following: followingId,
    });

    if (!result) {
      return res.json({ success: false, message: "Not following" });
    }

    await User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } });
    await User.findByIdAndUpdate(followingId, { $inc: { followersCount: -1 } });

    res.json({ success: true, message: "Unfollowed successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// GET /api/users/:id/followers
export const getFollowers = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    // Build user search match
    let matchQuery = {};
    if (search) {
      matchQuery = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { username: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Query follows and populate follower
    const follows = await Follow.find({ following: userId })
      .populate({
        path: "follower",
        match: matchQuery,
        select: "name username image followersCount followingCount"
      })
      .sort({ createdAt: -1 });

    // Filter out null populations if query matches user
    const list = follows.map(f => f.follower).filter(Boolean);

    // Dynamic indicators: isFollowing, isFollower, isMutual
    const paginatedList = [];
    const end = Math.min(skip + limit, list.length);

    for (let i = skip; i < end; i++) {
      const u = list[i];
      let isFollowing = false;
      let isFollower = false;

      if (currentUserId) {
        isFollowing = !!(await Follow.findOne({ follower: currentUserId, following: u._id }));
        isFollower = !!(await Follow.findOne({ follower: u._id, following: currentUserId }));
      }

      paginatedList.push({
        _id: u._id,
        name: u.name,
        username: u.username || `user_${u._id.toString().slice(-6)}`,
        image: u.image,
        isFollowing,
        isFollower,
        isMutual: isFollowing && isFollower,
      });
    }

    res.json({
      success: true,
      followers: paginatedList,
      total: list.length,
      page,
      pages: Math.ceil(list.length / limit),
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// GET /api/users/:id/following
export const getFollowing = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    let matchQuery = {};
    if (search) {
      matchQuery = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { username: { $regex: search, $options: "i" } },
        ],
      };
    }

    const follows = await Follow.find({ follower: userId })
      .populate({
        path: "following",
        match: matchQuery,
        select: "name username image followersCount followingCount"
      })
      .sort({ createdAt: -1 });

    const list = follows.map(f => f.following).filter(Boolean);

    const paginatedList = [];
    const end = Math.min(skip + limit, list.length);

    for (let i = skip; i < end; i++) {
      const u = list[i];
      let isFollowing = false;
      let isFollower = false;

      if (currentUserId) {
        isFollowing = !!(await Follow.findOne({ follower: currentUserId, following: u._id }));
        isFollower = !!(await Follow.findOne({ follower: u._id, following: currentUserId }));
      }

      paginatedList.push({
        _id: u._id,
        name: u.name,
        username: u.username || `user_${u._id.toString().slice(-6)}`,
        image: u.image,
        isFollowing,
        isFollower,
        isMutual: isFollowing && isFollower,
      });
    }

    res.json({
      success: true,
      following: paginatedList,
      total: list.length,
      page,
      pages: Math.ceil(list.length / limit),
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
