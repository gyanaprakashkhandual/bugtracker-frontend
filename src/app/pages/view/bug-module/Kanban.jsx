'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Trash2, XCircle, X, Send, Edit2, Save, ChevronLeft, ChevronRight, ArchiveIcon, Trash } from 'lucide-react';
import { useTestType } from '@/app/script/TestType.context';
import { Archive, Calendar, Clock, MessageSquare, Link, ImageIcon } from 'lucide-react';
import KanbanSkeleton from '@/app/components/assets/Kanban.loader';
import { Inbox, ArrowDownToLine } from 'lucide-react';
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
    }

    if (loading) {
        return (
            <div className='max-h-[calc(100vh-69px)]'>
                <KanbanSkeleton />
            </div>
        )
    }

    return (
        <div className="max-h-[calc(100vh-69px)] p-2 kanban-scrollbar justify-center items-center">
            <div className="flex gap-3 overflow-x-auto">
                {statuses.map((status) => (
                    <motion.div
                        key={status}
                        className={`flex-shrink-0 w-[243px] min-h-[calc(100vh-80px)] ${statusColors[status]} border rounded-lg p-3 transition-all duration-300 ${dragOverColumn === status ? 'ring-2 ring-blue-400 ring-offset-2 shadow-lg scale-[1.02]' : ''
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
                            {getBugsByStatus(status).length === 0 ? (
                                <motion.div
                                    className="flex flex-col items-center justify-center py-16 px-4"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                >
                                    {/* Animated Icon Container */}
                                    <motion.div
                                        className="relative w-20 h-20 mb-4"
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.5, delay: 0.1 }}
                                    >
                                        {/* Background Circle with Gradient */}
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center shadow-sm"
                                            animate={{
                                                scale: [1, 1.05, 1],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <Inbox className="w-9 h-9 text-blue-400" strokeWidth={1.5} />
                                        </motion.div>

                                        {/* Floating Arrow Animation */}
                                        <motion.div
                                            className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border border-blue-100"
                                            animate={{
                                                y: [0, -4, 0],
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                delay: 0.3
                                            }}
                                        >
                                            <ArrowDownToLine className="w-4 h-4 text-blue-500" strokeWidth={2} />
                                        </motion.div>

                                        {/* Decorative Dots */}
                                        <motion.div
                                            className="absolute -top-2 -left-2 w-2 h-2 bg-blue-200 rounded-full"
                                            animate={{
                                                scale: [1, 1.5, 1],
                                                opacity: [0.5, 1, 0.5]
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        />
                                        <motion.div
                                            className="absolute -bottom-2 -left-3 w-1.5 h-1.5 bg-indigo-200 rounded-full"
                                            animate={{
                                                scale: [1, 1.5, 1],
                                                opacity: [0.5, 1, 0.5]
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                delay: 0.5
                                            }}
                                        />
                                    </motion.div>

                                    {/* Title */}
                                    <motion.h4
                                        className="text-sm font-semibold text-gray-700 mb-1.5"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: 0.2 }}
                                    >
                                        No Bugs Here
                                    </motion.h4>

                                    {/* Description */}
                                    <motion.p
                                        className="text-xs text-gray-500 text-center max-w-[200px] leading-relaxed"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: 0.3 }}
                                    >
                                        Drag and drop bug cards to this column
                                    </motion.p>

                                    {/* Subtle Dashed Border Indicator */}
                                    <motion.div
                                        className="mt-6 w-32 h-12 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4, delay: 0.4 }}
                                        whileHover={{ scale: 1.05, borderColor: '#93c5fd' }}
                                    >
                                        <span className="text-xs text-gray-400 font-medium">Drop here</span>
                                    </motion.div>
                                </motion.div>
                            ) : (
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
                                            whileHover={{ y: -2 }}
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

                                            <p
                                                content-data={bug.bugDesc}
                                                content-placement="top"
                                                className="text-xs text-gray-700 mb-2 line-clamp-2 leading-relaxed">
                                                {bug.bugDesc}
                                            </p>

                                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                <span className="text-xs text-gray-500">{bug.moduleName}</span>
                                                <div className="flex gap-2">
                                                    <button
                                                        tooltip-data="View"
                                                        onClick={() => handleViewBug(bug)}
                                                        className="p-1 hover:bg-blue-50 rounded transition-colors"
                                                    >
                                                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                                                    </button>
                                                    <button
                                                        tooltip-data="Archive"
                                                        onClick={() => handleMoveBugToTrash(bug._id)}
                                                        className="p-1 hover:bg-yellow-50 rounded transition-colors"
                                                    >
                                                        <ArchiveIcon className="w-3.5 h-3.5 text-yellow-600" />
                                                    </button>
                                                    <button
                                                        tooltip-data="Delete"
                                                        onClick={() => handleDeleteBugPermanently(bug._id)}
                                                        className="p-1 hover:bg-red-50 rounded transition-colors"
                                                    >
                                                        <Trash className="w-3.5 h-3.5 text-red-600" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && selectedBug && (
                    <motion.div
                        className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 sidebar-scrollbar"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            className="bg-white w-full max-w-full h-[100vh] overflow-hidden flex"
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Left Panel - Main Content */}
                            <div className="flex-1 flex flex-col overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-lg font-semibold text-gray-900">{selectedBug.serialNumber}</h2>

                                        {/* GitHub-style Dropdowns */}
                                        <div className="flex items-center gap-2">
                                            {/* Bug Type Dropdown */}
                                            {isEditMode ? (
                                                <select
                                                    value={editedBug.bugType}
                                                    onChange={(e) => setEditedBug({ ...editedBug, bugType: e.target.value })}
                                                    className="text-xs px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer font-medium text-gray-700"
                                                >
                                                    <option>Functional</option>
                                                    <option>User-Interface</option>
                                                    <option>Security</option>
                                                    <option>Database</option>
                                                    <option>Performance</option>
                                                </select>
                                            ) : (
                                                <span className="text-xs px-3 py-1.5 border border-gray-300 rounded-md bg-white font-medium text-gray-700">
                                                    {selectedBug.bugType}
                                                </span>
                                            )}

                                            {/* Priority Dropdown */}
                                            {isEditMode ? (
                                                <select
                                                    value={editedBug.priority}
                                                    onChange={(e) => setEditedBug({ ...editedBug, priority: e.target.value })}
                                                    className="text-xs px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer font-medium text-gray-700"
                                                >
                                                    <option>Critical</option>
                                                    <option>High</option>
                                                    <option>Medium</option>
                                                    <option>Low</option>
                                                </select>
                                            ) : (
                                                <span className="text-xs px-3 py-1.5 border border-gray-300 rounded-md bg-white font-medium text-gray-700">
                                                    {selectedBug.priority}
                                                </span>
                                            )}

                                            {/* Severity Dropdown */}
                                            {isEditMode ? (
                                                <select
                                                    value={editedBug.severity}
                                                    onChange={(e) => setEditedBug({ ...editedBug, severity: e.target.value })}
                                                    className="text-xs px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer font-medium text-gray-700"
                                                >
                                                    <option>Critical</option>
                                                    <option>High</option>
                                                    <option>Medium</option>
                                                    <option>Low</option>
                                                </select>
                                            ) : (
                                                <span className="text-xs px-3 py-1.5 border border-gray-300 rounded-md bg-white font-medium text-gray-700">
                                                    {selectedBug.severity}
                                                </span>
                                            )}

                                            {/* Status Dropdown */}
                                            {isEditMode ? (
                                                <select
                                                    value={editedBug.status}
                                                    onChange={(e) => setEditedBug({ ...editedBug, status: e.target.value })}
                                                    className="text-xs px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer font-medium text-gray-700"
                                                >
                                                    <option>Open</option>
                                                    <option>In Progress</option>
                                                    <option>Resolved</option>
                                                    <option>Closed</option>
                                                </select>
                                            ) : (
                                                <span className={`text-xs px-3 py-1.5 rounded-md font-medium ${statusBadgeColors[selectedBug.status]}`}>
                                                    {selectedBug.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">3 / 12</span>
                                        {isEditMode ? (
                                            <button
                                                onClick={handleUpdateBug}
                                                disabled={loading}
                                                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="Save"
                                            >
                                                <Save className="w-4 h-4 text-blue-600" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setIsEditMode(true)}
                                                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4 text-blue-600" />
                                            </button>
                                        )}
                                        <button
                                            className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
                                            title="Archive"
                                        >
                                            <Archive className="w-4 h-4 text-orange-600" />
                                        </button>
                                        <button
                                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                        <div className="w-px h-6 bg-gray-300 mx-1"></div>
                                        <button
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Previous"
                                        >
                                            <ChevronLeft className="w-4 h-4 text-gray-600" />
                                        </button>
                                        <button
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Next"
                                        >
                                            <ChevronRight className="w-4 h-4 text-gray-600" />
                                        </button>
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Close"
                                        >
                                            <X className="w-4 h-4 text-gray-600" />
                                        </button>
                                    </div>
                                </div>

                                {/* Main Content Area */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {/* Module Section */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">MODULE</h3>
                                        {isEditMode ? (
                                            <input
                                                type="text"
                                                value={editedBug.moduleName}
                                                onChange={(e) => setEditedBug({ ...editedBug, moduleName: e.target.value })}
                                                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-900">{selectedBug.moduleName}</p>
                                        )}
                                    </div>

                                    {/* Description Section */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">DESCRIPTION</h3>
                                        {isEditMode ? (
                                            <textarea
                                                value={editedBug.bugDesc}
                                                onChange={(e) => setEditedBug({ ...editedBug, bugDesc: e.target.value })}
                                                rows={4}
                                                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-700 leading-relaxed">{selectedBug.bugDesc}</p>
                                        )}
                                    </div>

                                    {/* Requirement Section */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">REQUIREMENT</h3>
                                        {isEditMode ? (
                                            <textarea
                                                value={editedBug.bugRequirement}
                                                onChange={(e) => setEditedBug({ ...editedBug, bugRequirement: e.target.value })}
                                                rows={4}
                                                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-700 leading-relaxed">{selectedBug.bugRequirement}</p>
                                        )}
                                    </div>

                                    {/* Reference Links Section */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <Link className="w-3.5 h-3.5" />
                                            REFERENCE LINKS
                                        </h3>
                                        <p className="text-sm text-gray-400 text-center py-8">No reference links</p>
                                    </div>

                                    {/* Images Section */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <ImageIcon className="w-3.5 h-3.5" />
                                            IMAGES
                                        </h3>
                                        <div className="border-2 border-dashed border-gray-200 rounded-lg py-12">
                                            <p className="text-sm text-gray-400 text-center">No images available</p>
                                        </div>
                                    </div>

                                    {/* Timestamps */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 text-blue-700 mb-1">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-xs font-semibold uppercase tracking-wider">CREATED AT</span>
                                            </div>
                                            <p className="text-sm font-medium text-blue-900">{formatDate(selectedBug.createdAt)}</p>
                                        </div>
                                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 text-purple-700 mb-1">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-xs font-semibold uppercase tracking-wider">UPDATED AT</span>
                                            </div>
                                            <p className="text-sm font-medium text-purple-900">{formatDate(selectedBug.updatedAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Sidebar - Comments */}
                            <div className="w-96 border-l border-gray-200 flex flex-col bg-gray-50">
                                {/* Comments Header */}
                                <div className="px-6 py-4 border-b border-gray-200 bg-white">
                                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        COMMENTS ({comments.length})
                                    </h3>
                                </div>

                                {/* Comments List */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {comments.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                            <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
                                            <p className="text-sm text-gray-400 font-medium">No comments yet</p>
                                        </div>
                                    ) : (
                                        comments.map((comment) => (
                                            <motion.div
                                                key={comment._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <span className="text-xs font-semibold text-gray-900">{comment.commentBy}</span>
                                                    <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                                                </div>
                                                <p className="text-sm text-gray-700 leading-relaxed">{comment.comment}</p>
                                            </motion.div>
                                        ))
                                    )}
                                </div>

                                {/* Comment Input */}
                                <div className="p-4 border-t border-gray-200 bg-white">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Write a comment..."
                                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-3"
                                        rows={3}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handlePostComment();
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={handlePostComment}
                                        disabled={loading || !newComment.trim()}
                                        className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <Send className="w-4 h-4" />
                                        Post Comment
                                    </button>
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