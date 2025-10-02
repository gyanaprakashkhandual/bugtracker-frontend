'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiEdit, FiTrash2, FiSearch,
  FiChevronLeft, FiChevronRight, FiEye,
  FiBarChart2, FiUsers, FiShield, FiChevronDown, FiCheck, FiPower
} from 'react-icons/fi';
import { useAlert } from '@/app/script/Alert.context';
import { useConfirm } from '@/app/script/Confirm.context';

const UserManagement = () => {
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'developer'
  });
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roles = ['admin', 'manager', 'developer', 'tester'];

  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      return token;
    }
    return null;
  };

  // API call function
  const apiCall = async (endpoint, options = {}) => {
    const token = getToken();

    if (!token) {
      showAlert({
        type: 'error',
        message: 'Please login first. Token not found.'
      });
      return null;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/v1/auth${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API call failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      showAlert({
        type: 'error',
        message: error.message
      });
      return null;
    }
  };

  // Fetch all users
  const fetchAllUsers = async (page = 1, search = '') => {
    setLoading(true);
    const endpoint = `/admin/users?page=${page}&limit=8&search=${search}`;
    const result = await apiCall(endpoint);

    if (result) {
      setUsers(result.users || []);
      setPagination(result.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        hasNext: false,
        hasPrev: false
      });
    }
    setLoading(false);
  };

  // Fetch statistics
  const fetchStats = async () => {
    const result = await apiCall('/admin/users/stats');
    if (result) {
      setStats(result.stats || result);
    }
  };

  // Create user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const result = await apiCall('/admin/users', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (result) {
        showAlert({
          type: 'success',
          message: `"${formData.name}" created successfully`
        });
        setShowCreateModal(false);
        setFormData({ name: '', email: '', password: '', role: 'developer' });
        fetchAllUsers();
        fetchStats();
      }
    } finally {
      setSaving(false);
    }
  };

  // Update user
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        name: formData.name,
        role: formData.role,
        isActive: formData.isActive
      };

      const result = await apiCall(`/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (result) {
        showAlert({
          type: 'success',
          message: `"${formData.name}" updated successfully`
        });
        setShowCreateModal(false);
        setSelectedUser(null);
        setFormData({ name: '', email: '', password: '', role: 'developer' });
        fetchAllUsers();
        fetchStats();
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle form submission (create or update)
  const handleSubmitUser = async (e) => {
    if (selectedUser) {
      await handleUpdateUser(e);
    } else {
      await handleCreateUser(e);
    }
  };

  // Delete user permanently
  const handleDeleteUser = async (user) => {
    const result = await showConfirm({
      title: `Delete "${user.name}"?`,
      message: "This action cannot be undone. All user data will be permanently lost.",
      confirmText: "Delete User",
      cancelText: "Keep User",
      type: "danger"
    });

    if (result && result.isConfirmed) {
      const apiResult = await apiCall(`/admin/users/${user._id}`, {
        method: 'DELETE'
      });

      if (apiResult) {
        showAlert({
          type: 'success',
          message: `"${user.name}" deleted successfully`
        });
        fetchAllUsers();
        fetchStats();
      }
    }
  };

  // Toggle user status
  const handleToggleStatus = async (user) => {
    const result = await showConfirm({
      title: `${user.isActive ? 'Deactivate' : 'Activate'} "${user.name}"?`,
      message: `User will be ${user.isActive ? 'deactivated' : 'activated'}.`,
      confirmText: user.isActive ? 'Deactivate' : 'Activate',
      cancelText: "Cancel",
      type: "warning"
    });

    if (result) {
      const apiResult = await apiCall(`/admin/users/${user._id}/status`, {
        method: 'PATCH'
      });

      if (apiResult) {
        showAlert({
          type: 'success',
          message: `"${user.name}" ${user.isActive ? 'deactivated' : 'activated'} successfully`
        });
        fetchAllUsers();
        fetchStats();
      }
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAllUsers();
    fetchStats();
  }, [activeTab]);

  // Handle search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAllUsers(1, searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-full mx-auto">
        {/* Main Content */}
        <div className="bg-white rounded-sm">
          {/* Tabs and Search */}
          <div className="border-b border-gray-200">
            <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex space-x-4">
                {['all', 'stats'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    {tab === 'all' && 'All Users'}
                    {tab === 'stats' && 'Statistics'}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 w-64"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
                >
                  <FiPlus className="h-5 w-5" />
                  <span>New User</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {activeTab === 'stats' ? (
              <StatsView stats={stats} />
            ) : (
              <UsersView
                users={users}
                loading={loading}
                pagination={pagination}
                onPageChange={fetchAllUsers}
                onEdit={(user) => {
                  setSelectedUser(user);
                  setFormData({
                    name: user.name,
                    email: user.email,
                    password: '',
                    role: user.role,
                    isActive: user.isActive
                  });
                  setShowCreateModal(true);
                }}
                onDelete={handleDeleteUser}
                onToggleStatus={handleToggleStatus}
              />
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit User Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <Modal
            title={selectedUser ? 'Edit User' : 'Create New User'}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedUser(null);
              setFormData({ name: '', email: '', password: '', role: 'developer' });
              setRoleDropdownOpen(false);
            }}
          >
            <form onSubmit={handleSubmitUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900"
                  placeholder="Enter user name"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required={!selectedUser}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900"
                  placeholder="Enter email address"
                  disabled={saving || selectedUser}
                />
              </div>
              {!selectedUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900"
                    placeholder="Leave blank for default password"
                    disabled={saving}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 bg-white text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    disabled={saving}
                  >
                    <span className="text-gray-900 capitalize">{formData.role}</span>
                    <FiChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${roleDropdownOpen ? 'transform rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {roleDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full bottom-full mb-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                      >
                        {roles.map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, role });
                              setRoleDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors flex items-center justify-between group"
                            disabled={saving}
                          >
                            <span className={`text-sm capitalize ${formData.role === role ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                              {role}
                            </span>
                            {formData.role === role && (
                              <FiCheck className="h-4 w-4 text-blue-600" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedUser(null);
                    setFormData({ name: '', email: '', password: '', role: 'developer' });
                    setRoleDropdownOpen(false);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 min-w-[120px] justify-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{selectedUser ? 'Updating...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <span>{selectedUser ? 'Update' : 'Create'} User</span>
                  )}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// Users View Component
const UsersView = ({ users, loading, pagination, onPageChange, onEdit, onDelete, onToggleStatus }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-48 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <FiUsers className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
        <p className="text-gray-500">Get started by creating your first user.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {users.map((user, index) => (
          <UserCard
            key={user._id}
            user={user}
            index={index}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <FiChevronLeft className="h-5 w-5" />
            <span>Previous</span>
          </button>

          <span className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNext}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <span>Next</span>
            <FiChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  );
};

// User Card Component
const UserCard = ({ user, index, onEdit, onDelete, onToggleStatus }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
            {user.name}
          </h3>
          <p className="text-sm text-gray-500 mb-2 line-clamp-1">
            {user.email}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
          <FiShield className="h-3 w-3 mr-1" />
          {user.role}
        </span>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="flex gap-6 align-middle items-center mt-3 text-xs text-gray-500">
        Created {new Date(user.createdAt).toLocaleDateString()}
        <div>
          <div className="flex space-x-2">
            <button
              tooltip-data="Edit"
              onClick={() => onEdit(user)}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <FiEdit className="h-4 w-4" />
            </button>
            <button
              tooltip-data="Change Status"
              onClick={() => onToggleStatus(user)}
              className={`p-2 transition-colors ${user.isActive ? 'text-gray-400 hover:text-yellow-600' : 'text-gray-400 hover:text-green-600'}`}
            >
              <FiPower className="h-4 w-4" />
            </button>
            <button
              tooltip-data="Remove"
              onClick={() => onDelete(user)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Statistics View Component
const StatsView = ({ stats }) => {
  if (!stats) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Users</p>
              <p className="text-4xl font-bold text-gray-900 mt-3 mb-1">
                {stats?.totalUsers || 0}
              </p>
            </div>
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
              <FiUsers className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Active Users</p>
              <p className="text-4xl font-bold text-gray-900 mt-3">
                {stats?.activeUsers || 0}
              </p>
              <p className="text-xs font-medium text-gray-400 mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {stats?.inactiveUsers || 0} inactive
              </p>
            </div>
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
              <FiShield className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Verified Users</p>
              <p className="text-4xl font-bold text-gray-900 mt-3 mb-1">
                {stats?.verifiedUsers || 0}
              </p>
            </div>
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
              <FiBarChart2 className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Users by Role */}
      {stats.usersByRole && stats.usersByRole.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Role</h3>
          <div className="bg-gray-50 rounded-lg p-6">
            {stats.usersByRole.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
              >
                <div className="flex items-center">
                  <FiShield className="h-4 w-4 text-gray-500 mr-3" />
                  <span className="font-medium text-gray-900 capitalize">{item._id}</span>
                </div>
                <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-sm font-medium">
                  {item.count} users
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Users */}
      {stats.recentUsers && stats.recentUsers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
          <div className="bg-gray-50 rounded-lg p-6">
            {stats.recentUsers.map((user, index) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    <FiShield className="h-3 w-3 mr-1" />
                    {user.role}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Modal Component
const Modal = ({ title, children, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiEye className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
};

export default UserManagement;