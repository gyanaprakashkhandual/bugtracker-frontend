'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiEdit, FiTrash2, FiSearch, FiUser,
  FiChevronLeft, FiChevronRight, FiEye, FiUserCheck,
  FiUserX, FiShield, FiMail, FiCalendar, FiActivity, FiChevronDown, FiCheck
} from 'react-icons/fi';
import { useAlert } from '@/app/script/Alert.context';
import { useConfirm } from '@/app/script/Confirm.context';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const roleDropdownRef = useRef(null);
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
    role: 'user'
  });

  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();
  const roles = [
    { value: 'admin', label: 'Admin', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
    { value: 'project manager', label: 'Project Manager', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    { value: 'developer', label: 'Developer', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    { value: 'qa tester', label: 'QA Tester', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
    { value: 'hr manager', label: 'HR Manager', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300' },
    { value: 'devops engineer', label: 'DevOps Engineer', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300' },
    { value: 'ui-ux designer', label: 'UI/UX Designer', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300' },
    { value: 'manager', label: 'Manager', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300' },
    { value: 'product manager', label: 'Product Manager', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' },
    { value: 'business analyst', label: 'Business Analyst', color: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300' },
    { value: 'scrum master', label: 'Scrum Master', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' },
    { value: 'data scientist', label: 'Data Scientist', color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300' },
    { value: 'data engineer', label: 'Data Engineer', color: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-300' },
    { value: 'ml engineer', label: 'ML Engineer', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300' },
    { value: 'ai engineer', label: 'AI Engineer', color: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300' },
    { value: 'frontend developer', label: 'Frontend Developer', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    { value: 'backend developer', label: 'Backend Developer', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    { value: 'fullstack developer', label: 'Fullstack Developer', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' },
    { value: 'mobile developer', label: 'Mobile Developer', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
    { value: 'cloud engineer', label: 'Cloud Engineer', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300' },
    { value: 'security engineer', label: 'Security Engineer', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
    { value: 'automation tester', label: 'Automation Tester', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' },
    { value: 'manual tester', label: 'Manual Tester', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
    { value: 'support engineer', label: 'Support Engineer', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' },
    { value: 'system administrator', label: 'System Administrator', color: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300' },
    { value: 'solution architect', label: 'Solution Architect', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
    { value: 'technical lead', label: 'Technical Lead', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    { value: 'software architect', label: 'Software Architect', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300' },
    { value: 'database administrator', label: 'Database Administrator', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300' },
    { value: 'intern', label: 'Intern', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' },
    { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' }
  ];

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  const apiCall = async (endpoint, options = {}) => {
    const token = getToken();
    if (!token) {
      showAlert({
        type: 'error',
        message: 'Please login first'
      });
      return null;
    }

    try {
      const response = await fetch(`https://caffetest.onrender.com/api/v1/auth${endpoint}`, {
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

  const fetchUsers = async (page = 1, search = '') => {
    setLoading(true);
    const endpoint = `/admin/users?page=${page}&limit=8&search=${search}`;
    const result = await apiCall(endpoint);

    if (result) {
      setUsers(result.users || result.data || []);
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

  const fetchStats = async () => {
    const result = await apiCall('/admin/users/stats');
    if (result) {
      setStats(result.stats || result.data);
    }
  };

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
          message: `User "${formData.name}" created successfully`
        });
        setShowCreateModal(false);
        setFormData({ name: '', email: '', password: '', role: 'user' });
        fetchUsers();
        fetchStats();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const result = await apiCall(`/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });

      if (result) {
        showAlert({
          type: 'success',
          message: `User "${formData.name}" updated successfully`
        });
        setShowCreateModal(false);
        setSelectedUser(null);
        setFormData({ name: '', email: '', password: '', role: 'user' });
        fetchUsers();
        fetchStats();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitUser = async (e) => {
    if (selectedUser) {
      await handleUpdateUser(e);
    } else {
      await handleCreateUser(e);
    }
  };

  const handleDeleteUser = async (user) => {
    const result = await showConfirm({
      title: `Delete "${user.name}"?`,
      message: "This action cannot be undone. All user data will be permanently lost.",
      confirmText: "Delete User",
      cancelText: "Keep User",
      type: "danger",
    });

    if (result) {
      const apiResult = await apiCall(`/admin/users/${user._id}`, {
        method: 'DELETE'
      });

      if (apiResult) {
        showAlert({
          type: "success",
          message: `"${user.name}" deleted successfully`,
        });
        fetchUsers();
        fetchStats();
      }
    }
  };

  const handleToggleStatus = async (user) => {
    const action = user.isActive ? 'deactivate' : 'activate';
    const result = await showConfirm({
      title: `${action === 'activate' ? 'Activate' : 'Deactivate'} "${user.name}"?`,
      message: `Are you sure you want to ${action} this user?`,
      confirmText: action === 'activate' ? 'Activate' : 'Deactivate',
      cancelText: "Cancel",
      type: "warning",
    });

    if (result) {
      const apiResult = await apiCall(`/admin/users/${user._id}/status`, {
        method: 'PATCH'
      });

      if (apiResult) {
        showAlert({
          type: "success",
          message: `"${user.name}" ${action}d successfully`,
        });
        fetchUsers();
        fetchStats();
      }
    }
  };

  const handleUpdateRole = async (user, newRole) => {
    const result = await showConfirm({
      title: `Change role for "${user.name}"?`,
      message: `Change role from ${user.role} to ${newRole}?`,
      confirmText: "Update Role",
      cancelText: "Cancel",
      type: "warning",
    });

    if (result) {
      const apiResult = await apiCall(`/admin/users/${user._id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole })
      });

      if (apiResult) {
        showAlert({
          type: "success",
          message: `Role updated to ${newRole} for "${user.name}"`,
        });
        fetchUsers();
        fetchStats();
      }
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(1, searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiShield className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Access Denied</h3>
          <p className="text-gray-500 dark:text-gray-400">Only administrators can access user management</p>
        </div>
      </div>
    );
  }

  const selectedRole = roles.find(r => r.value === formData.role);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 max-h-[calc(100vh-69px)] overflow-y-auto sidebar-scrollbar">
      <div className="max-w-full mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-sm">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  User Management
                </h2>
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2.5 py-0.5 rounded-full text-sm font-medium">
                  {pagination.totalUsers} users
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-64"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                  <FiPlus className="h-5 w-5" />
                  <span>New User</span>
                </motion.button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      {stats?.totalUsers || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <FiUser className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      {stats?.activeUsers || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <FiUserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Admins</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      {stats?.adminCount || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <FiShield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Verified</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      {stats?.verifiedUsers || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <FiMail className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
            </div>

            <UsersView
              users={users}
              loading={loading}
              pagination={pagination}
              onPageChange={fetchUsers}
              onEdit={(user) => {
                setSelectedUser(user);
                setFormData({
                  name: user.name,
                  email: user.email,
                  password: '',
                  role: user.role
                });
                setShowCreateModal(true);
              }}
              onDelete={handleDeleteUser}
              onToggleStatus={handleToggleStatus}
              onUpdateRole={handleUpdateRole}
              roles={roles}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <Modal
            title={selectedUser ? 'Edit User' : 'Create New User'}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedUser(null);
              setFormData({ name: '', email: '', password: '', role: 'user' });
            }}
          >
            <form onSubmit={handleSubmitUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter full name"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter email address"
                  disabled={saving}
                />
              </div>

              {!selectedUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required={!selectedUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Enter password"
                    disabled={saving}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <div ref={roleDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => !saving && setShowRoleDropdown(!showRoleDropdown)}
                    disabled={saving}
                    className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-left flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {selectedRole ? selectedRole.label : 'Select a role'}
                    </span>
                    <FiChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showRoleDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute z-50 bottom-full mb-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg"
                      >
                        <div className="max-h-60 overflow-y-auto">
                          {roles.map((role) => (
                            <button
                              key={role.value}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, role: role.value });
                                setShowRoleDropdown(false);
                              }}
                              className="w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-between group transition-colors"
                            >
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {role.label}
                                  </p>
                                </div>
                              </div>
                              {formData.role === role.value && (
                                <FiCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
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
                    setFormData({ name: '', email: '', password: '', role: 'user' });
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 min-w-[120px] justify-center"
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

const UsersView = ({ users, loading, pagination, onPageChange, onEdit, onDelete, onToggleStatus, onUpdateRole, roles }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-xl h-48 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <FiUser className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No users found</h3>
        <p className="text-gray-500 dark:text-gray-400">Get started by creating your first user.</p>
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
            onUpdateRole={onUpdateRole}
            roles={roles}
          />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
          >
            <FiChevronLeft className="h-5 w-5" />
            <span>Previous</span>
          </button>

          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNext}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
          >
            <span>Next</span>
            <FiChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  );
};

const UserCard = ({ user, index, onEdit, onDelete, onToggleStatus, onUpdateRole, roles }) => {
  const [showCardRoleDropdown, setShowCardRoleDropdown] = useState(false);
  const cardRoleDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cardRoleDropdownRef.current && !cardRoleDropdownRef.current.contains(e.target)) {
        setShowCardRoleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleColor = (role) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.color : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getRoleLabel = (role) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  const selectedRole = roles.find(r => r.value === user.role);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-1 truncate">
            {user.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center truncate">
            <FiMail className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{user.email}</span>
          </p>
        </div>
        <div className="flex space-x-2 flex-shrink-0">
          <button
            tooltip-data="Edit"
            tooltip-placement="bottom"
            onClick={() => onEdit(user)}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <FiEdit className="h-4 w-4" />
          </button>
          <button
            tooltip-data="Delete"
            tooltip-placement="bottom"
            onClick={() => onDelete(user)}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
          {getRoleLabel(user.role)}
        </span>

        <div className="flex items-center justify-between text-sm">
          <span className={`flex items-center ${user.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {user.isActive ? (
              <FiUserCheck className="h-3 w-3 mr-1" />
            ) : (
              <FiUserX className="h-3 w-3 mr-1" />
            )}
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
          <span className={`flex items-center ${user.isVerified ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
            <FiMail className="h-3 w-3 mr-1" />
            {user.isVerified ? 'Verified' : 'Pending'}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center">
          <FiCalendar className="h-3 w-3 mr-1" />
          {new Date(user.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="flex space-x-2 mt-4">
        <button
          onClick={() => onToggleStatus(user)}
          className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${user.isActive
            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800'
            : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
            }`}
        >
          {user.isActive ? 'Deactivate' : 'Activate'}
        </button>

        <div ref={cardRoleDropdownRef} className="relative flex-1">
          <button
            type="button"
            onClick={() => setShowCardRoleDropdown(!showCardRoleDropdown)}
            className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-left flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          >
            <span className="text-gray-900 dark:text-gray-100 truncate">
              {selectedRole ? selectedRole.label : user.role}
            </span>
            <FiChevronDown className={`w-3 h-3 text-gray-500 dark:text-gray-400 transition-transform flex-shrink-0 ml-1 ${showCardRoleDropdown ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showCardRoleDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg"
              >
                <div className="max-h-48 overflow-y-auto">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => {
                        onUpdateRole(user, role.value);
                        setShowCardRoleDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-between group transition-colors"
                    >
                      <span className="text-gray-900 dark:text-gray-100 truncate">
                        {role.label}
                      </span>
                      {user.role === role.value && (
                        <FiCheck className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
const Modal = ({ title, children, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-100 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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