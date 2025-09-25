'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Calendar,
  FileText,
  BarChart3,
  User,
  Mail,
  ExternalLink,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  AlertTriangle
} from 'lucide-react';

const ProjectManagementDashboard = () => {
  // State management
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [currentUser, setCurrentUser] = useState({ role: 'user', _id: '', name: 'User' });
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // UI State
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  
  // Form states
  const [formData, setFormData] = useState({
    projectName: '',
    projectDesc: '',
    userId: ''
  });
  
  // Filter and pagination
  const [filters, setFilters] = useState({
    search: '',
    userId: '',
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProjects: 0,
    hasNext: false,
    hasPrev: false
  });

// Initialize token from localStorage on component mount
useEffect(() => {
  // Retrieve token from localStorage
  const savedToken = localStorage.getItem("token"); 
  if (savedToken) {
    setToken(savedToken);
  }

  // Retrieve user data from localStorage (if stored)
  const userData = localStorage.getItem("user");
  if (userData) {
    try {
      setCurrentUser(JSON.parse(userData)); // parse back to object
    } catch (err) {
      console.error("Error parsing user data:", err);
    }
  }
}, []);


  // API configuration
  const API_BASE_URL = 'http://localhost:5000/api/v1/project';
  
  const getApiHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  // Real API calls
  const api = {
    getAllProjects: async (params) => {
      if (!token) {
        setError('No authentication token found');
        return;
      }
      
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append('search', params.search);
        if (params.userId) queryParams.append('userId', params.userId);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const response = await fetch(`${API_BASE_URL}?${queryParams}`, {
          method: 'GET',
          headers: getApiHeaders()
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch projects');
        }

        const data = await response.json();
        setProjects(data.projects || []);
        setPagination(data.pagination || {});
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to fetch projects');
        console.error('API Error:', err);
        setProjects([]);
      }
      setLoading(false);
    },

    getMyProjects: async (params) => {
      if (!token) {
        setError('No authentication token found');
        return;
      }
      
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append('search', params.search);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const response = await fetch(`${API_BASE_URL}/my-projects?${queryParams}`, {
          method: 'GET',
          headers: getApiHeaders()
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch your projects');
        }

        const data = await response.json();
        setProjects(data.projects || []);
        setPagination(data.pagination || {});
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to fetch your projects');
        console.error('API Error:', err);
        setProjects([]);
      }
      setLoading(false);
    },

    getStats: async () => {
      if (!token) {
        setError('No authentication token found');
        return;
      }
      
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/stats`, {
          method: 'GET',
          headers: getApiHeaders()
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch statistics');
        }

        const data = await response.json();
        setStats(data.stats);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to fetch statistics');
        console.error('API Error:', err);
        setStats(null);
      }
      setLoading(false);
    },

    createProject: async (projectData) => {
      if (!token) {
        setError('No authentication token found');
        return false;
      }
      
      setLoading(true);
      try {
        const endpoint = currentUser.role === 'admin' && projectData.userId 
          ? `${API_BASE_URL}/admin/create` 
          : API_BASE_URL;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: getApiHeaders(),
          body: JSON.stringify(projectData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create project');
        }

        const data = await response.json();
        setSuccess(data.message || 'Project created successfully');
        setError('');
        return true;
      } catch (err) {
        setError(err.message || 'Failed to create project');
        console.error('API Error:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },

    updateProject: async (projectId, projectData) => {
      if (!token) {
        setError('No authentication token found');
        return false;
      }
      
      setLoading(true);
      try {
        const endpoint = currentUser.role === 'admin' 
          ? `${API_BASE_URL}/admin/${projectId}` 
          : `${API_BASE_URL}/${projectId}`;

        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: getApiHeaders(),
          body: JSON.stringify(projectData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update project');
        }

        const data = await response.json();
        setSuccess(data.message || 'Project updated successfully');
        setError('');
        return true;
      } catch (err) {
        setError(err.message || 'Failed to update project');
        console.error('API Error:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },

    deleteProject: async (projectId) => {
      if (!token) {
        setError('No authentication token found');
        return false;
      }
      
      setLoading(true);
      try {
        const endpoint = currentUser.role === 'admin' 
          ? `${API_BASE_URL}/admin/${projectId}` 
          : `${API_BASE_URL}/${projectId}`;

        const response = await fetch(endpoint, {
          method: 'DELETE',
          headers: getApiHeaders()
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete project');
        }

        const data = await response.json();
        setSuccess(data.message || 'Project deleted successfully');
        setError('');
        return true;
      } catch (err) {
        setError(err.message || 'Failed to delete project');
        console.error('API Error:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },

    getProjectById: async (projectId) => {
      if (!token) {
        setError('No authentication token found');
        return null;
      }
      
      try {
        const response = await fetch(`${API_BASE_URL}/${projectId}`, {
          method: 'GET',
          headers: getApiHeaders()
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch project');
        }

        const data = await response.json();
        return data.project;
      } catch (err) {
        setError(err.message || 'Failed to fetch project');
        console.error('API Error:', err);
        return null;
      }
    },

    getProjectBySlug: async (slug) => {
      if (!token) {
        setError('No authentication token found');
        return null;
      }
      
      try {
        const response = await fetch(`${API_BASE_URL}/slug/${slug}`, {
          method: 'GET',
          headers: getApiHeaders()
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch project');
        }

        const data = await response.json();
        return data.project;
      } catch (err) {
        setError(err.message || 'Failed to fetch project');
        console.error('API Error:', err);
        return null;
      }
    }
  };

  // Event handlers
  const handleSearch = (e) => {
    const search = e.target.value;
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!formData.projectName.trim()) {
      setError('Project name is required');
      return;
    }

    const success = await api.createProject(formData);
    if (success) {
      setShowCreateModal(false);
      setFormData({ projectName: '', projectDesc: '', userId: '' });
      loadData();
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!selectedProject || !formData.projectName.trim()) {
      setError('Project name is required');
      return;
    }

    const success = await api.updateProject(selectedProject._id, formData);
    if (success) {
      setShowEditModal(false);
      setSelectedProject(null);
      setFormData({ projectName: '', projectDesc: '', userId: '' });
      loadData();
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    
    const success = await api.deleteProject(selectedProject._id);
    if (success) {
      setShowDeleteModal(false);
      setSelectedProject(null);
      loadData();
    }
  };

  const openEditModal = (project) => {
    setSelectedProject(project);
    setFormData({
      projectName: project.projectName,
      projectDesc: project.projectDesc || '',
      userId: project.user._id
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (project) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  const loadData = () => {
    if (!token) return;
    
    switch (activeTab) {
      case 'all':
        api.getAllProjects(filters);
        break;
      case 'my-projects':
        api.getMyProjects(filters);
        break;
      case 'stats':
        api.getStats();
        break;
    }
  };

  // Load initial data
  useEffect(() => {
    loadData();
  }, [activeTab, filters, token]);

  // Auto-clear messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    hover: { y: -5, transition: { duration: 0.2 } }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl text-center"
        >
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the project dashboard.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Project Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {currentUser.name}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Project
            </motion.button>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      <AnimatePresence>
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4`}
          >
            <div className={`p-4 rounded-lg ${error ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
              <div className="flex items-center justify-between">
                <span>{error || success}</span>
                <button onClick={() => { setError(''); setSuccess(''); }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="flex border-b border-gray-200">
            {[
              { key: 'all', label: 'All Projects', icon: FileText },
              { key: 'my-projects', label: 'My Projects', icon: User },
              ...(currentUser.role === 'admin' ? [{ key: 'stats', label: 'Statistics', icon: BarChart3 }] : [])
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.key}
                  whileHover={{ y: -1 }}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </motion.button>
              );
            })}
          </div>

          {/* Search and Filters */}
          {activeTab !== 'stats' && (
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={filters.search}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Filter className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center py-20"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Statistics View */}
              {activeTab === 'stats' && stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <motion.div variants={cardVariants} className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Projects</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalProjects}</p>
                      </div>
                      <FileText className="w-12 h-12 text-indigo-600" />
                    </div>
                  </motion.div>
                  
                  <motion.div variants={cardVariants} className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Recent Projects</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.recentProjectsCount}</p>
                      </div>
                      <Calendar className="w-12 h-12 text-green-600" />
                    </div>
                  </motion.div>

                  <motion.div variants={cardVariants} className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Users</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.projectsByUser.length}</p>
                      </div>
                      <Users className="w-12 h-12 text-purple-600" />
                    </div>
                  </motion.div>

                  {/* Top Contributors */}
                  <motion.div variants={cardVariants} className="md:col-span-2 lg:col-span-3 bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Contributors</h3>
                    <div className="space-y-4">
                      {stats.projectsByUser.map((user, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.userName}</p>
                              <p className="text-sm text-gray-600">{user.userEmail}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{user.projectCount}</p>
                            <p className="text-sm text-gray-600">projects</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Empty Stats View */}
              {activeTab === 'stats' && !stats && !loading && (
                <motion.div 
                  variants={cardVariants}
                  className="bg-white p-12 rounded-lg shadow-sm text-center"
                >
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No statistics available</h3>
                  <p className="text-gray-600">Statistics could not be loaded at this time.</p>
                </motion.div>
              )}

              {/* Projects Grid/List View */}
              {(activeTab === 'all' || activeTab === 'my-projects') && (
                <>
                  {projects.length === 0 && !loading ? (
                    <motion.div 
                      variants={cardVariants}
                      className="bg-white p-12 rounded-lg shadow-sm text-center"
                    >
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                      <p className="text-gray-600 mb-6">
                        {activeTab === 'my-projects' ? 'You haven\'t created any projects yet.' : 'No projects available.'}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCreateModal(true)}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 shadow-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        Create Project
                      </motion.button>
                    </motion.div>
                  ) : projects.length > 0 ? (
                    <>
                      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2' : 'grid-cols-1'}`}>
                        {projects.map((project) => (
                          <motion.div
                            key={project._id}
                            variants={cardVariants}
                            whileHover="hover"
                            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                          >
                            <div className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    {project.projectName}
                                  </h3>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {project.projectDesc || 'No description provided'}
                                  </p>
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <User className="w-4 h-4" />
                                    <span>{project.user.name}</span>
                                    <Mail className="w-4 h-4 ml-2" />
                                    <span>{project.user.email}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <ExternalLink className="w-4 h-4" />
                                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                    {project.slug}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => openEditModal(project)}
                                  disabled={currentUser.role !== 'admin' && project.user._id !== currentUser._id}
                                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => openDeleteModal(project)}
                                  disabled={currentUser.role !== 'admin' && project.user._id !== currentUser._id}
                                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => window.open(`/projects/${project.slug}`, '_blank')}
                                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {pagination.totalPages > 1 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-center gap-4 mt-8"
                        >
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                            disabled={!pagination.hasPrev}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                          </motion.button>
                          
                          <span className="text-sm text-gray-600">
                            Page {pagination.currentPage} of {pagination.totalPages} 
                            ({pagination.totalProjects} total projects)
                          </span>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={!pagination.hasNext}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Next
                            <ChevronRight className="w-4 h-4" />
                          </motion.button>
                        </motion.div>
                      )}
                    </>
                  ) : null}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Create New Project</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateProject}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Name *
                      </label>
                      <input
                        type="text"
                        value={formData.projectName}
                        onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="Enter project name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Description
                      </label>
                      <textarea
                        value={formData.projectDesc}
                        onChange={(e) => setFormData(prev => ({ ...prev, projectDesc: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="Enter project description"
                        rows={3}
                      />
                    </div>

                    {currentUser.role === 'admin' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          User ID (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.userId}
                          onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          placeholder="Leave empty to create for yourself"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          As admin, you can create projects for other users by providing their User ID
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Creating...' : 'Create Project'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Project Modal */}
      <AnimatePresence>
        {showEditModal && selectedProject && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Edit Project</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdateProject}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Name *
                      </label>
                      <input
                        type="text"
                        value={formData.projectName}
                        onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="Enter project name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Description
                      </label>
                      <textarea
                        value={formData.projectDesc}
                        onChange={(e) => setFormData(prev => ({ ...prev, projectDesc: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="Enter project description"
                        rows={3}
                      />
                    </div>

                    {currentUser.role === 'admin' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          User ID
                        </label>
                        <input
                          type="text"
                          value={formData.userId}
                          onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          placeholder="User ID"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Change project ownership (admin only)
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Updating...' : 'Update Project'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedProject && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Delete Project</h3>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">Are you sure?</p>
                      <p className="text-sm text-gray-600">This action cannot be undone.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Project to delete:</p>
                    <p className="font-medium text-gray-900">{selectedProject.projectName}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDeleteProject}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Deleting...' : 'Delete Project'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProjectManagementDashboard;