'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Calendar,
  User,
  FileText,
  Layers,
  AlertTriangle,
  Flag,
  Activity,
  Image as ImageIcon,
  X,
  LayoutGrid,
  LayoutList
} from 'lucide-react';

export default function TestCasesCardView() {
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  useEffect(() => {
    fetchTestCases();
  }, [currentPage]);

  const fetchTestCases = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const projectId = localStorage.getItem('currentProjectId');
      const testTypeId = localStorage.getItem('selectedTestTypeId');
      const token = localStorage.getItem('token');

      if (!projectId || !testTypeId || !token) {
        throw new Error('Missing required credentials. Please login again.');
      }

      const response = await fetch(
        `http://localhost:5000/api/v1/test-case/projects/${projectId}/test-types/${testTypeId}/test-cases?page=${currentPage}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch test cases: ${response.statusText}`);
      }

      const data = await response.json();
      setTestCases(data.testCases || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching test cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status.toLowerCase()) {
      case 'solved':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'bg-gradient-to-br from-green-400 to-green-600',
          textColor: 'text-green-700',
          bgLight: 'bg-green-50',
          border: 'border-green-200'
        };
      case 'reviewed':
        return {
          icon: <Eye className="w-5 h-5" />,
          color: 'bg-gradient-to-br from-blue-400 to-blue-600',
          textColor: 'text-blue-700',
          bgLight: 'bg-blue-50',
          border: 'border-blue-200'
        };
      case 'new':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
          textColor: 'text-yellow-700',
          bgLight: 'bg-yellow-50',
          border: 'border-yellow-200'
        };
      case 'closed':
        return {
          icon: <XCircle className="w-5 h-5" />,
          color: 'bg-gradient-to-br from-gray-400 to-gray-600',
          textColor: 'text-gray-700',
          bgLight: 'bg-gray-50',
          border: 'border-gray-200'
        };
      default:
        return {
          icon: <Clock className="w-5 h-5" />,
          color: 'bg-gradient-to-br from-purple-400 to-purple-600',
          textColor: 'text-purple-700',
          bgLight: 'bg-purple-50',
          border: 'border-purple-200'
        };
    }
  };

  const getPriorityConfig = (priority) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return { color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300' };
      case 'high':
        return { color: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-300' };
      case 'medium':
        return { color: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-100', border: 'border-yellow-300' };
      case 'low':
        return { color: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-100', border: 'border-green-300' };
      default:
        return { color: 'bg-gray-500', text: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-300' };
    }
  };

  const getSeverityConfig = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-300' };
      case 'high':
        return { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-300' };
      case 'medium':
        return { icon: <Flag className="w-4 h-4" />, color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-300' };
      case 'low':
        return { icon: <Flag className="w-4 h-4" />, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-300' };
      default:
        return { icon: <Flag className="w-4 h-4" />, color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-300' };
    }
  };

  const filteredTestCases = testCases.filter(tc => {
    const matchesSearch = 
      tc.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tc.moduleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tc.testCaseDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || tc.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesPriority = filterPriority === 'all' || tc.priority.toLowerCase() === filterPriority.toLowerCase();
    const matchesSeverity = filterSeverity === 'all' || tc.severity.toLowerCase() === filterSeverity.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesPriority && matchesSeverity;
  });

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium">Loading test cases...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-red-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Error Occurred</h2>
          </div>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={fetchTestCases}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <RefreshCw className="w-5 h-5" />
            Retry Connection
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1920px] mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between flex-wrap gap-4"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Test Cases
              </h1>
              <p className="text-gray-600 text-lg">Manage and track your test cases efficiently</p>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-xl shadow-md p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg transition-all ${viewMode === 'list' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <LayoutList className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-indigo-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by serial, module, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border-2 border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white font-medium text-gray-700"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
              <option value="solved">Solved</option>
              <option value="closed">Closed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-3 border-2 border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white font-medium text-gray-700"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Severity Filter */}
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-4 py-3 border-2 border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white font-medium text-gray-700"
            >
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-indigo-100">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <p className="text-sm font-medium text-gray-700">
                Showing <span className="text-indigo-600 font-bold">{filteredTestCases.length}</span> of <span className="text-indigo-600 font-bold">{testCases.length}</span> test cases
              </p>
            </div>
            <button
              onClick={fetchTestCases}
              className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "space-y-4"}
        >
          <AnimatePresence>
            {filteredTestCases.map((testCase, index) => {
              const statusConfig = getStatusConfig(testCase.status);
              const priorityConfig = getPriorityConfig(testCase.priority);
              const severityConfig = getSeverityConfig(testCase.severity);

              return (
                <motion.div
                  key={testCase._id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 ${
                    viewMode === 'list' ? 'flex items-center' : ''
                  }`}
                >
                  {/* Card Header with Status */}
                  <div className={`${statusConfig.color} p-4 text-white ${viewMode === 'list' ? 'w-2' : ''}`}>
                    {viewMode === 'grid' && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {statusConfig.icon}
                          <span className="font-bold text-sm uppercase tracking-wider">
                            {testCase.status}
                          </span>
                        </div>
                        <span className="font-mono text-sm font-bold bg-white bg-opacity-20 px-3 py-1 rounded-lg">
                          {testCase.serialNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className={`p-6 ${viewMode === 'list' ? 'flex-1 flex items-center gap-6' : ''}`}>
                    {viewMode === 'list' && (
                      <div className="flex items-center gap-4 min-w-[200px]">
                        <div className={`${statusConfig.color} p-3 rounded-xl text-white`}>
                          {statusConfig.icon}
                        </div>
                        <div>
                          <span className="font-mono text-sm font-bold text-indigo-600 block">
                            {testCase.serialNumber}
                          </span>
                          <span className="text-xs text-gray-500 uppercase font-semibold">
                            {testCase.status}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className={viewMode === 'list' ? 'flex-1' : ''}>
                      {/* Module & Type */}
                      <div className={`${viewMode === 'grid' ? 'mb-4' : 'mb-2'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Layers className="w-4 h-4 text-indigo-600" />
                          <h3 className="font-bold text-lg text-gray-800">{testCase.moduleName}</h3>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          <FileText className="w-3 h-3" />
                          {testCase.testCaseType}
                        </span>
                      </div>

                      {/* Description */}
                      {viewMode === 'grid' && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                          {testCase.testCaseDescription}
                        </p>
                      )}

                      {/* Priority & Severity */}
                      <div className={`flex items-center gap-2 ${viewMode === 'grid' ? 'mb-4' : 'mb-0'}`}>
                        <div className={`flex items-center gap-1.5 ${priorityConfig.bg} ${priorityConfig.border} border px-3 py-1.5 rounded-lg`}>
                          <div className={`w-2 h-2 rounded-full ${priorityConfig.color}`}></div>
                          <span className={`text-xs font-bold ${priorityConfig.text} uppercase`}>
                            {testCase.priority}
                          </span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${severityConfig.bg} ${severityConfig.border} border px-3 py-1.5 rounded-lg`}>
                          <span className={severityConfig.color}>
                            {severityConfig.icon}
                          </span>
                          <span className={`text-xs font-bold ${severityConfig.color} uppercase`}>
                            {testCase.severity}
                          </span>
                        </div>
                      </div>

                      {/* User Info */}
                      {viewMode === 'grid' && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{testCase.user.name}</span>
                          <span className="mx-1">•</span>
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(testCase.createdAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className={`flex ${viewMode === 'grid' ? 'justify-between' : 'items-center gap-2'}`}>
                      {viewMode === 'grid' && testCase.image && testCase.image !== 'No image provided' && (
                        <div className="flex items-center gap-1 text-xs text-indigo-600 font-medium">
                          <ImageIcon className="w-4 h-4" />
                          Has Image
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedCase(testCase)}
                          className="p-2.5 bg-indigo-100 text-indigo-600 hover:bg-indigo-200 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2.5 bg-green-100 text-green-600 hover:bg-green-200 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Pagination */}
        {pagination && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-white rounded-2xl shadow-xl p-6 border border-indigo-100"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <p className="text-sm font-medium text-gray-700">
                Page <span className="text-indigo-600 font-bold">{pagination.currentPage}</span> of <span className="text-indigo-600 font-bold">{pagination.totalPages}</span> 
                <span className="mx-2">•</span>
                Total: <span className="text-indigo-600 font-bold">{pagination.totalTestCases}</span> test cases
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!pagination.hasPrev}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium shadow-lg disabled:shadow-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.hasNext}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium shadow-lg disabled:shadow-none"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedCase && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedCase(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 50, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className={`${getStatusConfig(selectedCase.status).color} p-6 text-white sticky top-0 z-10`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusConfig(selectedCase.status).icon}
                      <div>
                        <h2 className="text-3xl font-bold">{selectedCase.serialNumber}</h2>
                        <p className="text-white text-opacity-90 text-sm mt-1">
                          Test Case Details
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCase(null)}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-8 space-y-6">
                  {/* Image */}
                  {selectedCase.image && selectedCase.image !== 'No image provided' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl overflow-hidden shadow-lg border-4 border-indigo-100"
                    >
                      <img
                        src={selectedCase.image}
                        alt="Test case screenshot"
                        className="w-full h-auto"
                      />
                    </motion.div>
                  )}

                  {/* Status, Priority, Severity Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`${getStatusConfig(selectedCase.status).bgLight} ${getStatusConfig(selectedCase.status).border} border-2 rounded-2xl p-4`}>
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusConfig(selectedCase.status).icon}
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</label>
                      </div>
                      <p className={`text-xl font-bold ${getStatusConfig(selectedCase.status).textColor}`}>
                        {selectedCase.status}
                      </p>
                    </div>
                    <div className={`${getPriorityConfig(selectedCase.priority).bg} ${getPriorityConfig(selectedCase.priority).border} border-2 rounded-2xl p-4`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Flag className="w-5 h-5" />
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Priority</label>
                      </div>
                      <p className={`text-xl font-bold ${getPriorityConfig(selectedCase.priority).text}`}>
                        {selectedCase.priority}
                      </p>
                    </div>
                    <div className={`${getSeverityConfig(selectedCase.severity).bg} ${getSeverityConfig(selectedCase.severity).border} border-2 rounded-2xl p-4`}>
                      <div className="flex items-center gap-2 mb-2">
                        {getSeverityConfig(selectedCase.severity).icon}
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Severity</label>
                      </div>
                      <p className={`text-xl font-bold ${getSeverityConfig(selectedCase.severity).color}`}>
                        {selectedCase.severity}
                      </p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Layers className="w-5 h-5 text-indigo-600" />
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Module Name</label>
                      </div>
                      <p className="text-lg font-semibold text-gray-800">{selectedCase.moduleName}</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Test Case Type</label>
                      </div>
                      <p className="text-lg font-semibold text-gray-800">{selectedCase.testCaseType}</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-5 h-5 text-green-600" />
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Created By</label>
                      </div>
                      <p className="text-lg font-semibold text-gray-800">{selectedCase.user.name}</p>
                      <p className="text-sm text-gray-600 mt-1">{selectedCase.user.email}</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-5 h-5 text-orange-600" />
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Created Date</label>
                      </div>
                      <p className="text-lg font-semibold text-gray-800">
                        {new Date(selectedCase.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(selectedCase.createdAt).toLocaleTimeString()}
                      </p>
                    </motion.div>
                  </div>

                  {/* Test Type */}
                  {selectedCase.testType && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-5 h-5 text-purple-600" />
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Test Type</label>
                      </div>
                      <p className="text-lg font-semibold text-gray-800 mb-2">{selectedCase.testType.testTypeName}</p>
                      <p className="text-sm text-gray-600">{selectedCase.testType.testTypeDesc}</p>
                    </motion.div>
                  )}

                  {/* Description */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-6 h-6 text-indigo-600" />
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Test Case Description</label>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedCase.testCaseDescription}</p>
                  </motion.div>

                  {/* Expected Result */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-green-50 rounded-2xl p-6 border-2 border-green-200"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Expected Result</label>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedCase.expectedResult}</p>
                  </motion.div>

                  {/* Actual Result */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="w-6 h-6 text-blue-600" />
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Actual Result</label>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedCase.actualResult}</p>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-end gap-3 pt-4 border-t-2 border-gray-200"
                  >
                    <button
                      onClick={() => setSelectedCase(null)}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-all"
                    >
                      Close
                    </button>
                    <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg flex items-center gap-2">
                      <Edit className="w-5 h-5" />
                      Edit Test Case
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}