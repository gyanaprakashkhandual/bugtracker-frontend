import { motion, AnimatePresence } from 'framer-motion';
import {
    FiRefreshCw,
    FiClock,
    FiChevronRight,
    FiChevronLeft,
    FiPrinter,
    FiCopy,
    FiTrendingUp,
} from 'react-icons/fi';

const RightSidebar = ({ rightSidebarOpen, setRightSidebarOpen }) => {
    return (
        <>
            <AnimatePresence>
                {rightSidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 280, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white border-l border-slate-200 flex-shrink-0 overflow-hidden"
                    >
                        <div className="h-full overflow-y-auto p-4">
                            {/* Cursor Position */}
                            <div className="mb-6">
                                <h3 className="text-xs font-semibold text-slate-900 mb-2">Cursor Position</h3>
                                <div className="text-xs text-slate-600 space-y-1">
                                    <p>Line: 1</p>
                                    <p>Column: 1</p>
                                </div>
                            </div>

                            {/* Document Stats */}
                            <div className="mb-6">
                                <h3 className="text-xs font-semibold text-slate-900 mb-2">Document Stats</h3>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-600">Words:</span>
                                        <span className="font-medium text-slate-900">0</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-600">Characters:</span>
                                        <span className="font-medium text-slate-900">0</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-600">Images:</span>
                                        <span className="font-medium text-slate-900">0</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-600">Attachments:</span>
                                        <span className="font-medium text-slate-900">0</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-600">Comments:</span>
                                        <span className="font-medium text-slate-900">0</span>
                                    </div>
                                </div>
                            </div>

                            {/* Active Users */}
                            <div className="mb-6">
                                <h3 className="text-xs font-semibold text-slate-900 mb-2">Active Users</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <div className="relative">
                                            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                                                U
                                            </div>
                                            <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-white rounded-full"></div>
                                        </div>
                                        <span className="ml-2 text-xs text-slate-700">User</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="mb-6">
                                <h3 className="text-xs font-semibold text-slate-900 mb-2">Quick Actions</h3>
                                <div className="space-y-1">
                                    <button className="w-full flex items-center px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                                        <FiPrinter className="h-3.5 w-3.5 mr-2 text-slate-500" />
                                        Print
                                    </button>
                                    <button className="w-full flex items-center px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                                        <FiCopy className="h-3.5 w-3.5 mr-2 text-slate-500" />
                                        Copy All
                                    </button>
                                    <button className="w-full flex items-center px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                                        <FiTrendingUp className="h-3.5 w-3.5 mr-2 text-slate-500" />
                                        Stats
                                    </button>
                                </div>
                            </div>

                            {/* Document Info */}
                            <div className="pt-6 border-t border-slate-200">
                                <h3 className="text-xs font-semibold text-slate-900 mb-2">Document Info</h3>
                                <div className="space-y-2 text-xs text-slate-600">
                                    <div className="flex items-start">
                                        <FiClock className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-slate-400" />
                                        <div>
                                            <p className="text-slate-500">Created:</p>
                                            <p className="font-medium text-slate-900">10/15/2025</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <FiRefreshCw className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-slate-400" />
                                        <div>
                                            <p className="text-slate-500">Updated:</p>
                                            <p className="font-medium text-slate-900">10/15/2025</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Toggle Sidebar Button */}
                            <div className="mt-6 pt-6 border-t border-slate-200">
                                <button
                                    onClick={() => setRightSidebarOpen(false)}
                                    className="w-full flex items-center justify-center px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    <FiChevronRight className="h-3.5 w-3.5 mr-1" />
                                    Hide Sidebar
                                </button>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Toggle Right Sidebar Button (when closed) */}
            {!rightSidebarOpen && (
                <button
                    onClick={() => setRightSidebarOpen(true)}
                    className="absolute top-20 right-0 p-2 bg-white border-l border-t border-b border-slate-200 rounded-l-lg shadow-sm hover:bg-slate-50 transition-colors"
                >
                    <FiChevronLeft className="h-4 w-4 text-slate-600" />
                </button>
            )}
        </>
    );
};

export default RightSidebar;