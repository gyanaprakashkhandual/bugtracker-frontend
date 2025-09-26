'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiMoreHorizontal,
  FiUsers,
  FiEye,
  FiX,
  FiCheck,
  FiSettings,
  FiFilter,
  FiRefreshCw,
  FiExternalLink,
  FiBarChart
} from 'react-icons/fi';

const BASE_URL = 'http://localhost:5000/api/v1/project';

// API Service
const apiService = {
  getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  },

  async getAllProjects(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${BASE_URL}?${queryString}`, {
      headers: this.getHeaders()
    });
    return response.json();
  },

  async getMyProjects(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${BASE_URL}/my-projects?${queryString}`, {
      headers: this.getHeaders()
    });
    return response.json();
  },

  async getProjectById(id) {
    const response = await fetch(`${BASE_URL}/${id}`, {
      headers: this.getHeaders()
    });
    return response.json();
  },

  async getProjectBySlug(slug) {
    const response = await fetch(`${BASE_URL}/slug/${slug}`, {
      headers: this.getHeaders()
    });
    return response.json();
  },

  async createProject(data) {
    const response = await fetch(`${BASE_URL}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async updateProject(id, data) {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async deleteProject(id) {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return response.json();
  },

  async getProjectStats() {
    const response = await fetch(`${BASE_URL}/stats`, {
      headers: this.getHeaders()
    });
    return response.json();
  },

  async adminCreateProject(data) {
    const response = await fetch(`${BASE_URL}/admin/create`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async adminUpdateProject(id, data) {
    const response = await fetch(`${BASE_URL}/admin/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async adminDeleteProject(id) {
    const response = await fetch(`${BASE_URL}/admin/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return response.json();
  }
};

// GitHub Style Dropdown Component
const Dropdown = ({ trigger, children, className = '', isOpen, onToggle }) => {
  return (
    <div className="relative inline-block text-left">
      <div onClick={onToggle} className="cursor-pointer">
        {trigger}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${className}`}
          >
            <div className="py-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`inline-block w-full ${maxWidth} transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:align-middle`}
          >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
              {children}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

// Project Card Component
const ProjectCard = ({ project, onEdit, onDelete, onView, currentUser }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isOwner = project.user._id === currentUser?.id;
  const isAdmin = currentUser?.role === 'admin';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {project.projectName}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {project.projectDesc}
          </p>
          <div className="flex items-center text-xs text-gray-500 space-x-4">
            <div className="flex items-center space-x-1">
              <FiUser size={12} />
              <span>{project.user.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiCalendar size={12} />
              <span>{new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <Dropdown
          isOpen={dropdownOpen}
          onToggle={() => setDropdownOpen(!dropdownOpen)}
          trigger={
            <button className="text-gray-400 hover:text-gray-600 p-1">
              <FiMoreHorizontal size={16} />
            </button>
          }
        >
          <button
            onClick={() => {
              onView(project);
              setDropdownOpen(false);
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <FiEye size={14} className="mr-2" />
            View Details
          </button>
          {(isOwner || isAdmin) && (
            <>
              <button
                onClick={() => {
                  onEdit(project);
                  setDropdownOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiEdit2 size={14} className="mr-2" />
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(project);
                  setDropdownOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
              >
                <FiTrash2 size={14} className="mr-2" />
                Delete
              </button>
            </>
          )}
        </Dropdown>
      </div>
      <div className="flex items-center justify-between">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
          {project.slug}
        </span>
        <button
          onClick={() => onView(project)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
        >
          <span>View</span>
          <FiExternalLink size={12} />
        </button>
      </div>
    </motion.div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );
};

// Main Component
export default function ProjectConfiguration() {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView] = useState('all'); // 'all', 'my'
  
  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Form States
  const [formData, setFormData] = useState({
    projectName: '',
    projectDesc: '',
    userId: ''
  });
  
  // Dropdown States
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  // Initialize and fetch data
  useEffect(() => {
    fetchProjects();
    fetchStats();
    // Get current user from token or API
    setCurrentUser({ id: 'current_user_id', role: 'user', name: 'Current User' });
  }, [view, currentPage, searchTerm]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 12,
        ...(searchTerm && { search: searchTerm })
      };

      const response = view === 'my' 
        ? await apiService.getMyProjects(params)
        : await apiService.getAllProjects(params);

      if (response.projects) {
        setProjects(response.projects);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.getProjectStats();
      if (response.stats) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateProject = async () => {
    try {
      const response = currentUser?.role === 'admin' 
        ? await apiService.adminCreateProject(formData)
        : await apiService.createProject(formData);
      
      if (response.project) {
        setCreateModalOpen(false);
        setFormData({ projectName: '', projectDesc: '', userId: '' });
        fetchProjects();
        fetchStats();
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleEditProject = async () => {
    try {
      const response = currentUser?.role === 'admin' 
        ? await apiService.adminUpdateProject(selectedProject._id, formData)
        : await apiService.updateProject(selectedProject._id, formData);
      
      if (response.project) {
        setEditModalOpen(false);
        setSelectedProject(null);
        setFormData({ projectName: '', projectDesc: '', userId: '' });
        fetchProjects();
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDeleteProject = async (project) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const response = currentUser?.role === 'admin' 
          ? await apiService.adminDeleteProject(project._id)
          : await apiService.deleteProject(project._id);
        
        fetchProjects();
        fetchStats();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const openEditModal = (project) => {
    setSelectedProject(project);
    setFormData({
      projectName: project.projectName,
      projectDesc: project.projectDesc,
      userId: project.user._id
    });
    setEditModalOpen(true);
  };

  const openViewModal = (project) => {
    setSelectedProject(project);
    setViewModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Project Configuration
              </h1>
              <p className="text-gray-600">
                Manage and organize your projects efficiently
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <button
                onClick={() => fetchProjects()}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <FiRefreshCw size={16} />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FiPlus size={16} />
                <span>New Project</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <StatsCard
              title="Total Projects"
              value={stats.totalProjects}
              icon={FiBarChart}
              color="blue"
            />
            <StatsCard
              title="Recent Projects"
              value={stats.recentProjectsCount}
              icon={FiCalendar}
              color="green"
            />
            <StatsCard
              title="Active Users"
              value={stats.projectsByUser?.length || 0}
              icon={FiUsers}
              color="purple"
            />
            <StatsCard
              title="This Month"
              value={stats.recentProjectsCount}
              icon={FiSettings}
              color="orange"
            />
          </motion.div>
        )}

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              
              {/* View Toggle */}
              <Dropdown
                isOpen={viewDropdownOpen}
                onToggle={() => setViewDropdownOpen(!viewDropdownOpen)}
                trigger={
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                    <span>{view === 'all' ? 'All Projects' : 'My Projects'}</span>
                    <FiChevronDown size={16} />
                  </button>
                }
              >
                <button
                  onClick={() => {
                    setView('all');
                    setViewDropdownOpen(false);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 ${
                    view === 'all' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                  }`}
                >
                  <FiBarChart size={14} className="mr-2" />
                  All Projects
                </button>
                <button
                  onClick={() => {
                    setView('my');
                    setViewDropdownOpen(false);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 ${
                    view === 'my' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                  }`}
                >
                  <FiUser size={14} className="mr-2" />
                  My Projects
                </button>
              </Dropdown>

              {/* Filter */}
              <Dropdown
                isOpen={filterDropdownOpen}
                onToggle={() => setFilterDropdownOpen(!filterDropdownOpen)}
                trigger={
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    <FiFilter size={16} />
                    <span>Filter</span>
                    <FiChevronDown size={16} />
                  </button>
                }
              >
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <FiCalendar size={14} className="mr-2" />
                  Recent First
                </button>
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <FiUser size={14} className="mr-2" />
                  By Owner
                </button>
              </Dropdown>
            </div>
          </div>
        </motion.div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
            />
          </div>
        ) : projects.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
          >
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                currentUser={currentUser}
                onEdit={openEditModal}
                onDelete={handleDeleteProject}
                onView={openViewModal}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <FiSettings size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No projects found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? `No projects match "${searchTerm}"`
                : "Get started by creating your first project"
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FiPlus size={16} />
                <span>Create Project</span>
              </button>
            )}
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-2"
          >
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 text-sm border rounded-md transition-colors ${
                  page === currentPage
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </motion.div>
        )}

        {/* Create Project Modal */}
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Create New Project"
          maxWidth="max-w-lg"
        >
          <form onSubmit={(e) => { e.preventDefault(); handleCreateProject(); }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.projectDesc}
                  onChange={(e) => setFormData({ ...formData, projectDesc: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your project..."
                />
              </div>
              {currentUser?.role === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to User (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="User ID (leave empty to assign to yourself)"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Project
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Project Modal */}
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Edit Project"
          maxWidth="max-w-lg"
        >
          <form onSubmit={(e) => { e.preventDefault(); handleEditProject(); }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.projectDesc}
                  onChange={(e) => setFormData({ ...formData, projectDesc: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {currentUser?.role === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reassign to User (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="User ID"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Update Project
              </button>
            </div>
          </form>
        </Modal>

        {/* View Project Modal */}
        <Modal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title="Project Details"
          maxWidth="max-w-2xl"
        >
          {selectedProject && (
            <div className="space-y-6">
              {/* Project Header */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedProject.projectName}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <FiUser size={14} />
                        <span>{selectedProject.user.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiCalendar size={14} />
                        <span>Created: {new Date(selectedProject.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {selectedProject.slug}
                  </span>
                </div>
              </div>

              {/* Project Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedProject.projectDesc}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Owner Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{selectedProject.user.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedProject.user.email}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Project Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Project ID:</span>
                        <span className="font-medium font-mono text-xs">{selectedProject._id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Slug:</span>
                        <span className="font-medium">{selectedProject.slug}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium">
                          {new Date(selectedProject.updatedAt || selectedProject.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                {(selectedProject.user._id === currentUser?.id || currentUser?.role === 'admin') && (
                  <>
                    <button
                      onClick={() => {
                        setViewModalOpen(false);
                        openEditModal(selectedProject);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <FiEdit2 size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        setViewModalOpen(false);
                        handleDeleteProject(selectedProject);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <FiTrash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Toast Notifications Container */}
        <div className="fixed bottom-4 right-4 z-50">
          {/* Add toast notifications here if needed */}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 sm:hidden">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setView('all')}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-md ${
              view === 'all' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            <FiBarChart size={20} />
            <span className="text-xs">All</span>
          </button>
          <button
            onClick={() => setView('my')}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-md ${
              view === 'my' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            <FiUser size={20} />
            <span className="text-xs">Mine</span>
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex flex-col items-center space-y-1 px-3 py-2 rounded-md text-blue-600"
          >
            <FiPlus size={20} />
            <span className="text-xs">Add</span>
          </button>
          <button
            onClick={() => fetchProjects()}
            className="flex flex-col items-center space-y-1 px-3 py-2 rounded-md text-gray-600"
          >
            <FiRefreshCw size={20} />
            <span className="text-xs">Refresh</span>
          </button>
        </div>
      </div>

      {/* Add padding to prevent content from being hidden behind mobile nav */}
      <div className="h-16 sm:hidden" />
    </div>
  );
}