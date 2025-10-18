"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Shield,
  Lock,
  ChevronDown,
  X,
  Check,
  Plus,
  Trash2,
  Clock,
  User,
  FolderOpen,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { FaEye, FaEdit, FaShieldAlt } from "react-icons/fa";
import { useAlert } from "@/app/script/Alert.context";
import { useConfirm } from "@/app/script/Confirm.context";

const AccessControlSystem = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [accessList, setAccessList] = useState([]);
  const [users, setUsers] = useState([]);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showHourDropdown, setShowHourDropdown] = useState(false);
  const [showMinuteDropdown, setShowMinuteDropdown] = useState(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState({
    hours: "12",
    minutes: "00",
    period: "PM",
  });

  const userDropdownRef = useRef(null);
  const calendarRef = useRef(null);
  const timePickerRef = useRef(null);
  const hourDropdownRef = useRef(null);
  const minuteDropdownRef = useRef(null);
  const periodDropdownRef = useRef(null);

  const { showConfirm } = useConfirm();
  const { showAlert } = useAlert();

  // Grant access form state
  const [grantForm, setGrantForm] = useState({
    userId: "",
    accessLevel: "view",
    expiresAt: "",
    autoGrantTestTypes: true, // Auto-grant test type access by default
  });

  // Get auth token
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  // API helper function with auth
  const fetchWithAuth = async (url, options = {}) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found. Please log in.");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
        errorData.error ||
        `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  };

  // Fetch initial data
  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  // Auto-dismiss messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const accessLevels = [
    {
      value: "view",
      label: "View",
      description: "Can view content only",
      icon: FaEye,
    },
    {
      value: "edit",
      label: "Edit",
      description: "Can view and edit content",
      icon: FaEdit,
    },
    {
      value: "admin",
      label: "Admin",
      description: "Full access and control",
      icon: FaShieldAlt,
    },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target)
      ) {
        setShowUserDropdown(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
      if (timePickerRef.current && !timePickerRef.current.contains(e.target)) {
        setShowTimePicker(false);
      }
      if (
        hourDropdownRef.current &&
        !hourDropdownRef.current.contains(e.target)
      ) {
        setShowHourDropdown(false);
      }
      if (
        minuteDropdownRef.current &&
        !minuteDropdownRef.current.contains(e.target)
      ) {
        setShowMinuteDropdown(false);
      }
      if (
        periodDropdownRef.current &&
        !periodDropdownRef.current.contains(e.target)
      ) {
        setShowPeriodDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const selectedUser = users.find((u) => u._id === grantForm.userId);

  // Calendar logic
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const handleDateSelect = (day) => {
    if (!day) return;
    const date = new Date(currentYear, currentMonth, day);
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const handleTimeChange = (field, value) => {
    setSelectedTime((prev) => ({ ...prev, [field]: value }));
    if (field === "hours") setShowHourDropdown(false);
    if (field === "minutes") setShowMinuteDropdown(false);
    if (field === "period") setShowPeriodDropdown(false);
  };

  const formatDateTime = () => {
    if (!selectedDate) return "";

    let hours = parseInt(selectedTime.hours);
    if (selectedTime.period === "PM" && hours !== 12) hours += 12;
    if (selectedTime.period === "AM" && hours === 12) hours = 0;

    const date = new Date(selectedDate);
    date.setHours(hours, parseInt(selectedTime.minutes));

    return date.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (selectedDate) {
      const formatted = formatDateTime();
      setGrantForm({ ...grantForm, expiresAt: formatted });
    }
  }, [selectedDate, selectedTime]);

  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isSelected = (day) => {
    if (!day || !selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear()
    );
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth("http://localhost:5000/api/v1/project");
      setProjects(data.projects || data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await fetchWithAuth(
        "http://localhost:5000/api/v1/auth/admin/users"
      );
      setUsers(data.users || data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchAccessList = async (projectId) => {
    setLoading(true);
    try {
      const data = await fetchWithAuth(
        `http://localhost:5000/api/v1/access/project/${projectId}/details`
      );
      setAccessList(data.accessList || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching access list:", err);
      setError(err.message);
      setAccessList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    fetchAccessList(project._id);
  };

  const handleGrantAccess = async () => {
    if (!grantForm.userId || !selectedProject) {
      setError("Please select a user and project");
      return;
    }

    setLoading(true);
    try {
      const body = {
        projectId: selectedProject._id,
        userId: grantForm.userId,
        accessLevel: grantForm.accessLevel,
        expiresAt: grantForm.expiresAt || undefined,
        autoGrantTestTypes: grantForm.autoGrantTestTypes,
      };

      const data = await fetchWithAuth("http://localhost:5000/api/v1/access/project/grant", {
        method: "POST",
        body: JSON.stringify(body),
      });

      setShowGrantModal(false);
      setGrantForm({
        userId: "",
        accessLevel: "view",
        expiresAt: "",
        autoGrantTestTypes: true
      });

      showAlert({
        type: "success",
        message: data.autoTestTypeAccess
          ? `Access granted! ${data.autoTestTypeAccess.testTypesGranted} test types were automatically granted.`
          : "Access granted successfully!",
      });

      fetchAccessList(selectedProject._id);
      setError(null);
    } catch (err) {
      console.error("Error granting access:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async (userId) => {
    if (!selectedProject) return;

    const result = await showConfirm({
      title: "Revoke Access",
      message: "Are you sure you want to revoke access? This will also remove access to all test types in this project.",
      confirmText: "Revoke",
      cancelText: "Cancel",
      type: "warning",
    });

    if (!result) return;

    setLoading(true);
    try {
      await fetchWithAuth(
        `http://localhost:5000/api/v1/access/project/revoke/${selectedProject._id}/${userId}`,
        {
          method: "DELETE",
          body: JSON.stringify({ autoRevokeTestTypes: true }),
        }
      );

      showAlert({
        type: "success",
        message: "Access revoked successfully! All test type access has been removed."
      });

      fetchAccessList(selectedProject._id);
      setError(null);
    } catch (err) {
      console.error("Error revoking access:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAccess = async (userId, newAccessLevel) => {
    if (!selectedProject) return;

    setLoading(true);
    try {
      const data = await fetchWithAuth(
        `http://localhost:5000/api/v1/access/project/update/${selectedProject._id}/${userId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            accessLevel: newAccessLevel,
            updateTestTypesAccess: true,
          }),
        }
      );

      showAlert({
        type: "success",
        message: data.testTypeAccessUpdate
          ? `Access updated! ${data.testTypeAccessUpdate.testTypesUpdated} test types were updated.`
          : "Access level updated successfully!",
      });

      fetchAccessList(selectedProject._id);
      setError(null);
    } catch (err) {
      console.error("Error updating access:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncTestTypes = async () => {
    if (!selectedProject) return;

    setLoading(true);
    try {
      const data = await fetchWithAuth(
        `http://localhost:5000/api/v1/access/project/${selectedProject._id}/sync-test-types`,
        {
          method: "POST",
        }
      );

      showAlert({
        type: "success",
        message: data.details || "Test type access synced successfully!",
      });

      fetchAccessList(selectedProject._id);
      setError(null);
    } catch (err) {
      console.error("Error syncing test types:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-h[calc(100vh-60px)] bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <div className="max-w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Projects List */}
          <div className="lg:col-span-1 space-y-4">
            {/* Projects List */}
            <div className="bg-white dark:bg-gray-800 border shadow-sm border-gray-200 dark:border-gray-700 overflow-hidden sidebar-scrollbar">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Projects
                  </h2>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {projects.length} projects
                </p>
              </div>
              <div className="max-h-[calc(100vh-158px)] overflow-y-auto">
                {loading && !selectedProject ? (
                  <div className="space-y-3 p-4">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : projects.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <FolderOpen className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      No projects found
                    </p>
                  </div>
                ) : (
                  projects.map((project) => (
                    <button
                      key={project._id}
                      onClick={() => handleProjectSelect(project)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${selectedProject?._id === project._id
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : ""
                        }`}
                    >
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {project.projectName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {project.projectDesc}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Content - Access Management */}
          <div className="lg:col-span-2">
            {selectedProject ? (
              <div className="bg-white dark:bg-gray-800 shadow-sm  border border-gray-200 dark:border-gray-700 min-h-[calc(100vh-73px)] sidebar-scrollbar">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                          {selectedProject.projectName}
                        </h2>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage user access - Test type access is automatically granted
                      </p>
                    </div>
                    <button
                      onClick={() => setShowGrantModal(true)}
                      disabled={loading}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Grant Access</span>
                    </button>
                  </div>
                </div>

                {/* Access List */}
                <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[calc(100vh-350px)] overflow-y-auto">
                  {loading ? (
                    <div className="space-y-3 p-4">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/3 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/4 animate-pulse"></div>
                          </div>
                          <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  ) : accessList.length === 0 ? (
                    <div className="p-8 text-center">
                      <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 mb-2">
                        No users have access yet
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        Click "Grant Access" to add users
                      </p>
                    </div>
                  ) : (
                    accessList.map((access) => (
                      <AccessListItem
                        key={access._id}
                        access={access}
                        onRevoke={handleRevokeAccess}
                        onUpdate={handleUpdateAccess}
                        loading={loading}
                      />
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Lock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Select a Project
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose a project from the list to manage access permissions
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grant Access Modal */}
      <AnimatePresence>
        {showGrantModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/10 dark:bg-gray-900/10 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget && !loading) {
                setShowGrantModal(false);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Grant Access
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Add user access to {selectedProject?.projectName}
                    </p>
                  </div>
                  <button
                    onClick={() => !loading && setShowGrantModal(false)}
                    disabled={loading}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-5">
                {/* User Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    User <span className="text-red-500">*</span>
                  </label>
                  <div ref={userDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        !loading && setShowUserDropdown(!showUserDropdown)
                      }
                      disabled={loading}
                      className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-left flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                      <span
                        className={
                          selectedUser
                            ? "text-gray-900 dark:text-gray-100 text-sm"
                            : "text-gray-500 dark:text-gray-400 text-sm"
                        }
                      >
                        {selectedUser
                          ? `${selectedUser.name} (${selectedUser.email})`
                          : "Select a user"}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${showUserDropdown ? "rotate-180" : ""
                          }`}
                      />
                    </button>

                    <AnimatePresence>
                      {showUserDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-72 overflow-hidden"
                        >
                          {/* Search */}
                          <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                            <input
                              type="text"
                              placeholder="Search users..."
                              value={userSearch}
                              onChange={(e) => setUserSearch(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          {/* User List */}
                          <div className="max-h-56 overflow-y-auto">
                            {filteredUsers.length === 0 ? (
                              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                No users found
                              </div>
                            ) : (
                              filteredUsers.map((user) => (
                                <button
                                  key={user._id}
                                  type="button"
                                  onClick={() => {
                                    setGrantForm({
                                      ...grantForm,
                                      userId: user._id,
                                    });
                                    setShowUserDropdown(false);
                                    setUserSearch("");
                                  }}
                                  className="w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-between group transition-colors"
                                >
                                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                                      {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {user.name}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {user.email}
                                      </p>
                                    </div>
                                  </div>
                                  {grantForm.userId === user._id && (
                                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                  )}
                                </button>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Access Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Access Level <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {accessLevels.map((level) => {
                      const Icon = level.icon;
                      return (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() =>
                            setGrantForm({
                              ...grantForm,
                              accessLevel: level.value,
                            })
                          }
                          disabled={loading}
                          className={`p-3 rounded-md border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${grantForm.accessLevel === level.value
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700"
                            }`}
                        >
                          <Icon
                            className={`w-5 h-5 mx-auto mb-1 ${grantForm.accessLevel === level.value
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-500 dark:text-gray-400"
                              }`}
                          />
                          <p
                            className={`text-xs font-medium ${grantForm.accessLevel === level.value
                              ? "text-blue-900 dark:text-blue-300"
                              : "text-gray-700 dark:text-gray-300"
                              }`}
                          >
                            {level.label}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Auto Grant Test Types Toggle */}
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Auto-grant test type access
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      User will automatically get same access to all test types in this project
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={grantForm.autoGrantTestTypes}
                      onChange={(e) =>
                        setGrantForm({
                          ...grantForm,
                          autoGrantTestTypes: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Expiration Date & Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Expiration Date & Time{" "}
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                      (Optional)
                    </span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Date Picker */}
                    <div ref={calendarRef} className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          !loading && setShowCalendar(!showCalendar)
                        }
                        disabled={loading}
                        className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:bg-gray-50 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {selectedDate
                            ? selectedDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                            : "Date"}
                        </span>
                        <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>

                      <AnimatePresence>
                        {showCalendar && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className="absolute z-50 bottom-full mb-2 left-0 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl p-3 w-72"
                          >
                            {/* Month Navigation */}
                            <div className="flex items-center justify-between mb-3">
                              <button
                                type="button"
                                onClick={() => {
                                  if (currentMonth === 0) {
                                    setCurrentMonth(11);
                                    setCurrentYear(currentYear - 1);
                                  } else {
                                    setCurrentMonth(currentMonth - 1);
                                  }
                                }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                              >
                                <ChevronDown className="w-4 h-4 rotate-90 text-gray-600 dark:text-gray-400" />
                              </button>
                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {monthNames[currentMonth]} {currentYear}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (currentMonth === 11) {
                                    setCurrentMonth(0);
                                    setCurrentYear(currentYear + 1);
                                  } else {
                                    setCurrentMonth(currentMonth + 1);
                                  }
                                }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                              >
                                <ChevronDown className="w-4 h-4 -rotate-90 text-gray-600 dark:text-gray-400" />
                              </button>
                            </div>

                            {/* Day Headers */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                              {[
                                "Sun",
                                "Mon",
                                "Tue",
                                "Wed",
                                "Thu",
                                "Fri",
                                "Sat",
                              ].map((day) => (
                                <div
                                  key={day}
                                  className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
                                >
                                  {day}
                                </div>
                              ))}
                            </div>

                            {/* Calendar Days */}
                            <div className="grid grid-cols-7 gap-1">
                              {generateCalendarDays().map((day, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => handleDateSelect(day)}
                                  disabled={!day}
                                  className={`
                                py-1.5 text-sm rounded-md transition-all
                                ${!day ? "invisible" : ""}
                                ${isToday(day) ? "border border-blue-500" : ""}
                                ${isSelected(day)
                                      ? "bg-blue-600 text-white font-semibold"
                                      : "hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                                    }
                              `}
                                >
                                  {day}
                                </button>
                              ))}
                            </div>

                            {/* Today Button */}
                            <button
                              type="button"
                              onClick={() => {
                                const today = new Date();
                                setCurrentMonth(today.getMonth());
                                setCurrentYear(today.getFullYear());
                                handleDateSelect(today.getDate());
                              }}
                              className="w-full mt-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors font-medium"
                            >
                              Today
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Time Picker */}
                    <div ref={timePickerRef} className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          !loading && setShowTimePicker(!showTimePicker)
                        }
                        disabled={loading}
                        className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:bg-gray-50 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {selectedTime.hours}:{selectedTime.minutes}{" "}
                          {selectedTime.period}
                        </span>
                        <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>

                      <AnimatePresence>
                        {showTimePicker && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className="absolute z-50 bottom-full mb-2 right-0 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl p-4 w-64"
                          >
                            <div className="flex items-center justify-center space-x-2">
                              {/* Hours Dropdown */}
                              <div ref={hourDropdownRef} className="relative">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowHourDropdown(!showHourDropdown)
                                  }
                                  className="w-16 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-center text-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                                >
                                  {selectedTime.hours}
                                </button>
                                <AnimatePresence>
                                  {showHourDropdown && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -8 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -8 }}
                                      className="absolute z-50 mt-1 w-16 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto"
                                    >
                                      {Array.from({ length: 12 }, (_, i) => {
                                        const hour = (i + 1)
                                          .toString()
                                          .padStart(2, "0");
                                        return (
                                          <button
                                            key={hour}
                                            type="button"
                                            onClick={() =>
                                              handleTimeChange("hours", hour)
                                            }
                                            className={`w-full px-3 py-2 text-sm text-center hover:bg-gray-50 dark:hover:bg-gray-600 ${selectedTime.hours === hour
                                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                                              : "text-gray-700 dark:text-gray-300"
                                              }`}
                                          >
                                            {hour}
                                          </button>
                                        );
                                      })}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                :
                              </span>

                              {/* Minutes Dropdown */}
                              <div ref={minuteDropdownRef} className="relative">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowMinuteDropdown(!showMinuteDropdown)
                                  }
                                  className="w-16 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-center text-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                                >
                                  {selectedTime.minutes}
                                </button>
                                <AnimatePresence>
                                  {showMinuteDropdown && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -8 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -8 }}
                                      className="absolute z-50 mt-1 w-16 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto"
                                    >
                                      {Array.from({ length: 60 }, (_, i) => {
                                        const minute = i
                                          .toString()
                                          .padStart(2, "0");
                                        return (
                                          <button
                                            key={minute}
                                            type="button"
                                            onClick={() =>
                                              handleTimeChange(
                                                "minutes",
                                                minute
                                              )
                                            }
                                            className={`w-full px-3 py-2 text-sm text-center hover:bg-gray-50 dark:hover:bg-gray-600 ${selectedTime.minutes === minute
                                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                                              : "text-gray-700 dark:text-gray-300"
                                              }`}
                                          >
                                            {minute}
                                          </button>
                                        );
                                      })}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              {/* AM/PM Dropdown */}
                              <div ref={periodDropdownRef} className="relative">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowPeriodDropdown(!showPeriodDropdown)
                                  }
                                  className="w-16 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-center text-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                                >
                                  {selectedTime.period}
                                </button>
                                <AnimatePresence>
                                  {showPeriodDropdown && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -8 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -8 }}
                                      className="absolute z-50 mt-1 w-16 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg"
                                    >
                                      {["AM", "PM"].map((period) => (
                                        <button
                                          key={period}
                                          type="button"
                                          onClick={() =>
                                            handleTimeChange("period", period)
                                          }
                                          className={`w-full px-3 py-2 text-sm text-center hover:bg-gray-50 dark:hover:bg-gray-600 ${selectedTime.period === period
                                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                                            : "text-gray-700 dark:text-gray-300"
                                            }`}
                                        >
                                          {period}
                                        </button>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  {selectedDate && (
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Expires:{" "}
                        {selectedDate.toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        at {selectedTime.hours}:{selectedTime.minutes}{" "}
                        {selectedTime.period}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDate(null);
                          setGrantForm({ ...grantForm, expiresAt: "" });
                        }}
                        className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                  {!selectedDate && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Leave empty for permanent access
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 rounded-b-xl flex justify-end space-x-3">
                <button
                  onClick={() => setShowGrantModal(false)}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGrantAccess}
                  disabled={!grantForm.userId || loading}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 min-w-[120px] justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Granting...</span>
                    </>
                  ) : (
                    <span>Grant Access</span>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Access List Item Component
// Add a check at the beginning of AccessListItem component to handle deleted users
const AccessListItem = ({ access, onRevoke, onUpdate, loading }) => {
  const [showActions, setShowActions] = useState(false);
  const [showAccessLevelDropdown, setShowAccessLevelDropdown] = useState(false);

  // Handle deleted user case
  if (!access.userId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold">
              ?
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                Deleted User
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This user has been deleted from the system
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const getLevelColor = (level) => {
    switch (level) {
      case "admin":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300";
      case "edit":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300";
      case "view":
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const accessLevels = [
    { value: "view", label: "View", icon: FaEye },
    { value: "edit", label: "Edit", icon: FaEdit },
    { value: "admin", label: "Admin", icon: FaShieldAlt },
  ];

  const currentLevel = accessLevels.find(level => level.value === access.accessLevel);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowAccessLevelDropdown(false);
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
            {access.userId?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {access.userId?.name || "Unknown User"}
              </h4>
            </div>
            <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
              <p className="truncate">{access.userId?.email || "No email"}</p>
              {access.userId?.role && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <p className="capitalize">{access.userId.role}</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Access Level Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAccessLevelDropdown(!showAccessLevelDropdown)}
              className={`px-3 py-1 text-xs font-medium rounded flex items-center space-x-1 ${getLevelColor(access.accessLevel)}`}
            >
              {currentLevel && <currentLevel.icon className="w-3 h-3" />}
              <span>{access.accessLevel}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            <AnimatePresence>
              {showAccessLevelDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute z-50 mt-1 right-0 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg min-w-[120px]"
                >
                  {accessLevels.map((level) => {
                    const Icon = level.icon;
                    return (
                      <button
                        key={level.value}
                        // Fix for access level update button - around line 1295
                        onClick={() => {
                          if (access.userId) {
                            onUpdate(access.userId._id, level.value);
                            setShowAccessLevelDropdown(false);
                          }
                        }}
                        disabled={loading || !access.userId}
                        className={`w-full px-3 py-2 text-sm text-left flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-600 ${access.accessLevel === level.value
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300"
                          }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{level.label}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {showActions && (
              // Fix for AccessListItem component - Update the revoke button onClick
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => access.userId && onRevoke(access.userId._id)}
                disabled={loading || !access.userId}
                className="ml-2 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                title="Revoke Access"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Test Type Access Info */}
      {access.testTypeAccess && (
        <div className="mt-3 pl-13">
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
              <Check className="w-3 h-3" />
              <span>
                {access.testTypeAccess.accessibleCount}/{access.testTypeAccess.totalCount} test types
              </span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs ${access.testTypeAccess.syncStatus === 'synced'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
              }`}>
              {access.testTypeAccess.syncStatus}
            </span>
          </div>
        </div>
      )}

      <div className="mt-3 pl-13 flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-1">
          <User className="w-3 h-3" />
          <span>Granted by {access.grantedBy?.name || "Unknown"}</span>
        </div>
        <span className="text-gray-300 dark:text-gray-600">•</span>
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>{formatDate(access.createdAt)}</span>
        </div>
        {access.expiresAt && (
          <>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <div className="flex items-center space-x-1 text-orange-600 dark:text-orange-400">
              <Clock className="w-3 h-3" />
              <span>Expires {formatDate(access.expiresAt)}</span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default AccessControlSystem;
