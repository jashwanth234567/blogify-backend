import express from "express";
import upload from "../middleware/multer.js";
import { protect } from "../middleware/auth.js";
import { generateBlog } from "../controllers/aiController.js";
import { addBlog, getAllPublishedBlogs, getPublishedBlogById, deleteBlogById, togglePublish } from "../controllers/blogController.js";

const blogRouter = express.Router();

blogRouter.post("/add", upload.single("image"), protect, addBlog);
blogRouter.post("/generate", protect, generateBlog);
blogRouter.get("/all", getAllPublishedBlogs);
blogRouter.get("/published/:blogId", getPublishedBlogById);
blogRouter.delete("/delete/:blogId", protect, deleteBlogById);
blogRouter.put("/toggle-publish/:blogId", protect, togglePublish);

export default blogRouter;
