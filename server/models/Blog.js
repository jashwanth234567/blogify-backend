import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
    {
        author: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        title: { type: String, required: true },
        subTitle: { type: String },
        description: { type: String, required: true },
        category: { type: String, required: true },
        image: { type: String, required: true },
        isPublished: { type: Boolean, required: true },
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        isAiGenerated: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Blog = mongoose.model("blog", blogSchema);

export default Blog;
