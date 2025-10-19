// Updated TestCaseCardView with dark mode classes (dark:bg-gray-800 for bg classes, dark:bg-gray-100 for text classes)
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertCircle,
    Eye,
    Archive,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Edit,
    Save,
    X,
    Clock,
    Calendar,
    MessageSquare,
    Send,
    Loader2,
    Upload,
    ExternalLink,
    CheckCircle,
    Image as ImageIcon
} from 'lucide-react';
import { useTestType } from '@/app/script/TestType.context';
import { useAlert } from '@/app/script/Alert.context';
import { BUG_EVENTS } from '@/app/components/Sidebars/Bug';
import { BugCardSkeletonGrid } from '@/app/components/assets/Card.loader';

const TestCaseCardView = () => {
    const [testCases, setTestCases] = useState([]);
    const [filteredTestCases, setFilteredTestCases] = useState([]);
    const [selectedTestCase, setSelectedTestCase] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [uploadingImage, setUploadingImage] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef(null);
    const { showAlert } = useAlert();
    const { testTypeId, testTypeName } = useTestType();

    const projectId = typeof window !== 'undefined' ? localStorage.getItem("currentProjectId") : null;
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

    const BASE_URL = 'http://localhost:5000/api/v1/test-case';
    const COMMENT_BASE_URL = 'http://localhost:5000/api/v1/comment';
    const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dvytvjplt/image/upload';
    const CLOUDINARY_PRESET = 'test_case_preset';

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    useEffect(() => {
        const handleBugChange = () => {
            fetchTestCases();
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

    const fetchTestCases = async (page = 1) => {
        if (!projectId || !testTypeId) return;

        setLoading(true);
        try {
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases?page=${page}&limit=12`,
                { headers }
            );

            if (!response.ok) throw new Error('Failed to fetch test cases');

            const data = await response.json();
            setTestCases(data.testCases);
            setFilteredTestCases(data.testCases);
            setTotalPages(data.pagination?.totalPages || 1);
            setCurrentPage(data.pagination?.currentPage || 1);
            showAlert('success', 'Test cases loaded successfully');
        } catch (error) {
            showAlert('error', 'Failed to load test cases');
        } finally {
            setLoading(false);
        }
    };

    const fetchTestCase = async (testCaseId) => {
        try {
            const response = await fetch(`${BASE_URL}/test-cases/${testCaseId}`, { headers });
            if (!response.ok) throw new Error('Failed to fetch test case');
            return await response.json();
        } catch (error) {
            showAlert('error', 'Failed to load test case details');
        }
    };

    const updateTestCaseField = async (testCaseId, field, value) => {
        try {
            const response = await fetch(`${BASE_URL}/test-cases/${testCaseId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ [field]: value })
            });

            if (!response.ok) throw new Error('Failed to update test case');

            const data = await response.json();
            setTestCases(prev => prev.map(tc =>
                tc._id === testCaseId ? { ...tc, [field]: value } : tc
            ));
            setFilteredTestCases(prev => prev.map(tc =>
                tc._id === testCaseId ? { ...tc, [field]: value } : tc
            ));
            if (selectedTestCase && selectedTestCase._id === testCaseId) {
                setSelectedTestCase(prev => ({ ...prev, [field]: value }));
            }

            showAlert('success', 'Test case updated successfully');
            return data;
        } catch (error) {
            showAlert('error', 'Failed to update test case');
        }
    };

    const moveTestCaseToTrash = async (testCaseId) => {
        if (!confirm('Are you sure you want to move this test case to trash?')) return;

        try {
            const response = await fetch(`${BASE_URL}/test-cases/${testCaseId}/trash`, {
                method: 'PATCH',
                headers
            });

            if (!response.ok) throw new Error('Failed to move test case to trash');

            setTestCases(prev => prev.filter(tc => tc._id !== testCaseId));
            setFilteredTestCases(prev => prev.filter(tc => tc._id !== testCaseId));
            if (selectedTestCase && selectedTestCase._id === testCaseId) {
                setSelectedTestCase(null);
            }

            showAlert('success', 'Test case moved to trash');
        } catch (error) {
            showAlert('error', 'Failed to move test case to trash');
        }
    };

    const deleteTestCasePermanently = async (testCaseId) => {
        if (!confirm('Are you sure you want to permanently delete this test case? This action cannot be undone.')) return;

        try {
            const response = await fetch(`${BASE_URL}/test-cases/${testCaseId}/permanent`, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) throw new Error('Failed to delete test case');

            setTestCases(prev => prev.filter(tc => tc._id !== testCaseId));
            setFilteredTestCases(prev => prev.filter(tc => tc._id !== testCaseId));
            if (selectedTestCase && selectedTestCase._id === testCaseId) {
                setSelectedTestCase(null);
            }

            showAlert('success', 'Test case deleted permanently');
        } catch (error) {
            showAlert('error', 'Failed to delete test case');
        }
    };

    const fetchComments = async (testCaseId) => {
        if (!projectId || !testTypeId) return;

        setLoadingComments(true);
        try {
            const response = await fetch(
                `${COMMENT_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases/${testCaseId}/comments`,
                { headers }
            );

            if (!response.ok) throw new Error('Failed to fetch comments');

            const data = await response.json();
            setComments(data.comments || []);
            showAlert('success', 'Comments loaded successfully');
        } catch (error) {
            showAlert('error', 'Failed to load comments');
        } finally {
            setLoadingComments(false);
        }
    };

    const submitComment = async (testCaseId) => {
        if (!newComment.trim() || !projectId || !testTypeId) return;

        setSubmittingComment(true);
        try {
            const response = await fetch(
                `${COMMENT_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases/${testCaseId}/comments`,
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        comment: newComment,
                        testCaseId: testCaseId
                    })
                }
            );

            if (!response.ok) throw new Error('Failed to post comment');

            const data = await response.json();
            setComments(prev => [data.comment, ...prev]);
            setNewComment('');
            showAlert('success', 'Comment posted successfully');
        } catch (error) {
            showAlert('error', 'Failed to post comment');
        } finally {
            setSubmittingComment(false);
        }
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
            throw error;
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const imageUrl = await uploadImageToCloudinary(file);
            setEditFormData(prev => ({
                ...prev,
                image: imageUrl
            }));
            showAlert('success', 'Image uploaded successfully');
        } catch (error) {
            showAlert('error', 'Failed to upload image');
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
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
                    className="inline-flex items-center justify-between w-full px-3 py-1.5 text-sm font-medium text-gray-700 dark:bg-gray-100 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                            className="absolute right-0 mt-2 w-full min-w-[140px] rounded-lg shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50 overflow-hidden"
                        >
                            <div className="py-1">
                                {options.map((option) => (
                                    <button
                                        key={option}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:bg-gray-100 transition-colors ${value === option ? 'bg-blue-50 dark:bg-gray-800 text-blue-700 font-medium' : 'text-gray-700 dark:bg-gray-100'}`}
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

    const getTestCaseTypeColor = (type) => {
        const colors = {
            'Functional': 'bg-blue-500',
            'User-Interface': 'bg-purple-500',
            'Performance': 'bg-green-500',
            'API': 'bg-yellow-500',
            'Database': 'bg-indigo-500',
            'Security': 'bg-red-500',
            'Others': 'bg-gray-500'
        };
        return colors[type] || 'bg-gray-400';
    };

    const getStatusColor = (status) => {
        const colors = {
            'Pass': 'bg-green-500',
            'Fail': 'bg-red-500'
        };
        return colors[status] || 'bg-gray-400';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'Critical': 'bg-red-500',
            'High': 'bg-orange-500',
            'Medium': 'bg-yellow-500',
            'Low': 'bg-green-500'
        };
        return colors[priority] || 'bg-gray-400';
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setEditFormData({
            moduleName: selectedTestCase.moduleName || '',
            testCaseDescription: selectedTestCase.testCaseDescription || '',
            expectedResult: selectedTestCase.expectedResult || '',
            actualResult: selectedTestCase.actualResult || '',
            image: selectedTestCase.image || ''
        });
    };

    const handleSaveClick = async () => {
        try {
            const response = await fetch(`${BASE_URL}/test-cases/${selectedTestCase._id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(editFormData)
            });

            if (!response.ok) throw new Error('Failed to update test case');

            const data = await response.json();
            setSelectedTestCase(data.testCase);
            setTestCases(prev => prev.map(tc =>
                tc._id === selectedTestCase._id ? data.testCase : tc
            ));
            setFilteredTestCases(prev => prev.map(tc =>
                tc._id === selectedTestCase._id ? data.testCase : tc
            ));
            setIsEditing(false);
            showAlert('success', 'Test case updated successfully');
        } catch (error) {
            showAlert('error', 'Failed to update test case');
        }
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setEditFormData({});
    };

    const goToPreviousTestCase = () => {
        const currentIndex = filteredTestCases.findIndex(tc => tc._id === selectedTestCase._id);
        if (currentIndex > 0) {
            const previousTestCase = filteredTestCases[currentIndex - 1];
            setSelectedTestCase(previousTestCase);
            fetchComments(previousTestCase._id);
        }
    };

    const goToNextTestCase = () => {
        const currentIndex = filteredTestCases.findIndex(tc => tc._id === selectedTestCase._id);
        if (currentIndex < filteredTestCases.length - 1) {
            const nextTestCase = filteredTestCases[currentIndex + 1];
            setSelectedTestCase(nextTestCase);
            fetchComments(nextTestCase._id);
        }
    };

    const copyText = (text) => {
        navigator.clipboard.writeText(text);
        showAlert('success', 'Copied to clipboard');
    };

    useEffect(() => {
        fetchTestCases(currentPage);
    }, [projectId, testTypeId, currentPage]);

    useEffect(() => {
        if (selectedTestCase) {
            fetchComments(selectedTestCase._id);
        }
    }, [selectedTestCase]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-gray-800">
                <BugCardSkeletonGrid />
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-gray-800 p-2">
            <div className="max-w-full mx-auto">
                {filteredTestCases.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                        <AlertCircle size={64} className="text-gray-300 dark:bg-gray-100 mb-4" />
                        <p className="text-gray-500 dark:bg-gray-100 text-lg font-medium">No test cases found</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                            {filteredTestCases.map((testCase) => (
                                <motion.div
                                    key={testCase._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden"
                                >
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold text-gray-500 dark:bg-gray-100">{testCase.serialNumber}</span>
                                            <div className="flex gap-1.5">
                                                <span
                                                    className={`w-2 h-2 rounded-full ${getTestCaseTypeColor(testCase.testCaseType)}`}
                                                    tooltip-data={testCase.testCaseType}
                                                ></span>
                                                <span
                                                    className={`w-2 h-2 rounded-full ${getStatusColor(testCase.status)}`}
                                                    tooltip-data={testCase.status}
                                                ></span>
                                                <span
                                                    className={`w-2 h-2 rounded-full ${getPriorityColor(testCase.priority)}`}
                                                    tooltip-data={testCase.priority}
                                                ></span>
                                            </div>
                                        </div>
                                        <p
                                            content-data={testCase.testCaseDescription}
                                            content-placement="top"
                                            className="text-sm text-gray-800 dark:bg-gray-100 mb-3 line-clamp-2 min-h-[2.5rem] font-medium"
                                        >
                                            {testCase.testCaseDescription || 'No description'}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:bg-gray-100 mb-3">
                                            <Clock size={12} />
                                            <span>{new Date(testCase.updatedAt || testCase.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedTestCase(testCase);
                                                    fetchComments(testCase._id);
                                                }}
                                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-gray-800 hover:bg-blue-100 rounded-lg transition-colors"
                                            >
                                                <Eye size={14} />
                                                View
                                            </button>
                                            <button
                                                tooltip-data="Archive"
                                                tooltip-placement="bottom"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    moveTestCaseToTrash(testCase._id);
                                                }}
                                                className="p-2 text-orange-600 bg-orange-50 dark:bg-gray-800 hover:bg-orange-100 rounded-lg transition-colors"
                                            >
                                                <Archive size={14} />
                                            </button>
                                            <button
                                                tooltip-data="Delete"
                                                tooltip-placement="bottom"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteTestCasePermanently(testCase._id);
                                                }}
                                                className="p-2 text-red-600 bg-red-50 dark:bg-gray-800 hover:bg-red-100 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="flex items-center user-select-none justify-between bg-white dark:bg-gray-800 border border-gray-200 px-6 py-3 rounded-md shadow-sm">
                            <div className="text-sm text-gray-600 dark:bg-gray-100">
                                Page <span className="font-bold text-gray-900 dark:bg-gray-100">{currentPage}</span> of <span className="font-bold text-gray-900 dark:bg-gray-100">{totalPages}</span>
                            </div>
                            <div className="text-sm text-gray-600 dark:bg-gray-100">
                                Current Test Type: <span className="font-bold text-gray-900 dark:bg-gray-100">{testTypeName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    tooltip-data="Previous"
                                    tooltip-placement="top"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:bg-gray-100 bg-white dark:bg-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    tooltip-data="Next"
                                    tooltip-placement="top"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:bg-gray-100 bg-white dark:bg-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
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
                            className="bg-white dark:bg-gray-800 w-full max-w-full h-full sidebar-scrollbar overflow-hidden flex flex-col"
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:bg-gray-800 flex-shrink-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h2
                                        onClick={() => copyText(selectedTestCase.serialNumber)}
                                        className="text-lg font-bold text-gray-900 dark:bg-gray-100 cursor-pointer hover:text-blue-600 transition-colors"
                                    >
                                        {selectedTestCase.serialNumber}
                                    </h2>
                                    <ModernDropdown
                                        value={selectedTestCase.testCaseType || 'Functional'}
                                        options={['Functional', 'User-Interface', 'Performance', 'API', 'Database', 'Security', 'Others']}
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
                                        value={selectedTestCase.status || 'Pass'}
                                        options={['Pass', 'Fail']}
                                        onChange={(value) => updateTestCaseField(selectedTestCase._id, 'status', value)}
                                        className="w-32"
                                    />
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-sm text-gray-600 dark:bg-gray-100 font-medium bg-gray-200 dark:bg-gray-800 p-1 px-5 rounded-sm">
                                        {filteredTestCases.findIndex(tc => tc._id === selectedTestCase._id) + 1} / {filteredTestCases.length}
                                    </span>
                                    {!isEditing ? (
                                        <button
                                            tooltip-data="Edit"
                                            tooltip-placement="bottom"
                                            onClick={handleEditClick}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Edit size={14} />
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                tooltip-data="Save"
                                                tooltip-placement="bottom"
                                                onClick={handleSaveClick}
                                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                <Save size={14} />
                                            </button>
                                            <button
                                                tooltip-data="Cancel"
                                                tooltip-placement="bottom"
                                                onClick={handleCancelClick}
                                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </>
                                    )}
                                    <button
                                        tooltip-data="Archive"
                                        tooltip-placement="bottom"
                                        onClick={() => moveTestCaseToTrash(selectedTestCase._id)}
                                        className="p-2 text-orange-600 bg-orange-50 dark:bg-gray-800 hover:bg-orange-100 rounded-lg transition-colors"
                                    >
                                        <Archive size={18} />
                                    </button>
                                    <button
                                        tooltip-data="Delete"
                                        tooltip-placement="bottom"
                                        onClick={() => deleteTestCasePermanently(selectedTestCase._id)}
                                        className="p-2 text-red-600 bg-red-50 dark:bg-gray-800 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <div className="w-px h-6 bg-gray-300 mx-1"></div>
                                    <button
                                        tooltip-data="Previous Test Case"
                                        tooltip-placement="bottom"
                                        onClick={goToPreviousTestCase}
                                        disabled={filteredTestCases.findIndex(tc => tc._id === selectedTestCase._id) === 0}
                                        className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        tooltip-data="Next Test Case"
                                        tooltip-placement="bottom"
                                        onClick={goToNextTestCase}
                                        disabled={filteredTestCases.findIndex(tc => tc._id === selectedTestCase._id) === filteredTestCases.length - 1}
                                        className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                    <button
                                        tooltip-data="Close"
                                        tooltip-placement="bottom"
                                        onClick={() => setSelectedTestCase(null)}
                                        className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                                    <div className="lg:col-span-2 space-y-4">
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200"
                                        >
                                            <label className="text-xs font-bold text-gray-700 dark:bg-gray-100 mb-2 block uppercase tracking-wide">Module</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editFormData.moduleName || ''}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, moduleName: e.target.value }))}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter module name..."
                                                />
                                            ) : (
                                                <div className="text-sm text-gray-800 dark:bg-gray-100 font-medium">
                                                    {selectedTestCase.moduleName || 'No module specified'}
                                                </div>
                                            )}
                                        </motion.div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200"
                                        >
                                            <label className="text-xs font-bold text-gray-700 dark:bg-gray-100 mb-2 block uppercase tracking-wide">Description</label>
                                            {isEditing ? (
                                                <textarea
                                                    value={editFormData.testCaseDescription || ''}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, testCaseDescription: e.target.value }))}
                                                    rows={5}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                    placeholder="Describe the test case..."
                                                />
                                            ) : (
                                                <div className="text-sm text-gray-800 dark:bg-gray-100 leading-relaxed">
                                                    {selectedTestCase.testCaseDescription || 'No description'}
                                                </div>
                                            )}
                                        </motion.div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.15 }}
                                            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200"
                                        >
                                            <label className="text-xs font-bold text-gray-700 dark:bg-gray-100 mb-2 block uppercase tracking-wide">Expected Result</label>
                                            {isEditing ? (
                                                <textarea
                                                    value={editFormData.expectedResult || ''}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, expectedResult: e.target.value }))}
                                                    rows={4}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                    placeholder="Enter expected result..."
                                                />
                                            ) : (
                                                <div className="text-sm text-gray-800 dark:bg-gray-100 leading-relaxed">
                                                    {selectedTestCase.expectedResult || 'No expected result specified'}
                                                </div>
                                            )}
                                        </motion.div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200"
                                        >
                                            <label className="text-xs font-bold text-gray-700 dark:bg-gray-100 mb-2 block uppercase tracking-wide">Actual Result</label>
                                            {isEditing ? (
                                                <textarea
                                                    value={editFormData.actualResult || ''}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, actualResult: e.target.value }))}
                                                    rows={4}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                    placeholder="Enter actual result..."
                                                />
                                            ) : (
                                                <div className="text-sm text-gray-800 dark:bg-gray-100 leading-relaxed">
                                                    {selectedTestCase.actualResult || 'No actual result specified'}
                                                </div>
                                            )}
                                        </motion.div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200"
                                        >
                                            <label className="text-xs font-bold text-gray-700 dark:bg-gray-100 mb-3 uppercase tracking-wide flex items-center gap-2">
                                                <ImageIcon size={14} />
                                                Test Case Image
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
                                                                className="w-full h-40 object-cover rounded-lg border-2 border-gray-200"
                                                            />
                                                            <button
                                                                onClick={() => setEditFormData(prev => ({ ...prev, image: '' }))}
                                                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-lg transition-all"
                                                            >
                                                                <Trash2 size={14} />
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
                                                                    <span className="text-sm text-gray-600 dark:bg-gray-100">Uploading...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Upload size={32} className="text-gray-400 mb-2" />
                                                                    <span className="text-sm font-medium text-gray-700 dark:bg-gray-100">Click to upload image</span>
                                                                    <span className="text-xs text-gray-500 dark:bg-gray-100 mt-1">PNG, JPG, GIF up to 10MB</span>
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
                                                        >
                                                            <img
                                                                src={selectedTestCase.image}
                                                                alt="Test case screenshot"
                                                                className="w-full h-40 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-all"
                                                                onClick={() => window.open(selectedTestCase.image, '_blank')}
                                                            />
                                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <a
                                                                    href={selectedTestCase.image}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:bg-gray-800 transition-colors inline-block"
                                                                >
                                                                    <ExternalLink size={14} />
                                                                </a>
                                                            </div>
                                                        </motion.div>
                                                    ) : (
                                                        <div className="text-sm text-gray-500 dark:bg-gray-100 text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                                            No image available
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="grid grid-cols-2 gap-4"
                                        >
                                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:bg-gray-800 rounded-xl p-4 border border-blue-200">
                                                <label className="text-xs font-bold text-blue-700 dark:bg-gray-100 uppercase tracking-wide flex items-center gap-1 mb-1">
                                                    <Calendar size={12} />
                                                    Created At
                                                </label>
                                                <p className="text-sm text-blue-900 dark:bg-gray-100 font-medium">
                                                    {new Date(selectedTestCase.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            {selectedTestCase.updatedAt && (
                                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:bg-gray-800 rounded-xl p-4 border border-purple-200">
                                                    <label className="text-xs font-bold text-purple-700 dark:bg-gray-100 uppercase tracking-wide flex items-center gap-1 mb-1">
                                                        <Clock size={12} />
                                                        Updated At
                                                    </label>
                                                    <p className="text-sm text-purple-900 dark:bg-gray-100 font-medium">
                                                        {new Date(selectedTestCase.updatedAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            )}
                                        </motion.div>
                                    </div>
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="lg:col-span-1"
                                    >
                                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 p-4 sticky top-4">
                                            <h3 className="text-sm font-bold text-gray-800 dark:bg-gray-100 mb-4 flex items-center gap-2 uppercase tracking-wide">
                                                <MessageSquare size={16} />
                                                Comments ({comments.length})
                                            </h3>
                                            <div className="mb-4">
                                                <textarea
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="Write a comment..."
                                                    rows={3}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-2"
                                                />
                                                <button
                                                    onClick={() => submitComment(selectedTestCase._id)}
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
                                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                                {loadingComments ? (
                                                    <div className="flex items-center justify-center py-8">
                                                        <Loader2 size={24} className="animate-spin text-blue-600" />
                                                    </div>
                                                ) : comments.length === 0 ? (
                                                    <div className="text-center py-8 text-gray-400 dark:bg-gray-100">
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
                                                            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-xs font-bold text-white">
                                                                        {comment.commentBy?.charAt(0).toUpperCase() || 'U'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-semibold text-gray-900 dark:bg-gray-100 truncate">
                                                                        {comment.commentBy || 'Unknown'}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 dark:bg-gray-100">
                                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <p className="text-sm text-gray-700 dark:bg-gray-100 leading-relaxed break-words">
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

export default TestCaseCardView;