// backend/module/comment.service.js
import Comment from "./comment.model.js";
import Blog from "../blog/blog.model.js";

class CommentService {
    // Create a new comment
    async createComment(commentData) {
        try {
            const { blogId, author, content } = commentData;

            const blog = await Blog.findByPk(blogId);
            if (!blog) throw new Error("Blog not found");

            const newComment = await Comment.create({
                blogId,
                author,
                content,
            });

            // Update comment count in Blog
            blog.commentCount += 1;
            await blog.save();

            return newComment;
        } catch (error) {
            throw new Error(`Error creating comment: ${error.message}`);
        }
    }

    // Get comments for a specific blog
    async getCommentsByBlogId(blogId) {
        try {
            const comments = await Comment.findAll({
                where: { blogId },
                order: [["createdAt", "DESC"]],
            });
            return comments;
        } catch (error) {
            throw new Error(`Error fetching comments: ${error.message}`);
        }
    }

    // Delete comment
    async deleteComment(commentId) {
        try {
            const comment = await Comment.findByPk(commentId);
            if (!comment) throw new Error("Comment not found");

            const blog = await Blog.findByPk(comment.blogId);
            if (blog && blog.commentCount > 0) {
                blog.commentCount -= 1;
                await blog.save();
            }

            await comment.destroy();
            return { message: "Comment deleted successfully" };
        } catch (error) {
            throw new Error(`Error deleting comment: ${error.message}`);
        }
    }
}

export default new CommentService();
