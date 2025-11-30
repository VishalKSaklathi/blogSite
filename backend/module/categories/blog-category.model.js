import { DataTypes } from "sequelize";
import sequelize from "../../db.js";

const BlogCategory = sequelize.define("BlogCategory", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    blogId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Blogs",
            key: "id",
        },
        onDelete: "CASCADE",
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Categories",
            key: "id",
        },
        onDelete: "CASCADE",
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: "BlogCategories",
    timestamps: true,
    updatedAt: false,
    indexes: [
        {
            unique: true,
            fields: ["blogId", "categoryId"], // prevent duplicate entries
        },
    ],
});

export default BlogCategory;

