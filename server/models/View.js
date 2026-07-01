// models/View.js
import mongoose from "mongoose";

const viewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "blog", required: true },
    viewedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for quick lookup and optional deduplication window
viewSchema.index({ user: 1, post: 1, viewedAt: 1 });

const View = mongoose.model("View", viewSchema);
export default View;
