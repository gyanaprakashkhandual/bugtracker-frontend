'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Search, AlertCircle, Loader2, RefreshCw, Archive, MessageSquare, ExternalLink, X, Send, ChevronLeft, ChevronRight, Eye, Calendar, Clock, Edit, Save, Image as ImageIcon, Link as LinkIcon, Copy, Plus, Trash, Upload, CheckCircle } from 'lucide-react';
import { useTestType } from '@/app/script/TestType.context';
import { useAlert } from '@/app/script/Alert.context';

// Test Case Events
const TEST_CASE_EVENTS = {
    CREATED: 'testCase:created',
    UPDATED: 'testCase:updated',
    DELETED: 'testCase:deleted',
    TRASHED: 'testCase:trashed',
    RESTORED: 'testCase:restored',
    CHANGED: 'testCase:changed',
};

const emitTestCaseEvent = (eventType, testCaseData = null) => {
    if (typeof window !== 'undefined') {
        const event = new CustomEvent(eventType, {
            detail: { testCase: testCaseData, timestamp: Date.now() }
        });
        window.dispatchEvent(event);

        const changeEvent = new CustomEvent(TEST_CASE_EVENTS.CHANGED, {
            detail: { type: eventType, testCase: testCaseData, timestamp: Date.now() }
        });
        window.dispatchEvent(changeEvent);
    }
};

const TestCaseCardView = () => {
    const [testCases, setTestCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTestCase, setSelectedTestCase] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        moduleName: '',
        testCaseType: '',
        testCaseDescription: '',
        actualResult: '',
        expectedResult: '',
        severity: '',
        priority: '',
        status: '',
        image: ''
    });
    const [uploadingImage, setUploadingImage] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTestCases, setTotalTestCases] = useState(0);
    const itemsPerPage = 12;
    const fileInputRef = useRef(null);

    const { showAlert } = useAlert();

    const projectId = typeof window !== 'undefined' ? localStorage.getItem("currentProjectId") : null;
    const { testTypeId, testTypeName } = useTestType();
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

    const BASE_URL = 'http://localhost:5000/api/v1/test-case';
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
                image: imageUrl
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

    const fetchTestCases = useCallback(async () => {
        if (!projectId || !testTypeId || !token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases?page=${currentPage}&limit=${itemsPerPage}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to fetch test cases');

            const data = await response.json();
            setTestCases(data.testCases || []);
            setTotalPages(data.pagination?.totalPages || 1);
            setTotalTestCases(data.pagination?.totalTestCases || 0);
        } catch (error) {
            console.error('Error fetching test cases:', error);
        } finally {
            setLoading(false);
        }
    }, [projectId, testTypeId, token, currentPage]);

    const updateTestCaseField = async (testCaseId, field, value) => {
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

            const data = await response.json();

            setTestCases(prev => prev.map(tc =>
                tc._id === testCaseId ? data.testCase : tc
            ));

            if (selectedTestCase?._id === testCaseId) {
                setSelectedTestCase(data.testCase);
            }

            emitTestCaseEvent(TEST_CASE_EVENTS.UPDATED, data.testCase);
            showAlert({
                type: "success",
                message: "Test case updated successfully!"
            });
            return true;
        } catch (error) {
            console.error('Error updating test case:', error);
            return false;
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

            const data = await response.json();

            setTestCases(prev => prev.map(tc =>
                tc._id === testCaseId ? data.testCase : tc
            ));

            if (selectedTestCase?._id === testCaseId) {
                setSelectedTestCase(data.testCase);
            }

            emitTestCaseEvent(TEST_CASE_EVENTS.UPDATED, data.testCase);
            showAlert({
                type: "success",
                message: "Test case fields updated successfully!"
            });
            return true;
        } catch (error) {
            console.error('Error updating test case:', error);
            return false;
        }
    };

    const moveTestCaseToTrash = async (testCaseId) => {
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

            const data = await response.json();
            setTestCases(prev => prev.filter(tc => tc._id !== testCaseId));
            if (selectedTestCase?._id === testCaseId) {
                setSelectedTestCase(null);
            }
            emitTestCaseEvent(TEST_CASE_EVENTS.TRASHED, data.testCase);
            fetchTestCases();
            showAlert({
                type: "success",
                message: "Test case moved to trash successfully!"
            });
        } catch (error) {
            console.error('Error moving test case to trash:', error);
        }
    };

    const deleteTestCasePermanently = async (testCaseId) => {
        try {
            const response = await fetch(
                `${BASE_URL}/test-cases/${testCaseId}/permanent`,
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
            emitTestCaseEvent(TEST_CASE_EVENTS.DELETED, { _id: testCaseId });
            fetchTestCases();
            showAlert({
                type: "success",
                message: "Test case deleted permanently!"
            });
        } catch (error) {
            console.error('Error deleting test case permanently:', error);
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setEditFormData({
            moduleName: selectedTestCase.moduleName || '',
            testCaseType: selectedTestCase.testCaseType || 'Functional',
            testCaseDescription: selectedTestCase.testCaseDescription || '',
            actualResult: selectedTestCase.actualResult || '',
            expectedResult: selectedTestCase.expectedResult || '',
            severity: selectedTestCase.severity || 'Medium',
            priority: selectedTestCase.priority || 'Medium',
            status: selectedTestCase.status || 'Not Executed',
            image: selectedTestCase.image || ''
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
    };

    const removeImage = () => {
        setEditFormData(prev => ({
            ...prev,
            image: ''
        }));
    };

    const goToNextTestCase = () => {
        const currentIndex = filteredTestCases.findIndex(tc => tc._id === selectedTestCase._id);
        if (currentIndex < filteredTestCases.length - 1) {
            const nextTestCase = filteredTestCases[currentIndex + 1];
            setSelectedTestCase(nextTestCase);
            setIsEditing(false);
        }
    };

    const goToPreviousTestCase = () => {
        const currentIndex = filteredTestCases.findIndex(tc => tc._id === selectedTestCase._id);
        if (currentIndex > 0) {
            const prevTestCase = filteredTestCases[currentIndex - 1];
            setSelectedTestCase(prevTestCase);
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
            'Functional': 'bg-blue-500',
            'Non-Functional': 'bg-purple-500',
            'Integration': 'bg-green-500',
            'Regression': 'bg-orange-500',
            'Performance': 'bg-red-500'
        };
        return colors[type] || 'bg-gray-500';
    };

    const getStatusColor = (status) => {
        const colors = {
            'Not Executed': 'bg-gray-500',
            'Pass': 'bg-green-500',
            'Fail': 'bg-red-500',
            'Blocked': 'bg-orange-500',
            'In Progress': 'bg-yellow-500'
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
                    <p className="text-gray-600 font-medium">Loading test cases...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-2">
            <div className="max-w-full mx-auto">
                {filteredTestCases.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm">
                        <AlertCircle size={64} className="text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">No test cases found</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                            {filteredTestCases.map((testCase) => (
                                <motion.div
                                    key={testCase._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden"
                                >
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold text-gray-500">{testCase.serialNumber}</span>
                                            <div className="flex gap-1.5">
                                                <span className={`w-2 h-2 rounded-full ${getTestCaseTypeColor(testCase.testCaseType)}`} title={testCase.testCaseType}></span>
                                                <span className={`w-2 h-2 rounded-full ${getStatusColor(testCase.status)}`} title={testCase.status}></span>
                                            </div>
                                        </div>

                                        <p
                                            content-data={testCase.testCaseDescription}
                                            content-placement="top"
                                            className="text-sm text-gray-800 mb-3 line-clamp-2 min-h-[2.5rem] font-medium">
                                            {testCase.testCaseDescription || 'No description'}
                                        </p>

                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                            <Clock size={12} />
                                            <span>{new Date(testCase.updatedAt || testCase.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex items-center justify-between gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedTestCase(testCase);
                                                }}
                                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                            >
                                                <Eye size={14} />
                                                View
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    moveTestCaseToTrash(testCase._id);
                                                }}
                                                className="p-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                                            >
                                                <Archive size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteTestCasePermanently(testCase._id);
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
                        <div className="flex items-center user-select-none justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-3">
                            <div className="text-sm text-gray-600">
                                Page <span className="font-bold text-gray-900">{currentPage}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                                Current Test Type: <span className="font-bold text-gray-900">{testTypeName}</span>
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
                {selectedTestCase && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center"
                        onClick={() => setSelectedTestCase(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.3 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white w-full max-w-full h-full sidebar-scrollbar overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h2
                                        onClick={() => copyText(selectedTestCase.serialNumber)}
                                        className="text-lg font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                                    >
                                        {selectedTestCase.serialNumber}
                                    </h2>

                                    <ModernDropdown
                                        value={selectedTestCase.testCaseType || 'Functional'}
                                        options={['Functional', 'Non-Functional', 'Integration', 'Regression', 'Performance']}
                                        onChange={(value) => updateTestCaseField(selectedTestCase._id, 'testCaseType', value)}
                                        className="w-40"
                                    />
                                    <ModernDropdown
                                        value={selectedTestCase.priority || 'Medium'}
                                        options={['Critical', 'High', 'Medium', 'Low']}
                                        onChange={(value) => updateTestCaseField(selectedTestCase._id, 'priority', value)}
                                        className="w-32"
                                    />
                                    <ModernDropdown
                                        value={selectedTestCase.severity || 'Medium'}
                                        options={['Critical', 'High', 'Medium', 'Low']}
                                        onChange={(value) => updateTestCaseField(selectedTestCase._id, 'severity', value)}
                                        className="w-32"
                                    />
                                    <ModernDropdown
                                        value={selectedTestCase.status || 'Not Executed'}
                                        options={['Not Executed', 'Pass', 'Fail', 'Blocked', 'In Progress']}
                                        onChange={(value) => updateTestCaseField(selectedTestCase._id, 'status', value)}
                                        className="w-36"
                                    />
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-sm text-gray-600 font-medium">
                                        {filteredTestCases.findIndex(tc => tc._id === selectedTestCase._id) + 1} / {filteredTestCases.length}
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
                                        onClick={() => moveTestCaseToTrash(selectedTestCase._id)}
                                        className="p-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                                    >
                                        <Archive size={18} />
                                    </button>
                                    <button
                                        onClick={() => deleteTestCasePermanently(selectedTestCase._id)}
                                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                    <div className="w-px h-6 bg-gray-300 mx-1"></div>

                                    <button
                                        onClick={goToPreviousTestCase}
                                        disabled={filteredTestCases.findIndex(tc => tc._id === selectedTestCase._id) === 0}
                                        className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={goToNextTestCase}
                                        disabled={filteredTestCases.findIndex(tc => tc._id === selectedTestCase._id) === filteredTestCases.length - 1}
                                        className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                    <button
                                        onClick={() => setSelectedTestCase(null)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto bg-gray-50">
                                <div className="max-w-7xl mx-auto p-6 space-y-4">
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
                                                {selectedTestCase.moduleName || 'No module specified'}
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Test Case Description */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
                                    >
                                        <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wide">Test Case Description</label>
                                        {isEditing ? (
                                            <textarea
                                                value={editFormData.testCaseDescription}
                                                onChange={(e) => setEditFormData(prev => ({ ...prev, testCaseDescription: e.target.value }))}
                                                rows={5}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                placeholder="Describe the test case..."
                                            />
                                        ) : (
                                            <div className="text-sm text-gray-800 leading-relaxed">
                                                {selectedTestCase.testCaseDescription || 'No description'}
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Expected Result */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
                                    >
                                        <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wide">Expected Result</label>
                                        {isEditing ? (
                                            <textarea
                                                value={editFormData.expectedResult}
                                                onChange={(e) => setEditFormData(prev => ({ ...prev, expectedResult: e.target.value }))}
                                                rows={4}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                placeholder="Enter expected result..."
                                            />
                                        ) : (
                                            <div className="text-sm text-gray-800 leading-relaxed">
                                                {selectedTestCase.expectedResult || 'No expected result specified'}
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Actual Result */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
                                    >
                                        <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wide">Actual Result</label>
                                        {isEditing ? (
                                            <textarea
                                                value={editFormData.actualResult}
                                                onChange={(e) => setEditFormData(prev => ({ ...prev, actualResult: e.target.value }))}
                                                rows={4}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                placeholder="Enter actual result..."
                                            />
                                        ) : (
                                            <div className="text-sm text-gray-800 leading-relaxed">
                                                {selectedTestCase.actualResult || 'No actual result specified'}
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Screenshot/Image */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
                                    >
                                        <label className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                                            <ImageIcon size={14} />
                                            Screenshot
                                        </label>
                                        {isEditing ? (
                                            <div className="space-y-3">
                                                {editFormData.image && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="relative group"
                                                    >
                                                        <img
                                                            src={editFormData.image}
                                                            alt="Test case screenshot"
                                                            className="w-full max-w-md h-64 object-cover rounded-lg border-2 border-gray-200"
                                                        />
                                                        <button
                                                            onClick={removeImage}
                                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash size={14} />
                                                        </button>
                                                    </motion.div>
                                                )}
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
                                                                <span className="text-sm font-medium text-gray-700">Click to upload screenshot</span>
                                                                <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</span>
                                                            </>
                                                        )}
                                                    </label>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                {selectedTestCase.image ? (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="relative group"
                                                    >
                                                        <img
                                                            src={selectedTestCase.image}
                                                            alt="Test case screenshot"
                                                            className="w-full max-w-md h-64 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-all"
                                                            onClick={() => window.open(selectedTestCase.image, '_blank')}
                                                        />
                                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <a
                                                                href={selectedTestCase.image}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors inline-block"
                                                            >
                                                                <ExternalLink size={14} />
                                                            </a>
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <div className="text-sm text-gray-500 text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                                        No screenshot available
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
                                                {new Date(selectedTestCase.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        {selectedTestCase.updatedAt && (
                                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                                                <label className="text-xs font-bold text-purple-700 uppercase tracking-wide flex items-center gap-1 mb-1">
                                                    <Clock size={12} />
                                                    Updated At
                                                </label>
                                                <p className="text-sm text-purple-900 font-medium">
                                                    {new Date(selectedTestCase.updatedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Created By & Test Type Info */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        {selectedTestCase.user && (
                                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                                                <label className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1 block">
                                                    Created By
                                                </label>
                                                <p className="text-sm text-green-900 font-medium">
                                                    {selectedTestCase.user.name || selectedTestCase.user.email}
                                                </p>
                                                <p className="text-xs text-green-700 mt-1">
                                                    {selectedTestCase.user.role}
                                                </p>
                                            </div>
                                        )}
                                        {selectedTestCase.testType && (
                                            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
                                                <label className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-1 block">
                                                    Test Type
                                                </label>
                                                <p className="text-sm text-indigo-900 font-medium">
                                                    {selectedTestCase.testType.testTypeName}
                                                </p>
                                                {selectedTestCase.testType.testTypeDesc && (
                                                    <p className="text-xs text-indigo-700 mt-1 line-clamp-1">
                                                        {selectedTestCase.testType.testTypeDesc}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Project Info */}
                                    {selectedTestCase.project && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.7 }}
                                            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
                                        >
                                            <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wide">Project</label>
                                            <p className="text-sm text-gray-800 font-medium">
                                                {selectedTestCase.project.projectName}
                                            </p>
                                            {selectedTestCase.project.projectDesc && (
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {selectedTestCase.project.projectDesc}
                                                </p>
                                            )}
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TestCaseCardView;