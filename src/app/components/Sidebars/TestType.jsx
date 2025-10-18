"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, FileCode, Plus, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { useProject } from "@/app/script/Project.context";
import { useTestType } from "@/app/script/TestType.context";
import axios from 'axios';

export default function TestTypeSidebar({ sidebarOpen, onClose }) {
    const [testTypes, setTestTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [selectedTestTypeForAction, setSelectedTestTypeForAction] = useState(null);
    const [newTestTypeName, setNewTestTypeName] = useState("");
    const [newTestTypeDesc, setNewTestTypeDesc] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const dropdownRefs = useRef({});
    const { selectedProject } = useProject();
    const { selectedTestType, selectTestType } = useTestType();

    const fetchTestTypes = async () => {
        if (!selectedProject?._id) {
            setLoading(false);
            return;
        }

        try {
            setError(null);
            setLoading(true);

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get(
                `http://localhost:5000/api/v1/test-type/projects/${selectedProject._id}/test-types`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const fetchedTestTypes = response.data?.testTypes || [];
            setTestTypes(fetchedTestTypes);

        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to load test types');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (sidebarOpen && selectedProject?._id) {
            fetchTestTypes();
        }
    }, [sidebarOpen, selectedProject?._id]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDropdown && !event.target.closest('.dropdown-container')) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdown]);

    const handleTestTypeClick = (testType) => {
        selectTestType(testType);
    };

    const toggleDropdown = (testTypeId, event) => {
        event.stopPropagation();
        setOpenDropdown(openDropdown === testTypeId ? null : testTypeId);
    };

    const getDropdownPosition = (testTypeId) => {
        const dropdown = dropdownRefs.current[testTypeId];
        if (!dropdown) return {};

        const rect = dropdown.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        if (spaceBelow < 150 && spaceAbove > spaceBelow) {
            return { bottom: '100%', marginBottom: '0.25rem' };
        }
        return { top: '100%', marginTop: '0.25rem' };
    };

    const handleCreateTestType = async () => {
        if (!newTestTypeName.trim() || !selectedProject?._id) return;

        try {
            setActionLoading(true);
            const token = localStorage.getItem('token');

            await axios.post(
                `http://localhost:5000/api/v1/test-type/projects/${selectedProject._id}/test-types`,
                {
                    testTypeName: newTestTypeName,
                    testTypeDesc: newTestTypeDesc || 'No Description'
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setNewTestTypeName("");
            setNewTestTypeDesc("");
            setIsCreateModalOpen(false);
            await fetchTestTypes();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create test type');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRenameTestType = async () => {
        if (!newTestTypeName.trim() || !selectedTestTypeForAction) return;

        try {
            setActionLoading(true);
            const token = localStorage.getItem('token');

            await axios.put(
                `http://localhost:5000/api/v1/test-type/test-types/${selectedTestTypeForAction._id}`,
                {
                    testTypeName: newTestTypeName,
                    testTypeDesc: newTestTypeDesc || selectedTestTypeForAction.testTypeDesc
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setNewTestTypeName("");
            setNewTestTypeDesc("");
            setIsRenameModalOpen(false);
            setSelectedTestTypeForAction(null);
            await fetchTestTypes();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to rename test type');
        } finally {
            setActionLoading(false);
        }
    };

    const handleMoveToTrash = async (testType) => {
        if (!confirm(`Are you sure you want to move "${testType.testTypeName}" to trash?`)) return;

        try {
            const token = localStorage.getItem('token');

            await axios.patch(
                `http://localhost:5000/api/v1/test-type/test-types/${testType._id}/trash`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setOpenDropdown(null);
            await fetchTestTypes();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to move to trash');
        }
    };

    const openRenameModal = (testType, event) => {
        event.stopPropagation();
        setSelectedTestTypeForAction(testType);
        setNewTestTypeName(testType.testTypeName);
        setNewTestTypeDesc(testType.testTypeDesc || "");
        setIsRenameModalOpen(true);
        setOpenDropdown(null);
    };

    const isOwnedByUser = (testType) => {
        const token = localStorage.getItem('token');
        if (!token) return false;

        try {
            const userData = JSON.parse(atob(token.split('.')[1]));
            return testType.user?._id === userData.userId;
        } catch {
            return false;
        }
    };

    if (!selectedProject) {
        return null;
    }

    return (
        <>
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 bg-black/20 z-40"
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ duration: 0.2 }}
                        className="user-select-none fixed left-0 top-0 h-[calc(100vh-4rem)] w-70 mt-16 bg-white dark:bg-gray-800 z-50 flex flex-col border-r border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                    <FileCode className="w-4 h-4 mr-2" />
                                    Test Types
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {testTypes.length} configurations
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="px-3 py-3 border-b border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Test Type
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3">
                            {loading ? (
                                <div className="flex items-center justify-center h-40">
                                    <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center h-40 px-4">
                                    <p className="text-sm font-medium text-red-600">Error loading test types</p>
                                    <p className="mt-1 text-xs text-center text-gray-500 dark:text-gray-400">{error}</p>
                                    <button
                                        onClick={fetchTestTypes}
                                        className="px-4 py-2 mt-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : testTypes.length > 0 ? (
                                <div className="space-y-1">
                                    {testTypes.map((testType) => (
                                        <motion.div
                                            key={testType._id}
                                            whileHover={{ x: 2 }}
                                            transition={{ duration: 0.1 }}
                                            onClick={() => handleTestTypeClick(testType)}
                                            className={`
                                                px-4 py-3 rounded-lg cursor-pointer transition-all border relative
                                                ${selectedTestType?._id === testType._id
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-100 dark:border-gray-700'
                                                }
                                                ${isOwnedByUser(testType) ? 'border-l-4 border-l-green-400' : ''}
                                            `}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={`
                                                        text-sm font-medium truncate flex items-center
                                                        ${selectedTestType?._id === testType._id
                                                            ? 'text-blue-700 dark:text-blue-400'
                                                            : 'text-gray-900 dark:text-gray-100'
                                                        }
                                                    `}>
                                                        {testType.testTypeName}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {isOwnedByUser(testType) && (
                                                        <Shield className="w-3 h-3 text-green-500 flex-shrink-0" />
                                                    )}
                                                    <div className="dropdown-container relative" ref={el => dropdownRefs.current[testType._id] = el}>
                                                        <button
                                                            onClick={(e) => toggleDropdown(testType._id, e)}
                                                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                                        >
                                                            <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                        </button>
                                                        {openDropdown === testType._id && (
                                                            <div
                                                                className="absolute right-0 z-50 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1"
                                                                style={getDropdownPosition(testType._id)}
                                                            >
                                                                <button
                                                                    onClick={(e) => openRenameModal(testType, e)}
                                                                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                                >
                                                                    <Edit2 className="w-4 h-4 mr-2" />
                                                                    Rename
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleMoveToTrash(testType);
                                                                    }}
                                                                    className="w-full flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                                    Trash
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-gray-400">
                                    <FileCode className="w-8 h-8 mb-2 text-gray-300 dark:text-gray-600" />
                                    <p className="text-sm font-medium">No test types available</p>
                                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 text-center">
                                        Create your first test type to get started
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Create Test Type</h3>
                        <input
                            type="text"
                            placeholder="Test Type Name"
                            value={newTestTypeName}
                            onChange={(e) => setNewTestTypeName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                        <textarea
                            placeholder="Description (optional)"
                            value={newTestTypeDesc}
                            onChange={(e) => setNewTestTypeDesc(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            rows="3"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setNewTestTypeName("");
                                    setNewTestTypeDesc("");
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateTestType}
                                disabled={actionLoading || !newTestTypeName.trim()}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {actionLoading ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {isRenameModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Rename Test Type</h3>
                        <input
                            type="text"
                            placeholder="Test Type Name"
                            value={newTestTypeName}
                            onChange={(e) => setNewTestTypeName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                        <textarea
                            placeholder="Description (optional)"
                            value={newTestTypeDesc}
                            onChange={(e) => setNewTestTypeDesc(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            rows="3"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setIsRenameModalOpen(false);
                                    setNewTestTypeName("");
                                    setNewTestTypeDesc("");
                                    setSelectedTestTypeForAction(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRenameTestType}
                                disabled={actionLoading || !newTestTypeName.trim()}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {actionLoading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
}