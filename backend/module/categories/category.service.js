import Category from "./category.model.js";
import BlogCategory from "./blog-category.model.js";
import { Op } from "sequelize";
import sequelize from "../../db.js";

class CategoryService {
    // Create a new category
    async createCategory(categoryData) {
        try {
            const { name, description, color, icon } = categoryData;

            // Generate slug from name
            const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

            const category = await Category.create({
                name,
                slug,
                description,
                color: color || "#3B82F6",
                icon,
            });

            return category;
        } catch (error) {
            if (error.name === "SequelizeUniqueConstraintError") {
                throw new Error("Category with this name already exists");
            }
            throw new Error(`Error creating category: ${error.message}`);
        }
    }

    // Get all categories with blog count
    async getAllCategories() {
        try {
            const categories = await Category.findAll({
                attributes: {
                    include: [
                        [
                            sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM "BlogCategories" AS bc
                                WHERE bc."categoryId" = "Category"."id"
                            )`),
                            "blogCount"
                        ]
                    ]
                },
                order: [["name", "ASC"]],
            });

            return categories;
        } catch (error) {
            throw new Error(`Error retrieving categories: ${error.message}`);
        }
    }

    // Get category by ID with blogs
    async getCategoryById(id) {
        try {
            const category = await Category.findByPk(id, {
                include: [{
                    association: "blogs",
                    attributes: ["id", "title", "author", "createdAt"],
                }]
            });

            if (!category) throw new Error("Category not found");
            return category;
        } catch (error) {
            throw new Error(`Error retrieving category: ${error.message}`);
        }
    }

    // Update category
    async updateCategory(id, updateData) {
        try {
            const category = await Category.findByPk(id);
            if (!category) throw new Error("Category not found");

            // Update slug if name changed
            if (updateData.name) {
                updateData.slug = updateData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
            }

            await category.update(updateData);
            return category;
        } catch (error) {
            throw new Error(`Error updating category: ${error.message}`);
        }
    }

    // Delete category
    async deleteCategory(id) {
        try {
            const deletedCount = await Category.destroy({ where: { id } });
            return deletedCount > 0;
        } catch (error) {
            throw new Error(`Error deleting category: ${error.message}`);
        }
    }

    // Search categories
    async searchCategories(searchTerm) {
        try {
            return await Category.findAll({
                where: {
                    [Op.or]: [
                        { name: { [Op.iLike]: `%${searchTerm}%` } },
                        { description: { [Op.iLike]: `%${searchTerm}%` } },
                    ],
                },
                order: [["name", "ASC"]],
            });
        } catch (error) {
            throw new Error(`Error searching categories: ${error.message}`);
        }
    }
}

export default new CategoryService();
