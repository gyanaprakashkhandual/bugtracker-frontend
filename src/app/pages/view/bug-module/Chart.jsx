"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { Bug, AlertCircle, CheckCircle, Clock, TrendingUp, FileText, Calendar } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function BugStatisticsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBugStats();
  }, []);

  const fetchBugStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get credentials from localStorage with Next.js safety check
      const projectId = typeof window !== 'undefined' ? localStorage.getItem("currentProjectId") : null;
      const testTypeId = typeof window !== 'undefined' ? localStorage.getItem("selectedTestTypeId") : null;
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

      if (!projectId || !testTypeId || !token) {
        throw new Error("Missing required credentials. Please login and select a project.");
      }

      const response = await fetch(
        `http://localhost:5000/api/v1/bug/projects/${projectId}/test-types/${testTypeId}/bugs/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch bug statistics");
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      New: "#ef4444",
      "In Review": "#f59e0b",
      "Re Open": "#8b5cf6",
      Resolved: "#10b981",
      Closed: "#6b7280",
    };
    return colors[status] || "#6b7280";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Critical: "#dc2626",
      High: "#ea580c",
      Medium: "#f59e0b",
      Low: "#84cc16",
    };
    return colors[priority] || "#6b7280";
  };

  const getSeverityColor = (severity) => {
    const colors = {
      Critical: "#991b1b",
      High: "#c2410c",
      Medium: "#ca8a04",
      Low: "#65a30d",
    };
    return colors[severity] || "#6b7280";
  };

  const createChartData = (dataArray, labelKey, colorFunc) => {
    const labels = dataArray.map((item) => item[labelKey]);
    const counts = dataArray.map((item) => item.count);
    const colors = dataArray.map((item) => colorFunc(item[labelKey]));

    return {
      labels,
      datasets: [
        {
          data: counts,
          backgroundColor: colors,
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
      },
    },
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading bug statistics...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Error</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={fetchBugStats}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Bug className="w-10 h-10 text-blue-600" />
            Bug Statistics Dashboard
          </h1>
          <p className="text-gray-600">Comprehensive overview of all reported bugs</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Total Bugs</p>
                <p className="text-3xl font-bold text-gray-800">{stats?.totalBugs || 0}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Bug className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-600"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Critical</p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats?.bugsByPriority?.find((b) => b.priority === "Critical")?.count || 0}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-600"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">In Review</p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats?.bugsByStatus?.find((b) => b.status === "In Review")?.count || 0}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Resolved</p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats?.bugsByStatus?.find((b) => b.status === "Resolved")?.count || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Status Chart */}
          {stats?.bugsByStatus && stats.bugsByStatus.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Bugs by Status
              </h2>
              <div className="h-80">
                <Doughnut data={createChartData(stats.bugsByStatus, "status", getStatusColor)} options={chartOptions} />
              </div>
            </motion.div>
          )}

          {/* Priority Chart */}
          {stats?.bugsByPriority && stats.bugsByPriority.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
                Bugs by Priority
              </h2>
              <div className="h-80">
                <Doughnut data={createChartData(stats.bugsByPriority, "priority", getPriorityColor)} options={chartOptions} />
              </div>
            </motion.div>
          )}

          {/* Severity Chart */}
          {stats?.bugsBySeverity && stats.bugsBySeverity.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-600" />
                Bugs by Severity
              </h2>
              <div className="h-80">
                <Doughnut data={createChartData(stats.bugsBySeverity, "severity", getSeverityColor)} options={chartOptions} />
              </div>
            </motion.div>
          )}

          {/* Type Chart */}
          {stats?.bugsByType && stats.bugsByType.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Bug className="w-6 h-6 text-indigo-600" />
                Bugs by Type
              </h2>
              <div className="h-80">
                <Doughnut
                  data={{
                    labels: stats.bugsByType.map((item) => item.bugType),
                    datasets: [
                      {
                        data: stats.bugsByType.map((item) => item.count),
                        backgroundColor: ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"],
                        borderColor: "#ffffff",
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={chartOptions}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Recent Bugs */}
        {stats?.recentBugs && stats.recentBugs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Calendar className="w-7 h-7 text-blue-600" />
              Recent Bugs
            </h2>
            <div className="space-y-4">
              {stats.recentBugs.map((bug, index) => (
                <motion.div
                  key={bug._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                          {bug.serialNumber}
                        </span>
                        <span
                          className="text-xs font-semibold px-3 py-1 rounded-full text-white"
                          style={{ backgroundColor: getStatusColor(bug.status) }}
                        >
                          {bug.status}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-800 text-lg mb-1">{bug.moduleName}</h3>
                      {bug.bugDesc && bug.bugDesc !== "No Bug Description" && (
                        <p className="text-gray-600 text-sm mb-2">{bug.bugDesc}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span
                          className="text-xs font-medium px-2 py-1 rounded text-white"
                          style={{ backgroundColor: getPriorityColor(bug.priority) }}
                        >
                          Priority: {bug.priority}
                        </span>
                        <span
                          className="text-xs font-medium px-2 py-1 rounded text-white"
                          style={{ backgroundColor: getSeverityColor(bug.severity) }}
                        >
                          Severity: {bug.severity}
                        </span>
                        <span className="text-xs font-medium px-2 py-1 rounded bg-gray-200 text-gray-700">
                          {bug.bugType}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(bug.createdAt)}</span>
                        <span className="mx-2">•</span>
                        <span>By {bug.user.name}</span>
                      </div>
                    </div>
                    {bug.image && bug.image !== "No Image provided" && (
                      <div className="md:w-32 md:h-32 w-full h-48 flex-shrink-0">
                        <img
                          src={bug.image}
                          alt="Bug screenshot"
                          className="w-full h-full object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}