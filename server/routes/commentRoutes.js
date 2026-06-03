import express from "express";
import { protect } from "../middleware/auth.js";
import { addComment, getBlogApprovedComments, getAuthorComments, approveCommentById, deleteCommentById } from "../controllers/commentsController.js";

const commentRouter = express.Router();

commentRouter.post("/add", addComment);
commentRouter.get("/blog/:blogId", getBlogApprovedComments);
commentRouter.get("/author", protect, getAuthorComments);
commentRouter.put("/approve/:commentId", protect, approveCommentById);
commentRouter.delete("/:commentId", protect, deleteCommentById);

export default commentRouter;
