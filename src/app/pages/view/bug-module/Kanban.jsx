'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Trash2, X, Send, Edit2, Save, ChevronLeft, ChevronRight, ArchiveIcon, Trash, Archive, Calendar, Clock, MessageSquare, Link, ImageIcon, Inbox, ArrowDownToLine, ChevronDown, Check } from 'lucide-react';
import { useTestType } from '@/app/script/TestType.context';
import { useProject } from '@/app/script/Project.context';
import KanbanSkeleton from '@/app/components/assets/Kanban.loader';
import { BUG_EVENTS } from '@/app/components/Sidebars/Bug';
import { useAlert } from '@/app/script/Alert.context';

const BugKanbanView = () => {
    const [bugs, setBugs] = useState([]);
    const [selectedBug, setSelectedBug] = useState(null);
    const [currentBugIndex, setCurrentBugIndex] = useState(-1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedBug, setEditedBug] = useState(null);
    const [draggedBug, setDraggedBug] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragOverColumn, setDragOverColumn] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownRefs = useRef({});

    const { selectedProject } = useProject();
    const { testTypeId } = useTestType();
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

    const BASE_BUG_URL = 'http://localhost:5000/api/v1/bug';
    const BASE_COMMENT_URL = 'http://localhost:5000/api/v1/comment';

    const statuses = ['New', 'Open', 'In Progress', 'In Review', 'Closed', 'Re Open'];

    const statusColors = {
        'New': 'bg-blue-50 dark:bg-gray-900 border-blue-200 dark:border-blue-900',
        'Open': 'bg-yellow-50 dark:bg-gray-900 border-yellow-200 dark:border-yellow-900',
        'In Progress': 'bg-purple-50 dark:bg-gray-900 border-purple-200 dark:border-purple-900',
        'In Review': 'bg-orange-50 dark:bg-gray-900 border-orange-200 dark:border-orange-900',
        'Closed': 'bg-green-50 dark:bg-gray-900 border-green-200 dark:border-green-900',
        'Re Open': 'bg-red-50 dark:bg-gray-900 border-red-200 dark:border-red-900'
    };

    const statusBadgeColors = {
        'New': 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100',
        'Open': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-100',
        'In Progress': 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-100',
        'In Review': 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-100',
        'Closed': 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100',
        'Re Open': 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100'
    };

    const bugTypeOptions = ['Functional', 'User-Interface', 'Security', 'Database', 'Performance'];
    const priorityOptions = ['Critical', 'High', 'Medium', 'Low'];
    const severityOptions = ['Critical', 'High', 'Medium', 'Low'];

    const cardVariants = {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        drag: {
            scale: 1.05,
            rotate: 3,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            transition: { duration: 0.2 }
        },
        drop: {
            scale: 1,
            rotate: 0,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: { duration: 0.3, ease: 'easeOut' }
        }
    };

    const columnVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        hover: {
            scale: 1.02,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            transition: { duration: 0.2 }
        },
        drop: {
            scale: 1.03,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            transition: { duration: 0.2 }
        }
    };

    useEffect(() => {
        if (selectedProject._id && testTypeId && token) {
            fetchBugs();
        }
    }, [selectedProject._id, testTypeId, token]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDropdown && dropdownRefs.current[openDropdown]) {
                if (!dropdownRefs.current[openDropdown].contains(event.target)) {
                    setOpenDropdown(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdown]);

    useEffect(() => {
        const handleBugChange = () => {
            fetchBugs();
        };

        window.addEventListener(BUG_EVENTS.CHANGED, handleBugChange);
        window.addEventListener(BUG_EVENTS.CREATED, handleBugChange);
        window.addEventListener(BUG_EVENTS.UPDATED, handleBugChange);
        window.addEventListener(BUG_EVENTS.DELETED, handleBugChange);
        window.addEventListener(BUG_EVENTS.TRASHED, handleBugChange);
        window.addEventListener(BUG_EVENTS.RESTORED, handleBugChange);

        return () => {
            window.removeEventListener(BUG_EVENTS.CHANGED, handleBugChange);
            window.removeEventListener(BUG_EVENTS.CREATED, handleBugChange);
            window.removeEventListener(BUG_EVENTS.UPDATED, handleBugChange);
            window.removeEventListener(BUG_EVENTS.DELETED, handleBugChange);
            window.removeEventListener(BUG_EVENTS.TRASHED, handleBugChange);
            window.removeEventListener(BUG_EVENTS.RESTORED, handleBugChange);
        };
    }, []);

    const fetchBugs = async () => {
        try {
            const response = await fetch(
                `${BASE_BUG_URL}/projects/${selectedProject._id}/test-types/${testTypeId}/bugs`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const data = await response.json();

            if (response.ok) {
                const fetchedBugs = data.bugs || [];
                setBugs(fetchedBugs);
            } else {
                showAlert('error', data.message || 'Failed to fetch bugs');
            }
        } catch (error) {
            showAlert('error', 'Failed to fetch bugs');
        }
    };

    const fetchComments = async (bugId) => {
        try {
            const response = await fetch(
                `${BASE_COMMENT_URL}/projects/${selectedProject._id}/test-types/${testTypeId}/bugs/${bugId}/comments`,
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
            } else {
                showAlert('error', data.message || 'Failed to fetch comments');
            }
        } catch (error) {
            showAlert('error', 'Failed to fetch comments');
        }
    };

    const handleViewBug = async (bug, index = -1) => {
        setSelectedBug(bug);
        setCurrentBugIndex(index !== -1 ? index : bugs.findIndex(b => b._id === bug._id));
        setEditedBug({ ...bug });
        setIsModalOpen(true);
        setIsEditMode(false);
        await fetchComments(bug._id);
    };

    const handleNavigateBug = async (direction) => {
        const newIndex = direction === 'next' ? currentBugIndex + 1 : currentBugIndex - 1;

        if (newIndex >= 0 && newIndex < bugs.length) {
            const newBug = bugs[newIndex];
            setSelectedBug(newBug);
            setCurrentBugIndex(newIndex);
            setEditedBug({ ...newBug });
            setIsEditMode(false);
            await fetchComments(newBug._id);
        }
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
                showAlert('success', 'Bug updated successfully');
            } else {
                showAlert('error', data.message || 'Failed to update bug');
            }
        } catch (error) {
            showAlert('error', 'Failed to update bug');
        } finally {
            setLoading(false);
        }
    };

    const handleMoveBugToTrash = async (bugId) => {
        try {
            const response = await fetch(
                `${BASE_BUG_URL}/projects/${selectedProject._id}/test-types/${testTypeId}/bugs/${bugId}/trash`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const data = await response.json();
            if (response.ok) {
                fetchBugs();
                setIsModalOpen(false);
                showAlert('success', 'Bug moved to trash');
            } else {
                showAlert('error', data.message || 'Failed to move bug to trash');
            }
        } catch (error) {
            showAlert('error', 'Failed to move bug to trash');
        }
    };

    const handleDeleteBugPermanently = async (bugId) => {
        try {
            const response = await fetch(
                `${BASE_BUG_URL}/projects/${selectedProject._id}/test-types/${testTypeId}/bugs/${bugId}/permanent`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const data = await response.json();
            if (response.ok) {
                fetchBugs();
                setIsModalOpen(false);
                showAlert('success', 'Bug deleted permanently');
            } else {
                showAlert('error', data.message || 'Failed to delete bug');
            }
        } catch (error) {
            showAlert('error', 'Failed to delete bug');
        }
    };

    const handlePostComment = async () => {
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(
                `${BASE_COMMENT_URL}/projects/${selectedProject._id}/test-types/${testTypeId}/bugs/${selectedBug._id}/comments`,
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
            const data = await response.json();
            if (response.ok) {
                setNewComment('');
                await fetchComments(selectedBug._id);
                showAlert('success', 'Comment posted successfully');
            } else {
                showAlert('error', data.message || 'Failed to post comment');
            }
        } catch (error) {
            showAlert('error', 'Failed to post comment');
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

            const data = await response.json();
            if (response.ok) {
                fetchBugs();
                showAlert('success', 'Bug status updated');
            } else {
                showAlert('error', data.message || 'Failed to update bug status');
            }
        } catch (error) {
            showAlert('error', 'Failed to update bug status');
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
        const filteredBugs = bugs.filter(bug => {
            const bugStatus = bug.status?.trim();
            const targetStatus = status.trim();
            return bugStatus === targetStatus;
        });

        return filteredBugs;
    };

    const GitHubDropdown = ({ value, options, onChange, label, name }) => {
        const isOpen = openDropdown === name;

        return (
            <div className="relative" ref={el => dropdownRefs.current[name] = el}>
                <button
                    onClick={() => setOpenDropdown(isOpen ? null : name)}
                    className="text-xs px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 cursor-pointer font-medium text-gray-700 dark:text-gray-100 flex items-center gap-1.5 min-w-[120px] justify-between"
                >
                    <span>{value}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50 py-1 max-h-64 overflow-y-auto"
                    >
                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
                            {label}
                        </div>
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => {
                                    onChange(option);
                                    setOpenDropdown(null);
                                }}
                                className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${value === option ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}
                            >
                                <span className="text-gray-700 dark:text-gray-100">{option}</span>
                                {value === option && (
                                    <Check className="w-3 h-3 text-blue-600 dark:text-gray-100" />
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className='max-h-[calc(100vh-69px)]'>
                <KanbanSkeleton />
            </div>
        );
    }

    return (
        <div className="max-h-[calc(100vh-69px)] p-2 kanban-scrollbar justify-center items-center bg-gray-50 dark:bg-gray-900">
            <div className="flex gap-3 overflow-x-auto">
                {statuses.map((status) => {
                    const statusBugs = getBugsByStatus(status);

                    return (
                        <motion.div
                            key={status}
                            variants={columnVariants}
                            initial="initial"
                            animate="animate"
                            whileHover="hover"
                            className={`flex-shrink-0 w-[243px] min-h-[calc(100vh-80px)] ${statusColors[status]} border rounded-lg p-3 transition-all duration-300 ${dragOverColumn === status ? 'ring-2 ring-blue-400 dark:ring-blue-600 ring-offset-2 shadow-lg scale-[1.02]' : ''}`}
                            onDragOver={handleDragOver}
                            onDragEnter={() => handleDragEnter(status)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, status)}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-100 uppercase tracking-wide">
                                    {status}
                                </h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadgeColors[status]} font-medium`}>
                                    {statusBugs.length}
                                </span>
                            </div>

                            <div className="space-y-2 max-h-[calc(100vh-180px)] overflow-y-auto">
                                {statusBugs.length === 0 ? (
                                    <motion.div
                                        className="flex flex-col items-center justify-center py-16 px-4"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                    >
                                        <motion.div
                                            className="relative w-20 h-20 mb-4"
                                            initial={{ y: -20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ duration: 0.5, delay: 0.1 }}
                                        >
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm"
                                                animate={{ scale: [1, 1.05, 1] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                            >
                                                <Inbox className="w-9 h-9 text-blue-400 dark:text-blue-100" strokeWidth={1.5} />
                                            </motion.div>
                                            <motion.div
                                                className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center border border-blue-100 dark:border-gray-700"
                                                animate={{ y: [0, -4, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                                            >
                                                <ArrowDownToLine className="w-4 h-4 text-blue-500 dark:text-blue-100" strokeWidth={2} />
                                            </motion.div>
                                            <motion.div
                                                className="absolute -top-2 -left-2 w-2 h-2 bg-blue-200 dark:bg-blue-900 rounded-full"
                                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                            />
                                            <motion.div
                                                className="absolute -bottom-2 -left-3 w-1.5 h-1.5 bg-indigo-200 dark:bg-indigo-900 rounded-full"
                                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                            />
                                        </motion.div>
                                        <motion.h4
                                            className="text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1.5"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: 0.2 }}
                                        >
                                            No Bugs Here
                                        </motion.h4>
                                        <motion.p
                                            className="text-xs text-gray-500 dark:text-gray-100 text-center max-w-[200px] leading-relaxed"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: 0.3 }}
                                        >
                                            Drag and drop bug cards to this column
                                        </motion.p>
                                        <motion.div
                                            className="mt-6 w-32 h-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.4, delay: 0.4 }}
                                            whileHover={{ scale: 1.05, borderColor: '#93c5fd' }}
                                        >
                                            <span className="text-xs text-gray-400 dark:text-gray-100 font-medium">Drop here</span>
                                        </motion.div>
                                    </motion.div>
                                ) : (
                                    <AnimatePresence>
                                        {statusBugs.map((bug, index) => (
                                            <motion.div
                                                key={bug._id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, bug)}
                                                onDragEnd={handleDragEnd}
                                                variants={cardVariants}
                                                initial="initial"
                                                animate="animate"
                                                whileDrag="drag"
                                                className={`bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 cursor-move hover:shadow-md transition-all duration-200 ${draggedBug?._id === bug._id ? 'opacity-40 rotate-2 scale-95' : ''}`}
                                                layout
                                                transition={{
                                                    layout: { duration: 0.3, ease: "easeInOut" },
                                                    default: { duration: 0.2 }
                                                }}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <span className="text-xs font-mono text-gray-500 dark:text-gray-100">{bug.serialNumber}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded ${bug.priority === 'Critical' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100' :
                                                        bug.priority === 'High' ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-100' :
                                                            bug.priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-100' :
                                                                'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100'
                                                        }`}>
                                                        {bug.priority}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-700 dark:text-gray-100 mb-2 line-clamp-2 leading-relaxed">
                                                    {bug.bugDesc}
                                                </p>
                                                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                                                    <span className="text-xs text-gray-500 dark:text-gray-100">{bug.moduleName}</span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleViewBug(bug, bugs.indexOf(bug))}
                                                            className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                                                        >
                                                            <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-100" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleMoveBugToTrash(bug._id)}
                                                            className="p-1 hover:bg-yellow-50 dark:hover:bg-yellow-900 rounded transition-colors"
                                                        >
                                                            <ArchiveIcon className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-100" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteBugPermanently(bug._id)}
                                                            className="p-1 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                                                        >
                                                            <Trash className="w-3.5 h-3.5 text-red-600 dark:text-red-100" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <AnimatePresence>
                {isModalOpen && selectedBug && (
                    <motion.div
                        className="fixed inset-0 backdrop-blur-md bg-white/30 dark:bg-black/30 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl w-full max-w-full h-[100vh] overflow-hidden flex shadow-2xl border border-sky-200 dark:border-sky-900"
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="flex items-center justify-between px-6 py-4 border-b border-sky-200 dark:border-sky-900 bg-gradient-to-r from-white to-sky-50 dark:from-gray-900 dark:to-sky-950">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedBug.serialNumber}</h2>
                                        <div className="flex items-center gap-2">
                                            {isEditMode ? (
                                                <>
                                                    <GitHubDropdown
                                                        value={editedBug.bugType}
                                                        options={bugTypeOptions}
                                                        onChange={(value) => setEditedBug({ ...editedBug, bugType: value })}
                                                        label="Select Bug Type"
                                                        name="bugType"
                                                    />
                                                    <GitHubDropdown
                                                        value={editedBug.priority}
                                                        options={priorityOptions}
                                                        onChange={(value) => setEditedBug({ ...editedBug, priority: value })}
                                                        label="Select Priority"
                                                        name="priority"
                                                    />
                                                    <GitHubDropdown
                                                        value={editedBug.severity}
                                                        options={severityOptions}
                                                        onChange={(value) => setEditedBug({ ...editedBug, severity: value })}
                                                        label="Select Severity"
                                                        name="severity"
                                                    />
                                                    <GitHubDropdown
                                                        value={editedBug.status}
                                                        options={statuses}
                                                        onChange={(value) => setEditedBug({ ...editedBug, status: value })}
                                                        label="Select Status"
                                                        name="status"
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-xs px-3 py-1.5 border border-sky-300 dark:border-sky-700 rounded-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm font-medium text-gray-700 dark:text-gray-100">
                                                        {selectedBug.bugType}
                                                    </span>
                                                    <span className="text-xs px-3 py-1.5 border border-sky-300 dark:border-sky-700 rounded-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm font-medium text-gray-700 dark:text-gray-100">
                                                        {selectedBug.priority}
                                                    </span>
                                                    <span className="text-xs px-3 py-1.5 border border-sky-300 dark:border-sky-700 rounded-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm font-medium text-gray-700 dark:text-gray-100">
                                                        {selectedBug.severity}
                                                    </span>
                                                    <span className={`text-xs px-3 py-1.5 rounded-md font-medium backdrop-blur-sm ${statusBadgeColors[selectedBug.status]}`}>
                                                        {selectedBug.status}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 dark:text-gray-100 font-medium">
                                            {currentBugIndex + 1} / {bugs.length}
                                        </span>
                                        {isEditMode ? (
                                            <button
                                                onClick={handleUpdateBug}
                                                disabled={loading}
                                                className="p-2 hover:bg-sky-100 dark:hover:bg-sky-900 rounded-lg transition-colors backdrop-blur-sm"
                                            >
                                                <Save className="w-4 h-4 text-sky-600 dark:text-sky-100" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setIsEditMode(true)}
                                                className="p-2 hover:bg-sky-100 dark:hover:bg-sky-900 rounded-lg transition-colors backdrop-blur-sm"
                                            >
                                                <Edit2 className="w-4 h-4 text-sky-600 dark:text-sky-100" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleMoveBugToTrash(selectedBug._id)}
                                            className="p-2 hover:bg-orange-100 dark:hover:bg-orange-900 rounded-lg transition-colors backdrop-blur-sm"
                                        >
                                            <Archive className="w-4 h-4 text-orange-600 dark:text-orange-100" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteBugPermanently(selectedBug._id)}
                                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors backdrop-blur-sm"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-100" />
                                        </button>
                                        <div className="w-px h-6 bg-sky-300 dark:bg-sky-700 mx-1"></div>
                                        <button
                                            onClick={() => handleNavigateBug('prev')}
                                            disabled={currentBugIndex <= 0}
                                            className="p-2 hover:bg-sky-100 dark:hover:bg-sky-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                                        >
                                            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-100" />
                                        </button>
                                        <button
                                            onClick={() => handleNavigateBug('next')}
                                            disabled={currentBugIndex >= bugs.length - 1}
                                            className="p-2 hover:bg-sky-100 dark:hover:bg-sky-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                                        >
                                            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-100" />
                                        </button>
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className="p-2 hover:bg-sky-100 dark:hover:bg-sky-900 rounded-lg transition-colors backdrop-blur-sm"
                                        >
                                            <X className="w-4 h-4 text-gray-600 dark:text-gray-100" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-white via-sky-50/30 to-white dark:from-gray-900 dark:via-sky-950/30 dark:to-gray-900">
                                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-sky-200 dark:border-sky-900 rounded-lg p-5 shadow-lg">
                                        <h3 className="text-xs font-semibold text-sky-600 dark:text-sky-100 uppercase tracking-wider mb-3">MODULE</h3>
                                        {isEditMode ? (
                                            <input
                                                type="text"
                                                value={editedBug.moduleName}
                                                onChange={(e) => setEditedBug({ ...editedBug, moduleName: e.target.value })}
                                                className="w-full text-sm px-3 py-2 border border-sky-300 dark:border-sky-700 rounded-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-600"
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-900 dark:text-gray-100">{selectedBug.moduleName}</p>
                                        )}
                                    </div>

                                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-sky-200 dark:border-sky-900 rounded-lg p-5 shadow-lg">
                                        <h3 className="text-xs font-semibold text-sky-600 dark:text-sky-100 uppercase tracking-wider mb-3">DESCRIPTION</h3>
                                        {isEditMode ? (
                                            <textarea
                                                value={editedBug.bugDesc}
                                                onChange={(e) => setEditedBug({ ...editedBug, bugDesc: e.target.value })}
                                                rows={4}
                                                className="w-full text-sm px-3 py-2 border border-sky-300 dark:border-sky-700 rounded-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-600 resize-none"
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-700 dark:text-gray-100 leading-relaxed">{selectedBug.bugDesc}</p>
                                        )}
                                    </div>

                                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-sky-200 dark:border-sky-900 rounded-lg p-5 shadow-lg">
                                        <h3 className="text-xs font-semibold text-sky-600 dark:text-sky-100 uppercase tracking-wider mb-3">REQUIREMENT</h3>
                                        {isEditMode ? (
                                            <textarea
                                                value={editedBug.bugRequirement}
                                                onChange={(e) => setEditedBug({ ...editedBug, bugRequirement: e.target.value })}
                                                rows={4}
                                                className="w-full text-sm px-3 py-2 border border-sky-300 dark:border-sky-700 rounded-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-600 resize-none"
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-700 dark:text-gray-100 leading-relaxed">{selectedBug.bugRequirement}</p>
                                        )}
                                    </div>

                                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-sky-200 dark:border-sky-900 rounded-lg p-5 shadow-lg">
                                        <h3 className="text-xs font-semibold text-sky-600 dark:text-sky-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <Link className="w-3.5 h-3.5" />
                                            REFERENCE LINKS
                                        </h3>
                                        <p className="text-sm text-gray-400 dark:text-gray-100 text-center py-8">No reference links</p>
                                    </div>

                                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-sky-200 dark:border-sky-900 rounded-lg p-5 shadow-lg">
                                        <h3 className="text-xs font-semibold text-sky-600 dark:text-sky-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <ImageIcon className="w-3.5 h-3.5" />
                                            IMAGES
                                        </h3>
                                        <div className="border-2 border-dashed border-sky-200 dark:border-sky-800 rounded-lg py-12 bg-sky-50/30 dark:bg-sky-950/30">
                                            <p className="text-sm text-gray-400 dark:text-gray-100 text-center">No images available</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950 backdrop-blur-xl border border-sky-200 dark:border-sky-800 rounded-lg p-4 shadow-lg">
                                            <div className="flex items-center gap-2 text-sky-700 dark:text-sky-100 mb-1">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-xs font-semibold uppercase tracking-wider">CREATED AT</span>
                                            </div>
                                            <p className="text-sm font-medium text-sky-900 dark:text-sky-100">{formatDate(selectedBug.createdAt)}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-purple-50 to-sky-50 dark:from-purple-950 dark:to-sky-950 backdrop-blur-xl border border-purple-200 dark:border-purple-800 rounded-lg p-4 shadow-lg">
                                            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-100 mb-1">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-xs font-semibold uppercase tracking-wider">UPDATED AT</span>
                                            </div>
                                            <p className="text-sm font-medium text-purple-900 dark:text-purple-100">{formatDate(selectedBug.updatedAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-96 border-l border-sky-200 dark:border-sky-900 flex flex-col bg-gradient-to-b from-white to-sky-50 dark:from-gray-900 dark:to-sky-950">
                                <div className="px-6 py-4 border-b border-sky-200 dark:border-sky-900 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-sky-600 dark:text-sky-100" />
                                        COMMENTS ({comments.length})
                                    </h3>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {comments.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                            <MessageSquare className="w-12 h-12 text-sky-300 dark:text-sky-800 mb-3" />
                                            <p className="text-sm text-gray-400 dark:text-gray-100 font-medium">No comments yet</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-100 mt-1">Be the first to comment</p>
                                        </div>
                                    ) : (
                                        comments.map((comment) => (
                                            <motion.div
                                                key={comment._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-sky-200 dark:border-sky-800 rounded-lg p-4 shadow-md"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{comment.commentBy}</span>
                                                    <span className="text-xs text-gray-400 dark:text-gray-100">{formatDate(comment.createdAt)}</span>
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-100 leading-relaxed">{comment.comment}</p>
                                            </motion.div>
                                        ))
                                    )}
                                </div>

                                <div className="p-4 border-t border-sky-200 dark:border-sky-900 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Write a comment..."
                                        className="w-full text-sm px-3 py-2 border border-sky-300 dark:border-sky-700 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-600 resize-none mb-3"
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
                                        className="w-full px-4 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-700 dark:to-blue-700 text-white dark:text-gray-100 text-sm font-medium rounded-lg hover:from-sky-700 hover:to-blue-700 dark:hover:from-sky-600 dark:hover:to-blue-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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