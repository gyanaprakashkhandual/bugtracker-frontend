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
  FiMoreHorizontal,
  FiUsers,
  FiEye,
  FiX,
  FiSettings,
  FiFilter,
  FiExternalLink,
  FiBarChart,
  FiLogIn
} from 'react-icons/fi';

const BASE_URL = 'http://localhost:5000/api/v1/project';

// API Service
const apiService = {
  getHeaders(token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  },

  async getAllProjects(token, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${BASE_URL}?${queryString}`, {
      headers: this.getHeaders(token)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async getMyProjects(token, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${BASE_URL}/my-projects?${queryString}`, {
      headers: this.getHeaders(token)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async getProjectById(token, id) {
    const response = await fetch(`${BASE_URL}/${id}`, {
      headers: this.getHeaders(token)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async getProjectBySlug(token, slug) {
    const response = await fetch(`${BASE_URL}/slug/${slug}`, {
      headers: this.getHeaders(token)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async createProject(token, data) {
    const response = await fetch(`${BASE_URL}`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async updateProject(token, id, data) {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async deleteProject(token, id) {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(token)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async getProjectStats(token) {
    const response = await fetch(`${BASE_URL}/stats`, {
      headers: this.getHeaders(token)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async adminCreateProject(token, data) {
    const response = await fetch(`${BASE_URL}/admin/create`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async adminUpdateProject(token, id, data) {
    const response = await fetch(`${BASE_URL}/admin/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async adminDeleteProject(token, id) {
    const response = await fetch(`${BASE_URL}/admin/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(token)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
};

// Dropdown Component
const Dropdown = ({ trigger, children, className = '', isOpen, onToggle, onClose }) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.dropdown-container')) {
        onClose && onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div className="relative inline-block text-left dropdown-container">
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
            className={`absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 border border-gray-200 ${className}`}
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
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`inline-block w-full ${maxWidth} transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl sm:my-8 sm:align-middle border border-gray-200`}
        >
          <div className="bg-white px-6 pt-6 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full">
                <FiX size={20} />
              </button>
            </div>
            {children}
          </div>
        </motion.div>
      </div>
    </div>
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
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
            {project.projectName}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {project.projectDesc}
          </p>
          <div className="flex items-center text-xs text-gray-500 space-x-4">
            <div className="flex items-center space-x-1">
              <FiUser size={12} />
              <span className="truncate">{project.user.name}</span>
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
          onClose={() => setDropdownOpen(false)}
          trigger={
            <button className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full">
              <FiMoreHorizontal size={16} />
            </button>
          }
        >
          <button
            onClick={() => { onView(project); setDropdownOpen(false); }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <FiEye size={14} className="mr-3 text-gray-400" />
            View Details
          </button>
          {(isOwner || isAdmin) && (
            <>
              <button
                onClick={() => { onEdit(project); setDropdownOpen(false); }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FiEdit2 size={14} className="mr-3 text-gray-400" />
                Edit
              </button>
              <hr className="my-1 border-gray-100" />
              <button
                onClick={() => { onDelete(project); setDropdownOpen(false); }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <FiTrash2 size={14} className="mr-3 text-red-500" />
                Delete
              </button>
            </>
          )}
        </Dropdown>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
          {project.slug}
        </span>
        <button
          onClick={() => onView(project)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1 hover:bg-blue-50 px-2 py-1 rounded"
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
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full border ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );
};

// Main Component
export default function ProjectConfiguration() {
  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');

  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView] = useState('all');

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

  // Initialize token and user
  useEffect(() => {
    const savedToken = window.localStorage?.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      fetchUserInfo(savedToken);
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchProjects();
      fetchStats();
    }
  }, [isAuthenticated, token, view, currentPage, searchTerm]);

  const fetchUserInfo = async (authToken) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser({
          id: data.user._id,
          role: data.user.role,
          name: data.user.name
        });
      }
    } catch (err) {
      console.error('Failed to fetch user info:', err);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: currentPage,
        limit: 12,
        ...(searchTerm && { search: searchTerm })
      };

      const response = view === 'my'
        ? await apiService.getMyProjects(token, params)
        : await apiService.getAllProjects(token, params);

      if (response.success && response.projects) {
        setProjects(response.projects);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (err) {
      setError(`Failed to fetch projects: ${err.message}`);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.getProjectStats(token);
      if (response.success && response.stats) {
        setStats(response.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (token.trim()) {
      window.localStorage?.setItem('token', token);
      setIsAuthenticated(true);
      fetchUserInfo(token);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const response = currentUser?.role === 'admin'
        ? await apiService.adminCreateProject(token, formData)
        : await apiService.createProject(token, formData);

      if (response.success) {
        setCreateModalOpen(false);
        setFormData({ projectName: '', projectDesc: '', userId: '' });
        await fetchProjects();
        await fetchStats();
      } else {
        alert('Failed to create project: ' + response.message);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    try {
      const response = currentUser?.role === 'admin'
        ? await apiService.adminUpdateProject(token, selectedProject._id, formData)
        : await apiService.updateProject(token, selectedProject._id, formData);

      if (response.success) {
        setEditModalOpen(false);
        setSelectedProject(null);
        setFormData({ projectName: '', projectDesc: '', userId: '' });
        await fetchProjects();
      } else {
        alert('Failed to update project: ' + response.message);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDeleteProject = async (project) => {
    if (window.confirm(`Delete "${project.projectName}"?`)) {
      try {
        const response = currentUser?.role === 'admin'
          ? await apiService.adminDeleteProject(token, project._id)
          : await apiService.deleteProject(token, project._id);

        if (response.success) {
          await fetchProjects();
          await fetchStats();
        } else {
          alert('Failed to delete project: ' + response.message);
        }
      } catch (err) {
        alert('Error: ' + err.message);
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <FiLogIn size={32} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Enter your authentication token to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Authentication Token
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Paste your token here"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiLogIn size={18} />
              <span>Sign In</span>
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Configuration</h1>
              <p className="text-gray-600">Manage and organize your projects</p>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm mt-4 sm:mt-0"
            >
              <FiPlus size={20} />
              <span>New Project</span>
            </button>
          </div>
        </motion.div>

        {stats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard title="Total Projects" value={stats.totalProjects || 0} icon={FiBarChart} color="blue" />
            <StatsCard title="Recent Projects" value={stats.recentProjectsCount || 0} icon={FiCalendar} color="green" />
            <StatsCard title="Active Users" value={stats.projectsByUser?.length || 0} icon={FiUsers} color="purple" />
            <StatsCard title="This Month" value={stats.recentProjectsCount || 0} icon={FiSettings} color="orange" />
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => { setView(view === 'all' ? 'my' : 'all'); setCurrentPage(1); }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 border border-gray-200"
              >
                <span>{view === 'all' ? 'All Projects' : 'My Projects'}</span>
                <FiChevronDown size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mb-4"
            />
            <p className="text-gray-600">Loading projects...</p>
          </div>
        ) : projects.length > 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
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
          <div className="text-center py-16">
            <FiSettings size={64} className="mx-auto text-gray-300 mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No projects found</h3>
            <p className="text-gray-600 mb-6">Create your first project to get started</p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FiPlus size={18} />
              <span>Create Project</span>
            </button>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        <Modal
          isOpen={createModalOpen}
          onClose={() => { setCreateModalOpen(false); setFormData({ projectName: '', projectDesc: '', userId: '' }); }}
          title="Create New Project"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleCreateProject}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Name *</label>
                <input
                  type="text"
                  required
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={4}
                  value={formData.projectDesc}
                  onChange={(e) => setFormData({ ...formData, projectDesc: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {currentUser?.role === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign to User (Optional)</label>
                  <input
                    type="text"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button type="button" onClick={() => setCreateModalOpen(false)} className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                Cancel
              </button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Create Project
              </button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={editModalOpen}
          onClose={() => { setEditModalOpen(false); setSelectedProject(null); }}
          title="Edit Project"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleEditProject}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Name *</label>
                <input
                  type="text"
                  required
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={4}
                  value={formData.projectDesc}
                  onChange={(e) => setFormData({ ...formData, projectDesc: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {currentUser?.role === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reassign to User (Optional)</label>
                  <input
                    type="text"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button type="button" onClick={() => { setEditModalOpen(false); setSelectedProject(null); }} className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                Cancel
              </button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Update Project
              </button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={viewModalOpen}
          onClose={() => { setViewModalOpen(false); setSelectedProject(null); }}
          title="Project Details"
          maxWidth="max-w-3xl"
        >
          {selectedProject && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{selectedProject.projectName}</h2>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full border border-gray-200">
                        <FiUser size={14} />
                        <span>{selectedProject.user.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full border border-gray-200">
                        <FiCalendar size={14} />
                        <span>Created: {new Date(selectedProject.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-4 py-2 bg-blue-600 text-white text-sm rounded-full font-medium">{selectedProject.slug}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <FiSettings className="mr-2" size={20} />
                    Project Description
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedProject.projectDesc || 'No description provided.'}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <FiUser className="mr-2" size={18} />
                    Owner Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Name:</span>
                      <span className="text-gray-900 font-semibold">{selectedProject.user.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Email:</span>
                      <span className="text-gray-900">{selectedProject.user.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-medium">User ID:</span>
                      <span className="text-gray-900 font-mono text-sm bg-gray-100 px-2 py-1 rounded">{selectedProject.user._id}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <FiBarChart className="mr-2" size={18} />
                    Project Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Project ID:</span>
                      <span className="text-gray-900 font-mono text-sm bg-gray-100 px-2 py-1 rounded">{selectedProject._id}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Slug:</span>
                      <span className="text-blue-600 font-medium">{selectedProject.slug}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Created:</span>
                      <span className="text-gray-900">{new Date(selectedProject.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-medium">Last Updated:</span>
                      <span className="text-gray-900">{new Date(selectedProject.updatedAt || selectedProject.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                <button onClick={() => { setViewModalOpen(false); setSelectedProject(null); }} className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                  Close
                </button>
                {(selectedProject.user._id === currentUser?.id || currentUser?.role === 'admin') && (
                  <>
                    <button
                      onClick={() => { setViewModalOpen(false); openEditModal(selectedProject); }}
                      className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <FiEdit2 size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => { setViewModalOpen(false); handleDeleteProject(selectedProject); }}
                      className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
      </div>
    </div>
  );
}