import Blog from "./blog/blog.model.js";
import blogController from "./blog/blog.controller.js";
import blogService from "./blog/blog.service.js";
import blogRoutes from "./blog/blog.routes.js";
import Comment from "./comment/comment.model.js";
import commentController from "./comment/comment.controller.js";
import commentService from "./comment/comment.service.js";
import commentRoutes from "./comment/comment.routes.js"

export const router = blogRoutes
export const commentRouter = commentRoutes

export { Blog, blogController, blogService, Comment, commentController, commentService }