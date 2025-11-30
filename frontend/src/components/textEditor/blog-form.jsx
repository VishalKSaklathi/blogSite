import React, { useState, useEffect, useRef } from "react";
import { Send, LinkIcon, User, Tags, Plus, X, Bold, Italic, Underline, List, ListOrdered, Link, Code, Quote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import blogService from "@/services/blogServices";
import categoryService from "@/services/categoryService";

// Blog Service
// const API_BASE = import.meta.env?.VITE_API_BASE || 'http://localhost:3000';

// class BlogService {
//     constructor() {
//         this.baseURL = `${API_BASE}/api/blogs`;
//     }

//     async makeRequest(url, options = {}) {
//         try {
//             const config = {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     ...options.headers
//                 },
//                 ...options
//             };

//             const response = await fetch(url, config);
//             const data = await response.json();
//             if (!response.ok) {
//                 throw new Error(data.message || `HTTP error! status: ${response.status}`);
//             }
//             return data;
//         } catch (error) {
//             console.error('API Request Error:', error);
//             throw error;
//         }
//     }

//     async createBlog(blogData) {
//         const response = await this.makeRequest(this.baseURL, {
//             method: 'POST',
//             body: JSON.stringify(blogData)
//         });
//         return response;
//     }
// }

// // Category Service
// class CategoryService {
//     constructor() {
//         this.baseURL = `${API_BASE}/api/categories`;
//     }

//     async makeRequest(url, options = {}) {
//         try {
//             const config = {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     ...options.headers
//                 },
//                 ...options
//             };

//             const response = await fetch(url, config);
//             const data = await response.json();
//             if (!response.ok) {
//                 throw new Error(data.message || `HTTP error! status: ${response.status}`);
//             }
//             return data;
//         } catch (error) {
//             console.error('API Request Error:', error);
//             throw error;
//         }
//     }

//     async getAllCategories() {
//         return await this.makeRequest(this.baseURL);
//     }

//     async createCategory(categoryData) {
//         return await this.makeRequest(this.baseURL, {
//             method: 'POST',
//             body: JSON.stringify(categoryData)
//         });
//     }
// }

// const blogService = new BlogService();
// const categoryService = new CategoryService();

function BlogForm() {
    const navigate = useNavigate();
    const [data, setData] = useState({
        title: "",
        content: "",
        author: "",
        imageUrl: "",
        categoryIds: []
    });

    const [categories, setCategories] = useState([]);
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const editorRef = useRef(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setIsLoadingCategories(true);
        setError(null);
        try {
            const response = await categoryService.getAllCategories();
            setCategories(response.data || response);
        } catch (error) {
            console.error("Error fetching categories:", error);
            setError("Failed to load categories. Please refresh the page.");
        } finally {
            setIsLoadingCategories(false);
        }
    };

    // Helper function to trigger sidebar refresh
    const triggerSidebarRefresh = () => {
        // Dispatch custom event that sidebar will listen to
        window.dispatchEvent(new CustomEvent('refreshCategories'));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // const handleFileChange = (e) => {
    //     setData((prev) => ({
    //         ...prev,
    //         image: e.target.files[0]
    //     }));
    // };

    const toggleCategory = (categoryId) => {
        setData((prev) => ({
            ...prev,
            categoryIds: prev.categoryIds.includes(categoryId)
                ? prev.categoryIds.filter(id => id !== categoryId)
                : [...prev.categoryIds, categoryId]
        }));
    };

    const handleCreateNewCategory = async () => {
        if (!newCategoryName.trim()) {
            alert("⚠️ Please enter a category name");
            return;
        }

        try {
            const response = await categoryService.createCategory({
                name: newCategoryName.trim(),
                color: "#3B82F6"
            });

            const newCategory = response.data || response;
            setCategories([...categories, newCategory]);
            setData(prev => ({
                ...prev,
                categoryIds: [...prev.categoryIds, newCategory.id]
            }));

            setNewCategoryName("");
            setShowNewCategory(false);
            // Trigger sidebar refresh after creating new category
            triggerSidebarRefresh();

            alert("✅ Category created successfully!");

        } catch (error) {
            console.error("Error creating category:", error);
            alert("❌ Failed to create category: " + error.message);
        }
    };

    // Rich Text Editor Functions
    const applyFormat = (command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    const insertLink = () => {
        const url = prompt("Enter URL:");
        if (url) {
            applyFormat('createLink', url);
        }
    };

    const handleEditorInput = () => {
        if (editorRef.current) {
            setData(prev => ({
                ...prev,
                content: editorRef.current.innerHTML
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!data.title.trim()) {
            alert("⚠️ Please enter a title");
            return;
        }
        if (!data.content.trim() || data.content === '<br>') {
            alert("⚠️ Please enter content");
            return;
        }
        if (!data.author.trim()) {
            alert("⚠️ Please enter author name");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const blogData = {
                title: data.title.trim(),
                content: data.content.trim(),
                author: data.author.trim(),
                categoryIds: data.categoryIds,
                imageUrl: data.imageUrl.trim() || null
            };

            const response = await blogService.createBlog(blogData);

            // Trigger sidebar refresh after creating new category
            triggerSidebarRefresh();

            console.log("Blog created:", response);
            alert("✅ Blog Posted Successfully!");


            // Reset form
            setData({
                title: "",
                content: "",
                author: "",
                imageUrl: "",
                categoryIds: []
            });
            if (editorRef.current) {
                editorRef.current.innerHTML = '';
            }
            navigate('/dashboard/blogs');
        } catch (error) {
            console.error("Error creating blog:", error);
            setError("Failed to create blog: " + error.message);
            alert("❌ Failed to create blog: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClear = () => {
        setData({
            title: "",
            content: "",
            author: "",
            imageUrl: "",
            categoryIds: []
        });
        if (editorRef.current) {
            editorRef.current.innerHTML = '';
        }
        setError(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-4 p-6">
                    <h1 className="text-2xl font-bold text-slate-900">Create a post</h1>
                    <p className="text-sm text-slate-600 mt-1">Share your thoughts with the community</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {/* Form Container */}
                <div className="space-y-4">
                    {/* Title Input */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <label className="text-sm font-semibold text-slate-900">Title</label>
                        </div>
                        <input
                            type="text"
                            name="title"
                            placeholder="An interesting title for your blog"
                            value={data.title}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Categories Multi-Select */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Tags className="w-4 h-4 text-blue-600" />
                                <label className="text-sm font-semibold text-slate-900">Categories</label>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowNewCategory(!showNewCategory)}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                <Plus className="w-3 h-3" />
                                New Category
                            </button>
                        </div>

                        {/* New Category Input */}
                        {showNewCategory && (
                            <div className="mb-3 p-3 bg-slate-50 rounded-md border border-slate-200">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Category name..."
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleCreateNewCategory}
                                        className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowNewCategory(false);
                                            setNewCategoryName("");
                                        }}
                                        className="px-3 py-1.5 bg-slate-100 border border-slate-300 rounded text-sm hover:bg-slate-200 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Category Pills */}
                        {isLoadingCategories ? (
                            <div className="text-sm text-slate-600">Loading categories...</div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {categories.length === 0 ? (
                                    <p className="text-sm text-slate-500">No categories available. Create one!</p>
                                ) : (
                                    categories.map((category) => (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() => toggleCategory(category.id)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${data.categoryIds.includes(category.id)
                                                ? "bg-blue-600 text-white"
                                                : "bg-slate-100 text-slate-700 border border-slate-300 hover:border-blue-500"
                                                }`}
                                        >
                                            {category.name}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Rich Text Editor */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <label className="text-sm font-semibold text-slate-900">Content</label>
                        </div>

                        {/* Toolbar */}
                        <div className="flex flex-wrap gap-1 p-2 bg-slate-50 border border-slate-300 rounded-t-md">
                            <button
                                type="button"
                                onClick={() => applyFormat('bold')}
                                className="p-2 hover:bg-slate-200 rounded transition-colors"
                                title="Bold"
                            >
                                <Bold className="w-4 h-4 text-slate-700" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('italic')}
                                className="p-2 hover:bg-slate-200 rounded transition-colors"
                                title="Italic"
                            >
                                <Italic className="w-4 h-4 text-slate-700" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('underline')}
                                className="p-2 hover:bg-slate-200 rounded transition-colors"
                                title="Underline"
                            >
                                <Underline className="w-4 h-4 text-slate-700" />
                            </button>
                            <div className="w-px bg-slate-300 mx-1"></div>
                            <button
                                type="button"
                                onClick={() => applyFormat('insertUnorderedList')}
                                className="p-2 hover:bg-slate-200 rounded transition-colors"
                                title="Bullet List"
                            >
                                <List className="w-4 h-4 text-slate-700" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('insertOrderedList')}
                                className="p-2 hover:bg-slate-200 rounded transition-colors"
                                title="Numbered List"
                            >
                                <ListOrdered className="w-4 h-4 text-slate-700" />
                            </button>
                            <div className="w-px bg-slate-300 mx-1"></div>
                            <button
                                type="button"
                                onClick={insertLink}
                                className="p-2 hover:bg-slate-200 rounded transition-colors"
                                title="Insert Link"
                            >
                                <Link className="w-4 h-4 text-slate-700" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('formatBlock', 'blockquote')}
                                className="p-2 hover:bg-slate-200 rounded transition-colors"
                                title="Quote"
                            >
                                <Quote className="w-4 h-4 text-slate-700" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('formatBlock', 'pre')}
                                className="p-2 hover:bg-slate-200 rounded transition-colors"
                                title="Code Block"
                            >
                                <Code className="w-4 h-4 text-slate-700" />
                            </button>
                            <div className="w-px bg-slate-300 mx-1"></div>
                            <select
                                onChange={(e) => applyFormat('formatBlock', e.target.value)}
                                className="px-2 py-1 text-sm bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                                defaultValue=""
                            >
                                <option value="">Paragraph</option>
                                <option value="h1">Heading 1</option>
                                <option value="h2">Heading 2</option>
                                <option value="h3">Heading 3</option>
                                <option value="h4">Heading 4</option>
                            </select>
                        </div>

                        {/* Editor Area */}
                        <div
                            ref={editorRef}
                            contentEditable
                            onInput={handleEditorInput}
                            className="min-h-[300px] max-h-[500px] overflow-y-auto px-4 py-3 bg-white border border-slate-300 border-t-0 rounded-b-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all prose prose-slate max-w-none"
                            style={{
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word'
                            }}
                            placeholder="Write your content here..."
                        />
                        <style>{`
                            [contenteditable]:empty:before {
                                content: attr(placeholder);
                                color: #94a3b8;
                                pointer-events: none;
                                display: block;
                            }
                            [contenteditable] h1 {
                                font-size: 2em;
                                font-weight: bold;
                                margin: 0.67em 0;
                            }
                            [contenteditable] h2 {
                                font-size: 1.5em;
                                font-weight: bold;
                                margin: 0.75em 0;
                            }
                            [contenteditable] h3 {
                                font-size: 1.17em;
                                font-weight: bold;
                                margin: 0.83em 0;
                            }
                            [contenteditable] h4 {
                                font-size: 1em;
                                font-weight: bold;
                                margin: 1em 0;
                            }
                            [contenteditable] blockquote {
                                border-left: 4px solid #cbd5e1;
                                padding-left: 1em;
                                margin: 1em 0;
                                color: #475569;
                                font-style: italic;
                            }
                            [contenteditable] pre {
                                background-color: #f1f5f9;
                                padding: 1em;
                                border-radius: 0.375rem;
                                overflow-x: auto;
                                font-family: monospace;
                                margin: 1em 0;
                            }
                            [contenteditable] ul, [contenteditable] ol {
                                margin: 1em 0;
                                padding-left: 2em;
                            }
                            [contenteditable] a {
                                color: #2563eb;
                                text-decoration: underline;
                            }
                            [contenteditable] strong {
                                font-weight: bold;
                            }
                            [contenteditable] em {
                                font-style: italic;
                            }
                            [contenteditable] u {
                                text-decoration: underline;
                            }
                        `}</style>
                    </div>

                    {/* Image Upload */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <LinkIcon className="w-4 h-4 text-blue-600" />
                            <label className="text-sm font-semibold text-slate-900">Featured Image URL</label>
                        </div>
                        <input
                            type="url"
                            name="imageUrl"
                            placeholder="https://example.com/image.jpg"
                            value={data.imageUrl}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            Tip: Right-click an image on the web → "Copy image address" and paste here
                        </p>
                        {data.imageUrl && (
                            <div className="mt-3">
                                <p className="text-xs text-slate-600 mb-2">Preview:</p>
                                <img
                                    src={data.imageUrl}
                                    alt="Preview"
                                    className="max-w-full h-auto max-h-48 rounded-lg border border-slate-200"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                    }}
                                />
                                <p className="text-xs text-red-600 mt-2" style={{ display: 'none' }}>
                                    ⚠️ Failed to load image. Please check the URL.
                                </p>
                            </div>
                        )}
                    </div>
                    {/* Author Input */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-blue-600" />
                            <label className="text-sm font-semibold text-slate-900">Author</label>
                        </div>
                        <input
                            type="text"
                            name="author"
                            placeholder="Your name"
                            value={data.author}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClear}
                            disabled={isSubmitting}
                            className="px-6 py-2.5 rounded-full text-sm font-semibold text-slate-700 bg-white border border-slate-300 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-blue-600 flex items-center gap-2 transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-4 h-4" />
                            {isSubmitting ? "Posting..." : "Post"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BlogForm;