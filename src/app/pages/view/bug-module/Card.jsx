'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Search, AlertCircle, Loader2, RefreshCw, Archive, MessageSquare, ExternalLink, X, Send, ChevronLeft, ChevronRight, Eye, Calendar, Clock, Edit, Save, Image as ImageIcon, Link as LinkIcon, Copy, Plus, Trash, Upload, CheckCircle } from 'lucide-react';
import { useTestType } from '@/app/script/TestType.context';

// Bug Events
const BUG_EVENTS = {
    CREATED: 'bug:created',
    UPDATED: 'bug:updated',
    DELETED: 'bug:deleted',
    TRASHED: 'bug:trashed',
    RESTORED: 'bug:restored',
    CHANGED: 'bug:changed',
};

const emitBugEvent = (eventType, bugData = null) => {
    if (typeof window !== 'undefined') {
        const event = new CustomEvent(eventType, {
            detail: { bug: bugData, timestamp: Date.now() }
        });
        window.dispatchEvent(event);

        const changeEvent = new CustomEvent(BUG_EVENTS.CHANGED, {
            detail: { type: eventType, bug: bugData, timestamp: Date.now() }
        });
        window.dispatchEvent(changeEvent);
    }
};

const BugCardView = () => {
    const [bugs, setBugs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBug, setSelectedBug] = useState(null);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        bugType: '',
        moduleName: '',
        bugDesc: '',
        bugRequirement: '',
        refLinks: [],
        images: [],
        priority: '',
        severity: '',
        status: ''
    });
    const [newRefLink, setNewRefLink] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalBugs, setTotalBugs] = useState(0);
    const itemsPerPage = 16;
    const fileInputRef = useRef(null);

    const projectId = typeof window !== 'undefined' ? localStorage.getItem("currentProjectId") : null;
    const { testTypeId, testTypeName } = useTestType();
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

    const BASE_URL = 'http://localhost:5000/api/v1/bug';
    const COMMENT_BASE_URL = 'http://localhost:5000/api/v1/comment';
    const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dvytvjplt/image/upload';
    const CLOUDINARY_PRESET = 'test_case_preset';

    const copyText = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied: ' + text);
        }).catch(() => {
            alert('Failed to copy!');
        });
    };

    const uploadImageToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_PRESET);

        try {
            const response = await fetch(CLOUDINARY_URL, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Failed to upload image');

            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const imageUrl = await uploadImageToCloudinary(file);
            setEditFormData(prev => ({
                ...prev,
                images: [...prev.images, imageUrl]
            }));
        } catch (error) {
            alert('Failed to upload image');
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const fetchBugs = useCallback(async () => {
        if (!projectId || !testTypeId || !token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs?page=${currentPage}&limit=${itemsPerPage}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to fetch bugs');

            const data = await response.json();
            setBugs(data.bugs || []);
            setTotalPages(data.pagination?.totalPages || 1);
            setTotalBugs(data.pagination?.totalBugs || 0);
        } catch (error) {
            console.error('Error fetching bugs:', error);
        } finally {
            setLoading(false);
        }
    }, [projectId, testTypeId, token, currentPage]);

    const fetchComments = async (bugId) => {
        if (!token || !bugId) return;

        setLoadingComments(true);

        try {
            const response = await fetch(
                `${COMMENT_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/${bugId}/comments`,
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
                `${COMMENT_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/${bugId}/comments`,
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

    const updateBugField = async (bugId, field, value) => {
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

            const data = await response.json();

            setBugs(prev => prev.map(bug =>
                bug._id === bugId ? data.bug : bug
            ));

            if (selectedBug?._id === bugId) {
                setSelectedBug(data.bug);
            }

            emitBugEvent(BUG_EVENTS.UPDATED, data.bug);
            return true;
        } catch (error) {
            console.error('Error updating bug:', error);
            return false;
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

            const data = await response.json();

            setBugs(prev => prev.map(bug =>
                bug._id === bugId ? data.bug : bug
            ));

            if (selectedBug?._id === bugId) {
                setSelectedBug(data.bug);
            }

            emitBugEvent(BUG_EVENTS.UPDATED, data.bug);
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
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/${bugId}/trash`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to move bug to trash');

            const data = await response.json();
            setBugs(prev => prev.filter(bug => bug._id !== bugId));
            if (selectedBug?._id === bugId) {
                setSelectedBug(null);
            }
            emitBugEvent(BUG_EVENTS.TRASHED, data.bug);
            fetchBugs();
        } catch (error) {
            console.error('Error moving bug to trash:', error);
        }
    };

    const deleteBugPermanently = async (bugId) => {
        if (!confirm('Permanently delete this bug? This action cannot be undone!')) return;

        try {
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/${bugId}/permanent`,
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
            emitBugEvent(BUG_EVENTS.DELETED, { _id: bugId });
            fetchBugs();
        } catch (error) {
            console.error('Error deleting bug permanently:', error);
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setEditFormData({
            bugType: selectedBug.bugType || 'Functional',
            moduleName: selectedBug.moduleName || '',
            bugDesc: selectedBug.bugDesc || '',
            bugRequirement: selectedBug.bugRequirement || '',
            refLinks: Array.isArray(selectedBug.refLinks) ? selectedBug.refLinks.filter(link => link && link !== 'No Link Provided') : [],
            images: Array.isArray(selectedBug.images) ? selectedBug.images.filter(img => img && img !== 'No Image Provided') : [],
            priority: selectedBug.priority || 'Medium',
            severity: selectedBug.severity || 'Medium',
            status: selectedBug.status || 'New'
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
    };

    const addRefLink = () => {
        if (newRefLink.trim()) {
            setEditFormData(prev => ({
                ...prev,
                refLinks: [...prev.refLinks, newRefLink.trim()]
            }));
            setNewRefLink('');
        }
    };

    const removeRefLink = (index) => {
        setEditFormData(prev => ({
            ...prev,
            refLinks: prev.refLinks.filter((_, i) => i !== index)
        }));
    };

    const removeImage = (index) => {
        setEditFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
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
            'Functional': 'bg-blue-500',
            'User-Interface': 'bg-purple-500',
            'Security': 'bg-red-500',
            'Database': 'bg-green-500',
            'Performance': 'bg-orange-500'
        };
        return colors[type] || 'bg-gray-500';
    };

    const getStatusColor = (status) => {
        const colors = {
            'New': 'bg-blue-500',
            'Open': 'bg-purple-500',
            'In Progress': 'bg-yellow-500',
            'In Review': 'bg-orange-500',
            'Closed': 'bg-green-500',
            'Re Open': 'bg-red-500'
        };
        return colors[status] || 'bg-gray-500';
    };

    const ModernDropdown = ({ value, options, onChange, className = "" }) => {
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
            <div className={`relative inline-block ${className}`} ref={dropdownRef}>
                <button
                    type="button"
                    className="inline-flex items-center justify-between w-full px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="truncate">{value}</span>
                    <svg className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-2 w-full min-w-[140px] rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden"
                        >
                            <div className="py-1">
                                {options.map((option) => (
                                    <button
                                        key={option}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${value === option ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                                        onClick={() => handleSelect(option)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{option}</span>
                                            {value === option && <CheckCircle size={14} className="text-blue-600" />}
                                        </div>
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
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading bugs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{testTypeName} Test Bugs</h1>
                    <p className="text-gray-600">Total {totalBugs} bugs found</p>
                </div>

                {filteredBugs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm">
                        <AlertCircle size={64} className="text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">No bugs found</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                            {filteredBugs.map((bug) => (
                                <motion.div
                                    key={bug._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden"
                                >
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold text-gray-500">{bug.serialNumber}</span>
                                            <div className="flex gap-1.5">
                                                <span className={`w-2 h-2 rounded-full ${getBugTypeColor(bug.bugType)}`} title={bug.bugType}></span>
                                                <span className={`w-2 h-2 rounded-full ${getStatusColor(bug.status)}`} title={bug.status}></span>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-800 mb-3 line-clamp-2 min-h-[2.5rem] font-medium">
                                            {bug.bugDesc || 'No description'}
                                        </p>

                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                            <Clock size={12} />
                                            <span>{new Date(bug.updatedAt || bug.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex items-center justify-between gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedBug(bug);
                                                    fetchComments(bug._id);
                                                }}
                                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                            >
                                                <Eye size={14} />
                                                View
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    moveBugToTrash(bug._id);
                                                }}
                                                className="p-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                                            >
                                                <Archive size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteBugPermanently(bug._id);
                                                }}
                                                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
                            <div className="text-sm text-gray-600">
                                Page <span className="font-bold text-gray-900">{currentPage}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Full Screen Modal */}
            <AnimatePresence>
                {selectedBug && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedBug(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.3 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white w-full max-w-7xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h2
                                        onClick={() => copyText(selectedBug.serialNumber)}
                                        className="text-lg font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                                    >
                                        {selectedBug.serialNumber}
                                    </h2>

                                    <ModernDropdown
                                        value={selectedBug.bugType || 'Functional'}
                                        options={['Functional', 'User-Interface', 'Security', 'Database', 'Performance']}
                                        onChange={(value) => updateBugField(selectedBug._id, 'bugType', value)}
                                        className="w-40"
                                    />
                                    <ModernDropdown
                                        value={selectedBug.priority || 'Medium'}
                                        options={['Critical', 'High', 'Medium', 'Low']}
                                        onChange={(value) => updateBugField(selectedBug._id, 'priority', value)}
                                        className="w-32"
                                    />
                                    <ModernDropdown
                                        value={selectedBug.severity || 'Medium'}
                                        options={['Critical', 'High', 'Medium', 'Low']}
                                        onChange={(value) => updateBugField(selectedBug._id, 'severity', value)}
                                        className="w-32"
                                    />
                                    <ModernDropdown
                                        value={selectedBug.status || 'New'}
                                        options={['New', 'Open', 'In Progress', 'In Review', 'Closed', 'Re Open']}
                                        onChange={(value) => updateBugField(selectedBug._id, 'status', value)}
                                        className="w-36"
                                    />
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-sm text-gray-600 font-medium">
                                        {filteredBugs.findIndex(b => b._id === selectedBug._id) + 1} / {filteredBugs.length}
                                    </span>

                                    {!isEditing ? (
                                        <button
                                            onClick={handleEditClick}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Edit size={14} />
                                            Edit
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleSaveClick}
                                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                <Save size={14} />
                                                Save
                                            </button>
                                            <button
                                                onClick={handleCancelClick}
                                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                            >
                                                <X size={14} />
                                                Cancel
                                            </button>
                                        </>
                                    )}

                                    <button
                                        onClick={() => moveBugToTrash(selectedBug._id)}
                                        className="p-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                                    >
                                        <Archive size={18} />
                                    </button>
                                    <button
                                        onClick={() => deleteBugPermanently(selectedBug._id)}
                                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                    <div className="w-px h-6 bg-gray-300 mx-1"></div>

                                    <button
                                        onClick={goToPreviousBug}
                                        disabled={filteredBugs.findIndex(b => b._id === selectedBug._id) === 0}
                                        className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={goToNextBug}
                                        disabled={filteredBugs.findIndex(b => b._id === selectedBug._id) === filteredBugs.length - 1}
                                        className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                    <button
                                        onClick={() => setSelectedBug(null)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto bg-gray-50">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                                    {/* Left Column - Bug Details */}
                                    <div className="lg:col-span-2 space-y-4">
                                        {/* Module Name */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
                                        >
                                            <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wide">Module</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editFormData.moduleName}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, moduleName: e.target.value }))}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter module name..."
                                                />
                                            ) : (
                                                <div className="text-sm text-gray-800 font-medium">
                                                    {selectedBug.moduleName || 'No module specified'}
                                                </div>
                                            )}
                                        </motion.div>

                                        {/* Description */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
                                        >
                                            <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wide">Description</label>
                                            {isEditing ? (
                                                <textarea
                                                    value={editFormData.bugDesc}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, bugDesc: e.target.value }))}
                                                    rows={5}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                    placeholder="Describe the bug..."
                                                />
                                            ) : (
                                                <div className="text-sm text-gray-800 leading-relaxed">
                                                    {selectedBug.bugDesc || 'No description'}
                                                </div>
                                            )}
                                        </motion.div>

                                        {/* Requirement */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
                                        >
                                            <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wide">Requirement</label>
                                            {isEditing ? (
                                                <textarea
                                                    value={editFormData.bugRequirement}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, bugRequirement: e.target.value }))}
                                                    rows={4}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                    placeholder="Enter requirement details..."
                                                />
                                            ) : (
                                                <div className="text-sm text-gray-800 leading-relaxed">
                                                    {selectedBug.bugRequirement || 'No requirement specified'}
                                                </div>
                                            )}
                                        </motion.div>

                                        {/* Reference Links */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
                                        >
                                            <label className="text-xs font-bold text-gray-700 mb-3 block uppercase tracking-wide flex items-center gap-2">
                                                <LinkIcon size={14} />
                                                Reference Links
                                            </label>
                                            {isEditing ? (
                                                <div className="space-y-3">
                                                    {editFormData.refLinks.map((link, index) => (
                                                        <motion.div
                                                            key={index}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="flex gap-2"
                                                        >
                                                            <input
                                                                type="text"
                                                                value={link}
                                                                onChange={(e) => {
                                                                    const newLinks = [...editFormData.refLinks];
                                                                    newLinks[index] = e.target.value;
                                                                    setEditFormData(prev => ({ ...prev, refLinks: newLinks }));
                                                                }}
                                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                placeholder="https://..."
                                                            />
                                                            <button
                                                                onClick={() => removeRefLink(index)}
                                                                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                            >
                                                                <Trash size={16} />
                                                            </button>
                                                        </motion.div>
                                                    ))}
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={newRefLink}
                                                            onChange={(e) => setNewRefLink(e.target.value)}
                                                            onKeyPress={(e) => e.key === 'Enter' && addRefLink()}
                                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            placeholder="Add new link..."
                                                        />
                                                        <button
                                                            onClick={addRefLink}
                                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                                        >
                                                            <Plus size={16} />
                                                            Add
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {selectedBug.refLinks && selectedBug.refLinks.length > 0 && selectedBug.refLinks[0] !== 'No Link Provided' ? (
                                                        selectedBug.refLinks.map((link, index) => (
                                                            <motion.div
                                                                key={index}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: index * 0.05 }}
                                                                className="flex gap-2 items-center bg-blue-50 px-4 py-3 rounded-lg border border-blue-100 hover:border-blue-200 transition-colors group"
                                                            >
                                                                <a
                                                                    href={link}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex-1 text-sm text-blue-600 hover:text-blue-700 truncate font-medium"
                                                                >
                                                                    {link}
                                                                </a>
                                                                <button
                                                                    onClick={() => copyText(link)}
                                                                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <Copy size={14} />
                                                                </button>
                                                                <a
                                                                    href={link}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                                                                >
                                                                    <ExternalLink size={14} />
                                                                </a>
                                                            </motion.div>
                                                        ))
                                                    ) : (
                                                        <div className="text-sm text-gray-500 text-center py-4">
                                                            No reference links
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>

                                        {/* Images */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
                                        >
                                            <label className="text-xs font-bold text-gray-700 mb-3 block uppercase tracking-wide flex items-center gap-2">
                                                <ImageIcon size={14} />
                                                Images
                                            </label>
                                            {isEditing ? (
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {editFormData.images.map((img, index) => (
                                                            <motion.div
                                                                key={index}
                                                                initial={{ opacity: 0, scale: 0.9 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                className="relative group"
                                                            >
                                                                <img
                                                                    src={img}
                                                                    alt={`Bug screenshot ${index + 1}`}
                                                                    className="w-full h-40 object-cover rounded-lg border-2 border-gray-200"
                                                                />
                                                                <button
                                                                    onClick={() => removeImage(index)}
                                                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                                                                >
                                                                    <Trash size={14} />
                                                                </button>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                                                        <input
                                                            ref={fileInputRef}
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleImageUpload}
                                                            className="hidden"
                                                            id="image-upload"
                                                        />
                                                        <label
                                                            htmlFor="image-upload"
                                                            className="flex flex-col items-center justify-center cursor-pointer"
                                                        >
                                                            {uploadingImage ? (
                                                                <>
                                                                    <Loader2 size={32} className="text-blue-600 animate-spin mb-2" />
                                                                    <span className="text-sm text-gray-600">Uploading...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Upload size={32} className="text-gray-400 mb-2" />
                                                                    <span className="text-sm font-medium text-gray-700">Click to upload image</span>
                                                                    <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</span>
                                                                </>
                                                            )}
                                                        </label>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-3">
                                                    {selectedBug.images && selectedBug.images.length > 0 && selectedBug.images[0] !== 'No Image Provided' ? (
                                                        selectedBug.images.map((img, index) => (
                                                            <motion.div
                                                                key={index}
                                                                initial={{ opacity: 0, scale: 0.9 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ delay: index * 0.05 }}
                                                                className="relative group"
                                                            >
                                                                <img
                                                                    src={img}
                                                                    alt={`Bug screenshot ${index + 1}`}
                                                                    className="w-full h-40 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-all"
                                                                    onClick={() => window.open(img, '_blank')}
                                                                />
                                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <a
                                                                        href={img}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors inline-block"
                                                                    >
                                                                        <ExternalLink size={14} />
                                                                    </a>
                                                                </div>
                                                            </motion.div>
                                                        ))
                                                    ) : (
                                                        <div className="col-span-2 text-sm text-gray-500 text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                                            No images available
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>

                                        {/* Timestamps */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="grid grid-cols-2 gap-4"
                                        >
                                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                                                <label className="text-xs font-bold text-blue-700 uppercase tracking-wide flex items-center gap-1 mb-1">
                                                    <Calendar size={12} />
                                                    Created At
                                                </label>
                                                <p className="text-sm text-blue-900 font-medium">
                                                    {new Date(selectedBug.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            {selectedBug.updatedAt && (
                                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                                                    <label className="text-xs font-bold text-purple-700 uppercase tracking-wide flex items-center gap-1 mb-1">
                                                        <Clock size={12} />
                                                        Updated At
                                                    </label>
                                                    <p className="text-sm text-purple-900 font-medium">
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
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-4">
                                            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
                                                <MessageSquare size={16} />
                                                Comments ({comments.length})
                                            </h3>

                                            {/* Add Comment */}
                                            <div className="mb-4">
                                                <textarea
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="Write a comment..."
                                                    rows={3}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-2"
                                                />
                                                <button
                                                    onClick={() => submitComment(selectedBug._id)}
                                                    disabled={!newComment.trim() || submittingComment}
                                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                                >
                                                    {submittingComment ? (
                                                        <>
                                                            <Loader2 size={16} className="animate-spin" />
                                                            Posting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send size={16} />
                                                            Post Comment
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            {/* Comments List */}
                                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                                {loadingComments ? (
                                                    <div className="flex items-center justify-center py-8">
                                                        <Loader2 size={24} className="animate-spin text-blue-600" />
                                                    </div>
                                                ) : comments.length === 0 ? (
                                                    <div className="text-center py-8 text-gray-400">
                                                        <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                                                        <p className="text-sm">No comments yet</p>
                                                    </div>
                                                ) : (
                                                    comments.map((comment, index) => (
                                                        <motion.div
                                                            key={comment._id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: index * 0.05 }}
                                                            className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-xs font-bold text-white">
                                                                        {comment.commentBy?.charAt(0).toUpperCase() || 'U'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-semibold text-gray-900 truncate">
                                                                        {comment.commentBy || 'Unknown'}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <p className="text-sm text-gray-700 leading-relaxed break-words">
                                                                {comment.comment}
                                                            </p>
                                                        </motion.div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
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