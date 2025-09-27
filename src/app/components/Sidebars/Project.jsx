"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { User, LogOut, Mail } from "lucide-react";
import { ThreeDotsDropdown } from "@/app/components/assets/Dropdown";
import { FaCoffee } from "react-icons/fa";
import { GoogleArrowLeft, Folder, GoogleArrowUp } from "@/app/components/utils/Icon";
import { useProject } from "@/app/script/Project.context";
import { useAlert } from "@/app/script/Alert.context";
import { useConfirm } from "@/app/script/Confirm.context";

const ProjectSidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [projects, setProjects] = useState([]);
    const [hoveredProject, setHoveredProject] = useState(null);
    const [userData, setUserData] = useState(null);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    const { showAlert } = useAlert();
    const { showConfirm } = useConfirm();

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

    // Get token from localStorage
    const getToken = () => {
        return localStorage.getItem("token");
    };

    // Store project ID in localStorage
    const storeProjectId = (projectId) => {
        localStorage.setItem('currentProjectId', projectId);
    };

    // Fetch user data with token
    const fetchUserData = async () => {
        const token = getToken();
        if (!token) {
            showAlert({
                type: "error",
                message: "Authentication token not found"
            });
            return;
        }

        try {
            const res = await axios.get("http://localhost:5000/api/v1/auth/me", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const user = res.data?.data || res.data?.user || res.data;
            setUserData(user);

        } catch (err) {
            console.error("Error fetching user data", err);
            showAlert({
                type: "error",
                message: "Failed to fetch user data"
            });
        }
    };

    // Fetch projects with token
    const fetchProjects = async () => {
        const token = getToken();
        if (!token) {
            showAlert({
                type: "error",
                message: "Authentication token not found"
            });
            return;
        }

        try {
            const res = await axios.get("http://localhost:5000/api/v1/project/my-projects", {
                headers: { Authorization: `Bearer ${token}` },
            });

            setProjects(res.data.projects || []);

        } catch (err) {
            console.error("Error fetching projects", err);
            setProjects([]);
            showAlert({
                type: "error",
                message: "Failed to fetch projects"
            });
        }
    };

    useEffect(() => {
        fetchUserData();
        fetchProjects();
    }, []);

    // Add this useEffect after your existing useEffects in the ProjectSidebar component

    useEffect(() => {
        // Restore selected project from localStorage after projects are loaded
        if (projects.length > 0) {
            const storedProjectId = localStorage.getItem('currentProjectId');
            if (storedProjectId) {
                const foundProject = projects.find(project => project._id === storedProjectId);
                if (foundProject) {
                    setSelectedProject(foundProject);
                } else {
                    // Project not found (maybe deleted), clear storage
                    localStorage.removeItem('currentProjectId');
                }
            }
        }
    }, [projects]); // Run when projects array changes

    // Handle project click - store in context and localStorage
    const handleProjectClick = (project) => {
        setSelectedProject(project);
        storeProjectId(project._id);
    };

    // Delete project with confirmation
    // Delete project with confirmation
    const deleteProject = async (projectId) => {
        const project = projects.find(p => p._id === projectId);
        if (!project) return;

        try {
            // showConfirm should return a promise with the result
            const result = await showConfirm({
                title: `Delete "${project.projectName}"?`,
                message: "This action cannot be undone. All project data will be permanently lost.",
                confirmText: "Delete Project",
                cancelText: "Keep Project",
                type: "danger",
            });

            // Check if user confirmed the action
            if (!result || !result.isConfirmed) {
                return;
            }

            const token = getToken();
            if (!token) {
                showAlert({
                    type: "error",
                    message: "Authentication token not found"
                });
                return;
            }

            showAlert({
                type: "info",
                message: "Deleting project...",
                duration: 0
            });

            await axios.delete(`http://localhost:5000/api/v1/project/${projectId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });

            // Update projects list
            setProjects(projects.filter((p) => p._id !== projectId));

            // Clear selected project if it was the deleted one
            if (selectedProject && selectedProject._id === projectId) {
                setSelectedProject(null);
                localStorage.removeItem("currentProjectId");
            }

            showAlert({
                type: "success",
                message: `"${project.projectName}" deleted successfully`,
            });

        } catch (err) {
            console.error("Error deleting project", err);

            // Handle different types of errors
            if (err.response?.status === 401) {
                showAlert({
                    type: "error",
                    message: "Authentication failed. Please login again."
                });
                // Redirect to login or handle auth failure
            } else {
                showAlert({
                    type: "error",
                    message: err.response?.data?.message || "Failed to delete the project. Please try again.",
                });
            }
        }
    };
    // Handle logout
    const handleLogout = async () => {
        const result = await showConfirm({
            title: "Sign Out?",
            message: "Are you sure you want to sign out?",
            confirmText: "Sign Out",
            cancelText: "Cancel",
            type: "warning",
        });

        if (!result.isConfirmed) {
            return;
        }

        const token = getToken();
        try {
            if (token) {
                await axios.post("http://localhost:5000/api/v1/auth/logout", {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
        } catch (err) {
            console.error("Error during logout", err);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("currentProjectId");
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            router.push("/login");
        }
    };

    // Navigate to project workspace
    const navigateToWorkspace = (project) => {
        handleProjectClick(project);
        router.push(`/app/projects/${project.slug}`);
    };

    // Format user name display
    const getFirstWord = (user) => {
        const name = user?.name || user?.email || "";
        const firstWord = name.split(" ")[0];
        const formatted = firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
        return formatted.length > 5 ? formatted.slice(0, 5) + "." : formatted;
    };

    // Refresh projects after modal operations
    const handleModalSuccess = () => {
        fetchProjects();
    };

    // Animation variants
    const sidebarVariants = {
        open: { width: 280 },
        closed: { width: 64 }
    };

    const contentVariants = {
        open: { opacity: 1, x: 0 },
        closed: { opacity: 0, x: -20 }
    };

    const projectItemVariants = {
        hover: { backgroundColor: "#f8fafc", scale: 1.02 },
        tap: { scale: 0.98 }
    };

    // Dropdown options for project actions
    const getProjectOptions = (project) => [
        {
            label: "Edit",
            icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" /></svg>,
            onClick: () => openEditModal(project),
        },
        {
            label: "Workspace",
            icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h6v6H9z" /></svg>,
            onClick: () => navigateToWorkspace(project),
        },
        {
            label: "Delete",
            icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>,
            onClick: () => deleteProject(project._id),
            danger: true
        }
    ];

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
                                    <GoogleArrowLeft />
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
                                <FaCoffee className="h-5 w-5" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* Projects List */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                    <AnimatePresence>
                        {projects.map((project) => (
                            <motion.div
                                key={project._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                whileHover="hover"
                                whileTap="tap"
                                onHoverStart={() => setHoveredProject(project._id)}
                                onHoverEnd={() => setHoveredProject(null)}
                                className={`mx-2 my-1 rounded-xl border transition-all duration-200 ${selectedProject?._id === project._id
                                    ? 'border-blue-300 bg-blue-50'
                                    : 'border-transparent hover:border-slate-200/60'
                                    }`}
                            >
                                {isOpen ? (
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <div
                                            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                                            onClick={() => handleProjectClick(project)}
                                        >
                                            <motion.div className="flex-shrink-0">
                                                <Folder size={18} className={
                                                    selectedProject?._id === project._id
                                                        ? "text-blue-600"
                                                        : "text-blue-500"
                                                } />
                                            </motion.div>
                                            <span className={`font-medium truncate ${selectedProject?._id === project._id
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
                                            <ThreeDotsDropdown options={getProjectOptions(project)} />
                                        </motion.div>
                                    </div>
                                ) : (
                                    <div
                                        className="flex items-center justify-center py-4 cursor-pointer"
                                        onClick={() => handleProjectClick(project)}
                                    >
                                        <motion.div
                                            whileHover={{ color: "#3b82f6" }}
                                            data-tooltip={project.projectName}
                                        >
                                            <Folder size={20} className={
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

                                    {/* Role and Status Information */}
                                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                                        {/* Role Badge */}
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${userData?.role === 'admin' ? 'bg-purple-500' :
                                                userData?.role === 'user' ? 'bg-blue-500' :
                                                    'bg-gray-500'
                                                }`}></div>
                                            <span className="text-xs font-medium text-slate-700 capitalize">
                                                {userData?.role || 'user'}
                                            </span>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${userData?.isActive ? 'bg-green-500' : 'bg-red-500'
                                                }`}></div>
                                            <span className="text-xs font-medium text-slate-700">
                                                {userData?.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>

                                        {/* Verification Status */}
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${userData?.isVerified ? 'bg-green-500' : 'bg-yellow-500'
                                                }`}></div>
                                            <span className="text-xs font-medium text-slate-700">
                                                {userData?.isVerified ? 'Verified' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Member Since */}
                                    {userData?.createdAt && (
                                        <div className="mt-2 text-xs text-slate-400">
                                            Member since {new Date(userData.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Additional User Info */}
                                <div className="p-3 bg-slate-50 border-b border-slate-200/50">
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="text-slate-600">User ID:</div>
                                        <div className="text-slate-800 font-mono truncate" title={userData?._id}>
                                            {userData?._id?.substring(0, 8)}...
                                        </div>

                                        <div className="text-slate-600">Last Updated:</div>
                                        <div className="text-slate-800">
                                            {userData?.updatedAt ? new Date(userData.updatedAt).toLocaleDateString() : 'N/A'}
                                        </div>
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
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                    <User size={16} />
                                </div>

                                {/* Online Status Indicator */}
                                {userData?.isActive && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                )}

                            </div>

                            {isOpen && (
                                <div className="text-left truncate max-w-[140px]">
                                    <div className="text-sm font-medium text-slate-800 truncate">
                                        {userData?.name || "User"}
                                    </div>
                                    <div className="text-xs text-slate-500 truncate flex items-center gap-1">
                                        <span>{userData?.email || "user@example.com"}</span>
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

            {/* Project Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <ProjectModal
                        project={modalMode === 'edit' ? selectedProject : null}
                        token={getToken()}
                        onClose={closeModal}
                        onSuccess={handleModalSuccess}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default ProjectSidebar;