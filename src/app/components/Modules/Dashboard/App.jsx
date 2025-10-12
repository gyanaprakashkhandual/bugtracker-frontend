'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Folder, FileCode, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiCheckSquare, FiBarChart2, FiPieChart, FiAlertTriangle, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { FaBug } from 'react-icons/fa';
import { FiTrendingUp, FiActivity } from 'react-icons/fi';


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
const API_BASE = 'http://localhost:5000/api/v1';

// Skeleton Components
const SkeletonLoader = ({ count = 3 }) => (
  <div className="space-y-2">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-gray-100 rounded-md p-3 animate-pulse">
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>
    ))}
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-sm border p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      </div>
      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
    </div>
  </div>
);

const SkeletonChart = () => (
  <div className="bg-white rounded-xl shadow-sm border p-6 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="h-80 bg-gray-100 rounded"></div>
  </div>
);

const SkeletonTestTypeCard = () => (
  <div className="bg-gray-50 rounded-lg p-4 border animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
    <div className="flex justify-between">
      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
    </div>
  </div>
);

// Hooks
const useProjects = (searchQuery = '', page = 1, limit = 50) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProjects: 0,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    fetchProjects();
  }, [searchQuery, page]);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/project?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status}`);
      }

      const data = await response.json();
      setProjects(data.projects || []);
      setPagination(data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalProjects: 0,
        hasNext: false,
        hasPrev: false
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectById = async (projectId) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/project/${projectId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch project: ${response.status}`);
      }

      const data = await response.json();
      return data.project;
    } catch (err) {
      throw err;
    }
  };

  const selectProject = (projectId) => {
    setSelectedProjectId(projectId);
  };

  const getSelectedProject = () => {
    return projects.find(p => p._id === selectedProjectId);
  };

  return {
    projects,
    loading,
    error,
    selectedProjectId,
    pagination,
    selectProject,
    getSelectedProject,
    fetchProjectById,
    refetch: fetchProjects
  };
};

const useTestTypes = (projectId, searchQuery = '', page = 1, limit = 50) => {
  const [testTypes, setTestTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTestTypeId, setSelectedTestTypeId] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTestTypes: 0,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    if (projectId) {
      fetchTestTypes();
    } else {
      setTestTypes([]);
      setSelectedTestTypeId(null);
    }
  }, [projectId, searchQuery, page]);

  const fetchTestTypes = async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_BASE}/test-type/projects/${projectId}/test-types?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch test types: ${response.status}`);
      }

      const data = await response.json();
      setTestTypes(data.testTypes || []);
      setPagination(data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalTestTypes: 0,
        hasNext: false,
        hasPrev: false
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestTypeById = async (testTypeId) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/test-types/${testTypeId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch test type: ${response.status}`);
      }

      const data = await response.json();
      return data.testType;
    } catch (err) {
      throw err;
    }
  };

  const selectTestType = (testTypeId) => {
    setSelectedTestTypeId(testTypeId);
  };

  const getSelectedTestType = () => {
    return testTypes.find(t => t._id === selectedTestTypeId);
  };

  return {
    testTypes,
    loading,
    error,
    selectedTestTypeId,
    pagination,
    selectTestType,
    getSelectedTestType,
    fetchTestTypeById,
    refetch: fetchTestTypes
  };
};




const Dashboard = ({ selectedProjectId, projects }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const chartRef = useRef(null);

  const selectedProject = projects.find(p => p._id === selectedProjectId);

  useEffect(() => {
    if (selectedProjectId) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [selectedProjectId, retryCount]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      if (!selectedProjectId) {
        throw new Error('No project selected');
      }

      const testCasesUrl = `http://localhost:5000/api/v1/test-case/projects/${selectedProjectId}/test-case`;
      const bugsUrl = `http://localhost:5000/api/v1/bug/projects/${selectedProjectId}/bugs`;

      const [testCasesRes, bugsRes] = await Promise.all([
        fetch(testCasesUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(bugsUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!testCasesRes.ok) {
        throw new Error(`Test Cases API failed: ${testCasesRes.status}`);
      }

      if (!bugsRes.ok) {
        throw new Error(`Bugs API failed: ${bugsRes.status}`);
      }

      const testCasesData = await testCasesRes.json();
      const bugsData = await bugsRes.json();

      setDashboardData({
        testCases: testCasesData,
        bugs: bugsData
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const processTestCaseData = () => {
    if (!dashboardData?.testCases?.testCases) return { byPriority: [], byStatus: [], byType: [] };

    const testCases = dashboardData.testCases.testCases;

    const priorityCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    const statusCounts = { Pass: 0, Fail: 0 };
    const typeCounts = { Functional: 0, 'User-Interface': 0, Performance: 0, API: 0, Database: 0, Security: 0, Others: 0 };

    testCases.forEach(tc => {
      if (tc.priority) priorityCounts[tc.priority] = (priorityCounts[tc.priority] || 0) + 1;
      if (tc.status) statusCounts[tc.status] = (statusCounts[tc.status] || 0) + 1;
      if (tc.testCaseType) typeCounts[tc.testCaseType] = (typeCounts[tc.testCaseType] || 0) + 1;
    });

    return {
      byPriority: Object.entries(priorityCounts).map(([name, value]) => ({ name, value })),
      byStatus: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
      byType: Object.entries(typeCounts).map(([name, value]) => ({ name, value }))
    };
  };

  const processBugData = () => {
    if (!dashboardData?.bugs?.bugs) return { byPriority: [], bySeverity: [], byStatus: [], byType: [] };

    const bugs = dashboardData.bugs.bugs;

    const priorityCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    const severityCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    const statusCounts = { New: 0, Open: 0, 'In Progress': 0, 'In Review': 0, Closed: 0, 'Re Open': 0 };
    const typeCounts = { Functional: 0, 'User-Interface': 0, Security: 0, Database: 0, Performance: 0 };

    bugs.forEach(bug => {
      if (bug.priority) priorityCounts[bug.priority] = (priorityCounts[bug.priority] || 0) + 1;
      if (bug.severity) severityCounts[bug.severity] = (severityCounts[bug.severity] || 0) + 1;
      if (bug.status) statusCounts[bug.status] = (statusCounts[bug.status] || 0) + 1;
      if (bug.bugType) typeCounts[bug.bugType] = (typeCounts[bug.bugType] || 0) + 1;
    });

    return {
      byPriority: Object.entries(priorityCounts).map(([name, value]) => ({ name, value })),
      bySeverity: Object.entries(severityCounts).map(([name, value]) => ({ name, value })),
      byStatus: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
      byType: Object.entries(typeCounts).map(([name, value]) => ({ name, value }))
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <nav className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex-1 animate-pulse">
                <div className="h-7 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SkeletonChart />
            <SkeletonChart />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-red-100"
        >
          <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <FiAlertTriangle className="text-4xl text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Failed to Load</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center mx-auto font-medium"
          >
            <FiRefreshCw className="mr-2" />
            Retry Loading
          </button>
        </motion.div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <FiAlertTriangle className="text-4xl text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiRefreshCw className="inline mr-2" />
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  const testCaseStats = processTestCaseData();
  const bugStats = processBugData();

  const totalTestCases = dashboardData.testCases.pagination?.totalTestCases || 0;
  const totalBugs = dashboardData.bugs.pagination?.totalBugs || 0;
  const passedTests = testCaseStats.byStatus.find(s => s.name === 'Pass')?.value || 0;
  const failedTests = testCaseStats.byStatus.find(s => s.name === 'Fail')?.value || 0;
  const passRate = totalTestCases > 0 ? ((passedTests / totalTestCases) * 100).toFixed(1) : 0;

  const criticalBugs = bugStats.bySeverity.find(s => s.name === 'Critical')?.value || 0;
  const openBugs = bugStats.byStatus.find(s => s.name === 'Open')?.value || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <nav className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1"
            >
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {selectedProject?.projectName || 'Project Dashboard'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {selectedProject?.projectDesc || 'Real-time analytics and insights'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-6"
            >
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Test Cases</p>
                <p className="text-2xl font-bold text-blue-600">{totalTestCases}</p>
              </div>
              <div className="h-12 w-px bg-gray-300"></div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Bugs</p>
                <p className="text-2xl font-bold text-red-600">{totalBugs}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10" ref={chartRef}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-50 rounded-xl p-3">
                <FiCheckSquare className="text-3xl text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Total
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Test Cases</p>
            <p className="text-4xl font-bold text-gray-900">{totalTestCases}</p>
            <p className="text-xs text-gray-500 mt-2">Pass Rate: {passRate}%</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-50 rounded-xl p-3">
                <FiCheckCircle className="text-3xl text-green-600" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                Passed
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Passed Tests</p>
            <p className="text-4xl font-bold text-gray-900">{passedTests}</p>
            <p className="text-xs text-gray-500 mt-2">Failed: {failedTests}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-50 rounded-xl p-3">
                <FaBug className="text-3xl text-red-600" />
              </div>
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                Total
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Bugs</p>
            <p className="text-4xl font-bold text-gray-900">{totalBugs}</p>
            <p className="text-xs text-gray-500 mt-2">Open: {openBugs}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-50 rounded-xl p-3">
                <FiAlertTriangle className="text-3xl text-orange-600" />
              </div>
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                Critical
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Critical Bugs</p>
            <p className="text-4xl font-bold text-gray-900">{criticalBugs}</p>
            <p className="text-xs text-gray-500 mt-2">Requires attention</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <FiBarChart2 className="mr-3 text-blue-600" />
                Test Case Priority
              </h3>
              <FiTrendingUp className="text-gray-400" />
            </div>
            <div className="h-80">
              {testCaseStats.byPriority.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={testCaseStats.byPriority}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No priority data available
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <FiBarChart2 className="mr-3 text-green-600" />
                Test Case Status
              </h3>
              <FiActivity className="text-gray-400" />
            </div>
            <div className="h-80">
              {testCaseStats.byStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={testCaseStats.byStatus}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                    <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No status data available
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-10 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <FiPieChart className="mr-3 text-purple-600" />
              Test Case Types Distribution
            </h3>
          </div>
          <div className="h-96">
            {testCaseStats.byType.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={testCaseStats.byType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} angle={-15} textAnchor="end" height={80} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No test type data available
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <FaBug className="mr-3 text-red-600" />
                Bug Status Distribution
              </h3>
            </div>
            <div className="h-80">
              {bugStats.byStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bugStats.byStatus}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} angle={-15} textAnchor="end" height={70} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                    <Bar dataKey="value" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No bug status data available
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <FiAlertTriangle className="mr-3 text-orange-600" />
                Bug Severity Levels
              </h3>
            </div>
            <div className="h-80">
              {bugStats.bySeverity.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bugStats.bySeverity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                    <Bar dataKey="value" fill="#f97316" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No severity data available
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <FiBarChart2 className="mr-3 text-indigo-600" />
                Bug Priority Levels
              </h3>
            </div>
            <div className="h-80">
              {bugStats.byPriority.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bugStats.byPriority}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                    <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No priority data available
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <FaBug className="mr-3 text-pink-600" />
                Bug Types Distribution
              </h3>
            </div>
            <div className="h-80">
              {bugStats.byType.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bugStats.byType}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} angle={-15} textAnchor="end" height={70} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                    <Bar dataKey="value" fill="#ec4899" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No bug type data available
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 rounded-xl shadow-xl border border-gray-200">
        <p className="font-semibold text-gray-900 mb-1">{label}</p>
        <p className="text-sm text-gray-600">
          Count: <span className="font-bold text-blue-600">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

// TestType Dashboard (Placeholder)
const TestTypeDashboard = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900">Test Type Details</h2>
      <p className="text-gray-600 mt-2">Test type dashboard content</p>
    </div>
  );
};

// Main Sidebar Component
export default function DashboardSidebar() {
  const [projectSearch, setProjectSearch] = useState('');
  const [testTypeSearch, setTestTypeSearch] = useState('');
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [showTestTypeDetail, setShowTestTypeDetail] = useState(false);
  const [projectPage, setProjectPage] = useState(1);
  const [testTypePage, setTestTypePage] = useState(1);

  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    selectedProjectId,
    pagination: projectPagination,
    selectProject,
    getSelectedProject,
    fetchProjectById
  } = useProjects(projectSearch, projectPage);

  const {
    testTypes,
    loading: testTypesLoading,
    error: testTypesError,
    selectedTestTypeId,
    pagination: testTypePagination,
    selectTestType,
    getSelectedTestType,
    fetchTestTypeById
  } = useTestTypes(selectedProjectId, testTypeSearch, testTypePage);

  const handleProjectClick = (projectId) => {
    selectProject(projectId);
    setTestTypePage(1);
    setShowProjectDetail(true);
    setShowTestTypeDetail(false);
  };

  const handleProjectDetailClick = async (e, projectId) => {
    e.stopPropagation();
    selectProject(projectId);
    setShowProjectDetail(true);
    setShowTestTypeDetail(false);

    try {
      await fetchProjectById(projectId);
    } catch (error) {
    }
  };

  const handleTestTypeClick = async (testTypeId) => {
    selectTestType(testTypeId);
    setShowTestTypeDetail(true);
    setShowProjectDetail(false);

    try {
      await fetchTestTypeById(testTypeId);
    } catch (error) {
    }
  };

  const selectedProject = getSelectedProject();
  const selectedTestType = getSelectedTestType();

  return (
    <div className="sidebar-scrollbar">
      <div className="max-w-full mx-auto">
        <div className="flex gap-6">
          <div className="flex flex-col border-r border-gray-200">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200"
              style={{ minWidth: '200px', maxWidth: '200px', minHeight: '300px', maxHeight: '300px' }}
            >
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wide">
                  <Folder className="w-4 h-4 text-blue-600" />
                  Projects
                </h2>
              </div>

              <div className="sidebar-scrollbar overflow-y-auto p-3" style={{ maxHeight: '220px' }}>
                {projectsLoading && projects.length === 0 ? (
                  <SkeletonLoader count={4} />
                ) : projectsError ? (
                  <div className="text-center py-8 text-red-500 text-xs">{projectsError}</div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs">No projects found</div>
                ) : (
                  <div className="space-y-1.5">
                    {projects.map((project) => (
                      <motion.div
                        key={project._id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleProjectClick(project._id)}
                        onDoubleClick={(e) => handleProjectDetailClick(e, project._id)}
                        className={`p-2.5 rounded-md cursor-pointer transition-all ${selectedProjectId === project._id
                          ? 'bg-blue-50 border border-blue-500 shadow-sm'
                          : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate text-xs">{project.projectName}</h3>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {projectPagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => setProjectPage(prev => Math.max(1, prev - 1))}
                    disabled={!projectPagination.hasPrev}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                  <span className="text-xs text-gray-600 font-medium">
                    {projectPagination.currentPage} / {projectPagination.totalPages}
                  </span>
                  <button
                    onClick={() => setProjectPage(prev => prev + 1)}
                    disabled={!projectPagination.hasNext}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border-t-0 border border-gray-200 flex flex-col"
              style={{
                minWidth: '200px',
                maxWidth: '200px',
                height: '359px',
                overflow: 'hidden'
              }}
            >
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wide">
                  <FileCode className="w-4 h-4 text-indigo-600" />
                  Test Types
                </h2>
              </div>

              {!selectedProjectId ? (
                <div className="flex items-center justify-center flex-1 text-gray-400 text-center px-4 text-xs">
                  Select a project to view test types
                </div>
              ) : (
                <>
                  <div className="relative p-3 border-b border-gray-200">
                    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={testTypeSearch}
                      onChange={(e) => setTestTypeSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="sidebar-scrollbar overflow-y-auto flex-1 p-3">
                    {testTypesLoading ? (
                      <SkeletonLoader count={5} />
                    ) : testTypesError ? (
                      <div className="text-center py-8 text-red-500 text-xs">{testTypesError}</div>
                    ) : testTypes.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-xs">No test types found</div>
                    ) : (
                      <div className="space-y-1.5">
                        {testTypes.map((testType) => (
                          <motion.div
                            key={testType._id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleTestTypeClick(testType._id)}
                            className={`p-2.5 rounded-md cursor-pointer transition-all ${selectedTestTypeId === testType._id
                              ? 'bg-indigo-50 border border-indigo-500 shadow-sm'
                              : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                              }`}
                          >
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate text-xs">{testType.testTypeName}</h3>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {testTypePagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 bg-gray-50">
                      <button
                        onClick={() => setTestTypePage(prev => Math.max(1, prev - 1))}
                        disabled={!testTypePagination.hasPrev}
                        className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                      <span className="text-xs text-gray-600 font-medium">
                        {testTypePagination.currentPage} / {testTypePagination.totalPages}
                      </span>
                      <button
                        onClick={() => setTestTypePage(prev => prev + 1)}
                        disabled={!testTypePagination.hasNext}
                        className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>

          <div className="flex-1">
            <AnimatePresence mode="wait">
              {showProjectDetail && selectedProject && (
                <motion.div
                  key="project-detail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white border border-gray-200 shadow-sm"
                >
                  <Dashboard selectedProjectId={selectedProjectId} projects={projects} />
                </motion.div>
              )}

              {showTestTypeDetail && selectedTestType && (
                <motion.div
                  key="testtype-detail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white border border-gray-200 shadow-sm"
                >
                  <TestTypeDashboard />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}