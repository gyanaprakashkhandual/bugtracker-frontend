'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Coffee,
    Home,
    Settings,
    BookOpen,
    Rocket,
    Shield,
    Briefcase,
    Search,
    Moon,
    Sun,
    ChevronRight
} from 'lucide-react';

// Import your documentation components
import DocumentationHome from './components/Home';
import ConfigurationDocumentation from './components/Configure';
import Extension from './components/Extension';
import GettingStartedDocumentation from './components/Start';
import SecurityDocumentation from './components/Security';
import WorkEthicsDocumentation from './components/Work-Ethics';
import TutorialDocument from './components/Tutorial';
import { FaCoffee } from 'react-icons/fa';

const CaffetestDocs = () => {
    const [activeSection, setActiveSection] = useState('home');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const sidebarItems = [
        { id: 'home', label: 'Home', icon: Home, component: DocumentationHome },
        { id: 'getting-started', label: 'Getting Started', icon: Rocket, component: GettingStartedDocumentation },
        { id: 'configuration', label: 'Configuration', icon: Settings, component: ConfigurationDocumentation },
        { id: 'extensions', label: 'Extensions', icon: BookOpen, component: Extension },
        { id: 'tutorial', label: 'Tutorial', icon: BookOpen, component: TutorialDocument },
        { id: 'ethics', label: 'Work Ethics', icon: Briefcase, component: WorkEthicsDocumentation },
        { id: 'security', label: 'Security', icon: Shield, component: SecurityDocumentation },
    ];

    const activeItem = sidebarItems.find(item => item.id === activeSection);
    const ActiveComponent = activeItem?.component;

    return (
        <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
            <div className="flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
                {/* Sidebar */}
                <motion.div
                    initial={{ x: -300 }}
                    animate={{ x: 0 }}
                    className="sticky top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col"
                >
                    {/* Logo */}
                    <div className="p-[18px] border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                            <FaCoffee className="h-8 w-8 text-blue-600" />
                            <h1 className="text-xl font-bold">CaffeTest</h1>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 overflow-y-auto">
                        <div className="space-y-1">
                            {sidebarItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeSection === item.id;

                                return (
                                    <motion.button
                                        key={item.id}
                                        onClick={() => setActiveSection(item.id)}
                                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${isActive
                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-700'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                            }`}
                                        whileHover={{ x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Icon className={`text-lg ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                                        <span className="font-medium text-sm">{item.label}</span>
                                        {isActive && (
                                            <ChevronRight className="text-blue-600 dark:text-blue-400 ml-auto w-4 h-4" />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </nav>
                </motion.div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between gap-6">
                            {/* Active Section Title */}
                            <div className="flex items-center gap-3">
                                {activeItem && (
                                    <>
                                        <activeItem.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                            {activeItem.label}
                                        </h2>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-6">
                                {/* Navigation Links */}
                                <nav className="flex items-center gap-6">
                                    {['Blog', 'Community', 'Feedback', 'Contact'].map((link) => (
                                        <a
                                            key={link}
                                            href={`#${link.toLowerCase()}`}
                                            className="relative text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group pb-1"
                                        >
                                            {link}
                                            <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300 ease-in-out group-hover:w-full"></span>
                                        </a>
                                    ))}
                                </nav>

                                {/* Search Bar */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search docs..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-48 pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                    />
                                </div>

                                {/* Theme Switcher */}
                                <motion.button
                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isDarkMode ? (
                                        <Sun className="w-5 h-5 text-yellow-500" />
                                    ) : (
                                        <Moon className="w-5 h-5 text-gray-600" />
                                    )}
                                </motion.button>

                                {/* Login Button */}
                                <motion.button
                                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-200"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Login
                                </motion.button>
                            </div>
                        </div>
                    </header>

                    {/* Content Area */}
                    <main className="flex-1 overflow-y-auto max-h-[calc(100vh-72px)]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {ActiveComponent && <ActiveComponent />}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default CaffetestDocs;