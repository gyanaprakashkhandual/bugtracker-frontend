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
  FileCode,
  Calendar,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { FaEye, FaEdit, FaShieldAlt } from "react-icons/fa";
import { useAlert } from "@/app/script/Alert.context";
import { useConfirm } from "@/app/script/Confirm.context";

const AccessControlSystem = () => {
  const [activeTab, setActiveTab] = useState("projects");
  const [projects, setProjects] = useState([]);
  const [testTypes, setTestTypes] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
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
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [lastSelectedItem, setLastSelectedItem] = useState(null);

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

  // Fetch test types when tab changes to testTypes or when selected project changes
  useEffect(() => {
    if (activeTab === "testTypes") {
      fetchTestTypes(selectedProject?._id);
    }
  }, [activeTab, selectedProject]);

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
    setShowCalendar(false); // Auto close after selection
  };

  const handleTimeChange = (field, value) => {
    setSelectedTime((prev) => ({ ...prev, [field]: value }));
    // Auto close respective dropdown
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

  const fetchTestTypes = async (projectId = null) => {
    try {
      setLoading(true);
      let endpoint =
        "http://localhost:5000/api/v1/test-type/accessible-test-types";

      // If projectId is provided, fetch project-specific test types
      if (projectId) {
        endpoint = `http://localhost:5000/api/v1/test-type/projects/${projectId}/test-types`;
      }

      const data = await fetchWithAuth(endpoint);
      setTestTypes(data.testTypes || data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching test types:", err);
      setError(err.message);
      setTestTypes([]);
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
      // Don't set error here as it might not be critical
    }
  };

  const fetchAccessList = async (itemId, type) => {
    setLoading(true);
    try {
      const endpoint =
        type === "project"
          ? `http://localhost:5000/api/v1/access/project/${itemId}/users`
          : `http://localhost:5000/api/v1/access/testtype/${itemId}/users`;

      const data = await fetchWithAuth(endpoint);
      setAccessList(data.accessList || data.users || data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching access list:", err);
      setError(err.message);
      setAccessList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setLastSelectedItem(item);
    fetchAccessList(
      item._id,
      activeTab === "projects" ? "project" : "testtype"
    );
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setSelectedItem(null);
    setAccessList([]);
    fetchTestTypes(project._id);
  };

  const handleGrantAccess = async () => {
    if (!grantForm.userId || !selectedItem) {
      setError("Please select a user");
      return;
    }

    setLoading(true);
    try {
      const endpoint =
        activeTab === "projects"
          ? "http://localhost:5000/api/v1/access/project/grant"
          : "http://localhost:5000/api/v1/access/testtype/grant";

      const body = {
        [activeTab === "projects" ? "projectId" : "testTypeId"]:
          selectedItem._id,
        userId: grantForm.userId,
        accessLevel: grantForm.accessLevel,
        expiresAt: grantForm.expiresAt || undefined,
      };

      await fetchWithAuth(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });

      setShowGrantModal(false);
      setGrantForm({ userId: "", accessLevel: "view", expiresAt: "" });
      showAlert({
        type: "success",
        message: "Access granted",
      });
      fetchAccessList(
        selectedItem._id,
        activeTab === "projects" ? "project" : "testType"
      );
      setError(null);
    } catch (err) {
      console.error("Error granting access:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async (userId) => {
    if (!selectedItem) return;

    const result = await showConfirm({
      title: "Logout Confirmation",
      message:
        "Are you sure you want to log out? You will need to log in again to continue using the app.",
      confirmText: "Logout",
      cancelText: "Stay Logged In",
      type: "warning",
    });

    setLoading(true);
    try {
      const endpoint =
        activeTab === "projects"
          ? `http://localhost:5000/api/v1/access/project/revoke/${selectedItem._id}/${userId}`
          : `http://localhost:5000/api/v1/access/testtype/revoke/${selectedItem._id}/${userId}`;

      await fetchWithAuth(endpoint, {
        method: "DELETE",
      });
      showAlert({ type: "success", message: "Access revoked successfully!" });
      fetchAccessList(
        selectedItem._id,
        activeTab === "projects" ? "project" : "testtype"
      );
      setError(null);
    } catch (err) {
      console.error("Error revoking access:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-h[calc(100vh-60px)] bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Header */}
            <div className="py-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Access Control
                  </h1>
                  <p className="text-sm text-gray-500">
                    Manage project and test type permissions
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-8 border-b border-gray-200">
              <button
                onClick={() => {
                  setActiveTab("projects");
                  setSelectedItem(null);
                  setAccessList([]);
                  setSelectedProject(null);
                }}
                className={`pb-4 px-1 relative ${activeTab === "projects"
                    ? "text-blue-600 font-medium"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <FolderOpen className="w-4 h-4" />
                  <span>Projects</span>
                </div>
                {activeTab === "projects" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  />
                )}
              </button>
              <button
                onClick={() => {
                  setActiveTab("testTypes");
                  setSelectedItem(null);
                  setAccessList([]);
                }}
                className={`pb-4 px-1 relative ${activeTab === "testTypes"
                    ? "text-blue-600 font-medium"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <FileCode className="w-4 h-4" />
                  <span>Test Types</span>
                </div>
                {activeTab === "testTypes" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-2 py-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Items List */}
          <div className="lg:col-span-1 space-y-4">
            {/* Project Selector for Test Types */}
            {activeTab === "testTypes" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Project
                </label>
                <div className="relative">
                  <button
                    onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-gray-900 text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors flex items-center justify-between"
                  >
                    {selectedProject?.projectName || "All Test Types"}
                    <svg
                      className={`w-4 h-4 text-gray-600 transition-transform ${projectDropdownOpen ? "rotate-180" : ""
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </button>
                  {projectDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      <button
                        onClick={() => {
                          handleProjectSelect(null);
                          setProjectDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 text-sm text-gray-900 transition-colors"
                      >
                        All Test Types
                      </button>
                      {projects.map((project) => (
                        <button
                          key={project._id}
                          onClick={() => {
                            handleProjectSelect(project);
                            setProjectDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 text-sm text-gray-900 transition-colors last:border-b-0"
                        >
                          {project.projectName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedProject && (
                  <p className="text-xs text-gray-500 mt-2">
                    Showing test types for:{" "}
                    <span className="font-medium">
                      {selectedProject.projectName}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Items List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sidebar-scrollbar">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {activeTab === "projects" ? "Projects" : "Test Types"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {(activeTab === "projects" ? projects : testTypes).length}{" "}
                  items
                </p>
              </div>
              <div
                className={`overflow-y-auto ${activeTab === "projects"
                    ? "max-h-[calc(100vh-275px)]"
                    : "max-h-[calc(100vh-410px)]"
                  }`}
              >
                {loading && !selectedItem ? (
                  <div className="space-y-3 p-4">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="p-4 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full animate-pulse mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : (activeTab === "projects" ? projects : testTypes).length ===
                  0 ? (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      {activeTab === "projects" ? (
                        <FolderOpen className="w-6 h-6 text-gray-400" />
                      ) : (
                        <FileCode className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <p className="text-gray-500">
                      {activeTab === "testTypes" && selectedProject
                        ? `No test types found for ${selectedProject.projectName}`
                        : `No ${activeTab === "projects" ? "projects" : "test types"
                        } found`}
                    </p>
                  </div>
                ) : (
                  (activeTab === "projects" ? projects : testTypes).map(
                    (item) => (
                      <button
                        key={item._id}
                        onClick={() => handleItemSelect(item)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${selectedItem?._id === item._id ? "bg-blue-50" : ""
                          }`}
                      >
                        <h3 className="font-medium text-gray-900 mb-1">
                          {activeTab === "projects"
                            ? item.projectName
                            : item.testTypeName}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {activeTab === "projects"
                            ? item.projectDesc
                            : item.testTypeDesc}
                        </p>
                        {activeTab === "testTypes" && item.testFramework && (
                          <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                            {item.testFramework}
                          </span>
                        )}
                      </button>
                    )
                  )
                )}
              </div>
            </div>
          </div>
          {/* Right Content - Access Management */}
          <div className="lg:col-span-2">
            {selectedItem || lastSelectedItem ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[calc(100vh-190px)] sidebar-scrollbar">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {activeTab === "projects"
                          ? (selectedItem || lastSelectedItem).projectName
                          : (selectedItem || lastSelectedItem).testTypeName}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Manage user access and permissions
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
                <div className="divide-y divide-gray-100 max-h-[calc(100vh-350px)] overflow-y-auto">
                  {loading ? (
                    <div className="space-y-3 p-4">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center space-x-3 p-4 bg-gray-50 rounded"
                        >
                          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                          </div>
                          <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  ) : accessList.length === 0 ? (
                    <div className="p-8 text-center">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-2">
                        No users have access yet
                      </p>
                      <p className="text-sm text-gray-400">
                        Click "Grant Access" to add users
                      </p>
                    </div>
                  ) : (
                    accessList.map((access) => (
                      <AccessListItem
                        key={access._id}
                        access={access}
                        onRevoke={handleRevokeAccess}
                        loading={loading}
                      />
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Please select
                </h3>
                <p className="text-gray-500">
                  Choose an item from the list to manage access permissions
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
            className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget && !loading) {
                // Only close if clicking the backdrop, not the modal
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Grant Access
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Add user access to{" "}
                      {selectedItem?.projectName || selectedItem?.testTypeName}
                    </p>
                  </div>
                  <button
                    onClick={() => !loading && setShowGrantModal(false)}
                    disabled={loading}
                    className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-5">
                {/* User Dropdown - GitHub Style */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    User <span className="text-red-500">*</span>
                  </label>
                  <div ref={userDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        !loading && setShowUserDropdown(!showUserDropdown)
                      }
                      disabled={loading}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                    >
                      <span
                        className={
                          selectedUser
                            ? "text-gray-900 text-sm"
                            : "text-gray-500 text-sm"
                        }
                      >
                        {selectedUser
                          ? `${selectedUser.name} (${selectedUser.email})`
                          : "Select a user"}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform ${showUserDropdown ? "rotate-180" : ""
                          }`}
                      />
                    </button>

                    <AnimatePresence>
                      {showUserDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-72 overflow-hidden"
                        >
                          {/* Search */}
                          <div className="p-2 border-b border-gray-200">
                            <input
                              type="text"
                              placeholder="Search users..."
                              value={userSearch}
                              onChange={(e) => setUserSearch(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          {/* User List */}
                          <div className="max-h-56 overflow-y-auto">
                            {filteredUsers.length === 0 ? (
                              <div className="px-4 py-8 text-center text-sm text-gray-500">
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
                                  className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between group transition-colors"
                                >
                                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                                      {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {user.name}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate">
                                        {user.email}
                                      </p>
                                    </div>
                                  </div>
                                  {grantForm.userId === user._id && (
                                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
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
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
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
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                        >
                          <Icon
                            className={`w-5 h-5 mx-auto mb-1 ${grantForm.accessLevel === level.value
                                ? "text-blue-600"
                                : "text-gray-500"
                              }`}
                          />
                          <p
                            className={`text-xs font-medium ${grantForm.accessLevel === level.value
                                ? "text-blue-900"
                                : "text-gray-700"
                              }`}
                          >
                            {level.label}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Expiration Date & Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Expiration Date & Time{" "}
                    <span className="text-xs text-gray-500 font-normal">
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
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-sm text-gray-700">
                          {selectedDate
                            ? selectedDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                            : "Date"}
                        </span>
                        <Calendar className="w-4 h-4 text-gray-500" />
                      </button>

                      <AnimatePresence>
                        {showCalendar && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className="absolute z-50 bottom-full mb-2 left-0 bg-white border border-gray-300 rounded-lg shadow-xl p-3 w-72"
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
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <ChevronDown className="w-4 h-4 rotate-90" />
                              </button>
                              <span className="text-sm font-semibold text-gray-900">
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
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <ChevronDown className="w-4 h-4 -rotate-90" />
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
                                  className="text-center text-xs font-medium text-gray-500 py-1"
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
                                      : "hover:bg-gray-100 text-gray-700"
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
                              className="w-full mt-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors font-medium"
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
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-sm text-gray-700">
                          {selectedTime.hours}:{selectedTime.minutes}{" "}
                          {selectedTime.period}
                        </span>
                        <Clock className="w-4 h-4 text-gray-500" />
                      </button>

                      <AnimatePresence>
                        {showTimePicker && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className="absolute z-50 bottom-full mb-2 right-0 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-64"
                          >
                            <div className="flex items-center justify-center space-x-2">
                              {/* Hours Dropdown */}
                              <div ref={hourDropdownRef} className="relative">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowHourDropdown(!showHourDropdown)
                                  }
                                  className="w-16 px-3 py-2 border border-gray-300 rounded-md text-center text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  {selectedTime.hours}
                                </button>
                                <AnimatePresence>
                                  {showHourDropdown && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -8 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -8 }}
                                      className="absolute z-50 mt-1 w-16 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"
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
                                            className={`w-full px-3 py-2 text-sm text-center hover:bg-gray-50 ${selectedTime.hours === hour
                                                ? "bg-blue-50 text-blue-600 font-medium"
                                                : ""
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

                              <span className="text-lg font-semibold text-gray-700">
                                :
                              </span>

                              {/* Minutes Dropdown */}
                              <div ref={minuteDropdownRef} className="relative">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowMinuteDropdown(!showMinuteDropdown)
                                  }
                                  className="w-16 px-3 py-2 border border-gray-300 rounded-md text-center text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  {selectedTime.minutes}
                                </button>
                                <AnimatePresence>
                                  {showMinuteDropdown && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -8 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -8 }}
                                      className="absolute z-50 mt-1 w-16 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"
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
                                            className={`w-full px-3 py-2 text-sm text-center hover:bg-gray-50 ${selectedTime.minutes === minute
                                                ? "bg-blue-50 text-blue-600 font-medium"
                                                : ""
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
                                  className="w-16 px-3 py-2 border border-gray-300 rounded-md text-center text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  {selectedTime.period}
                                </button>
                                <AnimatePresence>
                                  {showPeriodDropdown && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -8 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -8 }}
                                      className="absolute z-50 mt-1 w-16 bg-white border border-gray-300 rounded-md shadow-lg"
                                    >
                                      {["AM", "PM"].map((period) => (
                                        <button
                                          key={period}
                                          type="button"
                                          onClick={() =>
                                            handleTimeChange("period", period)
                                          }
                                          className={`w-full px-3 py-2 text-sm text-center hover:bg-gray-50 ${selectedTime.period === period
                                              ? "bg-blue-50 text-blue-600 font-medium"
                                              : ""
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
                      <p className="text-xs text-gray-600">
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
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                  {!selectedDate && (
                    <p className="text-xs text-gray-500 mt-2">
                      Leave empty for permanent access
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex justify-end space-x-3">
                <button
                  onClick={() => setShowGrantModal(false)}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
const AccessListItem = ({ access, onRevoke, loading }) => {
  const [showActions, setShowActions] = useState(false);

  const getLevelColor = (level) => {
    switch (level) {
      case "admin":
        return "bg-purple-100 text-purple-700";
      case "edit":
        return "bg-blue-100 text-blue-700";
      case "view":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 hover:bg-gray-50 transition-colors"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
            {access.userId?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900 truncate">
                {access.userId?.name || "Unknown User"}
              </h4>
              <span
                className={`px-2 py-1 text-xs font-medium rounded flex-shrink-0 ${getLevelColor(
                  access.accessLevel
                )}`}
              >
                {access.accessLevel}
              </span>
            </div>
            <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
              <p className="truncate">{access.userId?.email || "No email"}</p>
              {access.userId?.role && (
                <>
                  <span className="text-gray-300">•</span>
                  <p className="capitalize">{access.userId.role}</p>
                </>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showActions && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => onRevoke(access.userId._id)}
              disabled={loading}
              className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              title="Revoke Access"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3 pl-13 flex items-center space-x-3 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <User className="w-3 h-3" />
          <span>Granted by {access.grantedBy?.name || "Unknown"}</span>
        </div>
        <span className="text-gray-300">•</span>
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>{formatDate(access.createdAt)}</span>
        </div>
        {access.expiresAt && (
          <>
            <span className="text-gray-300">•</span>
            <div className="flex items-center space-x-1 text-orange-600">
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
