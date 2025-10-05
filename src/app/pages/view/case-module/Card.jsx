'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Search, AlertCircle, Loader2, RefreshCw, Archive, MessageSquare, ExternalLink, X, Send, ChevronLeft, ChevronRight, Eye, Calendar, Clock, Edit, Save, Image as ImageIcon } from 'lucide-react';

const TestCaseCardView = () => {
    const [testCases, setTestCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTestCase, setSelectedTestCase] = useState(null);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        moduleName: '',
        testCaseDescription: '',
        actualResult: '',
        expectedResult: ''
    });

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
        } catch (error) {
            console.error('Error updating test case:', error);
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
            actualResult: selectedTestCase.actualResult || '',
            expectedResult: selectedTestCase.expectedResult || ''
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
            actualResult: selectedTestCase.actualResult || '',
            expectedResult: selectedTestCase.expectedResult || ''
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

    useEffect(() => {
        fetchTestCases();
    }, [fetchTestCases]);

    const filteredTestCases = testCases.filter(tc =>
        Object.values(tc).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const getTestCaseTypeColor = (type) => {
        const colors = {
            'Functional': 'bg-blue-100 text-blue-700 border-blue-300',
            'Non-Functional': 'bg-purple-100 text-purple-700 border-purple-300',
            'Performance': 'bg-orange-100 text-orange-700 border-orange-300',
            'Security': 'bg-red-100 text-red-700 border-red-300',
            'Usability': 'bg-green-100 text-green-700 border-green-300'
        };
        return colors[type] || 'bg-gray-100 text-gray-700 border-gray-300';
    };

    const getStatusColor = (status) => {
        const colors = {
            'New': 'bg-blue-100 text-blue-700 border-blue-300',
            'Pass': 'bg-green-100 text-green-700 border-green-300',
            'Fail': 'bg-red-100 text-red-700 border-red-300',
            'Blocked': 'bg-yellow-100 text-yellow-700 border-yellow-300',
            'Skipped': 'bg-gray-100 text-gray-700 border-gray-300'
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

    const GitHubDropdown = ({ value, options, onChange, className = "" }) => {
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
                                        className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 ${value === option ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
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
                    <p className="text-gray-600 text-sm">Loading test cases...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-full mx-auto">
                {filteredTestCases.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <AlertCircle size={48} className="text-gray-400 mb-3" />
                        <p className="text-gray-600 text-sm">No test cases found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {filteredTestCases.map((testCase) => (
                            <motion.div
                                key={testCase._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <span className="text-xs font-semibold text-gray-500">{testCase.serialNumber}</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getTestCaseTypeColor(testCase.testCaseType)}`}>
                                            {testCase.testCaseType}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(testCase.status)}`}>
                                            {testCase.status}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-700 mb-2 line-clamp-2 min-h-[2rem]">
                                    {testCase.testCaseDescription || 'No description'}
                                </p>

                                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                                    <Clock size={12} />
                                    <span>
                                        {testCase.updatedAt
                                            ? `Updated: ${new Date(testCase.updatedAt).toLocaleDateString()} ${new Date(testCase.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                            : `Created: ${new Date(testCase.createdAt).toLocaleDateString()} ${new Date(testCase.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                        }
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                    <button
                                        onClick={() => {
                                            setSelectedTestCase(testCase);
                                            fetchComments(testCase._id);
                                        }}
                                        className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-xs"
                                    >
                                        <Eye size={12} />
                                        View
                                    </button>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => {
                                                setSelectedTestCase(testCase);
                                                fetchComments(testCase._id);
                                            }}
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                        >
                                            <MessageSquare size={12} />
                                        </button>
                                        <button
                                            onClick={() => moveTestCaseToTrash(testCase._id)}
                                            className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                                        >
                                            <Archive size={12} />
                                        </button>
                                        <button
                                            onClick={() => deleteTestCasePermanently(testCase._id)}
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
                {selectedTestCase && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
                        onClick={() => setSelectedTestCase(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white w-full h-full max-w-full max-h-100vh overflow-hidden flex flex-col"
                        >
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-sm font-semibold text-gray-800">{selectedTestCase.serialNumber}</h2>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getTestCaseTypeColor(selectedTestCase.testCaseType)}`}>
                                        {selectedTestCase.testCaseType}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        <GitHubDropdown
                                            value={selectedTestCase.priority || 'Medium'}
                                            options={['Critical', 'High', 'Medium', 'Low']}
                                            onChange={(value) => handleFieldEdit('priority', value)}
                                            className="min-w-[100px]"
                                        />
                                        <GitHubDropdown
                                            value={selectedTestCase.severity || 'Medium'}
                                            options={['Critical', 'High', 'Medium', 'Low']}
                                            onChange={(value) => handleFieldEdit('severity', value)}
                                            className="min-w-[100px]"
                                        />
                                        <GitHubDropdown
                                            value={selectedTestCase.status || 'New'}
                                            options={['New', 'Pass', 'Fail', 'Blocked', 'Skipped']}
                                            onChange={(value) => handleFieldEdit('status', value)}
                                            className="min-w-[120px]"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="text-xs text-gray-600 mr-2">
                                        Test Case {filteredTestCases.findIndex(tc => tc._id === selectedTestCase._id) + 1} of {filteredTestCases.length}
                                    </div>

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

                                    <button
                                        onClick={() => moveTestCaseToTrash(selectedTestCase._id)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
                                    >
                                        <Archive size={12} />
                                        Archive
                                    </button>
                                    <button
                                        onClick={() => deleteTestCasePermanently(selectedTestCase._id)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        <Trash2 size={12} />
                                        Delete
                                    </button>

                                    <button
                                        onClick={goToPreviousTestCase}
                                        disabled={filteredTestCases.findIndex(tc => tc._id === selectedTestCase._id) === 0}
                                        className="p-1.5 hover:bg-gray-200 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        onClick={goToNextTestCase}
                                        disabled={filteredTestCases.findIndex(tc => tc._id === selectedTestCase._id) === filteredTestCases.length - 1}
                                        className="p-1.5 hover:bg-gray-300 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                    <button
                                        onClick={() => setSelectedTestCase(null)}
                                        className="p-1.5 hover:bg-gray-300 bg-gray-200 rounded"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
                                    <div className="lg:col-span-2 space-y-4">
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
                                                    {selectedTestCase.moduleName || 'No module specified'}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-gray-600 mb-1 block">Test Case Description</label>
                                            {isEditing ? (
                                                <textarea
                                                    value={editFormData.testCaseDescription}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, testCaseDescription: e.target.value }))}
                                                    rows={4}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded border min-h-[100px]">
                                                    {selectedTestCase.testCaseDescription || 'No description'}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-gray-600 mb-1 block">Expected Result</label>
                                            {isEditing ? (
                                                <textarea
                                                    value={editFormData.expectedResult}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, expectedResult: e.target.value }))}
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded border min-h-[80px]">
                                                    {selectedTestCase.expectedResult || 'No expected result specified'}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-gray-600 mb-1 block">Actual Result</label>
                                            {isEditing ? (
                                                <textarea
                                                    value={editFormData.actualResult}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, actualResult: e.target.value }))}
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded border min-h-[80px]">
                                                    {selectedTestCase.actualResult || 'Not executed'}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-gray-600 mb-1 block">Screenshot</label>
                                            <div className="flex gap-2">
                                                <p className="flex-1 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded border truncate">
                                                    {selectedTestCase.image && selectedTestCase.image !== 'No image provided' ? 'Image available' : 'No image provided'}
                                                </p>
                                                {selectedTestCase.image && selectedTestCase.image !== 'No image provided' && (
                                                    <button
                                                        onClick={() => setShowImageModal(true)}
                                                        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1 text-xs"
                                                    >
                                                        <ImageIcon size={12} />
                                                        View
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                                            <div>
                                                <label className="text-xs font-semibold text-gray-600">Created At</label>
                                                <p className="text-xs text-gray-700 mt-0.5">
                                                    {new Date(selectedTestCase.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            {selectedTestCase.updatedAt && (
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-600">Updated At</label>
                                                    <p className="text-xs text-gray-700 mt-0.5">
                                                        {new Date(selectedTestCase.updatedAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="lg:col-span-1 border-l border-gray-200 pl-4">
                                        <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
                                            <MessageSquare size={14} />
                                            Comments
                                        </h3>

                                        <div className="mb-3">
                                            <textarea
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Add a comment..."
                                                rows={2}
                                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 mb-1.5"
                                            />
                                            <button
                                                onClick={() => submitComment(selectedTestCase._id)}
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

            {/* Image Modal */}
            <AnimatePresence>
                {showImageModal && selectedTestCase?.image && selectedTestCase.image !== 'No image provided' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
                        onClick={() => setShowImageModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative max-w-5xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
                        >
                            <div className="absolute top-2 right-2 z-10">
                                <button
                                    onClick={() => setShowImageModal(false)}
                                    className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-4">
                                <img
                                    src={selectedTestCase.image}
                                    alt="Test Case Screenshot"
                                    className="max-w-full max-h-[85vh] object-contain mx-auto"
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TestCaseCardView;