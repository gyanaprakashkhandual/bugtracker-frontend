"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Users } from "lucide-react";
import { useParams } from 'next/navigation';
import { useProject } from '@/app/utils/Get.project';
import { useTestType } from "@/app/script/TestType.context";
import axios from 'axios';
import { FileCode } from "lucide-react";

export default function TestTypeSidebar({ sidebarOpen, onClose }) {
    const params = useParams();
    const actualSlug = params?.slug;

    const [testTypes, setTestTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userAccess, setUserAccess] = useState({});

    const { project, loading: projectLoading } = useProject(actualSlug);
    const { selectedTestType, selectTestType } = useTestType();

    const fetchAccessibleTestTypes = async () => {
    if (!project?._id) {
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

        // Use the CORRECT endpoint - access/accessible-testtypes
        const response = await axios.get(
            `http://localhost:5000/api/v1/access/accessible-testtypes?projectId=${project._id}`, // Changed to access endpoint
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const fetchedTestTypes = response.data?.testTypes || response.data?.data || [];
        setTestTypes(fetchedTestTypes);

        // Fetch user's access levels for these test types
        await fetchUserAccessLevels(fetchedTestTypes);

    } catch (err) {
        console.error('Full error details:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load test types');
    } finally {
        setLoading(false);
    }
};

    const fetchUserAccessLevels = async (testTypesList) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const accessResponse = await axios.get(
                `http://localhost:5000/api/v1/access/my-testtypes`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const accessList = accessResponse.data?.accessList || [];
            const accessMap = {};

            accessList.forEach(access => {
                accessMap[access.testTypeId?._id] = access.accessLevel;
            });

            // For owned test types, set access level as 'admin'
            testTypesList.forEach(testType => {
                if (testType.user?._id === JSON.parse(atob(token.split('.')[1])).userId) {
                    accessMap[testType._id] = 'admin';
                }
            });

            setUserAccess(accessMap);
        } catch (err) {
            console.error('Error fetching access levels:', err);
        }
    };

    useEffect(() => {
        if (sidebarOpen && project?._id && !projectLoading) {
            fetchAccessibleTestTypes();
        }
    }, [sidebarOpen, project?._id, projectLoading]);

    const handleTestTypeClick = (testType) => {
        selectTestType(testType);
    };

    const getAccessLevelBadge = (testTypeId) => {
        const accessLevel = userAccess[testTypeId];
        if (!accessLevel) return null;

        const badgeConfig = {
            admin: { color: 'bg-purple-100 text-purple-700', label: 'Admin' },
            edit: { color: 'bg-blue-100 text-blue-700', label: 'Edit' },
            view: { color: 'bg-gray-100 text-gray-700', label: 'View' }
        };

        const config = badgeConfig[accessLevel];
        if (!config) return null;

        return (
            <span className={`ml-2 px-1.5 py-0.5 text-xs font-medium rounded ${config.color}`}>
                {config.label}
            </span>
        );
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

    if (projectLoading) {
        return (
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ duration: 0.2 }}
                        className="fixed left-0 top-0 h-[calc(100vh-4rem)] w-70 mt-16 bg-white z-50 border-r border-gray-200"
                    >
                        <div className="flex items-center justify-center h-full">
                            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
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
                        className="user-select-none fixed left-0 top-0 h-[calc(100vh-4rem)] w-70 mt-16 bg-white z-50 flex flex-col border-r border-gray-200"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900 flex items-center">
                                    <FileCode className="w-4 h-4 mr-2" />
                                    Test Types
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {testTypes.length} configurations
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
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
                                    <p className="mt-1 text-xs text-center text-gray-500">{error}</p>
                                    <button
                                        onClick={fetchAccessibleTestTypes}
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
                                                px-4 py-3 rounded-lg cursor-pointer transition-all border
                                                ${selectedTestType?._id === testType._id
                                                    ? 'bg-blue-50 border-blue-200'
                                                    : 'hover:bg-gray-50 border-gray-100'
                                                }
                                                ${isOwnedByUser(testType) ? 'border-l-4 border-l-green-400' : ''}
                                            `}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={`
                                                        text-sm font-medium truncate flex items-center
                                                        ${selectedTestType?._id === testType._id
                                                            ? 'text-blue-700'
                                                            : 'text-gray-900'
                                                        }
                                                    `}>
                                                        {testType.testTypeName}
                                                        {getAccessLevelBadge(testType._id)}
                                                    </h3>
                                                    {testType.testFramework && (
                                                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                                                            {testType.testFramework}
                                                        </span>
                                                    )}
                                                </div>
                                                {isOwnedByUser(testType) && (
                                                    <Shield className="w-3 h-3 text-green-500 flex-shrink-0 mt-1" />
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                                    <Users className="w-8 h-8 mb-2 text-gray-300" />
                                    <p className="text-sm font-medium">No test types available</p>
                                    <p className="mt-1 text-xs text-gray-400 text-center">
                                        You don't have access to any test types in this project
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}