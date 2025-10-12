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

const SkeletonMicroCard = () => (
  <div className="bg-white rounded-lg border p-2 animate-pulse">
    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-5 bg-gray-200 rounded w-1/2"></div>
  </div>
);

// ==================== MAIN DASHBOARD COMPONENT ====================
const Dashboard = ({ selectedProjectId, projects }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const chartRef = useRef(null);

  const selectedProject = projects.find(p => p._id === selectedProjectId);

  // ==================== FETCH DATA ON PROJECT CHANGE ====================
  useEffect(() => {
    if (selectedProjectId) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [selectedProjectId, retryCount]);

  // ==================== API DATA FETCHING FUNCTION ====================
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

  // ==================== PROCESS TEST CASE DATA ====================
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

  // ==================== PROCESS BUG DATA ====================
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

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-1"></div>
              </div>
              <div className="flex gap-3">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </div>
          </div>
        </nav>

        <div className="bg-gray-50 border-b border-gray-200 py-3">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {[...Array(8)].map((_, i) => <SkeletonMicroCard key={i} />)}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SkeletonChart />
            <SkeletonChart />
          </div>
        </div>
      </div>
    );
  }

  // ==================== ERROR STATE ====================
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-red-100"
        >
          <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <FiAlertTriangle className="text-3xl text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to Load</h3>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center mx-auto text-sm font-medium"
          >
            <FiRefreshCw className="mr-2" />
            Retry Loading
          </button>
        </motion.div>
      </div>
    );
  }

  // ==================== NO DATA STATE ====================
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <FiRefreshCw className="inline mr-2" />
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  // ==================== CALCULATE STATISTICS ====================
  const testCaseStats = processTestCaseData();
  const bugStats = processBugData();

  const totalTestCases = dashboardData.testCases.pagination?.totalTestCases || 0;
  const totalBugs = dashboardData.bugs.pagination?.totalBugs || 0;
  const passedTests = testCaseStats.byStatus.find(s => s.name === 'Pass')?.value || 0;
  const failedTests = testCaseStats.byStatus.find(s => s.name === 'Fail')?.value || 0;
  const passRate = totalTestCases > 0 ? ((passedTests / totalTestCases) * 100).toFixed(1) : 0;

  const criticalBugs = bugStats.bySeverity.find(s => s.name === 'Critical')?.value || 0;
  const openBugs = bugStats.byStatus.find(s => s.name === 'Open')?.value || 0;

  const testCasePriorityCounts = {
    Critical: testCaseStats.byPriority.find(p => p.name === 'Critical')?.value || 0,
    High: testCaseStats.byPriority.find(p => p.name === 'High')?.value || 0,
    Medium: testCaseStats.byPriority.find(p => p.name === 'Medium')?.value || 0,
    Low: testCaseStats.byPriority.find(p => p.name === 'Low')?.value || 0,
  };

  const testCaseTypeCounts = {
    Functional: testCaseStats.byType.find(t => t.name === 'Functional')?.value || 0,
    'User-Interface': testCaseStats.byType.find(t => t.name === 'User-Interface')?.value || 0,
    Performance: testCaseStats.byType.find(t => t.name === 'Performance')?.value || 0,
    API: testCaseStats.byType.find(t => t.name === 'API')?.value || 0,
  };

  const bugPriorityCounts = {
    Critical: bugStats.byPriority.find(p => p.name === 'Critical')?.value || 0,
    High: bugStats.byPriority.find(p => p.name === 'High')?.value || 0,
    Medium: bugStats.byPriority.find(p => p.name === 'Medium')?.value || 0,
    Low: bugStats.byPriority.find(p => p.name === 'Low')?.value || 0,
  };

  const bugSeverityCounts = {
    Critical: bugStats.bySeverity.find(s => s.name === 'Critical')?.value || 0,
    High: bugStats.bySeverity.find(s => s.name === 'High')?.value || 0,
    Medium: bugStats.bySeverity.find(s => s.name === 'Medium')?.value || 0,
    Low: bugStats.bySeverity.find(s => s.name === 'Low')?.value || 0,
  };

  const bugStatusCounts = {
    New: bugStats.byStatus.find(s => s.name === 'New')?.value || 0,
    Open: bugStats.byStatus.find(s => s.name === 'Open')?.value || 0,
    'In Progress': bugStats.byStatus.find(s => s.name === 'In Progress')?.value || 0,
    'In Review': bugStats.byStatus.find(s => s.name === 'In Review')?.value || 0,
    Closed: bugStats.byStatus.find(s => s.name === 'Closed')?.value || 0,
    'Re Open': bugStats.byStatus.find(s => s.name === 'Re Open')?.value || 0,
  };

  // ==================== MAIN DASHBOARD RENDER ====================
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* ==================== TOP NAVBAR WITH SUMMARY CARDS ==================== */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {selectedProject?.projectName || 'Project Dashboard'}
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 px-3 py-1.5 flex items-center gap-2">
                <FiCheckSquare className="text-blue-600 text-base" />
                <div className="flex items-center gap-1.5">
                  <p className="text-[9px] font-semibold text-blue-700 uppercase">Test Cases</p>
                  <p className="text-lg font-bold text-blue-900">{totalTestCases}</p>
                  <p className="text-[8px] text-blue-600">Pass: {passRate}%</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 px-3 py-1.5 flex items-center gap-2">
                <FiCheckCircle className="text-green-600 text-base" />
                <div className="flex items-center gap-1.5">
                  <p className="text-[9px] font-semibold text-green-700 uppercase">Passed</p>
                  <p className="text-lg font-bold text-green-900">{passedTests}</p>
                  <p className="text-[8px] text-green-600">Failed: {failedTests}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 px-3 py-1.5 flex items-center gap-2">
                <FaBug className="text-red-600 text-base" />
                <div className="flex items-center gap-1.5">
                  <p className="text-[9px] font-semibold text-red-700 uppercase">Total Bugs</p>
                  <p className="text-lg font-bold text-red-900">{totalBugs}</p>
                  <p className="text-[8px] text-red-600">Open: {openBugs}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 px-3 py-1.5 flex items-center gap-2">
                <FiAlertTriangle className="text-orange-600 text-base" />
                <div className="flex items-center gap-1.5">
                  <p className="text-[9px] font-semibold text-orange-700 uppercase">Critical</p>
                  <p className="text-lg font-bold text-orange-900">{criticalBugs}</p>
                  <p className="text-[8px] text-orange-600">Attention</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* ==================== MICRO STATISTICS BAR ==================== */}
      <div className="bg-gray-50 border-b border-gray-200 py-3">
        <div className="max-w-full mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3"
          >
            <div className="bg-white rounded-lg border border-red-200 p-2 hover:shadow-md transition-shadow">
              <p className="text-[10px] font-semibold text-red-600 mb-1">Critical Bugs</p>
              <p className="text-lg font-bold text-red-700">{bugPriorityCounts.Critical}</p>
            </div>

            <div className="bg-white rounded-lg border border-orange-200 p-2 hover:shadow-md transition-shadow">
              <p className="text-[10px] font-semibold text-orange-600 mb-1">High Bugs</p>
              <p className="text-lg font-bold text-orange-700">{bugPriorityCounts.High}</p>
            </div>

            <div className="bg-white rounded-lg border border-yellow-200 p-2 hover:shadow-md transition-shadow">
              <p className="text-[10px] font-semibold text-yellow-600 mb-1">Medium Bugs</p>
              <p className="text-lg font-bold text-yellow-700">{bugPriorityCounts.Medium}</p>
            </div>

            <div className="bg-white rounded-lg border border-green-200 p-2 hover:shadow-md transition-shadow">
              <p className="text-[10px] font-semibold text-green-600 mb-1">Low Bugs</p>
              <p className="text-lg font-bold text-green-700">{bugPriorityCounts.Low}</p>
            </div>

            <div className="bg-white rounded-lg border border-blue-200 p-2 hover:shadow-md transition-shadow">
              <p className="text-[10px] font-semibold text-blue-600 mb-1">New Bugs</p>
              <p className="text-lg font-bold text-blue-700">{bugStatusCounts.New}</p>
            </div>

            <div className="bg-white rounded-lg border border-indigo-200 p-2 hover:shadow-md transition-shadow">
              <p className="text-[10px] font-semibold text-indigo-600 mb-1">In Progress</p>
              <p className="text-lg font-bold text-indigo-700">{bugStatusCounts['In Progress']}</p>
            </div>

            <div className="bg-white rounded-lg border border-purple-200 p-2 hover:shadow-md transition-shadow">
              <p className="text-[10px] font-semibold text-purple-600 mb-1">In Review</p>
              <p className="text-lg font-bold text-purple-700">{bugStatusCounts['In Review']}</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-2 hover:shadow-md transition-shadow">
              <p className="text-[10px] font-semibold text-gray-600 mb-1">Closed</p>
              <p className="text-lg font-bold text-gray-700">{bugStatusCounts.Closed}</p>
            </div>

            <div className="bg-white rounded-lg border border-red-200 p-2 hover:shadow-md transition-shadow">
              <p className="text-[10px] font-semibold text-red-600 mb-1">Critical Tests</p>
              <p className="text-lg font-bold text-red-700">{testCasePriorityCounts.Critical}</p>
            </div>

            <div className="bg-white rounded-lg border border-orange-200 p-2 hover:shadow-md transition-shadow">
              <p className="text-[10px] font-semibold text-orange-600 mb-1">High Tests</p>
              <p className="text-lg font-bold text-orange-700">{testCasePriorityCounts.High}</p>
            </div>

            <div className="bg-white rounded-lg border border-yellow-200 p-2 hover:shadow-md transition-shadow">
              <p className="text-[10px] font-semibold text-yellow-600 mb-1">Medium Tests</p>
              <p className="text-lg font-bold text-yellow-700">{testCasePriorityCounts.Medium}</p>
            </div>

            <div className="bg-white rounded-lg border border-green-200 p-2 hover:shadow-md transition-shadow">
              <p className="text-[10px] font-semibold text-green-600 mb-1">Low Tests</p>
              <p className="text-lg font-bold text-green-700">{testCasePriorityCounts.Low}</p>
            </div>

            <div className="bg-white rounded-lg border border-blue-200 p-2 hover:shadow-md transition-shadow">
              <p className="text-[10px] font-semibold text-blue-600 mb-1">Functional</p>
              <p className="text-lg font-bold text-blue-700">{testCaseTypeCounts.Functional}</p>
            </div>

            <div className="bg-white rounded-lg border border-indigo-200 p-2 hover:shadow-md transition-shadow">
              <p className="text-[10px] font-semibold text-indigo-600 mb-1">UI Tests</p>
              <p className="text-lg font-bold text-indigo-700">{testCaseTypeCounts['User-Interface']}</p>
            </div>

            <div className="bg-white rounded-lg border border-purple-200 p-2 hover:shadow-md transition-shadow">
              <p className="text-[10px] font-semibold text-purple-600 mb-1">Performance</p>
              <p className="text-lg font-bold text-purple-700">{testCaseTypeCounts.Performance}</p>
            </div>

            <div className="bg-white rounded-lg border border-pink-200 p-2 hover:shadow-md transition-shadow">
              <p className="text-[10px] font-semibold text-pink-600 mb-1">API Tests</p>
              <p className="text-lg font-bold text-pink-700">{testCaseTypeCounts.API}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ==================== MAIN CONTENT AREA - CHARTS ==================== */}
      <div className="max-w-full mx-auto px-1 lg:px-8 py-1" ref={chartRef}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bug Status Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <FaBug className="mr-3 text-red-600" />
                Bug Status Distribution
              </h3>
            </div>
            <div className="h-96">
              {bugStats.byStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bugStats.byStatus}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      angle={-15}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#ef4444" radius={[8, 8, 0, 0]} name="Bugs" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No bug status data available
                </div>
              )}
            </div>
          </motion.div>

          {/* Bug Type Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <FaBug className="mr-3 text-pink-600" />
                Bug Type Distribution
              </h3>
            </div>
            <div className="h-96">
              {bugStats.byType.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bugStats.byType}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      angle={-15}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#ec4899" radius={[8, 8, 0, 0]} name="Bugs" />
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
        <div className="flex  sticky top-0">
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