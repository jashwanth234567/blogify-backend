import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, default: "" },
    username: { type: String, unique: true, sparse: true },
    bio: { type: String, default: "" },
    coverPhoto: { type: String, default: "" },
    phone: { type: String, default: "" },
    website: { type: String, default: "" },
    location: { type: String, default: "" },
    verified: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    totalLikesReceived: { type: Number, default: 0 },
    totalViewsReceived: { type: Number, default: 0 },
    totalCommentsReceived: { type: Number, default: 0 },
    lastLogin: { type: Date },
    privacySettings: {
      isPrivate: { type: Boolean, default: false }
    },
    notificationSettings: {
      likes: { type: Boolean, default: true },
      follows: { type: Boolean, default: true },
      comments: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);

export default User;

