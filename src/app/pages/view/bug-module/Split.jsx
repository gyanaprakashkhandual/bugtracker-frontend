'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Search, AlertCircle, Loader2, RefreshCw, Archive, MessageSquare, ExternalLink, X, Send, ChevronLeft, ChevronRight, Eye, Calendar, Clock, Edit, Save, Menu, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useAlert } from '@/app/script/Alert.context';

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
    const { showAlert } = useAlert();

    const copyText = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            showAlert({
                type: "success",
                message: `Copied: ${text}`
            });
        }).catch(() => {
            showAlert({
                type: "error",
                message: "Failed to copy!"
            });
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

    // Resize handlers
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
            'Functional': 'bg-blue-100 text-blue-700 border-blue-300',
            'User-Interface': 'bg-purple-100 text-purple-700 border-purple-300',
            'Security': 'bg-red-100 text-red-700 border-red-300',
            'Database': 'bg-green-100 text-green-700 border-green-300',
            'Performance': 'bg-orange-100 text-orange-700 border-orange-300'
        };
        return colors[type] || 'bg-gray-100 text-gray-700 border-gray-300';
    };

    const getStatusColor = (status) => {
        const colors = {
            'New': 'bg-blue-100 text-blue-700 border-blue-300',
            'Open': 'bg-purple-100 text-purple-700 border-purple-300',
            'In Progress': 'bg-yellow-100 text-yellow-700 border-yellow-300',
            'In Review': 'bg-orange-100 text-orange-700 border-orange-300',
            'Closed': 'bg-green-100 text-green-700 border-green-300',
            'Re Open': 'bg-red-100 text-red-700 border-red-300'
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'Critical': 'bg-red-100 text-red-700 border-red-300',
            'High': 'bg-orange-100 text-orange-700 border-orange-300',
            'Medium': 'bg-yellow-100 text-yellow-700 border-yellow-300',
            'Low': 'bg-green-100 text-green-700 border-green-300'
        };
        return colors[priority] || 'bg-gray-100 text-gray-700 border-gray-300';
    };

    // GitHub-style dropdown component
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
                    className="inline-flex justify-between items-center w-full px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span>{value}</span>
                    <svg className="-mr-1 ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                            transition={{ duration: 0.1 }}
                            className="origin-top-right absolute right-0 mt-1 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                        >
                            <div className="py-1" role="menu">
                                {options.map((option) => (
                                    <button
                                        key={option}
                                        className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 ${value === option ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                            }`}
                                        onClick={() => handleSelect(option)}
                                        role="menuitem"
                                    >
                                        {option}
                                    </button>
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
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">Loading bugs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <div
                ref={sidebarRef}
                className={`bg-white border-r border-gray-200 transition-all duration-200 flex flex-col ${isSidebarOpen ? '' : 'w-0'}`}
                style={{ width: isSidebarOpen ? sidebarWidth : 0 }}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-3 border-b border-gray-200">
                    <h2 className="text-sm font-semibold text-gray-800">Bugs</h2>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <ChevronRightIcon size={16} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                        <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search bugs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Bugs List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredBugs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <AlertCircle size={32} className="text-gray-400 mb-2" />
                            <p className="text-gray-600 text-xs">No bugs found</p>
                        </div>
                    ) : (
                        <div className="space-y-2 p-2">
                            {filteredBugs.map((bug) => (
                                <motion.div
                                    key={bug._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`bg-white rounded-lg border p-2 hover:shadow-md transition-shadow cursor-pointer ${selectedBug?._id === bug._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                        }`}
                                    onClick={() => {
                                        setSelectedBug(bug);
                                        fetchComments(bug._id);
                                    }}
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className="text-xs font-semibold text-gray-500">{bug.serialNumber}</span>
                                        <div className="flex items-center gap-1">
                                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${getBugTypeColor(bug.bugType)}`}>
                                                {bug.bugType}
                                            </span>
                                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${getStatusColor(bug.status)}`}>
                                                {bug.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs text-gray-700 mb-1 line-clamp-2 min-h-[2rem]">
                                        {bug.bugDesc || 'No description'}
                                    </p>

                                    {/* Date */}
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                        <Clock size={10} />
                                        <span>
                                            {bug.updatedAt
                                                ? `Updated: ${new Date(bug.updatedAt).toLocaleDateString()}`
                                                : `Created: ${new Date(bug.createdAt).toLocaleDateString()}`
                                            }
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    moveBugToTrash(bug._id);
                                                }}
                                                className="p-0.5 text-orange-600 hover:bg-orange-50 rounded text-xs"
                                            >
                                                <Archive size={12} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteBugPermanently(bug._id);
                                                }}
                                                className="p-0.5 text-red-600 hover:bg-red-50 rounded text-xs"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <MessageSquare size={10} />
                                            <span>{comments.filter(c => c.bugId === bug._id).length}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Resize Handle */}
            {isSidebarOpen && (
                <div
                    className="w-1 bg-gray-200 hover:bg-blue-500 cursor-col-resize transition-colors"
                    onMouseDown={startResizing}
                />
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-2">
                        {!isSidebarOpen && (
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <Menu size={16} />
                            </button>
                        )}
                        <h1 className="text-sm font-semibold text-gray-800">Bug Details</h1>
                    </div>

                    {selectedBug && (
                        <div className="flex items-center gap-2">
                            {/* Bug counter */}
                            <div className="text-xs text-gray-600 mr-2">
                                Bug {filteredBugs.findIndex(b => b._id === selectedBug._id) + 1} of {filteredBugs.length}
                            </div>

                            {/* Navigation buttons */}
                            <button
                                onClick={goToPreviousBug}
                                disabled={filteredBugs.findIndex(b => b._id === selectedBug._id) === 0}
                                className="p-1.5 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={goToNextBug}
                                disabled={filteredBugs.findIndex(b => b._id === selectedBug._id) === filteredBugs.length - 1}
                                className="p-1.5 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Bug Details */}
                <div className="flex-1 overflow-y-auto p-4">
                    {!selectedBug ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <AlertCircle size={48} className="mb-3" />
                            <p className="text-sm">Select a bug to view details</p>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto">
                            {/* Header with Serial Number and Dropdowns */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <h2
                                        onClick={() => copyText(selectedBug.serialNumber)}
                                        className="text-sm font-semibold text-gray-800 cursor-pointer"
                                    >
                                        {selectedBug.serialNumber}
                                    </h2>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getBugTypeColor(selectedBug.bugType)}`}>
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
                                        className="min-w-[100px]"
                                    />
                                    <GitHubDropdown
                                        value={selectedBug.severity || 'Medium'}
                                        options={['Critical', 'High', 'Medium', 'Low']}
                                        onChange={(value) => handleFieldEdit('severity', value)}
                                        label="Severity"
                                        className="min-w-[100px]"
                                    />
                                    <GitHubDropdown
                                        value={selectedBug.status || 'New'}
                                        options={['New', 'Open', 'In Progress', 'In Review', 'Closed', 'Re Open']}
                                        onChange={(value) => handleFieldEdit('status', value)}
                                        label="Status"
                                        className="min-w-[120px]"
                                    />

                                    {/* Edit/Save buttons */}
                                    {!isEditing ? (
                                        <button
                                            onClick={handleEditClick}
                                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            <Edit size={12} />
                                            Edit
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={handleSaveClick}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                            >
                                                <Save size={12} />
                                                Save
                                            </button>
                                            <button
                                                onClick={handleCancelClick}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                                            >
                                                <X size={12} />
                                                Cancel
                                            </button>
                                        </div>
                                    )}

                                    {/* Archive and Delete buttons */}
                                    <button
                                        onClick={() => moveBugToTrash(selectedBug._id)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
                                    >
                                        <Archive size={12} />
                                        Archive
                                    </button>
                                    <button
                                        onClick={() => deleteBugPermanently(selectedBug._id)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        <Trash2 size={12} />
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column - Bug Details */}
                                <div className="lg:col-span-2 space-y-4">
                                    {/* Module Name */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Module</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editFormData.moduleName}
                                                onChange={(e) => setEditFormData(prev => ({ ...prev, moduleName: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded border">
                                                {selectedBug.moduleName || 'No module specified'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
                                        {isEditing ? (
                                            <textarea
                                                value={editFormData.bugDesc}
                                                onChange={(e) => setEditFormData(prev => ({ ...prev, bugDesc: e.target.value }))}
                                                rows={4}
                                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded border min-h-[100px]">
                                                {selectedBug.bugDesc || 'No description'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Requirement */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Requirement</label>
                                        {isEditing ? (
                                            <textarea
                                                value={editFormData.bugRequirement}
                                                onChange={(e) => setEditFormData(prev => ({ ...prev, bugRequirement: e.target.value }))}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded border min-h-[80px]">
                                                {selectedBug.bugRequirement || 'No requirement specified'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Reference Link */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Reference Link</label>
                                        {isEditing ? (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={editFormData.refLink}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, refLink: e.target.value }))}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <p className="flex-1 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded border truncate">
                                                    {selectedBug.refLink || 'No reference link'}
                                                </p>
                                                {selectedBug.refLink && (
                                                    <a
                                                        href={selectedBug.refLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1 text-xs"
                                                    >
                                                        <ExternalLink size={12} />
                                                        Open
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Timestamps */}
                                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-600">Created At</label>
                                            <p className="text-xs text-gray-700 mt-0.5">
                                                {new Date(selectedBug.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        {selectedBug.updatedAt && (
                                            <div>
                                                <label className="text-xs font-semibold text-gray-600">Updated At</label>
                                                <p className="text-xs text-gray-700 mt-0.5">
                                                    {new Date(selectedBug.updatedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column - Comments */}
                                <div className="lg:col-span-1">
                                    <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
                                        <MessageSquare size={14} />
                                        Comments
                                    </h3>

                                    {/* Add Comment */}
                                    <div className="mb-3">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Add a comment..."
                                            rows={2}
                                            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 mb-1.5"
                                        />
                                        <button
                                            onClick={() => submitComment(selectedBug._id)}
                                            disabled={!newComment.trim() || submittingComment}
                                            className="w-full px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center gap-1"
                                        >
                                            {submittingComment ? (
                                                <>
                                                    <Loader2 size={12} className="animate-spin" />
                                                    Posting...
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={12} />
                                                    Post Comment
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Comments List */}
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {loadingComments ? (
                                            <div className="flex items-center justify-center py-6">
                                                <Loader2 size={20} className="animate-spin text-blue-600" />
                                            </div>
                                        ) : comments.length === 0 ? (
                                            <div className="text-center py-6 text-gray-500 text-xs">
                                                No comments yet
                                            </div>
                                        ) : (
                                            comments.map((comment, index) => (
                                                <div key={index} className="bg-gray-50 rounded p-2">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-xs font-semibold text-blue-600">
                                                                {comment.commentBy?.charAt(0).toUpperCase() || 'U'}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-800">
                                                            {comment.commentBy || 'Unknown'}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(comment.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-700 pl-6">{comment.comment}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BugSplitView;