'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  SkipForward,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Trash2,
  Filter,
  Calendar,
  Search,
  BarChart3,
  Package,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FileText,
  Code,
  Timer,
  Activity
} from 'lucide-react';
import { useAlert } from '@/app/script/Alert.context';
import { useTestType } from '@/app/script/TestType.context';
import { useProject } from '@/app/script/Project.context';

const BASE_URL = 'http://localhost:5000/api/v1/test-result';

export default function TestResultsDashboard() {
  const { showAlert } = useAlert();
  const { selectedProject } = useProject();
  const { testTypeId } = useTestType();

  const [testResults, setTestResults] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    framework: '',
    dateFrom: '',
    dateTo: '',
    searchQuery: ''
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const [showFilters, setShowFilters] = useState(false);

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('authToken');
  };

  // Fetch test results
  const fetchTestResults = async () => {
    if (!selectedProject?._id || !testTypeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = getToken();
      
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.framework && { framework: filters.framework }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo })
      });

      const response = await fetch(
        `${BASE_URL}/${selectedProject._id}/${testTypeId}?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setTestResults(data.data);
        setPagination(data.pagination);
      } else {
        showAlert('Failed to fetch test results', 'error');
      }
    } catch (error) {
      showAlert('Error fetching test results', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    if (!selectedProject?._id || !testTypeId) {
      setStatsLoading(false);
      return;
    }

    try {
      setStatsLoading(true);
      const token = getToken();
      
      const queryParams = filters.framework 
        ? `?framework=${filters.framework}` 
        : '';

      const response = await fetch(
        `${BASE_URL}/stats/${selectedProject._id}/${testTypeId}${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setStatistics(data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Delete test result
  const handleDelete = async (resultId) => {
    if (!confirm('Are you sure you want to delete this test result?')) {
      return;
    }

    try {
      const token = getToken();
      
      const response = await fetch(`${BASE_URL}/${resultId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        showAlert('Test result deleted successfully', 'success');
        fetchTestResults();
        fetchStatistics();
      } else {
        showAlert(data.message || 'Failed to delete test result', 'error');
      }
    } catch (error) {
      showAlert('Error deleting test result', 'error');
      console.error(error);
    }
  };

  // Filter results locally by search query
  const filteredResults = testResults.filter(result => {
    if (!filters.searchQuery) return true;
    
    const query = filters.searchQuery.toLowerCase();
    return (
      result.feature?.toLowerCase().includes(query) ||
      result.scenario?.toLowerCase().includes(query) ||
      result.className?.toLowerCase().includes(query) ||
      result.methodName?.toLowerCase().includes(query) ||
      result.serialNumber?.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    fetchTestResults();
    fetchStatistics();
  }, [selectedProject, testTypeId, pagination.page, filters.status, filters.framework, filters.dateFrom, filters.dateTo]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pass':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'Fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'Skipped':
        return <SkipForward className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pass: 'bg-green-100 text-green-700 border-green-200',
      Fail: 'bg-red-100 text-red-700 border-red-200',
      Skipped: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    };

    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!selectedProject || !testTypeId) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600">Please select a project and test type</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Test Results</h1>
        <p className="text-sm text-gray-600">
          {selectedProject?.projectName} - Test Results Dashboard
        </p>
      </div>

      {/* Statistics Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : statistics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Total Tests</span>
              <Activity className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{statistics.totalResults}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Passed</span>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {statistics.byStatus?.find(s => s._id === 'Pass')?.count || 0}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Failed</span>
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-600">
              {statistics.byStatus?.find(s => s._id === 'Fail')?.count || 0}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Avg Duration</span>
              <Timer className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatDuration(statistics.averageDuration)}
            </div>
          </motion.div>
        </div>
      ) : null}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters & Search
          </div>
          {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200"
            >
              <div className="p-4 space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by feature, scenario, class, method..."
                      value={filters.searchQuery}
                      onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Status</option>
                      <option value="Pass">Pass</option>
                      <option value="Fail">Fail</option>
                      <option value="Skipped">Skipped</option>
                    </select>
                  </div>

                  {/* Framework Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Framework</label>
                    <select
                      value={filters.framework}
                      onChange={(e) => setFilters({ ...filters, framework: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Frameworks</option>
                      <option value="cucumber">Cucumber</option>
                      <option value="testng">TestNG</option>
                      <option value="junit">JUnit</option>
                    </select>
                  </div>

                  {/* Date From */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Date From</label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Date To */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Date To</label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setFilters({ status: '', framework: '', dateFrom: '', dateTo: '', searchQuery: '' });
                      setPagination({ ...pagination, page: 1 });
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => {
                      fetchTestResults();
                      fetchStatistics();
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Test Results Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FileText className="w-12 h-12 mb-3 text-gray-400" />
              <p className="text-sm">No test results found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Serial
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Test Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Framework
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredResults.map((result, index) => (
                  <motion.tr
                    key={result._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedResult(result)}
                  >
                    <td className="px-4 py-3 text-xs font-mono text-gray-900">
                      {result.serialNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {result.feature || result.className}
                        </span>
                        <span className="text-xs text-gray-600">
                          {result.scenario || result.methodName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(result.status)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {result.testFramework}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {formatDuration(result.duration)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {formatDate(result.timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(result._id);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedResult(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Test Result Details</h2>
                  <button
                    onClick={() => setSelectedResult(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Serial Number</label>
                      <p className="text-sm font-mono text-gray-900">{selectedResult.serialNumber}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Status</label>
                      <div className="mt-1">{getStatusBadge(selectedResult.status)}</div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Framework</label>
                      <p className="text-sm text-gray-900">{selectedResult.testFramework}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Duration</label>
                      <p className="text-sm text-gray-900">{formatDuration(selectedResult.duration)}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600">Test Description</label>
                    <p className="text-sm text-gray-900">{selectedResult.testCaseDescription}</p>
                  </div>

                  {selectedResult.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <label className="text-xs font-medium text-red-700 flex items-center gap-1 mb-1">
                        <AlertTriangle className="w-3 h-3" />
                        Error Details
                      </label>
                      <pre className="text-xs text-red-800 whitespace-pre-wrap">{selectedResult.error}</pre>
                    </div>
                  )}

                  {selectedResult.steps && selectedResult.steps.length > 0 && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-2 block">Test Steps</label>
                      <div className="space-y-2">
                        {selectedResult.steps.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            {getStatusIcon(step.status)}
                            <span className="text-sm text-gray-900">{step.name}</span>
                            <span className="text-xs text-gray-500 ml-auto">
                              {formatDuration(step.duration)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedResult.rawData?.testCode && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-2 block flex items-center gap-1">
                        <Code className="w-3 h-3" />
                        Test Code
                      </label>
                      <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto">
                        {Object.values(selectedResult.rawData.testCode)[0]}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}