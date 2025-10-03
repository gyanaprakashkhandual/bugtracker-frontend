'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, Edit, Trash2, Plus, Search, Filter, MoreVertical } from 'lucide-react';

const BugSpreadsheet = () => {
    const [bugs, setBugs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCell, setEditingCell] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [columnWidths, setColumnWidths] = useState({});
    const [rowHeights, setRowHeights] = useState({});
    const [isResizing, setIsResizing] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);

    const projectId = typeof window !== 'undefined' ? localStorage.getItem("currentProjectId") : null;
    const testTypeId = typeof window !== 'undefined' ? localStorage.getItem("selectedTestTypeId") : null;
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

    const BASE_URL = 'http://localhost:5000/api/v1/bug';

    // Column configuration
    const columns = [
        { key: 'serialNumber', label: 'Serial No', width: 120, editable: false },
        { key: 'bugType', label: 'Type', width: 140, editable: true, type: 'select', options: ['Functional', 'User-Interface', 'Security', 'Database', 'Performance'] },
        { key: 'moduleName', label: 'Module', width: 150, editable: true },
        { key: 'bugDesc', label: 'Description', width: 300, editable: true },
        { key: 'bugRequirement', label: 'Requirement', width: 250, editable: true },
        { key: 'refLink', label: 'Reference', width: 200, editable: true },
        { key: 'priority', label: 'Priority', width: 120, editable: true, type: 'select', options: ['High', 'Low', 'Medium', 'Critical'] },
        { key: 'severity', label: 'Severity', width: 120, editable: true, type: 'select', options: ['Critical', 'High', 'Medium', 'Low'] },
        { key: 'status', label: 'Status', width: 140, editable: true, type: 'select', options: ['New', 'Open', 'In Progress', 'In Review', 'Closed', 'Re Open'] },
        { key: 'actions', label: 'Actions', width: 100, editable: false }
    ];

    // Fetch bugs from API
    const fetchBugs = useCallback(async () => {
        if (!projectId || !testTypeId || !token) {
            console.error('Missing required data from localStorage');
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

            if (!response.ok) {
                throw new Error('Failed to fetch bugs');
            }

            const data = await response.json();
            setBugs(data.bugs || []);

            // Initialize column widths
            const initialWidths = {};
            columns.forEach(col => {
                initialWidths[col.key] = col.width;
            });
            setColumnWidths(initialWidths);

        } catch (error) {
            console.error('Error fetching bugs:', error);
        } finally {
            setLoading(false);
        }
    }, [projectId, testTypeId, token]);

    // Auto-save function
    const autoSave = useCallback(async (bugId, field, value) => {
        if (!token) return;

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

            if (!response.ok) {
                throw new Error('Failed to update bug');
            }

            console.log(`Auto-saved ${field} for bug ${bugId}`);
        } catch (error) {
            console.error('Error auto-saving:', error);
        }
    }, [projectId, testTypeId, token]);

    // Handle cell edit
    const handleCellEdit = (bugId, columnKey, value) => {
        setBugs(prev => prev.map(bug =>
            bug._id === bugId ? { ...bug, [columnKey]: value } : bug
        ));

        // Debounced auto-save
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
        }

        const timeout = setTimeout(() => {
            autoSave(bugId, columnKey, value);
        }, 1000);

        setAutoSaveTimeout(timeout);
    };

    // Start editing cell
    const startEditing = (bugId, columnKey, value) => {
        setEditingCell({ bugId, columnKey });
        setEditValue(value);
    };

    // Stop editing and save
    const stopEditing = () => {
        if (editingCell) {
            handleCellEdit(editingCell.bugId, editingCell.columnKey, editValue);
            setEditingCell(null);
            setEditValue('');
        }
    };

    // Handle resize start
    const handleResizeStart = (columnKey, e) => {
        e.preventDefault();
        setIsResizing(columnKey);
        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', handleResizeStop);
    };

    // Handle resize
    const handleResize = (e) => {
        if (!isResizing) return;

        const newWidth = Math.max(50, e.clientX - e.target.getBoundingClientRect().left);
        setColumnWidths(prev => ({
            ...prev,
            [isResizing]: newWidth
        }));
    };

    // Handle resize stop
    const handleResizeStop = () => {
        setIsResizing(null);
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', handleResizeStop);
    };

    // Add new bug
    const handleAddBug = async () => {
        if (!token) return;

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
                        bugType: 'Functional',
                        moduleName: 'New Module',
                        bugDesc: 'New bug description',
                        bugRequirement: 'New requirement',
                        refLink: 'No Link Provided',
                        priority: 'Medium',
                        severity: 'Medium',
                        status: 'New',
                        image: 'No Image provided'
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Failed to create bug');
            }

            const newBug = await response.json();
            setBugs(prev => [newBug.bug, ...prev]);
        } catch (error) {
            console.error('Error adding bug:', error);
        }
    };

    // Delete bug
    const handleDeleteBug = async (bugId) => {
        if (!token || !confirm('Are you sure you want to delete this bug?')) return;

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

            if (!response.ok) {
                throw new Error('Failed to delete bug');
            }

            setBugs(prev => prev.filter(bug => bug._id !== bugId));
        } catch (error) {
            console.error('Error deleting bug:', error);
        }
    };

    // Filter bugs based on search
    const filteredBugs = bugs.filter(bug =>
        Object.values(bug).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Render cell content based on type
    const renderCellContent = (bug, column) => {
        if (column.key === 'actions') {
            return (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleDeleteBug(bug._id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            );
        }

        const value = bug[column.key];

        if (editingCell?.bugId === bug._id && editingCell?.columnKey === column.key) {
            if (column.type === 'select') {
                return (
                    <select
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={stopEditing}
                        className="w-full h-full border-none outline-none bg-blue-50 px-2"
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
                    onKeyDown={(e) => e.key === 'Enter' && stopEditing()}
                    className="w-full h-full border-none outline-none bg-blue-50 px-2"
                    autoFocus
                />
            );
        }

        return (
            <div
                className="w-full h-full px-2 py-1 flex items-center overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer"
                onClick={() => column.editable && startEditing(bug._id, column.key, value)}
                title={value}
            >
                {value}
            </div>
        );
    };

    useEffect(() => {
        fetchBugs();
    }, [fetchBugs]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleAddBug}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={16} />
                        <span>Add Bug</span>
                    </button>

                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search bugs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                        {filteredBugs.length} bugs
                    </span>
                </div>
            </div>

            {/* Spreadsheet */}
            <div className="overflow-auto max-h-[calc(100vh-200px)]">
                <div className="inline-block min-w-full">
                    {/* Header Row */}
                    <div className="flex bg-gray-100 border-b sticky top-0 z-10">
                        {columns.map((column) => (
                            <div
                                key={column.key}
                                className="flex items-center justify-between px-3 py-2 font-semibold text-gray-700 text-sm border-r last:border-r-0 relative group"
                                style={{ width: columnWidths[column.key] || column.width, minWidth: 50 }}
                            >
                                <span className="truncate">{column.label}</span>

                                {/* Resize Handle */}
                                <div
                                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 group-hover:bg-gray-300"
                                    onMouseDown={(e) => handleResizeStart(column.key, e)}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Data Rows */}
                    {filteredBugs.map((bug, index) => (
                        <motion.div
                            key={bug._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            className="flex border-b hover:bg-gray-50 group"
                        >
                            {columns.map((column) => (
                                <div
                                    key={`${bug._id}-${column.key}`}
                                    className="border-r last:border-r-0 relative"
                                    style={{
                                        width: columnWidths[column.key] || column.width,
                                        minWidth: 50,
                                        height: rowHeights[bug._id] || 'auto',
                                        minHeight: 40
                                    }}
                                >
                                    {renderCellContent(bug, column)}

                                    {/* Edit indicator */}
                                    {column.editable && (
                                        <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Edit size={12} className="text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </motion.div>
                    ))}

                    {filteredBugs.length === 0 && (
                        <div className="flex justify-center items-center py-8 text-gray-500">
                            No bugs found. Click "Add Bug" to create your first bug.
                        </div>
                    )}
                </div>
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t text-sm text-gray-600">
                <div>
                    {editingCell && (
                        <span className="flex items-center space-x-1">
                            <Save size={12} />
                            <span>Editing {columns.find(col => col.key === editingCell.columnKey)?.label}</span>
                        </span>
                    )}
                </div>
                <div>
                    Auto-save enabled • Double-click to edit
                </div>
            </div>

            {/* Resize overlay */}
            {isResizing && (
                <div className="fixed inset-0 z-50 cursor-col-resize" style={{ cursor: 'col-resize' }} />
            )}
        </div>
    );
};

export default BugSpreadsheet;