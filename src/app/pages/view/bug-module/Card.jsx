'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Search, AlertCircle, Loader2, RefreshCw, Archive, MessageSquare, ExternalLink, X, Send, ChevronLeft, ChevronRight, Eye, Calendar, Clock, Edit, Save } from 'lucide-react';

const BugCardView = () => {
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
    const [editFormData, setEditFormData] = useState({
        moduleName: '',
        bugDesc: '',
        bugRequirement: '',
        refLink: ''
    });

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
                    }
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
        <div className="min-h-screen bg-gray-50 p-4">
            {/* Bug Cards Grid */}
            <div className="max-w-full mx-auto">
                {filteredBugs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <AlertCircle size={48} className="text-gray-400 mb-3" />
                        <p className="text-gray-600 text-sm">No bugs found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {filteredBugs.map((bug) => (
                            <motion.div
                                key={bug._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <span className="text-xs font-semibold text-gray-500">#{bug.serialNumber}</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getBugTypeColor(bug.bugType)}`}>
                                            {bug.bugType}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(bug.status)}`}>
                                            {bug.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-xs text-gray-700 mb-2 line-clamp-2 min-h-[2rem]">
                                    {bug.bugDesc || 'No description'}
                                </p>

                                {/* Date */}
                                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                                    <Clock size={12} />
                                    <span>
                                        {bug.updatedAt
                                            ? `Updated: ${new Date(bug.updatedAt).toLocaleDateString()} ${new Date(bug.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                            : `Created: ${new Date(bug.createdAt).toLocaleDateString()} ${new Date(bug.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                        }
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                    <button
                                        onClick={() => {
                                            setSelectedBug(bug);
                                            fetchComments(bug._id);
                                        }}
                                        className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-xs"
                                    >
                                        <Eye size={12} />
                                        View
                                    </button>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => {
                                                setSelectedBug(bug);
                                                fetchComments(bug._id);
                                            }}
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                        >
                                            <MessageSquare size={12} />
                                        </button>
                                        <button
                                            onClick={() => moveBugToTrash(bug._id)}
                                            className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                                        >
                                            <Archive size={12} />
                                        </button>
                                        <button
                                            onClick={() => deleteBugPermanently(bug._id)}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Full Screen Modal */}
            <AnimatePresence>
                {selectedBug && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
                        onClick={() => setSelectedBug(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white w-full h-full max-w-full max-h-100vh overflow-hidden flex flex-col sidebar-scrollbar"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-sm font-semibold text-gray-800">Bug #{selectedBug.serialNumber}</h2>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getBugTypeColor(selectedBug.bugType)}`}>
                                        {selectedBug.bugType}
                                    </span>

                                    {/* Dropdowns in one line */}
                                    <div className="flex items-center gap-2">
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
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Bug counter */}
                                    <div className="text-xs text-gray-600 mr-2">
                                        Bug {filteredBugs.findIndex(b => b._id === selectedBug._id) + 1} of {filteredBugs.length}
                                    </div>

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

                                    {/* Navigation and Close */}
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
                                    <button
                                        onClick={() => setSelectedBug(null)}
                                        className="p-1.5 hover:bg-gray-200 rounded"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
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
                                    <div className="lg:col-span-1 border-l border-gray-200 pl-4">
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
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BugCardView;