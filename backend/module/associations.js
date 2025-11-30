import Blog from "./blog/blog.model.js";
import Category from "./categories/category.model.js";
import BlogCategory from "./categories/blog-category.model.js";

// Many-to-Many relationship
Blog.belongsToMany(Category, {
    through: BlogCategory,
    foreignKey: "blogId",
    otherKey: "categoryId",
    as: "categories",
});

Category.belongsToMany(Blog, {
    through: BlogCategory,
    foreignKey: "categoryId",
    otherKey: "blogId",
    as: "blogs",
});

// Direct access to junction table if needed
Blog.hasMany(BlogCategory, { foreignKey: "blogId", as: "blogCategories" });
Category.hasMany(BlogCategory, { foreignKey: "categoryId", as: "categoryBlogs" });
BlogCategory.belongsTo(Blog, { foreignKey: "blogId", as: "blog" });
BlogCategory.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

console.log(" Model associations defined successfully");

export { Blog, Category, BlogCategory };