'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiEdit, FiTrash2, FiSearch,
  FiChevronLeft, FiChevronRight, FiEye,
  FiBarChart2, FiFolder, FiGitBranch, FiChevronDown, FiCheck
} from 'react-icons/fi';
import { useAlert } from '@/app/script/Alert.context';
import { useConfirm } from '@/app/script/Confirm.context';
import { useProject } from '@/app/script/Project.context';

const TestTypeManagement = () => {
  const { selectedProject } = useProject();
  const [testTypes, setTestTypes] = useState([]);
  const [projectTestTypes, setProjectTestTypes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
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
    testTypeDesc: '',
    testFramework: 'Selenium'
  });
  const [frameworkDropdownOpen, setFrameworkDropdownOpen] = useState(false);

  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();

  const frameworks = ['Selenium', 'Cypress', 'Playwright', 'Jest', 'Mocha', 'JUnit', 'TestNG', 'PyTest'];

  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      return token;
    }
    return null;
  };

  // API call function
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
      const response = await fetch(`http://localhost:5000/api/v1/test-type${endpoint}`, {
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

  // Fetch all test types (for "All Test Types" tab)
  const fetchAllTestTypes = async (page = 1, search = '') => {
    setLoading(true);
    const endpoint = `/test-types?page=${page}&limit=8&search=${search}`;
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

  // Fetch project-specific test types (for "Project Test Types" tab)
  const fetchProjectTestTypes = async (page = 1, search = '') => {
    if (!selectedProject || !selectedProject.id) {
      showAlert({
        type: 'error',
        message: 'Please select a project first'
      });
      return;
    }

    setLoading(true);
    const endpoint = `/projects/${selectedProject.id}/test-types?page=${page}&limit=8&search=${search}`;
    const result = await apiCall(endpoint);

    if (result) {
      setProjectTestTypes(result.testTypes || []);
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

  // Fetch test types based on active tab
  const fetchTestTypes = async (page = 1, search = '') => {
    if (activeTab === 'project') {
      await fetchProjectTestTypes(page, search);
    } else {
      await fetchAllTestTypes(page, search);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    const result = await apiCall('/test-types/stats');
    if (result) {
      setStats(result.stats || result);
    }
  };

  // Create test type
  const handleCreateTestType = async (e) => {
    e.preventDefault();

    if (!selectedProject || !selectedProject.id) {
      showAlert({
        type: 'error',
        message: 'Please select a project first'
      });
      return;
    }

    setSaving(true);

    try {
      const result = await apiCall(`/projects/${selectedProject.id}/test-types`, {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (result) {
        showAlert({
          type: 'success',
          message: `"${formData.testTypeName}" created successfully`
        });
        setShowCreateModal(false);
        setFormData({ testTypeName: '', testTypeDesc: '', testFramework: 'Selenium' });
        fetchTestTypes();
        fetchStats();
      }
    } finally {
      setSaving(false);
    }
  };

  // Update test type
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
        setFormData({ testTypeName: '', testTypeDesc: '', testFramework: 'Selenium' });
        fetchTestTypes();
        fetchStats();
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle form submission (create or update)
  const handleSubmitTestType = async (e) => {
    if (selectedTestType) {
      await handleUpdateTestType(e);
    } else {
      await handleCreateTestType(e);
    }
  };

  // Delete test type permanently
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
        fetchStats();
      }
    }
  };

  // Move to trash
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
        fetchStats();
      }
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchTestTypes();
    fetchStats();
  }, [activeTab]);

  // Fetch project test types when selectedProject changes
  useEffect(() => {
    if (selectedProject && activeTab === 'project') {
      fetchProjectTestTypes(1, searchTerm);
    }
  }, [selectedProject]);

  // Handle search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTestTypes(1, searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, activeTab]);

  const currentTestTypes = activeTab === 'project' ? projectTestTypes : testTypes;

  if (!selectedProject || !selectedProject.id) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiFolder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Project Selected</h3>
          <p className="text-gray-500">Please select a project to manage test types</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-full mx-auto">
        {/* Main Content */}
        <div className="bg-white rounded-sm">
          {/* Tabs and Search */}
          <div className="border-b border-gray-200">
            <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex space-x-4">
                {['all', 'project', 'stats'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    {tab === 'all' && 'All Test Types'}
                    {tab === 'project' && 'Project Test Types'}
                    {tab === 'stats' && 'Statistics'}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search test types..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 w-64"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
                >
                  <FiPlus className="h-5 w-5" />
                  <span>New Test Type</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {activeTab === 'stats' ? (
              <StatsView stats={stats} />
            ) : (
              <TestTypesView
                testTypes={currentTestTypes}
                loading={loading}
                pagination={pagination}
                onPageChange={fetchTestTypes}
                onEdit={(testType) => {
                  setSelectedTestType(testType);
                  setFormData({
                    testTypeName: testType.testTypeName,
                    testTypeDesc: testType.testTypeDesc,
                    testFramework: testType.testFramework
                  });
                  setShowCreateModal(true);
                }}
                onDelete={handleDeleteTestType}
                onMoveToTrash={handleMoveToTrash}
              />
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Test Type Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <Modal
            title={selectedTestType ? 'Edit Test Type' : 'Create New Test Type'}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedTestType(null);
              setFormData({ testTypeName: '', testTypeDesc: '', testFramework: 'Selenium' });
              setFrameworkDropdownOpen(false);
            }}
          >
            <form onSubmit={handleSubmitTestType} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Type Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.testTypeName}
                  onChange={(e) => setFormData({ ...formData, testTypeName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900"
                  placeholder="Enter test type name"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.testTypeDesc}
                  onChange={(e) => setFormData({ ...formData, testTypeDesc: e.target.value })}
                  rows="4"
                  className="w-full resize-none px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900"
                  placeholder="Enter test type description"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Framework
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setFrameworkDropdownOpen(!frameworkDropdownOpen)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 bg-white text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    disabled={saving}
                  >
                    <span className="text-gray-900">{formData.testFramework}</span>
                    <FiChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${frameworkDropdownOpen ? 'transform rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {frameworkDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full bottom-full mb-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                      >
                        {frameworks.map((framework) => (
                          <button
                            key={framework}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, testFramework: framework });
                              setFrameworkDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors flex items-center justify-between group"
                            disabled={saving}
                          >
                            <span className={`text-sm ${formData.testFramework === framework ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                              {framework}
                            </span>
                            {formData.testFramework === framework && (
                              <FiCheck className="h-4 w-4 text-blue-600" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedTestType(null);
                    setFormData({ testTypeName: '', testTypeDesc: '', testFramework: 'Selenium' });
                    setFrameworkDropdownOpen(false);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 min-w-[120px] justify-center"
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

// Test Types View Component
const TestTypesView = ({ testTypes, loading, pagination, onPageChange, onEdit, onDelete, onMoveToTrash }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-48 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (testTypes.length === 0) {
    return (
      <div className="text-center py-12">
        <FiFolder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No test types found</h3>
        <p className="text-gray-500">Get started by creating your first test type.</p>
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

// Test Type Card Component
const TestTypeCard = ({ testType, index, onEdit, onDelete, onMoveToTrash }) => {
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
            {testType.testTypeName}
          </h3>
          <p className="text-sm text-gray-500 mb-2">
            by {testType.user?.name || 'Unknown User'}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
          tooltip-data="Edit"
          tooltip-placement="bottom"
            onClick={() => onEdit(testType)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <FiEdit className="h-4 w-4" />
          </button>
          <button
          tooltip-data="Move to Trash"
          tooltip-placement="bottom"
            onClick={() => onMoveToTrash(testType)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {testType.testTypeDesc || 'No description provided'}
      </p>

      <div className="flex items-center justify-between">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <FiGitBranch className="h-3 w-3 mr-1" />
          {testType.testFramework}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(testType.createdAt).toLocaleDateString()}
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Test Types</p>
              <p className="text-4xl font-bold text-gray-900 mt-3 mb-1">
                {stats?.totalTestTypes || 0}
              </p>
            </div>
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
              <FiFolder className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Active Frameworks</p>
              <p className="text-4xl font-bold text-gray-900 mt-3">
                {stats?.testTypesByFramework?.length || 0}
              </p>
              <p className="text-xs font-medium text-gray-400 mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Different frameworks
              </p>
            </div>
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
              <FiGitBranch className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Recent Test Types</p>
              <p className="text-4xl font-bold text-gray-900 mt-3 mb-1">
                {stats?.recentTestTypes?.length || 0}
              </p>
            </div>
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
              <FiBarChart2 className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Framework Distribution */}
      {stats.testTypesByFramework && stats.testTypesByFramework.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Framework Distribution</h3>
          <div className="bg-gray-50 rounded-lg p-6">
            {stats.testTypesByFramework.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
              >
                <div className="flex items-center">
                  <FiGitBranch className="h-4 w-4 text-gray-500 mr-3" />
                  <span className="font-medium text-gray-900">{item._id}</span>
                </div>
                <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-sm font-medium">
                  {item.count} test types
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Test Types */}
      {stats.recentTestTypes && stats.recentTestTypes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Test Types</h3>
          <div className="bg-gray-50 rounded-lg p-6">
            {stats.recentTestTypes.map((testType, index) => (
              <motion.div
                key={testType._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{testType.testTypeName}</p>
                  <p className="text-sm text-gray-500">by {testType.user?.name} • {testType.project?.projectName}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <FiGitBranch className="h-3 w-3 mr-1" />
                    {testType.testFramework}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(testType.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
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
      className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center p-4 z-50"
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

export default TestTypeManagement;