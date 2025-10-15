import { motion, AnimatePresence } from 'framer-motion';
import {
    FiEdit3,
    FiEye,
    FiUsers,
    FiBarChart2,
    FiSettings,
    FiClock,
    FiFile,
    FiArchive,
    FiCopy,
    FiMessageSquare,
    FiCheck
} from 'react-icons/fi';

const LeftSidebar = ({ leftSidebarOpen, activeTab, setActiveTab }) => {
    const leftMenuItems = [
        { id: 'editor', label: 'Editor', icon: FiEdit3 },
        { id: 'preview', label: 'Preview', icon: FiEye },
        { id: 'comments', label: 'Comments', icon: FiMessageSquare },
        { id: 'suggestions', label: 'Suggestions', icon: FiCheck },
        { id: 'history', label: 'Version History', icon: FiClock },
        { id: 'collaborators', label: 'Collaborators', icon: FiUsers },
        { id: 'media', label: 'Media & Files', icon: FiFile },
        { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
        { id: 'settings', label: 'Settings', icon: FiSettings },
    ];

    const quickActions = [
        { label: 'Duplicate', icon: FiCopy },
        { label: 'Archive', icon: FiArchive },
    ];

    return (
        <AnimatePresence>
            {leftSidebarOpen && (
                <motion.aside
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white border-r border-slate-200 flex-shrink-0 overflow-hidden"
                >
                    <div className="h-full overflow-y-auto">
                        {/* Search */}
                        <div className="p-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search documents..."
                                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <svg className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="px-2 pb-4">
                            {leftMenuItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-colors ${activeTab === item.id
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        <Icon className="h-3.5 w-3.5 mr-2.5" />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Quick Actions */}
                        <div className="px-2 pb-4 border-t border-slate-200 pt-4">
                            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Quick Actions
                            </p>
                            {quickActions.map((action, idx) => {
                                const Icon = action.icon;
                                return (
                                    <button
                                        key={idx}
                                        className="w-full flex items-center px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                    >
                                        <Icon className="h-3.5 w-3.5 mr-2.5" />
                                        {action.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Status */}
                        <div className="px-5 py-3 border-t border-slate-200">
                            <div className="flex items-center text-xs text-slate-500">
                                <FiCheck className="h-3 w-3 mr-1.5 text-green-600" />
                                <span>Ready</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">ID: a9da75e0</p>
                        </div>
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
};

export default LeftSidebar;