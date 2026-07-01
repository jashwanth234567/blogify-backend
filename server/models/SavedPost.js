import mongoose from "mongoose";

const savedPostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "blog", required: true },
  },
  { timestamps: true }
);

// A user can save a post only once
savedPostSchema.index({ user: 1, post: 1 }, { unique: true });

const SavedPost = mongoose.model("SavedPost", savedPostSchema);

export default SavedPost;
