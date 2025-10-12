// app/components/project/Dashboard.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useProjects } from '@/app/hooks/project.hook';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import {
  FiCheckSquare, FiBarChart2, FiPieChart,
  FiAlertTriangle, FiCheckCircle, FiXCircle, FiClock,
  FiRefreshCw
} from 'react-icons/fi';
import { FaBug } from 'react-icons/fa';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Skeleton Loader Components
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

const Dashboard = () => {
  const { projects, selectedProjectId } = useProjects();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const chartRef = useRef(null);

  const selectedProject = projects.find(p => p._id === selectedProjectId);

  useEffect(() => {
    if (selectedProjectId) {
      console.log('🔄 Dashboard: Selected Project ID changed:', selectedProjectId);
      fetchDashboardData();
    } else {
      console.log('❌ Dashboard: No selectedProjectId available');
      setLoading(false);
    }
  }, [selectedProjectId, retryCount]);

  useEffect(() => {
    if (chartRef.current && dashboardData) {
      gsap.fromTo(chartRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );
    }
  }, [dashboardData]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      console.log('🔑 Token available:', !!token);

      if (!token) {
        throw new Error('No authentication token found');
      }

      if (!selectedProjectId) {
        throw new Error('No project selected');
      }

      console.log('📡 Fetching data for project:', selectedProjectId);

      const testCasesUrl = `http://localhost:5000/api/v1/test-case/project/${selectedProjectId}`;
      const bugsUrl = `http://localhost:5000/api/v1/bug/project/${selectedProjectId}`;

      console.log('🔗 Test Cases URL:', testCasesUrl);
      console.log('🔗 Bugs URL:', bugsUrl);

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

      console.log('📊 Test Cases Response status:', testCasesRes.status);
      console.log('📊 Bugs Response status:', bugsRes.status);

      if (!testCasesRes.ok) {
        throw new Error(`Test Cases API failed: ${testCasesRes.status} ${testCasesRes.statusText}`);
      }

      if (!bugsRes.ok) {
        throw new Error(`Bugs API failed: ${bugsRes.status} ${bugsRes.statusText}`);
      }

      const testCasesData = await testCasesRes.json();
      const bugsData = await bugsRes.json();

      console.log('✅ Test Cases Data:', testCasesData);
      console.log('✅ Bugs Data:', bugsData);

      setDashboardData({
        testCases: testCasesData,
        bugs: bugsData
      });

    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Debug information
  console.log('📊 Dashboard State:', {
    loading,
    error,
    selectedProjectId,
    hasProjects: projects?.length,
    selectedProject,
    dashboardData: dashboardData ? 'Data loaded' : 'No data'
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Navigation Header Skeleton */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex-1 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="flex space-x-4 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <SkeletonChart />
            <SkeletonChart />
          </div>

          {/* Test Types Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <SkeletonTestTypeCard />
              <SkeletonTestTypeCard />
              <SkeletonTestTypeCard />
              <SkeletonTestTypeCard />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-6"
        >
          <FiAlertTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-3 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg mb-4">
            <p>🔍 Debug Information:</p>
            <p>• Project ID: {selectedProjectId || 'Not selected'}</p>
            <p>• Projects loaded: {projects?.length || 0}</p>
            <p>• Token: {localStorage.getItem('token') ? 'Available' : 'Missing'}</p>
          </div>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <FiAlertTriangle className="text-4xl text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600 mb-4">Unable to load dashboard data. Please try again.</p>
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

  // Prepare chart data with fallbacks
  const testCaseStatusData = dashboardData.testCases.statistics?.byStatus ?
    Object.entries(dashboardData.testCases.statistics.byStatus).map(([name, value]) => ({
      name,
      value
    })) : [];

  const bugStatusData = dashboardData.bugs.statistics ?
    Object.entries(dashboardData.bugs.statistics).map(([name, value]) => ({
      name,
      value
    })) : [];

  const testCaseTypeData = dashboardData.testCases.statistics?.byType ?
    Object.entries(dashboardData.testCases.statistics.byType).map(([name, value]) => ({
      name,
      value
    })) : [];

  const totalTestCases = dashboardData.testCases.pagination?.totalTestCases || 0;
  const totalBugs = dashboardData.bugs.pagination?.totalBugs || 0;
  const testTypesCount = dashboardData.testCases.filters?.availableTestTypes?.length || 0;
  const passCount = dashboardData.testCases.statistics?.byStatus?.Pass || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1"
            >
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedProject?.projectName || 'Project Dashboard'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {selectedProject?.projectDesc || 'Project overview and analytics'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Test Cases</p>
                <p className="text-2xl font-bold text-blue-600">{totalTestCases}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Bugs</p>
                <p className="text-2xl font-bold text-red-600">{totalBugs}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" ref={chartRef}>
        {/* Stats Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Test Case Stats */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Test Cases</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalTestCases}</p>
              </div>
              <FiCheckSquare className="text-4xl text-blue-600" />
            </div>
          </div>

          {/* Bug Stats */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bugs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalBugs}</p>
              </div>
              <FaBug className="text-4xl text-red-600" />
            </div>
          </div>

          {/* Test Types */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Test Types</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{testTypesCount}</p>
              </div>
              <FiPieChart className="text-4xl text-green-600" />
            </div>
          </div>

          {/* Success Rate */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Passed Tests</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{passCount}</p>
              </div>
              <FiCheckCircle className="text-4xl text-green-600" />
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Test Case Status Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiBarChart2 className="mr-2 text-blue-600" />
              Test Case Status Distribution
            </h3>
            <div className="h-80">
              {testCaseStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={testCaseStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#0088FE" name="Test Cases" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No test case data available
                </div>
              )}
            </div>
          </motion.div>

          {/* Bug Status Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaBug className="mr-2 text-red-600" />
              Bug Status Distribution
            </h3>
            <div className="h-80">
              {bugStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bugStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {bugStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No bug data available
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Test Types Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <FiPieChart className="mr-2 text-purple-600" />
            Test Types Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {dashboardData.testCases.filters?.availableTestTypes?.map((testType, index) => {
              const testCaseCount = dashboardData.testCases.testCases?.filter(tc =>
                tc.testType?._id === testType._id
              ).length || 0;

              const bugCount = dashboardData.bugs.bugs?.filter(bug =>
                bug.testType?._id === testType._id
              ).length || 0;

              return (
                <motion.div
                  key={testType._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-shadow"
                >
                  <h4 className="font-medium text-gray-900 text-sm mb-2 truncate">
                    {testType.testTypeName}
                  </h4>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {testType.testTypeDesc || 'No description'}
                  </p>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-600 font-medium">
                      {testCaseCount} cases
                    </span>
                    <span className="text-red-600 font-medium">
                      {bugCount} bugs
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Debug Information Panel (can be removed in production) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-8"
        >
          <h4 className="text-sm font-semibold text-yellow-800 mb-2">Debug Information</h4>
          <div className="text-xs text-yellow-700 space-y-1">
            <p>• Test Cases: {totalTestCases}</p>
            <p>• Bugs: {totalBugs}</p>
            <p>• Test Types: {testTypesCount}</p>
            <p>• Test Case Status Data Points: {testCaseStatusData.length}</p>
            <p>• Bug Status Data Points: {bugStatusData.length}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;