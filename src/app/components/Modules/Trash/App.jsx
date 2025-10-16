'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, FileText, Bug, X, RotateCcw, AlertCircle } from 'lucide-react';
import TrashedBugs from './component/Bug.trash';

// Test Case Dustbin Component
const TestCaseDustbin = ({ onClose }) => {
    const demoTestCases = [
        { id: 1, name: 'Login Functionality Test', module: 'Authentication', deletedDate: '2025-10-15' },
        { id: 2, name: 'Payment Gateway Integration', module: 'Payment', deletedDate: '2025-10-14' },
        { id: 3, name: 'User Profile Update Test', module: 'User Management', deletedDate: '2025-10-13' },
        { id: 4, name: 'Search Functionality Test', module: 'Search', deletedDate: '2025-10-12' },
        { id: 5, name: 'File Upload Test', module: 'Media', deletedDate: '2025-10-11' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-16 left-0 right-0 bg-white shadow-2xl border-t border-gray-200 z-40"
            style={{ height: 'calc(100vh - 4rem)' }}
        >
            <div className="h-full overflow-y-auto p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Test Case Dustbin</h2>
                                <p className="text-sm text-gray-500">Deleted test cases - {demoTestCases.length} items</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>

                    {/* Empty State or List */}
                    {demoTestCases.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="p-6 bg-gray-100 rounded-full mb-4">
                                <Trash2 className="w-16 h-16 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No deleted test cases</h3>
                            <p className="text-gray-500">Your test case dustbin is empty</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {demoTestCases.map((testCase) => (
                                <motion.div
                                    key={testCase.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <FileText className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-1">{testCase.name}</h3>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>Module: {testCase.module}</span>
                                                    <span>•</span>
                                                    <span>Deleted: {testCase.deletedDate}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2 font-medium">
                                                <RotateCcw className="w-4 h-4" />
                                                Restore
                                            </button>
                                            <button className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 font-medium">
                                                <X className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// Bug Dustbin Component
const BugDustbin = ({ onClose }) => {
    const demoBugs = [
        { id: 1, title: 'Login button not responding', severity: 'Critical', module: 'Login Module', deletedDate: '2025-10-15' },
        { id: 2, title: 'Payment page crashes on submit', severity: 'High', module: 'Payment Gateway', deletedDate: '2025-10-14' },
        { id: 3, title: 'Navbar alignment issue', severity: 'Low', module: 'UI/UX', deletedDate: '2025-10-13' },
        { id: 4, title: 'API timeout error', severity: 'Medium', module: 'Backend', deletedDate: '2025-10-12' },
        { id: 5, title: 'Image upload fails', severity: 'High', module: 'Media Upload', deletedDate: '2025-10-11' },
    ];

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'Critical':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'High':
                return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Low':
                return 'bg-green-100 text-green-700 border-green-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-16 left-0 right-0 bg-white shadow-2xl border-t border-gray-200 z-40"
            style={{ height: 'calc(100vh - 4rem)' }}
        >
            <div className="h-full overflow-y-auto p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-100 rounded-lg">
                                <Bug className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Bug Dustbin</h2>
                                <p className="text-sm text-gray-500">Deleted bugs - {demoBugs.length} items</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>

                    {/* Empty State or List */}
                    {demoBugs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="p-6 bg-gray-100 rounded-full mb-4">
                                <Trash2 className="w-16 h-16 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No deleted bugs</h3>
                            <p className="text-gray-500">Your bug dustbin is empty</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {demoBugs.map((bug) => (
                                <motion.div
                                    key={bug.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="p-2 bg-red-50 rounded-lg">
                                                <Bug className="w-5 h-5 text-red-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-2">{bug.title}</h3>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(bug.severity)}`}>
                                                        {bug.severity}
                                                    </span>
                                                    <span className="text-sm text-gray-500">Module: {bug.module}</span>
                                                    <span className="text-sm text-gray-400">•</span>
                                                    <span className="text-sm text-gray-500">Deleted: {bug.deletedDate}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2 font-medium">
                                                <RotateCcw className="w-4 h-4" />
                                                Restore
                                            </button>
                                            <button className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 font-medium">
                                                <X className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// Main Navbar Component
const DustbinNavbar = () => {
    const [activeTab, setActiveTab] = useState(null);

    // Load active tab from memory on mount
    useState(() => {
        const savedTab = typeof window !== 'undefined' ? window.__dustbinActiveTab : null;
        if (savedTab) {
            setActiveTab(savedTab);
        }
    });

    const handleTabClick = (tab) => {
        const newTab = activeTab === tab ? null : tab;
        setActiveTab(newTab);
        // Save to memory
        if (typeof window !== 'undefined') {
            window.__dustbinActiveTab = newTab;
        }
    };

    const handleDeleteAll = () => {
        if (window.confirm(`Are you sure you want to permanently delete all items from ${activeTab === 'testCase' ? 'Test Case' : 'Bug'} Dustbin?`)) {
            console.log(`Deleting all ${activeTab} items`);
        }
    };

    return (
        <div className="relative">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 shadow-sm relative z-50">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Left Section - Tabs */}
                        <div className="flex items-center gap-2">
                            {/* Test Case Dustbin Tab */}
                            <button
                                onClick={() => handleTabClick('testCase')}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'testCase'
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <FileText className="w-5 h-5" />
                                Test Case Dustbin
                            </button>

                            {/* Bug Dustbin Tab */}
                            <button
                                onClick={() => handleTabClick('bug')}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'bug'
                                        ? 'bg-red-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <Bug className="w-5 h-5" />
                                Bug Dustbin
                            </button>
                        </div>

                        {/* Right Section - Delete All Button */}
                        <AnimatePresence>
                            {activeTab && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    onClick={handleDeleteAll}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-lg"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    Delete All
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </nav>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {activeTab === 'testCase' && (
                    <TestCaseDustbin key="testCase" onClose={() => setActiveTab(null)} />
                )}
                {activeTab === 'bug' && (
                    <TrashedBugs key="bug" onClose={() => setActiveTab(null)} />
                )}
            </AnimatePresence>

            {/* Overlay */}
            <AnimatePresence>
                {activeTab && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActiveTab(null)}
                        className="fixed inset-0 bg-black/20 z-30"
                        style={{ top: '4rem' }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default DustbinNavbar;