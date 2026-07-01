// models/Follow.js
import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    follower: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    following: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  },
  { timestamps: true }
);

// Ensure a user can follow another user only once
followSchema.index({ follower: 1, following: 1 }, { unique: true });

const Follow = mongoose.model("Follow", followSchema);
export default Follow;
