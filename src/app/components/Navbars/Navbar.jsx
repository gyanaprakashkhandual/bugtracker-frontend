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
  MoreVertical
} from 'lucide-react'
import { getStoredProjectName } from '@/app/script/Projectutils'
import UserManagement from '../user/UserManagerment'

const NavbarApp = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeView, setActiveView] = useState('Chart View')
  const [projectName, setProjectName] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeComponent, setActiveComponent] = useState(null)

  // Get project name from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedProjectName = localStorage.getItem('currentProjectName') || 'Google'
      setProjectName(storedProjectName)
    }
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown)
  }

  const handleDropdownOption = (option) => {
    setShowDropdown(false)
    setIsMobileMenuOpen(false)
    
    switch(option) {
      case 'User Control':
        setActiveComponent('UserManagement')
        break
      case 'Project Configuration':
        setActiveComponent('ProjectConfiguration')
        break
      case 'Settings':
        setActiveComponent('Settings')
        break
      default:
        setActiveComponent(null)
    }
  }

  const viewOptions = [
    { name: 'Chart View', icon: BarChart3 },
    { name: 'Table View', icon: Table },
    { name: 'Card View', icon: LayoutGrid }
  ]

  const dropdownOptions = [
    'Project Configuration',
    'User Control', 
    'Settings'
  ]

  // Function to truncate project name based on available space
  const getTruncatedProjectName = () => {
    if (typeof window === 'undefined') return projectName
    
    const width = window.innerWidth
    if (width < 640) { // mobile
      return projectName.length > 8 ? projectName.substring(0, 5) + '...' : projectName
    } else if (width < 768) { // tablet
      return projectName.length > 12 ? projectName.substring(0, 9) + '...' : projectName
    } else { // desktop
      return projectName.length > 15 ? projectName.substring(0, 12) + '...' : projectName
    }
  }

  return (
    <>
      <nav className={`w-full h-[69px] bg-gradient-to-r from-blue-100 via-sky-50 to-blue-100 transition-all duration-300 ${
        isDarkMode ? 'from-slate-900 via-gray-900 to-slate-900' : ''
      }`}>
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Navbar */}
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-6">
              {/* Project Name */}
              <motion.div
                className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-700'} truncate max-w-[120px] sm:max-w-[150px] md:max-w-[200px]`}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                title={projectName} // Show full name on hover
              >
                {getTruncatedProjectName()}
              </motion.div>

              {/* Search Bar - Hidden on mobile */}
              <div className="hidden md:block relative">
                <div className="relative">
                  <Search className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-blue-400'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search..."
                    className={`pl-10 pr-4 py-2 w-64 lg:w-80 rounded-full border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400' 
                        : 'bg-white/70 backdrop-blur-sm border-blue-200 text-gray-900 placeholder-blue-400 focus:ring-blue-500'
                    } focus:outline-none focus:ring-2 shadow-sm`}
                  />
                </div>
              </div>

              {/* View Options - Desktop */}
              <div className="hidden lg:flex items-center space-x-1">
                {viewOptions.map(({ name, icon: Icon }) => (
                  <motion.button
                    key={name}
                    onClick={() => setActiveView(name)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
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
            </div>

            {/* Center Section - Open Workspace Button */}
            <div className="hidden md:block">
              <motion.button
                className={`flex items-center space-x-2 px-4 py-2 rounded-sm font-medium transition-all duration-200  ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/20'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:shadow-blue-500/30'
                }`}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Open Workspace</span>
              </motion.button>
            </div>

            {/* Right Section - Desktop */}
            <div className="hidden lg:flex items-center space-x-1">
              {/* Notification Icon */}
              <motion.button
                className={`p-2 rounded-lg transition-all duration-200 relative ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white' 
                    : 'text-blue-600 hover:bg-white/50 hover:text-blue-700'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  3
                </span>
              </motion.button>

              {/* Three dots dropdown */}
              <div className="relative">
                <motion.button
                  onClick={toggleDropdown}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white' 
                      : 'text-blue-600 hover:bg-white/50 hover:text-blue-700'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="More options"
                >
                  <MoreVertical className="w-5 h-5" />
                </motion.button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-50 ${
                      isDarkMode 
                        ? 'bg-gray-800 border border-gray-700' 
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    {dropdownOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleDropdownOption(option)}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                          isDarkMode
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-2">
              {/* Notification Icon for mobile */}
              <motion.button
                className={`p-2 rounded-lg transition-all duration-200 relative ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white' 
                    : 'text-blue-600 hover:bg-white/50 hover:text-blue-700'
                }`}
                whileTap={{ scale: 0.9 }}
                title="Notifications"
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
          <div className="md:hidden py-3 border-t border-blue-200/30">
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
          className={`lg:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isMobileMenuOpen ? 1 : 0, 
            height: isMobileMenuOpen ? 'auto' : 0 
          }}
          transition={{ duration: 0.3 }}
        >
          <div className={`px-4 py-3 space-y-3 border-t ${isDarkMode ? 'border-gray-600' : 'border-blue-200/30'}`}>
            {/* Mobile Open Workspace Button */}
            <motion.button
              className={`flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FolderOpen className="w-5 h-5" />
              <span>Open Workspace</span>
            </motion.button>

            {/* Mobile View Options */}
            <div className="space-y-2">
              {viewOptions.map(({ name, icon: Icon }) => (
                <motion.button
                  key={name}
                  onClick={() => {
                    setActiveView(name)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`flex items-center space-x-3 w-full px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeView === name
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

            {/* Dropdown Options in Mobile Menu */}
            <div className="space-y-2">
              {dropdownOptions.map((option) => (
                <motion.button
                  key={option}
                  onClick={() => handleDropdownOption(option)}
                  className={`flex items-center space-x-3 w-full px-4 py-2 rounded-lg transition-all duration-200 ${
                    isDarkMode ? 'text-gray-300 hover:bg-gray-700/50' : 'text-blue-600 hover:bg-white/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{option}</span>
                </motion.button>
              ))}
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

      {/* Render Active Component */}
      {activeComponent === 'UserManagement' && <UserManagement />}
    </>
  )
}

export default NavbarApp;