import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import blogService from "../services/blogServices";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Calendar, User } from "lucide-react";
import voteCommentService from "../services/voteCommentService";

function ViewBlog() {
    const { id } = useParams();
    const [blog, setBlog] = useState({});
    const [comment, setComment] = useState("");
    const [votes, setVotes] = useState({ up: 0, down: 0 });
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    // Fetch blog and comments initially
    useEffect(() => {
        const fetchBlogData = async () => {
            setIsLoading(true);
            try {
                const blogRes = await blogService.getBlogById(id);
                setBlog(blogRes.data);
                setVotes({
                    up: blogRes.data.upvotes || 0,
                    down: blogRes.data.downvotes || 0,
                });

                const commentRes = await voteCommentService.getComments(id);
                setComments(commentRes.data || []);
            } catch (error) {
                console.error("Error fetching blog:", error.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBlogData();
    }, [id]);

    // Handle new comment
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        try {
            const res = await voteCommentService.addComment({
                blogId: id,
                author: blog.author || "Anonymous",
                content: comment,
            });

            setComments((prev) => [res.data, ...prev]);
            setComment("");
        } catch (error) {
            console.error("Error adding comment:", error.message);
        }
    };

    // Upvote
    const handleUpvote = async () => {
        try {
            const res = await voteCommentService.upvoteBlog(id);
            setVotes((prev) => ({ ...prev, up: res.data.upvotes }));
        } catch (error) {
            console.error("Error upvoting:", error.message);
        }
    };

    // Downvote
    const handleDownvote = async () => {
        try {
            const res = await voteCommentService.downvoteBlog(id);
            setVotes((prev) => ({ ...prev, down: res.data.downvotes }));
        } catch (error) {
            console.error("Error downvoting:", error.message);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto px-6 py-10 flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading blog...</p>
                </div>
            </div>
        );
    }

    if (!blog || !blog.id) {
        return (
            <div className="max-w-5xl mx-auto px-6 py-10">
                <p className="text-center text-muted-foreground">Blog not found.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-6 py-10">
            {/* Back Link */}
            <Link
                to="/dashboard/blogs"
                className="inline-flex items-center text-primary hover:underline text-sm font-medium mb-6"
            >
                ← Back to Blogs
            </Link>

            {/* Featured Image */}
            {blog.imageUrl && !imageError && (
                <div className="mb-6 rounded-xl overflow-hidden border border-border">
                    <img
                        src={blog.imageUrl}
                        alt={blog.title}
                        className="w-full h-auto max-h-[500px] object-cover"
                        onError={() => setImageError(true)}
                    />
                </div>
            )}

            {/* Title */}
            <h1 className="text-4xl font-bold mt-4 mb-4 text-foreground">
                {blog.title}
            </h1>

            {/* Meta Information */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{blog.author || "Anonymous"}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(blog.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</span>
                </div>
            </div>

            {/* Categories */}
            {blog.categories && blog.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {blog.categories.map((category) => (
                        <span
                            key={category.id}
                            className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary"
                            style={{
                                backgroundColor: category.color ? `${category.color}20` : undefined,
                                color: category.color || undefined
                            }}
                        >
                            {category.name}
                        </span>
                    ))}
                </div>
            )}

            <Separator className="my-6" />

            {/* Blog Content */}
            <div
                className="prose prose-lg max-w-none text-justify leading-relaxed mb-8"
                dangerouslySetInnerHTML={{ __html: blog.content }}
            ></div>

            <Separator className="my-6" />

            {/* Upvote / Downvote Section */}
            <div className="flex items-center gap-4 my-6">
                <button
                    onClick={handleUpvote}
                    className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-full border border-border text-sm font-medium text-foreground hover:bg-green-50 hover:text-green-600 hover:border-green-600 transition-all"
                >
                    <ThumbsUp className="w-5 h-5" />
                    <span>{votes.up}</span>
                </button>

                <button
                    onClick={handleDownvote}
                    className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-full border border-border text-sm font-medium text-foreground hover:bg-red-50 hover:text-red-600 hover:border-red-600 transition-all"
                >
                    <ThumbsDown className="w-5 h-5" />
                    <span>{votes.down}</span>
                </button>
            </div>

            <Separator className="my-6" />

            {/* Author Section */}
            <div className="flex items-center gap-4 mb-8 p-4 rounded-lg bg-secondary/50">
                <Avatar className="w-14 h-14">
                    <AvatarFallback className="bg-secondary text-primary">
                        {blog.author ? blog.author.charAt(0).toUpperCase() : "A"}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-lg font-semibold text-foreground">
                        {blog.author || "Anonymous Author"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Posted on {new Date(blog.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
            </div>

            {/* Comment Section */}
            <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                    Comments ({comments.length})
                </h2>

                {/* Comment Form */}
                <div className="bg-card border border-border rounded-lg p-4 mb-6">
                    <form onSubmit={handleCommentSubmit} className="flex flex-col gap-3">
                        <Textarea
                            placeholder="Share your thoughts..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="min-h-[120px] bg-background"
                        />
                        <Button type="submit" className="self-end">
                            Post Comment
                        </Button>
                    </form>
                </div>

                {/* Display Comments */}
                {comments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p className="text-lg">No comments yet.</p>
                        <p className="text-sm">Be the first to share your thoughts!</p>
                    </div>
                ) : (
                    <ul className="flex flex-col gap-4">
                        {comments.map((c, i) => (
                            <li
                                key={i}
                                className="bg-card border border-border rounded-lg p-4 transition-all hover:border-primary/50"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(c.createdAt).toLocaleString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-foreground leading-relaxed">
                                            {c.content}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default ViewBlog;