"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { User, LogOut, Mail } from "lucide-react";
import { FaCoffee } from "react-icons/fa";
import {
    GoogleArrowLeft,
    Folder,
    GoogleArrowUp,
} from "@/app/components/utils/Icon";
import { useProject } from "@/app/script/Project.context";
import { useAlert } from "@/app/script/Alert.context";
import { useConfirm } from "@/app/script/Confirm.context";
import { PROJECT_EVENTS } from "@/app/components/modules/Project-Management/App";
import { useSidebar } from "@/app/hooks/Project.sidebar.hook";

const ProjectSidebar = () => {
    const { isSidebarOpen, toggleSidebar } = useSidebar();
    const [projects, setProjects] = useState([]);
    const [hoveredProject, setHoveredProject] = useState(null);
    const [userData, setUserData] = useState(null);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { showAlert } = useAlert();
    const { showConfirm } = useConfirm();
    const { selectedProject, setSelectedProject } = useProject();
    const router = useRouter();

    const getToken = () => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("token");
        }
        return null;
    };

    const apiCall = async (endpoint, options = {}) => {
        const token = getToken();
        if (!token) {
            showAlert({
                type: "error",
                message: "Authentication token not found",
            });
            return null;
        }

        try {
            const response = await axios.get(`https://caffetest.onrender.com/api/v1${endpoint}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    ...options.headers,
                },
                ...options,
            });
            return response.data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            showAlert({
                type: "error",
                message: error.response?.data?.message || "Something went wrong",
            });
            return null;
        }
    };

    const fetchUserData = async () => {
        const result = await apiCall("/auth/me");
        if (result) {
            const user = result.data || result.user || result;
            setUserData(user);
        }
    };

    const fetchProjects = async () => {
        setIsLoading(true);
        let allProjects = [];
        let currentPage = 1;
        let totalPages = 1;

        do {
            const result = await apiCall(`/project/my-projects?page=${currentPage}&limit=50`);
            
            if (!result) break;

            const fetchedProjects = result.projects || [];
            allProjects = [...allProjects, ...fetchedProjects];

            if (result.pagination) {
                totalPages = result.pagination.totalPages;
                currentPage++;
            } else {
                break;
            }
        } while (currentPage <= totalPages);

        setProjects(allProjects);
        setIsLoading(false);
    };

    const handleProjectClick = (project) => {
        setSelectedProject(project);
        localStorage.setItem("currentProjectId", project._id);
    };

    const navigateToWorkspace = (project) => {
        handleProjectClick(project);
        router.push(`/app/projects/${project.slug}`);
    };

    const handleLogout = async () => {
        const result = await showConfirm({
            title: "Sign Out?",
            message: "Are you sure you want to sign out?",
            confirmText: "Sign Out",
            cancelText: "Cancel",
            type: "warning",
        });

        if (!result.isConfirmed) return;

        const token = getToken();
        try {
            if (token) {
                await axios.post(
                    "https://caffetest.onrender.com/api/v1/auth/logout",
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("currentProjectId");
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            router.push("/login");
        }
    };

    const getFirstWord = (user) => {
        const name = user?.name || user?.email || "";
        const firstWord = name.split(" ")[0];
        const formatted = firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
        return formatted.length > 5 ? formatted.slice(0, 5) + "." : formatted;
    };

    useEffect(() => {
        fetchUserData();
        fetchProjects();

        const handleProjectEvent = () => fetchProjects();

        if (typeof window !== "undefined") {
            window.addEventListener(PROJECT_EVENTS.CREATED, handleProjectEvent);
            window.addEventListener(PROJECT_EVENTS.UPDATED, handleProjectEvent);
            window.addEventListener(PROJECT_EVENTS.DELETED, handleProjectEvent);
            window.addEventListener(PROJECT_EVENTS.CHANGED, handleProjectEvent);
        }

        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener(PROJECT_EVENTS.CREATED, handleProjectEvent);
                window.removeEventListener(PROJECT_EVENTS.UPDATED, handleProjectEvent);
                window.removeEventListener(PROJECT_EVENTS.DELETED, handleProjectEvent);
                window.removeEventListener(PROJECT_EVENTS.CHANGED, handleProjectEvent);
            }
        };
    }, []);

    useEffect(() => {
        if (projects.length > 0) {
            const storedProjectId = localStorage.getItem("currentProjectId");
            if (storedProjectId) {
                const foundProject = projects.find((project) => project._id === storedProjectId);
                if (foundProject) {
                    setSelectedProject(foundProject);
                } else {
                    localStorage.removeItem("currentProjectId");
                }
            }
        }
    }, [projects]);

    const sidebarVariants = {
        open: { width: 280 },
        closed: { width: 64 },
    };

    const contentVariants = {
        open: { opacity: 1, x: 0 },
        closed: { opacity: 0, x: -20 },
    };

    const projectItemVariants = {
        hover: { backgroundColor: "#f8fafc", scale: 1.02 },
        tap: { scale: 0.98 },
    };

    const loadingVariants = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
    };

    const LoadingSkeleton = () => (
        <div className="space-y-2 mx-2">
            {[1, 2, 3].map((item) => (
                <motion.div
                    key={item}
                    variants={loadingVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="flex items-center px-4 py-3 rounded-xl border border-slate-200/60 bg-white dark:bg-slate-800 dark:border-slate-700"
                >
                    <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mr-3"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4"></div>
                    </div>
                </motion.div>
            ))}
        </div>
    );

    return (
        <motion.div
            variants={sidebarVariants}
            animate={isSidebarOpen ? "open" : "closed"}
            className="user-select-none h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 flex flex-col border-r border-slate-200/50 dark:border-slate-700/50 sticky top-0 sidebar-scrollbar"
        >
            <div className="flex items-center justify-center p-4 border-b border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <AnimatePresence mode="wait">
                    {isSidebarOpen ? (
                        <motion.div
                            key="open-header"
                            variants={contentVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="flex items-center justify-between w-full"
                        >
                            <div className="flex items-center">
                                <FaCoffee className="text-blue-900 dark:text-blue-400 w-7 h-7 mr-4 ml-3" />
                                <h2 className="font-semibold text-xl text-slate-700 dark:text-slate-200 tracking-tight">
                                    Projects - {userData ? getFirstWord(userData) : ""}
                                </h2>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, backgroundColor: "#f1f5f9" }}
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleSidebar}
                                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-200"
                            >
                                <GoogleArrowLeft />
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.button
                            tooltip-data="Open Sidebar"
                            tooltip-placement="right"
                            key="closed-header"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.1, backgroundColor: "#f1f5f9" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleSidebar}
                            className="p-2 rounded-full text-blue-900 dark:text-blue-400 hover:text-slate-950 dark:hover:text-slate-100 transition-all duration-200 cursor-pointer"
                        >
                            <FaCoffee className="h-5 w-5" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <LoadingSkeleton />
                    ) : projects.length > 0 ? (
                        projects.map((project) => (
                            <motion.div
                                key={project._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                whileHover="hover"
                                whileTap="tap"
                                variants={projectItemVariants}
                                onHoverStart={() => setHoveredProject(project._id)}
                                onHoverEnd={() => setHoveredProject(null)}
                                onClick={() => handleProjectClick(project)}
                                onDoubleClick={() => navigateToWorkspace(project)}
                                className={`mx-2 my-1 rounded-xl border transition-all duration-200 cursor-pointer ${
                                    selectedProject?._id === project._id
                                        ? "border-blue-300 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-700"
                                        : "border-transparent hover:border-slate-200/60 dark:hover:border-slate-700/60"
                                }`}
                            >
                                {isSidebarOpen ? (
                                    <div className="flex items-center px-4 py-3">
                                        <motion.div className="flex-shrink-0 mr-3">
                                            <Folder
                                                size={18}
                                                className={
                                                    selectedProject?._id === project._id
                                                        ? "text-blue-600 dark:text-blue-400"
                                                        : "text-blue-500 dark:text-blue-400"
                                                }
                                            />
                                        </motion.div>
                                        <span
                                            className={`font-medium truncate ${
                                                selectedProject?._id === project._id
                                                    ? "text-blue-700 dark:text-blue-300"
                                                    : "text-slate-700 dark:text-slate-200"
                                            }`}
                                        >
                                            {project.projectName}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center py-4">
                                        <motion.div
                                            whileHover={{ color: "#3b82f6" }}
                                            tooltip-data={project.projectName}
                                            tooltip-placement="right"
                                        >
                                            <Folder
                                                size={20}
                                                className={
                                                    selectedProject?._id === project._id
                                                        ? "text-blue-600 dark:text-blue-400"
                                                        : "text-slate-500 dark:text-slate-400"
                                                }
                                            />
                                        </motion.div>
                                    </div>
                                )}
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center p-8 text-center"
                        >
                            <Folder size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                            <p className="text-slate-500 dark:text-slate-400 text-sm">No projects found</p>
                            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                                Create your first project to get started
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-auto border-t border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky bottom-0">
                <AnimatePresence>
                    {profileDropdownOpen && isSidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute bottom-full left-0 right-0 mx-2 mb-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200/60 dark:border-slate-700/60 overflow-hidden z-10"
                        >
                            <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50">
                                <div className="font-medium text-slate-800 dark:text-slate-100 truncate">
                                    {userData?.name || "User"}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                                    <Mail size={14} />
                                    <span className="truncate">{userData?.email || "user@example.com"}</span>
                                </div>

                                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                                    <div className="flex items-center gap-1.5">
                                        <div
                                            className={`w-2 h-2 rounded-full ${
                                                userData?.role === "admin"
                                                    ? "bg-purple-500"
                                                    : userData?.role === "user"
                                                    ? "bg-blue-500"
                                                    : "bg-slate-500"
                                            }`}
                                        ></div>
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 capitalize">
                                            {userData?.role || "user"}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <div
                                            className={`w-2 h-2 rounded-full ${
                                                userData?.isActive ? "bg-green-500" : "bg-red-500"
                                            }`}
                                        ></div>
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                            {userData?.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <div
                                            className={`w-2 h-2 rounded-full ${
                                                userData?.isVerified ? "bg-green-500" : "bg-yellow-500"
                                            }`}
                                        ></div>
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                            {userData?.isVerified ? "Verified" : "Pending"}
                                        </span>
                                    </div>
                                </div>

                                {userData?.createdAt && (
                                    <div className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                                        Member since{" "}
                                        {new Date(userData.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/50 dark:border-slate-700/50">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="text-slate-600 dark:text-slate-400">User ID:</div>
                                    <div
                                        className="text-slate-800 dark:text-slate-200 font-mono truncate"
                                        title={userData?._id}
                                    >
                                        {userData?._id?.substring(0, 8)}...
                                    </div>

                                    <div className="text-slate-600 dark:text-slate-400">Last Updated:</div>
                                    <div className="text-slate-800 dark:text-slate-200">
                                        {userData?.updatedAt
                                            ? new Date(userData.updatedAt).toLocaleDateString()
                                            : "N/A"}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="w-full p-4 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors duration-150"
                                tooltip-data="Sign out from your account"
                                tooltip-placement="top"
                            >
                                <LogOut size={16} />
                                <span>Sign out</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors duration-150"
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                <User size={16} />
                            </div>

                            {userData?.isActive && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                            )}
                        </div>

                        {isSidebarOpen && (
                            <div className="text-left truncate max-w-[140px]">
                                <div className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                                    {userData?.name || "User"}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                                    <span>{userData?.email || "user@example.com"}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {isSidebarOpen && (
                        <motion.div
                            animate={{ rotate: profileDropdownOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <GoogleArrowUp size={16} className="text-slate-500 dark:text-slate-400" />
                        </motion.div>
                    )}
                </button>
            </div>
        </motion.div>
    );
};

export default ProjectSidebar;