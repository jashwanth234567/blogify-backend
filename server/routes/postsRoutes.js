import express from "express";
import { protect } from "../middleware/auth.js";
import { likePost, unlikePost, getPostLikes } from "../controllers/likeController.js";
import { recordView } from "../controllers/viewController.js";
import { getTrendingPosts, getMostLikedPosts, getMostViewedPosts } from "../controllers/trendingController.js";
import { savePost, unsavePost, getSavedPosts } from "../controllers/savedPostController.js";

const postsRouter = express.Router();

// Dynamic listing & bookmark endpoints
postsRouter.get("/trending", protect, getTrendingPosts);
postsRouter.get("/most-liked", protect, getMostLikedPosts);
postsRouter.get("/most-viewed", protect, getMostViewedPosts);
postsRouter.get("/saved", protect, getSavedPosts);

// Single post actions
postsRouter.post("/:id/like", protect, likePost);
postsRouter.delete("/:id/like", protect, unlikePost);
postsRouter.get("/:id/likes", protect, getPostLikes);
postsRouter.post("/:id/view", protect, recordView);
postsRouter.post("/:id/save", protect, savePost);
postsRouter.delete("/:id/save", protect, unsavePost);

export default postsRouter;
