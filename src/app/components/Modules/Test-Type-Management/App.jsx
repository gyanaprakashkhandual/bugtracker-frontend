'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, MoreHorizontal, Edit2, Trash2, 
  RefreshCw, BarChart3, FolderOpen, GitBranch, 
  ChevronDown, X, AlertCircle, CheckCircle, 
  ArrowLeft, ArrowRight, Settings, Eye, Check
} from 'lucide-react';
import { useProject } from '@/app/script/Project.context';

const TestTypeManagement = () => {
  // Get project from context
  const { selectedProject } = useProject();
  
  // State management
  const [testTypes, setTestTypes] = useState([]);
  const [filteredTestTypes, setFilteredTestTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // UI state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [editingTestType, setEditingTestType] = useState(null);
  const [selectedTestType, setSelectedTestType] = useState(null);
  
  // Filter and pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  
  // Dropdown states
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [frameworkDropdown, setFrameworkDropdown] = useState(false);
  const [createFrameworkDropdown, setCreateFrameworkDropdown] = useState(false);
  const [editFrameworkDropdown, setEditFrameworkDropdown] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    testTypeName: '',
    testTypeDesc: '',
    testFramework: 'Selenium'
  });

  // Stats state
  const [stats, setStats] = useState(null);
  const [trashItems, setTrashItems] = useState([]);

  const frameworks = ['Selenium', 'Cypress', 'Playwright', 'Jest', 'Mocha', 'JUnit', 'TestNG', 'PyTest'];

  // API calls
  const API_BASE = 'http://localhost:5000/api/v1/test-type';
  
  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchTestTypes = async (page = 1, search = '', framework = '') => {
    if (!selectedProject?._id) {
      setError('No project selected');
      return;
    }

    setLoading(true);
    try {
      let url = `${API_BASE}/projects/${selectedProject._id}/test-types?page=${page}&limit=12`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (framework) url += `&framework=${encodeURIComponent(framework)}`;

      const response = await fetch(url, { headers: getHeaders() });
      const data = await response.json();

      if (response.ok) {
        setTestTypes(data.testTypes);
        setFilteredTestTypes(data.testTypes);
        setTotalPages(data.pagination.totalPages);
        setCurrentPage(data.pagination.currentPage);
      } else {
        setError(data.message || 'Failed to fetch test types');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createTestType = async () => {
    if (!selectedProject?._id) {
      setError('No project selected');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/projects/${selectedProject._id}/test-types`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Test type created successfully');
        setShowCreateModal(false);
        resetForm();
        fetchTestTypes(currentPage, searchTerm, selectedFramework);
      } else {
        setError(data.message || 'Failed to create test type');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getTestTypeById = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/test-types/${id}`, {
        headers: getHeaders()
      });

      const data = await response.json();

      if (response.ok) {
        setSelectedTestType(data.testType);
      } else {
        setError(data.message || 'Failed to fetch test type');
      }
    } catch (error) {
      setError('Network error occurred');
    }
  };

  const updateTestType = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/test-types/${editingTestType._id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Test type updated successfully');
        setShowEditModal(false);
        setEditingTestType(null);
        resetForm();
        fetchTestTypes(currentPage, searchTerm, selectedFramework);
      } else {
        setError(data.message || 'Failed to update test type');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const moveToTrash = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/test-types/${id}/trash`, {
        method: 'PATCH',
        headers: getHeaders()
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Test type moved to trash');
        fetchTestTypes(currentPage, searchTerm, selectedFramework);
      } else {
        setError(data.message || 'Failed to move to trash');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/test-types/stats`, {
        headers: getHeaders()
      });

      const data = await response.json();
      if (response.ok) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchTrashItems = async () => {
    try {
      const response = await fetch(`${API_BASE}/test-types/trash`, {
        headers: getHeaders()
      });

      const data = await response.json();
      if (response.ok) {
        setTrashItems(data.trashItems);
      }
    } catch (error) {
      console.error('Failed to fetch trash items');
    }
  };

  const restoreFromTrash = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/test-types/${id}/restore`, {
        method: 'PATCH',
        headers: getHeaders()
      });

      if (response.ok) {
        setSuccess('Test type restored successfully');
        fetchTrashItems();
        fetchTestTypes(currentPage, searchTerm, selectedFramework);
      }
    } catch (error) {
      setError('Failed to restore test type');
    }
  };

  const deleteTestType = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/test-types/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (response.ok) {
        setSuccess('Test type deleted permanently');
        fetchTrashItems();
      }
    } catch (error) {
      setError('Failed to delete test type');
    }
  };

  const emptyTrash = async () => {
    try {
      const response = await fetch(`${API_BASE}/test-types/trash/empty`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (response.ok) {
        setSuccess('Trash emptied successfully');
        setTrashItems([]);
      }
    } catch (error) {
      setError('Failed to empty trash');
    }
  };

  const resetForm = () => {
    setFormData({
      testTypeName: '',
      testTypeDesc: '',
      testFramework: 'Selenium'
    });
    setCreateFrameworkDropdown(false);
    setEditFrameworkDropdown(false);
  };

  // Effects
  useEffect(() => {
    if (selectedProject?._id) {
      fetchTestTypes();
    }
  }, [selectedProject]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedProject?._id && (searchTerm !== '' || selectedFramework !== '')) {
        fetchTestTypes(1, searchTerm, selectedFramework);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedFramework, selectedProject]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setActiveDropdown(null);
        setFrameworkDropdown(false);
        setCreateFrameworkDropdown(false);
        setEditFrameworkDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // GitHub-style Dropdown Component
  const Dropdown = ({ isOpen, onToggle, children, className = '' }) => (
    <div className={`relative ${className}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Alert Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2"
          >
            <AlertCircle size={20} />
            {error}
            <button onClick={() => setError('')} className="ml-2">
              <X size={16} />
            </button>
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2"
          >
            <CheckCircle size={20} />
            {success}
            <button onClick={() => setSuccess('')} className="ml-2">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Test Types</h1>
            <p className="text-gray-600 mt-1">Manage your test types and frameworks</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => {fetchStats(); setShowStatsModal(true);}}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <BarChart3 size={16} />
              Stats
            </button>
            
            <button
              onClick={() => {fetchTrashItems(); setShowTrashModal(true);}}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
              Trash
            </button>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              New Test Type
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search test types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Framework Filter */}
            <Dropdown
              isOpen={frameworkDropdown}
              onToggle={() => setFrameworkDropdown(!frameworkDropdown)}
            >
              <button
                onClick={() => setFrameworkDropdown(!frameworkDropdown)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <GitBranch size={16} />
                {selectedFramework || 'All Frameworks'}
                <ChevronDown size={14} />
              </button>
              
              <div className="py-1">
                <button
                  onClick={() => {setSelectedFramework(''); setFrameworkDropdown(false);}}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${!selectedFramework ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  All Frameworks
                </button>
                {frameworks.map((framework) => (
                  <button
                    key={framework}
                    onClick={() => {setSelectedFramework(framework); setFrameworkDropdown(false);}}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedFramework === framework ? 'bg-blue-50 text-blue-600' : ''}`}
                  >
                    {framework}
                  </button>
                ))}
              </div>
            </Dropdown>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-50'}`}
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className="bg-current w-1.5 h-1.5 rounded-sm"></div>
                  <div className="bg-current w-1.5 h-1.5 rounded-sm"></div>
                  <div className="bg-current w-1.5 h-1.5 rounded-sm"></div>
                  <div className="bg-current w-1.5 h-1.5 rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 border-l border-gray-300 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-50'}`}
              >
                <div className="w-4 h-4 flex flex-col gap-0.5">
                  <div className="bg-current h-0.5 w-full rounded"></div>
                  <div className="bg-current h-0.5 w-full rounded"></div>
                  <div className="bg-current h-0.5 w-full rounded"></div>
                  <div className="bg-current h-0.5 w-full rounded"></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading && testTypes.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="animate-spin text-blue-600" size={24} />
          <span className="ml-2 text-gray-600">Loading test types...</span>
        </div>
      ) : (
        <>
          {/* Grid/List View */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6' : 'space-y-3 mb-6'}>
            <AnimatePresence>
              {testTypes.map((testType, index) => (
                <motion.div
                  key={testType._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all ${
                    viewMode === 'list' ? 'flex items-center justify-between' : ''
                  }`}
                >
                  <div className={viewMode === 'list' ? 'flex items-center space-x-4' : ''}>
                    <div className={`${viewMode === 'list' ? '' : 'mb-3'}`}>
                      <h3 className="font-semibold text-gray-900 text-lg">{testType.testTypeName}</h3>
                      <p className="text-gray-600 text-sm mt-1">{testType.testTypeDesc}</p>
                    </div>
                    
                    <div className={`flex items-center gap-2 ${viewMode === 'list' ? '' : 'mb-3'}`}>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <GitBranch size={12} className="mr-1" />
                        {testType.testFramework}
                      </span>
                    </div>

                    {viewMode === 'grid' && (
                      <div className="text-xs text-gray-500 mb-3">
                        Created by {testType.user?.name || 'Unknown'}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Dropdown
                      isOpen={activeDropdown === testType._id}
                      onToggle={() => setActiveDropdown(activeDropdown === testType._id ? null : testType._id)}
                    >
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === testType._id ? null : testType._id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      
                      <div className="py-1 -ml-20">
                        <button
                          onClick={() => {
                            setEditingTestType(testType);
                            setFormData({
                              testTypeName: testType.testTypeName,
                              testTypeDesc: testType.testTypeDesc,
                              testFramework: testType.testFramework
                            });
                            setShowEditModal(true);
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            getTestTypeById(testType._id);
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Eye size={14} />
                          View Details
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={() => {
                            moveToTrash(testType._id);
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
                        >
                          <Trash2 size={14} />
                          Move to Trash
                        </button>
                      </div>
                    </Dropdown>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => {
                  if (currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                    fetchTestTypes(currentPage - 1, searchTerm, selectedFramework);
                  }
                }}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={16} />
                Previous
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => {
                  if (currentPage < totalPages) {
                    setCurrentPage(currentPage + 1);
                    fetchTestTypes(currentPage + 1, searchTerm, selectedFramework);
                  }
                }}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop:blur-md shadow-2xl"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Create New Test Type</h2>
                <button
                  onClick={() => {setShowCreateModal(false); resetForm();}}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Type Name *
                  </label>
                  <input
                    type="text"
                    value={formData.testTypeName}
                    onChange={(e) => setFormData({...formData, testTypeName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900"
                    placeholder="Enter test type name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.testTypeDesc}
                    onChange={(e) => setFormData({...formData, testTypeDesc: e.target.value})}
                    className="w-full resize-none px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900"
                    rows={3}
                    placeholder="Enter description"
                  />
                </div>
                
                <div className="dropdown-container">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Framework
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCreateFrameworkDropdown(!createFrameworkDropdown)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <GitBranch size={16} className="text-gray-500" />
                        {formData.testFramework}
                      </div>
                      <ChevronDown size={16} className={`text-gray-400 transition-transform ${createFrameworkDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {createFrameworkDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-60 overflow-y-auto"
                        >
                          {frameworks.map((framework) => (
                            <button
                              key={framework}
                              type="button"
                              onClick={() => {
                                setFormData({...formData, testFramework: framework});
                                setCreateFrameworkDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center justify-between transition-colors ${
                                formData.testFramework === framework ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <GitBranch size={14} className="text-gray-500" />
                                {framework}
                              </div>
                              {formData.testFramework === framework && (
                                <Check size={14} className="text-blue-600" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {setShowCreateModal(false); resetForm();}}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createTestType}
                  disabled={!formData.testTypeName.trim() || loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Edit Test Type</h2>
                <button
                  onClick={() => {setShowEditModal(false); setEditingTestType(null); resetForm();}}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Type Name *
                  </label>
                  <input
                    type="text"
                    value={formData.testTypeName}
                    onChange={(e) => setFormData({...formData, testTypeName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900"
                    placeholder="Enter test type name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.testTypeDesc}
                    onChange={(e) => setFormData({...formData, testTypeDesc: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900"
                    rows={3}
                    placeholder="Enter description"
                  />
                </div>
                
                <div className="dropdown-container">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Framework
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setEditFrameworkDropdown(!editFrameworkDropdown)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <GitBranch size={16} className="text-gray-500" />
                        {formData.testFramework}
                      </div>
                      <ChevronDown size={16} className={`text-gray-400 transition-transform ${editFrameworkDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {editFrameworkDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-60 overflow-y-auto"
                        >
                          {frameworks.map((framework) => (
                            <button
                              key={framework}
                              type="button"
                              onClick={() => {
                                setFormData({...formData, testFramework: framework});
                                setEditFrameworkDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center justify-between transition-colors ${
                                formData.testFramework === framework ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <GitBranch size={14} className="text-gray-500" />
                                {framework}
                              </div>
                              {formData.testFramework === framework && (
                                <Check size={14} className="text-blue-600" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {setShowEditModal(false); setEditingTestType(null); resetForm();}}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={updateTestType}
                  disabled={!formData.testTypeName.trim() || loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Type Details Modal */}
      <AnimatePresence>
        {selectedTestType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Test Type Details</h2>
                <button
                  onClick={() => setSelectedTestType(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <div className="text-gray-900 font-medium">{selectedTestType.testTypeName}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <div className="text-gray-700">{selectedTestType.testTypeDesc || 'No description provided'}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Framework</label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <GitBranch size={12} className="mr-1" />
                    {selectedTestType.testFramework}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                    <div className="text-gray-700">{selectedTestType.user?.name || 'Unknown'}</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                    <div className="text-gray-700">{selectedTestType.project?.projectName || 'Unknown'}</div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                  <div className="text-gray-700">
                    {new Date(selectedTestType.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setSelectedTestType(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setEditingTestType(selectedTestType);
                    setFormData({
                      testTypeName: selectedTestType.testTypeName,
                      testTypeDesc: selectedTestType.testTypeDesc,
                      testFramework: selectedTestType.testFramework
                    });
                    setSelectedTestType(null);
                    setShowEditModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Modal */}
      <AnimatePresence>
        {showStatsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Test Type Statistics</h2>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              {stats && (
                <div className="space-y-6">
                  {/* Overview Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalTestTypes}</div>
                      <div className="text-sm text-blue-800">Total Test Types</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {stats.testTypesByFramework?.length || 0}
                      </div>
                      <div className="text-sm text-green-800">Active Frameworks</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {stats.recentTestTypes?.length || 0}
                      </div>
                      <div className="text-sm text-purple-800">Recent Items</div>
                    </div>
                  </div>

                  {/* Framework Distribution */}
                  {stats.testTypesByFramework && stats.testTypesByFramework.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Framework Distribution</h3>
                      <div className="space-y-2">
                        {stats.testTypesByFramework.map((item, index) => (
                          <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <GitBranch size={16} className="text-gray-600" />
                              <span className="font-medium">{item._id}</span>
                            </div>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                              {item.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Test Types */}
                  {stats.recentTestTypes && stats.recentTestTypes.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Recent Test Types</h3>
                      <div className="space-y-2">
                        {stats.recentTestTypes.map((testType) => (
                          <div key={testType._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium">{testType.testTypeName}</div>
                              <div className="text-sm text-gray-600">
                                by {testType.user?.name} • {testType.project?.projectName}
                              </div>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {testType.testFramework}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trash Modal */}
      <AnimatePresence>
        {showTrashModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Trash</h2>
                <div className="flex items-center gap-2">
                  {trashItems.length > 0 && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to permanently delete all items in trash?')) {
                          emptyTrash();
                        }
                      }}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                    >
                      Empty Trash
                    </button>
                  )}
                  <button
                    onClick={() => setShowTrashModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              {trashItems.length === 0 ? (
                <div className="text-center py-12">
                  <Trash2 size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Trash is empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trashItems.map((item) => (
                    <div key={item._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.testTypeName}</h3>
                        <p className="text-sm text-gray-600">{item.testTypeDesc}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <GitBranch size={12} />
                            {item.testFramework}
                          </span>
                          <span>by {item.user?.name}</span>
                          <span>
                            Deleted: {new Date(item.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => restoreFromTrash(item._id)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to permanently delete this test type?')) {
                              deleteTestType(item._id);
                            }
                          }}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Project Selected */}
      {!selectedProject && (
        <div className="text-center py-12">
          <FolderOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Project Selected</h3>
          <p className="text-gray-500">
            Please select a project to view and manage test types
          </p>
        </div>
      )}

      {/* Empty State */}
      {selectedProject && !loading && testTypes.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No test types found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedFramework 
              ? 'Try adjusting your search filters' 
              : 'Get started by creating your first test type'
            }
          </p>
          {!searchTerm && !selectedFramework && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} />
              Create Test Type
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TestTypeManagement;