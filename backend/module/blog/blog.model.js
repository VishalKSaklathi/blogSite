import { DataTypes } from "sequelize";
import sequelize from "../../db.js"; // your db connection

const Blog = sequelize.define("Blog", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    title: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },

    content: {
        type: DataTypes.TEXT, // store HTML safely
        allowNull: false,
    },
    imageUrl: {
        // Changed from 'image' BLOB to 'imageUrl' STRING
        type: DataTypes.STRING(500), // URL can be up to 500 characters
        allowNull: true,
        validate: {
            isUrl: {
                msg: "Must be a valid URL"
            }
        }
    },
    author: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    upvotes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    downvotes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },

    commentCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },

    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },

    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

export default Blog;
