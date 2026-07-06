import express from "express";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import { getProfile, updateProfile, uploadAvatar, uploadCover, changePassword } from "../controllers/profileController.js";

const profileRouter = express.Router();

profileRouter.get("/:username", protect, getProfile);
profileRouter.put("/", protect, updateProfile);
profileRouter.put("/change-password", protect, changePassword);
profileRouter.post("/avatar", protect, upload.single("image"), uploadAvatar);
profileRouter.post("/cover", protect, upload.single("image"), uploadCover);

export default profileRouter;
