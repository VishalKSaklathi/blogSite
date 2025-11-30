// backend/module/comment.model.js
import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import Blog from "../blog/blog.model.js";

const Comment = sequelize.define("Comment", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    blogId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Blog,
            key: "id",
        },
        onDelete: "CASCADE",
    },
    author: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

// Establish relationship
Blog.hasMany(Comment, { foreignKey: "blogId", onDelete: "CASCADE" });
Comment.belongsTo(Blog, { foreignKey: "blogId" });

export default Comment;
