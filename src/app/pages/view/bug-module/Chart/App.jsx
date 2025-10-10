// app/dashboard/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiClock,
  FiTrendingUp,
  FiPieChart,
  FiActivity,
  FiUsers
} from 'react-icons/fi';
import BugStats from './BugCharts';
import BugList from './BugList';
import RecentBugs from './RecentBug';
import TestTypeStats from './TestTypeStats';
import { FaBug } from 'react-icons/fa';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchBugStats();
  }, []);

  const fetchBugStats = async () => {
    try {
      const projectId = localStorage.getItem("currentProjectId");
      const testTypeId = localStorage.getItem("selectedTestTypeId");
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/v1/bug/projects/${projectId}/test-types/${testTypeId}/bugs/stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching bug stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, color, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl p-6 shadow-lg border-l-4 ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`text-2xl ${color.replace('border-', 'text-')}`} />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bug Tracking Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor and manage your project bugs</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={FaBug}
          title="Total Bugs"
          value={stats?.totalBugs || 0}
          color="border-blue-600"
          subtitle="All active bugs"
        />
        <StatCard
          icon={FiAlertTriangle}
          title="Critical"
          value={stats?.bugsBySeverity?.find(b => b._id === 'critical')?.count || 0}
          color="border-red-600"
          subtitle="High severity issues"
        />
        <StatCard
          icon={FiCheckCircle}
          title="Resolved"
          value={stats?.bugsByStatus?.find(b => b._id === 'resolved')?.count || 0}
          color="border-green-600"
          subtitle="Completed fixes"
        />
        <StatCard
          icon={FiClock}
          title="Pending"
          value={stats?.bugsByStatus?.find(b => b._id === 'pending')?.count || 0}
          color="border-yellow-600"
          subtitle="Awaiting action"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-200 rounded-lg p-1">
          {['overview', 'bugs', 'analytics', 'test-types'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BugStats stats={stats} />
            </div>
            <div>
              <RecentBugs bugs={stats?.recentBugs} />
            </div>
          </div>
        )}

        {activeTab === 'bugs' && (
          <BugList />
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BugStats stats={stats} detailed />
            <TestTypeStats />
          </div>
        )}

        {activeTab === 'test-types' && (
          <TestTypeStats detailed />
        )}
      </div>
    </div>
  );
}