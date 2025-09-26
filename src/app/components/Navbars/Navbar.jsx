'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  FolderOpen, 
  Settings, 
  User, 
  Sun, 
  Moon, 
  Wrench, 
  MessageCircle, 
  Bell,
  Menu,
  X,
  BarChart3,
  Table,
  LayoutGrid,
  UserCog
} from 'lucide-react'

// Custom Tooltip Component
const Tooltip = ({ children, text, position = 'bottom' }) => {
  return (
    <div className="relative group">
      {children}
      <div className={`absolute ${position === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'} left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50`}>
        <div className="bg-gray-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">
          {text}
          <div className={`absolute left-1/2 transform -translate-x-1/2 ${position === 'bottom' ? '-top-1' : '-bottom-1'}`}>
            <div className={`border-4 ${position === 'bottom' ? 'border-transparent border-b-gray-900' : 'border-transparent border-t-gray-900'}`}></div>
          </div>
        </div>
      </div>
    </div>
  )
}


import UserManagement from '../user/UserManagerment'
import ProjectManagementDashboard from '../configure/main'
import { useProject } from '@/app/script/Projectcontext'
import axios from 'axios'
const NavbarApp = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeView, setActiveView] = useState('Chart View')
  const [projectName, setProjectName] = useState('Google')
  const [activeComponent, setActiveComponent] = useState(null);

  const {selectedProject} = useProject();

   useEffect(() => {
    const currentProjectId = localStorage.getItem("currentProjectId");
    const token = localStorage.getItem("token"); // retrieve token

    if (currentProjectId && token) {
      axios
        .get(`http://localhost:5000/api/v1/project/${currentProjectId}`, {
          headers: {
            Authorization: `Bearer ${token}`, // pass token in headers
          },
        })
        .then((res) => {
          setProjectName(res.data.project.projectName || "Unnamed Project");
        })
        .catch((err) => {
          console.error("Error fetching project details:", err);
          setProjectName("Project Name"); // fallback
        });
    }
  }, []); // run only once on mount
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleComponentSelect = (component) => {
    setActiveComponent(component)
    setIsMobileMenuOpen(false)
  }

  const handleBackToViews = () => {
    setActiveComponent(null)
  }

  const viewOptions = [
    { name: 'Chart View', icon: BarChart3 },
    { name: 'Table View', icon: Table },
    { name: 'Card View', icon: LayoutGrid }
  ]

  // Function to truncate project name based on available space
  const getTruncatedProjectName = () => {
    if (typeof window === 'undefined') return projectName
    
    const availableWidth = window.innerWidth
    
    if (availableWidth < 400) { // very small screens
      return projectName.length > 6 ? projectName.substring(0, 3) + '...' : projectName
    } else if (availableWidth < 640) { // mobile
      return projectName.length > 8 ? projectName.substring(0, 5) + '...' : projectName
    } else if (availableWidth < 768) { // tablet
      return projectName.length > 12 ? projectName.substring(0, 9) + '...' : projectName
    } else { // desktop
      return projectName.length > 20 ? projectName.substring(0, 17) + '...' : projectName
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Sticky Navbar */}
      <nav 
        className={`sticky top-0 z-40 h-[69px] bg-gradient-to-r from-blue-100 via-sky-50 to-blue-100 transition-all duration-300 ${
          isDarkMode ? 'from-slate-900 via-gray-900 to-slate-900' : ''
        }`}
      >
        <div className="h-full px-4 sm:px-6 lg:px-8">
          {/* Main Navbar */}
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-4 md:space-x-6 flex-1 min-w-0">
              {/* Project Name */}
              <motion.div
                className={`text-xl md:text-2xl font-bold ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-700'
                } truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px] lg:max-w-[250px] cursor-pointer`}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                title={projectName}
                onClick={handleBackToViews}
              >
                {projectName}
              </motion.div>

              {/* Back to Views Button - Show when component is active */}
              {activeComponent && (
                <motion.button
                  onClick={handleBackToViews}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isDarkMode
                      ? 'bg-blue-600/20 text-blue-300 hover:bg-blue-600/30'
                      : 'bg-blue-500/10 text-blue-700 hover:bg-blue-500/20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>Back to Views</span>
                </motion.button>
              )}

              {/* View Options - Desktop - Show when no component is active */}
              {!activeComponent && (
                <div className="hidden lg:flex items-center space-x-1 flex-1">
                  {viewOptions.map(({ name, icon: Icon }) => (
                    <motion.button
                      key={name}
                      onClick={() => setActiveView(name)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 flex-shrink-0 ${
                        activeView === name
                          ? isDarkMode
                            ? 'bg-blue-600/20 text-blue-300 shadow-sm'
                            : 'bg-blue-500/10 text-blue-700 shadow-sm'
                          : isDarkMode
                          ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                          : 'text-blue-600 hover:bg-white/50 hover:text-blue-700'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{name}</span>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Search Bar - Hidden on mobile, shows when space allows */}
              <div className="hidden md:block flex-1 max-w-md">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-blue-400'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search..."
                    className={`pl-10 pr-4 py-2 w-full rounded-full border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400' 
                        : 'bg-white/70 backdrop-blur-sm border-blue-200 text-gray-900 placeholder-blue-400 focus:ring-blue-500'
                    } focus:outline-none focus:ring-2 shadow-sm`}
                  />
                </div>
              </div>
            </div>

            {/* Right Section - Desktop */}
            <div className="hidden lg:flex items-center space-x-2 flex-shrink-0">
              {/* Notification Icon */}
              <Tooltip text="Notifications" position="bottom">
                <motion.button
                  className={`p-2 rounded-lg transition-all duration-200 relative ${
                    isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white' 
                      : 'text-blue-600 hover:bg-white/50 hover:text-blue-700'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    3
                  </span>
                </motion.button>
              </Tooltip>

              {/* Project Configuration Icon */}
              <Tooltip text="Project Configuration" position="bottom">
                <motion.button
                  onClick={() => handleComponentSelect('ProjectConfiguration')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white' 
                      : 'text-blue-600 hover:bg-white/50 hover:text-blue-700'
                  } ${activeComponent === 'ProjectConfiguration' ? (isDarkMode ? 'bg-blue-600/20 text-blue-300' : 'bg-blue-500/10 text-blue-700') : ''}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Settings className="w-5 h-5" />
                </motion.button>
              </Tooltip>

              {/* User Authentication/Control Icon */}
              <Tooltip text="User Control" position="bottom">
                <motion.button
                  onClick={() => handleComponentSelect('UserManagement')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white' 
                      : 'text-blue-600 hover:bg-white/50 hover:text-blue-700'
                  } ${activeComponent === 'UserManagement' ? (isDarkMode ? 'bg-blue-600/20 text-blue-300' : 'bg-blue-500/10 text-blue-700') : ''}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <UserCog className="w-5 h-5" />
                </motion.button>
              </Tooltip>

              {/* Theme Toggle */}
              <Tooltip text={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} position="bottom">
                <motion.button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white' 
                      : 'text-blue-600 hover:bg-white/50 hover:text-blue-700'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    animate={{ rotate: isDarkMode ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </motion.div>
                </motion.button>
              </Tooltip>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-2 flex-shrink-0">
              {/* Notification Icon for mobile */}
              <motion.button
                className={`p-2 rounded-lg transition-all duration-200 relative ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white' 
                    : 'text-blue-600 hover:bg-white/50 hover:text-blue-700'
                }`}
                whileTap={{ scale: 0.9 }}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  3
                </span>
              </motion.button>

              <motion.button
                onClick={toggleMobileMenu}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white' 
                    : 'text-blue-600 hover:bg-white/50 hover:text-blue-700'
                }`}
                whileTap={{ scale: 0.9 }}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="lg:hidden py-3 border-t border-blue-200/30">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? 'text-gray-400' : 'text-blue-400'
              }`} />
              <input
                type="text"
                placeholder="Search..."
                className={`pl-10 pr-4 py-2 w-full rounded-full border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400' 
                    : 'bg-white/70 backdrop-blur-sm border-blue-200 text-gray-900 placeholder-blue-400 focus:ring-blue-500'
                } focus:outline-none focus:ring-2 shadow-sm`}
              />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          className={`lg:hidden absolute top-full left-0 right-0 shadow-lg ${
            isMobileMenuOpen ? 'block' : 'hidden'
          }`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isMobileMenuOpen ? 1 : 0, 
            height: isMobileMenuOpen ? 'auto' : 0 
          }}
          transition={{ duration: 0.3 }}
        >
          <div className={`px-4 py-3 space-y-3 border-t ${isDarkMode ? 'border-gray-600 bg-gray-900' : 'border-blue-200/30 bg-white'}`}>
            {/* Mobile View Options - Always show but highlight when active */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">View Options</div>
              {viewOptions.map(({ name, icon: Icon }) => (
                <motion.button
                  key={name}
                  onClick={() => {
                    setActiveView(name)
                    setActiveComponent(null)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`flex items-center space-x-3 w-full px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeView === name && !activeComponent
                      ? isDarkMode
                        ? 'bg-blue-600/20 text-blue-300'
                        : 'bg-blue-500/10 text-blue-700'
                      : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700/50'
                      : 'text-blue-600 hover:bg-white/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-5 h-5" />
                  <span>{name}</span>
                </motion.button>
              ))}
            </div>

            {/* Mobile Menu Options */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">Tools</div>
              
              <motion.button
                onClick={() => handleComponentSelect('ProjectConfiguration')}
                className={`flex items-center space-x-3 w-full px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeComponent === 'ProjectConfiguration'
                    ? isDarkMode ? 'bg-blue-600/20 text-blue-300' : 'bg-blue-500/10 text-blue-700'
                    : isDarkMode ? 'text-gray-300 hover:bg-gray-700/50' : 'text-blue-600 hover:bg-white/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Settings className="w-5 h-5" />
                <span>Project Configuration</span>
              </motion.button>

              <motion.button
                onClick={() => handleComponentSelect('UserManagement')}
                className={`flex items-center space-x-3 w-full px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeComponent === 'UserManagement'
                    ? isDarkMode ? 'bg-blue-600/20 text-blue-300' : 'bg-blue-500/10 text-blue-700'
                    : isDarkMode ? 'text-gray-300 hover:bg-gray-700/50' : 'text-blue-600 hover:bg-white/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <UserCog className="w-5 h-5" />
                <span>User Control</span>
              </motion.button>
            </div>

            {/* Theme Toggle Mobile */}
            <motion.button
              onClick={toggleTheme}
              className={`flex items-center space-x-3 w-full px-4 py-2 rounded-lg transition-all duration-200 ${
                isDarkMode ? 'text-gray-300 hover:bg-gray-700/50' : 'text-blue-600 hover:bg-white/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                animate={{ rotate: isDarkMode ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.div>
              <span>Toggle Theme</span>
            </motion.button>
          </div>
        </motion.div>
      </nav>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Conditional Component Rendering */}
        {activeComponent === 'UserManagement' ? (
          <motion.div
            key="user-management"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="min-h-[calc(100vh-69px)]"
          >
            <UserManagement />
          </motion.div>
        ) : activeComponent === 'ProjectConfiguration' ? (
          <motion.div
            key="project-config"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="min-h-[calc(100vh-69px)] bg-gray-50 p-4 md:p-6"
          >
            <div className="max-w-7xl mx-auto">
              <ProjectManagementDashboard/>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="min-h-[calc(100vh-69px)] bg-gray-50 p-4 md:p-6"
          >
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome to {projectName}
                </h1>
                <p className="text-gray-600 mb-8">
                  Current view: {activeView}
                </p>
              </div>
              
              {/* View Options for Mobile/Tablet */}
              <div className="lg:hidden mb-6">
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {viewOptions.map(({ name, icon: Icon }) => (
                    <motion.button
                      key={name}
                      onClick={() => setActiveView(name)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 flex-shrink-0 ${
                        activeView === name
                          ? isDarkMode
                            ? 'bg-blue-600/20 text-blue-300 shadow-sm'
                            : 'bg-blue-500/10 text-blue-700 shadow-sm'
                          : isDarkMode
                          ? 'text-gray-300 hover:bg-gray-700/50'
                          : 'text-blue-600 hover:bg-white/50'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
              
              {/* Main Dashboard Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Card 1</h3>
                  <p className="text-gray-600">Your main content would go here...</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Card 2</h3>
                  <p className="text-gray-600">More content here...</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Card 3</h3>
                  <p className="text-gray-600">Additional content...</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default NavbarApp