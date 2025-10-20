'use client';

import { useState, useEffect } from 'react';
import { useProject } from '@/app/script/Project.context';
import { motion } from 'framer-motion';
import {
  Bug,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Target,
  Flame,
  Shield
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const { selectedProject } = useProject();
  const projectId = selectedProject?._id;

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    issues: { total: 0, open: 0, closed: 0, onGoing: 0, inReview: 0 },
    bugs: {
      total: 0,
      new: 0,
      open: 0,
      closed: 0,
      inProgress: 0,
      fixed: 0,
      verified: 0,
      rejected: 0,
      reopened: 0,
      byPriority: { low: 0, medium: 0, high: 0, critical: 0 },
      bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      byType: {}
    },
    testCases: {
      total: 0,
      pass: 0,
      fail: 0,
      blocked: 0,
      notExecuted: 0,
      inProgress: 0,
      byPriority: { low: 0, medium: 0, high: 0, critical: 0 },
      byType: {}
    }
  });

  useEffect(() => {
    if (projectId) {
      fetchDashboardData();
    }
  }, [projectId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch Issues
      const issuesRes = await fetch(`http://localhost:5000/api/v1/issue/project/${projectId}`, { headers });
      const issuesData = await issuesRes.json();

      // Fetch Bugs
      const bugsRes = await fetch(`http://localhost:5000/api/v1/bug/projects/${projectId}/bugs`, { headers });
      const bugsData = await bugsRes.json();

      // Fetch Test Cases
      const testCasesRes = await fetch(`http://localhost:5000/api/v1/test-case/projects/${projectId}/test-case`, { headers });
      const testCasesData = await testCasesRes.json();

      // Process Issues
      const issues = issuesData.data || [];
      const issueStats = {
        total: issues.length,
        open: issues.filter(i => i.status === 'Open').length,
        closed: issues.filter(i => i.status === 'Closed').length,
        onGoing: issues.filter(i => i.status === 'On Going').length,
        inReview: issues.filter(i => i.status === 'In Review').length
      };

      // Process Bugs
      const bugs = bugsData.bugs || [];
      const bugStats = {
        total: bugs.length,
        new: bugs.filter(b => b.status === 'New').length,
        open: bugs.filter(b => b.status === 'Open').length,
        closed: bugs.filter(b => b.status === 'Closed').length,
        inProgress: bugs.filter(b => b.status === 'In Progress').length,
        fixed: bugs.filter(b => b.status === 'Fixed').length,
        verified: bugs.filter(b => b.status === 'Verified').length,
        rejected: bugs.filter(b => b.status === 'Rejected').length,
        reopened: bugs.filter(b => b.status === 'Reopened').length,
        byPriority: {
          low: bugs.filter(b => b.priority === 'Low').length,
          medium: bugs.filter(b => b.priority === 'Medium').length,
          high: bugs.filter(b => b.priority === 'High').length,
          critical: bugs.filter(b => b.priority === 'Critical').length
        },
        bySeverity: {
          low: bugs.filter(b => b.severity === 'Low').length,
          medium: bugs.filter(b => b.severity === 'Medium').length,
          high: bugs.filter(b => b.severity === 'High').length,
          critical: bugs.filter(b => b.severity === 'Critical').length
        },
        byType: bugs.reduce((acc, bug) => {
          acc[bug.bugType] = (acc[bug.bugType] || 0) + 1;
          return acc;
        }, {})
      };

      // Process Test Cases
      const testCases = testCasesData.testCases || [];
      const testCaseStats = {
        total: testCases.length,
        pass: testCases.filter(t => t.status === 'Pass').length,
        fail: testCases.filter(t => t.status === 'Fail').length,
        blocked: testCases.filter(t => t.status === 'Blocked').length,
        notExecuted: testCases.filter(t => t.status === 'Not Executed').length,
        inProgress: testCases.filter(t => t.status === 'In Progress').length,
        byPriority: {
          low: testCases.filter(t => t.priority === 'Low').length,
          medium: testCases.filter(t => t.priority === 'Medium').length,
          high: testCases.filter(t => t.priority === 'High').length,
          critical: testCases.filter(t => t.priority === 'Critical').length
        },
        byType: testCases.reduce((acc, test) => {
          acc[test.testCaseType] = (acc[test.testCaseType] || 0) + 1;
          return acc;
        }, {})
      };

      setDashboardData({
        issues: issueStats,
        bugs: bugStats,
        testCases: testCaseStats
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  // Chart data preparation
  const bugStatusData = [
    { name: 'New', value: dashboardData.bugs.new, color: '#3b82f6' },
    { name: 'Open', value: dashboardData.bugs.open, color: '#f59e0b' },
    { name: 'In Progress', value: dashboardData.bugs.inProgress, color: '#8b5cf6' },
    { name: 'Fixed', value: dashboardData.bugs.fixed, color: '#10b981' },
    { name: 'Closed', value: dashboardData.bugs.closed, color: '#6b7280' }
  ];

  const bugPriorityData = [
    { name: 'Low', value: dashboardData.bugs.byPriority.low, color: '#10b981' },
    { name: 'Medium', value: dashboardData.bugs.byPriority.medium, color: '#f59e0b' },
    { name: 'High', value: dashboardData.bugs.byPriority.high, color: '#ef4444' },
    { name: 'Critical', value: dashboardData.bugs.byPriority.critical, color: '#dc2626' }
  ];

  const bugSeverityData = [
    { name: 'Low', value: dashboardData.bugs.bySeverity.low, color: '#10b981' },
    { name: 'Medium', value: dashboardData.bugs.bySeverity.medium, color: '#f59e0b' },
    { name: 'High', value: dashboardData.bugs.bySeverity.high, color: '#ef4444' },
    { name: 'Critical', value: dashboardData.bugs.bySeverity.critical, color: '#dc2626' }
  ];

  const testCaseStatusData = [
    { name: 'Pass', value: dashboardData.testCases.pass, color: '#10b981' },
    { name: 'Fail', value: dashboardData.testCases.fail, color: '#ef4444' },
    { name: 'Blocked', value: dashboardData.testCases.blocked, color: '#f59e0b' },
    { name: 'Not Executed', value: dashboardData.testCases.notExecuted, color: '#6b7280' },
    { name: 'In Progress', value: dashboardData.testCases.inProgress, color: '#3b82f6' }
  ];

  const issueStatusData = [
    { name: 'Open', value: dashboardData.issues.open, color: '#3b82f6' },
    { name: 'On Going', value: dashboardData.issues.onGoing, color: '#8b5cf6' },
    { name: 'In Review', value: dashboardData.issues.inReview, color: '#f59e0b' },
    { name: 'Closed', value: dashboardData.issues.closed, color: '#10b981' }
  ];

  const bugTypeData = Object.entries(dashboardData.bugs.byType).map(([key, value]) => ({
    name: key,
    value: value
  }));

  const testCaseTypeData = Object.entries(dashboardData.testCases.byType).map(([key, value]) => ({
    name: key,
    value: value
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-6">
      <div className="max-w-full mx-auto space-y-6">
        {/* Issues Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Issues Overview</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total Issues"
              value={dashboardData.issues.total}
              icon={<Activity className="w-6 h-6" />}
              gradient="from-blue-500 to-cyan-500"
              delay={0.1}
            />
            <StatCard
              title="Open"
              value={dashboardData.issues.open}
              icon={<Target className="w-6 h-6" />}
              gradient="from-blue-500 to-indigo-500"
              delay={0.15}
            />
            <StatCard
              title="On Going"
              value={dashboardData.issues.onGoing}
              icon={<Clock className="w-6 h-6" />}
              gradient="from-purple-500 to-pink-500"
              delay={0.2}
            />
            <StatCard
              title="In Review"
              value={dashboardData.issues.inReview}
              icon={<ClipboardList className="w-6 h-6" />}
              gradient="from-orange-500 to-amber-500"
              delay={0.25}
            />
            <StatCard
              title="Closed"
              value={dashboardData.issues.closed}
              icon={<CheckCircle2 className="w-6 h-6" />}
              gradient="from-green-500 to-emerald-500"
              delay={0.3}
            />
          </div>
        </motion.div>

        {/* Bugs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Bug className="w-6 h-6 text-red-600 dark:text-red-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bugs Overview</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard
              title="Total Bugs"
              value={dashboardData.bugs.total}
              icon={<Bug className="w-6 h-6" />}
              gradient="from-red-500 to-rose-500"
              delay={0.2}
            />
            <StatCard
              title="New"
              value={dashboardData.bugs.new}
              icon={<Flame className="w-6 h-6" />}
              gradient="from-blue-500 to-cyan-500"
              delay={0.25}
            />
            <StatCard
              title="Open"
              value={dashboardData.bugs.open}
              icon={<AlertTriangle className="w-6 h-6" />}
              gradient="from-orange-500 to-yellow-500"
              delay={0.3}
            />
            <StatCard
              title="In Progress"
              value={dashboardData.bugs.inProgress}
              icon={<Clock className="w-6 h-6" />}
              gradient="from-purple-500 to-indigo-500"
              delay={0.35}
            />
            <StatCard
              title="Fixed"
              value={dashboardData.bugs.fixed}
              icon={<CheckCircle2 className="w-6 h-6" />}
              gradient="from-green-500 to-teal-500"
              delay={0.4}
            />
            <StatCard
              title="Closed"
              value={dashboardData.bugs.closed}
              icon={<XCircle className="w-6 h-6" />}
              gradient="from-gray-500 to-slate-500"
              delay={0.45}
            />
          </div>
        </motion.div>

        {/* Test Cases Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <ClipboardList className="w-6 h-6 text-green-600 dark:text-green-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Test Cases Overview</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard
              title="Total Tests"
              value={dashboardData.testCases.total}
              icon={<ClipboardList className="w-6 h-6" />}
              gradient="from-emerald-500 to-teal-500"
              delay={0.3}
            />
            <StatCard
              title="Pass"
              value={dashboardData.testCases.pass}
              icon={<CheckCircle2 className="w-6 h-6" />}
              gradient="from-green-500 to-emerald-500"
              delay={0.35}
            />
            <StatCard
              title="Fail"
              value={dashboardData.testCases.fail}
              icon={<XCircle className="w-6 h-6" />}
              gradient="from-red-500 to-pink-500"
              delay={0.4}
            />
            <StatCard
              title="Blocked"
              value={dashboardData.testCases.blocked}
              icon={<Shield className="w-6 h-6" />}
              gradient="from-orange-500 to-amber-500"
              delay={0.45}
            />
            <StatCard
              title="Not Executed"
              value={dashboardData.testCases.notExecuted}
              icon={<Calendar className="w-6 h-6" />}
              gradient="from-gray-500 to-zinc-500"
              delay={0.5}
            />
            <StatCard
              title="In Progress"
              value={dashboardData.testCases.inProgress}
              icon={<TrendingUp className="w-6 h-6" />}
              gradient="from-blue-500 to-indigo-500"
              delay={0.55}
            />
          </div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bug Status Distribution */}
          <ChartCard title="Bug Status Distribution" icon={<Bug className="w-5 h-5" />} delay={0.4}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bugStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {bugStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Bug Priority Distribution */}
          <ChartCard title="Bug Priority Distribution" icon={<Flame className="w-5 h-5" />} delay={0.45}>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={bugPriorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {bugPriorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Bug Severity Distribution */}
          <ChartCard title="Bug Severity Distribution" icon={<Shield className="w-5 h-5" />} delay={0.5}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={bugSeverityData}>
                <defs>
                  <linearGradient id="severityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#severityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Test Case Status Distribution */}
          <ChartCard title="Test Case Status Distribution" icon={<ClipboardList className="w-5 h-5" />} delay={0.55}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={testCaseStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {testCaseStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Issue Status Distribution */}
          <ChartCard title="Issue Status Distribution" icon={<AlertTriangle className="w-5 h-5" />} delay={0.6}>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={issueStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {issueStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Bug Type Distribution */}
          {bugTypeData.length > 0 && (
            <ChartCard title="Bug Type Distribution" icon={<PieChart className="w-5 h-5" />} delay={0.65}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bugTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, gradient, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className="bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-800 group"
  >
    <div className={`h-1.5 bg-gradient-to-r ${gradient}`}></div>
    <div className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 bg-gradient-to-br ${gradient} rounded-lg text-white group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </motion.div>
);

// Chart Card Component
const ChartCard = ({ title, icon, children, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
    </div>
    {children}
  </motion.div>
);

export default Dashboard;