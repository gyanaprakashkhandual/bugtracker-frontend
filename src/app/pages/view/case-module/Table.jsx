'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Search, AlertCircle, Loader2, RefreshCw, Archive, ChevronDown, GripVertical, MessageSquare, ExternalLink, X, Send, Image as ImageIcon } from 'lucide-react';

const GoogleArrowDown = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

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
    const dropdownRef = useRef(null);
    const commentModalRef = useRef(null);
    const resizeStartX = useRef(0);
    const resizeStartY = useRef(0);
    const resizeStartWidth = useRef(0);
    const resizeStartHeight = useRef(0);
    const dropdownButtonRefs = useRef({});
    const commentButtonRefs = useRef({});

    const projectId = typeof window !== 'undefined' ? localStorage.getItem("currentProjectId") : null;
    const testTypeId = typeof window !== 'undefined' ? localStorage.getItem("selectedTestTypeId") : null;
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

    const BASE_URL = 'http://localhost:5000/api/v1/test-case';
    const COMMENT_BASE_URL = 'http://localhost:5000/api/v1/comment';

    const columns = [
        { key: 'serialNumber', label: 'S.No', width: 110, editable: false, color: 'bg-purple-50', sticky: true },
        { key: 'testCaseType', label: 'Type', width: 140, editable: true, type: 'select', options: ['Functional', 'Integration', 'System', 'Regression', 'Smoke', 'Sanity', 'Performance', 'Security'], color: 'bg-blue-50', sticky: true },
        { key: 'moduleName', label: 'Module', width: 160, editable: true, color: 'bg-green-50', sticky: true },
        { key: 'testCaseDescription', label: 'Description', width: 285, editable: true, color: 'bg-yellow-50', sticky: true },
        { key: 'expectedResult', label: 'Expected Result', width: 280, editable: true, color: 'bg-pink-50' },
        { key: 'actualResult', label: 'Actual Result', width: 280, editable: true, color: 'bg-indigo-50' },
        { key: 'priority', label: 'Priority', width: 120, editable: true, type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], color: 'bg-red-50' },
        { key: 'severity', label: 'Severity', width: 120, editable: true, type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], color: 'bg-orange-50' },
        { key: 'status', label: 'Status', width: 140, editable: true, type: 'select', options: ['New', 'In Progress', 'Passed', 'Failed', 'Blocked', 'Skipped'], color: 'bg-teal-50' },
        { key: 'actions', label: 'Actions', width: 150, editable: false, color: 'bg-gray-100' }
    ];

    useEffect(() => {
        const initialWidths = {};
        const initialHeights = {};
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
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchTestCases = useCallback(async (page = 1) => {
        if (!projectId || !testTypeId || !token) {
            console.error('Missing required data');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases?page=${page}&limit=1000000`,
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
            console.error('Error fetching test cases:', error);
        } finally {
            setLoading(false);
        }
    }, [projectId, testTypeId, token]);

    const fetchComments = async (testCaseId) => {
        if (!token || loadingComments[testCaseId]) return;

        setLoadingComments(prev => ({ ...prev, [testCaseId]: true }));

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
            setComments(prev => ({ ...prev, [testCaseId]: data.comments || [] }));
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoadingComments(prev => ({ ...prev, [testCaseId]: false }));
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
            setComments(prev => ({
                ...prev,
                [testCaseId]: [data.comment, ...(prev[testCaseId] || [])]
            }));
            setNewComment('');
        } catch (error) {
            console.error('Error submitting comment:', error);
        } finally {
            setSubmittingComment(false);
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
                        priority: testCaseData.priority || 'Medium',
                        severity: testCaseData.severity || 'Medium',
                        status: testCaseData.status || 'New',
                        image: 'No image provided'
                    })
                }
            );

            if (!response.ok) throw new Error('Failed to create test case');

            const result = await response.json();
            setTestCases(prev => [result.testCase, ...prev]);
            setNewRowData({});
        } catch (error) {
            console.error('Error creating test case:', error);
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
            }, 500);
        } catch (error) {
            console.error('Error updating test case:', error);
            setErrorCells(prev => new Set([...prev, cellKey]));
            setSavingCells(prev => {
                const newSet = new Set(prev);
                newSet.delete(cellKey);
                return newSet;
            });
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

        if (updatedData.moduleName || updatedData.testCaseDescription) {
            const timeoutId = setTimeout(() => {
                createTestCase(updatedData);
            }, 1500);
            return () => clearTimeout(timeoutId);
        }
    };

    const handleDropdownSelect = (testCaseId, columnKey, value) => {
        if (testCaseId === 'new') {
            handleNewRowEdit(columnKey, value);
        } else {
            handleCellEdit(testCaseId, columnKey, value);
        }
        setActiveDropdown(null);
    };

    const startEditing = (testCaseId, columnKey, value) => {
        setEditingCell({ testCaseId, columnKey });
        setEditValue(value || '');
    };

    const stopEditing = () => {
        if (editingCell) {
            if (editingCell.testCaseId === 'new') {
                handleNewRowEdit(editingCell.columnKey, editValue);
            } else {
                handleCellEdit(editingCell.testCaseId, editingCell.columnKey, editValue);
            }
        }
        setEditingCell(null);
        setEditValue('');
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

            setTestCases(prev => prev.filter(testCase => testCase._id !== testCaseId));
        } catch (error) {
            console.error('Error moving test case to trash:', error);
            alert('Failed to move test case to trash');
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

            setTestCases(prev => prev.filter(testCase => testCase._id !== testCaseId));
        } catch (error) {
            console.error('Error deleting test case permanently:', error);
            alert('Failed to delete test case permanently');
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
            'Critical': 'bg-red-100 text-red-800 border-red-300',
            'High': 'bg-orange-100 text-orange-800 border-orange-300',
            'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'Low': 'bg-green-100 text-green-800 border-green-300'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getStatusColor = (status) => {
        const colors = {
            'New': 'bg-blue-100 text-blue-800 border-blue-300',
            'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'Passed': 'bg-green-100 text-green-800 border-green-300',
            'Failed': 'bg-red-100 text-red-800 border-red-300',
            'Blocked': 'bg-orange-100 text-orange-800 border-orange-300',
            'Skipped': 'bg-gray-100 text-gray-800 border-gray-300'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getTestCaseTypeColor = (type) => {
        const colors = {
            'Functional': 'bg-blue-100 text-blue-800 border-blue-300',
            'Integration': 'bg-purple-100 text-purple-800 border-purple-300',
            'System': 'bg-indigo-100 text-indigo-800 border-indigo-300',
            'Regression': 'bg-pink-100 text-pink-800 border-pink-300',
            'Smoke': 'bg-green-100 text-green-800 border-green-300',
            'Sanity': 'bg-teal-100 text-teal-800 border-teal-300',
            'Performance': 'bg-orange-100 text-orange-800 border-orange-300',
            'Security': 'bg-red-100 text-red-800 border-red-300'
        };
        return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300';
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

    const renderDropdown = (testCaseId, column, value) => {
        const cellKey = `${testCaseId}-${column.key}`;
        const isActive = activeDropdown === cellKey;
        const openUpward = dropdownOpenUpward[cellKey] || false;

        let badgeClass = '';
        if (column.key === 'priority' || column.key === 'severity') {
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
                    className="w-full h-full px-2 py-1.5 flex items-center justify-between hover:bg-gray-50 transition-colors group"
                >
                    <span className={`px-2 py-1 rounded text-xs font-medium border w-30 ${badgeClass}`}>
                        {value || 'Select'}
                    </span>
                    <div className='bg-gray-50 p-0.5 rounded border border-gray-200'>
                        <GoogleArrowDown size={12} className={`text-gray-500 transition-transform ml-0.5 group-hover:text-gray-700 ${isActive ? 'rotate-180' : ''}`} />
                    </div>
                </button>

                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            initial={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className={`absolute ${openUpward ? 'bottom-full mb-1' : 'top-full mt-1'} left-0 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden`}
                        >
                            <div className="py-1 max-h-64 overflow-y-auto">
                                {column.options.map((option) => {
                                    let optionBadgeClass = '';
                                    if (column.key === 'priority' || column.key === 'severity') {
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
                                            className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-50 transition-colors flex items-center justify-between ${value === option ? 'bg-blue-50' : ''
                                                }`}
                                        >
                                            <span className={`px-2 py-1 rounded text-xs font-medium border ${optionBadgeClass}`}>
                                                {option}
                                            </span>
                                            {value === option && (
                                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
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
                className={`absolute ${openUpward ? 'bottom-full mb-2' : 'top-full mt-2'} right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50`}
                style={{ maxHeight: '360px' }}
            >
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                    <div className="flex items-center gap-1.5">
                        <MessageSquare size={16} className="text-gray-600" />
                        <h3 className="font-semibold text-gray-800 text-sm">Comments</h3>
                    </div>
                    <button
                        onClick={() => setActiveCommentModal(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
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
                            className="px-2 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {submittingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto" style={{ maxHeight: '220px' }}>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 size={20} className="animate-spin text-blue-600" />
                        </div>
                    ) : testCaseComments.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 text-xs">
                            No comments yet. Be the first to comment!
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {testCaseComments.map((comment, index) => (
                                <div key={index} className="px-3 py-2">
                                    <div className="flex items-start gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-semibold text-blue-600">
                                                {comment.commentBy?.charAt(0).toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className="text-xs font-semibold text-gray-800">
                                                    {comment.commentBy || 'Unknown User'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-700 break-words">{comment.comment}</p>
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
        const value = isNewRow ? newRowData[column.key] : testCase?.[column.key];
        const cellKey = `${testCaseId}-${column.key}`;
        const isSaving = savingCells.has(cellKey);
        const hasError = errorCells.has(cellKey);

        if (column.key === 'actions') {
            if (isNewRow) {
                return (
                    <div className="flex items-center justify-center h-full">
                        {isCreatingTestCase && <Loader2 size={14} className="animate-spin text-blue-500" />}
                    </div>
                );
            }

            return (
                <div className="flex items-center justify-center h-full space-x-0.5 relative">
                    <button
                        onClick={() => {
                            if (testCase.image && testCase.image !== 'No image provided') {
                                window.open(testCase.image, '_blank');
                            } else {
                                alert('No image available for this test case');
                            }
                        }}
                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="View Image"
                    >
                        <ImageIcon size={14} />
                    </button>
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
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Comments"
                    >
                        <MessageSquare size={14} />
                    </button>
                    <button
                        onClick={() => moveTestCaseToTrash(testCase._id)}
                        className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                        title="Archive"
                    >
                        <Archive size={14} />
                    </button>
                    <button
                        onClick={() => deleteTestCasePermanently(testCase._id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                    {renderCommentModal(testCase._id, commentButtonRefs.current[testCase._id])}
                </div>
            );
        }

        if (column.key === 'serialNumber' && !isNewRow) {
            return (
                <div className="flex items-center justify-center h-full px-2 font-medium text-gray-700 text-xs">
                    {value}
                </div>
            );
        }

        if (column.type === 'select') {
            return renderDropdown(testCaseId, column, value);
        }

        if (editingCell?.testCaseId === testCaseId && editingCell?.columnKey === column.key) {
            return (
                <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={stopEditing}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') stopEditing();
                        if (e.key === 'Escape') {
                            setEditingCell(null);
                            setEditValue('');
                        }
                    }}
                    className="w-full h-full border border-blue-500 outline-none bg-white px-2 py-1.5 text-xs"
                    autoFocus
                />
            );
        }

        const displayValue = value || '';
        const truncatedValue = displayValue.length > 50 ? displayValue.substring(0, 50) + '...' : displayValue;

        return (
            <div
                className={`w-full h-full px-2 py-1.5 flex items-center text-xs ${column.editable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                onClick={() => column.editable && startEditing(testCaseId, column.key, value)}
                title={displayValue}
            >
                <span className={`truncate ${!value && isNewRow ? 'text-gray-400 italic' : ''}`}>
                    {value ? truncatedValue : (isNewRow ? 'Click to edit' : '')}
                </span>
                {isSaving && <Loader2 size={12} className="ml-1 animate-spin text-blue-500 flex-shrink-0" />}
                {hasError && <AlertCircle size={12} className="ml-1 text-red-500 flex-shrink-0" />}
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium text-sm">Loading test cases...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
            {/* Spreadsheet */}
            <div className="flex-1 overflow-auto relative">
                <div className="bg-white border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto overflow-y-auto">
                        <div className="inline-block min-w-full">
                            {/* Enhanced Header */}
                            <div className="flex sticky top-0 z-30 border-b border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 border-r-0">
                                {columns.map((column) => (
                                    <div
                                        key={column.key}
                                        className={`px-3 py-2.5 font-semibold text-gray-700 text-xs border-r border-gray-300 relative group ${column.sticky ? 'sticky z-40' : ''}`}
                                        style={{
                                            width: columnWidths[column.key],
                                            minWidth: columnWidths[column.key],
                                            left: column.sticky ? `${getStickyLeftPosition(column.key)}px` : 'auto',
                                            background: `linear-gradient(135deg, ${column.color.replace('bg-', '')} 0%, ${column.color.replace('bg-', '').replace('50', '100')} 100%)`
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-gray-700 tracking-wide uppercase">
                                                {column.label}
                                            </span>
                                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <GripVertical size={10} className="text-gray-400" />
                                            </div>
                                        </div>
                                        <div
                                            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 group-hover:bg-blue-300 transition-colors"
                                            onMouseDown={(e) => startColumnResize(column.key, e)}
                                        />
                                    </div>
                                ))}
                                <div className="flex-1 border-b border-gray-300 bg-gradient-to-r from-gray-100 to-gray-50"></div>
                            </div>

                            {/* New Row - Always visible */}
                            <div className="flex border-b border-blue-200 bg-blue-50/50 relative group">
                                {columns.map((column) => (
                                    <div
                                        key={`new-${column.key}`}
                                        className={`border-r border-gray-200 ${column.sticky ? 'sticky z-20 bg-blue-50/50' : ''}`}
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
                                <div className="flex-1 bg-blue-50/50 border-b border-blue-200"></div>
                                <div
                                    className="absolute left-0 right-0 bottom-0 h-1 cursor-row-resize hover:bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onMouseDown={(e) => startRowResize('new', e)}
                                />
                            </div>

                            {/* Data Rows */}
                            {filteredTestCases.map((testCase) => (
                                <div key={testCase._id} className="flex border-b border-gray-200 hover:bg-gray-50 transition-colors relative group">
                                    {columns.map((column) => (
                                        <div
                                            key={`${testCase._id}-${column.key}`}
                                            className={`border-r border-gray-200 relative ${column.sticky ? 'sticky z-20 bg-white group-hover:bg-gray-50' : ''}`}
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
                                    <div className="flex-1 border-b border-gray-200 group-hover:bg-gray-50"></div>
                                    <div
                                        className="absolute left-0 right-0 bottom-0 h-1 cursor-row-resize hover:bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onMouseDown={(e) => startRowResize(testCase._id, e)}
                                    />
                                </div>
                            ))}

                            {filteredTestCases.length === 0 && (
                                <div className="flex justify-center items-center py-12 text-gray-500">
                                    <div className="text-center">
                                        <AlertCircle size={32} className="mx-auto mb-2 text-gray-400" />
                                        <p className="text-sm font-medium">No test cases found</p>
                                        <p className="text-xs mt-1">Start typing in the blank row above to create your first test case</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Resize overlay */}
            {resizing && (
                <div className="fixed inset-0 z-50" style={{ cursor: resizing.type === 'column' ? 'col-resize' : 'row-resize' }} />
            )}
        </div>
    );
};

export default TestCaseSpreadsheet;