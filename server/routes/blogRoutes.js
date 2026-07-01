import express from "express";
import upload from "../middleware/multer.js";
import { protect } from "../middleware/auth.js";
import { generateBlog } from "../controllers/aiController.js";
import { addBlog, getAllPublishedBlogs, getPublishedBlogById, deleteBlogById, togglePublish } from "../controllers/blogController.js";
import { getTopViews, getBottomViews, getTopLikes, getBottomLikes } from "../controllers/blogStatsController.js";

const blogRouter = express.Router();

// Existing routes
blogRouter.post("/add", upload.single("image"), protect, addBlog);
blogRouter.post("/generate", protect, generateBlog);
blogRouter.get("/all", getAllPublishedBlogs);
blogRouter.get("/published/:blogId", getPublishedBlogById);
blogRouter.delete("/delete/:blogId", protect, deleteBlogById);
blogRouter.put("/toggle-publish/:blogId", protect, togglePublish);

// Stats routes

blogRouter.get("/stats/top-views", getTopViews);
blogRouter.get("/stats/bottom-views", getBottomViews);
blogRouter.get("/stats/top-likes", getTopLikes);
blogRouter.get("/stats/bottom-likes", getBottomLikes);

export default blogRouter;
