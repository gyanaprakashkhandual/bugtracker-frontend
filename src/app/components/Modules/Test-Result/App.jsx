'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    XCircle,
    SkipForward,
    Clock,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Trash2,
    Filter,
    Calendar,
    Search,
    BarChart3,
    Package,
    Loader2,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    FileText,
    Code,
    Timer,
    Activity,
    Copy,
    Check,
    AlertCircle
} from 'lucide-react';
import { useAlert } from '@/app/script/Alert.context';
import { useTestType } from '@/app/script/TestType.context';
import { useProject } from '@/app/script/Project.context';

const BASE_URL = 'https://caffetest.onrender.com/api/v1/test-result';

export default function TestResultsDashboard() {
    const { showAlert } = useAlert();
    const { selectedProject } = useProject();
    const { testTypeId } = useTestType();

    const [testResults, setTestResults] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statsError, setStatsError] = useState(null);
    const [selectedResult, setSelectedResult] = useState(null);
    const [copiedCode, setCopiedCode] = useState(false);

    // Pagination
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    // Get token from localStorage
    const getToken = () => {
        return localStorage.getItem('token') || localStorage.getItem('authToken');
    };

    // Fetch test results
    const fetchTestResults = async () => {
        if (!selectedProject?._id || !testTypeId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const token = getToken();

            const queryParams = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString()
            });

            const response = await fetch(
                `${BASE_URL}/${selectedProject._id}/${testTypeId}?${queryParams}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const data = await response.json();

            if (data.success) {
                setTestResults(data.data);
                setPagination(data.pagination);
            } else {
                setError(data.message || 'Failed to fetch test results');
                showAlert('Failed to fetch test results', 'error');
            }
        } catch (error) {
            setError('Error fetching test results. Please try again.');
            showAlert('Error fetching test results', 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch statistics
    const fetchStatistics = async () => {
        if (!selectedProject?._id || !testTypeId) {
            setStatsLoading(false);
            return;
        }

        try {
            setStatsLoading(true);
            setStatsError(null);
            const token = getToken();

            const response = await fetch(
                `${BASE_URL}/stats/${selectedProject._id}/${testTypeId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const data = await response.json();

            if (data.success) {
                setStatistics(data.data);
            } else {
                setStatsError('Failed to load statistics');
            }
        } catch (error) {
            setStatsError('Error loading statistics');
            console.error('Error fetching statistics:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    // Delete test result
    const handleDelete = async (resultId) => {
        if (!confirm('Are you sure you want to delete this test result?')) {
            return;
        }

        try {
            const token = getToken();

            const response = await fetch(`${BASE_URL}/${resultId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                showAlert('Test result deleted successfully', 'success');
                fetchTestResults();
                fetchStatistics();
            } else {
                showAlert(data.message || 'Failed to delete test result', 'error');
            }
        } catch (error) {
            showAlert('Error deleting test result', 'error');
            console.error(error);
        }
    };

    // Copy code to clipboard
    const handleCopyCode = async (code) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(true);
            showAlert('Code copied to clipboard', 'success');
            setTimeout(() => setCopiedCode(false), 2000);
        } catch (error) {
            showAlert('Failed to copy code', 'error');
        }
    };

    useEffect(() => {
        fetchTestResults();
        fetchStatistics();
    }, [selectedProject, testTypeId, pagination.page]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pass':
                return <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" />;
            case 'Fail':
                return <XCircle className="w-4 h-4 text-red-500 dark:text-red-400" />;
            case 'Skipped':
                return <SkipForward className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />;
            default:
                return null;
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            Pass: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
            Fail: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
            Skipped: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
        };

        return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
                {status}
            </span>
        );
    };

    const formatDuration = (ms) => {
        if (!ms || ms === 0) return '0ms';
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!selectedProject || !testTypeId) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Package className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Please select a project and test type</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[100vh(calc(100vh-65px))] bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {statsLoading ? (
                    // Loading State
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3"></div>
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        </div>
                    ))
                ) : statsError ? (
                    // Error State
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 p-4">
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-xs font-medium">Error</span>
                            </div>
                            <div className="text-xs text-red-600 dark:text-red-400">--</div>
                        </div>
                    ))
                ) : !statistics ? (
                    // No Data State
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">No Data</span>
                                <Activity className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                            </div>
                            <div className="text-2xl font-bold text-gray-400 dark:text-gray-600">--</div>
                        </div>
                    ))
                ) : (
                    // Data State
                    <>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Tests</span>
                                <Activity className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {statistics.totalResults || 0}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Passed</span>
                                <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" />
                            </div>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {statistics.byStatus?.find(s => s._id === 'Pass')?.count || 0}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Failed</span>
                                <XCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                            </div>
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {statistics.byStatus?.find(s => s._id === 'Fail')?.count || 0}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Avg Duration</span>
                                <Timer className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {formatDuration(statistics.averageDuration || 0)}
                            </div>
                        </motion.div>
                    </>
                )}
            </div>

            {/* Test Results Table */}
            <div className="min-h-[calc(100vh-226px)] bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        // Loading State
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-3" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">Loading test results...</p>
                            </div>
                        </div>
                    ) : error ? (
                        // Error State
                        <div className="flex flex-col items-center justify-center h-64 text-red-500 dark:text-red-400">
                            <AlertCircle className="w-12 h-12 mb-3" />
                            <p className="text-sm font-medium mb-2">Error Loading Test Results</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                            <button
                                onClick={() => {
                                    fetchTestResults();
                                    fetchStatistics();
                                }}
                                className="px-4 py-2 text-xs font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-2"
                            >
                                <RefreshCw className="w-3 h-3" />
                                Try Again
                            </button>
                        </div>
                    ) : testResults.length === 0 ? (
                        // No Data State
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                            <FileText className="w-12 h-12 mb-3 text-gray-400 dark:text-gray-600" />
                            <p className="text-sm font-medium mb-1">No test results found</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">Run some tests to see results here</p>
                        </div>
                    ) : (
                        // Data State
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Serial
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Test Details
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Framework
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Duration
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Timestamp
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {testResults.map((result, index) => (
                                    <motion.tr
                                        key={result._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                                        onClick={() => setSelectedResult(result)}
                                    >
                                        <td className="px-4 py-3 text-xs font-mono text-gray-900 dark:text-gray-100">
                                            {result.serialNumber}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {result.feature || result.className}
                                                </span>
                                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                                    {result.scenario || result.methodName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {getStatusBadge(result.status)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                                                {result.testFramework}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                                            {formatDuration(result.duration)}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                                            {formatDate(result.timestamp)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(result._id);
                                                }}
                                                className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {!loading && !error && pagination.totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                            {pagination.total} results
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                disabled={pagination.page === 1}
                                className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                disabled={pagination.page === pagination.totalPages}
                                className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedResult && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50"
                        onClick={() => setSelectedResult(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Test Result Details</h2>
                                    <button
                                        onClick={() => setSelectedResult(null)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                    >
                                        <XCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Serial Number</label>
                                            <p className="text-sm font-mono text-gray-900 dark:text-gray-100">{selectedResult.serialNumber}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Status</label>
                                            <div className="mt-1">{getStatusBadge(selectedResult.status)}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Framework</label>
                                            <p className="text-sm text-gray-900 dark:text-gray-100">{selectedResult.testFramework}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Duration</label>
                                            <p className="text-sm text-gray-900 dark:text-gray-100">{formatDuration(selectedResult.duration)}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Test Description</label>
                                        <p className="text-sm text-gray-900 dark:text-gray-100">{selectedResult.testCaseDescription}</p>
                                    </div>

                                    {selectedResult.error && (
                                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                            <label className="text-xs font-medium text-red-700 dark:text-red-400 flex items-center gap-1 mb-1">
                                                <AlertTriangle className="w-3 h-3" />
                                                Error Details
                                            </label>
                                            <pre className="text-xs text-red-800 dark:text-red-300 whitespace-pre-wrap">{selectedResult.error}</pre>
                                        </div>
                                    )}

                                    {selectedResult.steps && selectedResult.steps.length > 0 && (
                                        <div>
                                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">Test Steps</label>
                                            <div className="space-y-2">
                                                {selectedResult.steps.map((step, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                        {getStatusIcon(step.status)}
                                                        <span className="text-sm text-gray-900 dark:text-gray-100">{step.name}</span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                                                            {formatDuration(step.duration)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {selectedResult.rawData?.testCode && (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                    <Code className="w-3 h-3" />
                                                    Test Code
                                                </label>
                                                <button
                                                    onClick={() => handleCopyCode(Object.values(selectedResult.rawData.testCode)[0])}
                                                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                                >
                                                    {copiedCode ? (
                                                        <>
                                                            <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                                                            <span className="text-green-600 dark:text-green-400">Copied!</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3 h-3" />
                                                            Copy
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <pre className="text-xs bg-gray-900 dark:bg-gray-950 text-gray-100 dark:text-gray-200 p-3 rounded-lg overflow-x-auto">
                                                {Object.values(selectedResult.rawData.testCode)[0]}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}