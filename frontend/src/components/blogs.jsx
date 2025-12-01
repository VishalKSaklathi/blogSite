import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useLocation } from "react-router-dom";
import SearchBar from './search-bar';
import blogService from "../services/blogServices";
import { Card, CardDescription, CardTitle } from './ui/card';
import { Clock, User, ArrowRight, Tag } from 'lucide-react';

function Blogs() {
    const { categorySlug } = useParams();
    const location = useLocation();
    const categoryIdFromState = location.state?.categoryId;

    const [blogs, setBlogs] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [offset, setOffset] = useState(0);
    const limit = 20;

    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [initialLoadDone, setInitialLoadDone] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);

    const activeCategoryId = categoryIdFromState;

    const fetchBlogs = useCallback(async (currentOffset, isInitialLoad = false) => {
        if (isLoading) return;
        if (!isInitialLoad && !hasMore) return;

        setIsLoading(true);

        try {
            let res;

            if (activeCategoryId) {
                res = await blogService.getBlogsByCategory(activeCategoryId, {
                    limit,
                    offset: currentOffset
                });
            } else {
                res = await blogService.getAllBlogs({
                    limit,
                    offset: currentOffset
                });
            }

            if (res && Array.isArray(res.data)) {
                if (res.data.length < limit) {
                    setHasMore(false);
                }

                if (res.data.length > 0) {
                    if (isInitialLoad) {
                        setBlogs(res.data);
                    } else {
                        setBlogs(prev => {
                            const existingIds = new Set(prev.map(blog => blog.id));
                            const newBlogs = res.data.filter(blog => !existingIds.has(blog.id));
                            return [...prev, ...newBlogs];
                        });
                    }
                    setOffset(currentOffset + limit);
                } else if (isInitialLoad) {
                    setBlogs([]);
                    setHasMore(false);
                }
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
            if (isInitialLoad) {
                setBlogs([]);
                setHasMore(false);
            }
        } finally {
            setIsLoading(false);
            if (isInitialLoad) {
                setInitialLoadDone(true);
            }
        }
    }, [activeCategoryId, limit, hasMore, isLoading]);

    const fetchCategoryDetails = useCallback(async () => {
        if (!activeCategoryId) {
            setCurrentCategory(location.state?.categoryName ? {
                name: location.state.categoryName
            } : null);
            return;
        }

        try {
            const res = await blogService.getCategoryById?.(activeCategoryId);
            setCurrentCategory(res?.data || res);
        } catch (error) {
            console.error("Error fetching category:", error);
            setCurrentCategory(location.state?.categoryName ? {
                name: location.state.categoryName
            } : null);
        }
    }, [activeCategoryId, location.state]);

    useEffect(() => {
        setBlogs([]);
        setOffset(0);
        setHasMore(true);
        setInitialLoadDone(false);
        setIsLoading(false);

        fetchCategoryDetails();
        fetchBlogs(0, true);
    }, [categorySlug, activeCategoryId]);

    useEffect(() => {
        const handleScroll = () => {
            const scrolledToBottom =
                window.innerHeight + window.scrollY >= document.body.scrollHeight - 200;

            if (scrolledToBottom && !isLoading && hasMore && initialLoadDone) {
                fetchBlogs(offset, false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [offset, isLoading, hasMore, initialLoadDone, fetchBlogs]);

    const getPreview = (htmlContent) => {
        const text = htmlContent.replace(/<[^>]+>/g, "");
        return text.length > 200 ? text.substring(0, 200) + "..." : text;
    };

    const highlightText = (text, query) => {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, "gi");
        return text.replace(regex, '<mark class="bg-yellow-200 text-foreground">$1</mark>');
    };

    const isInitialLoading = !initialLoadDone && isLoading;
    const isPaginationLoading = initialLoadDone && isLoading && blogs.length > 0;
    const isEmpty = initialLoadDone && blogs.length === 0 && !isLoading;

    return (
        <div className="min-h-screen bg-background">
            {/* Header Section - Mobile Responsive */}
            <div className="bg-gradient-to-r from-primary to-accent py-6 sm:py-8 md:py-12 px-3 sm:px-4 mb-6 sm:mb-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground mb-1 sm:mb-2">
                                {currentCategory
                                    ? `${currentCategory.name} Stories`
                                    : 'Discover Stories'
                                }
                            </h1>
                            <p className="text-primary-foreground/90 text-sm sm:text-base md:text-lg">
                                {currentCategory
                                    ? `Explore ${currentCategory.name.toLowerCase()} insights and perspectives`
                                    : 'Explore insights, ideas, and perspectives from our community'
                                }
                            </p>
                        </div>

                        {/* Category Badge - Mobile Responsive */}
                        {currentCategory && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <Link
                                    to="/blogs"
                                    className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-primary-foreground px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors"
                                >
                                    ← Back to All
                                </Link>
                                <div className="inline-flex items-center gap-2 bg-white/20 text-primary-foreground px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                                    <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                                    {currentCategory.name}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-6xl mx-auto px-3 sm:px-4 mb-6 sm:mb-8">
                <SearchBar
                    data={blogs}
                    onSearch={() => { }}
                    onQueryChange={setSearchQuery}
                />
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-8 sm:pb-12">
                {/* Initial Loading State */}
                {isInitialLoading && (
                    <div className="w-full text-center py-16 sm:py-24 md:py-32">
                        <div className="inline-flex flex-col items-center gap-3 sm:gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-secondary rounded-full"></div>
                                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                            </div>
                            <h2 className="text-lg sm:text-xl font-semibold text-foreground px-4 text-center">
                                {currentCategory
                                    ? `Loading ${currentCategory.name} stories...`
                                    : 'Loading stories...'
                                }
                            </h2>
                            <p className="text-sm sm:text-base text-muted-foreground">Please wait while we fetch the content</p>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {isEmpty && (
                    <div className="text-center py-12 sm:py-16">
                        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 md:p-12 max-w-md mx-auto">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                                {currentCategory ? `No ${currentCategory.name} blogs yet` : 'No blogs yet'}
                            </h3>
                            <p className="text-sm sm:text-base text-muted-foreground">
                                {currentCategory
                                    ? `Be the first to share a ${currentCategory.name.toLowerCase()} story`
                                    : 'Be the first to share your story with the community'
                                }
                            </p>
                        </div>
                    </div>
                )}

                {/* Blog Grid - Mobile Responsive */}
                {!isInitialLoading && blogs.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {blogs.map((blog) => (
                            <Link
                                to={`/blogs/${blog.id}`}
                                key={blog.id}
                                className="group"
                            >
                                <Card className="h-full p-4 sm:p-6 bg-card border border-border rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 hover:border-primary/50">
                                    {/* Blog Image */}
                                    {blog.image && (
                                        <div className="mb-3 sm:mb-4 rounded-lg overflow-hidden">
                                            <img
                                                src={blog.image}
                                                alt={blog.title}
                                                className="w-full h-40 sm:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                    )}

                                    {/* Blog Title */}
                                    <CardTitle
                                        className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-200"
                                        dangerouslySetInnerHTML={{
                                            __html: highlightText(blog.title, searchQuery)
                                        }}
                                    />

                                    {/* Blog Preview */}
                                    <CardDescription
                                        className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-3"
                                        dangerouslySetInnerHTML={{
                                            __html: getPreview(blog.content)
                                        }}
                                    />

                                    {/* Blog Meta */}
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-3 sm:pt-4 border-t border-border">
                                        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                                            {blog.author && (
                                                <div className="flex items-center gap-1">
                                                    <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                    <span className="truncate max-w-[80px] sm:max-w-none">{blog.author}</span>
                                                </div>
                                            )}
                                            {blog.createdAt && (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                    <span className="whitespace-nowrap">{new Date(blog.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Read More Arrow */}
                                        <ArrowRight className="w-4 h-4 text-primary transition-transform duration-200 group-hover:translate-x-1 flex-shrink-0" />
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination Loading */}
                {isPaginationLoading && (
                    <div className="w-full text-center py-8 sm:py-12">
                        <div className="inline-flex flex-col items-center gap-2 sm:gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-secondary rounded-full"></div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                            </div>
                            <p className="text-sm sm:text-base text-muted-foreground font-medium">Loading more stories...</p>
                        </div>
                    </div>
                )}

                {/* End of List Message */}
                {!hasMore && blogs.length > 0 && !isLoading && (
                    <div className="text-center py-6 sm:py-8">
                        <div className="inline-block bg-secondary rounded-full px-4 sm:px-6 py-2 sm:py-3">
                            <p className="text-sm sm:text-base text-muted-foreground font-medium">
                                You've reached the end!
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Blogs;