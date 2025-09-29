'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Shield,
  MoreVertical,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Activity,
  Eye,
  X,
  Check,
  AlertTriangle,
  Star,
  Settings
} from 'lucide-react';

import StatCard from './StartCard';
import CreateUserModal from './Create';
import EditUserModal from './Edit';
import DeleteModal from './Delete';
import { apiCall } from './api';
import Dropdown from './Dropdown';

const UserManagementDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    isActive: '',
    page: 1,
    limit: 10
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [pagination, setPagination] = useState({});
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const roleDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.role) queryParams.append('role', filters.role);
      if (filters.isActive !== '') queryParams.append('isActive', filters.isActive);
      queryParams.append('page', filters.page);
      queryParams.append('limit', filters.limit);

      const data = await apiCall(`/admin/users?${queryParams}`);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const data = await apiCall('/admin/users/stats');
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Create user
  const createUser = async (userData) => {
    try {
      await apiCall('/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      setShowCreateModal(false);
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  // Update user
  const updateUser = async (userId, userData) => {
    try {
      await apiCall(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    try {
      await apiCall(`/admin/users/${userId}`, {
        method: 'DELETE',
      });
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Toggle user status
  const toggleUserStatus = async (userId) => {
    try {
      await apiCall(`/admin/users/${userId}/status`, {
        method: 'PATCH',
      });
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  // Update user role
  const updateUserRole = async (userId, role) => {
    try {
      await apiCall(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [filters]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setShowRoleDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              User Management
            </h1>
            <p className="text-gray-600 mt-1">Manage users, roles, and permissions</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add User
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Active Users"
              value={stats.activeUsers}
              subtitle={`${stats.inactiveUsers} inactive`}
              icon={UserCheck}
              color="green"
            />
            <StatCard
              title="Verified Users"
              value={stats.verifiedUsers}
              subtitle={`${stats.unverifiedUsers} unverified`}
              icon={Shield}
              color="purple"
            />
            <StatCard
              title="Recent Signup"
              value={stats.recentUsers.length}
              icon={Star}
              color="orange"
            />
          </div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-4">
              {/* Role Filter Dropdown */}
              <div className="relative" ref={roleDropdownRef}>
                <button
                  onClick={() => {
                    setShowRoleDropdown(!showRoleDropdown);
                    setShowStatusDropdown(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <span>{filters.role ? `Role: ${filters.role}` : 'All Roles'}</span>
                  <motion.svg
                    animate={{ rotate: showRoleDropdown ? 180 : 0 }}
                    className="h-4 w-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>

                <AnimatePresence>
                  {showRoleDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1"
                    >
                      <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                        Filter by Role
                      </div>
                      {[
                        { value: '', label: 'All Roles' },
                        { value: 'admin', label: 'Admin' },
                        { value: 'developer', label: 'Developer' },
                        { value: 'manager', label: 'Manager' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setFilters({ ...filters, role: option.value, page: 1 });
                            setShowRoleDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm flex items-center space-x-2 hover:bg-gray-50 transition-colors ${filters.role === option.value ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                            }`}
                        >
                          {filters.role === option.value && (
                            <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span className={filters.role === option.value ? 'font-medium' : ''}>
                            {option.label}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Status Filter Dropdown */}
              <div className="relative" ref={statusDropdownRef}>
                <button
                  onClick={() => {
                    setShowStatusDropdown(!showStatusDropdown);
                    setShowRoleDropdown(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <span>
                    {filters.isActive === 'true'
                      ? 'Status: Active'
                      : filters.isActive === 'false'
                        ? 'Status: Inactive'
                        : 'All Status'
                    }
                  </span>
                  <motion.svg
                    animate={{ rotate: showStatusDropdown ? 180 : 0 }}
                    className="h-4 w-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>

                <AnimatePresence>
                  {showStatusDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1"
                    >
                      <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                        Filter by Status
                      </div>
                      {[
                        { value: '', label: 'All Status' },
                        { value: 'true', label: 'Active' },
                        { value: 'false', label: 'Inactive' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setFilters({ ...filters, isActive: option.value, page: 1 });
                            setShowStatusDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm flex items-center space-x-2 hover:bg-gray-50 transition-colors ${filters.isActive === option.value ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                            }`}
                        >
                          {filters.isActive === option.value && (
                            <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span className={filters.isActive === option.value ? 'font-medium' : ''}>
                            {option.label}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading users...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence>
                      {users.map((user, index) => (
                        <motion.tr
                          key={user._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 font-medium text-sm">
                                    {user.name?.charAt(0)?.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                                  'bg-green-100 text-green-800'
                              }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`h-2 w-2 rounded-full mr-2 ${user.isActive ? 'bg-green-400' : 'bg-red-400'
                                }`}></div>
                              <span className={`text-sm ${user.isActive ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div ref={dropdownRef}>
                              <Dropdown
                                trigger={
                                  <div className="p-1 rounded-md hover:bg-gray-100 transition-colors">
                                    <MoreVertical className="w-4 h-4 text-gray-500" />
                                  </div>
                                }
                                isOpen={activeDropdown === user._id}
                                onToggle={() => setActiveDropdown(activeDropdown === user._id ? null : user._id)}
                              >
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowEditModal(true);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <Edit3 className="w-4 h-4" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    toggleUserStatus(user._id);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                  {user.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowDeleteModal(true);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </Dropdown>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.currentPage - 1) * filters.limit) + 1} to{' '}
                    {Math.min(pagination.currentPage * filters.limit, pagination.totalUsers)} of{' '}
                    {pagination.totalUsers} results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                      disabled={!pagination.hasPrev}
                      className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-2 text-sm font-medium">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                      disabled={!pagination.hasNext}
                      className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Modals */}
        <CreateUserModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={createUser}
        />
        <EditUserModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={updateUser}
          selectedUser={selectedUser}
        />
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={deleteUser}
          selectedUser={selectedUser}
        />
      </div>
    </div>
  );
};

export default UserManagementDashboard;