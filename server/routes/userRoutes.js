import express from "express";
import { register, login, getAuthorBlogs, getAuthorDashboard, logout, getProfile, getActivityLogs, subscribe } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import { followUser, unfollowUser, getFollowers, getFollowing } from "../controllers/followController.js";

const userRouter = express.Router();

// Auth & profile routes
userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/logout", protect, logout);
userRouter.get("/me", protect, getProfile);
userRouter.get("/activity-logs", protect, getActivityLogs);
userRouter.get("/blogs", protect, getAuthorBlogs);
userRouter.get("/dashboard", protect, getAuthorDashboard);
userRouter.post("/subscribe", subscribe);

// Follow system routes
userRouter.post("/:id/follow", protect, followUser);
userRouter.delete("/:id/follow", protect, unfollowUser);
userRouter.get("/:id/followers", protect, getFollowers);
userRouter.get("/:id/following", protect, getFollowing);

export default userRouter;
