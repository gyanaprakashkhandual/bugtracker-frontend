'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter,
  FiChevronLeft, FiChevronRight, FiEye, FiUser,
  FiBarChart2, FiFolder, FiHome, FiUsers, FiSettings
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProjects: 0,
    hasNext: false,
    hasPrev: false
  });

  const [formData, setFormData] = useState({
    projectName: '',
    projectDesc: ''
  });

  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // API call function
  const apiCall = async (endpoint, options = {}) => {
    const token = getToken();
    if (!token) {
      toast.error('Please login first');
      return null;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/v1/project${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      toast.error(error.message);
      return null;
    }
  };

  // Fetch projects based on active tab
  const fetchProjects = async (page = 1, search = '') => {
    setLoading(true);
    const endpoint = activeTab === 'my'
      ? `/my-projects?page=${page}&limit=8&search=${search}`
      : `/?page=${page}&limit=8&search=${search}`;

    const result = await apiCall(endpoint);

    if (result) {
      if (activeTab === 'my') {
        setMyProjects(result.projects);
      } else {
        setProjects(result.projects);
      }
      setPagination(result.pagination);
    }
    setLoading(false);
  };

  // Fetch statistics
  const fetchStats = async () => {
    const result = await apiCall('/stats');
    if (result) {
      setStats(result.stats);
    }
  };

  // Create project
  const createProject = async (e) => {
    e.preventDefault();
    const result = await apiCall('/', {
      method: 'POST',
      body: JSON.stringify(formData)
    });

    if (result) {
      toast.success('Project created successfully!');
      setShowCreateModal(false);
      setFormData({ projectName: '', projectDesc: '' });
      fetchProjects();
      fetchStats();
    }
  };

  // Delete project
  const deleteProject = async () => {
    if (!selectedProject) return;

    const result = await apiCall(`/${selectedProject._id}`, {
      method: 'DELETE'
    });

    if (result) {
      toast.success('Project deleted successfully!');
      setShowDeleteModal(false);
      setSelectedProject(null);
      fetchProjects();
      fetchStats();
    }
  };

  // Update project
  const updateProject = async (projectId, data) => {
    const result = await apiCall(`/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });

    if (result) {
      toast.success('Project updated successfully!');
      fetchProjects();
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, [activeTab]);

  // Handle search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProjects(1, searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, activeTab]);

  const currentProjects = activeTab === 'my' ? myProjects : projects;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <FiFolder className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="h-5 w-5" />
              <span>New Project</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totalProjects || 0}
                </p>
              </div>
              <FiFolder className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Projects</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.recentProjectsCount || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
              </div>
              <FiBarChart2 className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Contributors</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.projectsByUser?.length || 0}
                </p>
              </div>
              <FiUsers className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border">
          {/* Tabs and Search */}
          <div className="border-b border-gray-200">
            <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex space-x-4">
                {['all', 'my', 'stats'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    {tab === 'all' && 'All Projects'}
                    {tab === 'my' && 'My Projects'}
                    {tab === 'stats' && 'Statistics'}
                  </button>
                ))}
              </div>

              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 w-64"
                />
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {activeTab === 'stats' ? (
              <StatsView stats={stats} />
            ) : (
              <ProjectsView
                projects={currentProjects}
                loading={loading}
                pagination={pagination}
                onPageChange={fetchProjects}
                onEdit={(project) => {
                  setSelectedProject(project);
                  setFormData({
                    projectName: project.projectName,
                    projectDesc: project.projectDesc
                  });
                  setShowCreateModal(true);
                }}
                onDelete={(project) => {
                  setSelectedProject(project);
                  setShowDeleteModal(true);
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Project Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <Modal
            title={selectedProject ? 'Edit Project' : 'Create New Project'}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedProject(null);
              setFormData({ projectName: '', projectDesc: '' });
            }}
          >
            <form onSubmit={createProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.projectDesc}
                  onChange={(e) => setFormData({ ...formData, projectDesc: e.target.value })}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900"
                  placeholder="Enter project description"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedProject(null);
                    setFormData({ projectName: '', projectDesc: '' });
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {selectedProject ? 'Update' : 'Create'} Project
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <Modal
            title="Delete Project"
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedProject(null);
            }}
          >
            <div className="text-center">
              <FiTrash2 className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Delete Project
              </h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete "{selectedProject?.projectName}"? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedProject(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteProject}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Project
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// Projects View Component
const ProjectsView = ({ projects, loading, pagination, onPageChange, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-48 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <FiFolder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
        <p className="text-gray-500">Get started by creating your first project.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {projects.map((project, index) => (
          <ProjectCard
            key={project._id}
            project={project}
            index={index}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <FiChevronLeft className="h-5 w-5" />
            <span>Previous</span>
          </button>

          <span className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNext}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <span>Next</span>
            <FiChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  );
};

// Project Card Component
const ProjectCard = ({ project, index, onEdit, onDelete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
            {project.projectName}
          </h3>
          <p className="text-sm text-gray-500 mb-2">
            by {project.user?.name || 'Unknown User'}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(project)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <FiEdit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(project)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {project.projectDesc || 'No description provided'}
      </p>

      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>Slug: {project.slug}</span>
        <span>
          {new Date(project.createdAt).toLocaleDateString()}
        </span>
      </div>
    </motion.div>
  );
};

// Statistics View Component
const StatsView = ({ stats }) => {
  if (!stats) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Contributors */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Contributors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.projectsByUser?.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiUser className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.userName}</p>
                  <p className="text-sm text-gray-500">{user.userEmail}</p>
                </div>
              </div>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {user.projectCount} projects
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Projects</h3>
        <div className="bg-gray-50 rounded-lg p-6">
          {stats.recentProjects?.map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
            >
              <div>
                <p className="font-medium text-gray-900">{project.projectName}</p>
                <p className="text-sm text-gray-500">by {project.user?.name}</p>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Modal Component
const Modal = ({ title, children, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiEye className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
};

export default ProjectManagement;