'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Search, AlertCircle, Loader2, RefreshCw, Archive, MessageSquare, ExternalLink, X, Send, ChevronLeft, ChevronRight, Eye, Calendar, Clock, Edit, Save, Menu, ChevronRight as ChevronRightIcon } from 'lucide-react';

const BugSplitView = () => {
    const [bugs, setBugs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBug, setSelectedBug] = useState(null);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [savingField, setSavingField] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(400);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef(null);

    const [editFormData, setEditFormData] = useState({
        moduleName: '',
        bugDesc: '',
        bugRequirement: '',
        refLink: ''
    });

    const copyText = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Copied:', text);
        }).catch(() => {
            console.log('Failed to copy');
        });
    };

    const projectId = typeof window !== 'undefined' ? localStorage.getItem("currentProjectId") : null;
    const testTypeId = typeof window !== 'undefined' ? localStorage.getItem("selectedTestTypeId") : null;
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

    const BASE_URL = 'http://localhost:5000/api/v1/bug';

    const fetchBugs = useCallback(async () => {
        if (!projectId || !testTypeId || !token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs?page=1&limit=1000000`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to fetch bugs');

            const data = await response.json();
            setBugs(data.bugs || []);
        } catch (error) {
            console.error('Error fetching bugs:', error);
        } finally {
            setLoading(false);
        }
    }, [projectId, testTypeId, token]);

    const fetchComments = async (bugId) => {
        if (!token || !bugId) return;

        setLoadingComments(true);

        try {
            const response = await fetch(
                `http://localhost:5000/api/v1/comment/projects/${projectId}/test-types/${testTypeId}/bugs/${bugId}/comments`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to fetch comments');

            const data = await response.json();
            setComments(data.comments || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoadingComments(false);
        }
    };

    const submitComment = async (bugId) => {
        if (!newComment.trim() || submittingComment) return;

        setSubmittingComment(true);

        try {
            const response = await fetch(
                `http://localhost:5000/api/v1/comment/projects/${projectId}/test-types/${testTypeId}/bugs/${bugId}/comments`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        comment: newComment,
                        bugId: bugId
                    })
                }
            );

            if (!response.ok) throw new Error('Failed to submit comment');

            const data = await response.json();
            setComments(prev => [data.comment, ...prev]);
            setNewComment('');
        } catch (error) {
            console.error('Error submitting comment:', error);
        } finally {
            setSubmittingComment(false);
        }
    };

    const updateBug = async (bugId, field, value) => {
        setSavingField(field);

        try {
            const response = await fetch(
                `${BASE_URL}/bugs/${bugId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ [field]: value })
                }
            );

            if (!response.ok) throw new Error('Failed to update bug');

            setBugs(prev => prev.map(bug =>
                bug._id === bugId ? { ...bug, [field]: value } : bug
            ));

            if (selectedBug?._id === bugId) {
                setSelectedBug(prev => ({ ...prev, [field]: value }));
            }

            setTimeout(() => setSavingField(null), 500);
        } catch (error) {
            console.error('Error updating bug:', error);
            setSavingField(null);
        }
    };

    const updateBugFields = async (bugId, fields) => {
        try {
            const response = await fetch(
                `${BASE_URL}/bugs/${bugId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(fields)
                }
            );

            if (!response.ok) throw new Error('Failed to update bug');

            setBugs(prev => prev.map(bug =>
                bug._id === bugId ? { ...bug, ...fields } : bug
            ));

            if (selectedBug?._id === bugId) {
                setSelectedBug(prev => ({ ...prev, ...fields }));
            }

            return true;
        } catch (error) {
            console.error('Error updating bug:', error);
            return false;
        }
    };

    const moveBugToTrash = async (bugId) => {
        if (!confirm('Move this bug to trash?')) return;

        try {
            const response = await fetch(
                `${BASE_URL}/bugs/${bugId}/trash`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to move bug to trash');

            setBugs(prev => prev.filter(bug => bug._id !== bugId));
            if (selectedBug?._id === bugId) {
                setSelectedBug(null);
            }
        } catch (error) {
            console.error('Error moving bug to trash:', error);
        }
    };

    const deleteBugPermanently = async (bugId) => {
        if (!confirm('Permanently delete this bug? This action cannot be undone!')) return;

        try {
            const response = await fetch(
                `${BASE_URL}/bugs/${bugId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to delete bug permanently');

            setBugs(prev => prev.filter(bug => bug._id !== bugId));
            if (selectedBug?._id === bugId) {
                setSelectedBug(null);
            }
        } catch (error) {
            console.error('Error deleting bug permanently:', error);
        }
    };

    const handleFieldEdit = (field, value) => {
        updateBug(selectedBug._id, field, value);
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setEditFormData({
            moduleName: selectedBug.moduleName || '',
            bugDesc: selectedBug.bugDesc || '',
            bugRequirement: selectedBug.bugRequirement || '',
            refLink: selectedBug.refLink || ''
        });
    };

    const handleSaveClick = async () => {
        const success = await updateBugFields(selectedBug._id, editFormData);
        if (success) {
            setIsEditing(false);
        }
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setEditFormData({
            moduleName: selectedBug.moduleName || '',
            bugDesc: selectedBug.bugDesc || '',
            bugRequirement: selectedBug.bugRequirement || '',
            refLink: selectedBug.refLink || ''
        });
    };

    const goToNextBug = () => {
        const currentIndex = filteredBugs.findIndex(bug => bug._id === selectedBug._id);
        if (currentIndex < filteredBugs.length - 1) {
            const nextBug = filteredBugs[currentIndex + 1];
            setSelectedBug(nextBug);
            fetchComments(nextBug._id);
            setIsEditing(false);
        }
    };

    const goToPreviousBug = () => {
        const currentIndex = filteredBugs.findIndex(bug => bug._id === selectedBug._id);
        if (currentIndex > 0) {
            const prevBug = filteredBugs[currentIndex - 1];
            setSelectedBug(prevBug);
            fetchComments(prevBug._id);
            setIsEditing(false);
        }
    };

    const startResizing = useCallback((e) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback((e) => {
        if (isResizing) {
            const newWidth = e.clientX;
            if (newWidth >= 300 && newWidth <= 600) {
                setSidebarWidth(newWidth);
            }
        }
    }, [isResizing]);

    useEffect(() => {
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResizing);
        return () => {
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResizing);
        };
    }, [resize, stopResizing]);

    useEffect(() => {
        fetchBugs();
    }, [fetchBugs]);

    const filteredBugs = bugs.filter(bug =>
        Object.values(bug).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const getBugTypeColor = (type) => {
        const colors = {
            'Functional': 'bg-blue-50 text-blue-700 border-blue-200',
            'User-Interface': 'bg-purple-50 text-purple-700 border-purple-200',
            'Security': 'bg-red-50 text-red-700 border-red-200',
            'Database': 'bg-green-50 text-green-700 border-green-200',
            'Performance': 'bg-orange-50 text-orange-700 border-orange-200'
        };
        return colors[type] || 'bg-gray-50 text-gray-700 border-gray-200';
    };

    const getStatusColor = (status) => {
        const colors = {
            'New': 'bg-blue-50 text-blue-700 border-blue-200',
            'Open': 'bg-purple-50 text-purple-700 border-purple-200',
            'In Progress': 'bg-yellow-50 text-yellow-700 border-yellow-200',
            'In Review': 'bg-orange-50 text-orange-700 border-orange-200',
            'Closed': 'bg-green-50 text-green-700 border-green-200',
            'Re Open': 'bg-red-50 text-red-700 border-red-200'
        };
        return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'Critical': 'bg-red-50 text-red-700 border-red-200',
            'High': 'bg-orange-50 text-orange-700 border-orange-200',
            'Medium': 'bg-yellow-50 text-yellow-700 border-yellow-200',
            'Low': 'bg-green-50 text-green-700 border-green-200'
        };
        return colors[priority] || 'bg-gray-50 text-gray-700 border-gray-200';
    };

    const GitHubDropdown = ({ value, options, onChange, label, className = "" }) => {
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef(null);

        useEffect(() => {
            const handleClickOutside = (event) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                    setIsOpen(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        const handleSelect = (option) => {
            onChange(option);
            setIsOpen(false);
        };

        return (
            <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
                <button
                    type="button"
                    className="inline-flex justify-between items-center w-full px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span>{value}</span>
                    <motion.svg
                        className="-mr-1 ml-2 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="origin-top-right absolute right-0 mt-2 w-full rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 overflow-hidden"
                        >
                            <div className="py-1" role="menu">
                                {options.map((option) => (
                                    <motion.button
                                        key={option}
                                        whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                                        className={`block w-full text-left px-3 py-2 text-xs transition-colors ${value === option ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                                            }`}
                                        onClick={() => handleSelect(option)}
                                        role="menuitem"
                                    >
                                        {option}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm font-medium">Loading bugs...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            {/* Sidebar */}
            <motion.div
                ref={sidebarRef}
                initial={{ x: 0 }}
                animate={{ x: isSidebarOpen ? 0 : -sidebarWidth }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-white border-r border-gray-200 flex flex-col shadow-xl"
                style={{ width: sidebarWidth, minWidth: isSidebarOpen ? sidebarWidth : 0 }}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h2 className="text-sm font-bold text-gray-800 tracking-wide">Bug List</h2>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-1.5 hover:bg-white rounded-lg transition-colors"
                    >
                        <ChevronRightIcon size={16} className="text-gray-600" />
                    </motion.button>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search bugs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Bugs List */}
                <div className="flex-1 overflow-y-auto bg-gray-50">
                    {filteredBugs.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-12"
                        >
                            <AlertCircle size={40} className="text-gray-400 mb-3" />
                            <p className="text-gray-600 text-xs font-medium">No bugs found</p>
                        </motion.div>
                    ) : (
                        <div className="space-y-2 p-3">
                            {filteredBugs.map((bug, index) => (
                                <motion.div
                                    key={bug._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                    className={`bg-white rounded-xl border-2 p-3 cursor-pointer transition-all duration-200 ${selectedBug?._id === bug._id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                    onClick={() => {
                                        setSelectedBug(bug);
                                        fetchComments(bug._id);
                                    }}
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{bug.serialNumber}</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${getBugTypeColor(bug.bugType)}`}>
                                                {bug.bugType}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${getStatusColor(bug.status)}`}>
                                                {bug.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs text-gray-700 mb-2 line-clamp-2 min-h-[2rem] leading-relaxed">
                                        {bug.bugDesc || 'No description'}
                                    </p>

                                    {/* Date */}
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                                        <Clock size={12} className="text-gray-400" />
                                        <span>
                                            {bug.updatedAt
                                                ? `Updated: ${new Date(bug.updatedAt).toLocaleDateString()}`
                                                : `Created: ${new Date(bug.createdAt).toLocaleDateString()}`
                                            }
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        <div className="flex items-center gap-1.5">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    moveBugToTrash(bug._id);
                                                }}
                                                className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                            >
                                                <Archive size={13} />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteBugPermanently(bug._id);
                                                }}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={13} />
                                            </motion.button>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                                            <MessageSquare size={12} />
                                            <span className="font-medium">{comments.filter(c => c.bugId === bug._id).length}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Resize Handle */}
            {isSidebarOpen && (
                <motion.div
                    whileHover={{ backgroundColor: 'rgb(59, 130, 246)' }}
                    className="w-1 bg-gray-200 cursor-col-resize transition-colors"
                    onMouseDown={startResizing}
                />
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3">
                        {!isSidebarOpen && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Menu size={18} className="text-gray-700" />
                            </motion.button>
                        )}
                        <h1 className="text-sm font-bold text-gray-800 tracking-wide">Bug Details</h1>
                    </div>

                    {selectedBug && (
                        <div className="flex items-center gap-3">
                            {/* Bug counter */}
                            <div className="text-xs text-gray-600 font-medium bg-gray-100 px-3 py-1.5 rounded-lg">
                                Bug {filteredBugs.findIndex(b => b._id === selectedBug._id) + 1} of {filteredBugs.length}
                            </div>

                            {/* Navigation buttons */}
                            <div className="flex items-center gap-1">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={goToPreviousBug}
                                    disabled={filteredBugs.findIndex(b => b._id === selectedBug._id) === 0}
                                    className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={goToNextBug}
                                    disabled={filteredBugs.findIndex(b => b._id === selectedBug._id) === filteredBugs.length - 1}
                                    className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={18} />
                                </motion.button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bug Details */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!selectedBug ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center h-full text-gray-500"
                        >
                            <AlertCircle size={56} className="mb-4 text-gray-400" />
                            <p className="text-sm font-medium">Select a bug to view details</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-5xl mx-auto"
                        >
                            {/* Header with Serial Number and Dropdowns */}
                            <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <motion.h2
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => copyText(selectedBug.serialNumber)}
                                        className="text-sm font-bold text-gray-800 cursor-pointer bg-gray-100 px-3 py-2 rounded-lg"
                                    >
                                        {selectedBug.serialNumber}
                                    </motion.h2>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getBugTypeColor(selectedBug.bugType)}`}>
                                        {selectedBug.bugType}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Dropdowns */}
                                    <GitHubDropdown
                                        value={selectedBug.priority || 'Medium'}
                                        options={['Critical', 'High', 'Medium', 'Low']}
                                        onChange={(value) => handleFieldEdit('priority', value)}
                                        label="Priority"
                                        className="min-w-[110px]"
                                    />
                                    <GitHubDropdown
                                        value={selectedBug.severity || 'Medium'}
                                        options={['Critical', 'High', 'Medium', 'Low']}
                                        onChange={(value) => handleFieldEdit('severity', value)}
                                        label="Severity"
                                        className="min-w-[110px]"
                                    />
                                    <GitHubDropdown
                                        value={selectedBug.status || 'New'}
                                        options={['New', 'Open', 'In Progress', 'In Review', 'Closed', 'Re Open']}
                                        onChange={(value) => handleFieldEdit('status', value)}
                                        label="Status"
                                        className="min-w-[130px]"
                                    />

                                    {/* Edit/Save buttons */}
                                    {!isEditing ? (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleEditClick}
                                            className="flex items-center gap-1.5 px-4 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                                        >
                                            <Edit size={13} />
                                            Edit
                                        </motion.button>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleSaveClick}
                                                className="flex items-center gap-1.5 px-4 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium"
                                            >
                                                <Save size={13} />
                                                Save
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleCancelClick}
                                                className="flex items-center gap-1.5 px-4 py-2 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-sm font-medium"
                                            >
                                                <X size={13} />
                                                Cancel
                                            </motion.button>
                                        </div>
                                    )}

                                    {/* Archive and Delete buttons */}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => moveBugToTrash(selectedBug._id)}
                                        className="flex items-center gap-1.5 px-4 py-2 text-xs bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm font-medium"
                                    >
                                        <Archive size={13} />
                                        Archive
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => deleteBugPermanently(selectedBug._id)}
                                        className="flex items-center gap-1.5 px-4 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm font-medium"
                                    >
                                        <Trash2 size={13} />
                                        Delete
                                    </motion.button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column - Bug Details */}
                                <div className="lg:col-span-2 space-y-4">
                                    {/* Module Name */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
                                    >
                                        <label className="text-xs font-bold text-gray-600 mb-2 block tracking-wide">MODULE</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editFormData.moduleName}
                                                onChange={(e) => setEditFormData(prev => ({ ...prev, moduleName: e.target.value }))}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="Enter module name..."
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-700 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200">
                                                {selectedBug.moduleName || 'No module specified'}
                                            </p>
                                        )}
                                    </motion.div>

                                    {/* Description */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
                                    >
                                        <label className="text-xs font-bold text-gray-600 mb-2 block tracking-wide">DESCRIPTION</label>
                                        {isEditing ? (
                                            <textarea
                                                value={editFormData.bugDesc}
                                                onChange={(e) => setEditFormData(prev => ({ ...prev, bugDesc: e.target.value }))}
                                                rows={4}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                                placeholder="Enter bug description..."
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-700 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 min-h-[100px] leading-relaxed">
                                                {selectedBug.bugDesc || 'No description'}
                                            </p>
                                        )}
                                    </motion.div>

                                    {/* Requirement */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
                                    >
                                        <label className="text-xs font-bold text-gray-600 mb-2 block tracking-wide">REQUIREMENT</label>
                                        {isEditing ? (
                                            <textarea
                                                value={editFormData.bugRequirement}
                                                onChange={(e) => setEditFormData(prev => ({ ...prev, bugRequirement: e.target.value }))}
                                                rows={3}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                                placeholder="Enter bug requirement..."
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-700 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 min-h-[80px] leading-relaxed">
                                                {selectedBug.bugRequirement || 'No requirement specified'}
                                            </p>
                                        )}
                                    </motion.div>

                                    {/* Reference Link */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
                                    >
                                        <label className="text-xs font-bold text-gray-600 mb-2 block tracking-wide">REFERENCE LINK</label>
                                        {isEditing ? (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={editFormData.refLink}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, refLink: e.target.value }))}
                                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <p className="flex-1 text-sm text-gray-700 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 truncate">
                                                    {selectedBug.refLink || 'No reference link'}
                                                </p>
                                                {selectedBug.refLink && (
                                                    <motion.a
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        href={selectedBug.refLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-xs font-medium shadow-sm transition-colors"
                                                    >
                                                        <ExternalLink size={13} />
                                                        Open
                                                    </motion.a>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Timestamps */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="grid grid-cols-2 gap-4 pt-2"
                                    >
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                            <label className="text-xs font-bold text-gray-600 mb-1.5 block tracking-wide flex items-center gap-1.5">
                                                <Calendar size={12} />
                                                CREATED AT
                                            </label>
                                            <p className="text-xs text-gray-700 font-medium">
                                                {new Date(selectedBug.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        {selectedBug.updatedAt && (
                                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                                <label className="text-xs font-bold text-gray-600 mb-1.5 block tracking-wide flex items-center gap-1.5">
                                                    <Clock size={12} />
                                                    UPDATED AT
                                                </label>
                                                <p className="text-xs text-gray-700 font-medium">
                                                    {new Date(selectedBug.updatedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                </div>

                                {/* Right Column - Comments */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="lg:col-span-1"
                                >
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 sticky top-4">
                                        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 tracking-wide">
                                            <MessageSquare size={16} className="text-blue-600" />
                                            COMMENTS
                                        </h3>

                                        {/* Add Comment */}
                                        <div className="mb-4">
                                            <textarea
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Add a comment..."
                                                rows={3}
                                                className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2 transition-all resize-none"
                                            />
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => submitComment(selectedBug._id)}
                                                disabled={!newComment.trim() || submittingComment}
                                                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center gap-2 font-medium shadow-sm transition-colors"
                                            >
                                                {submittingComment ? (
                                                    <>
                                                        <Loader2 size={13} className="animate-spin" />
                                                        Posting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send size={13} />
                                                        Post Comment
                                                    </>
                                                )}
                                            </motion.button>
                                        </div>

                                        {/* Comments List */}
                                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                            {loadingComments ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <Loader2 size={24} className="animate-spin text-blue-600" />
                                                </div>
                                            ) : comments.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500 text-xs">
                                                    <MessageSquare size={32} className="mx-auto mb-2 text-gray-300" />
                                                    <p className="font-medium">No comments yet</p>
                                                </div>
                                            ) : (
                                                comments.map((comment, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200"
                                                    >
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                                                                <span className="text-xs font-bold text-white">
                                                                    {comment.commentBy?.charAt(0).toUpperCase() || 'U'}
                                                                </span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <span className="text-xs font-bold text-gray-800 block truncate">
                                                                    {comment.commentBy || 'Unknown'}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-700 leading-relaxed">{comment.comment}</p>
                                                    </motion.div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BugSplitView;