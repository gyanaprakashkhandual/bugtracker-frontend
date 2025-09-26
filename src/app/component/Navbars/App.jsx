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
    UserCog
} from 'lucide-react'
import { GoogleArrowDown } from '@/app/components/utils/Icon';
import UserManagementDashboard from '../Modules/User-Management/App';
import ProjectConfiguration from '../Modules/Project-Management/App';
import UserProfileInterface from '../Modules/User/App';

const TestTypeConfiguration = () => (
    <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Test Type Configuration</h2>
        <p className="text-gray-600">Configure your test types here...</p>
    </div>
)

const UserManagement = () => (
    <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">User Management</h2>
        <p className="text-gray-600">Manage users and permissions here...</p>
    </div>
)

const Dashboard = () => (
    <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
                <p className="text-gray-600">View your project analytics</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reports</h3>
                <p className="text-gray-600">Generate and view reports</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Activity</h3>
                <p className="text-gray-600">Recent project activity</p>
            </div>
        </div>
    </div>
)

const NotificationsPanel = () => (
    <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Notifications</h2>
        <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600">New user registered</p>
                <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Project updated successfully</p>
                <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
            </div>
        </div>
    </div>
)

const MessagesPanel = () => (
    <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Messages</h2>
        <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="font-medium text-gray-900">John Doe</p>
                <p className="text-sm text-gray-600 mt-1">Hey, how's the project going?</p>
                <p className="text-xs text-gray-400 mt-2">1 hour ago</p>
            </div>
        </div>
    </div>
)

const UserPanel = () => (
    <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">User Profile</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                    JD
                </div>
                <div>
                    <p className="font-semibold text-gray-900">John Doe</p>
                    <p className="text-sm text-gray-600">john.doe@example.com</p>
                </div>
            </div>
        </div>
    </div>
)

const AppNavbar = () => {
    const [activeComponent, setActiveComponent] = useState('Dashboard')
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false)
    const [projectName] = useState('My Project')
    const [projectDescription] = useState('A comprehensive project management solution')

    useEffect(() => {
        const savedComponent = localStorage.getItem('activeComponent')
        if (savedComponent) {
            setActiveComponent(savedComponent)
        }
    }, [])

    const handleComponentChange = (component) => {
        setActiveComponent(component)
        localStorage.setItem('activeComponent', component)
        setIsProjectDropdownOpen(false)
    }

    const projectDropdownOptions = [
        { name: 'Project Configuration', icon: Settings, component: 'ProjectConfiguration' },
        { name: 'Test Type Configuration', icon: FileText, component: 'TestTypeConfiguration' },
        { name: 'User Management', icon: UserCog, component: 'UserManagement' }
    ]

    const renderComponent = () => {
        switch (activeComponent) {
            case 'Dashboard':
                return <Dashboard />
            case 'ProjectConfiguration':
                return <ProjectConfiguration />
            case 'TestTypeConfiguration':
                return <TestTypeConfiguration />
            case 'UserManagement':
                return <UserManagementDashboard />
            case 'Notifications':
                return <NotificationsPanel />
            case 'Messages':
                return <MessagesPanel />
            case 'UserPanel':
                return <UserProfileInterface />
            default:
                return <Dashboard />
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 h-[69px] bg-gradient-to-b from-slate-50 to-white border-b border-gray-200">
                <div className="h-full px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-full">
                        {/* Left Section */}
                        <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
                            {/* Project Info */}
                            <div className="hidden lg:block min-w-0 max-w-xs xl:max-w-md">
                                <h1 className="text-sm font-semibold text-gray-900 truncate">
                                    {projectName}
                                </h1>
                                <p className="text-xs text-gray-500 truncate">
                                    {projectDescription}
                                </p>
                            </div>

                            {/* Mobile Project Name */}
                            <div className="lg:hidden min-w-0 flex-shrink">
                                <h1 className="text-sm font-semibold text-gray-900 truncate">
                                    {projectName}
                                </h1>
                            </div>

                            {/* Dashboard Button */}
                            <motion.button
                                onClick={() => handleComponentChange('Dashboard')}
                                className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeComponent === 'Dashboard'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'text-gray-700 hover:bg-gray-100 border border-transparent'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                <span className="hidden md:inline">Dashboard</span>
                            </motion.button>

                            {/* Project Dropdown */}
                            <div className="relative">
                                <motion.button
                                    onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                                    className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all border border-gray-200"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Settings className="w-4 h-4" />
                                    <span className="hidden sm:inline">Project</span>
                                    <motion.div
                                        animate={{ rotate: isProjectDropdownOpen ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <GoogleArrowDown className="w-4 h-4" />
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
                                                className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
                                            >
                                                {projectDropdownOptions.map((option) => (
                                                    <button
                                                        key={option.component}
                                                        onClick={() => handleComponentChange(option.component)}
                                                        className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors ${activeComponent === option.component
                                                            ? 'bg-blue-50 text-blue-700'
                                                            : 'text-gray-700 hover:bg-gray-50'
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
                                className="hidden xl:flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all border border-gray-200"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <ExternalLink className="w-4 h-4" />
                                <span>Open Workspace</span>
                            </motion.button>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                            {/* Bell Icon */}
                            <motion.button
                                onClick={() => handleComponentChange('Notifications')}
                                className={`p-2 rounded-lg transition-all relative ${activeComponent === 'Notifications'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                            </motion.button>

                            {/* Message Icon */}
                            <motion.button
                                onClick={() => handleComponentChange('Messages')}
                                className={`p-2 rounded-lg transition-all relative ${activeComponent === 'Messages'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <MessageCircle className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
                            </motion.button>

                            {/* User Icon */}
                            <motion.button
                                onClick={() => handleComponentChange('UserPanel')}
                                className={`p-2 rounded-lg transition-all ${activeComponent === 'UserPanel'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <User className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Content Area */}
            <div className="flex-1 overflow-auto">
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