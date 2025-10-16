"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Reply, CheckCircle, Trash2, MoreVertical, Clock, Loader2 } from "lucide-react";
import { useTestType } from "@/app/script/TestType.context";
import { useDoc } from "@/app/script/Doc.context";

const CommentComponent = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [newComment, setNewComment] = useState({ text: "" });
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [activeMenu, setActiveMenu] = useState(null);
    const [postingComment, setPostingComment] = useState(false);
    const [postingReply, setPostingReply] = useState(false);

    const modalRef = useRef(null);
    const replyModalRef = useRef(null);

    const { docId } = useDoc();
    const { testTypeId } = useTestType();

    const projectId =
        typeof window !== "undefined"
            ? localStorage.getItem("currentProjectId")
            : null;
    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const baseURL = "http://localhost:5000/api/v1/doc";

    useEffect(() => {
        if (projectId && testTypeId && docId) {
            fetchComments();
        }
    }, [projectId, testTypeId, docId]);

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setShowCommentModal(false);
            }
            if (replyModalRef.current && !replyModalRef.current.contains(event.target)) {
                setReplyingTo(null);
                setReplyText("");
            }
            if (activeMenu && !event.target.closest('.menu-container')) {
                setActiveMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeMenu]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `${baseURL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/comments`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            const data = await response.json();
            if (response.ok) {
                setComments(data.comments || []);
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.text.trim()) return;

        const commentPayload = {
            text: newComment.text,
            startIndex: newComment.startIndex || 0,
            endIndex: newComment.endIndex || 0,
        };

        setPostingComment(true);
        try {
            const url = `${baseURL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/comments`;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(commentPayload),
            });

            const data = await response.json();

            if (response.ok) {
                setComments(data.comments || []);
                setNewComment({ text: "" });
                setShowCommentModal(false);
            } else {
                console.error("Server responded with error:", response.status, data.message);
            }
        } catch (error) {
            console.error("Error adding comment:", error);
        } finally {
            setPostingComment(false);
        }
    };


    const handleReply = async (commentId) => {
        if (!replyText.trim()) return;

        setPostingReply(true);
        try {
            const response = await fetch(
                `${baseURL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/comments/${commentId}/reply`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ text: replyText }),
                }
            );
            if (response.ok) {
                fetchComments();
                setReplyingTo(null);
                setReplyText("");
            }
        } catch (error) {
            console.error("Error adding reply:", error);
        } finally {
            setPostingReply(false);
        }
    };

    const handleResolve = async (commentId) => {
        try {
            const response = await fetch(
                `${baseURL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/comments/${commentId}/resolve`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.ok) {
                fetchComments();
                setActiveMenu(null);
            }
        } catch (error) {
            console.error("Error resolving comment:", error);
        }
    };

    const handleDelete = async (commentId) => {
        try {
            const response = await fetch(
                `${baseURL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/comments/${commentId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.ok) {
                fetchComments();
                setActiveMenu(null);
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return d.toLocaleDateString();
    };

    // Skeleton Loader
    const SkeletonLoader = () => (
        <div className="divide-y divide-gray-200">
            {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 animate-pulse">
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                        <div className="flex-1 space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                            <div className="h-3 bg-gray-200 rounded w-48"></div>
                            <div className="space-y-2">
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Comments</h2>
                            {comments.length > 0 && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowCommentModal(!showCommentModal)}
                            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                        >
                            + Add Comment
                        </motion.button>

                        {/* Add Comment Modal */}
                        <AnimatePresence>
                            {showCommentModal && (
                                <motion.div
                                    ref={modalRef}
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
                                >
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                                        <h3 className="text-sm font-semibold text-gray-800">New Comment</h3>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <textarea
                                            value={newComment.text}
                                            onChange={(e) => setNewComment({ text: e.target.value })}
                                            placeholder="Share your thoughts..."
                                            className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:outline-none focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                                            rows="4"
                                            autoFocus
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => {
                                                    setShowCommentModal(false);
                                                    setNewComment({ text: "" });
                                                }}
                                                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAddComment}
                                                disabled={postingComment || !newComment.text.trim()}
                                                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg min-w-[90px] justify-center"
                                            >
                                                {postingComment ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Send className="w-4 h-4" />
                                                )}
                                                {postingComment ? "Posting..." : "Post"}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Comments List */}
                <div className="divide-y divide-gray-100">
                    {loading ? (
                        <SkeletonLoader />
                    ) : comments.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                <MessageSquare className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-sm font-medium">No comments yet</p>
                            <p className="text-gray-400 text-xs mt-1">Be the first to share your thoughts!</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {comments.map((comment, index) => (
                                <motion.div
                                    key={comment._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-5 hover:bg-gray-50 transition-all group"
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                                                {comment.user?.name?.[0]?.toUpperCase() || "U"}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {comment.user?.name || "Unknown User"}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                        <p className="text-xs text-gray-500">
                                                            {comment.user?.email}
                                                        </p>
                                                        <span className="text-gray-300">•</span>
                                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {formatDate(comment.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="relative menu-container">
                                                    <button
                                                        onClick={() => setActiveMenu(activeMenu === comment._id ? null : comment._id)}
                                                        className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                    <AnimatePresence>
                                                        {activeMenu === comment._id && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                                                className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-10"
                                                            >
                                                                {!comment.resolved && (
                                                                    <button
                                                                        onClick={() => handleResolve(comment._id)}
                                                                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-green-50 flex items-center gap-2 transition-colors"
                                                                    >
                                                                        <CheckCircle className="w-4 h-4" />
                                                                        Resolve
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleDelete(comment._id)}
                                                                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    Delete
                                                                </button>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>

                                            <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                                                {comment.text}
                                            </p>

                                            {comment.resolved && (
                                                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Resolved
                                                </div>
                                            )}

                                            {/* Replies */}
                                            {comment.replies && comment.replies.length > 0 && (
                                                <div className="mt-4 space-y-3 pl-4 border-l-2 border-indigo-200">
                                                    {comment.replies.map((reply) => (
                                                        <div key={reply._id} className="flex gap-2">
                                                            <div className="flex-shrink-0">
                                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow">
                                                                    {reply.user?.name?.[0]?.toUpperCase() || "U"}
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 bg-gray-50 rounded-lg p-3">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-xs font-semibold text-gray-900">
                                                                        {reply.user?.name || "Unknown User"}
                                                                    </p>
                                                                    <p className="text-xs text-gray-400">
                                                                        {formatDate(reply.createdAt)}
                                                                    </p>
                                                                </div>
                                                                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                                                                    {reply.text}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Reply Button & Modal */}
                                            {!comment.resolved && (
                                                <div className="mt-4 relative">
                                                    {replyingTo === comment._id ? (
                                                        <motion.div
                                                            ref={replyModalRef}
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm"
                                                        >
                                                            <textarea
                                                                value={replyText}
                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                placeholder="Write your reply..."
                                                                className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none transition-all"
                                                                rows="3"
                                                                autoFocus
                                                            />
                                                            <div className="flex gap-2 mt-3 justify-end">
                                                                <button
                                                                    onClick={() => {
                                                                        setReplyingTo(null);
                                                                        setReplyText("");
                                                                    }}
                                                                    className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReply(comment._id)}
                                                                    disabled={postingReply || !replyText.trim()}
                                                                    className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md min-w-[80px] justify-center"
                                                                >
                                                                    {postingReply ? (
                                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                                    ) : (
                                                                        <Send className="w-4 h-4" />
                                                                    )}
                                                                    {postingReply ? "Sending..." : "Reply"}
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setReplyingTo(comment._id)}
                                                            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1.5 hover:gap-2 transition-all"
                                                        >
                                                            <Reply className="w-4 h-4" />
                                                            Reply
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommentComponent;