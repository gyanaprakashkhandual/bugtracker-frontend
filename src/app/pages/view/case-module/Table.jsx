'use client'
/* Updated TestCaseSpreadsheet component with dark:bg-gray-800 for bg classes and dark:bg-gray-100 for text classes */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Search, AlertCircle, Loader2, RefreshCw, Archive, ChevronDown, GripVertical, MessageSquare, ExternalLink, X, Send, ChevronLeft, ChevronRight, Image as ImageIcon, Save, Ban, LinkIcon, Copy, ZoomIn, Plus } from 'lucide-react';
import { useTestType } from '@/app/script/TestType.context';
import { useAlert } from '@/app/script/Alert.context';
import TableSkeletonLoader from '@/app/components/assets/Table.loader';

const TestCaseSpreadsheet = () => {
    const [testCases, setTestCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCell, setEditingCell] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [savingCells, setSavingCells] = useState(new Set());
    const [errorCells, setErrorCells] = useState(new Set());
    const [newRowData, setNewRowData] = useState({});
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [dropdownOpenUpward, setDropdownOpenUpward] = useState({});
    const [columnWidths, setColumnWidths] = useState({});
    const [rowHeights, setRowHeights] = useState({});
    const [resizing, setResizing] = useState(null);
    const [isCreatingTestCase, setIsCreatingTestCase] = useState(false);
    const [activeCommentModal, setActiveCommentModal] = useState(null);
    const [comments, setComments] = useState({});
    const [loadingComments, setLoadingComments] = useState({});
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTestCases, setTotalTestCases] = useState(0);
    const [newRowEditing, setNewRowEditing] = useState(false);
    const [newRowTempData, setNewRowTempData] = useState({});
    const [imagePreviewModal, setImagePreviewModal] = useState(null);
    const [activeImageModal, setActiveImageModal] = useState(null);

    const dropdownRef = useRef(null);
    const commentModalRef = useRef(null);
    const imageModalRef = useRef(null);
    const resizeStartX = useRef(0);
    const resizeStartY = useRef(0);
    const resizeStartWidth = useRef(0);
    const resizeStartHeight = useRef(0);
    const dropdownButtonRefs = useRef({});
    const commentButtonRefs = useRef({});
    const imageButtonRefs = useRef({});
    const fileInputRef = useRef(null);

    const { testTypeId, testTypeName } = useTestType();
    const { showAlert } = useAlert();

    const projectId = typeof window !== 'undefined' ? localStorage.getItem("currentProjectId") : null;
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

    const BASE_URL = 'http://localhost:5000/api/v1/test-case';
    const COMMENT_URL = 'http://localhost:5000/api/v1/comment';
    const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dvytvjplt/image/upload';
    const CLOUDINARY_PRESET = 'test_case_preset';
    const ROWS_PER_PAGE = 11;

    const columns = [
        { key: 'serialNumber', label: 'S.No', width: 90, editable: false, color: 'bg-purple-50 dark:bg-gray-800', sticky: true },
        { key: 'testCaseType', label: 'Type', width: 123, editable: true, type: 'select', options: ['Functional', 'User-Interface', 'Performance', 'API', 'Database', 'Security', 'Others'], color: 'bg-blue-50 dark:bg-gray-800', sticky: true },
        { key: 'moduleName', label: 'Module', width: 140, editable: true, color: 'bg-green-50 dark:bg-gray-800', sticky: true },
        { key: 'testCaseDescription', label: 'Description', width: 370, editable: true, color: 'bg-yellow-50 dark:bg-gray-800', expandable: true },
        { key: 'expectedResult', label: 'Expected Result', width: 250, editable: true, color: 'bg-pink-50 dark:bg-gray-800', expandable: true },
        { key: 'actualResult', label: 'Actual Result', width: 250, editable: true, color: 'bg-orange-50 dark:bg-gray-800', expandable: true },
        { key: 'priority', label: 'Priority', width: 90, editable: true, type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], color: 'bg-red-50 dark:bg-gray-800' },
        { key: 'status', label: 'Status', width: 85, editable: true, type: 'select', options: ['Pass', 'Fail'], color: 'bg-teal-50 dark:bg-gray-800' },
        { key: 'actions', label: 'Actions', width: 130, editable: false, color: 'bg-gray-100 dark:bg-gray-800' }
    ];

    useEffect(() => {
        const initialWidths = {};
        columns.forEach(col => {
            initialWidths[col.key] = col.width;
        });
        setColumnWidths(initialWidths);
        setRowHeights({ default: 48 });
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
            if (commentModalRef.current && !commentModalRef.current.contains(event.target)) {
                setActiveCommentModal(null);
            }
            if (imageModalRef.current && !imageModalRef.current.contains(event.target)) {
                setActiveImageModal(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchTestCases = useCallback(async (page = 1) => {
        if (!projectId || !testTypeId || !token) {
            showAlert('error', 'Missing required data');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases?page=${page}&limit=${ROWS_PER_PAGE}`,
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
            setCurrentPage(page);
        } catch (error) {
            showAlert('error', 'Failed to fetch test cases');
        } finally {
            setLoading(false);
        }
    }, [projectId, testTypeId, token]);

    const fetchComments = async (testCaseId) => {
        if (!token || loadingComments[testCaseId]) return;

        setLoadingComments(prev => ({ ...prev, [testCaseId]: true }));

        try {
            const response = await fetch(
                `${COMMENT_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases/${testCaseId}/comments`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to fetch comments');

            const data = await response.json();
            setComments(prev => ({ ...prev, [testCaseId]: data.comments || [] }));
        } catch (error) {
            showAlert('error', 'Failed to fetch comments');
        } finally {
            setLoadingComments(prev => ({ ...prev, [testCaseId]: false }));
        }
    };

    const submitComment = async (testCaseId) => {
        if (!newComment.trim() || submittingComment) return;

        setSubmittingComment(true);

        try {
            const response = await fetch(
                `${COMMENT_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases/${testCaseId}/comments`,
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
            setComments(prev => ({
                ...prev,
                [testCaseId]: [data.comment, ...(prev[testCaseId] || [])]
            }));
            setNewComment('');
            showAlert('success', 'Comment added successfully');
        } catch (error) {
            showAlert('error', 'Failed to submit comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    const uploadImageToCloudinary = async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_PRESET);

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

    const createTestCase = async (testCaseData) => {
        if (!token || isCreatingTestCase) return;

        if (!testCaseData.moduleName && !testCaseData.testCaseDescription) return;

        setIsCreatingTestCase(true);

        try {
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        testCaseType: testCaseData.testCaseType || 'Functional',
                        moduleName: testCaseData.moduleName || '',
                        testCaseDescription: testCaseData.testCaseDescription || '',
                        expectedResult: testCaseData.expectedResult || '',
                        actualResult: testCaseData.actualResult || '',
                        image: testCaseData.image || '',
                        priority: testCaseData.priority || 'Medium',
                        status: testCaseData.status || 'Pass'
                    })
                }
            );

            if (!response.ok) throw new Error('Failed to create test case');

            await fetchTestCases(currentPage);
            setNewRowData({});
            setNewRowEditing(false);
            setNewRowTempData({});
            showAlert('success', 'Test case created successfully');
        } catch (error) {
            showAlert('error', 'Failed to create test case');
        } finally {
            setIsCreatingTestCase(false);
        }
    };

    const updateTestCase = async (testCaseId, field, value) => {
        const cellKey = `${testCaseId}-${field}`;
        setSavingCells(prev => new Set([...prev, cellKey]));
        setErrorCells(prev => {
            const newSet = new Set(prev);
            newSet.delete(cellKey);
            return newSet;
        });

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

            setTimeout(() => {
                setSavingCells(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(cellKey);
                    return newSet;
                });
                showAlert('success', 'Field updated successfully');
            }, 500);
        } catch (error) {
            setErrorCells(prev => new Set([...prev, cellKey]));
            setSavingCells(prev => {
                const newSet = new Set(prev);
                newSet.delete(cellKey);
                return newSet;
            });
            showAlert('error', 'Failed to update field');

            setTestCases(prev => prev.map(testCase =>
                testCase._id === testCaseId ? { ...testCase, [field]: testCase[field] } : testCase
            ));
        }
    };

    const handleCellEdit = (testCaseId, columnKey, value) => {
        setTestCases(prev => prev.map(testCase =>
            testCase._id === testCaseId ? { ...testCase, [columnKey]: value } : testCase
        ));
        updateTestCase(testCaseId, columnKey, value);
    };

    const handleNewRowEdit = (columnKey, value) => {
        const updatedData = { ...newRowData, [columnKey]: value };
        setNewRowData(updatedData);
    };

    const handleNewRowManualSave = () => {
        if (Object.keys(newRowTempData).length > 0 || Object.keys(newRowData).length > 0) {
            const finalData = { ...newRowData, ...newRowTempData };
            createTestCase(finalData);
        }
        setNewRowEditing(false);
        setNewRowTempData({});
    };

    const handleNewRowCancel = () => {
        setNewRowEditing(false);
        setNewRowTempData({});
        setNewRowData({});
    };

    const handleNewRowCellClick = (columnKey) => {
        if (!newRowEditing) {
            setNewRowEditing(true);
        }
        const currentValue = newRowTempData[columnKey] || newRowData[columnKey] || '';
        startEditing('new', columnKey, currentValue);
    };

    const handleDropdownSelect = (testCaseId, columnKey, value) => {
        if (testCaseId === 'new') {
            if (newRowEditing) {
                setNewRowTempData(prev => ({ ...prev, [columnKey]: value }));
            } else {
                handleNewRowEdit(columnKey, value);
            }
        } else {
            handleCellEdit(testCaseId, columnKey, value);
        }
        setActiveDropdown(null);
    };

    const startEditing = (testCaseId, columnKey, value) => {
        setEditingCell({ testCaseId, columnKey });
        setEditValue(value || '');

        const column = columns.find(col => col.key === columnKey);
        if (column?.expandable) {
            setExpandedColumns(prev => new Set([...prev, columnKey]));
            setColumnWidths(prev => ({ ...prev, [columnKey]: 600 }));
        }
    };

    const stopEditing = () => {
        if (editingCell) {
            if (editingCell.testCaseId === 'new') {
                if (newRowEditing) {
                    setNewRowTempData(prev => ({ ...prev, [editingCell.columnKey]: editValue }));
                } else {
                    handleNewRowEdit(editingCell.columnKey, editValue);
                }
            } else {
                handleCellEdit(editingCell.testCaseId, editingCell.columnKey, editValue);
            }
        }
        setEditingCell(null);
        setEditValue('');

        setExpandedColumns(new Set());
        setColumnWidths(prev => {
            const newWidths = { ...prev };
            columns.forEach(col => {
                if (col.expandable) {
                    newWidths[col.key] = col.width;
                }
            });
            return newWidths;
        });
    };

    const handleImageUpload = async (testCaseId, file) => {
        if (!file) return;

        try {
            showAlert('success', 'Uploading image...');
            const imageUrl = await uploadImageToCloudinary(file);

            if (testCaseId === 'new') {
                if (newRowEditing) {
                    setNewRowTempData(prev => ({ ...prev, image: imageUrl }));
                } else {
                    handleNewRowEdit('image', imageUrl);
                }
            } else {
                handleCellEdit(testCaseId, 'image', imageUrl);
            }
            showAlert('success', 'Image uploaded successfully');
        } catch (error) {
            showAlert('error', 'Failed to upload image');
        }
    };

    const handleRemoveImage = (testCaseId) => {
        if (testCaseId === 'new') {
            if (newRowEditing) {
                setNewRowTempData(prev => ({ ...prev, image: '' }));
            } else {
                handleNewRowEdit('image', '');
            }
        } else {
            handleCellEdit(testCaseId, 'image', '');
        }
        showAlert('success', 'Image removed successfully');
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

            await fetchTestCases(currentPage);
            showAlert('success', 'Test case moved to trash');
        } catch (error) {
            showAlert('error', 'Failed to move test case to trash');
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

            await fetchTestCases(currentPage);
            showAlert('success', 'Test case deleted permanently');
        } catch (error) {
            showAlert('error', 'Failed to delete test case permanently');
        }
    };

    const startColumnResize = (columnKey, e) => {
        e.preventDefault();
        setResizing({ type: 'column', key: columnKey });
        resizeStartX.current = e.clientX;
        resizeStartWidth.current = columnWidths[columnKey];
    };

    const startRowResize = (rowKey, e) => {
        e.preventDefault();
        setResizing({ type: 'row', key: rowKey });
        resizeStartY.current = e.clientY;
        resizeStartHeight.current = rowHeights[rowKey] || rowHeights.default;
    };

    const handleMouseMove = useCallback((e) => {
        if (!resizing) return;

        if (resizing.type === 'column') {
            const diff = e.clientX - resizeStartX.current;
            const newWidth = Math.max(70, resizeStartWidth.current + diff);
            setColumnWidths(prev => ({ ...prev, [resizing.key]: newWidth }));
        } else if (resizing.type === 'row') {
            const diff = e.clientY - resizeStartY.current;
            const newHeight = Math.max(36, resizeStartHeight.current + diff);
            setRowHeights(prev => ({ ...prev, [resizing.key]: newHeight }));
        }
    }, [resizing]);

    const handleMouseUp = useCallback(() => {
        setResizing(null);
    }, []);

    useEffect(() => {
        if (resizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [resizing, handleMouseMove, handleMouseUp]);

    const filteredTestCases = testCases.filter(testCase =>
        Object.values(testCase).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const getPriorityColor = (priority) => {
        const colors = {
            'Critical': 'bg-red-100 dark:bg-gray-800 text-red-800 dark:bg-gray-100 border-red-300',
            'High': 'bg-orange-100 dark:bg-gray-800 text-orange-800 dark:bg-gray-100 border-orange-300',
            'Medium': 'bg-yellow-100 dark:bg-gray-800 text-yellow-800 dark:bg-gray-100 border-yellow-300',
            'Low': 'bg-green-100 dark:bg-gray-800 text-green-800 dark:bg-gray-100 border-green-300'
        };
        return colors[priority] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:bg-gray-100 border-gray-300';
    };

    const getStatusColor = (status) => {
        const colors = {
            'Pass': 'bg-green-100 dark:bg-gray-800 text-green-800 dark:bg-gray-100 border-green-300',
            'Fail': 'bg-red-100 dark:bg-gray-800 text-red-800 dark:bg-gray-100 border-red-300'
        };
        return colors[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:bg-gray-100 border-gray-300';
    };

    const getTestCaseTypeColor = (type) => {
        const colors = {
            'Functional': 'bg-blue-100 dark:bg-gray-800 text-blue-800 dark:bg-gray-100 border-blue-300',
            'User-Interface': 'bg-purple-100 dark:bg-gray-800 text-purple-800 dark:bg-gray-100 border-purple-300',
            'Performance': 'bg-green-100 dark:bg-gray-800 text-green-800 dark:bg-gray-100 border-green-300',
            'API': 'bg-yellow-100 dark:bg-gray-800 text-yellow-800 dark:bg-gray-100 border-yellow-300',
            'Database': 'bg-indigo-100 dark:bg-gray-800 text-indigo-800 dark:bg-gray-100 border-indigo-300',
            'Security': 'bg-red-100 dark:bg-gray-800 text-red-800 dark:bg-gray-100 border-red-300',
            'Others': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:bg-gray-100 border-gray-300'
        };
        return colors[type] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:bg-gray-100 border-gray-300';
    };

    const calculateDropdownPosition = (cellKey) => {
        const buttonElement = dropdownButtonRefs.current[cellKey];
        if (!buttonElement) return false;

        const rect = buttonElement.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        return spaceBelow < 300 && spaceAbove > spaceBelow;
    };

    const handleDropdownClick = (cellKey) => {
        if (activeDropdown === cellKey) {
            setActiveDropdown(null);
        } else {
            const shouldOpenUpward = calculateDropdownPosition(cellKey);
            setDropdownOpenUpward(prev => ({ ...prev, [cellKey]: shouldOpenUpward }));
            setActiveDropdown(cellKey);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showAlert('success', 'Copied to clipboard');
    };

    const renderDropdown = (testCaseId, column, value) => {
        const cellKey = `${testCaseId}-${column.key}`;
        const isActive = activeDropdown === cellKey;
        const openUpward = dropdownOpenUpward[cellKey] || false;

        let badgeClass = '';
        if (column.key === 'priority') {
            badgeClass = getPriorityColor(value);
        } else if (column.key === 'status') {
            badgeClass = getStatusColor(value);
        } else if (column.key === 'testCaseType') {
            badgeClass = getTestCaseTypeColor(value);
        }

        return (
            <div className="relative w-full h-full" ref={isActive ? dropdownRef : null}>
                <button
                    ref={(el) => {
                        if (el) dropdownButtonRefs.current[cellKey] = el;
                    }}
                    onClick={() => handleDropdownClick(cellKey)}
                    className="w-full h-full px-2 py-1.5 flex items-center justify-between hover:bg-gray-50 dark:bg-gray-800 transition-colors group"
                >
                    <span className={`px-2 py-1 w-full rounded text-xs font-medium border ${badgeClass}`}>
                        {value || 'Select'}
                    </span>
                </button>

                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            initial={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className={`absolute ${openUpward ? 'bottom-full mb-1' : 'top-full mt-1'} left-0 w-48 bg-white dark:bg-gray-800 border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden`}
                        >
                            <div className="py-1 max-h-64 overflow-y-auto">
                                {column.options.map((option) => {
                                    let optionBadgeClass = '';
                                    if (column.key === 'priority') {
                                        optionBadgeClass = getPriorityColor(option);
                                    } else if (column.key === 'status') {
                                        optionBadgeClass = getStatusColor(option);
                                    } else if (column.key === 'testCaseType') {
                                        optionBadgeClass = getTestCaseTypeColor(option);
                                    }

                                    return (
                                        <button
                                            key={option}
                                            onClick={() => handleDropdownSelect(testCaseId, column.key, option)}
                                            className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-50 dark:bg-gray-800 transition-colors flex items-center justify-between ${value === option ? 'bg-blue-50 dark:bg-gray-800' : ''}`}
                                        >
                                            <span className={`px-2 py-1 rounded text-xs font-medium border ${optionBadgeClass}`}>
                                                {option}
                                            </span>
                                            {value === option && (
                                                <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-gray-100 rounded-full"></div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const renderImageButton = (testCaseId, image) => {
        const cellKey = `image-${testCaseId}`;
        const isActive = activeImageModal === cellKey;
        const hasImage = image && image !== 'No Image Provided';

        const buttonRef = imageButtonRefs.current[cellKey];
        const rect = buttonRef?.getBoundingClientRect();
        const spaceBelow = window.innerHeight - (rect?.bottom || 0);
        const openUpward = spaceBelow < 200;

        return (
            <>
                <button
                    ref={(el) => {
                        if (el) imageButtonRefs.current[cellKey] = el;
                    }}
                    onClick={() => setActiveImageModal(isActive ? null : cellKey)}
                    className={`p-1.5 rounded transition-colors relative ${hasImage ? 'text-purple-600 dark:bg-gray-100 hover:bg-purple-50 dark:bg-gray-800' : 'text-gray-400 dark:bg-gray-100 hover:bg-gray-50 dark:bg-gray-800'}`}
                >
                    <ImageIcon size={14} />
                </button>

                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            ref={imageModalRef}
                            initial={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className={`absolute ${openUpward ? 'bottom-full mb-2' : 'top-full mt-2'} right-0 w-64 bg-white dark:bg-gray-800 border border-gray-200 rounded-lg shadow-xl z-50`}
                        >
                            <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-800 dark:bg-gray-100 text-sm">Test Case Image</h3>
                                <button
                                    onClick={() => setActiveImageModal(null)}
                                    className="text-gray-400 dark:bg-gray-100 hover:text-gray-600 dark:bg-gray-100 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="p-3">
                                {hasImage ? (
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <img
                                                src={image}
                                                alt="Test case screenshot"
                                                className="w-full h-32 object-cover rounded border border-gray-200"
                                            />
                                            <div className="absolute top-2 right-2 flex gap-1">
                                                <button
                                                    onClick={() => setImagePreviewModal(image)}
                                                    className="p-1 bg-white dark:bg-gray-800 rounded shadow hover:bg-gray-50 dark:bg-gray-800 transition-colors"
                                                    tooltip-data="View full size"
                                                >
                                                    <ZoomIn size={12} />
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveImage(testCaseId)}
                                                    className="p-1 bg-white dark:bg-gray-800 rounded shadow hover:bg-red-50 dark:bg-gray-800 text-red-600 dark:bg-gray-100 transition-colors"
                                                    tooltip-data="Remove image"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full px-2 py-1.5 text-xs bg-purple-600 dark:bg-gray-800 text-white dark:bg-gray-100 rounded hover:bg-purple-700 dark:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <ImageIcon size={14} />
                                            Change Image
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full px-2 py-1.5 text-xs bg-purple-600 dark:bg-gray-800 text-white dark:bg-gray-100 rounded hover:bg-purple-700 dark:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                                    >
                                        <ImageIcon size={14} />
                                        Upload Image
                                    </button>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            handleImageUpload(testCaseId, file);
                                            setActiveImageModal(null);
                                        }
                                    }}
                                    className="hidden"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
        );
    };

    const renderCommentModal = (testCaseId, buttonRef) => {
        const isActive = activeCommentModal === testCaseId;
        const testCaseComments = comments[testCaseId] || [];
        const isLoading = loadingComments[testCaseId];

        if (!isActive) return null;

        const rect = buttonRef?.getBoundingClientRect();
        const spaceBelow = window.innerHeight - (rect?.bottom || 0);
        const openUpward = spaceBelow < 400;

        return (
            <motion.div
                ref={commentModalRef}
                initial={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`absolute ${openUpward ? 'bottom-full mb-2' : 'top-full mt-2'} right-0 w-80 bg-white dark:bg-gray-800 border border-gray-200 rounded-lg shadow-xl z-50`}
                style={{ maxHeight: '360px' }}
            >
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                    <div className="flex items-center gap-1.5">
                        <MessageSquare size={16} className="text-gray-600 dark:bg-gray-100" />
                        <h3 className="font-semibold text-gray-800 dark:bg-gray-100 text-sm">Comments</h3>
                    </div>
                    <button
                        onClick={() => setActiveCommentModal(null)}
                        className="text-gray-400 dark:bg-gray-100 hover:text-gray-600 dark:bg-gray-100 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="px-3 py-2 border-b border-gray-200">
                    <div className="flex gap-1.5">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    submitComment(testCaseId);
                                }
                            }}
                            placeholder="Add a comment..."
                            className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            disabled={submittingComment}
                        />
                        <button
                            onClick={() => submitComment(testCaseId)}
                            disabled={!newComment.trim() || submittingComment}
                            className="px-2 py-1.5 bg-blue-600 dark:bg-gray-800 text-white dark:bg-gray-100 rounded hover:bg-blue-700 dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {submittingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto" style={{ maxHeight: '220px' }}>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 size={20} className="animate-spin text-blue-600 dark:bg-gray-100" />
                        </div>
                    ) : testCaseComments.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 dark:bg-gray-100 text-xs">
                            No comments yet. Be the first to comment!
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:bg-gray-800">
                            {testCaseComments.map((comment, index) => (
                                <div key={index} className="px-3 py-2">
                                    <div className="flex items-start gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-semibold text-blue-600 dark:bg-gray-100">
                                                {comment.commentBy?.charAt(0).toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className="text-xs font-semibold text-gray-800 dark:bg-gray-100">
                                                    {comment.commentBy || 'Unknown User'}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:bg-gray-100">
                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-700 dark:bg-gray-100 break-words">{comment.comment}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    const renderCellContent = (testCase, column, isNewRow = false) => {
        const testCaseId = isNewRow ? 'new' : testCase?._id;
        const value = isNewRow ? (newRowTempData[column.key] || newRowData[column.key]) : testCase?.[column.key];
        const cellKey = `${testCaseId}-${column.key}`;
        const isSaving = savingCells.has(cellKey);
        const hasError = errorCells.has(cellKey);
        const rowHeight = rowHeights[testCaseId] || rowHeights.default;

        if (column.key === 'actions') {
            if (isNewRow) {
                return (
                    <div className="flex items-center justify-center h-full space-x-1">
                        {renderImageButton('new', newRowTempData.image || newRowData.image)}
                        {newRowEditing && (
                            <>
                                <button
                                    onClick={handleNewRowManualSave}
                                    className="p-1.5 text-green-600 dark:bg-gray-100 hover:bg-green-50 dark:bg-gray-800 rounded transition-colors"
                                    disabled={isCreatingTestCase}
                                    tooltip-data="Save"
                                >
                                    <Save size={14} />
                                </button>
                                <button
                                    onClick={handleNewRowCancel}
                                    className="p-1.5 text-red-600 dark:bg-gray-100 hover:bg-red-50 dark:bg-gray-800 rounded transition-colors"
                                    tooltip-data="Cancel"
                                >
                                    <Ban size={14} />
                                </button>
                            </>
                        )}
                        {isCreatingTestCase && <Loader2 size={14} className="animate-spin text-blue-500 dark:bg-gray-100" />}
                    </div>
                );
            }

            return (
                <div className="flex items-center justify-center h-full space-x-0.5 relative">
                    {renderImageButton(testCase._id, testCase.image)}
                    <button
                        ref={(el) => {
                            if (el) commentButtonRefs.current[testCase._id] = el;
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (activeCommentModal === testCase._id) {
                                setActiveCommentModal(null);
                            } else {
                                setActiveCommentModal(testCase._id);
                                fetchComments(testCase._id);
                            }
                        }}
                        classGDP className="p-1.5 text-blue-600 dark:bg-gray-100 hover:bg-blue-50 dark:bg-gray-800 rounded transition-colors"
                        tooltip-data="Comment"
                    >
                        <MessageSquare size={14} />
                    </button>
                    <button
                        onClick={() => moveTestCaseToTrash(testCase._id)}
                        className="p-1.5 text-orange-600 dark:bg-gray-100 hover:bg-orange-50 dark:bg-gray-800 rounded transition-colors"
                        tooltip-data="Trash"
                    >
                        <Archive size={14} />
                    </button>
                    <button
                        onClick={() => deleteTestCasePermanently(testCase._id)}
                        className="p-1.5 text-red-600 dark:bg-gray-100 hover:bg-red-50 dark:bg-gray-800 rounded transition-colors"
                        tooltip-data="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                    {renderCommentModal(testCase._id, commentButtonRefs.current[testCase._id])}
                </div>
            );
        }

        if (column.key === 'serialNumber' && !isNewRow) {
            return (
                <div className="flex items-center justify-center h-full px-2 font-medium text-gray-700 dark:bg-gray-100 text-xs">
                    {value}
                </div>
            );
        }

        if (column.type === 'select') {
            return renderDropdown(testCaseId, column, value);
        }

        if (editingCell?.testCaseId === testCaseId && editingCell?.columnKey === column.key) {
            return (
                <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={stopEditing}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            stopEditing();
                        }
                        if (e.key === 'Escape') {
                            setEditingCell(null);
                            setEditValue('');
                        }
                    }}
                    className="w-full h-full border-2 border-blue-500 outline-none bg-white dark:bg-gray-800 px-2 py-1.5 text-xs resize-none"
                    autoFocus
                    style={{ minHeight: rowHeight }}
                />
            );
        }

        const displayValue = value || '';

        return (
            <div
                className={`w-full h-full px-2 py-1.5 flex items-center text-xs relative ${column.editable ? 'cursor-pointer hover:bg-gray-50 dark:bg-gray-800' : ''}`}
                onDoubleClick={() => column.editable && (isNewRow ? handleNewRowCellClick(column.key) : startEditing(testCaseId, column.key, value))}
                style={{
                    minHeight: rowHeight,
                    maxHeight: rowHeight,
                    overflow: 'hidden'
                }}
                content-data={column.expandable && value ? value : ''}
                content-placement="top"
            >
                <span
                    className={`flex-1 ${!value && isNewRow ? 'text-gray-400 dark:bg-gray-100 italic' : ''}`}
                    style={{
                        lineHeight: '1.4',
                        maxHeight: rowHeight - 12,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: Math.floor((rowHeight - 12) / 18),
                        WebkitBoxOrient: 'vertical'
                    }}
                >
                    {value ? displayValue : (isNewRow ? 'Double-click to edit' : '')}
                </span>
                {isSaving && <Loader2 size={12} className="ml-1 animate-spin text-blue-500 dark:bg-gray-100 flex-shrink-0" />}
                {hasError && <AlertCircle size={12} className="ml-1 text-red-500 dark:bg-gray-100 flex-shrink-0" />}
            </div>
        );
    };

    useEffect(() => {
        fetchTestCases(1);
    }, [fetchTestCases]);

    const getStickyLeftPosition = (columnKey) => {
        let position = 0;
        for (const col of columns) {
            if (col.key === columnKey) break;
            if (col.sticky) {
                position += columnWidths[col.key] || col.width;
            }
        }
        return position;
    };

    const goToFirstPage = () => fetchTestCases(1);
    const goToLastPage = () => fetchTestCases(totalPages);
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            fetchTestCases(page);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen mt-15 bg-gradient-to-br from-gray-50 dark:bg-gray-800 to-gray-100 dark:bg-gray-800">
                <TableSkeletonLoader />
            </div>
        );
    }

    return (
        <div className="w-full bg-gradient-to-br from-gray-50 dark:bg-gray-800 to-gray-100 dark:bg-gray-800 flex flex-col">
            <AnimatePresence>
                {alert && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-4 right-4 z-50"
                    >
                        <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${alert.type === 'success' ? 'bg-green-500 dark:bg-gray-800 text-white dark:bg-gray-100' : 'bg-red-500 dark:bg-gray-800 text-white dark:bg-gray-100'
                            }`}>
                            {alert.type === 'success' ? (
                                <div className="w-5 h-5 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-green-500 dark:bg-gray-100 rounded-full"></div>
                                </div>
                            ) : (
                                <AlertCircle size={20} />
                            )}
                            <span className="text-sm font-medium">{alert.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {imagePreviewModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black dark:bg-gray-800 bg-opacity-75 z-50 flex items-center justify-center p-4"
                        onClick={() => setImagePreviewModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="relative max-w-4xl max-h-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setImagePreviewModal(null)}
                                className="absolute -top-10 right-0 text-white dark:bg-gray-100 hover:text-gray-300 dark:bg-gray-100 transition-colors"
                            >
                                <X size={32} />
                            </button>
                            <img
                                src={imagePreviewModal}
                                alt="Preview"
                                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-1 overflow-auto relative">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto overflow-y-auto">
                        <div className="inline-block min-w-full">
                            <div className="flex sticky top-0 z-30 border-b border-gray-300 bg-gradient-to-r from-gray-50 dark:bg-gray-800 to-gray-100 dark:bg-gray-800">
                                {columns.map((column) => (
                                    <div
                                        key={column.key}
                                        className={`px-3 py-2.5 font-semibold text-gray-700 dark:bg-gray-100 text-xs border-r border-gray-300 relative group ${column.sticky ? 'sticky z-40' : ''}`}
                                        style={{
                                            width: columnWidths[column.key],
                                            minWidth: columnWidths[column.key],
                                            left: column.sticky ? `${getStickyLeftPosition(column.key)}px` : 'auto',
                                            background: column.color
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-gray-700 dark:bg-gray-100 tracking-wide uppercase">
                                                {column.label}
                                            </span>
                                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <GripVertical size={10} className="text-gray-400 dark:bg-gray-100" />
                                            </div>
                                        </div>
                                        <div
                                            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 dark:bg-gray-800 group-hover:bg-blue-300 dark:bg-gray-800 transition-colors"
                                            onMouseDown={(e) => startColumnResize(column.key, e)}
                                        />
                                    </div>
                                ))}
                                <div className="flex-1 border-b border-gray-300 bg-gradient-to-r from-gray-100 dark:bg-gray-800 to-gray-50 dark:bg-gray-800"></div>
                            </div>

                            <div className="flex border-b border-blue-200 bg-blue-50/50 dark:bg-gray-800 relative group">
                                {columns.map((column) => (
                                    <div
                                        key={`new-${column.key}`}
                                        className={`border-r border-gray-200 ${column.sticky ? 'sticky z-20 bg-blue-50/50 dark:bg-gray-800' : ''}`}
                                        style={{
                                            width: columnWidths[column.key],
                                            minWidth: columnWidths[column.key],
                                            height: rowHeights['new'] || rowHeights.default,
                                            left: column.sticky ? `${getStickyLeftPosition(column.key)}px` : 'auto'
                                        }}
                                    >
                                        {renderCellContent(null, column, true)}
                                    </div>
                                ))}
                                <div className="flex-1 bg-blue-50/50 dark:bg-gray-800 border-b border-blue-200"></div>
                                <div
                                    className="absolute left-0 right-0 bottom-0 h-1 cursor-row-resize hover:bg-blue-500 dark:bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onMouseDown={(e) => startRowResize('new', e)}
                                />
                            </div>

                            {filteredTestCases.map((testCase) => (
                                <div key={testCase._id} className="flex border-b border-gray-200 hover:bg-gray-50 dark:bg-gray-800 transition-colors relative group">
                                    {columns.map((column) => (
                                        <div
                                            key={`${testCase._id}-${column.key}`}
                                            className={`border-r border-gray-200 relative ${column.sticky ? 'sticky z-20 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:bg-gray-800' : ''}`}
                                            style={{
                                                width: columnWidths[column.key],
                                                minWidth: columnWidths[column.key],
                                                height: rowHeights[testCase._id] || rowHeights.default,
                                                left: column.sticky ? `${getStickyLeftPosition(column.key)}px` : 'auto'
                                            }}
                                        >
                                            {renderCellContent(testCase, column)}
                                        </div>
                                    ))}
                                    <div className="flex-1 border-b border-gray-200 group-hover:bg-gray-50 dark:bg-gray-800"></div>
                                    <div
                                        className="absolute left-0 right-0 bottom-0 h-1 cursor-row-resize hover:bg-blue-500 dark:bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onMouseDown={(e) => startRowResize(testCase._id, e)}
                                    />
                                </div>
                            ))}

                            {filteredTestCases.length === 0 && (
                                <div className="flex justify-center items-center py-12 text-gray-500 dark:bg-gray-100">
                                    <div className="text-center">
                                        <AlertCircle size={32} className="mx-auto mb-2 text-gray-400 dark:bg-gray-100" />
                                        <p className="text-sm font-medium">No test cases found</p>
                                        <p className="text-xs mt-1">Start typing in the blank row above to create your first test case</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 bg-white dark:bg-gray-800 px-4 py-1 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 sm:px-6">
                <div className="flex flex-col sm:flex-row items-center gap-2 text-xs text-gray-700 dark:bg-gray-100">
                    <div>
                        <span className="font-medium text-gray-600 dark:bg-gray-100">Test Type:</span>{' '}
                        <span>{testTypeName || 'Not selected'}</span>
                    </div>
                    <div className="hidden sm:block h-3 w-px bg-gray-300 dark:bg-gray-800 mx-2" />
                    <div>
                        Showing <span className="font-medium">{(currentPage - 1) * ROWS_PER_PAGE + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(currentPage * ROWS_PER_PAGE, totalTestCases)}</span> of{' '}
                        <span className="font-medium">{totalTestCases}</span> results
                    </div>
                </div>

                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                        onClick={goToFirstPage}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 dark:bg-gray-100 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="First page"
                    >
                        <span className="text-xs font-medium">&lt;&lt;</span>
                    </button>
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 text-gray-400 dark:bg-gray-100 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Previous page"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <div className="relative inline-flex items-center px-4 py-2 text-xs font-semibold text-gray-900 dark:bg-gray-100 ring-1 ring-inset ring-gray-300">
                        Page {currentPage} of {totalPages}
                    </div>
                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 text-gray-400 dark:bg-gray-100 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Next page"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                        onClick={goToLastPage}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 dark:bg-gray-100 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Last page"
                    >
                        <span className="text-xs font-medium">&gt;&gt;</span>
                    </button>
                </nav>
            </div>
        </div>
    );
};

export default TestCaseSpreadsheet;