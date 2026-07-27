import express from "express";
import { protect } from "../middleware/auth.js";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "../controllers/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.get("/", protect, getNotifications);
notificationRouter.put("/read/:id", protect, markAsRead);
notificationRouter.patch("/:id/read", protect, markAsRead);
notificationRouter.put("/read-all", protect, markAllAsRead);
notificationRouter.delete("/:id", protect, deleteNotification);

export default notificationRouter;

