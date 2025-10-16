'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Trash2, XCircle, X, Send, Edit2, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTestType } from '@/app/script/TestType.context';

const BugKanbanView = () => {
    const [bugs, setBugs] = useState([]);
    const [selectedBug, setSelectedBug] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedBug, setEditedBug] = useState(null);
    const [draggedBug, setDraggedBug] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragOverColumn, setDragOverColumn] = useState(null);

    const projectId = typeof window !== 'undefined' ? localStorage.getItem("currentProjectId") : null;
    const { testTypeId } = useTestType();
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

    const BASE_BUG_URL = 'http://localhost:5000/api/v1/bug';
    const BASE_COMMENT_URL = 'http://localhost:5000/api/v1/comment';

    const statuses = ['New', 'Open', 'In Progress', 'In Review', 'Closed', 'Re Open'];

    const statusColors = {
        'New': 'bg-blue-50 border-blue-200',
        'Open': 'bg-yellow-50 border-yellow-200',
        'In Progress': 'bg-purple-50 border-purple-200',
        'In Review': 'bg-orange-50 border-orange-200',
        'Closed': 'bg-green-50 border-green-200',
        'Re Open': 'bg-red-50 border-red-200'
    };

    const statusBadgeColors = {
        'New': 'bg-blue-100 text-blue-700',
        'Open': 'bg-yellow-100 text-yellow-700',
        'In Progress': 'bg-purple-100 text-purple-700',
        'In Review': 'bg-orange-100 text-orange-700',
        'Closed': 'bg-green-100 text-green-700',
        'Re Open': 'bg-red-100 text-red-700'
    };

    useEffect(() => {
        if (projectId && testTypeId && token) {
            fetchBugs();
        }
    }, [projectId, testTypeId, token]);

    const fetchBugs = async () => {
        try {
            const response = await fetch(
                `${BASE_BUG_URL}/projects/${projectId}/test-types/${testTypeId}/bugs`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const data = await response.json();
            if (response.ok) {
                setBugs(data.bugs || []);
            }
        } catch (error) {
            console.error('Error fetching bugs:', error);
        }
    };

    const fetchComments = async (bugId) => {
        try {
            const response = await fetch(
                `${BASE_COMMENT_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/${bugId}/comments`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const data = await response.json();
            if (response.ok) {
                setComments(data.comments || []);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleViewBug = async (bug) => {
        setSelectedBug(bug);
        setEditedBug({ ...bug });
        setIsModalOpen(true);
        setIsEditMode(false);
        await fetchComments(bug._id);
    };

    const handleUpdateBug = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_BUG_URL}/bugs/${selectedBug._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editedBug)
            });
            const data = await response.json();
            if (response.ok) {
                setSelectedBug(data.bug);
                setIsEditMode(false);
                fetchBugs();
            }
        } catch (error) {
            console.error('Error updating bug:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMoveBugToTrash = async (bugId) => {
        try {
            const response = await fetch(
                `${BASE_BUG_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/${bugId}/trash`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            if (response.ok) {
                fetchBugs();
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Error moving bug to trash:', error);
        }
    };

    const handleDeleteBugPermanently = async (bugId) => {
        if (!confirm('Are you sure you want to permanently delete this bug?')) return;

        try {
            const response = await fetch(
                `${BASE_BUG_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/${bugId}/permanent`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            if (response.ok) {
                fetchBugs();
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Error deleting bug permanently:', error);
        }
    };

    const handlePostComment = async () => {
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(
                `${BASE_COMMENT_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/${selectedBug._id}/comments`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        comment: newComment,
                        bugId: selectedBug._id
                    })
                }
            );
            if (response.ok) {
                setNewComment('');
                await fetchComments(selectedBug._id);
            }
        } catch (error) {
            console.error('Error posting comment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (e, bug) => {
        setDraggedBug(bug);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.style.opacity = '0.4';
    };

    const handleDragEnd = (e) => {
        e.currentTarget.style.opacity = '1';
        setDragOverColumn(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragEnter = (status) => {
        setDragOverColumn(status);
    };

    const handleDragLeave = (e) => {
        if (e.currentTarget === e.target) {
            setDragOverColumn(null);
        }
    };

    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        setDragOverColumn(null);

        if (!draggedBug || draggedBug.status === newStatus) {
            setDraggedBug(null);
            return;
        }

        try {
            const response = await fetch(`${BASE_BUG_URL}/bugs/${draggedBug._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...draggedBug,
                    status: newStatus
                })
            });

            if (response.ok) {
                fetchBugs();
            }
        } catch (error) {
            console.error('Error updating bug status:', error);
        } finally {
            setDraggedBug(null);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getBugsByStatus = (status) => {
        return bugs.filter(bug => bug.status === status);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="flex gap-3 overflow-x-auto pb-4">
                {statuses.map((status) => (
                    <motion.div
                        key={status}
                        className={`flex-shrink-0 w-72 ${statusColors[status]} border rounded-lg p-3 transition-all duration-300 ${dragOverColumn === status ? 'ring-2 ring-blue-400 ring-offset-2 shadow-lg scale-[1.02]' : ''
                            }`}
                        onDragOver={handleDragOver}
                        onDragEnter={() => handleDragEnter(status)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, status)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                {status}
                            </h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadgeColors[status]} font-medium`}>
                                {getBugsByStatus(status).length}
                            </span>
                        </div>

                        <div className="space-y-2 max-h-[calc(100vh-180px)] overflow-y-auto">
                            <AnimatePresence>
                                {getBugsByStatus(status).map((bug) => (
                                    <motion.div
                                        key={bug._id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, bug)}
                                        onDragEnd={handleDragEnd}
                                        className={`bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-all duration-200 ${draggedBug?._id === bug._id ? 'opacity-40 rotate-2 scale-95' : ''
                                            }`}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95, rotate: 5 }}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileDrag={{ scale: 1.05, rotate: 3, cursor: 'grabbing' }}
                                        layout
                                        transition={{
                                            layout: { duration: 0.3, ease: "easeInOut" },
                                            default: { duration: 0.2 }
                                        }}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="text-xs font-mono text-gray-500">{bug.serialNumber}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded ${bug.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                                                    bug.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                                                        bug.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-green-100 text-green-700'
                                                }`}>
                                                {bug.priority}
                                            </span>
                                        </div>

                                        <p className="text-xs text-gray-700 mb-2 line-clamp-2 leading-relaxed">
                                            {bug.bugDesc}
                                        </p>

                                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                            <span className="text-xs text-gray-500">{bug.moduleName}</span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewBug(bug)}
                                                    className="p-1 hover:bg-blue-50 rounded transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                                                </button>
                                                <button
                                                    onClick={() => handleMoveBugToTrash(bug._id)}
                                                    className="p-1 hover:bg-yellow-50 rounded transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 text-yellow-600" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBugPermanently(bug._id)}
                                                    className="p-1 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <XCircle className="w-3.5 h-3.5 text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && selectedBug && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-4 border-b">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-sm font-semibold text-gray-800">{selectedBug.serialNumber}</h2>
                                    <span className={`text-xs px-2 py-1 rounded ${statusBadgeColors[selectedBug.status]}`}>
                                        {selectedBug.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isEditMode ? (
                                        <button
                                            onClick={handleUpdateBug}
                                            disabled={loading}
                                            className="p-1.5 hover:bg-green-50 rounded transition-colors"
                                        >
                                            <Save className="w-4 h-4 text-green-600" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setIsEditMode(true)}
                                            className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4 text-blue-600" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                                    >
                                        <X className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
                                <div className="p-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-600 block mb-1">Module</label>
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={editedBug.moduleName}
                                                    onChange={(e) => setEditedBug({ ...editedBug, moduleName: e.target.value })}
                                                    className="w-full text-xs px-2 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <p className="text-xs text-gray-800">{selectedBug.moduleName}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-gray-600 block mb-1">Bug Type</label>
                                            {isEditMode ? (
                                                <select
                                                    value={editedBug.bugType}
                                                    onChange={(e) => setEditedBug({ ...editedBug, bugType: e.target.value })}
                                                    className="w-full text-xs px-2 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                >
                                                    <option>Functional</option>
                                                    <option>User-Interface</option>
                                                    <option>Security</option>
                                                    <option>Database</option>
                                                    <option>Performance</option>
                                                </select>
                                            ) : (
                                                <p className="text-xs text-gray-800">{selectedBug.bugType}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-gray-600 block mb-1">Priority</label>
                                            {isEditMode ? (
                                                <select
                                                    value={editedBug.priority}
                                                    onChange={(e) => setEditedBug({ ...editedBug, priority: e.target.value })}
                                                    className="w-full text-xs px-2 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                >
                                                    <option>Critical</option>
                                                    <option>High</option>
                                                    <option>Medium</option>
                                                    <option>Low</option>
                                                </select>
                                            ) : (
                                                <p className="text-xs text-gray-800">{selectedBug.priority}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-gray-600 block mb-1">Severity</label>
                                            {isEditMode ? (
                                                <select
                                                    value={editedBug.severity}
                                                    onChange={(e) => setEditedBug({ ...editedBug, severity: e.target.value })}
                                                    className="w-full text-xs px-2 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                >
                                                    <option>Critical</option>
                                                    <option>High</option>
                                                    <option>Medium</option>
                                                    <option>Low</option>
                                                </select>
                                            ) : (
                                                <p className="text-xs text-gray-800">{selectedBug.severity}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
                                        {isEditMode ? (
                                            <textarea
                                                value={editedBug.bugDesc}
                                                onChange={(e) => setEditedBug({ ...editedBug, bugDesc: e.target.value })}
                                                rows={3}
                                                className="w-full text-xs px-2 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <p className="text-xs text-gray-700 leading-relaxed">{selectedBug.bugDesc}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-gray-600 block mb-1">Requirement</label>
                                        {isEditMode ? (
                                            <textarea
                                                value={editedBug.bugRequirement}
                                                onChange={(e) => setEditedBug({ ...editedBug, bugRequirement: e.target.value })}
                                                rows={3}
                                                className="w-full text-xs px-2 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <p className="text-xs text-gray-700 leading-relaxed">{selectedBug.bugRequirement}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                                        <div>
                                            <span className="text-xs font-medium text-gray-600">Created: </span>
                                            <span className="text-xs text-gray-700">{formatDate(selectedBug.createdAt)}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs font-medium text-gray-600">Updated: </span>
                                            <span className="text-xs text-gray-700">{formatDate(selectedBug.updatedAt)}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <h3 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            Comments ({comments.length})
                                        </h3>

                                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                            {comments.map((comment) => (
                                                <div key={comment._id} className="bg-gray-50 rounded-lg p-3">
                                                    <div className="flex items-start justify-between mb-1">
                                                        <span className="text-xs font-medium text-gray-700">{comment.commentBy}</span>
                                                        <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-700 leading-relaxed">{comment.comment}</p>
                                                </div>
                                            ))}
                                            {comments.length === 0 && (
                                                <p className="text-xs text-gray-500 text-center py-4">No comments yet</p>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Write a comment..."
                                                className="flex-1 text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                onKeyPress={(e) => e.key === 'Enter' && handlePostComment()}
                                            />
                                            <button
                                                onClick={handlePostComment}
                                                disabled={loading || !newComment.trim()}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Send className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BugKanbanView;