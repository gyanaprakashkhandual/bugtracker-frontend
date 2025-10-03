import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Search, AlertCircle, Loader2, RefreshCw, Archive, ChevronDown, GripVertical } from 'lucide-react';
import { GoogleArrowDown } from '@/app/components/utils/Icon';

const BugSpreadsheet = () => {
    const [bugs, setBugs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCell, setEditingCell] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [savingCells, setSavingCells] = useState(new Set());
    const [errorCells, setErrorCells] = useState(new Set());
    const [newRowData, setNewRowData] = useState({});
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [columnWidths, setColumnWidths] = useState({});
    const [rowHeights, setRowHeights] = useState({});
    const [resizing, setResizing] = useState(null);
    const [isCreatingBug, setIsCreatingBug] = useState(false);
    const dropdownRef = useRef(null);
    const resizeStartX = useRef(0);
    const resizeStartY = useRef(0);
    const resizeStartWidth = useRef(0);
    const resizeStartHeight = useRef(0);

    const projectId = typeof window !== 'undefined' ? localStorage.getItem("currentProjectId") : null;
    const testTypeId = typeof window !== 'undefined' ? localStorage.getItem("selectedTestTypeId") : null;
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

    const BASE_URL = 'http://localhost:5000/api/v1/bug';

    const columns = [
        { key: 'serialNumber', label: 'S.No', width: 90, editable: false, color: 'bg-purple-50' },
        { key: 'bugType', label: 'Type', width: 160, editable: true, type: 'select', options: ['Functional', 'User-Interface', 'Security', 'Database', 'Performance'], color: 'bg-blue-50' },
        { key: 'moduleName', label: 'Module', width: 180, editable: true, color: 'bg-green-50' },
        { key: 'bugDesc', label: 'Description', width: 350, editable: true, color: 'bg-yellow-50' },
        { key: 'bugRequirement', label: 'Requirement', width: 220, editable: true, color: 'bg-pink-50' },
        { key: 'refLink', label: 'Reference Link', width: 200, editable: true, color: 'bg-indigo-50' },
        { key: 'priority', label: 'Priority', width: 140, editable: true, type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], color: 'bg-red-50' },
        { key: 'severity', label: 'Severity', width: 140, editable: true, type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], color: 'bg-orange-50' },
        { key: 'status', label: 'Status', width: 160, editable: true, type: 'select', options: ['New', 'Open', 'In Progress', 'In Review', 'Closed', 'Re Open'], color: 'bg-teal-50' },
        { key: 'actions', label: 'Actions', width: 120, editable: false, color: 'bg-gray-100' }
    ];

    useEffect(() => {
        const initialWidths = {};
        const initialHeights = {};
        columns.forEach(col => {
            initialWidths[col.key] = col.width;
        });
        setColumnWidths(initialWidths);
        setRowHeights({ default: 52 });
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchBugs = useCallback(async () => {
        if (!projectId || !testTypeId || !token) {
            console.error('Missing required data');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs`,
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

    const createBug = async (bugData) => {
        if (!token || isCreatingBug) return;

        if (!bugData.moduleName && !bugData.bugDesc) return;

        setIsCreatingBug(true);

        try {
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        bugType: bugData.bugType || 'Functional',
                        moduleName: bugData.moduleName || '',
                        bugDesc: bugData.bugDesc || '',
                        bugRequirement: bugData.bugRequirement || '',
                        refLink: bugData.refLink || '',
                        priority: bugData.priority || 'Medium',
                        severity: bugData.severity || 'Medium',
                        status: bugData.status || 'New',
                        image: 'No Image provided'
                    })
                }
            );

            if (!response.ok) throw new Error('Failed to create bug');

            const result = await response.json();
            setBugs(prev => [result.bug, ...prev]);
            setNewRowData({});
        } catch (error) {
            console.error('Error creating bug:', error);
        } finally {
            setIsCreatingBug(false);
        }
    };

    const updateBug = async (bugId, field, value) => {
        const cellKey = `${bugId}-${field}`;
        setSavingCells(prev => new Set([...prev, cellKey]));
        setErrorCells(prev => {
            const newSet = new Set(prev);
            newSet.delete(cellKey);
            return newSet;
        });

        try {
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/${bugId}`,
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

            setTimeout(() => {
                setSavingCells(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(cellKey);
                    return newSet;
                });
            }, 500);
        } catch (error) {
            console.error('Error updating bug:', error);
            setErrorCells(prev => new Set([...prev, cellKey]));
            setSavingCells(prev => {
                const newSet = new Set(prev);
                newSet.delete(cellKey);
                return newSet;
            });
        }
    };

    const handleCellEdit = (bugId, columnKey, value) => {
        setBugs(prev => prev.map(bug =>
            bug._id === bugId ? { ...bug, [columnKey]: value } : bug
        ));
        updateBug(bugId, columnKey, value);
    };

    const handleNewRowEdit = (columnKey, value) => {
        const updatedData = { ...newRowData, [columnKey]: value };
        setNewRowData(updatedData);

        if (updatedData.moduleName || updatedData.bugDesc) {
            const timeoutId = setTimeout(() => {
                createBug(updatedData);
            }, 1500);
            return () => clearTimeout(timeoutId);
        }
    };

    const handleDropdownSelect = (bugId, columnKey, value) => {
        if (bugId === 'new') {
            handleNewRowEdit(columnKey, value);
        } else {
            handleCellEdit(bugId, columnKey, value);
        }
        setActiveDropdown(null);
    };

    const startEditing = (bugId, columnKey, value) => {
        setEditingCell({ bugId, columnKey });
        setEditValue(value || '');
    };

    const stopEditing = () => {
        if (editingCell) {
            if (editingCell.bugId === 'new') {
                handleNewRowEdit(editingCell.columnKey, editValue);
            } else {
                handleCellEdit(editingCell.bugId, editingCell.columnKey, editValue);
            }
        }
        setEditingCell(null);
        setEditValue('');
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

            setBugs(prev => prev.filter(bug => bug._id !== bugId));
        } catch (error) {
            console.error('Error moving bug to trash:', error);
            alert('Failed to move bug to trash');
        }
    };

    const deleteBugPermanently = async (bugId) => {
        if (!confirm('Permanently delete this bug? This action cannot be undone!')) return;

        try {
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/${bugId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to delete bug permanently');

            setBugs(prev => prev.filter(bug => bug._id !== bugId));
        } catch (error) {
            console.error('Error deleting bug permanently:', error);
            alert('Failed to delete bug permanently');
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
            const newWidth = Math.max(80, resizeStartWidth.current + diff);
            setColumnWidths(prev => ({ ...prev, [resizing.key]: newWidth }));
        } else if (resizing.type === 'row') {
            const diff = e.clientY - resizeStartY.current;
            const newHeight = Math.max(40, resizeStartHeight.current + diff);
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

    const filteredBugs = bugs.filter(bug =>
        Object.values(bug).some(value =>
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
            'Open': 'bg-purple-100 text-purple-800 border-purple-300',
            'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'In Review': 'bg-orange-100 text-orange-800 border-orange-300',
            'Closed': 'bg-green-100 text-green-800 border-green-300',
            'Re Open': 'bg-red-100 text-red-800 border-red-300'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getBugTypeColor = (type) => {
        const colors = {
            'Functional': 'bg-blue-100 text-blue-800 border-blue-300',
            'User-Interface': 'bg-purple-100 text-purple-800 border-purple-300',
            'Security': 'bg-red-100 text-red-800 border-red-300',
            'Database': 'bg-green-100 text-green-800 border-green-300',
            'Performance': 'bg-orange-100 text-orange-800 border-orange-300'
        };
        return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const renderDropdown = (bugId, column, value) => {
        const cellKey = `${bugId}-${column.key}`;
        const isActive = activeDropdown === cellKey;

        let badgeClass = '';
        if (column.key === 'priority' || column.key === 'severity') {
            badgeClass = getPriorityColor(value);
        } else if (column.key === 'status') {
            badgeClass = getStatusColor(value);
        } else if (column.key === 'bugType') {
            badgeClass = getBugTypeColor(value);
        }

        return (
            <div className="relative w-full h-full" ref={isActive ? dropdownRef : null}>
                <button
                    onClick={() => setActiveDropdown(isActive ? null : cellKey)}
                    className="w-full h-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors group"
                >
                    <span className={`px-3 py-1.5 rounded-md text-xs font-semibold border ${badgeClass}`}>
                        {value || 'Select'}
                    </span>
                    <GoogleArrowDown size={14} className={`text-gray-400 transition-transform ml-1 group-hover:text-gray-600 ${isActive ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 overflow-hidden"
                        >
                            <div className="py-1 max-h-72 overflow-y-auto">
                                {column.options.map((option) => {
                                    let optionBadgeClass = '';
                                    if (column.key === 'priority' || column.key === 'severity') {
                                        optionBadgeClass = getPriorityColor(option);
                                    } else if (column.key === 'status') {
                                        optionBadgeClass = getStatusColor(option);
                                    } else if (column.key === 'bugType') {
                                        optionBadgeClass = getBugTypeColor(option);
                                    }

                                    return (
                                        <button
                                            key={option}
                                            onClick={() => handleDropdownSelect(bugId, column.key, option)}
                                            className={`w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${value === option ? 'bg-blue-50' : ''
                                                }`}
                                        >
                                            <span className={`px-3 py-1 rounded-md text-xs font-semibold border ${optionBadgeClass}`}>
                                                {option}
                                            </span>
                                            {value === option && (
                                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
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

    const renderCellContent = (bug, column, isNewRow = false) => {
        const bugId = isNewRow ? 'new' : bug?._id;
        const value = isNewRow ? newRowData[column.key] : bug?.[column.key];
        const cellKey = `${bugId}-${column.key}`;
        const isSaving = savingCells.has(cellKey);
        const hasError = errorCells.has(cellKey);

        if (column.key === 'actions') {
            if (isNewRow) {
                return (
                    <div className="flex items-center justify-center h-full">
                        {isCreatingBug && <Loader2 size={16} className="animate-spin text-blue-500" />}
                    </div>
                );
            }

            return (
                <div className="flex items-center justify-center h-full space-x-1">
                    <button
                        onClick={() => moveBugToTrash(bug._id)}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                        tooltip-data="Move to Trash"
                        tooltip-placement="left"
                    >
                        <Archive size={16} />
                    </button>
                    <button
                        onClick={() => deleteBugPermanently(bug._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        tooltip-data="Delete Permanently"
                        tooltip-placement="left"

                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            );
        }

        if (column.key === 'serialNumber' && !isNewRow) {
            return (
                <div className="flex items-center justify-center h-full px-3 font-semibold text-gray-700">
                    {value}
                </div>
            );
        }

        if (column.type === 'select') {
            return renderDropdown(bugId, column, value);
        }

        if (editingCell?.bugId === bugId && editingCell?.columnKey === column.key) {
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
                    className="w-full h-full border-2 border-blue-500 outline-none bg-white px-3 py-2"
                    autoFocus
                />
            );
        }

        const displayValue = value || '';
        const truncatedValue = displayValue.length > 50 ? displayValue.substring(0, 50) + '...' : displayValue;

        return (
            <div
                className={`w-full h-full px-3 py-2 flex items-center ${column.editable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                onClick={() => column.editable && startEditing(bugId, column.key, value)}
                content-data={displayValue}
                content-placement="top"
            >
                <span className={`truncate ${!value && isNewRow ? 'text-gray-400 italic text-sm' : ''}`}>
                    {value ? truncatedValue : (isNewRow ? 'Click to edit' : '')}
                </span>
                {isSaving && <Loader2 size={14} className="ml-2 animate-spin text-blue-500 flex-shrink-0" />}
                {hasError && <AlertCircle size={14} className="ml-2 text-red-500 flex-shrink-0" />}
            </div>
        );
    };

    useEffect(() => {
        fetchBugs();
    }, [fetchBugs]);

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
        <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
            {/* Spreadsheet */}
            <div className="flex-1 overflow-auto">
                <div className="bg-white border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                        <div className="inline-block min-w-full">
                            {/* Header */}
                            <div className="flex sticky top-0 z-20 border-b border-gray-900">
                                {columns.map((column) => (
                                    <div
                                        key={column.key}
                                        className={`${column.color} px-4 py-3 font-bold text-gray-700 text-sm border-r border-gray-300 last:border-r-0 relative group`}
                                        style={{ width: columnWidths[column.key], minWidth: columnWidths[column.key] }}
                                    >
                                        <div className="flex items-center justify-between">
                                            {column.label}
                                        </div>
                                        <div
                                            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 group-hover:bg-blue-300 transition-colors"
                                            onMouseDown={(e) => startColumnResize(column.key, e)}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* New Row - Always visible */}
                            <div className="flex border-b border-blue-200 bg-blue-50/50 relative group">
                                {columns.map((column) => (
                                    <div
                                        key={`new-${column.key}`}
                                        className="border-r border-gray-200 last:border-r-0"
                                        style={{
                                            width: columnWidths[column.key],
                                            minWidth: columnWidths[column.key],
                                            height: rowHeights['new'] || rowHeights.default
                                        }}
                                    >
                                        {renderCellContent(null, column, true)}
                                    </div>
                                ))}
                                <div
                                    className="absolute left-0 right-0 bottom-0 h-1 cursor-row-resize hover:bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onMouseDown={(e) => startRowResize('new', e)}
                                />
                            </div>

                            {/* Data Rows */}
                            {filteredBugs.map((bug) => (
                                <div key={bug._id} className="flex border-b border-gray-200 hover:bg-gray-50 transition-colors relative group">
                                    {columns.map((column) => (
                                        <div
                                            key={`${bug._id}-${column.key}`}
                                            className="border-r border-gray-200 last:border-r-0 relative"
                                            style={{
                                                width: columnWidths[column.key],
                                                minWidth: columnWidths[column.key],
                                                height: rowHeights[bug._id] || rowHeights.default
                                            }}
                                        >
                                            {renderCellContent(bug, column)}
                                        </div>
                                    ))}
                                    <div
                                        className="absolute left-0 right-0 bottom-0 h-1 cursor-row-resize hover:bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onMouseDown={(e) => startRowResize(bug._id, e)}
                                    />
                                </div>
                            ))}

                            {filteredBugs.length === 0 && (
                                <div className="flex justify-center items-center py-16 text-gray-500">
                                    <div className="text-center">
                                        <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
                                        <p className="text-lg font-medium">No bugs found</p>
                                        <p className="text-sm mt-2">Start typing in the blank row above to create your first bug</p>
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

export default BugSpreadsheet;