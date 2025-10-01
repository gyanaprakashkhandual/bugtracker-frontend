'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Clock,
  FileCheck,
  Layers
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function TestCaseDashboard() {
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    fetchTestCases();
  }, []);

  const fetchTestCases = async () => {
    try {
      setLoading(true);
      const projectId = localStorage.getItem('currentProjectId');
      const testTypeId = localStorage.getItem('selectedTestTypeId');
      const token = localStorage.getItem('token');

      if (!projectId || !testTypeId || !token) {
        throw new Error('Missing required credentials. Please login again.');
      }

      const response = await fetch(
        `http://localhost:5000/api/v1/test-case/projects/${projectId}/test-types/${testTypeId}/test-cases`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const data = await response.json();
      setTestCases(data.testCases || []);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: testCases.length,
    new: testCases.filter(tc => tc.status === 'New').length,
    reviewed: testCases.filter(tc => tc.status === 'Reviewed').length,
    solved: testCases.filter(tc => tc.status === 'Solved').length,
    closed: testCases.filter(tc => tc.status === 'Closed').length,
    critical: testCases.filter(tc => tc.severity === 'Critical').length,
    high: testCases.filter(tc => tc.severity === 'High').length,
    medium: testCases.filter(tc => tc.severity === 'Medium').length,
    low: testCases.filter(tc => tc.severity === 'Low').length,
  };

  const statusChartData = {
    labels: ['New', 'Reviewed', 'Solved', 'Closed'],
    datasets: [{
      label: 'Test Cases by Status',
      data: [stats.new, stats.reviewed, stats.solved, stats.closed],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(107, 114, 128, 0.8)',
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(251, 191, 36)',
        'rgb(34, 197, 94)',
        'rgb(107, 114, 128)',
      ],
      borderWidth: 2
    }]
  };

  const severityChartData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [{
      data: [stats.critical, stats.high, stats.medium, stats.low],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(34, 197, 94, 0.8)',
      ],
      borderColor: [
        'rgb(239, 68, 68)',
        'rgb(249, 115, 22)',
        'rgb(251, 191, 36)',
        'rgb(34, 197, 94)',
      ],
      borderWidth: 2
    }]
  };

  const typeDistribution = testCases.reduce((acc, tc) => {
    acc[tc.testCaseType] = (acc[tc.testCaseType] || 0) + 1;
    return acc;
  }, {});

  const typeChartData = {
    labels: Object.keys(typeDistribution),
    datasets: [{
      label: 'Test Cases by Type',
      data: Object.values(typeDistribution),
      backgroundColor: 'rgba(139, 92, 246, 0.8)',
      borderColor: 'rgb(139, 92, 246)',
      borderWidth: 2
    }]
  };

  const priorityDistribution = testCases.reduce((acc, tc) => {
    acc[tc.priority] = (acc[tc.priority] || 0) + 1;
    return acc;
  }, {});

  const priorityChartData = {
    labels: Object.keys(priorityDistribution),
    datasets: [{
      label: 'Priority Distribution',
      data: Object.values(priorityDistribution),
      fill: true,
      backgroundColor: 'rgba(236, 72, 153, 0.2)',
      borderColor: 'rgb(236, 72, 153)',
      tension: 0.4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 },
          color: '#e9d5ff'
        }
      }
    },
    scales: {
      y: {
        ticks: { color: '#e9d5ff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      x: {
        ticks: { color: '#e9d5ff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 },
          color: '#e9d5ff'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/20 border border-red-500 rounded-xl p-6 max-w-md"
        >
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white text-center mb-2">Error Loading Data</h2>
          <p className="text-red-200 text-center">{error}</p>
          <button
            onClick={fetchTestCases}
            className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Test Case Dashboard</h1>
        <p className="text-purple-200">Comprehensive overview of your test cases</p>
      </motion.div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['overview', 'analytics', 'details'].map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeView === view
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white/10 text-purple-200 hover:bg-white/20'
            }`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {activeView === 'overview' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {[
              { label: 'Total Cases', value: stats.total, icon: FileCheck, color: 'purple' },
              { label: 'New', value: stats.new, icon: AlertCircle, color: 'blue' },
              { label: 'Reviewed', value: stats.reviewed, icon: Clock, color: 'yellow' },
              { label: 'Solved', value: stats.solved, icon: CheckCircle2, color: 'green' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-8 h-8 text-${stat.color}-400`} />
                  <span className="text-3xl font-bold text-white">{stat.value}</span>
                </div>
                <p className="text-purple-200 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-bold text-white">Status Distribution</h3>
              </div>
              <div className="h-64">
                <Bar data={statusChartData} options={chartOptions} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-bold text-white">Severity Breakdown</h3>
              </div>
              <div className="h-64">
                <Pie data={severityChartData} options={pieOptions} />
              </div>
            </motion.div>
          </div>
        </>
      )}

      {activeView === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-bold text-white">Test Case Types</h3>
            </div>
            <div className="h-80">
              <Bar data={typeChartData} options={chartOptions} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-bold text-white">Priority Trends</h3>
            </div>
            <div className="h-80">
              <Line data={priorityChartData} options={chartOptions} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <h3 className="text-xl font-bold text-white mb-4">Severity Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Critical', value: stats.critical, color: 'red' },
                { label: 'High', value: stats.high, color: 'orange' },
                { label: 'Medium', value: stats.medium, color: 'yellow' },
                { label: 'Low', value: stats.low, color: 'green' },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className={`text-3xl font-bold text-${item.color}-400 mb-1`}>
                    {item.value}
                  </div>
                  <div className="text-purple-200">{item.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {activeView === 'details' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-600/50">
                <tr>
                  <th className="px-6 py-4 text-left text-white font-semibold">Serial</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Module</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Type</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Severity</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Priority</th>
                </tr>
              </thead>
              <tbody>
                {testCases.map((tc, idx) => (
                  <motion.tr
                    key={tc._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-white/10 hover:bg-white/5"
                  >
                    <td className="px-6 py-4 text-purple-200 font-mono">{tc.serialNumber}</td>
                    <td className="px-6 py-4 text-white">{tc.moduleName}</td>
                    <td className="px-6 py-4 text-purple-200">{tc.testCaseType}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        tc.status === 'Solved' ? 'bg-green-500/20 text-green-300' :
                        tc.status === 'Reviewed' ? 'bg-yellow-500/20 text-yellow-300' :
                        tc.status === 'Closed' ? 'bg-gray-500/20 text-gray-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {tc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        tc.severity === 'Critical' ? 'bg-red-500/20 text-red-300' :
                        tc.severity === 'High' ? 'bg-orange-500/20 text-orange-300' :
                        tc.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                        {tc.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-purple-200">{tc.priority}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {pagination && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-center text-purple-200"
        >
          Page {pagination.currentPage} of {pagination.totalPages} • Total: {pagination.totalTestCases} test cases
        </motion.div>
      )}
    </div>
  );
}