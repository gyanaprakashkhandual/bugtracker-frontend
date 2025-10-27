'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RefreshCw, Search, Filter, ChevronLeft, ChevronRight, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useTestType } from '@/app/script/TestType.context';
import { useAlert } from '@/app/script/Alert.context';

const BASE_URL = 'https://caffetest.onrender.com/api/v1/bug';

export default function TrashedBugs() {
  const { showAlert } = useAlert();
  const { testTypeId, testTypeName } = useTestType();
  const [projectId, setProjectId] = useState(null);
  const [token, setToken] = useState(null);
  
  const [trashedBugs, setTrashedBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTrashed, setTotalTrashed] = useState(0);
  const [limit] = useState(10);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    bugType: '',
    status: '',
    priority: '',
    severity: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setProjectId(localStorage.getItem('currentProjectId'));
      setToken(localStorage.getItem('token'));
    }
  }, []);

  useEffect(() => {
    if (projectId && testTypeId && token) {
      fetchTrashedBugs();
    }
  }, [projectId, testTypeId, token, currentPage, searchTerm, filters]);

  const fetchTrashedBugs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: limit,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.bugType && { bugType: filters.bugType }),
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.severity && { severity: filters.severity })
      });

      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/trash?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setTrashedBugs(data.trashedBugs || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalTrashed(data.pagination?.totalTrashed || 0);
      } else {
        showAlert(data.message || 'Failed to fetch trashed bugs', 'error');
      }
    } catch (err) {
      showAlert('Error fetching trashed bugs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (bugId) => {
    try {
      setActionLoading(bugId);
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/${bugId}/restore`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        showAlert('Bug restored successfully', 'success');
        fetchTrashedBugs();
      } else {
        showAlert(data.message || 'Failed to restore bug', 'error');
      }
    } catch (err) {
      showAlert('Error restoring bug', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePermanently = async (bugId) => {
    if (!confirm('Are you sure you want to permanently delete this bug? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(bugId);
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/${bugId}/permanent`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        showAlert('Bug deleted permanently', 'success');
        fetchTrashedBugs();
      } else {
        showAlert(data.message || 'Failed to delete bug', 'error');
      }
    } catch (err) {
      showAlert('Error deleting bug', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      bugType: '',
      status: '',
      priority: '',
      severity: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      blocker: 'bg-red-100 text-red-800',
      critical: 'bg-orange-100 text-orange-800',
      major: 'bg-yellow-100 text-yellow-800',
      minor: 'bg-blue-100 text-blue-800',
      trivial: 'bg-gray-100 text-gray-800'
    };
    return colors[severity?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (!projectId || !testTypeId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please select a project and test type</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Trash2 className="w-8 h-8 text-red-600" />
          Trashed Bugs
        </h1>
        <p className="text-gray-600 mt-2">
          Test Type: <span className="font-semibold">{testTypeName}</span> • Total Trashed: {totalTrashed}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search bugs..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>

          {/* Clear Filters */}
          {(searchTerm || Object.values(filters).some(v => v)) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 overflow-hidden"
            >
              <select
                value={filters.bugType}
                onChange={(e) => handleFilterChange('bugType', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Bug Types</option>
                <option value="functional">Functional</option>
                <option value="performance">Performance</option>
                <option value="security">Security</option>
                <option value="ui">UI</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={filters.severity}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Severities</option>
                <option value="blocker">Blocker</option>
                <option value="critical">Critical</option>
                <option value="major">Major</option>
                <option value="minor">Minor</option>
                <option value="trivial">Trivial</option>
              </select>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bugs List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : trashedBugs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Trashed Bugs</h3>
          <p className="text-gray-500">There are no bugs in the trash for this test type.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {trashedBugs.map((bug) => (
              <motion.div
                key={bug._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-gray-500">#{bug.serialNumber}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(bug.priority)}`}>
                        {bug.priority}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(bug.severity)}`}>
                        {bug.severity}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{bug.moduleName}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{bug.bugDesc}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Type: {bug.bugType}</span>
                      <span>Status: {bug.status}</span>
                      <span>Reporter: {bug.user?.name}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleRestore(bug._id)}
                      disabled={actionLoading === bug._id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {actionLoading === bug._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      Restore
                    </button>

                    <button
                      onClick={() => handleDeletePermanently(bug._id)}
                      disabled={actionLoading === bug._id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {actionLoading === bug._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}