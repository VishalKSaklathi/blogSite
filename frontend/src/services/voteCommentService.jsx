// src/services/voteCommentService.js
const API_BASE = import.meta.env.API_BASE || 'http://localhost:3000';

class VoteCommentService {
    constructor() {
        this.baseURL = `${API_BASE}/api`;
    }
    // -------------------
    // 🟢 ADD COMMENT
    // -------------------
    // ✅ Add Comment
    async addComment({ blogId, author, content }) {
        try {
            if (!blogId) throw new Error("Blog ID is required");
            if (!content?.trim()) throw new Error("Comment content is required");

            const response = await fetch(`${this.baseURL}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ blogId, author, content }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to add comment");
            return data;
        } catch (error) {
            console.error("Error adding comment:", error);
            throw error;
        }
    }

    // -------------------
    // 🟣 GET COMMENTS
    // -------------------
    async getComments(blogId) {
        try {
            const response = await fetch(`${this.baseURL}/comments/${blogId}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to fetch comments");
            return data;
        } catch (error) {
            console.error("Error fetching comments:", error);
            throw error;
        }
    }

    // -------------------
    // 🔼 UPVOTE BLOG
    // -------------------
    async upvoteBlog(blogId) {
        try {
            if (!blogId) throw new Error('Blog ID is required');

            const response = await fetch(`${this.baseURL}/blogs/${blogId}/upvote`, {
                method: 'POST',
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to upvote blog');
            return data;
        } catch (error) {
            console.error('Error upvoting blog:', error);
            throw error;
        }
    }

    // -------------------
    // 🔽 DOWNVOTE BLOG
    // -------------------
    async downvoteBlog(blogId) {
        try {
            if (!blogId) throw new Error('Blog ID is required');

            const response = await fetch(`${this.baseURL}/blogs/${blogId}/downvote`, {
                method: 'POST',
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to downvote blog');
            return data;
        } catch (error) {
            console.error('Error downvoting blog:', error);
            throw error;
        }
    }
}

// ✅ Create and export a singleton
const voteCommentService = new VoteCommentService();

export default voteCommentService;
