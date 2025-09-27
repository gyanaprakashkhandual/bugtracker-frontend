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
            className={`absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 border border-gray-200 focus:outline-none ${className}`}
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
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className={`inline-block w-full ${maxWidth} transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:align-middle border border-gray-200`}
        >
          <div className="bg-white px-6 pt-6 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
              >
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
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
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
            <button className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
              <FiMoreHorizontal size={16} />
            </button>
          }
        >
          <button
            onClick={() => {
              onView(project);
              setDropdownOpen(false);
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <FiEye size={14} className="mr-3 text-gray-400" />
            View Details
          </button>
          {(isOwner || isAdmin) && (
            <>
              <button
                onClick={() => {
                  onEdit(project);
                  setDropdownOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FiEdit2 size={14} className="mr-3 text-gray-400" />
                Edit
              </button>
              <hr className="my-1 border-gray-100" />
              <button
                onClick={() => {
                  onDelete(project);
                  setDropdownOpen(false);
                }}
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
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
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
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  // Initialize current user
  const [currentUser, setCurrentUser] = useState(null);

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

  // Initialize and fetch data
  useEffect(() => {
    fetchProjects();
    fetchStats();
    fetchCurrentUser();
  }, [view, currentPage, searchTerm]);

  const fetchCurrentUser = () => {
    // In a real app, you would decode the JWT token or make an API call to get user info
    // For now, setting a placeholder - replace with actual user fetching logic
    setCurrentUser({
      id: 'current_user_id',
      role: 'user', // or 'admin'
      name: 'Current User'
    });
  };

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

      if (response.success && response.projects) {
        setProjects(response.projects);
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        console.error('Failed to fetch projects:', response.message);
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.getProjectStats();
      if (response.success && response.stats) {
        setStats(response.stats);
      } else {
        console.error('Failed to fetch stats:', response.message);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();

    try {
      const response = currentUser?.role === 'admin'
        ? await apiService.adminCreateProject(formData)
        : await apiService.createProject(formData);

      if (response.success && response.project) {
        setCreateModalOpen(false);
        setFormData({ projectName: '', projectDesc: '', userId: '' });
        // Refresh the projects list and stats
        await fetchProjects();
        await fetchStats();
      } else {
        console.error('Error creating project:', response.message);
        alert('Failed to create project: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const handleEditProject = async (e) => {
    e.preventDefault();

    try {
      const response = currentUser?.role === 'admin'
        ? await apiService.adminUpdateProject(selectedProject._id, formData)
        : await apiService.updateProject(selectedProject._id, formData);

      if (response.success && response.project) {
        setEditModalOpen(false);
        setSelectedProject(null);
        setFormData({ projectName: '', projectDesc: '', userId: '' });
        // Refresh the projects list
        await fetchProjects();
      } else {
        console.error('Error updating project:', response.message);
        alert('Failed to update project: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project. Please try again.');
    }
  };

  const handleDeleteProject = async (project) => {
    if (window.confirm(`Are you sure you want to delete "${project.projectName}"? This action cannot be undone.`)) {
      try {
        const response = currentUser?.role === 'admin'
          ? await apiService.adminDeleteProject(project._id)
          : await apiService.deleteProject(project._id);

        if (response.success) {
          // Refresh the projects list and stats
          await fetchProjects();
          await fetchStats();
        } else {
          console.error('Error deleting project:', response.message);
          alert('Failed to delete project: ' + (response.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please try again.');
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

  const filteredProjects = projects.filter(project => {
    if (!project) return false;

    const matchesSearch = project.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.projectDesc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    if (view === 'my') {
      return matchesSearch && project.user?._id === currentUser?.id;
    }

    return matchesSearch;
  });

  // Add error boundary for API calls
  const handleApiError = (error, action) => {
    console.error(`Error ${action}:`, error);
    if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
      alert('Your session has expired. Please login again.');
      // In a real app, redirect to login page
      // window.location.href = '/login';
    } else if (error.message?.includes('403') || error.message?.includes('forbidden')) {
      alert('You do not have permission to perform this action.');
    } else if (error.message?.includes('404')) {
      alert('The requested resource was not found.');
    } else if (error.message?.includes('500')) {
      alert('Server error. Please try again later.');
    } else {
      alert(`Failed to ${action}. Please check your connection and try again.`);
    }
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
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => setCreateModalOpen(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
              >
                <FiPlus size={20} />
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
              value={stats.totalProjects || 0}
              icon={FiBarChart}
              color="blue"
            />
            <StatsCard
              title="Recent Projects"
              value={stats.recentProjectsCount || 0}
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
              value={stats.monthlyProjectsCount || stats.recentProjectsCount || 0}
              icon={FiSettings}
              color="orange"
            />
          </motion.div>
        )}

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">

            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">

              {/* View Toggle */}
              <Dropdown
                isOpen={viewDropdownOpen}
                onToggle={() => setViewDropdownOpen(!viewDropdownOpen)}
                onClose={() => setViewDropdownOpen(false)}
                trigger={
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
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
                  className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50 ${view === 'all' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                    }`}
                >
                  <FiBarChart size={14} className="mr-3" />
                  All Projects
                </button>
                <button
                  onClick={() => {
                    setView('my');
                    setViewDropdownOpen(false);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50 ${view === 'my' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                    }`}
                >
                  <FiUser size={14} className="mr-3" />
                  My Projects
                </button>
              </Dropdown>

              {/* Filter */}
              <Dropdown
                isOpen={filterDropdownOpen}
                onToggle={() => setFilterDropdownOpen(!filterDropdownOpen)}
                onClose={() => setFilterDropdownOpen(false)}
                trigger={
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <FiFilter size={16} />
                    <span>Filter</span>
                    <FiChevronDown size={16} />
                  </button>
                }
              >
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <FiCalendar size={14} className="mr-3 text-gray-400" />
                  Recent First
                </button>
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <FiUser size={14} className="mr-3 text-gray-400" />
                  By Owner
                </button>
              </Dropdown>
            </div>
          </div>
        </motion.div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mb-4"
            />
            <p className="text-gray-600">Loading projects...</p>
          </div>
        ) : projects.length === 0 && !searchTerm ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-gray-300 mb-6">
              <FiSettings size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No projects found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get started by creating your first project and begin managing your work efficiently.
            </p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            >
              <FiPlus size={18} />
              <span>Create Your First Project</span>
            </button>
          </motion.div>
        ) : filteredProjects.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
          >
            <AnimatePresence>
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  currentUser={currentUser}
                  onEdit={openEditModal}
                  onDelete={handleDeleteProject}
                  onView={openViewModal}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-gray-300 mb-6">
              <FiSearch size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No projects match your search
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              No projects match "{searchTerm}". Try adjusting your search terms or create a new project.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setSearchTerm('')}
                className="inline-flex items-center space-x-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <span>Clear Search</span>
              </button>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
              >
                <FiPlus size={18} />
                <span>Create New Project</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !searchTerm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-2 mb-8"
          >
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-4 py-2 text-sm border rounded-lg transition-colors ${pageNum === currentPage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </motion.div>
        )}

        {/* Create Project Modal */}
        <Modal
          isOpen={createModalOpen}
          onClose={() => {
            setCreateModalOpen(false);
            setFormData({ projectName: '', projectDesc: '', userId: '' });
          }}
          title="Create New Project"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleCreateProject}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="User ID (leave empty to assign to yourself)"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setCreateModalOpen(false);
                  setFormData({ projectName: '', projectDesc: '', userId: '' });
                }}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Project
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Project Modal */}
        <Modal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedProject(null);
            setFormData({ projectName: '', projectDesc: '', userId: '' });
          }}
          title="Edit Project"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleEditProject}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="User ID"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedProject(null);
                  setFormData({ projectName: '', projectDesc: '', userId: '' });
                }}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Project
              </button>
            </div>
          </form>
        </Modal>

        {/* View Project Modal */}
        <Modal
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedProject(null);
          }}
          title="Project Details"
          maxWidth="max-w-3xl"
        >
          {selectedProject && (
            <div className="space-y-6">
              {/* Project Header */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      {selectedProject.projectName}
                    </h2>
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
                  <span className="px-4 py-2 bg-blue-600 text-white text-sm rounded-full font-medium shadow-sm">
                    {selectedProject.slug}
                  </span>
                </div>
              </div>

              {/* Project Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Description */}
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <FiSettings className="mr-2" size={20} />
                    Project Description
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedProject.projectDesc || 'No description provided.'}
                    </p>
                  </div>
                </div>

                {/* Owner Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <FiUser className="mr-2" size={18} />
                    Owner Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-600 font-medium">Name:</span>
                      <span className="text-gray-900 font-semibold">{selectedProject.user.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-600 font-medium">Email:</span>
                      <span className="text-gray-900">{selectedProject.user.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-medium">User ID:</span>
                      <span className="text-gray-900 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {selectedProject.user._id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Project Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <FiBarChart className="mr-2" size={18} />
                    Project Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-600 font-medium">Project ID:</span>
                      <span className="text-gray-900 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {selectedProject._id}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-600 font-medium">Slug:</span>
                      <span className="text-blue-600 font-medium">{selectedProject.slug}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-600 font-medium">Created:</span>
                      <span className="text-gray-900">
                        {new Date(selectedProject.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-medium">Last Updated:</span>
                      <span className="text-gray-900">
                        {new Date(selectedProject.updatedAt || selectedProject.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setViewModalOpen(false);
                    setSelectedProject(null);
                  }}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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
                      className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FiEdit2 size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        setViewModalOpen(false);
                        handleDeleteProject(selectedProject);
                        setSelectedProject(null);
                      }}
                      className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 sm:hidden shadow-lg">
          <div className="flex items-center justify-around">
            <button
              onClick={() => setView('all')}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${view === 'all' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
                }`}
            >
              <FiBarChart size={20} />
              <span className="text-xs font-medium">All</span>
            </button>
            <button
              onClick={() => setView('my')}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${view === 'my' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
                }`}
            >
              <FiUser size={20} />
              <span className="text-xs font-medium">Mine</span>
            </button>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-blue-600 bg-blue-50 shadow-sm"
            >
              <FiPlus size={22} />
              <span className="text-xs font-medium">Add</span>
            </button>
            <button
              onClick={() => setSearchTerm('')}
              className="flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-gray-600"
            >
              <FiSearch size={20} />
              <span className="text-xs font-medium">Search</span>
            </button>
          </div>
        </div>

        {/* Mobile padding */}
        <div className="h-20 sm:hidden" />
      </div>
    </div>
  );
}