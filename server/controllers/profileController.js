import User from "../models/User.js";
import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";
import Follow from "../models/Follow.js";
import Like from "../models/Like.js";
import SavedPost from "../models/SavedPost.js";
import { v2 as cloudinary } from "cloudinary";
import { logActivity } from "../middleware/activityLogger.js";

const voiceForLang = (lang) => {
  const map = {
    es: "es-ES-Standard-A", // Spanish
    fr: "fr-FR-Standard-A", // French
    de: "de-DE-Standard-A", // German
    hi: "hi-IN-Standard-A", // Hindi
    te: "te-IN-Standard-A", // Telugu
  };
  return map[lang] || "en-US-Standard-A";
};

// GET /api/profile/:username
export const getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.userId;

    // Find by username, or if that fails, try finding by ID (fallback for existing or test users)
    let user = await User.findOne({ username });
    if (!user && username.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(username);
    }

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const userId = user._id;

    // Check if viewing own profile
    const isOwnProfile = currentUserId && currentUserId.toString() === userId.toString();

    // Query stats dynamically for accuracy
    const postsCount = await Blog.countDocuments({ author: userId, isPublished: true });
    const draftsCount = isOwnProfile ? await Blog.countDocuments({ author: userId, isPublished: false }) : 0;
    const followersCount = await Follow.countDocuments({ following: userId });
    const followingCount = await Follow.countDocuments({ follower: userId });

    // Aggregate total likes received
    const likesResult = await Blog.aggregate([
      { $match: { author: userId } },
      { $group: { _id: null, total: { $sum: "$likes" } } },
    ]);
    const totalLikesReceived = likesResult[0]?.total || 0;

    // Aggregate total views received
    const viewsResult = await Blog.aggregate([
      { $match: { author: userId } },
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);
    const totalViews = viewsResult[0]?.total || 0;

    // Total comments received on author's blogs
    const authorBlogIds = await Blog.find({ author: userId }).distinct("_id");
    const totalCommentsReceived = await Comment.countDocuments({ blog: { $in: authorBlogIds } });

    // Check if following
    let isFollowing = false;
    if (currentUserId && !isOwnProfile) {
      const followRecord = await Follow.findOne({ follower: currentUserId, following: userId });
      isFollowing = !!followRecord;
    }

    // Get posts for grid
    const posts = await Blog.find({ author: userId, isPublished: true })
      .sort({ createdAt: -1 })
      .limit(50);

    // Get drafts (only for own profile)
    const drafts = isOwnProfile
      ? await Blog.find({ author: userId, isPublished: false }).sort({ createdAt: -1 })
      : [];

    // Get liked posts
    const likedRecords = await Like.find({ user: userId })
      .populate({
        path: "post",
        populate: { path: "author", select: "name image username" }
      })
      .sort({ likedAt: -1 })
      .limit(50);
    const likedPosts = likedRecords.map(r => r.post).filter(Boolean);

    // Get saved posts (only for own profile)
    let savedPosts = [];
    if (isOwnProfile) {
      const savedRecords = await SavedPost.find({ user: userId })
        .populate({
          path: "post",
          populate: { path: "author", select: "name image username" }
        })
        .sort({ createdAt: -1 })
        .limit(50);
      savedPosts = savedRecords.map(r => r.post).filter(Boolean);
    }

    // Sync metrics to User model for fallback/indexing
    user.followersCount = followersCount;
    user.followingCount = followingCount;
    user.totalLikesReceived = totalLikesReceived;
    user.totalViewsReceived = totalViews;
    user.totalCommentsReceived = totalCommentsReceived;
    await user.save();

    res.json({
      success: true,
      profile: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username || `user_${user._id.toString().slice(-6)}`,
        image: user.image,
        coverPhoto: user.coverPhoto,
        bio: user.bio,
        phone: user.phone,
        website: user.website,
        location: user.location,
        verified: user.verified,
        createdAt: user.createdAt,
        privacySettings: user.privacySettings || { isPrivate: false },
        notificationSettings: user.notificationSettings || { likes: true, follows: true, comments: true },
        stats: {
          postsCount,
          draftsCount,
          followersCount,
          followingCount,
          totalLikesReceived,
          totalViews,
          totalCommentsReceived,
        },
        isFollowing,
        isOwnProfile,
        posts,
        drafts,
        likedPosts,
        savedPosts,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// PUT /api/profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, username, bio, phone, website, location, privacySettings, notificationSettings } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Username validation: unique if updated
    if (username && username !== user.username) {
      const existing = await User.findOne({ username: username.toLowerCase() });
      if (existing) {
        return res.json({ success: false, message: "Username already taken" });
      }
      user.username = username.toLowerCase();
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (website !== undefined) user.website = website;
    if (location !== undefined) user.location = location;
    if (privacySettings) user.privacySettings = privacySettings;
    if (notificationSettings) user.notificationSettings = notificationSettings;

    await user.save();
    await logActivity(userId, "profile_update", "Updated profile settings");

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        image: user.image,
        coverPhoto: user.coverPhoto,
        bio: user.bio,
        phone: user.phone,
        website: user.website,
        location: user.location,
        verified: user.verified,
        privacySettings: user.privacySettings,
        notificationSettings: user.notificationSettings,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// POST /api/profile/avatar
export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.userId;
    const file = req.file;

    if (!file) {
      return res.json({ success: false, message: "No image file provided" });
    }

    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder: "avatars",
      resource_type: "image",
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { image: uploadResult.secure_url },
      { new: true }
    );

    await logActivity(userId, "avatar_upload", "Uploaded new avatar image");

    res.json({
      success: true,
      message: "Avatar uploaded successfully",
      avatarUrl: uploadResult.secure_url,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// POST /api/profile/cover
export const uploadCover = async (req, res) => {
  try {
    const userId = req.userId;
    const file = req.file;

    if (!file) {
      return res.json({ success: false, message: "No image file provided" });
    }

    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder: "profile_covers",
      resource_type: "image",
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { coverPhoto: uploadResult.secure_url },
      { new: true }
    );

    await logActivity(userId, "cover_upload", "Uploaded new cover image");

    res.json({
      success: true,
      message: "Cover photo uploaded successfully",
      coverUrl: uploadResult.secure_url,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// PUT /api/profile/change-password
export const changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const bcrypt = (await import("bcryptjs")).default;
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Incorrect current password" });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    await logActivity(userId, "password_change", "Changed account password");

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
