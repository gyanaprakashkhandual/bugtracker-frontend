'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Shield,
  Calendar,
  CheckCircle,
  LogOut,
  Settings,
  Crown,
  Activity
} from 'lucide-react';
import { useAlert } from '@/app/script/Alert.context';
import { useConfirm } from '@/app/script/Confirm.context';
const UserProfileInterface = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState(null);
  
  const {showAlert} = useAlert();
  const {showConfirm} = useConfirm();

  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Fetch user data from API
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();

      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/v1/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setError('Session expired. Please login again.');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.user) {
        setUser(data.user);
      } else {
        setError('Invalid response format from server');
      }

    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err.message || 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  // Logout function with confirmation and alerts
const handleLogout = async () => {
    try {
        const result = await showConfirm({
            title: "Logout Confirmation",
            message: "Are you sure you want to log out? You will need to log in again to continue using the app.",
            confirmText: "Logout",
            cancelText: "Stay Logged In",
            type: "warning",
        });

        if (!result || !result.isConfirmed) {
            return;
        }

        setLoggingOut(true);

        const token = getToken();

        if (!token) {
            showAlert({
                type: "error",
                message: "No authentication token found. Please login again.",
            });
            return;
        }

        showAlert({
            type: "info",
            message: "Logging out...",
            duration: 0, // show until replaced
        });

        const response = await fetch("http://localhost:5000/api/v1/auth/logout", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Clear token and user data
        localStorage.removeItem("token");
        setUser(null);

        showAlert({
            type: "success",
            message: "You have been logged out successfully.",
        });

        // Optional: redirect to login page
        // window.location.href = "/login";

    } catch (err) {
        console.error("Error during logout:", err);
        showAlert({
            type: "error",
            message: "Failed to logout: " + (err.message || "Unknown error"),
        });
    } finally {
        setLoggingOut(false);
    }
};

  useEffect(() => {
    fetchUserData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-purple-600 bg-purple-100';
      case 'user': return 'text-blue-600 bg-blue-100';
      case 'moderator': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return Crown;
      case 'user': return User;
      case 'moderator': return Shield;
      default: return User;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
            />
            <span className="text-gray-700 font-medium">Loading user data...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchUserData}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Session Ended</h3>
          <p className="text-gray-600">Please login again to continue</p>
        </motion.div>
      </div>
    );
  }

  const RoleIcon = getRoleIcon(user.role);

  return (
    <div className="h-auto bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-full mx-auto">

        {/* Main Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white overflow-hidden h-[calc(100vh-70px)]"
        >
          {/* Profile Header */}
          <div className="bg-[radial-gradient(circle_at_top_left,_#3b82f6,_#8b5cf6,_#ec4899)] px-8 py-12 text-white relative overflow-hidden">
            {/* Decorative SVG Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
              <svg
                className="absolute top-0 left-0 w-1/3 opacity-15"
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#e0f2fe" // sky-100
                  d="M45.2,-62.8C58.6,-52.9,69.4,-38.1,73.8,-21.5C78.2,-4.9,76.2,13.4,68.9,28.9C61.6,44.4,49,57.1,34.1,64.3C19.2,71.5,2,73.2,-14.8,71.2C-31.6,69.2,-48,63.5,-58.2,52C-68.4,40.5,-72.4,23.2,-71.8,6.4C-71.2,-10.4,-66,-26.7,-55.9,-40.1C-45.8,-53.5,-30.8,-64,-13.7,-65.6C3.4,-67.2,31.8,-59.9,45.2,-62.8Z"
                  transform="translate(100 100)"
                />
              </svg>

              <svg
                className="absolute top-1/4 right-0 w-1/4 opacity-10"
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#f3e8ff" // purple-100
                  d="M35.6,-48.1C46.8,-38.8,56.9,-28.2,61.1,-15.2C65.3,-2.2,63.6,13.2,56.7,26.4C49.8,39.6,37.7,50.6,24.1,57.3C10.5,64,-4.6,66.4,-18.5,62.9C-32.4,59.4,-45.1,50,-53.7,37.2C-62.3,24.4,-66.8,8.2,-65.5,-7.6C-64.2,-23.4,-57.1,-38.8,-45.9,-47.9C-34.7,-57,-19.4,-59.8,-5.2,-58.6C9,-57.4,26,-52.2,35.6,-48.1Z"
                  transform="translate(100 100)"
                />
              </svg>

              <svg
                className="absolute bottom-0 left-1/3 w-1/5 opacity-12"
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#fce7f3" // pink-100
                  d="M42.4,-56.9C55.3,-47.9,66.5,-35.8,71.1,-21.5C75.7,-7.2,73.6,9.3,66.2,23.8C58.8,38.3,46.1,50.8,31.2,60.1C16.3,69.4,-0.8,75.6,-16.3,71.8C-31.8,68,-45.6,54.3,-56.1,38.9C-66.6,23.5,-73.8,6.5,-72.1,-10.9C-70.3,-28.2,-59.5,-45.9,-44.5,-54.6C-29.5,-63.3,-10.3,-63.1,5.5,-68.9C21.3,-74.7,42.6,-86.5,42.4,-56.9Z"
                  transform="translate(100 100)"
                />
              </svg>

              <svg
                className="absolute top-1/2 left-0 w-1/6 opacity-8"
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#ede9fe" // violet-100
                  d="M38.2,-45.8C50.1,-35.7,60.5,-24.5,65.3,-10.8C70.1,2.9,69.3,19.1,62.1,32.8C54.9,46.5,41.3,57.7,26.1,62.4C10.9,67.1,-5.9,65.3,-21.3,59.7C-36.7,54.1,-50.7,44.7,-58.3,31.4C-65.9,18.1,-67.1,0.9,-63.8,-14.8C-60.5,-30.5,-52.7,-44.7,-41.2,-55C-29.7,-65.3,-14.8,-71.7,-0.4,-71.2C14,-70.7,28,-63.3,38.2,-45.8Z"
                  transform="translate(100 100)"
                />
              </svg>
            </div>


            <div className="absolute top-4 right-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {loggingOut ? 'Logging out...' : 'Logout'}
                </span>
              </motion.button>
            </div>

            <div className="flex items-center space-x-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                <User className="w-12 h-12 text-white" />
              </motion.div>

              <div>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold mb-2"
                >
                  {user.name}
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center space-x-3"
                >
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                    <RoleIcon className="w-4 h-4" />
                    <span className="capitalize">{user.role}</span>
                  </span>

                  {user.isVerified && (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      <span>Verified</span>
                    </span>
                  )}

                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    <Activity className="w-4 h-4" />
                    <span>{user.isActive ? 'Active' : 'Inactive'}</span>
                  </span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">User ID</p>
                    <p className="font-medium text-gray-900 font-mono text-sm">{user._id}</p>
                  </div>
                </div>
              </motion.div>

              {/* Account Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Account Created</p>
                    <p className="font-medium text-gray-900">{formatDate(user.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium text-gray-900">{formatDate(user.updatedAt)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Account Status</p>
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <p className="font-medium text-gray-900">{user.isActive ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfileInterface;