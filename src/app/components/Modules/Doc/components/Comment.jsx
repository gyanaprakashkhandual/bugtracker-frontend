"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTestType } from "@/app/script/TestType.context";
import { useDoc } from "@/app/script/Doc.context";

const CommentComponent = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [newComment, setNewComment] = useState({
        text: "",
        startIndex: 0,
        endIndex: 0,
    });
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [activeMenu, setActiveMenu] = useState(null);

    // Get context values - Replace these with your actual context hooks
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

        try {
            const response = await fetch(
                `${baseURL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/comments`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newComment),
                }
            );
            const data = await response.json();
            if (response.ok) {
                setComments(data.comments || []);
                setNewComment({ text: "", startIndex: 0, endIndex: 0 });
                setShowCommentForm(false);
            }
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const handleReply = async (commentId) => {
        if (!replyText.trim()) return;

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

    const MessageSquareIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    );

    const SendIcon = () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
    );

    const ReplyIcon = () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
    );

    const CheckCircleIcon = () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );

    const TrashIcon = () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    );

    const MoreIcon = () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
    );

    const ClockIcon = () => (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <div className="text-blue-600">
                            <MessageSquareIcon />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            Comments
                            {comments.length > 0 && (
                                <span className="ml-2 text-sm font-normal text-gray-500">
                                    ({comments.length})
                                </span>
                            )}
                        </h2>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCommentForm(!showCommentForm)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Add Comment
                    </motion.button>
                </div>

                {/* Add Comment Form */}
                <AnimatePresence>
                    {showCommentForm && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-b border-gray-200 overflow-hidden"
                        >
                            <div className="p-4 space-y-3">
                                <textarea
                                    value={newComment.text}
                                    onChange={(e) =>
                                        setNewComment({ ...newComment, text: e.target.value })
                                    }
                                    placeholder="Write your comment..."
                                    className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows="3"
                                />
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className="flex gap-2 flex-1 min-w-[140px]">
                                        <input
                                            type="number"
                                            value={newComment.startIndex}
                                            onChange={(e) =>
                                                setNewComment({
                                                    ...newComment,
                                                    startIndex: parseInt(e.target.value) || 0,
                                                })
                                            }
                                            placeholder="Start"
                                            className="w-20 px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="number"
                                            value={newComment.endIndex}
                                            onChange={(e) =>
                                                setNewComment({
                                                    ...newComment,
                                                    endIndex: parseInt(e.target.value) || 0,
                                                })
                                            }
                                            placeholder="End"
                                            className="w-20 px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowCommentForm(false)}
                                            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleAddComment}
                                            className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                                        >
                                            <SendIcon />
                                            Post
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Comments List */}
                <div className="divide-y divide-gray-200">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            Loading comments...
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            No comments yet. Be the first to comment!
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
                                    className="p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                                                {comment.user?.name?.[0]?.toUpperCase() || "U"}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {comment.user?.name || "Unknown User"}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                        <p className="text-xs text-gray-500">
                                                            {comment.user?.email}
                                                        </p>
                                                        <span className="text-gray-300">·</span>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                            <ClockIcon />
                                                            {formatDate(comment.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="relative">
                                                    <button
                                                        onClick={() =>
                                                            setActiveMenu(
                                                                activeMenu === comment._id ? null : comment._id
                                                            )
                                                        }
                                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                    >
                                                        <MoreIcon />
                                                    </button>
                                                    <AnimatePresence>
                                                        {activeMenu === comment._id && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.95 }}
                                                                className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                                                            >
                                                                {!comment.resolved && (
                                                                    <button
                                                                        onClick={() => handleResolve(comment._id)}
                                                                        className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                                    >
                                                                        <CheckCircleIcon />
                                                                        Resolve
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleDelete(comment._id)}
                                                                    className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                                >
                                                                    <TrashIcon />
                                                                    Delete
                                                                </button>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>

                                            <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                                                {comment.text}
                                            </p>

                                            {comment.startIndex !== undefined && comment.endIndex !== undefined && (
                                                <div className="mt-2 inline-flex items-center gap-2 text-xs text-gray-500">
                                                    <span className="px-2 py-0.5 bg-gray-100 rounded">
                                                        Position: {comment.startIndex} - {comment.endIndex}
                                                    </span>
                                                </div>
                                            )}

                                            {comment.resolved && (
                                                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded text-xs ml-2">
                                                    <CheckCircleIcon />
                                                    Resolved
                                                </div>
                                            )}

                                            {/* Replies */}
                                            {comment.replies && comment.replies.length > 0 && (
                                                <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-200">
                                                    {comment.replies.map((reply) => (
                                                        <div key={reply._id} className="flex gap-2">
                                                            <div className="flex-shrink-0">
                                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-xs font-semibold">
                                                                    {reply.user?.name?.[0]?.toUpperCase() || "U"}
                                                                </div>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-xs font-medium text-gray-900">
                                                                    {reply.user?.name || "Unknown User"}
                                                                </p>
                                                                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                                                    {reply.text}
                                                                </p>
                                                                <p className="text-xs text-gray-400 mt-1">
                                                                    {formatDate(reply.createdAt)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Reply Button & Form */}
                                            {!comment.resolved && (
                                                <div className="mt-3">
                                                    {replyingTo === comment._id ? (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="space-y-2"
                                                        >
                                                            <textarea
                                                                value={replyText}
                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                placeholder="Write a reply..."
                                                                className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                                                rows="2"
                                                            />
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setReplyingTo(null);
                                                                        setReplyText("");
                                                                    }}
                                                                    className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReply(comment._id)}
                                                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                                                                >
                                                                    <SendIcon />
                                                                    Reply
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setReplyingTo(comment._id)}
                                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                                        >
                                                            <ReplyIcon />
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

export default CommentComponent