import express from "express";
import blogController from "./blog.controller.js";

const router = express.Router();

// Create a new blog post
// POST /api/blogs
router.post("/", blogController.createBlog);

// Get all blogs with pagination and search
// GET /api/blogs?page=1&limit=10&search=keyword
router.get("/", blogController.getAllBlogs);

// Get recent blogs
// GET /api/blogs/recent?limit=5
router.get("/recent", blogController.getRecentBlogs);

// Get blog by ID
// GET /api/blogs/:id
router.get("/:id", blogController.getBlogById);

// Update blog by ID
// PUT /api/blogs/:id
router.put("/:id", blogController.updateBlog);

// Delete blog by ID
// DELETE /api/blogs/:id
router.delete("/:id", blogController.deleteBlog);


// ✅ Upvote / Downvote
router.post("/:id/upvote", blogController.upvoteBlog);
router.post("/:id/downvote", blogController.downvoteBlog);

// Category management for blogs
router.post("/:id/categories", blogController.addCategoryToBlog);
router.delete("/:id/categories/:categoryId", blogController.removeCategoryFromBlog);
router.get("/category/:categoryId", blogController.getBlogsByCategory);


export default router;