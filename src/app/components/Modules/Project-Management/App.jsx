'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiFolder
} from 'react-icons/fi';
import { useAlert } from '@/app/script/Alert.context';
import { useConfirm } from '@/app/script/Confirm.context';

export const PROJECT_EVENTS = {
  CREATED: 'project:created',
  UPDATED: 'project:updated',
  DELETED: 'project:deleted',
  CHANGED: 'project:changed',
};

const emitProjectEvent = (eventType, projectData = null) => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent(eventType, {
      detail: { project: projectData, timestamp: Date.now() }
    });
    window.dispatchEvent(event);

    const changeEvent = new CustomEvent(PROJECT_EVENTS.CHANGED, {
      detail: { type: eventType, project: projectData, timestamp: Date.now() }
    });
    window.dispatchEvent(changeEvent);
  }
};

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
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

  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  const apiCall = async (endpoint, options = {}) => {
    const token = getToken();
    if (!token) {
      showAlert({
        type: 'error',
        message: 'Please login first'
      });
      return null;
    }

    try {
      const response = await fetch(`https://caffetest.onrender.com/api/v1/project${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      showAlert({
        type: 'error',
        message: error.message
      });
      return null;
    }
  };

  const fetchProjects = async (page = 1, search = '') => {
    setLoading(true);
    const endpoint = `/my-projects?page=${page}&limit=8&search=${search}`;
    const result = await apiCall(endpoint);

    if (result) {
      setProjects(result.projects);
      setPagination(result.pagination);
    }
    setLoading(false);
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let result;
      if (selectedProject) {
        result = await apiCall(`/${selectedProject._id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });

        if (result) {
          showAlert({
            type: 'success',
            message: `"${formData.projectName}" updated successfully`
          });
          emitProjectEvent(PROJECT_EVENTS.UPDATED, result.project);
        }
      } else {
        result = await apiCall('/', {
          method: 'POST',
          body: JSON.stringify(formData)
        });

        if (result) {
          showAlert({
            type: 'success',
            message: `"${formData.projectName}" created successfully`
          });
          emitProjectEvent(PROJECT_EVENTS.CREATED, result.project);
        }
      }

      if (result) {
        setShowCreateModal(false);
        setSelectedProject(null);
        setFormData({ projectName: '', projectDesc: '' });
        fetchProjects();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (project) => {
    const result = await showConfirm({
      title: `Delete "${project.projectName}"?`,
      message: "This action cannot be undone. All project data will be permanently lost.",
      confirmText: "Delete Project",
      cancelText: "Keep Project",
      type: "danger",
    });

    if (result) {
      const apiResult = await apiCall(`/${project._id}`, {
        method: 'DELETE'
      });

      if (apiResult) {
        showAlert({
          type: "success",
          message: `"${project.projectName}" deleted successfully`,
        });
        emitProjectEvent(PROJECT_EVENTS.DELETED, project);
        fetchProjects();
      }
    }
  };

  const handleEditProject = (project) => {
    if (!project.accessInfo?.canEdit) {
      showAlert({
        type: 'error',
        message: 'You do not have permission to edit this project'
      });
      return;
    }

    setSelectedProject(project);
    setFormData({
      projectName: project.projectName,
      projectDesc: project.projectDesc
    });
    setShowCreateModal(true);
  };

  const handleDeleteClick = (project) => {
    if (!project.accessInfo?.canDelete) {
      showAlert({
        type: 'error',
        message: 'You do not have permission to delete this project'
      });
      return;
    }

    handleDeleteProject(project);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProjects(1, searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-69px)] max-h-[calc(100vh-69px)] overflow-y-auto">
      <div className="max-w-full mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-sm">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  My Projects
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage your projects and collaborations
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 dark:focus:ring-blue-500 w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 dark:bg-blue-700 text-white dark:text-gray-100 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                  <FiPlus className="h-5 w-5" />
                  <span>New Project</span>
                </motion.button>
              </div>
            </div>
          </div>

          <div className="p-4">
            <ProjectsView
              projects={projects}
              loading={loading}
              pagination={pagination}
              onPageChange={fetchProjects}
              onEdit={handleEditProject}
              onDelete={handleDeleteClick}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <Modal
            tooltip-data={selectedProject ? 'Edit Project' : 'Create New Project'}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedProject(null);
              setFormData({ projectName: '', projectDesc: '' });
            }}
          >
            <form onSubmit={handleSubmitProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 dark:focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter project name"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.projectDesc}
                  onChange={(e) => setFormData({ ...formData, projectDesc: e.target.value })}
                  rows="4"
                  className="w-full resize-none px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 dark:focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter project description"
                  disabled={saving}
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
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white dark:text-gray-100 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 min-w-[120px] justify-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{selectedProject ? 'Updating...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <span>{selectedProject ? 'Update' : 'Create'} Project</span>
                  )}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProjectsView = ({ projects, loading, pagination, onPageChange, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-xl h-48 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <FiFolder className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No projects found</h3>
        <p className="text-gray-500 dark:text-gray-400">Get started by creating your first project.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
          >
            <FiChevronLeft className="h-5 w-5" />
            <span>Previous</span>
          </button>

          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNext}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
          >
            <span>Next</span>
            <FiChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  );
};

const ProjectCard = ({ project, index, onEdit, onDelete }) => {
  const displayName = project.projectName.length > 30
    ? project.projectName.substring(0, 30) + '...'
    : project.projectName;

  const displayDesc = project.projectDesc.length > 80
    ? project.projectDesc.substring(0, 80) + '...'
    : project.projectDesc;

  const canEdit = project.accessInfo?.canEdit ?? false;
  const canDelete = project.accessInfo?.canDelete ?? false;
  const isOwner = project.accessInfo?.isOwner ?? false;
  const accessLevel = project.accessInfo?.accessLevel;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-1 truncate"
            tooltip-data={project.projectName}
          >
            {displayName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            by {project.user?.name || 'Unknown User'}
          </p>
          {!isOwner && accessLevel && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {accessLevel}
            </span>
          )}
        </div>
        <div className="flex space-x-2 ml-2">
          <button
            onClick={() => onEdit(project)}
            disabled={!canEdit}
            tooltip-data={canEdit ? "Edit" : "No edit permission"}
            className={`p-2 transition-colors ${canEdit
                ? 'text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400'
                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              }`}
          >
            <FiEdit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(project)}
            disabled={!canDelete}
            tooltip-data={canDelete ? "Delete" : "No delete permission"}
            className={`p-2 transition-colors ${canDelete
                ? 'text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400'
                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              }`}
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p
        tooltip-data={project.projectDesc}
        className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2"
      >
        {displayDesc || 'No description provided'}
      </p>

      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <span>
          {new Date(project.createdAt).toLocaleDateString()}
        </span>
        {isOwner && (
          <span className="font-medium text-blue-600 dark:text-blue-400">
            Owner
          </span>
        )}
      </div>
    </motion.div>
  );
};

const Modal = ({ title, children, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
};

export default ProjectManagement;