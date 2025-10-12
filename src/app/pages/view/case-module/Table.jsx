'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertCircle, Loader2, Archive, ChevronDown, GripVertical, ChevronLeft, ChevronRight, Image as ImageIcon, Save, Ban, Copy, ZoomIn, X } from 'lucide-react';

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
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTestCases, setTotalTestCases] = useState(0);
    const [newRowEditing, setNewRowEditing] = useState(false);
    const [newRowTempData, setNewRowTempData] = useState({});
    const [imagePreviewModal, setImagePreviewModal] = useState(null);
    const [activeImagesDropdown, setActiveImagesDropdown] = useState(null);
    const [alert, setAlert] = useState(null);

    const dropdownRef = useRef(null);
    const imagesDropdownRef = useRef(null);
    const resizeStartX = useRef(0);
    const resizeStartY = useRef(0);
    const resizeStartWidth = useRef(0);
    const resizeStartHeight = useRef(0);
    const dropdownButtonRefs = useRef({});
    const imagesButtonRefs = useRef({});

    // Get from localStorage or context
    const projectId = typeof window !== 'undefined' ? localStorage.getItem("currentProjectId") : null;
    const testTypeId = typeof window !== 'undefined' ? localStorage.getItem("selectedTestTypeId") : null;
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

    const BASE_URL = 'http://localhost:5000/api/v1/test-case';
    const ROWS_PER_PAGE = 25;

    const columns = [
        { key: 'serialNumber', label: 'S.No', width: 90, editable: false, color: 'bg-purple-50', sticky: true },
        { key: 'testCaseType', label: 'Type', width: 140, editable: true, type: 'select', options: ['Functional', 'Non-Functional', 'Integration', 'UI/UX', 'Security', 'Performance'], color: 'bg-blue-50', sticky: true },
        { key: 'moduleName', label: 'Module', width: 115, editable: true, color: 'bg-green-50', sticky: true },
        { key: 'testCaseDescription', label: 'Description', width: 290, editable: true, color: 'bg-yellow-50' },
        { key: 'expectedResult', label: 'Expected Result', width: 290, editable: true, color: 'bg-pink-50' },
        { key: 'actualResult', label: 'Actual Result', width: 290, editable: true, color: 'bg-indigo-50' },
        { key: 'priority', label: 'Priority', width: 90, editable: true, type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], color: 'bg-red-50' },
        { key: 'status', label: 'Status', width: 100, editable: true, type: 'select', options: ['Pass', 'Fail'], color: 'bg-teal-50' },
        { key: 'actions', label: 'Actions', width: 120, editable: false, color: 'bg-gray-100' }
    ];

    const showAlert = (alertData) => {
        setAlert(alertData);
        setTimeout(() => setAlert(null), 3000);
    };

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
            if (imagesDropdownRef.current && !imagesDropdownRef.current.contains(event.target)) {
                setActiveImagesDropdown(null);
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
            console.error('Error fetching test cases:', error);
            showAlert({ type: 'error', message: 'Failed to fetch test cases' });
        } finally {
            setLoading(false);
        }
    }, [projectId, testTypeId, token]);

    const uploadImageToCloudinary = async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'test_case_preset');

            const response = await fetch('https://api.cloudinary.com/v1_1/dvytvjplt/image/upload', {
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
                        severity: testCaseData.severity || 'Medium',
                        status: testCaseData.status || 'Pending'
                    })
                }
            );

            if (!response.ok) throw new Error('Failed to create test case');

            await fetchTestCases(currentPage);
            setNewRowData({});
            setNewRowEditing(false);
            setNewRowTempData({});
            showAlert({ type: 'success', message: 'Test case created successfully' });
        } catch (error) {
            console.error('Error creating test case:', error);
            showAlert({ type: 'error', message: 'Failed to create test case' });
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
                showAlert({ type: 'success', message: 'Field updated successfully' });
            }, 500);
        } catch (error) {
            console.error('Error updating test case:', error);
            setErrorCells(prev => new Set([...prev, cellKey]));
            setSavingCells(prev => {
                const newSet = new Set(prev);
                newSet.delete(cellKey);
                return newSet;
            });
            showAlert({ type: 'error', message: 'Failed to update field' });

            setTestCases(prev => prev.map(tc =>
                tc._id === testCaseId ? { ...tc, [field]: tc[field] } : tc
            ));
        }
    };

    const handleCellEdit = (testCaseId, columnKey, value) => {
        setTestCases(prev => prev.map(tc =>
            tc._id === testCaseId ? { ...tc, [columnKey]: value } : tc
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
    };

    const handleImageUpload = async (testCaseId, file) => {
        if (!file) return;

        try {
            showAlert({ type: 'success', message: 'Uploading image...' });
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
            showAlert({ type: 'success', message: 'Image uploaded successfully' });
        } catch (error) {
            console.error('Error uploading image:', error);
            showAlert({ type: 'error', message: 'Failed to upload image' });
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

            await fetchTestCases(currentPage);
            showAlert({ type: 'success', message: 'Test case moved to trash' });
        } catch (error) {
            console.error('Error moving test case to trash:', error);
            showAlert({ type: 'error', message: 'Failed to move test case to trash' });
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
            showAlert({ type: 'success', message: 'Test case deleted permanently' });
        } catch (error) {
            console.error('Error deleting test case permanently:', error);
            showAlert({ type: 'error', message: 'Failed to delete test case permanently' });
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

    const filteredTestCases = testCases.filter(tc =>
        Object.values(tc).some(value =>
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
            'Pass': 'bg-green-100 text-green-800 border-green-300',
            'Fail': 'bg-red-100 text-red-800 border-red-300',
            'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'Blocked': 'bg-gray-100 text-gray-800 border-gray-300'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getTestCaseTypeColor = (type) => {
        const colors = {
            'Functional': 'bg-blue-100 text-blue-800 border-blue-300',
            'Non-Functional': 'bg-purple-100 text-purple-800 border-purple-300',
            'Integration': 'bg-green-100 text-green-800 border-green-300',
            'UI/UX': 'bg-pink-100 text-pink-800 border-pink-300',
            'Security': 'bg-red-100 text-red-800 border-red-300',
            'Performance': 'bg-orange-100 text-orange-800 border-orange-300'
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

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showAlert({ type: 'success', message: 'Copied to clipboard' });
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
            <div className="relative w-full h-full">
                <button
                    ref={(el) => {
                        if (el) dropdownButtonRefs.current[cellKey] = el;
                    }}
                    onClick={() => handleDropdownClick(cellKey)}
                    className="w-full h-full px-2 py-1.5 flex items-center justify-between hover:bg-gray-50 transition-colors group"
                >
                    <span className={`px-2 py-1 w-full rounded text-xs font-medium border ${badgeClass}`}>
                        {value || 'Select'}
                    </span>
                </button>

                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            ref={dropdownRef}
                            initial={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className={`absolute ${openUpward ? 'bottom-full mb-1' : 'top-full mt-1'} left-0 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] overflow-hidden`}
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
                                            className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-50 transition-colors flex items-center justify-between ${value === option ? 'bg-blue-50' : ''}`}
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

    const renderImagesDropdown = (testCaseId, image) => {
        const cellKey = `images-${testCaseId}`;
        const isActive = activeImagesDropdown === cellKey;

        if (!image || image === 'No Image Provided' || image === '') return null;

        const buttonRef = imagesButtonRefs.current[cellKey];
        const rect = buttonRef?.getBoundingClientRect();
        const spaceBelow = window.innerHeight - (rect?.bottom || 0);
        const openUpward = spaceBelow < 300;

        return (
            <>
                <button
                    ref={(el) => {
                        if (el) imagesButtonRefs.current[cellKey] = el;
                    }}
                    onClick={() => setActiveImagesDropdown(isActive ? null : cellKey)}
                    className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors relative"
                >
                    <ImageIcon size={14} />
                </button>

                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            ref={imagesDropdownRef}
                            initial={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className={`absolute ${openUpward ? 'bottom-full mb-2' : 'top-full mt-2'} right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50`}
                        >
                            <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <ImageIcon size={16} className="text-gray-600" />
                                    <h3 className="font-semibold text-gray-800 text-sm">Image</h3>
                                </div>
                                <button
                                    onClick={() => setActiveImagesDropdown(null)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="px-3 py-2">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-1">
                                        <img
                                            src={image}
                                            alt="Test case screenshot"
                                            className="w-10 h-10 object-cover rounded border border-gray-200"
                                        />
                                        <span className="text-xs text-gray-700">Screenshot</span>
                                    </div>
                                    <button
                                        onClick={() => setImagePreviewModal(image)}
                                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                        title="View full size"
                                    >
                                        <ZoomIn size={12} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
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
                        {newRowEditing && (
                            <>
                                <button
                                    onClick={handleNewRowManualSave}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                    disabled={isCreatingTestCase}
                                    title="Save"
                                >
                                    <Save size={14} />
                                </button>
                                <button
                                    onClick={handleNewRowCancel}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Cancel"
                                >
                                    <Ban size={14} />
                                </button>
                            </>
                        )}
                        {isCreatingTestCase && <Loader2 size={14} className="animate-spin text-blue-500" />}
                    </div>
                );
            }

            return (
                <div className="flex items-center justify-center h-full space-x-0.5 relative">
                    {renderImagesDropdown(testCase._id, testCase.image)}
                    <label className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer">
                        <ImageIcon size={14} />
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(testCase._id, file);
                            }}
                        />
                    </label>
                    <button
                        onClick={() => moveTestCaseToTrash(testCase._id)}
                        className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                        title="Move to trash"
                    >
                        <Archive size={14} />
                    </button>
                    <button
                        onClick={() => deleteTestCasePermanently(testCase._id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete permanently"
                    >
                        <Trash2 size={14} />
                    </button>
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
                    className="w-full h-full border-2 border-blue-500 outline-none bg-white px-2 py-1.5 text-xs resize-none"
                    autoFocus
                    style={{ minHeight: rowHeight }}
                />
            );
        }

        const displayValue = value || '';

        return (
            <div
                className={`w-full h-full px-2 py-1.5 flex items-center text-xs relative ${column.editable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                onDoubleClick={() => column.editable && (isNewRow ? handleNewRowCellClick(column.key) : startEditing(testCaseId, column.key, value))}
                style={{
                    minHeight: rowHeight,
                    maxHeight: rowHeight,
                    overflow: 'hidden'
                }}
            >
                <span
                    className={`flex-1 ${!value && isNewRow ? 'text-gray-400 italic' : ''}`}
                    style={{
                        lineHeight: '1.4',
                        maxHeight: rowHeight - 12,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: Math.floor((rowHeight - 12) / 18),
                        WebkitBoxOrient: 'vertical'
                    }}
                    title={displayValue}
                >
                    {value ? displayValue : (isNewRow ? 'Double-click to edit' : '')}
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

    const goToFirstPage = () => fetchTestCases(1);
    const goToLastPage = () => fetchTestCases(totalPages);
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            fetchTestCases(page);
        }
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
            {/* Alert Toast */}
            <AnimatePresence>
                {alert && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-4 right-4 z-50"
                    >
                        <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${alert.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                            }`}>
                            {alert.type === 'success' ? (
                                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                </div>
                            ) : (
                                <AlertCircle size={20} />
                            )}
                            <span className="text-sm font-medium">{alert.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Image Preview Modal */}
            <AnimatePresence>
                {imagePreviewModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
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
                                className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
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

            {/* Spreadsheet */}
            <div className="flex-1 overflow-auto relative">
                <div className="bg-white border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto overflow-y-auto">
                        <div className="inline-block min-w-full">
                            {/* Header */}
                            <div className="flex sticky top-0 z-30 border-b border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100">
                                {columns.map((column) => (
                                    <div
                                        key={column.key}
                                        className={`px-3 py-2.5 font-semibold text-gray-700 text-xs border-r border-gray-300 relative group ${column.sticky ? 'sticky z-40' : ''}`}
                                        style={{
                                            width: columnWidths[column.key],
                                            minWidth: columnWidths[column.key],
                                            left: column.sticky ? `${getStickyLeftPosition(column.key)}px` : 'auto',
                                            background: column.color
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

                            {/* New Row */}
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

            {/* Pagination Bar */}
            <div className="border-t border-gray-200 bg-white px-4 py-1 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 sm:px-6">
                {/* Left Side: Info */}
                <div className="flex flex-col sm:flex-row items-center gap-2 text-xs text-gray-700">
                    <div>
                        <span className="font-medium text-gray-600">Test Cases:</span>{' '}
                        <span>{totalTestCases} total</span>
                    </div>
                    <div className="hidden sm:block h-3 w-px bg-gray-300 mx-2" />
                    <div>
                        Showing <span className="font-medium">{(currentPage - 1) * ROWS_PER_PAGE + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(currentPage * ROWS_PER_PAGE, totalTestCases)}</span> of{' '}
                        <span className="font-medium">{totalTestCases}</span> results
                    </div>
                </div>

                {/* Right Side: Pagination Controls */}
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                        onClick={goToFirstPage}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="First page"
                    >
                        <span className="text-xs font-medium">&lt;&lt;</span>
                    </button>
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Previous page"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <div className="relative inline-flex items-center px-4 py-2 text-xs font-semibold text-gray-900 ring-1 ring-inset ring-gray-300">
                        Page {currentPage} of {totalPages}
                    </div>
                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Next page"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                        onClick={goToLastPage}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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