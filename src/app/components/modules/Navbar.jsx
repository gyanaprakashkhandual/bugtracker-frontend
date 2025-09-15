'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu,
    X,
    Search,
    Filter,
    MessageSquarePlus,
    Settings,
    User,
    BarChart3,
    Table,
    LayoutGrid,
    Bug,
    FileText,
    ChevronDown,
    Trash,
    Trash2,
    Palette
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getProjectDetails } from '@/app/utils/functions/GetProjectDetails';
import TestTypeList from './Window';
import { SettingSidebar } from './Sidebar';
import { GoogleArrowDown } from '../utils/Icon';
import { FaThemeco } from 'react-icons/fa';

// Styled Dropdown Component
const StyledDropdown = ({ options, placeholder, value, onChange, size = "sm", className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);

    useEffect(() => {
        if (value) {
            const option = options.find(opt => opt.value === value);
            setSelectedOption(option);
        }
    }, [value, options]);

    const handleSelect = (option) => {
        setSelectedOption(option);
        onChange(option.value);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`}>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white/70 backdrop-blur-sm border border-blue-200/50 rounded-lg hover:bg-blue-50/50 hover:text-blue-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300/50"
            >
                <div className="flex items-center space-x-2">
                    {selectedOption?.icon}
                    <span>{selectedOption?.label || placeholder}</span>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <GoogleArrowDown className="h-4 w-4" />
                </motion.div>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white/90 backdrop-blur-md border border-blue-200/50 rounded-lg shadow-lg z-50 overflow-hidden"
                    >
                        {options.map((option, index) => (
                            <motion.button
                                key={option.value}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleSelect(option)}
                                className="flex items-center space-x-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50/50 hover:text-blue-600 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg"
                            >
                                {option.icon}
                                <span>{option.label}</span>
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Backdrop to close dropdown when clicking outside */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [searchFocus, setSearchFocus] = useState(false);
    const [selectedView, setSelectedView] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [project, setProject] = useState(null);
    const [testTypeIsOpen, setTestTypeIsOpen] = useState(false);
    const [settingIsOpen, setSettingIsOpen] = useState(false);

    const router = useRouter();

    useEffect(() => {
        (async () => {
            const details = await getProjectDetails();
            setProject(details);
        })();
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);

    // View options
    const viewOptions = [
        { value: 'chart', label: 'Chart View', icon: <BarChart3 className="h-4 w-4" /> },
        { value: 'table', label: 'Table View', icon: <Table className="h-4 w-4" /> },
        { value: 'card', label: 'Card View', icon: <LayoutGrid className="h-4 w-4" /> }
    ];

    // Report options
    const reportOptions = [
        { value: 'bug', label: 'BUG', icon: <Bug className="h-4 w-4" /> },
        { value: 'test-case', label: 'Test Case', icon: <FileText className="h-4 w-4" /> }
    ];

    // Prevent body scroll when settings sidebar is open
    useEffect(() => {
        if (settingIsOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            // Add delay before restoring scroll to prevent flash
            const timer = setTimeout(() => {
                document.body.style.overflow = 'unset';
            }, 300); // Match sidebar animation duration

            return () => clearTimeout(timer);
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [settingIsOpen]);

    return (
        <nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-100 via-sky-50 to-blue-100 backdrop-blur-md border-b border-blue-200/30">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Mobile hamburger */}
                    <div className="md:hidden">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleMenu}
                            className="p-2 rounded-lg hover:bg-blue-100/50 transition-colors duration-200"
                        >
                            <AnimatePresence mode="wait">
                                {isOpen ? (
                                    <motion.div
                                        key="close"
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <X className="h-6 w-6 text-gray-700" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="menu"
                                        initial={{ rotate: 90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: -90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Menu className="h-6 w-6 text-gray-700" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </div>

                    {/* Brand */}
                    <div className="flex-shrink-0 flex items-center gap-3">
                        <motion.p
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setTestTypeIsOpen((prev) => !prev)}
                            className="rounded-md p-1 hover:bg-blue-100/50 transition-colors duration-200 cursor-pointer"
                        >
                            <Menu className="h-6 w-6 text-black" />
                        </motion.p>
                        <TestTypeList
                            sidebarOpen={testTypeIsOpen}
                            onClose={() => setTestTypeIsOpen(false)}
                        />

                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
                        >
                            {project?.projectName || "Loading..."}
                        </motion.h1>
                    </div>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex flex-1 max-w-lg mx-8">
                        <motion.div
                            className={`relative w-full transition-all duration-300 ${searchFocus ? 'transform scale-105' : ''}`}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className={`h-5 w-5 transition-colors duration-200 ${searchFocus ? 'text-blue-500' : 'text-gray-400'}`} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search..."
                                onFocus={() => setSearchFocus(true)}
                                onBlur={() => setSearchFocus(false)}
                                className="block w-[500px] pl-10 pr-3 py-1.5 border border-blue-200/50 rounded-full bg-white/70 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300/50"
                            />
                        </motion.div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-3">

                        {/* View Dropdown */}
                        <StyledDropdown
                            options={viewOptions}
                            placeholder="View Options"
                            value={selectedView}
                            onChange={setSelectedView}
                            size="sm"
                            className="w-40"
                        />

                        {/* Report Dropdown */}
                        <StyledDropdown
                            options={reportOptions}
                            placeholder="Report Options"
                            value={selectedReport}
                            onChange={setSelectedReport}
                            size="sm"
                            className="w-40"
                        />

                        {/* Action Buttons */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-colors duration-200"
                        >
                            <Filter className="h-4 w-4" />
                            <span>Filter</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                        >
                            <MessageSquarePlus className="h-4 w-4" />
                            <span>Add Comment</span>
                        </motion.button>

                        <motion.button
                            onClick={() => setSettingIsOpen((prev) => !prev)}
                            whileHover={{ scale: 1.1, rotate: 180 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-colors duration-200"
                        >
                            <Settings className="h-5 w-5" />
                        </motion.button>

                        {/* Trash for all the application*/}
                        <motion.button
                            onClick={() => router.push(`/app/${project?.url}/trash`)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-colors duration-200"
                        >
                            <Trash2 className="h-5 w-5 text-red-600" />
                        </motion.button>

                        {/* Theme changing option */}
                        <motion.button

                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-colors duration-200"
                        >
                            <Palette className="h-5 w-5 text-blue-900" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-colors duration-200"
                        >
                            <User className="h-5 w-5" />
                        </motion.button>
                    </div>
                </div>

                {/* Settings Sidebar with scroll prevention */}
                <div style={{ overflow: settingIsOpen ? 'hidden' : 'visible' }}>
                    <SettingSidebar
                        isOpen={settingIsOpen}
                        toggleSidebar={() => setSettingIsOpen((prev) => !prev)}
                    />
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="md:hidden overflow-hidden"
                        >
                            <div className="px-2 pt-2 pb-4 space-y-3">

                                {/* Mobile Search */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="block w-full pl-10 pr-3 py-2.5 border border-blue-200/50 rounded-lg bg-white/70 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300/50"
                                    />
                                </div>

                                {/* Mobile Dropdowns */}
                                <StyledDropdown
                                    options={viewOptions}
                                    placeholder="View Options"
                                    value={selectedView}
                                    onChange={setSelectedView}
                                    size="sm"
                                    className="w-full"
                                />

                                <StyledDropdown
                                    options={reportOptions}
                                    placeholder="Report Options"
                                    value={selectedReport}
                                    onChange={setSelectedReport}
                                    size="sm"
                                    className="w-full"
                                />

                                {/* Mobile Buttons */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-colors duration-200"
                                >
                                    <Filter className="h-4 w-4" />
                                    <span>Filter</span>
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm"
                                >
                                    <MessageSquarePlus className="h-4 w-4" />
                                    <span>Add Comment</span>
                                </motion.button>
                                <div className="flex items-center justify-center space-x-4 pt-2">
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 180 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSettingIsOpen((prev) => !prev)}
                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-colors duration-200"
                                    >
                                        <Settings className="h-5 w-5" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-colors duration-200"
                                    >
                                        <User className="h-5 w-5" />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
}