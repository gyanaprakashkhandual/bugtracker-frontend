"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Plus,
  FolderOpen,
  User,
  LogOut,
  Mail,
  ChevronDown,
  ChevronUp,
  Settings,
  Copy,
} from "lucide-react";
import { ThreeDotsDropdown } from "../assets/Dropdown";
import ProjectModal from "../assets/Modal";
import { FaCoffee } from "react-icons/fa";
import { GoogleArrowLeft, GoogleArrowRight, GoogleArrowUp } from "../utils/Icon";

import { useProject } from "@/app/script/Projectcontext";
import { CalfFolder } from "../utils/Icon";
import { getProjectDetails } from "@/app/utils/functions/GetProjectDetails";
import { getTestTypes } from "@/app/utils/functions/GetTestType";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [projects, setProjects] = useState([]);
  const [hoveredProject, setHoveredProject] = useState(null);
  const [userData, setUserData] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [token, setToken] = useState(null);

  // ✅ use context instead of local state
  const { 
    isModalOpen, 
    modalMode, 
    openCreateModal, 
    openEditModal, 
    closeModal,
    selectedProject, 
    setSelectedProject
  } = useProject();
  const router = useRouter();

  // Utility function to store project ID in localStorage
  const storeProjectId = (projectId) => {
    localStorage.setItem('currentProjectId', projectId);
  };

  // Utility function to get stored project ID
  const getStoredProjectId = () => {
    return localStorage.getItem('currentProjectId');
  };

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:5000/api/v1/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Full API Response:", res.data);
      const user = res.data?.data || res.data?.user || res.data;
      setUserData(user);
      if (user) {
        console.log("User Email:", user.email || "Not provided");
        console.log("User Name:", user.name || "Not provided");
      } else {
        console.warn("No user data found in response");
      }
    } catch (err) {
      console.error("Error fetching user data", err);
    }
  };

  const fetchProjects = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      // Use the new API endpoint for getting user's own projects
      const res = await axios.get("http://localhost:5000/api/v1/project/my-projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("API response:", res.data);
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error("Error fetching projects", err);
      setProjects([]);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchProjects();
  }, []);

  const deleteProject = async (projectId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/api/v1/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(projects.filter((p) => p._id !== projectId));
      
      if (selectedProject && selectedProject._id === projectId) {
  setSelectedProject(null);
  localStorage.removeItem("currentProjectId");
}

    } catch (err) {
      console.error("Error deleting project", err);
    }
  };
const handleProjectClick = (project) => {
  setSelectedProject(project);        // ✅ store in context
  localStorage.setItem("currentProjectId", project._id); // ✅ persist if needed
};



  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post("http://localhost:5000/api/v1/auth/logout", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Error during logout", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("currentProjectId"); // Clear stored project ID
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.push("/login");
    }
  };

  const getFirstWord = (user) => {
  const name = user?.name || user?.email || "";
  const firstWord = name.split(" ")[0]; // take first word before space
  const formatted =
    firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();

  return formatted.length > 5 ? formatted.slice(0, 5) + "." : formatted;



};


  const handleModalSuccess = () => {
    fetchProjects(); // Refresh the projects list
  };

  const sidebarVariants = {
    open: {
      width: 280,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    },
    closed: {
      width: 64,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    }
  };

  const contentVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.1,
        duration: 0.2
      }
    },
    closed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.1
      }
    }
  };

  const projectItemVariants = {
    hover: {
      backgroundColor: "#f8fafc",
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    },
    tap: {
      scale: 0.98
    }
  };

  return (
    <>
      <motion.div
        variants={sidebarVariants}
        animate={isOpen ? "open" : "closed"}
        className="h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800 flex flex-col border-r border-slate-200/50 sticky top-0 sidebar-scrollbar"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-center p-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="open-header"
                variants={contentVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center">
                  <FaCoffee className="text-blue-900 w-7 h-7 mr-4 ml-3" />
                 <h2 className="font-semibold text-xl text-slate-700 tracking-tight">
  Projects - {userData ? getFirstWord(userData) : ""}
</h2>

                </div>
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: "#f1f5f9" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(!isOpen)}
                  className="p-2 rounded-full text-slate-500 hover:text-slate-700 transition-all duration-200"
                >
                  <GoogleArrowLeft/>
                </motion.button>
              </motion.div>
            ) : (
              <motion.button
                key="closed-header"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1, backgroundColor: "#f1f5f9" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full text-blue-900 hover:text-slate-950 transition-all duration-200"
              >
                <FaCoffee className="h-5 w-5"/>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        {/* Projects List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          <AnimatePresence>
            {projects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                whileHover="hover"
                whileTap="tap"
                onHoverStart={() => setHoveredProject(project._id)}
                onHoverEnd={() => setHoveredProject(null)}
                className={`mx-2 my-1 rounded-xl border transition-all duration-200 ${
                  selectedProject?._id === project._id 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-transparent hover:border-slate-200/60'
                }`}
              >
                {isOpen ? (
                  <div className="flex items-center justify-between px-4 py-3">
                    <div 
                      className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleProjectClick(project)} // This now only selects the project
                    >
                      <motion.div className="flex-shrink-0">
                        <CalfFolder size={18} className={
                          selectedProject?._id === project._id 
                            ? "text-blue-600" 
                            : "text-blue-500"
                        } />
                      </motion.div>
                      <span className={`font-medium truncate ${
                        selectedProject?._id === project._id 
                          ? 'text-blue-700' 
                          : 'text-slate-700'
                      }`}>
                        {project.projectName}
                      </span>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: hoveredProject === project._id ? 1 : 0.7,
                        scale: hoveredProject === project._id ? 1 : 0.8
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <ThreeDotsDropdown
                        options={[
                          {
                            label: "Edit",
                            icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" /></svg>,
                            onClick: () => openEditModal(project), // Use context function to open edit modal
                          },
                          {
                            label: "Configure",
                            icon: <svg
                              width="16"
                              height="16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              viewBox="0 0 24 24"
                            >
                              <circle cx="12" cy="12" r="3" />
                              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09c0 .7.4 1.31 1 1.51.62.22 1.31.09 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.42.51-.55 1.2-.33 1.82.2.6.81 1 1.51 1H21a2 2 0 1 1 0 4h-.09c-.7 0-1.31.4-1.51 1z" />
                            </svg>,
                            onClick: () => {
                              setSelectedProject(project);
                              storeProjectId(project._id);
                            },
                          },
                          {
                            label: "Workspace",
                            icon: (
                              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <path d="M9 9h6v6H9z" />
                              </svg>
                            ),
                            onClick: () => {
                              handleProjectClick(project);
                              router.push(`/app/projects/${project.slug}`);
                            },
                          },
                          {
                            label: "Delete",
                            icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>,
                            onClick: () => deleteProject(project._id),
                            danger: true
                          }
                        ]}
                      />
                    </motion.div>
                  </div>
                ) : (
                  <div 
                    className="flex items-center justify-center py-4 cursor-pointer"
                    onClick={() => handleProjectClick(project)} // This now only selects the project
                  >
                    <motion.div
                      whileHover={{
                        color: "#3b82f6"
                      }}
                      data-tooltip={project.projectName}
                      data-position="top"
                    >
                      <CalfFolder size={20} className={
                        selectedProject?._id === project._id 
                          ? "text-blue-600" 
                          : "text-slate-500"
                      } />
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Profile Footer */}
        <div className="mt-auto border-t border-slate-200/60 bg-white/80 backdrop-blur-sm sticky bottom-0">
          <AnimatePresence>
            {profileDropdownOpen && isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full left-0 right-0 mx-2 mb-1 bg-white rounded-lg shadow-lg border border-slate-200/60 overflow-hidden z-10"
              >
                <div className="p-4 border-b border-slate-200/50">
                  <div className="font-medium text-slate-800 truncate">{userData?.name || "User"}</div>
                  <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                    <Mail size={14} />
                    <span className="truncate">{userData?.email || "user@example.com"}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full p-4 text-left text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors duration-150"
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-100/50 transition-colors duration-150"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <User size={16} />
              </div>
              {isOpen && (
                <div className="text-left truncate max-w-[140px]">
                  <div className="text-sm font-medium text-slate-800 truncate">
                    {userData?.name || "User"}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {userData?.email || "user@example.com"}
                  </div>
                </div>
              )}
            </div>

            {isOpen && (
              <motion.div
                animate={{ rotate: profileDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <GoogleArrowUp size={16} className="text-slate-500" />
              </motion.div>
            )}
          </button>
        </div>
      </motion.div>

      {/* Project Modal - Only show when modal is explicitly opened for editing or creating */}
      <AnimatePresence>
        {isModalOpen && (
          <ProjectModal
            project={modalMode === 'edit' ? selectedProject : null}
            token={token}
            onClose={closeModal} // Use the context function to close modal
            onSuccess={handleModalSuccess}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;

import { Cog, Database, Shield } from 'lucide-react';


const SettingSidebar = ({ isOpen, toggleSidebar }) => {
  const [testTypes, setTestTypes] = useState([]);
  const [projectDetails, setProjectDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [activeMenu, setActiveMenu] = useState('project'); // 'project', 'app', 'database', 'security'

  // Fetch data when sidebar opens
  useEffect(() => {
    if (isOpen && activeMenu === 'project') {
      fetchData();
    }
  }, [isOpen, activeMenu]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [project, testTypesResponse] = await Promise.all([
        getProjectDetails(),
        getTestTypes()
      ]);

      setProjectDetails(project);
      setTestTypes(testTypesResponse?.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(`${type}-${text}`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const sidebarVariants = {
    closed: {
      x: '100%',
      opacity: 0,
    },
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }
    }
  };

  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 }
  };

  const itemVariants = {
    closed: { x: 20, opacity: 0 },
    open: { x: 0, opacity: 1 }
  };

  const menuItems = [
    { id: 'project', icon: FolderOpen },
    { id: 'app', icon: Cog },
    { id: 'database', icon: Database },
    { id: 'security', icon: Shield }
  ];

  const CopyButton = ({ text, type, label }) => {
    const isCopied = copiedId === `${type}-${text}`;

    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => copyToClipboard(text, type)}
        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded"
        title={`Copy ${label}`}
      >
        {isCopied ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </motion.button>
    );
  };

  const renderProjectDetails = () => (
    <div className="space-y-6">
      {/* Project Information */}
      {projectDetails && (
        <motion.div
          initial="closed"
          animate="open"
          variants={itemVariants}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            {projectDetails.projectName}
          </h3>
          <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                Project ID
              </p>
              <p className="text-sm font-mono text-gray-700 mt-1">
                {projectDetails._id}
              </p>
            </div>
            <CopyButton
              text={projectDetails._id}
              type="project"
              label="Project ID"
            />
          </div>
        </motion.div>
      )}

      {/* Test Types */}
      <motion.div
        initial="closed"
        animate="open"
        variants={itemVariants}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Test Types ({testTypes.length})
        </h3>

        <div className="space-y-3">
          {testTypes.map((testType, index) => (
            <motion.div
              key={testType._id}
              initial="closed"
              animate="open"
              variants={itemVariants}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 text-sm">
                      {testType.testTypeName}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {testType.testTypeDesc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                      Test Type ID
                    </p>
                    <p className="text-xs font-mono text-gray-700 mt-1 break-all">
                      {testType._id}
                    </p>
                  </div>
                  <CopyButton
                    text={testType._id}
                    type="testType"
                    label="Test Type ID"
                  />
                </div>

                {/* Framework Badge */}
                <div className="mt-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {testType.testFramework}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {testTypes.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No test types found</p>
          </div>
        )}
      </motion.div>
    </div>
  );

  const renderAppPreferences = () => (
    <div className="space-y-6">
      <motion.div
        initial="closed"
        animate="open"
        variants={itemVariants}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {/* Theme Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-medium text-gray-800 mb-3">Theme</h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-3">
              <input type="radio" name="theme" className="text-blue-600" defaultChecked />
              <span className="text-sm text-gray-700">Light Theme</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="radio" name="theme" className="text-blue-600" />
              <span className="text-sm text-gray-700">Dark Theme</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="radio" name="theme" className="text-blue-600" />
              <span className="text-sm text-gray-700">Auto (System)</span>
            </label>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-medium text-gray-800 mb-3">Personal Information</h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                Display Name
              </label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                Email
              </label>
              <input
                type="email"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
          </div>
        </div>

        {/* Key Management */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-medium text-gray-800 mb-3">API Key Management</h4>
          <div className="space-y-3">
            <button className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-md text-sm text-blue-700 transition-colors">
              Generate New API Key
            </button>
            <button className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm text-gray-700 transition-colors">
              View Active Keys
            </button>
            <button className="w-full text-left px-3 py-2 bg-red-50 hover:bg-red-100 rounded-md text-sm text-red-700 transition-colors">
              Revoke All Keys
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderDatabaseSettings = () => (
    <div className="space-y-6">
      <motion.div
        initial="closed"
        animate="open"
        variants={itemVariants}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {/* Connection Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-medium text-gray-800 mb-3">Database Connection</h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                Connection String
              </label>
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="password"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="mongodb://localhost:27017"
                />
                <button className="px-3 py-2 bg-green-600 text-white rounded-md text-xs hover:bg-green-700 transition-colors">
                  Test
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Auto-connect on startup</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-medium text-gray-800 mb-3">Backup & Restore</h4>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-md text-sm text-blue-700 transition-colors">
              Create Backup
            </button>
            <button className="w-full text-left px-3 py-2 bg-green-50 hover:bg-green-100 rounded-md text-sm text-green-700 transition-colors">
              Restore from Backup
            </button>
            <button className="w-full text-left px-3 py-2 bg-orange-50 hover:bg-orange-100 rounded-md text-sm text-orange-700 transition-colors">
              Schedule Auto Backup
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderSecurityAccess = () => (
    <div className="space-y-6">
      <motion.div
        initial="closed"
        animate="open"
        variants={itemVariants}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {/* Access Control */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-medium text-gray-800 mb-3">Access Control</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Two-Factor Authentication</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Session Timeout (mins)</span>
              <input
                type="number"
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                defaultValue="30"
              />
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-medium text-gray-800 mb-3">User Management</h4>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-md text-sm text-blue-700 transition-colors">
              Invite Team Members
            </button>
            <button className="w-full text-left px-3 py-2 bg-green-50 hover:bg-green-100 rounded-md text-sm text-green-700 transition-colors">
              Manage Permissions
            </button>
            <button className="w-full text-left px-3 py-2 bg-yellow-50 hover:bg-yellow-100 rounded-md text-sm text-yellow-700 transition-colors">
              Audit Logs
            </button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-medium text-gray-800 mb-3">Security Settings</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Encrypt Test Data</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <button className="w-full text-left px-3 py-2 bg-red-50 hover:bg-red-100 rounded-md text-sm text-red-700 transition-colors">
              Reset Security Settings
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderContent = () => {
    if (loading && activeMenu === 'project') {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      );
    }

    switch (activeMenu) {
      case 'project':
        return renderProjectDetails();
      case 'app':
        return renderAppPreferences();
      case 'database':
        return renderDatabaseSettings();
      case 'security':
        return renderSecurityAccess();
      default:
        return renderProjectDetails();
    }
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            onClick={toggleSidebar}
            className="fixed inset-0"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="fixed top-0 right-0 min-h-[calc(100vh-65px)] max-h-[calc(100vh-65px)] w-96 bg-[radial-gradient(circle_at_center,theme(colors.blue.50),theme(colors.sky.50),white)] z-50 flex flex-col mt-[65px]"
          >

            {/* Menu Navigation */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => setActiveMenu(item.id)}
                      className={`flex-1 flex flex-col items-center py-3 px-2 text-xs font-medium transition-all duration-200 ${activeMenu === item.id
                          ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-white'
                        }`}
                    >
                      <Icon className="h-4 w-4 mb-1" />
                      <span className="text-center leading-tight">{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeMenu}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};



export { Sidebar, SettingSidebar };