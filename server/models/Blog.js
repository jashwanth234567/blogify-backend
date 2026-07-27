import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
    {
        author: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        title: { type: String, required: true },
        subTitle: { type: String, default: "" },
        description: { type: String, required: true },
        category: { type: String, required: true },
        tags: [{ type: String }],
        image: { type: String, required: true },
        isPublished: { type: Boolean, required: true, default: true },
        isDeleted: { type: Boolean, default: false },
        isHidden: { type: Boolean, default: false },
        isPinned: { type: Boolean, default: false },
        isFeatured: { type: Boolean, default: false },
        commentsDisabled: { type: Boolean, default: false },
        isLocked: { type: Boolean, default: false },
        reportsCount: { type: Number, default: 0 },
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        isAiGenerated: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Indexes for fast post querying and sorting
blogSchema.index({ author: 1, isPublished: 1 });
blogSchema.index({ createdAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ views: -1 });
blogSchema.index({ likes: -1 });
blogSchema.index({ isDeleted: 1, isHidden: 1, isPinned: 1, isFeatured: 1 });
blogSchema.index({ title: "text", description: "text", category: "text" });

const Blog = mongoose.model("blog", blogSchema);

export default Blog;
