// Frontend Blog Service
// This service handles all API calls to the backend blog endpoints

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

class BlogService {
    constructor() {
        this.baseURL = `${API_BASE}/api/blogs`;
    }

    // Helper method to handle API requests
    async makeRequest(url, options = {}) {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            };

            const response = await fetch(url, config);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Create a new blog post
    async createBlog(blogData) {
        try {
            const response = await this.makeRequest(this.baseURL, {
                method: 'POST',
                body: JSON.stringify(blogData)
            });

            return response;
        } catch (error) {
            throw new Error(`Failed to create blog: ${error.message}`);
        }
    }

    // Get all blogs with optional pagination and search
    async getAllBlogs(params = {}) {
        try {
            const { limit = 20, offset = 0, page = 1, search = '' } = params;

            const queryParams = new URLSearchParams({
                limit: limit.toString(),
                offset: offset.toString(),
                page: page.toString(),
                ...(search && { search }),
            });

            const url = `${this.baseURL}?${queryParams}`;
            const response = await this.makeRequest(url);

            return response;
        } catch (error) {
            throw new Error(`Failed to fetch blogs: ${error.message}`);
        }
    }


    // Get blog by ID
    async getBlogById(id) {
        try {
            if (!id) {
                throw new Error('Blog ID is required');
            }

            const url = `${this.baseURL}/${id}`;
            const response = await this.makeRequest(url);
            return response;
        } catch (error) {
            throw new Error(`Failed to fetch blog: ${error.message}`);
        }
    }

    // Update blog by ID
    async updateBlog(id, updateData) {
        try {
            if (!id) {
                throw new Error('Blog ID is required');
            }

            const url = `${this.baseURL}/${id}`;
            const response = await this.makeRequest(url, {
                method: 'PUT',
                body: JSON.stringify(updateData)
            });

            return response;
        } catch (error) {
            throw new Error(`Failed to update blog: ${error.message}`);
        }
    }

    // Delete blog by ID
    async deleteBlog(id) {
        try {
            if (!id) {
                throw new Error('Blog ID is required');
            }

            const url = `${this.baseURL}/${id}`;
            const response = await this.makeRequest(url, {
                method: 'DELETE'
            });

            return response;
        } catch (error) {
            throw new Error(`Failed to delete blog: ${error.message}`);
        }
    }

    // Get recent blogs
    async getRecentBlogs(limit = 5) {
        try {
            const queryParams = new URLSearchParams({
                limit: limit.toString()
            });

            const url = `${this.baseURL}/recent?${queryParams}`;
            const response = await this.makeRequest(url);

            return response;
        } catch (error) {
            throw new Error(`Failed to fetch recent blogs: ${error.message}`);
        }
    }

    // Search blogs (alternative method for explicit search)
    async searchBlogs(searchTerm, params = {}) {
        try {
            if (!searchTerm) {
                throw new Error('Search term is required');
            }

            const { page = 1, limit = 10 } = params;

            return await this.getAllBlogs({
                page,
                limit,
                search: searchTerm
            });
        } catch (error) {
            throw new Error(`Failed to search blogs: ${error.message}`);
        }
    }

    // Upload image (if you have file upload endpoint)
    async uploadImage(file) {
        try {
            if (!file) {
                throw new Error('File is required');
            }

            const formData = new FormData();
            formData.append('image', file);

            const response = await this.makeRequest(`${API_BASE}/api/upload`, {
                method: 'POST',
                body: formData,
                headers: {} // Let browser set Content-Type for FormData
            });

            return response;
        } catch (error) {
            throw new Error(`Failed to upload image: ${error.message}`);
        }
    }

    // Bulk operations
    async bulkDeleteBlogs(blogIds) {
        try {
            if (!blogIds || !Array.isArray(blogIds) || blogIds.length === 0) {
                throw new Error('Blog IDs array is required');
            }

            const deletePromises = blogIds.map(id => this.deleteBlog(id));
            const results = await Promise.allSettled(deletePromises);

            const successful = results.filter(result => result.status === 'fulfilled');
            const failed = results.filter(result => result.status === 'rejected');

            return {
                successful: successful.length,
                failed: failed.length,
                total: blogIds.length,
                errors: failed.map(result => result.reason.message)
            };
        } catch (error) {
            throw new Error(`Failed to bulk delete blogs: ${error.message}`);
        }
    }

    // Get server health status
    async getHealthStatus() {
        try {
            const url = `${API_BASE}/health`;
            const response = await this.makeRequest(url);
            return response;
        } catch (error) {
            throw new Error(`Failed to check server health: ${error.message}`);
        }
    }

    // Utility methods
    formatBlogData(blogData) {
        return {
            title: blogData.title?.trim() || '',
            content: blogData.content?.trim() || '',
            image: blogData.image?.trim() || null
        };
    }

    validateBlogData(blogData) {
        const errors = [];

        if (!blogData.title || blogData.title.trim().length === 0) {
            errors.push('Title is required');
        }

        if (!blogData.content || blogData.content.trim().length === 0) {
            errors.push('Content is required');
        }

        if (blogData.title && blogData.title.length > 200) {
            errors.push('Title must be 200 characters or less');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Cache management (for performance)
    cache = new Map();

    async getCachedBlogs(cacheKey, fetcher, ttl = 5 * 60 * 1000) { // 5 minutes TTL
        const cached = this.cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < ttl) {
            return cached.data;
        }

        try {
            const data = await fetcher();
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            return data;
        } catch (error) {
            // Return cached data if available on error
            if (cached) {
                return cached.data;
            }
            throw error;
        }
    }

    clearCache() {
        this.cache.clear();
    }

    // Convenience methods with caching
    async getCachedRecentBlogs(limit = 5) {
        return await this.getCachedBlogs(
            `recent-blogs-${limit}`,
            () => this.getRecentBlogs(limit)
        );
    }

    async getCachedBlogById(id) {
        return await this.getCachedBlogs(
            `blog-${id}`,
            () => this.getBlogById(id)
        );
    }

    async getBlogsByCategory(categoryId, params = {}) {
        try {
            if (!categoryId) {
                throw new Error('Category ID is required');
            }

            const { limit = 20, offset = 0 } = params;

            const queryParams = new URLSearchParams({
                limit: limit.toString(),
                offset: offset.toString()
            });

            const url = `${API_BASE}/api/blogs/category/${categoryId}?${queryParams}`;
            const response = await this.makeRequest(url);

            return response;
        } catch (error) {
            throw new Error(`Failed to fetch blogs by category: ${error.message}`);
        }
    }

    // Get category by ID
    async getCategoryById(categoryId) {
        try {
            if (!categoryId) {
                throw new Error('Category ID is required');
            }

            const url = `${API_BASE}/api/categories/${categoryId}`;
            const response = await this.makeRequest(url);

            return response;
        } catch (error) {
            throw new Error(`Failed to fetch category: ${error.message}`);
        }
    }
}

// Create and export singleton instance
const blogService = new BlogService();

// Export both the class and instance for flexibility
export { BlogService };
export default blogService;

// Usage examples:
/*
// Import the service
import blogService from './services/blogService.js';

// Create a new blog
try {
    const newBlog = await blogService.createBlog({
        title: 'My New Blog Post',
        content: 'This is the blog content...',
        image: 'https://example.com/image.jpg'
    });
    console.log('Blog created:', newBlog);
} catch (error) {
    console.error('Error creating blog:', error.message);
}

// Get all blogs with pagination
try {
    const blogs = await blogService.getAllBlogs({
        page: 1,
        limit: 10,
        search: 'javascript'
    });
    console.log('Blogs:', blogs.data);
    console.log('Pagination:', blogs.pagination);
} catch (error) {
    console.error('Error fetching blogs:', error.message);
}

// Get a specific blog
try {
    const blog = await blogService.getBlogById(1);
    console.log('Blog:', blog.data);
} catch (error) {
    console.error('Error fetching blog:', error.message);
}

// Update a blog
try {
    const updatedBlog = await blogService.updateBlog(1, {
        title: 'Updated Blog Title'
    });
    console.log('Updated blog:', updatedBlog.data);
} catch (error) {
    console.error('Error updating blog:', error.message);
}

// Delete a blog
try {
    await blogService.deleteBlog(1);
    console.log('Blog deleted successfully');
} catch (error) {
    console.error('Error deleting blog:', error.message);
}

// Get recent blogs with caching
try {
    const recentBlogs = await blogService.getCachedRecentBlogs(5);
    console.log('Recent blogs:', recentBlogs.data);
} catch (error) {
    console.error('Error fetching recent blogs:', error.message);
}
*/