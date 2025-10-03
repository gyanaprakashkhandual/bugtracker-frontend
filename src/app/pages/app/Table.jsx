import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Trash2, Plus, Search, AlertCircle, Check, X, Loader2, RefreshCw, Archive, ChevronDown } from 'lucide-react';

const BugSpreadsheet = () => {
    const [bugs, setBugs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCell, setEditingCell] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [savingCells, setSavingCells] = useState(new Set());
    const [errorCells, setErrorCells] = useState(new Set());
    const [newRow, setNewRow] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [deleteMode, setDeleteMode] = useState(null);
    const dropdownRef = useRef(null);

    const projectId = typeof window !== 'undefined' ? localStorage.getItem("currentProjectId") : null;
    const testTypeId = typeof window !== 'undefined' ? localStorage.getItem("selectedTestTypeId") : null;
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

    const BASE_URL = 'http://localhost:5000/api/v1/bug';

    const columns = [
        { key: 'serialNumber', label: 'S.No', width: 80, editable: false },
        { key: 'bugType', label: 'Type', width: 140, editable: true, type: 'select', options: ['Functional', 'User-Interface', 'Security', 'Database', 'Performance'] },
        { key: 'moduleName', label: 'Module', width: 160, editable: true },
        { key: 'bugDesc', label: 'Description', width: 320, editable: true },
        { key: 'bugRequirement', label: 'Requirement', width: 200, editable: true },
        { key: 'refLink', label: 'Reference Link', width: 180, editable: true },
        { key: 'priority', label: 'Priority', width: 130, editable: true, type: 'select', options: ['Critical', 'High', 'Medium', 'Low'] },
        { key: 'severity', label: 'Severity', width: 130, editable: true, type: 'select', options: ['Critical', 'High', 'Medium', 'Low'] },
        { key: 'status', label: 'Status', width: 150, editable: true, type: 'select', options: ['New', 'Open', 'In Progress', 'In Review', 'Closed', 'Re Open'] },
        { key: 'actions', label: 'Actions', width: 100, editable: false }
    ];

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

    const handleDropdownSelect = (bugId, columnKey, value) => {
        if (bugId === 'new') {
            setNewRow(prev => ({ ...prev, [columnKey]: value }));
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
        if (editingCell && editingCell.bugId !== 'new') {
            handleCellEdit(editingCell.bugId, editingCell.columnKey, editValue);
        } else if (editingCell && editingCell.bugId === 'new') {
            setNewRow(prev => ({ ...prev, [editingCell.columnKey]: editValue }));
        }
        setEditingCell(null);
        setEditValue('');
    };

    const initializeNewRow = () => {
        setNewRow({
            bugType: 'Functional',
            moduleName: '',
            bugDesc: '',
            bugRequirement: '',
            refLink: '',
            priority: 'Medium',
            severity: 'Medium',
            status: 'New'
        });
    };

    const createBug = async () => {
        if (!newRow || !token) return;

        if (!newRow.moduleName || !newRow.bugDesc) {
            alert('Please fill in at least Module and Description');
            return;
        }

        setIsCreating(true);

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
                        ...newRow,
                        image: 'No Image provided'
                    })
                }
            );

            if (!response.ok) throw new Error('Failed to create bug');

            const result = await response.json();
            setBugs(prev => [result.bug, ...prev]);
            setNewRow(null);
        } catch (error) {
            console.error('Error creating bug:', error);
            alert('Failed to create bug');
        } finally {
            setIsCreating(false);
        }
    };

    const cancelNewRow = () => {
        setNewRow(null);
        setEditingCell(null);
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
            setDeleteMode(null);
        } catch (error) {
            console.error('Error deleting bug permanently:', error);
            alert('Failed to delete bug permanently');
        }
    };

    const filteredBugs = bugs.filter(bug =>
        Object.values(bug).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const getPriorityColor = (priority) => {
        const colors = {
            'Critical': 'bg-red-100 text-red-800 border-red-200',
            'High': 'bg-orange-100 text-orange-800 border-orange-200',
            'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Low': 'bg-green-100 text-green-800 border-green-200'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusColor = (status) => {
        const colors = {
            'New': 'bg-blue-100 text-blue-800 border-blue-200',
            'Open': 'bg-purple-100 text-purple-800 border-purple-200',
            'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'In Review': 'bg-orange-100 text-orange-800 border-orange-200',
            'Closed': 'bg-green-100 text-green-800 border-green-200',
            'Re Open': 'bg-red-100 text-red-800 border-red-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getSeverityColor = (severity) => {
        const colors = {
            'Critical': 'bg-red-100 text-red-800 border-red-200',
            'High': 'bg-orange-100 text-orange-800 border-orange-200',
            'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Low': 'bg-green-100 text-green-800 border-green-200'
        };
        return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const renderDropdown = (bugId, column, value) => {
        const cellKey = `${bugId}-${column.key}`;
        const isActive = activeDropdown === cellKey;

        return (
            <div className="relative w-full h-full" ref={isActive ? dropdownRef : null}>
                <button
                    onClick={() => setActiveDropdown(isActive ? null : cellKey)}
                    className="w-full h-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${column.key === 'priority' ? getPriorityColor(value) :
                            column.key === 'severity' ? getSeverityColor(value) :
                                getStatusColor(value)
                        }`}>
                        {value || 'Select'}
                    </span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${isActive ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden"
                        >
                            <div className="py-1 max-h-64 overflow-y-auto">
                                {column.options.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => handleDropdownSelect(bugId, column.key, option)}
                                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${value === option ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${column.key === 'priority' ? getPriorityColor(option) :
                                                column.key === 'severity' ? getSeverityColor(option) :
                                                    getStatusColor(option)
                                            }`}>
                                            {option}
                                        </span>
                                        {value === option && (
                                            <Check size={14} className="text-blue-600" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const renderCellContent = (bug, column, isNewRow = false) => {
        const bugId = isNewRow ? 'new' : bug._id;
        const value = isNewRow ? newRow?.[column.key] : bug[column.key];
        const cellKey = `${bugId}-${column.key}`;
        const isSaving = savingCells.has(cellKey);
        const hasError = errorCells.has(cellKey);

        if (column.key === 'actions') {
            if (isNewRow) {
                return (
                    <div className="flex items-center justify-center space-x-2 h-full">
                        <button
                            onClick={createBug}
                            disabled={isCreating}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                            title="Save"
                        >
                            {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        </button>
                        <button
                            onClick={cancelNewRow}
                            disabled={isCreating}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Cancel"
                        >
                            <X size={16} />
                        </button>
                    </div>
                );
            }

            return (
                <div className="flex items-center justify-center h-full space-x-1">
                    <button
                        onClick={() => moveBugToTrash(bug._id)}
                        className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                        title="Move to Trash"
                    >
                        <Archive size={16} />
                    </button>
                    <button
                        onClick={() => deleteBugPermanently(bug._id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Permanently"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            );
        }

        if (column.key === 'serialNumber' && !isNewRow) {
            return (
                <div className="flex items-center justify-center h-full px-3 font-medium text-gray-600">
                    {value}
                </div>
            );
        }

        if (column.type === 'select' && (column.key === 'priority' || column.key === 'severity' || column.key === 'status')) {
            return renderDropdown(bugId, column, value);
        }

        if (editingCell?.bugId === bugId && editingCell?.columnKey === column.key) {
            if (column.type === 'select') {
                return (
                    <select
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={stopEditing}
                        className="w-full h-full border-2 border-blue-500 outline-none bg-white px-3 py-2"
                        autoFocus
                    >
                        {column.options.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                );
            }

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

        let displayValue = value || (isNewRow && column.editable ? 'Click to edit' : '');
        let cellClass = "w-full h-full px-3 py-2 flex items-center overflow-hidden text-ellipsis whitespace-nowrap";

        if (column.editable) {
            cellClass += " cursor-pointer hover:bg-gray-50";
        }

        return (
            <div
                className={cellClass}
                onClick={() => column.editable && startEditing(bugId, column.key, value)}
                title={value}
            >
                <span className={isNewRow && !value ? 'text-gray-400 italic' : ''}>
                    {displayValue}
                </span>
                {isSaving && <Loader2 size={14} className="ml-2 animate-spin text-blue-500" />}
                {hasError && <AlertCircle size={14} className="ml-2 text-red-500" />}
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
        <div className="w-full h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b shadow-sm">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Bug Tracker</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage and track project bugs</p>
                        </div>
                        <button
                            onClick={fetchBugs}
                            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <RefreshCw size={16} />
                            <span>Refresh</span>
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={initializeNewRow}
                                disabled={newRow !== null}
                                className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus size={18} />
                                <span className="font-medium">Add New Bug</span>
                            </button>

                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search bugs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-sm">
                                <span className="text-gray-600">Total:</span>
                                <span className="ml-2 font-semibold text-gray-900">{filteredBugs.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spreadsheet */}
            <div className="flex-1 overflow-auto px-6 py-4">
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <div className="inline-block min-w-full">
                            {/* Header */}
                            <div className="flex bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-300 sticky top-0 z-20">
                                {columns.map((column) => (
                                    <div
                                        key={column.key}
                                        className="px-4 py-3 font-semibold text-gray-700 text-sm border-r border-gray-300 last:border-r-0"
                                        style={{ width: column.width, minWidth: column.width }}
                                    >
                                        {column.label}
                                    </div>
                                ))}
                            </div>

                            {/* New Row */}
                            <AnimatePresence>
                                {newRow && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex border-b-2 border-blue-300 bg-blue-50"
                                    >
                                        {columns.map((column) => (
                                            <div
                                                key={`new-${column.key}`}
                                                className="border-r border-gray-200 last:border-r-0"
                                                style={{ width: column.width, minWidth: column.width, minHeight: 48 }}
                                            >
                                                {renderCellContent(null, column, true)}
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Data Rows */}
                            {filteredBugs.map((bug, index) => (
                                <motion.div
                                    key={bug._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    {columns.map((column) => (
                                        <div
                                            key={`${bug._id}-${column.key}`}
                                            className="border-r border-gray-200 last:border-r-0 relative"
                                            style={{ width: column.width, minWidth: column.width, minHeight: 48 }}
                                        >
                                            {renderCellContent(bug, column)}
                                        </div>
                                    ))}
                                </motion.div>
                            ))}

                            {filteredBugs.length === 0 && !newRow && (
                                <div className="flex justify-center items-center py-16 text-gray-500">
                                    <div className="text-center">
                                        <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
                                        <p className="text-lg font-medium">No bugs found</p>
                                        <p className="text-sm mt-2">Click "Add New Bug" to create your first bug report</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-white border-t px-6 py-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Auto-save enabled</span>
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="flex items-center space-x-2">
                            <Archive size={14} className="text-orange-600" />
                            <span>Move to trash</span>
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="flex items-center space-x-2">
                            <Trash2 size={14} className="text-red-600" />
                            <span>Delete permanently</span>
                        </span>
                    </div>
                    <div>
                        Click dropdowns to change • Click cells to edit • Auto-saves on change
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BugSpreadsheet;