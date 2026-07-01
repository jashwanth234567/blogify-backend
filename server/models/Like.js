// models/Like.js
import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "blog", required: true },
    likedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Ensure a user can like a post only once
likeSchema.index({ user: 1, post: 1 }, { unique: true });

const Like = mongoose.model("Like", likeSchema);
export default Like;
