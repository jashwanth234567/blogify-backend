import express from "express";
import { getAuthorBlogs, getAuthorDashboard, logout, getProfile, getActivityLogs, subscribe, searchUsers, getSuggestedAuthors } from "../controllers/userController.js";
import { registerUser, verifyUserOtp, resendUserOtp, loginUser, forgotPasswordUser, resetPasswordUser } from "../controllers/authController.js";
import { protect, optionalProtect } from "../middleware/auth.js";
import { followUser, unfollowUser, getFollowers, getFollowing } from "../controllers/followController.js";

const userRouter = express.Router();

// Search & Suggested Users routes
userRouter.get("/search", searchUsers);
userRouter.get("/suggestions", searchUsers);
userRouter.get("/suggested", getSuggestedAuthors);

// Auth & OTP verification routes (Unified with authController)
userRouter.post("/register", registerUser);
userRouter.post("/verify-otp", verifyUserOtp);
userRouter.post("/resend-otp", resendUserOtp);
userRouter.post("/login", loginUser);
userRouter.post("/forgot-password", forgotPasswordUser);
userRouter.post("/reset-password", resetPasswordUser);

userRouter.post("/logout", protect, logout);
userRouter.get("/me", protect, getProfile);
userRouter.get("/activity-logs", protect, getActivityLogs);
userRouter.get("/blogs", protect, getAuthorBlogs);
userRouter.get("/dashboard", protect, getAuthorDashboard);
userRouter.post("/subscribe", subscribe);

// Follow system routes
userRouter.post("/:id/follow", protect, followUser);
userRouter.delete("/:id/follow", protect, unfollowUser);
userRouter.get("/:id/followers", optionalProtect, getFollowers);
userRouter.get("/:id/following", optionalProtect, getFollowing);

export default userRouter;
