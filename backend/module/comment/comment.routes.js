// backend/module/comment.routes.js
import express from "express";
import commentController from "./comment.controller.js";

const router = express.Router();

// Routes
router.post("/", commentController.create); // Create new comment
router.get("/:blogId", commentController.getByBlog); // Get comments for blog
router.delete("/:id", commentController.delete); // Delete comment

export default router;
