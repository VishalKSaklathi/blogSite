// backend/module/comment.controller.js
import commentService from "./comment.service.js";

class CommentController {
    async create(req, res) {
        try {
            const comment = await commentService.createComment(req.body);
            res.status(201).json({ success: true, data: comment });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getByBlog(req, res) {
        try {
            const { blogId } = req.params;
            const comments = await commentService.getCommentsByBlogId(blogId);
            res.json({ success: true, data: comments });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await commentService.deleteComment(id);
            res.json({ success: true, message: result.message });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

export default new CommentController();
