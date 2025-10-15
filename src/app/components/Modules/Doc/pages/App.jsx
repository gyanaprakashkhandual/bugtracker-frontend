'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiMenu,
    FiRefreshCw,
    FiBold,
    FiItalic,
    FiUnderline,
    FiMinus,
    FiAlignLeft,
    FiAlignCenter,
    FiAlignRight,
    FiAlignJustify,
    FiImage,
    FiPaperclip,
    FiMessageSquare,
    FiEdit3,
    FiEye,
    FiUsers,
    FiBarChart2,
    FiSettings,
    FiClock,
    FiChevronLeft,
    FiChevronRight,
    FiFile,
    FiArchive,
    FiSave,
    FiDownload,
    FiPrinter,
    FiCopy,
    FiTrendingUp,
    FiUser,
    FiPlus,
    FiSend,
    FiCheck
} from 'react-icons/fi';

// Editor Component
const Editor = () => {
    const [content, setContent] = useState('');

    return (
        <div className="h-full overflow-y-auto bg-white">
            <div className="max-w-4xl mx-auto px-8 py-6">
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Untitled Document"
                        className="w-full text-3xl font-bold text-slate-900 border-none outline-none focus:ring-0 placeholder-slate-400"
                        defaultValue="Untitled Document"
                    />
                </div>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Document ID or description"
                        className="w-full text-xs text-slate-500 border-none outline-none focus:ring-0 placeholder-slate-400"
                        defaultValue="nl0jti0jvi0ewjbgtewg"
                    />
                </div>
                <div className="mb-4">
                    <button className="text-xs text-slate-500 hover:text-blue-600 transition-colors flex items-center">
                        <FiPlus className="h-3 w-3 mr-1" />
                        Add Tag
                    </button>
                </div>
                <div className="min-h-[500px]">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-full min-h-[500px] text-sm text-slate-800 border-none outline-none focus:ring-0 resize-none"
                        placeholder="Start typing..."
                    />
                </div>
            </div>
        </div>
    );
};

// Comments Component
const Comments = () => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    return (
        <div className="h-full overflow-y-auto bg-white p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Comments</h2>
                <button className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all">
                    <FiPlus className="h-3 w-3 mr-1" />
                    New Comment
                </button>
            </div>

            {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <FiMessageSquare className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-900">No comments yet</p>
                    <p className="text-xs text-slate-500 mt-1">Be the first to add a comment</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center mb-2">
                                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                                    U
                                </div>
                                <span className="ml-2 text-xs font-medium text-slate-900">User</span>
                                <span className="ml-auto text-xs text-slate-500">Just now</span>
                            </div>
                            <p className="text-xs text-slate-700">{comment}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 border-t border-slate-200 pt-4">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                />
                <button
                    onClick={() => {
                        if (newComment.trim()) {
                            setComments([...comments, newComment]);
                            setNewComment('');
                        }
                    }}
                    className="mt-2 inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
                >
                    <FiSend className="h-3 w-3 mr-1" />
                    Post Comment
                </button>
            </div>
        </div>
    );
};

// Preview Component
const Preview = () => {
    return (
        <div className="h-full overflow-y-auto bg-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Untitled Document</h1>
                <p className="text-xs text-slate-500 mb-6">nl0jti0jvi0ewjbgtewg</p>
                <div className="prose prose-sm max-w-none">
                    <p className="text-sm text-slate-700">Preview content will appear here...</p>
                </div>
            </div>
        </div>
    );
};

// Suggestions Component
const Suggestions = () => {
    return (
        <div className="h-full overflow-y-auto bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Suggestions</h2>
            <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <FiCheck className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-900">No suggestions</p>
                <p className="text-xs text-slate-500 mt-1">All looks good!</p>
            </div>
        </div>
    );
};

// Version History Component
const VersionHistory = () => {
    const versions = [
        { id: 1, date: '10/15/2025', time: '2:30 PM', user: 'User' },
        { id: 2, date: '10/15/2025', time: '1:15 PM', user: 'User' },
    ];

    return (
        <div className="h-full overflow-y-auto bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Version History</h2>
            <div className="space-y-2">
                {versions.map((version) => (
                    <div key={version.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer transition-colors">
                        <div className="flex items-center mb-1">
                            <FiClock className="h-3 w-3 text-slate-400 mr-1.5" />
                            <span className="text-xs font-medium text-slate-900">{version.date} at {version.time}</span>
                        </div>
                        <div className="flex items-center">
                            <FiUser className="h-3 w-3 text-slate-400 mr-1.5" />
                            <span className="text-xs text-slate-600">{version.user}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Collaborators Component
const Collaborators = () => {
    const collaborators = [
        { id: 1, name: 'User', status: 'online', initial: 'U' }
    ];

    return (
        <div className="h-full overflow-y-auto bg-white p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Collaborators</h2>
                <button className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                    <FiPlus className="h-3 w-3 mr-1" />
                    Add
                </button>
            </div>
            <div className="space-y-2">
                {collaborators.map((collab) => (
                    <div key={collab.id} className="flex items-center p-2 rounded-lg hover:bg-slate-50">
                        <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                                {collab.initial}
                            </div>
                            {collab.status === 'online' && (
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                            )}
                        </div>
                        <div className="ml-3">
                            <p className="text-xs font-medium text-slate-900">{collab.name}</p>
                            <p className="text-xs text-slate-500 capitalize">{collab.status}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Media & Files Component
const MediaFiles = () => {
    return (
        <div className="h-full overflow-y-auto bg-white p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Media & Files</h2>
                <button className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                    <FiPlus className="h-3 w-3 mr-1" />
                    Upload
                </button>
            </div>
            <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <FiFile className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-900">No files yet</p>
                <p className="text-xs text-slate-500 mt-1">Upload files to get started</p>
            </div>
        </div>
    );
};

// Analytics Component
const Analytics = () => {
    return (
        <div className="h-full overflow-y-auto bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Analytics</h2>
            <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-600">Total Views</span>
                        <FiTrendingUp className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">0</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-600">Collaborators</span>
                        <FiUsers className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">1</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-600">Comments</span>
                        <FiMessageSquare className="h-3.5 w-3.5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">0</p>
                </div>
            </div>
        </div>
    );
};

// Settings Component
const SettingsPanel = () => {
    return (
        <div className="h-full overflow-y-auto bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Settings</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Document Name</label>
                    <input
                        type="text"
                        defaultValue="Untitled Document"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Auto-save</label>
                    <div className="flex items-center">
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 border-slate-300 rounded" />
                        <span className="ml-2 text-xs text-slate-600">Enable auto-save</span>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Privacy</label>
                    <select className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Private</option>
                        <option>Team</option>
                        <option>Public</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

// Main Document Editor Component
const DocumentEditor = () => {
    const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
    const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('editor');
    const [toolbarCollapsed, setToolbarCollapsed] = useState(false);

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

    const renderContent = () => {
        switch (activeTab) {
            case 'editor':
                return <Editor />;
            case 'preview':
                return <Preview />;
            case 'comments':
                return <Comments />;
            case 'suggestions':
                return <Suggestions />;
            case 'history':
                return <VersionHistory />;
            case 'collaborators':
                return <Collaborators />;
            case 'media':
                return <MediaFiles />;
            case 'analytics':
                return <Analytics />;
            case 'settings':
                return <SettingsPanel />;
            default:
                return <Editor />;
        }
    };

    return (
        <div className="h-screen flex flex-col bg-slate-50">
            {/* Navbar */}
            <nav className="bg-white border-b border-slate-200 flex-shrink-0">
                <div className="px-3 py-2">
                    <div className="flex items-center space-x-2">
                        {/* Menu Icon */}
                        <button
                            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <FiMenu className="h-4 w-4 text-slate-600" />
                        </button>

                        {/* Document Icon */}
                        <div className="p-1.5">
                            <FiFile className="h-4 w-4 text-blue-600" />
                        </div>

                        {/* Breadcrumb */}
                        <div className="flex items-center space-x-1.5 text-xs text-slate-600">
                            <span className="font-medium">Project Name</span>
                            <span className="text-slate-400">/</span>
                            <span>Test Type Name</span>
                            <span className="text-slate-400">/</span>
                            <span>Untitled Document</span>
                        </div>

                        <div className="h-4 w-px bg-slate-200 mx-2"></div>

                        {/* Toolbar */}
                        {!toolbarCollapsed && (
                            <>
                                {/* Text Formatting */}
                                <div className="flex items-center space-x-1">
                                    <button className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Bold">
                                        <FiBold className="h-3.5 w-3.5 text-slate-600" />
                                    </button>
                                    <button className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Italic">
                                        <FiItalic className="h-3.5 w-3.5 text-slate-600" />
                                    </button>
                                    <button className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Underline">
                                        <FiUnderline className="h-3.5 w-3.5 text-slate-600" />
                                    </button>
                                    <button className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Strikethrough">
                                        <FiMinus className="h-3.5 w-3.5 text-slate-600" />
                                    </button>
                                </div>

                                <div className="h-4 w-px bg-slate-200"></div>

                                {/* Alignment */}
                                <div className="flex items-center space-x-1">
                                    <button className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Align Left">
                                        <FiAlignLeft className="h-3.5 w-3.5 text-slate-600" />
                                    </button>
                                    <button className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Align Center">
                                        <FiAlignCenter className="h-3.5 w-3.5 text-slate-600" />
                                    </button>
                                    <button className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Align Right">
                                        <FiAlignRight className="h-3.5 w-3.5 text-slate-600" />
                                    </button>
                                    <button className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Justify">
                                        <FiAlignJustify className="h-3.5 w-3.5 text-slate-600" />
                                    </button>
                                </div>

                                <div className="h-4 w-px bg-slate-200"></div>

                                {/* Font Size */}
                                <select className="px-2 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option>16px</option>
                                    <option>14px</option>
                                    <option>12px</option>
                                    <option>18px</option>
                                    <option>20px</option>
                                </select>

                                <div className="h-4 w-px bg-slate-200"></div>

                                {/* Color & Media */}
                                <div className="flex items-center space-x-1">
                                    <button className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Text Color">
                                        <div className="h-3.5 w-3.5 border-2 border-slate-400 rounded"></div>
                                    </button>
                                    <button className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Background Color">
                                        <div className="h-3.5 w-3.5 bg-yellow-200 border border-slate-300 rounded"></div>
                                    </button>
                                    <button className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Insert Image">
                                        <FiImage className="h-3.5 w-3.5 text-slate-600" />
                                    </button>
                                    <button className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Attach File">
                                        <FiPaperclip className="h-3.5 w-3.5 text-slate-600" />
                                    </button>
                                    <button className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Add Comment">
                                        <FiMessageSquare className="h-3.5 w-3.5 text-slate-600" />
                                    </button>
                                </div>

                                <div className="h-4 w-px bg-slate-200"></div>

                                {/* Clear Formatting */}
                                <button className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded transition-colors">
                                    Clear
                                </button>
                            </>
                        )}

                        {/* Collapse/Expand Toolbar */}
                        <button
                            onClick={() => setToolbarCollapsed(!toolbarCollapsed)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors ml-auto"
                            title={toolbarCollapsed ? 'Expand toolbar' : 'Collapse toolbar'}
                        >
                            {toolbarCollapsed ? (
                                <FiChevronRight className="h-3.5 w-3.5 text-slate-600" />
                            ) : (
                                <FiChevronLeft className="h-3.5 w-3.5 text-slate-600" />
                            )}
                        </button>

                        {/* Status Indicators */}
                        <div className="flex items-center space-x-2 ml-2">
                            <select className="px-2 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option>Draft</option>
                                <option>In Review</option>
                                <option>Approved</option>
                            </select>

                            <select className="px-2 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option>Medium</option>
                                <option>Low</option>
                                <option>High</option>
                            </select>

                            <div className="flex items-center space-x-1 px-2 py-1 bg-slate-50 rounded-lg border border-slate-200">
                                <FiEye className="h-3 w-3 text-slate-500" />
                                <span className="text-xs text-slate-600">12</span>
                            </div>

                            <div className="flex items-center space-x-1 px-2 py-1 bg-slate-50 rounded-lg border border-slate-200">
                                <FiUsers className="h-3 w-3 text-slate-500" />
                                <span className="text-xs text-slate-600">0</span>
                            </div>

                            <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 rounded-lg border border-green-200">
                                <FiRefreshCw className="h-3 w-3 text-green-600" />
                                <span className="text-xs text-green-700">Auto-save ON</span>
                            </div>

                            <button className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all">
                                <FiSave className="h-3 w-3 inline mr-1" />
                                Save
                            </button>

                            <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                                <svg className="h-4 w-4 text-slate-600" viewBox="0 0 16 16" fill="currentColor">
                                    <circle cx="8" cy="3" r="1.5" />
                                    <circle cx="8" cy="8" r="1.5" />
                                    <circle cx="8" cy="13" r="1.5" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar */}
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

                {/* Main Editor Area */}
                <main className="flex-1 overflow-hidden">
                    {renderContent()}
                </main>

                {/* Right Sidebar */}
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
            </div>

            {/* Status Bar */}
            <div className="bg-white border-t border-slate-200 px-4 py-1.5 flex items-center justify-between text-xs text-slate-600 flex-shrink-0">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <span>Line 1, Col 1</span>
                    </div>
                    <div className="h-3 w-px bg-slate-300"></div>
                    <div className="flex items-center">
                        <span>0 words</span>
                    </div>
                    <div className="h-3 w-px bg-slate-300"></div>
                    <div className="flex items-center">
                        <span>0 characters</span>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                        <FiMessageSquare className="h-3 w-3" />
                        <span>Comment</span>
                    </button>
                    <div className="h-3 w-px bg-slate-300"></div>
                    <button className="flex items-center space-x-1 hover:text-purple-600 transition-colors">
                        <FiPaperclip className="h-3 w-3" />
                        <span>Upload</span>
                    </button>
                    <div className="h-3 w-px bg-slate-300"></div>
                    <button className="flex items-center space-x-1 hover:text-green-600 transition-colors">
                        <FiSave className="h-3 w-3" />
                        <span>Save</span>
                    </button>
                    <div className="h-3 w-px bg-slate-300"></div>
                    <div className="flex items-center space-x-1">
                        <FiRefreshCw className="h-3 w-3 text-green-600" />
                        <span className="text-green-700">Auto-save ON</span>
                    </div>
                    <div className="h-3 w-px bg-slate-300"></div>
                    <div className="flex items-center">
                        <span>16px</span>
                    </div>
                    <div className="h-3 w-px bg-slate-300"></div>
                    <button className="flex items-center hover:text-blue-600 transition-colors">
                        <FiSettings className="h-3 w-3 mr-1" />
                        <span>Settings</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DocumentEditor;