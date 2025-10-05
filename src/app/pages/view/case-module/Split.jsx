'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Search, AlertCircle, Loader2, RefreshCw, Archive, MessageSquare, ExternalLink, X, Send, ChevronLeft, ChevronRight, Eye, Calendar, Clock, Edit, Save, Menu, ChevronRight as ChevronRightIcon, Image as ImageIcon, Link2, Image } from 'lucide-react';

const TestCaseSplitView = () => {
    const [testCases, setTestCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTestCase, setSelectedTestCase] = useState(null);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [savingField, setSavingField] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(300);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isResizing, setIsResizing] = useState(false);
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const sidebarRef = useRef(null);
    const datePickerRef = useRef(null);

    const [editFormData, setEditFormData] = useState({
        moduleName: '',
        testCaseDescription: '',
        expectedResult: '',
        actualResult: ''
    });

    const copyText = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Serial Number Copied');
        }).catch(() => {
            console.log('Failed to copy');
        });
    };

    const projectId = typeof window !== 'undefined' ? localStorage.getItem("currentProjectId") : null;
    const testTypeId = typeof window !== 'undefined' ? localStorage.getItem("selectedTestTypeId") : null;
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

    const BASE_URL = 'http://localhost:5000/api/v1/test-case';
    const COMMENT_BASE_URL = 'http://localhost:5000/api/v1/comment';

    const fetchTestCases = useCallback(async () => {
        if (!projectId || !testTypeId || !token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases?page=1&limit=1000000`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to fetch test cases');

            const data = await response.json();
            setTestCases(data.testCases || []);
        } catch (error) {
            console.error('Error fetching test cases:', error);
        } finally {
            setLoading(false);
        }
    }, [projectId, testTypeId, token]);

    const fetchComments = async (testCaseId) => {
        if (!token || !testCaseId) return;

        setLoadingComments(true);

        try {
            const response = await fetch(
                `${COMMENT_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases/${testCaseId}/comments`,
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

    const submitComment = async (testCaseId) => {
        if (!newComment.trim() || submittingComment) return;

        setSubmittingComment(true);

        try {
            const response = await fetch(
                `${COMMENT_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases/${testCaseId}/comments`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        comment: newComment,
                        testCaseId: testCaseId
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

    const updateTestCase = async (testCaseId, field, value) => {
        setSavingField(field);

        try {
            const response = await fetch(
                `${BASE_URL}/test-cases/${testCaseId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ [field]: value })
                }
            );

            if (!response.ok) throw new Error('Failed to update test case');

            setTestCases(prev => prev.map(tc =>
                tc._id === testCaseId ? { ...tc, [field]: value } : tc
            ));

            if (selectedTestCase?._id === testCaseId) {
                setSelectedTestCase(prev => ({ ...prev, [field]: value }));
            }

            setTimeout(() => setSavingField(null), 500);
        } catch (error) {
            console.error('Error updating test case:', error);
            setSavingField(null);
        }
    };

    const updateTestCaseFields = async (testCaseId, fields) => {
        try {
            const response = await fetch(
                `${BASE_URL}/test-cases/${testCaseId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(fields)
                }
            );

            if (!response.ok) throw new Error('Failed to update test case');

            setTestCases(prev => prev.map(tc =>
                tc._id === testCaseId ? { ...tc, ...fields } : tc
            ));

            if (selectedTestCase?._id === testCaseId) {
                setSelectedTestCase(prev => ({ ...prev, ...fields }));
            }

            return true;
        } catch (error) {
            console.error('Error updating test case:', error);
            return false;
        }
    };

    const moveTestCaseToTrash = async (testCaseId) => {
        if (!confirm('Move this test case to trash?')) return;

        try {
            const response = await fetch(
                `${BASE_URL}/test-cases/${testCaseId}/trash`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to move test case to trash');

            setTestCases(prev => prev.filter(tc => tc._id !== testCaseId));
            if (selectedTestCase?._id === testCaseId) {
                setSelectedTestCase(null);
            }
        } catch (error) {
            console.error('Error moving test case to trash:', error);
        }
    };

    const deleteTestCasePermanently = async (testCaseId) => {
        if (!confirm('Permanently delete this test case? This action cannot be undone!')) return;

        try {
            const response = await fetch(
                `${BASE_URL}/test-cases/${testCaseId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to delete test case permanently');

            setTestCases(prev => prev.filter(tc => tc._id !== testCaseId));
            if (selectedTestCase?._id === testCaseId) {
                setSelectedTestCase(null);
            }
        } catch (error) {
            console.error('Error deleting test case permanently:', error);
        }
    };

    const handleFieldEdit = (field, value) => {
        updateTestCase(selectedTestCase._id, field, value);
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setEditFormData({
            moduleName: selectedTestCase.moduleName || '',
            testCaseDescription: selectedTestCase.testCaseDescription || '',
            expectedResult: selectedTestCase.expectedResult || '',
            actualResult: selectedTestCase.actualResult || ''
        });
    };

    const handleSaveClick = async () => {
        const success = await updateTestCaseFields(selectedTestCase._id, editFormData);
        if (success) {
            setIsEditing(false);
        }
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setEditFormData({
            moduleName: selectedTestCase.moduleName || '',
            testCaseDescription: selectedTestCase.testCaseDescription || '',
            expectedResult: selectedTestCase.expectedResult || '',
            actualResult: selectedTestCase.actualResult || ''
        });
    };

    const goToNextTestCase = () => {
        const currentIndex = filteredTestCases.findIndex(tc => tc._id === selectedTestCase._id);
        if (currentIndex < filteredTestCases.length - 1) {
            const nextTestCase = filteredTestCases[currentIndex + 1];
            setSelectedTestCase(nextTestCase);
            fetchComments(nextTestCase._id);
            setIsEditing(false);
        }
    };

    const goToPreviousTestCase = () => {
        const currentIndex = filteredTestCases.findIndex(tc => tc._id === selectedTestCase._id);
        if (currentIndex > 0) {
            const prevTestCase = filteredTestCases[currentIndex - 1];
            setSelectedTestCase(prevTestCase);
            fetchComments(prevTestCase._id);
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
        fetchTestCases();
    }, [fetchTestCases]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setShowDatePicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredTestCases = testCases.filter(testCase => {
        const matchesSearch = Object.values(testCase).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

        let matchesDate = true;
        if (dateFilter.start || dateFilter.end) {
            const testCaseDate = new Date(testCase.createdAt);
            if (dateFilter.start) {
                matchesDate = matchesDate && testCaseDate >= new Date(dateFilter.start);
            }
            if (dateFilter.end) {
                matchesDate = matchesDate && testCaseDate <= new Date(dateFilter.end);
            }
        }

        return matchesSearch && matchesDate;
    });

    const getTestCaseTypeColor = (type) => {
        const colors = {
            'Functional': 'bg-blue-100 text-blue-800 border-blue-300',
            'User-Interface': 'bg-purple-100 text-purple-800 border-purple-300',
            'Security': 'bg-red-100 text-red-800 border-red-300',
            'Database': 'bg-green-100 text-green-800 border-green-300',
            'Performance': 'bg-orange-100 text-orange-800 border-orange-300'
        };
        return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getStatusColor = (status) => {
        const colors = {
            'New': 'bg-blue-100 text-blue-800 border-blue-300',
            'Pass': 'bg-green-100 text-green-800 border-green-300',
            'Fail': 'bg-red-100 text-red-800 border-red-300',
            'Blocked': 'bg-gray-100 text-gray-800 border-gray-300',
            'Skip': 'bg-yellow-100 text-yellow-800 border-yellow-300'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'Critical': 'bg-red-100 text-red-800 border-red-300',
            'High': 'bg-orange-100 text-orange-800 border-orange-300',
            'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'Low': 'bg-green-100 text-green-800 border-green-300'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-300';
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

        const getDropdownColor = () => {
            if (label === 'Priority') return getPriorityColor(value);
            if (label === 'Status') return getStatusColor(value);
            if (label === 'Test Case Type') return getTestCaseTypeColor(value);
            if (label === 'Severity') return getPriorityColor(value);
            return 'bg-gray-100 text-gray-800 border-gray-300';
        };

        return (
            <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
                <button
                    type="button"
                    className={`inline-flex justify-between items-center w-full px-3 py-1.5 text-xs font-semibold border-2 rounded-lg hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm ${getDropdownColor()}`}
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
                    <p className="text-gray-600 text-sm font-medium">Loading test cases...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] w-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            {/* Sidebar */}
            <motion.div
                ref={sidebarRef}
                initial={{ width: sidebarWidth }}
                animate={{
                    width: isSidebarOpen ? sidebarWidth : 0,
                    opacity: isSidebarOpen ? 1 : 0
                }}
                transition={{
                    duration: 0.3,
                    ease: [0.4, 0.0, 0.2, 1]
                }}
                className="bg-white border-r border-gray-200 flex flex-col sidebar-scrollbar sticky top-0 h-full"
                style={{
                    minWidth: isSidebarOpen ? sidebarWidth : 0,
                    overflow: 'hidden'
                }}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h2 className="text-sm font-bold text-gray-800 tracking-wide">Test Case List</h2>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-1.5 hover:bg-white rounded-lg transition-colors"
                    >
                        <ChevronRightIcon size={16} className="text-gray-600" />
                    </motion.button>
                </div>

                {/* Search Bar with Date Filter */}
                <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search test cases..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                        />
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600"
                        >
                            <Calendar size={16} />
                        </motion.button>
                    </div>

                    {/* Date Filter Dropdown */}
                    <AnimatePresence>
                        {showDatePicker && (
                            <motion.div
                                ref={datePickerRef}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg"
                            >
                                <div className="space-y-2">
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 block mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={dateFilter.start}
                                            onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                                            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 block mb-1">End Date</label>
                                        <input
                                            type="date"
                                            value={dateFilter.end}
                                            onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                                            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setDateFilter({ start: '', end: '' })}
                                        className="w-full px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                    >
                                        Clear Filter
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Test Cases List */}
                <div className="flex-1 overflow-y-auto bg-gray-50">
                    {filteredTestCases.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-12"
                        >
                            <AlertCircle size={40} className="text-gray-400 mb-3" />
                            <p className="text-gray-600 text-xs font-medium">No test cases found</p>
                        </motion.div>
                    ) : (
                        <div className="space-y-2 p-3">
                            {filteredTestCases.map((testCase, index) => (
                                <motion.div
                                    key={testCase._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                    className={`bg-white rounded-xl border-2 p-3 cursor-pointer transition-all duration-200 ${selectedTestCase?._id === testCase._id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                    onClick={() => {
                                        setSelectedTestCase(testCase);
                                        fetchComments(testCase._id);
                                    }}
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{testCase.serialNumber}</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${getTestCaseTypeColor(testCase.testCaseType)}`}>
                                                {testCase.testCaseType}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${getStatusColor(testCase.status)}`}>
                                                {testCase.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs text-gray-700 mb-2 line-clamp-2 min-h-[2rem] leading-relaxed">
                                        {testCase.testCaseDescription || 'No description'}
                                    </p>

                                    {/* Date */}
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                                        <Clock size={12} className="text-gray-400" />
                                        <span>
                                            {testCase.updatedAt
                                                ? `Updated: ${new Date(testCase.updatedAt).toLocaleDateString()}`
                                                : `Created: ${new Date(testCase.createdAt).toLocaleDateString()}`
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
                                                    moveTestCaseToTrash(testCase._id);
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
                                                    deleteTestCasePermanently(testCase._id);
                                                }}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={13} />
                                            </motion.button>
                                            {testCase.image && testCase.image !== 'No image provided' && (
                                                <motion.a
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    href={testCase.image}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                >
                                                    <ImageIcon size={13} />
                                                </motion.a>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                                            <MessageSquare size={12} />
                                            <span className="font-medium">{comments.filter(c => c.testCaseId === testCase._id).length}</span>
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
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
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
                        {/* Header with Serial Number and Dropdowns */}
                        {selectedTestCase && (
                            <div className="flex items-center gap-3 ml-4">
                                <motion.h2
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => copyText(selectedTestCase.serialNumber)}
                                    className="text-sm font-bold text-gray-800 cursor-pointer bg-gray-100 px-3 py-2 rounded-lg"
                                >
                                    {selectedTestCase.serialNumber}
                                </motion.h2>
                                <GitHubDropdown
                                    value={selectedTestCase.testCaseType || 'Functional'}
                                    options={['Functional', 'User-Interface', 'Security', 'Database', 'Performance']}
                                    onChange={(value) => handleFieldEdit('testCaseType', value)}
                                    label="Test Case Type"
                                    className="min-w-[130px]"
                                />
                                <GitHubDropdown
                                    value={selectedTestCase.priority || 'Medium'}
                                    options={['Critical', 'High', 'Medium', 'Low']}
                                    onChange={(value) => handleFieldEdit('priority', value)}
                                    label="Priority"
                                    className="min-w-[110px]"
                                />
                                <GitHubDropdown
                                    value={selectedTestCase.severity || 'Medium'}
                                    options={['Critical', 'High', 'Medium', 'Low']}
                                    onChange={(value) => handleFieldEdit('severity', value)}
                                    label="Severity"
                                    className="min-w-[110px]"
                                />
                                <GitHubDropdown
                                    value={selectedTestCase.status || 'New'}
                                    options={['New', 'Pass', 'Fail', 'Blocked', 'Skip']}
                                    onChange={(value) => handleFieldEdit('status', value)}
                                    label="Status"
                                    className="min-w-[130px]"
                                />
                            </div>
                        )}
                    </div>

                    {selectedTestCase && (
                        <div className="flex items-center gap-3">
                            {/* Image Button */}
                            {selectedTestCase.image && selectedTestCase.image !== 'No image provided' && (
                                <motion.a
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    href={selectedTestCase.image}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-4 py-2 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm font-medium"
                                >
                                    <ImageIcon size={13} />
                                </motion.a>
                            )}

                            {/* Test Case counter */}
                            <div className="text-xs text-gray-600 font-medium bg-gray-100 px-3 py-1.5 rounded-lg">
                                Test Case {filteredTestCases.findIndex(tc => tc._id === selectedTestCase._id) + 1} of {filteredTestCases.length}
                            </div>

                            {/* Navigation buttons */}
                            <div className="flex items-center gap-1">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={goToPreviousTestCase}
                                    disabled={filteredTestCases.findIndex(tc => tc._id === selectedTestCase._id) === 0}
                                    className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={goToNextTestCase}
                                    disabled={filteredTestCases.findIndex(tc => tc._id === selectedTestCase._id) === filteredTestCases.length - 1}
                                    className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={18} />
                                </motion.button>
                            </div>

                            {/* Edit/Save buttons */}
                            {!isEditing ? (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleEditClick}
                                    className="flex items-center gap-1.5 px-4 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                                >
                                    <Edit size={13} />
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
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleCancelClick}
                                        className="flex items-center gap-1.5 px-4 py-2 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-sm font-medium"
                                    >
                                        <X size={13} />
                                    </motion.button>
                                </div>
                            )}

                            {/* Archive and Delete buttons */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => moveTestCaseToTrash(selectedTestCase._id)}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm font-medium"
                            >
                                <Archive size={13} />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => deleteTestCasePermanently(selectedTestCase._id)}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm font-medium"
                            >
                                <Trash2 size={13} />
                            </motion.button>
                        </div>
                    )}
                </div>

                {/* Test Case Details */}
                <div className="flex-1 overflow-y-auto p-1">
                    {!selectedTestCase ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center h-full text-gray-500"
                        >
                            <AlertCircle size={56} className="mb-4 text-gray-400" />
                            <p className="text-sm font-medium">Select a test case to view details</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-full mx-auto"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column - Test Case Details */}
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
                                                {selectedTestCase.moduleName || 'No module specified'}
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
                                                value={editFormData.testCaseDescription}
                                                onChange={(e) => setEditFormData(prev => ({ ...prev, testCaseDescription: e.target.value }))}
                                                rows={4}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                                placeholder="Enter test case description..."
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-700 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 min-h-[100px] leading-relaxed">
                                                {selectedTestCase.testCaseDescription || 'No description'}
                                            </p>
                                        )}
                                    </motion.div>

                                    {/* Expected Result */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
                                    >
                                        <label className="text-xs font-bold text-gray-600 mb-2 block tracking-wide">EXPECTED RESULT</label>
                                        {isEditing ? (
                                            <textarea
                                                value={editFormData.expectedResult}
                                                onChange={(e) => setEditFormData(prev => ({ ...prev, expectedResult: e.target.value }))}
                                                rows={3}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                                placeholder="Enter expected result..."
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-700 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 min-h-[80px] leading-relaxed">
                                                {selectedTestCase.expectedResult || 'No expected result specified'}
                                            </p>
                                        )}
                                    </motion.div>

                                    {/* Actual Result */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
                                    >
                                        <label className="text-xs font-bold text-gray-600 mb-2 block tracking-wide">ACTUAL RESULT</label>
                                        {isEditing ? (
                                            <textarea
                                                value={editFormData.actualResult}
                                                onChange={(e) => setEditFormData(prev => ({ ...prev, actualResult: e.target.value }))}
                                                rows={3}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                                placeholder="Enter actual result..."
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-700 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 min-h-[80px] leading-relaxed">
                                                {selectedTestCase.actualResult || 'Not executed'}
                                            </p>
                                        )}
                                    </motion.div>

                                    {/* Image Display */}
                                    {selectedTestCase.image && selectedTestCase.image !== 'No image provided' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
                                        >
                                            <label className="text-xs font-bold text-gray-600 mb-2 block tracking-wide">TEST CASE IMAGE</label>
                                            <div className="relative">
                                                <img
                                                    src={selectedTestCase.image}
                                                    alt="Test case screenshot"
                                                    className="w-full rounded-lg border border-gray-200"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Timestamps */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 }}
                                        className="grid grid-cols-2 gap-4 pt-2"
                                    >
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                            <label className="text-xs font-bold text-gray-600 mb-1.5 block tracking-wide flex items-center gap-1.5">
                                                <Calendar size={12} />
                                                CREATED AT
                                            </label>
                                            <p className="text-xs text-gray-700 font-medium">
                                                {new Date(selectedTestCase.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        {selectedTestCase.updatedAt && (
                                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                                <label className="text-xs font-bold text-gray-600 mb-1.5 block tracking-wide flex items-center gap-1.5">
                                                    <Clock size={12} />
                                                    UPDATED AT
                                                </label>
                                                <p className="text-xs text-gray-700 font-medium">
                                                    {new Date(selectedTestCase.updatedAt).toLocaleString()}
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
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 top-1">
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
                                                onClick={() => submitComment(selectedTestCase._id)}
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

export default TestCaseSplitView;