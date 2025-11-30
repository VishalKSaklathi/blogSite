import categoryService from "./category.service.js";

class CategoryController {
    // Create category
    async createCategory(req, res) {
        try {
            const { name, description, color, icon } = req.body;

            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: "Category name is required",
                });
            }

            const category = await categoryService.createCategory({
                name,
                description,
                color,
                icon,
            });

            res.status(201).json({
                success: true,
                message: "Category created successfully",
                data: category,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // Get all categories
    async getAllCategories(req, res) {
        try {
            const categories = await categoryService.getAllCategories();

            res.status(200).json({
                success: true,
                message: "Categories retrieved successfully",
                data: categories,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // Get category by ID
    async getCategoryById(req, res) {
        try {
            const { id } = req.params;
            const category = await categoryService.getCategoryById(id);

            res.status(200).json({
                success: true,
                message: "Category retrieved successfully",
                data: category,
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message,
            });
        }
    }

    // Update category
    async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const category = await categoryService.updateCategory(id, updateData);

            res.status(200).json({
                success: true,
                message: "Category updated successfully",
                data: category,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // Delete category
    async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            const deleted = await categoryService.deleteCategory(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found",
                });
            }

            res.status(200).json({
                success: true,
                message: "Category deleted successfully",
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
}

export default new CategoryController();