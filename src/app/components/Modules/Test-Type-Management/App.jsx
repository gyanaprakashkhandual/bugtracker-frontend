'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiEdit, FiTrash2, FiSearch,
  FiChevronLeft, FiChevronRight, FiEye,
  FiFolder, FiChevronDown, FiCheck
} from 'react-icons/fi';
import { useAlert } from '@/app/script/Alert.context';
import { useConfirm } from '@/app/script/Confirm.context';
import { useProject } from '@/app/script/Project.context';

const TestTypeManagement = () => {
  const { selectedProject } = useProject();
  const [testTypes, setTestTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTestType, setSelectedTestType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTestTypes: 0,
    hasNext: false,
    hasPrev: false
  });

  const [formData, setFormData] = useState({
    testTypeName: '',
    testTypeDesc: ''
  });

  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();

  const getToken = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      return token;
    }
    return null;
  };

  const apiCall = async (endpoint, options = {}) => {
    const token = getToken();

    if (!token) {
      showAlert({
        type: 'error',
        message: 'Please login first. Token not found.'
      });
      return null;
    }

    try {
      const response = await fetch(`https://caffetest.onrender.com/api/v1/test-type${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API call failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      showAlert({
        type: 'error',
        message: error.message
      });
      return null;
    }
  };

  const fetchTestTypes = async (page = 1, search = '') => {
    if (!selectedProject || !selectedProject._id) {
      showAlert({
        type: 'error',
        message: 'Please select a project first'
      });
      return;
    }

    setLoading(true);
    const endpoint = `/projects/${selectedProject._id}/test-types?page=${page}&limit=8&search=${search}`;
    const result = await apiCall(endpoint);

    if (result) {
      setTestTypes(result.testTypes || []);
      setPagination(result.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalTestTypes: 0,
        hasNext: false,
        hasPrev: false
      });
    }
    setLoading(false);
  };

  const handleCreateTestType = async (e) => {
    e.preventDefault();

    if (!selectedProject || !selectedProject._id) {
      showAlert({
        type: 'error',
        message: 'Please select a project first'
      });
      return;
    }

    setSaving(true);

    try {
      const result = await apiCall(`/projects/${selectedProject._id}/test-types`, {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (result) {
        showAlert({
          type: 'success',
          message: `"${formData.testTypeName}" created successfully`
        });
        setShowCreateModal(false);
        setFormData({ testTypeName: '', testTypeDesc: '' });
        fetchTestTypes();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTestType = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const result = await apiCall(`/test-types/${selectedTestType._id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });

      if (result) {
        showAlert({
          type: 'success',
          message: `"${formData.testTypeName}" updated successfully`
        });
        setShowCreateModal(false);
        setSelectedTestType(null);
        setFormData({ testTypeName: '', testTypeDesc: '' });
        fetchTestTypes();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitTestType = async (e) => {
    if (selectedTestType) {
      await handleUpdateTestType(e);
    } else {
      await handleCreateTestType(e);
    }
  };

  const handleDeleteTestType = async (testType) => {
    const result = await showConfirm({
      title: `Delete "${testType.testTypeName}"?`,
      message: "This action cannot be undone. All test type data will be permanently lost.",
      confirmText: "Delete Test Type",
      cancelText: "Keep Test Type",
      type: "danger",
    });

    if (result) {
      const apiResult = await apiCall(`/test-types/${testType._id}`, {
        method: 'DELETE'
      });

      if (apiResult) {
        showAlert({
          type: "success",
          message: `"${testType.testTypeName}" deleted successfully`,
        });
        fetchTestTypes();
      }
    }
  };

  const handleMoveToTrash = async (testType) => {
    const result = await showConfirm({
      title: `Move "${testType.testTypeName}" to trash?`,
      message: "You can restore it from trash later.",
      confirmText: "Move to Trash",
      cancelText: "Keep",
      type: "warning",
    });

    if (result) {
      const apiResult = await apiCall(`/test-types/${testType._id}/trash`, {
        method: 'PATCH'
      });

      if (apiResult) {
        showAlert({
          type: "success",
          message: `"${testType.testTypeName}" moved to trash`,
        });
        fetchTestTypes();
      }
    }
  };
  useEffect(() => {
    if (selectedProject && selectedProject._id) {
      fetchTestTypes();
    }
  }, [selectedProject?._id]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTestTypes(1, searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Function to truncate project display text
    const getTruncatedProjectDisplay = () => {
        if (!selectedProject) return 'Create a Project';
        
        const fullText = `${selectedProject.projectName}`;
        
        if (fullText.length > 30) {
            return fullText.substring(0, 30) + '...';
        }
        
        return fullText;
    };

  if (!selectedProject || !selectedProject._id) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiFolder className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Project Selected</h3>
          <p className="text-gray-500 dark:text-gray-400">Please select a project to manage test types</p>
        </div>
      </div>
    );
  }


  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="max-w-full mx-auto min-h-[calc(100vh-69px)] max-h-[calc(100vh-69px)]">
        <div className="bg-white dark:bg-gray-800 rounded-sm">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {getTruncatedProjectDisplay()} - Test Types
                </h2>
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2.5 py-0.5 rounded-full text-sm font-medium">
                  {pagination.totalTestTypes} test types
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search test types..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-64"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                  <FiPlus className="h-5 w-5" />
                  <span>New Test Type</span>
                </motion.button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <TestTypesView
              testTypes={testTypes}
              loading={loading}
              pagination={pagination}
              onPageChange={fetchTestTypes}
              onEdit={(testType) => {
                setSelectedTestType(testType);
                setFormData({
                  testTypeName: testType.testTypeName,
                  testTypeDesc: testType.testTypeDesc
                });
                setShowCreateModal(true);
              }}
              onDelete={handleDeleteTestType}
              onMoveToTrash={handleMoveToTrash}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <Modal
            title={selectedTestType ? 'Edit Test Type' : 'Create New Test Type'}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedTestType(null);
              setFormData({ testTypeName: '', testTypeDesc: '' });
            }}
          >
            <form onSubmit={handleSubmitTestType} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Type Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.testTypeName}
                  onChange={(e) => setFormData({ ...formData, testTypeName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter test type name"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.testTypeDesc}
                  onChange={(e) => setFormData({ ...formData, testTypeDesc: e.target.value })}
                  rows="4"
                  className="w-full resize-none px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter test type description"
                  disabled={saving}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedTestType(null);
                    setFormData({ testTypeName: '', testTypeDesc: '' });
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 min-w-[120px] justify-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{selectedTestType ? 'Updating...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <span>{selectedTestType ? 'Update' : 'Create'} Test Type</span>
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

const TestTypesView = ({ testTypes, loading, pagination, onPageChange, onEdit, onDelete, onMoveToTrash }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-xl h-48 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (testTypes.length === 0) {
    return (
      <div className="text-center py-12">
        <FiFolder className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No test types found</h3>
        <p className="text-gray-500 dark:text-gray-400">Get started by creating your first test type.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {testTypes.map((testType, index) => (
          <TestTypeCard
            key={testType._id}
            testType={testType}
            index={index}
            onEdit={onEdit}
            onDelete={onDelete}
            onMoveToTrash={onMoveToTrash}
          />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
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
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <span>Next</span>
            <FiChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  );
};

const TestTypeCard = ({ testType, index, onEdit, onDelete, onMoveToTrash }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-1 truncate">
            {testType.testTypeName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 truncate">
            by {testType.user?.name || 'Unknown User'}
          </p>
        </div>
        <div className="flex space-x-2 flex-shrink-0">
          <button
            tooltip-data="Edit"
            tooltip-placement="bottom"
            onClick={() => onEdit(testType)}
            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <FiEdit className="h-4 w-4" />
          </button>
          <button
            tooltip-data="Move to Trash"
            tooltip-placement="bottom"
            onClick={() => onMoveToTrash(testType)}
            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
        {testType.testTypeDesc || 'No description provided'}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Created: {new Date(testType.createdAt).toLocaleDateString()}
        </span>
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
      className="fixed inset-0 bg-gray-100 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <FiEye className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
};

export default TestTypeManagement;