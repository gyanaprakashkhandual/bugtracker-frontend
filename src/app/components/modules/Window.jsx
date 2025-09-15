"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MoreVertical,
    X,
    FolderOpen,
    Calendar,
    User,
    Code,
    Edit3,
    Trash2,
    Copy,
    Eye,
    Settings,
    Archive,
    Download,
    Share2,
    AlertCircle,
    RefreshCw
} from "lucide-react";
import { getTestTypes } from "@/app/utils/functions/GetTestType";

// Enhanced ThreeDotsDropdown Component with smart positioning
const ThreeDotsDropdown = ({ 
    options = [], 
    className = "", 
    dropdownWidth = "w-52", 
    testType = null
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const [openDirection, setOpenDirection] = useState('bottom');
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);

    const calculatePosition = (buttonElement) => {
        const buttonRect = buttonElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Estimated dropdown height (based on number of options)
        const dropdownHeight = options.length * 44 + 16; // ~44px per option + padding
        const dropdownWidthPx = 208; // ~52 * 4 (w-52 in pixels)
        
        // Determine vertical position
        const spaceBelow = viewportHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;
        
        let top, left;
        let direction = 'bottom';
        
        // Vertical positioning
        if (spaceBelow >= dropdownHeight || spaceBelow > spaceAbove) {
            // Open downward
            top = buttonRect.bottom + 8;
            direction = 'bottom';
        } else {
            // Open upward
            top = buttonRect.top - dropdownHeight - 8;
            direction = 'top';
        }
        
        // Horizontal positioning
        const spaceRight = viewportWidth - buttonRect.right;
        const spaceLeft = buttonRect.left;
        
        if (spaceRight >= dropdownWidthPx) {
            // Open to the right
            left = buttonRect.right - dropdownWidthPx;
        } else if (spaceLeft >= dropdownWidthPx) {
            // Open to the left
            left = buttonRect.left - dropdownWidthPx + buttonRect.width;
        } else {
            // Center as best as possible
            left = Math.max(8, buttonRect.left - (dropdownWidthPx / 2) + (buttonRect.width / 2));
        }
        
        // Ensure dropdown stays within viewport bounds
        top = Math.max(8, Math.min(top, viewportHeight - dropdownHeight - 8));
        left = Math.max(8, Math.min(left, viewportWidth - dropdownWidthPx - 8));
        
        return { top, left, direction };
    };

    const handleToggle = (e) => {
        e.stopPropagation();
        
        if (!isOpen) {
            const position = calculatePosition(e.currentTarget);
            setDropdownPosition({ top: position.top, left: position.left });
            setOpenDirection(position.direction);
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    const handleOptionClick = (option, e) => {
        e.stopPropagation();
        option.onClick(testType);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (buttonRef.current && !buttonRef.current.contains(event.target) &&
                dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleScroll = () => {
            if (isOpen) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('click', handleClickOutside);
            document.addEventListener('scroll', handleScroll, true);
            return () => {
                document.removeEventListener('click', handleClickOutside);
                document.removeEventListener('scroll', handleScroll, true);
            };
        }
    }, [isOpen]);

    return (
        <div className={`relative ${className}`}>
            <motion.button
                ref={buttonRef}
                onClick={handleToggle}
                className="p-1.5 rounded-lg hover:bg-gray-100/80 transition-all duration-200 ease-in-out group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
                <MoreVertical 
                    size={16} 
                    className="text-gray-500 group-hover:text-gray-700 transition-colors duration-200" 
                />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                        />
                        
                        {/* Dropdown */}
                        <motion.div
                            ref={dropdownRef}
                            initial={{ 
                                opacity: 0, 
                                scale: 0.95, 
                                y: openDirection === 'bottom' ? -10 : 10 
                            }}
                            animate={{ 
                                opacity: 1, 
                                scale: 1, 
                                y: 0 
                            }}
                            exit={{ 
                                opacity: 0, 
                                scale: 0.95, 
                                y: openDirection === 'bottom' ? -10 : 10 
                            }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className={`fixed z-50 ${dropdownWidth} bg-white rounded-xl shadow-xl border border-gray-200/60 backdrop-blur-sm py-2 max-h-96 overflow-y-auto`}
                            style={{
                                top: `${dropdownPosition.top}px`,
                                left: `${dropdownPosition.left}px`,
                            }}
                        >
                            {options.map((option, index) => (
                                <motion.button
                                    key={index}
                                    onClick={(e) => handleOptionClick(option, e)}
                                    className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-all duration-150 ease-in-out flex items-center gap-3 ${option.className || 'text-gray-700 hover:text-gray-900'} ${option.divider ? 'border-t border-gray-100 mt-1 pt-3' : ''} ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    whileHover={!option.disabled ? { x: 2 } : {}}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    disabled={option.disabled}
                                >
                                    {option.icon && (
                                        <motion.div
                                            whileHover={!option.disabled ? { scale: 1.1 } : {}}
                                            transition={{ duration: 0.1 }}
                                            className="flex-shrink-0"
                                        >
                                            {option.icon}
                                        </motion.div>
                                    )}
                                    <span className={`flex-1 font-medium text-sm`}>
                                        {option.label}
                                    </span>
                                    {option.shortcut && (
                                        <span className="text-xs text-gray-400 font-mono">
                                            {option.shortcut}
                                        </span>
                                    )}
                                    {option.badge && (
                                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                            {option.badge}
                                        </span>
                                    )}
                                </motion.button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function TestTypeList({ sidebarOpen, onClose }) {
    const [testTypes, setTestTypes] = useState(null);
    const [selectedTest, setSelectedTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredTest, setHoveredTest] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTestTypes = async () => {
        try {
            setError(null);
            const result = await getTestTypes();
            setTestTypes(result);
        } catch (err) {
            console.error('Error fetching test types:', err);
            setError(err.message || 'Failed to load test types');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchTestTypes();
    };

    useEffect(() => {
        if (sidebarOpen) {
            fetchTestTypes();
        }
    }, [sidebarOpen]);

    // Dropdown action handlers with API integration
    const handleRename = async (testType) => {
        try {
            console.log('Rename test type:', testType);
            // TODO: Implement rename API call
            // const result = await renameTestType(testType._id, newName);
            // await fetchTestTypes(); // Refresh the list
        } catch (error) {
            console.error('Error renaming test type:', error);
        }
    };

    const handleDelete = async (testType) => {
        try {
            if (window.confirm(`Are you sure you want to delete "${testType.testTypeName}"?`)) {
                console.log('Delete test type:', testType);
                // TODO: Implement delete API call
                // const result = await deleteTestType(testType._id);
                // await fetchTestTypes(); // Refresh the list
            }
        } catch (error) {
            console.error('Error deleting test type:', error);
        }
    };

    const handleDuplicate = async (testType) => {
        try {
            console.log('Duplicate test type:', testType);
            // TODO: Implement duplicate API call
            // const result = await duplicateTestType(testType._id);
            // await fetchTestTypes(); // Refresh the list
        } catch (error) {
            console.error('Error duplicating test type:', error);
        }
    };

    const handleView = (testType) => {
        console.log('View test type:', testType);
        setSelectedTest(testType);
        // TODO: Navigate to test type detail view
    };

    const handleArchive = async (testType) => {
        try {
            console.log('Archive test type:', testType);
            // TODO: Implement archive API call
            // const result = await archiveTestType(testType._id);
            // await fetchTestTypes(); // Refresh the list
        } catch (error) {
            console.error('Error archiving test type:', error);
        }
    };

    const handleDownload = async (testType) => {
        try {
            console.log('Download test type:', testType);
            // TODO: Implement download API call
            // const result = await downloadTestType(testType._id);
        } catch (error) {
            console.error('Error downloading test type:', error);
        }
    };

    const handleShare = (testType) => {
        console.log('Share test type:', testType);
        // TODO: Implement share functionality
    };

    const handleSettings = (testType) => {
        console.log('Settings for test type:', testType);
        // TODO: Navigate to settings page
    };

    // Generate dropdown options for each test type
    const getDropdownOptions = (testType) => [
        {
            label: "View Details",
            icon: <Eye size={16} className="text-blue-500" />,
            onClick: handleView,
            shortcut: "⌘V"
        },
        {
            label: "Rename",
            icon: <Edit3 size={16} className="text-green-500" />,
            onClick: handleRename,
            shortcut: "F2"
        },
        {
            label: "Duplicate",
            icon: <Copy size={16} className="text-purple-500" />,
            onClick: handleDuplicate,
            shortcut: "⌘D",
            badge: "New"
        },
        {
            label: "Download",
            icon: <Download size={16} className="text-indigo-500" />,
            onClick: handleDownload,
            divider: true
        },
        {
            label: "Share",
            icon: <Share2 size={16} className="text-blue-500" />,
            onClick: handleShare
        },
        {
            label: "Settings",
            icon: <Settings size={16} className="text-gray-500" />,
            onClick: handleSettings,
            divider: true
        },
        {
            label: "Archive",
            icon: <Archive size={16} className="text-orange-500" />,
            onClick: handleArchive
        },
        {
            label: "Delete",
            icon: <Trash2 size={16} className="text-red-500" />,
            onClick: handleDelete,
            className: "text-red-600 hover:text-red-800 hover:bg-red-50",
            shortcut: "Del"
        }
    ];

    return (
        <>
            {/* Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{
                            duration: 0.5,
                            ease: [0.25, 0.46, 0.45, 0.94],
                            type: "spring",
                            damping: 25,
                            stiffness: 120,
                        }}
                        className="fixed left-0 top-0 h-[calc(100vh-4rem)] w-80 mt-16 bg-gradient-to-br from-blue-50 via-sky-50 to-white z-50 flex flex-col backdrop-blur-sm border-r border-gray-200/60"
                    >
                        {/* Header */}
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
                            className="flex items-center justify-between p-4 border-b border-gray-200/50 backdrop-blur-sm"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        Test Types
                                    </h2>
                                    <motion.button
                                        onClick={handleRefresh}
                                        disabled={refreshing}
                                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200 disabled:opacity-50"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <RefreshCw 
                                            size={16} 
                                            className={`text-gray-500 ${refreshing ? 'animate-spin' : ''}`} 
                                        />
                                    </motion.button>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    {testTypes?.data?.length || 0} configurations available
                                </p>
                            </div>
                            <motion.button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 ease-in-out"
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </motion.button>
                        </motion.div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent p-3">
                            {loading ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="flex flex-col justify-center items-center h-40"
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            ease: "linear",
                                        }}
                                        className="rounded-full h-8 w-8 border-b-2 border-blue-500"
                                    ></motion.div>
                                    <p className="text-sm text-gray-500 mt-3">Loading test types...</p>
                                </motion.div>
                            ) : error ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="flex flex-col items-center justify-center h-40 text-red-500"
                                >
                                    <AlertCircle className="w-12 h-12 mb-3" />
                                    <p className="text-sm font-medium">Error loading test types</p>
                                    <p className="text-xs text-gray-500 mt-1 text-center">{error}</p>
                                    <motion.button
                                        onClick={handleRefresh}
                                        className="mt-3 px-4 py-2 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Try Again
                                    </motion.button>
                                </motion.div>
                            ) : testTypes && testTypes.data && testTypes.data.length > 0 ? (
                                <AnimatePresence mode="popLayout">
                                    {testTypes.data.map((testType, index) => (
                                        <motion.div
                                            key={testType._id}
                                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, x: -100, scale: 0.95 }}
                                            transition={{
                                                delay: index * 0.05,
                                                duration: 0.4,
                                                ease: [0.25, 0.46, 0.45, 0.94],
                                                type: "spring",
                                                damping: 20,
                                                stiffness: 100,
                                            }}
                                            whileHover="hover"
                                            whileTap="tap"
                                            onHoverStart={() => setHoveredTest(testType._id)}
                                            onHoverEnd={() => setHoveredTest(null)}
                                            className="mb-2 rounded-xl border border-transparent hover:border-slate-200/60 hover:bg-white/60 transition-all duration-300 ease-in-out cursor-pointer group"
                                        >
                                            <div className="flex items-start justify-between p-4">
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <motion.div
                                                        className="flex-shrink-0 mt-0.5"
                                                        variants={{
                                                            hover: {
                                                                rotate: 15,
                                                                scale: 1.1,
                                                                transition: { duration: 0.2, ease: "easeOut" },
                                                            },
                                                        }}
                                                    >
                                                        <FolderOpen size={20} className="text-blue-500" />
                                                    </motion.div>
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <motion.h3
                                                            className="font-semibold text-slate-800 truncate text-sm"
                                                            variants={{
                                                                hover: {
                                                                    x: 4,
                                                                    transition: { duration: 0.2, ease: "easeOut" },
                                                                },
                                                            }}
                                                        >
                                                            {testType.testTypeName}
                                                        </motion.h3>
                                                        
                                                        {testType.description && (
                                                            <p className="text-xs text-gray-500 mt-1 truncate">
                                                                {testType.description}
                                                            </p>
                                                        )}
                                                        
                                                        <div className="flex items-center justify-between mt-2">
                                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar size={12} />
                                                                    <span>{testType.createdDate}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <User size={12} />
                                                                    <span className="truncate">{testType.author}</span>
                                                                </div>
                                                            </div>
                                                            {testType.testsCount && (
                                                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                                                    {testType.testsCount} tests
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ 
                                                        opacity: hoveredTest === testType._id ? 1 : 0.7, 
                                                        scale: hoveredTest === testType._id ? 1 : 0.8 
                                                    }}
                                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                                    className="ml-2"
                                                >
                                                    <ThreeDotsDropdown
                                                        options={getDropdownOptions(testType)}
                                                        dropdownWidth="w-52"
                                                        testType={testType}
                                                        className="opacity-60 group-hover:opacity-100 transition-opacity duration-200"
                                                    />
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="flex flex-col items-center justify-center h-40 text-gray-500"
                                >
                                    <motion.div
                                        animate={{
                                            y: [0, -5, 0],
                                            opacity: [0.5, 0.8, 0.5],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                    >
                                        <FolderOpen className="w-12 h-12 mb-3" />
                                    </motion.div>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2, duration: 0.4 }}
                                        className="text-sm font-medium"
                                    >
                                        No test types found
                                    </motion.p>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3, duration: 0.4 }}
                                        className="text-xs text-gray-400 mt-1 text-center"
                                    >
                                        Create your first test type to get started
                                    </motion.p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}