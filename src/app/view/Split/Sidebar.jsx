'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiAlertCircle, FiRefreshCw, FiCalendar } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';
import { GoogleArrowLeft, GoogleArrowRight } from '@/app/components/utils/Icon';
import { useTestType } from '@/app/script/TestType.context';
import { useTestTypeName } from '@/app/hooks/GetTestType';

const TestCaseSidebar = ({
    testCases,
    selectedTestCase,
    onTestCaseSelect,
    searchTerm,
    onSearchChange,
    loading,
    project,
    testTypeId,
    error,
    onRetry
}) => {
    const [isOpen, setIsOpen] = useState(true);
    const [sidebarWidth, setSidebarWidth] = useState(384);
    const [isResizing, setIsResizing] = useState(false);
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [isFiltering, setIsFiltering] = useState(false);
    const sidebarRef = useRef(null);

    const { selectedTestType } = useTestType();
    const { testTypeName, loading: testTypeLoading, error: testTypeError } = useTestTypeName();

    const minWidth = 280;
    const maxWidth = 600;

    // Handle resize
    const handleMouseDown = (e) => {
        setIsResizing(true);
        e.preventDefault();
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;

            const newWidth = e.clientX;
            if (newWidth >= minWidth && newWidth <= maxWidth) {
                setSidebarWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    // Date filter functions
    const handleDateFilter = async () => {
        if (!startDate) return;

        setIsFiltering(true);
        try {
            const projectId = localStorage.getItem("currentProjectId");
            const testTypeId = localStorage.getItem("selectedTestTypeId");
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/v1/test-case/project/${projectId}/test-type/${testTypeId}/date-range?startDate=${startDate}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                // You'll need to handle the filtered data here
                // This depends on how you want to update the test cases list
                console.log('Filtered test cases:', data.testCases);
            }
        } catch (error) {
            console.error('Error filtering test cases:', error);
        } finally {
            setIsFiltering(false);
            setShowDateFilter(false);
        }
    };

    const handleClearDateFilter = () => {
        setStartDate('');
        setShowDateFilter(false);
        // Trigger refetch of all test cases
        onRetry();
    };

    const handleCustomDateRange = async (customStartDate, customEndDate) => {
        setIsFiltering(true);
        try {
            const projectId = localStorage.getItem("currentProjectId");
            const testTypeId = localStorage.getItem("selectedTestTypeId");
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/v1/test-case/project/${projectId}/test-type/${testTypeId}/custom-date-range?startDate=${customStartDate}&endDate=${customEndDate}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log('Custom date range test cases:', data.testCases);
            }
        } catch (error) {
            console.error('Error filtering test cases:', error);
        } finally {
            setIsFiltering(false);
            setShowDateFilter(false);
        }
    };

    // Quick date filters
    const applyQuickFilter = (days) => {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateStr = startDate.toISOString().split('T')[0];

        handleCustomDateRange(startDateStr, endDate);
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={sidebarRef}
                        initial={{ x: -400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -400, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{ width: sidebarWidth }}
                        className="bg-white border-r border-gray-200 flex flex-col relative sidebar-scrollbar"
                    >
                        {/* Header with Search and Date Filter */}
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-gray-900 text-xl truncate flex-1">
                                    {testTypeLoading
                                        ? "Loading..."
                                        : testTypeError
                                            ? "Error loading test type"
                                            : testTypeName || selectedTestType?.testTypeName || "Unnamed Test Type"}
                                </h2>

                                <button
                                    onClick={() => setIsOpen(false)}
                                    tooltip-data="Close Sidebar"
                                    tooltip-placement="bottom"
                                    tooltip-class=""
                                    className="ml-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    
                                >
                                    <GoogleArrowLeft className="text-gray-600" size={20} />
                                </button>
                            </div>

                            {/* Search Bar with Date Filter */}
                            <div className="space-y-3">
                                <div className="relative">
                                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search test cases..."
                                        value={searchTerm}
                                        onChange={(e) => onSearchChange(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 transition-all text-sm"
                                    />
                                    <button
                                        onClick={() => setShowDateFilter(!showDateFilter)}
                                        tooltip-data="Filter By Calendar"
                                        tooltip-placement="right"
                                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg transition-colors ${startDate ? 'text-blue-600 bg-blue-100' : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                        title="Filter by date"
                                    >
                                        <FiCalendar size={16} />
                                    </button>
                                </div>

                                {/* Date Filter Dropdown */}
                                {showDateFilter && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg"
                                    >
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Filter by Date Range
                                                </label>
                                                <input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 text-sm"
                                                />
                                            </div>

                                            {/* Quick Filters */}
                                            <div className="space-y-2">
                                                <p className="text-xs font-medium text-gray-600">Quick Filters:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        onClick={() => applyQuickFilter(7)}
                                                        className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                                    >
                                                        Last 7 days
                                                    </button>
                                                    <button
                                                        onClick={() => applyQuickFilter(30)}
                                                        className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                                    >
                                                        Last 30 days
                                                    </button>
                                                    <button
                                                        onClick={() => applyQuickFilter(90)}
                                                        className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                                    >
                                                        Last 90 days
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={handleDateFilter}
                                                    disabled={!startDate || isFiltering}
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {isFiltering ? 'Filtering...' : 'Apply Filter'}
                                                </button>
                                                <button
                                                    onClick={handleClearDateFilter}
                                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Error State */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg"
                            >
                                <div className="flex items-center text-red-700 mb-2">
                                    <FiAlertCircle className="mr-2" size={18} />
                                    <span className="font-semibold">Error Loading Test Cases</span>
                                </div>
                                <p className="text-red-600 text-sm mb-3">{error}</p>
                                <button
                                    onClick={onRetry}
                                    className="flex items-center text-sm text-red-700 hover:text-red-800 font-medium transition-colors"
                                >
                                    <FiRefreshCw className="mr-1" size={14} />
                                    Retry
                                </button>
                            </motion.div>
                        )}

                        {/* Test Cases List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {loading || isFiltering ? (
                                <div className="p-4 space-y-3">
                                    {[...Array(6)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="animate-pulse"
                                        >
                                            <div className="p-4 border border-gray-200 rounded-lg space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                                                </div>
                                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                <div className="flex gap-2">
                                                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                                                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                                                    <div className="h-5 bg-gray-200 rounded w-20"></div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 space-y-3">
                                    {testCases.map((testCase, index) => (
                                        <motion.div
                                            key={testCase._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                delay: index * 0.05,
                                                type: 'spring',
                                                damping: 20,
                                                stiffness: 150
                                            }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                if (typeof window !== 'undefined' && testCase._id) {
                                                    localStorage.setItem('currentTestCaseId', testCase._id);
                                                }
                                                onTestCaseSelect(testCase);
                                            }}
                                            className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${selectedTestCase?._id === testCase._id
                                                ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                                                : 'border-gray-200 hover:border-blue-300 hover:shadow-sm bg-white'
                                                }`}
                                        >
                                            {/* Serial Number */}
                                            <div className="mb-3">
                                                <span className="font-bold text-sm text-blue-600 bg-blue-100 px-3 py-1.5 rounded-lg inline-block">
                                                    {testCase.serialNumber || 'TC-XXXXXX'}
                                                </span>
                                            </div>

                                            {/* Module Name */}
                                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 text-base leading-snug">
                                                {testCase.moduleName || 'No module name'}
                                            </h3>

                                            {/* Test Case Description */}
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                                                {testCase.testCaseDescription || 'No description available'}
                                            </p>

                                            {/* Metadata Row */}
                                            <div className="flex flex-wrap gap-2 items-center mb-2">
                                                {/* Severity */}
                                                <span
                                                    className={`px-2.5 py-1 rounded-md text-xs font-semibold ${testCase.severity === 'High' || testCase.severity === 'Critical'
                                                        ? 'bg-red-100 text-red-700'
                                                        : testCase.severity === 'Medium'
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : 'bg-green-100 text-green-700'
                                                        }`}
                                                >
                                                    {testCase.severity || 'Medium'}
                                                </span>

                                                {/* Priority */}
                                                <span
                                                    className={`px-2.5 py-1 rounded-md text-xs font-semibold ${testCase.priority === 'High' || testCase.priority === 'Critical'
                                                        ? 'bg-red-100 text-red-700'
                                                        : testCase.priority === 'Medium'
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : 'bg-green-100 text-green-700'
                                                        }`}
                                                >
                                                    P{testCase.priority?.charAt(0) || 'M'}
                                                </span>

                                                {/* Status */}
                                                <span
                                                    className={`px-2.5 py-1 rounded-md text-xs font-semibold ${testCase.status === 'New'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : testCase.status === 'Solved'
                                                            ? 'bg-green-100 text-green-700'
                                                            : testCase.status === 'Working'
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : testCase.status === 'Closed'
                                                                    ? 'bg-gray-100 text-gray-700'
                                                                    : testCase.status === 'Open'
                                                                        ? 'bg-green-100 text-green-700'
                                                                        : testCase.status === 'Reopen'
                                                                            ? 'bg-orange-100 text-orange-700'
                                                                            : testCase.status === 'Reviewed'
                                                                                ? 'bg-purple-100 text-purple-700'
                                                                                : 'bg-gray-100 text-gray-700'
                                                        }`}
                                                >
                                                    {testCase.status || 'Unknown'}
                                                </span>

                                                {/* Test Type */}
                                                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-100 text-indigo-700">
                                                    {testCase.testCaseType || 'Functional'}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {testCases.length === 0 && !loading && !error && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-center py-12 px-4"
                                        >
                                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                                <FiAlertCircle className="text-gray-400" size={32} />
                                            </div>
                                            <p className="text-lg font-semibold text-gray-700 mb-2">No test cases found</p>
                                            <p className="text-sm text-gray-500 mb-4">
                                                Test cases will appear here once created
                                            </p>
                                            <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm">
                                                <p className="text-blue-700">
                                                    <strong>Tip:</strong> Create test cases for this test type to get started.
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer with Count */}
                        <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-white to-gray-50">
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <p className="text-sm font-medium text-gray-700">
                                    {testCases.length} test case{testCases.length !== 1 ? 's' : ''}
                                    {(loading || isFiltering) && ' • Loading...'}
                                </p>
                            </div>
                        </div>

                        {/* Resize Handle */}
                        <div
                            onMouseDown={handleMouseDown}
                            className={`absolute top-0 right-0 w-[1px] h-full cursor-col-resize hover:bg-blue-400 transition-colors ${isResizing ? 'bg-blue-500' : 'bg-transparent'
                                }`}
                            style={{ touchAction: 'none' }}
                        >
                            <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-4 h-12 flex items-center justify-center">
                                <div className="w-1 h-8 bg-gray-300 rounded-full"></div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button when closed */}
            {!isOpen && (
                <motion.button
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed left-0 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-r-lg shadow-lg transition-colors z-50"
                >
                    <GoogleArrowRight size={20} />
                </motion.button>
            )}
        </>
    );
};

export default TestCaseSidebar;