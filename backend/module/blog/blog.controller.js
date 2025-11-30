import blogService from "./blog.service.js";

class BlogController {
    // Create a new blog post with categories
    async createBlog(req, res) {
        try {
            const { title, content, author, imageUrl, categoryIds } = req.body;

            // Validate required fields
            if (!title || !content || !author) {
                return res.status(400).json({
                    success: false,
                    message: "Title, content, and author are required.",
                });
            }

            // Validate imageUrl if provided
            if (imageUrl && typeof imageUrl !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: "imageUrl must be a valid URL string",
                });
            }

            // Validate categoryIds if provided
            if (categoryIds && !Array.isArray(categoryIds)) {
                return res.status(400).json({
                    success: false,
                    message: "categoryIds must be an array",
                });
            }

            const blogData = { title, content, author, imageUrl, categoryIds };
            const blog = await blogService.createBlog(blogData);

            res.status(201).json({
                success: true,
                message: "Blog created successfully",
                data: blog,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error creating blog",
                error: error.message,
            });
        }
    }

    // Get all blogs with pagination, search, and category filter
    async getAllBlogs(req, res) {
        try {
            const {
                limit = 20,
                offset = 0,
                page = 1,
                search,
                categoryId // new parameter for filtering by category
            } = req.query;

            const result = await blogService.getAllBlogs({
                limit: parseInt(limit),
                offset: parseInt(offset),
                search,
                categoryId: categoryId ? parseInt(categoryId) : null,
            });

            res.status(200).json({
                success: true,
                message: "Blogs retrieved successfully",
                data: result.blogs,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(result.total / parseInt(limit)),
                    totalBlogs: result.total,
                    limit: parseInt(limit),
                },
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error retrieving blogs",
                error: error.message,
            });
        }
    }

    // Get blog by ID with categories
    async getBlogById(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid blog ID is required",
                });
            }

            const blog = await blogService.getBlogById(id);

            if (!blog) {
                return res.status(404).json({
                    success: false,
                    message: "Blog not found",
                });
            }

            res.status(200).json({
                success: true,
                message: "Blog retrieved successfully",
                data: blog,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error retrieving blog",
                error: error.message,
            });
        }
    }

    // Update blog with categories
    async updateBlog(req, res) {
        try {
            const { id } = req.params;
            const { title, content, imageUrl, categoryIds } = req.body;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid blog ID is required",
                });
            }

            const updateData = {};
            if (title) updateData.title = title;
            if (content) updateData.content = content;
            if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
            if (categoryIds !== undefined) updateData.categoryIds = categoryIds;

            const updatedBlog = await blogService.updateBlog(id, updateData);

            if (!updatedBlog) {
                return res.status(404).json({
                    success: false,
                    message: "Blog not found",
                });
            }

            res.status(200).json({
                success: true,
                message: "Blog updated successfully",
                data: updatedBlog,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error updating blog",
                error: error.message,
            });
        }
    }

    // Add category to existing blog
    async addCategoryToBlog(req, res) {
        try {
            const { id } = req.params;
            const { categoryId } = req.body;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid blog ID is required",
                });
            }

            if (!categoryId || isNaN(categoryId)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid category ID is required",
                });
            }

            const blog = await blogService.addCategoryToBlog(
                parseInt(id),
                parseInt(categoryId)
            );

            res.status(200).json({
                success: true,
                message: "Category added to blog successfully",
                data: blog,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // Remove category from blog
    async removeCategoryFromBlog(req, res) {
        try {
            const { id, categoryId } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid blog ID is required",
                });
            }

            if (!categoryId || isNaN(categoryId)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid category ID is required",
                });
            }

            const blog = await blogService.removeCategoryFromBlog(
                parseInt(id),
                parseInt(categoryId)
            );

            res.status(200).json({
                success: true,
                message: "Category removed from blog successfully",
                data: blog,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // Get blogs by category
    async getBlogsByCategory(req, res) {
        try {
            const { categoryId } = req.params;
            const { limit = 20, offset = 0 } = req.query;

            if (!categoryId || isNaN(categoryId)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid category ID is required",
                });
            }

            const blogs = await blogService.getBlogsByCategory(
                parseInt(categoryId),
                {
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            );

            res.status(200).json({
                success: true,
                message: "Blogs retrieved successfully",
                data: blogs,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // ✅ Upvote Blog
    async upvoteBlog(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid blog ID is required",
                });
            }

            const updatedBlog = await blogService.upvoteBlog(id);
            res.status(200).json({
                success: true,
                message: "Blog upvoted successfully",
                data: {
                    id: updatedBlog.id,
                    upvotes: updatedBlog.upvotes,
                    downvotes: updatedBlog.downvotes,
                },
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error upvoting blog",
                error: error.message,
            });
        }
    }

    // ✅ Downvote Blog
    async downvoteBlog(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid blog ID is required",
                });
            }

            const updatedBlog = await blogService.downvoteBlog(id);
            res.status(200).json({
                success: true,
                message: "Blog downvoted successfully",
                data: {
                    id: updatedBlog.id,
                    upvotes: updatedBlog.upvotes,
                    downvotes: updatedBlog.downvotes,
                },
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error downvoting blog",
                error: error.message,
            });
        }
    }

    // Delete blog
    async deleteBlog(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid blog ID is required",
                });
            }

            const deleted = await blogService.deleteBlog(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: "Blog not found",
                });
            }

            res.status(200).json({
                success: true,
                message: "Blog deleted successfully",
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error deleting blog",
                error: error.message,
            });
        }
    }

    // Get recent blogs
    async getRecentBlogs(req, res) {
        try {
            const { limit = 5 } = req.query;
            const blogs = await blogService.getRecentBlogs(parseInt(limit));

            res.status(200).json({
                success: true,
                message: "Recent blogs retrieved successfully",
                data: blogs,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error retrieving recent blogs",
                error: error.message,
            });
        }
    }
}

export default new BlogController();