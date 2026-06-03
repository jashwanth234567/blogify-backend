import express from "express";
import { register, login, getAuthorBlogs, getAuthorDashboard, logout, getProfile, getActivityLogs, subscribe } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/logout", protect, logout);
userRouter.get("/me", protect, getProfile);
userRouter.get("/activity-logs", protect, getActivityLogs);
userRouter.get("/blogs", protect, getAuthorBlogs);
userRouter.get("/dashboard", protect, getAuthorDashboard);
userRouter.post("/subscribe", subscribe);

export default userRouter;
