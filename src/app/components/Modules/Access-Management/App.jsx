'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Shield, Lock, ChevronDown, Search, X, Check, Plus, Trash2, Clock, User, FolderOpen, FileCode, AlertCircle } from 'lucide-react'

const API_BASE_URL = 'http://localhost:5000/api/v1'
const ACCESS_API = `${API_BASE_URL}/access`
const PROJECTS_API = `${API_BASE_URL}/project`
const TESTTYPES_API = `${API_BASE_URL}/test-type`
const USERS_API = `${API_BASE_URL}/auth`

const AccessControlSystem = () => {
  const [activeTab, setActiveTab] = useState('projects')
  const [projects, setProjects] = useState([])
  const [testTypes, setTestTypes] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null) // Track selected project for test types
  const [accessList, setAccessList] = useState([])
  const [users, setUsers] = useState([])
  const [showGrantModal, setShowGrantModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Grant access form state
  const [grantForm, setGrantForm] = useState({
    userId: '',
    accessLevel: 'view',
    expiresAt: ''
  })

  // Get auth token
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  // API helper function with auth
  const fetchWithAuth = async (url, options = {}) => {
    const token = getAuthToken()
    if (!token) {
      throw new Error('No authentication token found. Please log in.')
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Fetch initial data
  useEffect(() => {
    fetchProjects()
    fetchUsers()
  }, [])

  // Fetch test types when tab changes to testtypes or when selected project changes
  useEffect(() => {
    if (activeTab === 'testtypes') {
      fetchTestTypes(selectedProject?._id)
    }
  }, [activeTab, selectedProject])

  // Auto-dismiss messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const data = await fetchWithAuth('http://localhost:5000/api/v1/project')
      setProjects(data.projects || data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchTestTypes = async (projectId = null) => {
    try {
      setLoading(true)
      let endpoint = 'http://localhost:5000/api/v1/test-type/accessible-test-types'

      // If projectId is provided, fetch project-specific test types
      if (projectId) {
        endpoint = `http://localhost:5000/api/v1/test-type/projects/${projectId}/test-types`
      }

      const data = await fetchWithAuth(endpoint)
      setTestTypes(data.testTypes || data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching test types:', err)
      setError(err.message)
      setTestTypes([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const data = await fetchWithAuth('http://localhost:5000/api/v1/auth/admin/users')
      setUsers(data.users || data || [])
    } catch (err) {
      console.error('Error fetching users:', err)
      // Don't set error here as it might not be critical
    }
  }

  const fetchAccessList = async (itemId, type) => {
    setLoading(true)
    try {
      const endpoint = type === 'project'
        ? `http://localhost:5000/api/v1/access/project/${itemId}/users`
        : `http://localhost:5000/api/v1/access/testtype/${itemId}/users`

      const data = await fetchWithAuth(endpoint)
      setAccessList(data.accessList || data.users || data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching access list:', err)
      setError(err.message)
      setAccessList([])
    } finally {
      setLoading(false)
    }
  }

  const handleItemSelect = (item) => {
    setSelectedItem(item)
    fetchAccessList(item._id, activeTab === 'projects' ? 'project' : 'testtype')
  }

  const handleProjectSelect = (project) => {
    setSelectedProject(project)
    setSelectedItem(null)
    setAccessList([])
    fetchTestTypes(project._id)
  }

  const handleGrantAccess = async () => {
    if (!grantForm.userId || !selectedItem) {
      setError('Please select a user')
      return
    }

    setLoading(true)
    try {
      const endpoint = activeTab === 'projects'
        ? 'http://localhost:5000/api/v1/access/project/grant'
        : 'http://localhost:5000/api/v1/access/testtype/grant'

      const body = {
        [activeTab === 'projects' ? 'projectId' : 'testTypeId']: selectedItem._id,
        userId: grantForm.userId,
        accessLevel: grantForm.accessLevel,
        expiresAt: grantForm.expiresAt || undefined
      }

      await fetchWithAuth(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
      })

      setShowGrantModal(false)
      setGrantForm({ userId: '', accessLevel: 'view', expiresAt: '' })
      setSuccess('Access granted successfully!')
      fetchAccessList(selectedItem._id, activeTab === 'projects' ? 'project' : 'testtype')
      setError(null)
    } catch (err) {
      console.error('Error granting access:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeAccess = async (userId) => {
    if (!selectedItem) return
    if (!confirm('Are you sure you want to revoke access for this user?')) return

    setLoading(true)
    try {
      const endpoint = activeTab === 'projects'
        ? `http://localhost:5000/api/v1/access/project/revoke/${selectedItem._id}/${userId}`
        : `http://localhost:5000/api/v1/access/testtype/revoke/${selectedItem._id}/${userId}`

      await fetchWithAuth(endpoint, {
        method: 'DELETE'
      })

      setSuccess('Access revoked successfully!')
      fetchAccessList(selectedItem._id, activeTab === 'projects' ? 'project' : 'testtype')
      setError(null)
    } catch (err) {
      console.error('Error revoking access:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Access Control</h1>
                  <p className="text-sm text-gray-500">Manage project and test type permissions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('projects')
                setSelectedItem(null)
                setAccessList([])
                setSelectedProject(null)
              }}
              className={`pb-4 px-1 relative ${activeTab === 'projects'
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <div className="flex items-center space-x-2">
                <FolderOpen className="w-4 h-4" />
                <span>Projects</span>
              </div>
              {activeTab === 'projects' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('testtypes')
                setSelectedItem(null)
                setAccessList([])
              }}
              className={`pb-4 px-1 relative ${activeTab === 'testtypes'
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4" />
                <span>Test Types</span>
              </div>
              {activeTab === 'testtypes' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3 mb-4"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800 flex-1">{error}</p>
              <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3 mb-4"
            >
              <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-green-800 flex-1">{success}</p>
              <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Items List */}
          <div className="lg:col-span-1 space-y-4">
            {/* Project Selector for Test Types */}
            {activeTab === 'testtypes' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Project
                </label>
                <select
                  value={selectedProject?._id || ''}
                  onChange={(e) => {
                    const project = projects.find(p => p._id === e.target.value)
                    handleProjectSelect(project)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Test Types</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.projectName}
                    </option>
                  ))}
                </select>
                {selectedProject && (
                  <p className="text-xs text-gray-500 mt-2">
                    Showing test types for: <span className="font-medium">{selectedProject.projectName}</span>
                  </p>
                )}
              </div>
            )}

            {/* Items List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {activeTab === 'projects' ? 'Projects' : 'Test Types'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {(activeTab === 'projects' ? projects : testTypes).length} items
                </p>
              </div>
              <div className="divide-y divide-gray-100 max-h-[calc(100vh-400px)] overflow-y-auto">
                {loading && !selectedItem ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (activeTab === 'projects' ? projects : testTypes).length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      {activeTab === 'projects' ? (
                        <FolderOpen className="w-6 h-6 text-gray-400" />
                      ) : (
                        <FileCode className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <p className="text-gray-500">
                      {activeTab === 'testtypes' && selectedProject
                        ? `No test types found for ${selectedProject.projectName}`
                        : `No ${activeTab === 'projects' ? 'projects' : 'test types'} found`
                      }
                    </p>
                  </div>
                ) : (
                  (activeTab === 'projects' ? projects : testTypes).map((item) => (
                    <motion.button
                      key={item._id}
                      onClick={() => handleItemSelect(item)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedItem?._id === item._id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                        }`}
                      whileHover={{ x: 4 }}
                    >
                      <h3 className="font-medium text-gray-900 mb-1">
                        {activeTab === 'projects' ? item.projectName : item.testTypeName}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {activeTab === 'projects' ? item.projectDesc : item.testTypeDesc}
                      </p>
                      {activeTab === 'testtypes' && item.testFramework && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                          {item.testFramework}
                        </span>
                      )}
                    </motion.button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Content - Access Management */}
          <div className="lg:col-span-2">
            {selectedItem ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {activeTab === 'projects' ? selectedItem.projectName : selectedItem.testTypeName}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Manage user access and permissions
                      </p>
                    </div>
                    <button
                      onClick={() => setShowGrantModal(true)}
                      disabled={loading}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Grant Access</span>
                    </button>
                  </div>
                </div>

                {/* Access List */}
                <div className="divide-y divide-gray-100 max-h-[calc(100vh-350px)] overflow-y-auto">
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="text-gray-500 mt-3">Loading access list...</p>
                    </div>
                  ) : accessList.length === 0 ? (
                    <div className="p-8 text-center">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-2">No users have access yet</p>
                      <p className="text-sm text-gray-400">Click "Grant Access" to add users</p>
                    </div>
                  ) : (
                    accessList.map((access) => (
                      <AccessListItem
                        key={access._id}
                        access={access}
                        onRevoke={handleRevokeAccess}
                        loading={loading}
                      />
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a {activeTab === 'projects' ? 'project' : 'test type'}
                </h3>
                <p className="text-gray-500">
                  Choose an item from the list to manage access permissions
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grant Access Modal */}
      <AnimatePresence>
        {showGrantModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => !loading && setShowGrantModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Grant Access</h3>
                  <button
                    onClick={() => setShowGrantModal(false)}
                    disabled={loading}
                    className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Add user access to {selectedItem?.projectName || selectedItem?.testTypeName}
                </p>
              </div>

              <div className="p-6 space-y-4">
                {/* User Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={grantForm.userId}
                    onChange={(e) => setGrantForm({ ...grantForm, userId: e.target.value })}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Access Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Level <span className="text-red-500">*</span>
                  </label>
                  <AccessLevelDropdown
                    value={grantForm.accessLevel}
                    onChange={(level) => setGrantForm({ ...grantForm, accessLevel: level })}
                    disabled={loading}
                  />
                </div>

                {/* Expires At */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration Date <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={grantForm.expiresAt}
                    onChange={(e) => setGrantForm({ ...grantForm, expiresAt: e.target.value })}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for permanent access</p>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowGrantModal(false)}
                  disabled={loading}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGrantAccess}
                  disabled={!grantForm.userId || loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>Grant Access</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Access Level Dropdown Component
const AccessLevelDropdown = ({ value, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const levels = [
    { value: 'view', label: 'View', description: 'Can view content only', icon: '👁️' },
    { value: 'edit', label: 'Edit', description: 'Can view and edit content', icon: '✏️' },
    { value: 'admin', label: 'Admin', description: 'Full access and control', icon: '⚡' }
  ]

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedLevel = levels.find(l => l.value === value)

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg flex items-center justify-between hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <div className="flex items-center space-x-2">
          <span>{selectedLevel?.icon}</span>
          <span className="font-medium text-gray-900">{selectedLevel?.label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          >
            {levels.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => {
                  onChange(level.value)
                  setIsOpen(false)
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start space-x-3">
                  <span className="text-lg">{level.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{level.label}</span>
                      {value === level.value && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{level.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Access List Item Component
const AccessListItem = ({ access, onRevoke, loading }) => {
  const [showActions, setShowActions] = useState(false)

  const getLevelColor = (level) => {
    switch (level) {
      case 'admin': return 'bg-purple-100 text-purple-700'
      case 'edit': return 'bg-blue-100 text-blue-700'
      case 'view': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 hover:bg-gray-50 transition-colors"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
            {access.userId?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900 truncate">
                {access.userId?.name || 'Unknown User'}
              </h4>
              <span className={`px-2 py-1 text-xs font-medium rounded flex-shrink-0 ${getLevelColor(access.accessLevel)}`}>
                {access.accessLevel}
              </span>
            </div>
            <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
              <p className="truncate">{access.userId?.email || 'No email'}</p>
              {access.userId?.role && (
                <>
                  <span className="text-gray-300">•</span>
                  <p className="capitalize">{access.userId.role}</p>
                </>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showActions && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => onRevoke(access.userId._id)}
              disabled={loading}
              className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              title="Revoke Access"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3 pl-13 flex items-center space-x-3 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <User className="w-3 h-3" />
          <span>Granted by {access.grantedBy?.name || 'Unknown'}</span>
        </div>
        <span className="text-gray-300">•</span>
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>{formatDate(access.createdAt)}</span>
        </div>
        {access.expiresAt && (
          <>
            <span className="text-gray-300">•</span>
            <div className="flex items-center space-x-1 text-orange-600">
              <Clock className="w-3 h-3" />
              <span>Expires {formatDate(access.expiresAt)}</span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}

export default AccessControlSystem