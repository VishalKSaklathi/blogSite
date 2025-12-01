import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
class CategoryService {
    // Get all categories
    async getAllCategories() {
        try {
            const response = await axios.get(`${API_BASE}/api/categories`);
            return response.data;
        } catch (error) {
            console.error("Error fetching categories:", error);
            throw error;
        }
    }

    // Get category by ID
    async getCategoryById(id) {
        try {
            const response = await axios.get(`${API_BASE}/api/categories/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching category:", error);
            throw error;
        }
    }

    // Create new category
    async createCategory(categoryData) {
        try {
            const response = await axios.post(`${API_BASE}/api/categories`, categoryData);
            return response.data;
        } catch (error) {
            console.error("Error creating category:", error);
            throw error;
        }
    }

    // Update category
    async updateCategory(id, categoryData) {
        try {
            const response = await axios.put(`${API_BASE}/api/categories/${id}`, categoryData);
            return response.data;
        } catch (error) {
            console.error("Error updating category:", error);
            throw error;
        }
    }

    // Delete category
    async deleteCategory(id) {
        try {
            const response = await axios.delete(`${API_BASE}/api/categories/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting category:", error);
            throw error;
        }
    }
}

export default new CategoryService();