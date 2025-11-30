import Blog from "./blog.model.js";
import Category from "../categories/category.model.js";
import BlogCategory from "../categories/blog-category.model.js";
import { Op } from "sequelize";

class BlogService {
    // Create a new blog with categories
    async createBlog(blogData) {
        try {
            console.log("Incoming blog data: ", blogData);

            const { title, content, author, imageUrl, categoryIds } = blogData;

            // Create the blog
            const blog = await Blog.create({
                title,
                content,
                author: author || "Anonymous",
                imageUrl: imageUrl || null, // Store URL directly
            });

            // Associate categories if provided
            if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
                await blog.setCategories(categoryIds);
            }

            // Fetch blog with categories
            const blogWithCategories = await Blog.findByPk(blog.id, {
                include: [{
                    model: Category,
                    as: "categories",
                    attributes: ["id", "name", "slug", "color"],
                    through: { attributes: [] }, // exclude junction table data
                }]
            });

            return blogWithCategories;
        } catch (error) {
            throw new Error(`Error creating blog: ${error.message}`);
        }
    }

    // Get all blogs with pagination, search & category filter
    async getAllBlogs({ limit = 10, offset = 0, search = '', categoryId = null }) {
        try {
            const where = {};

            // Search filter
            if (search) {
                where[Op.or] = [
                    { title: { [Op.iLike]: `%${search}%` } },
                    { content: { [Op.iLike]: `%${search}%` } },
                ];
            }

            const include = [{
                model: Category,
                as: "categories",
                attributes: ["id", "name", "slug", "color"],
                through: { attributes: [] },
            }];

            // Category filter
            if (categoryId) {
                include[0].where = { id: categoryId };
                include[0].required = true; // INNER JOIN to filter by category
            }

            const { rows: blogs, count: total } = await Blog.findAndCountAll({
                where,
                include,
                limit,
                offset,
                order: [['createdAt', 'DESC']],
                distinct: true, // important for correct count with joins
            });

            return { blogs, total };
        } catch (error) {
            throw new Error(`Error retrieving blogs: ${error.message}`);
        }
    }

    // Get blog by ID with categories
    async getBlogById(id) {
        try {
            const blog = await Blog.findByPk(id, {
                include: [{
                    model: Category,
                    as: "categories",
                    attributes: ["id", "name", "slug", "color", "icon"],
                    through: { attributes: [] },
                }]
            });

            if (!blog) throw new Error("Blog not found");
            return blog;
        } catch (error) {
            throw new Error(`Error retrieving blog: ${error.message}`);
        }
    }

    // Update blog with categories
    async updateBlog(id, updateData) {
        try {
            const blog = await Blog.findByPk(id);
            if (!blog) throw new Error("Blog not found");

            const { categoryIds, ...blogUpdateData } = updateData;

            // Update blog fields
            if (Object.keys(blogUpdateData).length > 0) {
                await blog.update(blogUpdateData);
            }

            // Update categories if provided
            if (categoryIds !== undefined) {
                if (Array.isArray(categoryIds) && categoryIds.length > 0) {
                    await blog.setCategories(categoryIds);
                } else {
                    // Remove all categories if empty array
                    await blog.setCategories([]);
                }
            }

            // Fetch updated blog with categories
            const updatedBlog = await Blog.findByPk(id, {
                include: [{
                    model: Category,
                    as: "categories",
                    attributes: ["id", "name", "slug", "color"],
                    through: { attributes: [] },
                }]
            });

            return updatedBlog;
        } catch (error) {
            throw new Error(`Error updating blog: ${error.message}`);
        }
    }

    // Add category to blog
    async addCategoryToBlog(blogId, categoryId) {
        try {
            const blog = await Blog.findByPk(blogId);
            if (!blog) throw new Error("Blog not found");

            const category = await Category.findByPk(categoryId);
            if (!category) throw new Error("Category not found");

            await blog.addCategory(category);

            return await this.getBlogById(blogId);
        } catch (error) {
            throw new Error(`Error adding category to blog: ${error.message}`);
        }
    }

    // Remove category from blog
    async removeCategoryFromBlog(blogId, categoryId) {
        try {
            const blog = await Blog.findByPk(blogId);
            if (!blog) throw new Error("Blog not found");

            await blog.removeCategory(categoryId);

            return await this.getBlogById(blogId);
        } catch (error) {
            throw new Error(`Error removing category from blog: ${error.message}`);
        }
    }

    // Get blogs by category
    // In blog.service.js

    async getBlogsByCategory(categoryId, options = {}) {
        try {
            const { limit = 20, offset = 0 } = options;

            // Single optimized query - get blogs with ALL their categories in one go
            const blogs = await Blog.findAll({
                include: [
                    {
                        model: Category,
                        as: 'categories',
                        through: { attributes: [] },
                        required: true,
                        where: { id: categoryId }
                    }
                ],
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['createdAt', 'DESC']],
                distinct: true,
                subQuery: false
            });

            // If you need ALL categories (not just the filtered one), use this instead:
            // This fetches all categories in ONE additional query, not N queries
            const blogIds = blogs.map(blog => blog.id);

            if (blogIds.length === 0) {
                return [];
            }

            const allBlogsWithCategories = await Blog.findAll({
                where: { id: blogIds },
                include: [
                    {
                        model: Category,
                        as: 'categories',
                        through: { attributes: [] }
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            return allBlogsWithCategories;
        } catch (error) {
            throw new Error(`Error retrieving blogs by category: ${error.message}`);
        }
    }

    // ✅ Increment upvote count
    async upvoteBlog(id) {
        try {
            const blog = await Blog.findByPk(id);
            if (!blog) throw new Error("Blog not found");

            blog.upvotes += 1;
            await blog.save();

            return blog;
        } catch (error) {
            throw new Error(`Error upvoting blog: ${error.message}`);
        }
    }

    // ✅ Increment downvote count
    async downvoteBlog(id) {
        try {
            const blog = await Blog.findByPk(id);
            if (!blog) throw new Error("Blog not found");

            blog.downvotes += 1;
            await blog.save();

            return blog;
        } catch (error) {
            throw new Error(`Error downvoting blog: ${error.message}`);
        }
    }

    // Delete blog
    async deleteBlog(id) {
        try {
            const deletedCount = await Blog.destroy({ where: { id } });
            return deletedCount > 0;
        } catch (error) {
            throw new Error(`Error deleting blog: ${error.message}`);
        }
    }

    // Get recent blogs
    async getRecentBlogs(limit = 5) {
        try {
            return await Blog.findAll({
                include: [{
                    model: Category,
                    as: "categories",
                    attributes: ["id", "name", "slug", "color"],
                    through: { attributes: [] },
                }],
                limit,
                order: [["createdAt", "DESC"]],
            });
        } catch (error) {
            throw new Error(`Error retrieving recent blogs: ${error.message}`);
        }
    }

    // Search blogs by title
    async searchBlogsByTitle(searchTerm, limit = 10) {
        try {
            return await Blog.findAll({
                where: { title: { [Op.iLike]: `%${searchTerm}%` } },
                include: [{
                    model: Category,
                    as: "categories",
                    attributes: ["id", "name", "slug", "color"],
                    through: { attributes: [] },
                }],
                limit,
                order: [["createdAt", "DESC"]],
            });
        } catch (error) {
            throw new Error(`Error searching blogs: ${error.message}`);
        }
    }

    // Get blogs count
    async getBlogsCount() {
        try {
            return await Blog.count();
        } catch (error) {
            throw new Error(`Error getting blogs count: ${error.message}`);
        }
    }
}

export default new BlogService();