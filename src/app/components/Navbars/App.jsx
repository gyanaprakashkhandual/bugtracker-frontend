'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Settings,
    User,
    Bell,
    MessageCircle,
    LayoutDashboard,
    ExternalLink,
    FileText,
    UserCog,
    Lock,
    Sun,
    Moon,
    Table,
    Kanban,
    AlertCircle
} from 'lucide-react';
import { useTheme } from '@/app/script/Theme.context';
import { useProject } from '@/app/script/Project.context';
import { GoogleArrowDown } from '@/app/components/utils/Icon';
import UserManagementDashboard from '../Modules/User-Management/App';
import ProjectConfiguration from '../Modules/Project-Management/App';
import UserProfileInterface from '../Modules/User/App';
import TestTypeManagement from '../Modules/Test-Type-Management/App';
import { useRouter } from 'next/navigation';
import Messaging from '../Modules/Messaging/App';
import AccessControlSystem from '../Modules/Access-Management/App';
import Dashboard from '../Modules/Dashboard/App';
import NotificationPanel from '../Modules/Notification/App';
import IssueKanban from '../Modules/Issue/Kanban';
import IssueList from '../Modules/Issue/List';


const AppNavbar = () => {
    const [activeComponent, setActiveComponent] = useState('Dashboard');
    const [user, setUser] = useState(null);
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
    const [isIssueDropdownOpen, setIsIssueDropdownOpen] = useState(false);
    const [selectedDropdownOption, setSelectedDropdownOption] = useState('Set Configuration');
    const [selectedIssueOption, setSelectedIssueOption] = useState('Issue Management');
    const [projectName] = useState('My Project');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isComponentLoading, setIsComponentLoading] = useState(false);

    const { selectedProject } = useProject();
    const router = useRouter();

    const { theme, toggleTheme } = useTheme();

    const getToken = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    };

    // Fetch user data from API
    const fetchUserData = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = getToken();

            if (!token) {
                setError('No authentication token found. Please login again.');
                return;
            }

            const response = await fetch('http://localhost:5000/api/v1/auth/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    setError('Session expired. Please login again.');
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.user) {
                setUser(data.user);
            } else {
                setError('Invalid response format from server');
            }

        } catch (err) {
            console.error('Error fetching user data:', err);
            setError(err.message || 'Failed to fetch user data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(() => {
        const savedComponent = localStorage.getItem('activeComponent')
        if (savedComponent) {
            setActiveComponent(savedComponent)
        }
    }, [])

    const handleComponentChange = (component, optionName = null, dropdownType = null) => {
        setIsComponentLoading(true);
        setActiveComponent(component)
        localStorage.setItem('activeComponent', component)
        if (optionName && dropdownType === 'project') {
            setSelectedDropdownOption(optionName)
        }
        if (optionName && dropdownType === 'issue') {
            setSelectedIssueOption(optionName)
        }
        setIsProjectDropdownOpen(false)
        setIsIssueDropdownOpen(false)
        setTimeout(() => {
            setIsComponentLoading(false);
        }, 300);
    }

    const projectDropdownOptions = [
        { name: 'Project Configuration', icon: Settings, component: 'ProjectConfiguration' },
        { name: 'Test Type Configuration', icon: FileText, component: 'TestTypeConfiguration' },
        { name: 'User Management', icon: UserCog, component: 'UserManagement' }
    ]

    const issueOptions = [
        { name: 'Issue List', icon: Table, component: 'IssueList' },
        { name: 'Issue Kanban', icon: Kanban, component: 'IssueKanban' }
    ]

    // Function to truncate project display text
    const getTruncatedProjectDisplay = () => {
        if (!selectedProject) return 'Create a Project';
        
        const fullText = `${selectedProject.projectName}`;
        
        if (fullText.length > 20) {
            return fullText.substring(0, 20) + '...';
        }
        
        return fullText;
    };

    const renderComponent = () => {
        if (isComponentLoading) {
            return (
                <div className="min-h-[calc(100vh-69px)] bg-white dark:bg-gray-900 p-6">
                    <div className="max-w-7xl mx-auto space-y-4 animate-pulse">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                            {[1, 2, 3, 4, 5, 6].map((item) => (
                                <div key={item} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        switch (activeComponent) {
            case 'Dashboard':
                return <Dashboard />
            case 'ProjectConfiguration':
                return <ProjectConfiguration />
            case 'TestTypeConfiguration':
                return <TestTypeManagement />
            case 'UserManagement':
                return <UserManagementDashboard />
            case 'Notification':
                return <NotificationPanel />
            case 'Messages':
                return <Messaging />
            case 'UserPanel':
                return <UserProfileInterface />
            case 'Access Control':
                return <AccessControlSystem />
            case 'IssueList':
                return <IssueList />
            case 'IssueKanban':
                return <IssueKanban />
            default:
                return <Dashboard />
        }
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 h-[69px] bg-gradient-to-b from-slate-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
                <div className="h-full px-3 sm:px-4 lg:px-6 xl:px-8">
                    <div className="flex items-center justify-between h-full">
                        {/* Left Section */}
                        <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3 lg:space-x-4 flex-1 min-w-0">
                            {/* Project Info */}
                            <div className="hidden lg:block min-w-0">
                                {loading ? (
                                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
                                ) : (
                                    <h1 
                                        className="text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100" 
                                        tooltip-data={selectedProject ? `${selectedProject.projectName} - ${selectedProject?.projectDesc}` : 'Create a Project'}
                                    >
                                        {getTruncatedProjectDisplay()}
                                    </h1>
                                )}
                            </div>

                            {/* Mobile Project Name */}
                            <div className="lg:hidden min-w-0 flex-shrink">
                                <h1 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                    {projectName}
                                </h1>
                            </div>

                            {/* Dashboard Button */}
                            <motion.button
                                onClick={() => handleComponentChange('Dashboard')}
                                className={`user-select-none cursor-pointer hidden sm:flex items-center space-x-1.5 md:space-x-2 px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${activeComponent === 'Dashboard'
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <LayoutDashboard className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                <span className="hidden md:inline">Dashboard</span>
                            </motion.button>

                            {/* Project Dropdown */}
                            <div className="relative">
                                <motion.button
                                    onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                                    className="user-select-none cursor-pointer flex items-center space-x-1.5 md:space-x-2 px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-700"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Settings className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    <span className="hidden sm:inline truncate max-w-[100px] md:max-w-[150px]">{selectedDropdownOption}</span>
                                    <motion.div
                                        animate={{ rotate: isProjectDropdownOpen ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <GoogleArrowDown className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    </motion.div>
                                </motion.button>

                                <AnimatePresence>
                                    {isProjectDropdownOpen && (
                                        <>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="fixed inset-0 z-10"
                                                onClick={() => setIsProjectDropdownOpen(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute top-full left-0 mt-2 w-48 sm:w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20"
                                            >
                                                {projectDropdownOptions.map((option) => (
                                                    <button
                                                        key={option.component}
                                                        onClick={() => handleComponentChange(option.component, option.name, 'project')}
                                                        className={`w-full flex items-center space-x-3 px-4 py-2.5 text-xs sm:text-sm transition-colors ${activeComponent === option.component
                                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                            }`}
                                                    >
                                                        <option.icon className="w-4 h-4" />
                                                        <span>{option.name}</span>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Issue Dropdown */}
                            <div className="relative">
                                <motion.button
                                    onClick={() => setIsIssueDropdownOpen(!isIssueDropdownOpen)}
                                    className="user-select-none cursor-pointer flex items-center space-x-1.5 md:space-x-2 px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-700"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <AlertCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    <span className="hidden sm:inline truncate max-w-[100px] md:max-w-[150px]">{selectedIssueOption}</span>
                                    <motion.div
                                        animate={{ rotate: isIssueDropdownOpen ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <GoogleArrowDown className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    </motion.div>
                                </motion.button>

                                <AnimatePresence>
                                    {isIssueDropdownOpen && (
                                        <>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="fixed inset-0 z-10"
                                                onClick={() => setIsIssueDropdownOpen(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute top-full left-0 mt-2 w-48 sm:w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20"
                                            >
                                                {issueOptions.map((option) => (
                                                    <button
                                                        key={option.component}
                                                        onClick={() => handleComponentChange(option.component, option.name, 'issue')}
                                                        className={`w-full flex items-center space-x-3 px-4 py-2.5 text-xs sm:text-sm transition-colors ${activeComponent === option.component
                                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                            }`}
                                                    >
                                                        <option.icon className="w-4 h-4" />
                                                        <span>{option.name}</span>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Open Workspace Button */}
                            <motion.button
                                className="user-select-none cursor-pointer hidden xl:flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-700"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.push(`/app/projects/${selectedProject?.slug}`)}
                            >
                                <ExternalLink className="w-4 h-4" />
                                <span>Workspace</span>
                            </motion.button>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2 flex-shrink-0">
                            {/* Theme Toggle Button */}
                            <motion.button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg transition-all bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {/* Animated Icon Switch */}
                                <AnimatePresence mode="wait">
                                    {theme === 'dark' ? (
                                        <motion.div
                                        tooltip-data="Switch To White"
                                            key="moon"
                                            initial={{ rotate: -90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: 90, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                        tooltip-data="Switch To White"
                                            key="sun"
                                            initial={{ rotate: 90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: -90, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>

                            {/* Bell Icon */}
                            <motion.button
                                tooltip-data="Notification"
                                tooltip-placement="bottom"
                                onClick={() => handleComponentChange('Notification')}
                                className={`p-2 rounded-lg transition-all relative ${activeComponent === 'Notification'
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.button>

                            {/* Message Icon */}
                            <motion.button
                                tooltip-data="Chats"
                                tooltip-placement="bottom"
                                onClick={() => handleComponentChange('Messages')}
                                className={`p-2 rounded-lg transition-all relative ${activeComponent === 'Messages'
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.button>

                            {/* Access Control Button */}
                            <motion.button
                                tooltip-data="Access Control"
                                tooltip-placement="bottom"
                                onClick={() => handleComponentChange('Access Control')}
                                className={`p-2 rounded-lg transition-all relative ${activeComponent === 'Access Control'
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.button>

                            {/* User Icon */}
                            <motion.button
                                onClick={() => handleComponentChange('UserPanel')}
                                className={`cursor-pointer user-select-none p-2 bg-gray-100 dark:bg-gray-800 rounded-lg transition-all flex items-center space-x-1.5 sm:space-x-2 ${activeComponent === 'UserPanel'
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                                {user?.role && (
                                    <span className="text-xs font-medium hidden sm:inline bg-orange-500 dark:bg-orange-600 text-white dark:text-gray-100 px-2 py-1 rounded">
                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()}
                                    </span>
                                )}
                            </motion.button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Content Area */}
            <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeComponent}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="min-h-[calc(100vh-69px)]"
                    >
                        {renderComponent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}

export default AppNavbar;