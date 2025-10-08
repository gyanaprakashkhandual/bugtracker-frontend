"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useParams } from 'next/navigation';
import { useProject } from '@/app/utils/Get.project';
import { useTestType } from "@/app/script/TestType.context";
import axios from 'axios';

export default function TestTypeSidebar({ sidebarOpen, onClose }) {
    const params = useParams();
    const actualSlug = params?.slug;

    const [testTypes, setTestTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { project, loading: projectLoading } = useProject(actualSlug);
    const { selectedTestType, selectTestType } = useTestType();

    const fetchTestTypes = async () => {
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

            const response = await axios.get(
                `http://localhost:5000/api/v1/test-type/projects/${project._id}/test-types`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setTestTypes(response.data?.testTypes || response.data?.data || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to load test types');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (sidebarOpen && project?._id && !projectLoading) {
            fetchTestTypes();
        }
    }, [sidebarOpen, project?._id, projectLoading]);

    const handleTestTypeClick = (testType) => {
        selectTestType(testType);
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
                        className="fixed left-0 top-0 h-[calc(100vh-4rem)] w-70 mt-16 bg-white z-50 flex flex-col border-r border-gray-200"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">
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
                                                px-4 py-3 rounded-lg cursor-pointer transition-all
                                                ${selectedTestType?._id === testType._id
                                                    ? 'bg-blue-50 border border-blue-200'
                                                    : 'hover:bg-gray-50 border border-transparent'
                                                }
                                            `}
                                        >
                                            <h3 className={`
                                                text-sm font-medium truncate
                                                ${selectedTestType?._id === testType._id
                                                    ? 'text-blue-700'
                                                    : 'text-gray-900'
                                                }
                                            `}>
                                                {testType.testTypeName}
                                            </h3>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                                    <p className="text-sm font-medium">No test types found</p>
                                    <p className="mt-1 text-xs text-gray-400">Create your first test type</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}