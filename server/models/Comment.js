import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        blog: { type: mongoose.Schema.Types.ObjectId, ref: "blog", required: true },
        name: { type: String, required: true },
        content: { type: String, required: true },
        isApproved: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        isHidden: { type: Boolean, default: false },
        reportsCount: { type: Number, default: 0 },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    },
    { timestamps: true }
);

commentSchema.index({ blog: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ isDeleted: 1, isHidden: 1 });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
