import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Menu,
    Search,
    Calendar,
    Clock,
    Edit,
    Save,
    X,
    Archive,
    Trash2,
    ChevronLeft,
    ChevronRight,
    MessageSquare,
    Send,
    Loader2,
    Copy,
    Check,
    Upload,
    Link2,
    Image as ImageIcon,
} from "lucide-react";
import { useAlert } from "@/app/script/Alert.context";
import { useTestType } from "@/app/script/TestType.context";
import { useConfirm } from "@/app/script/Confirm.context";
import { GoogleArrowDown, GoogleArrowRight } from "@/app/components/utils/Icon";

const BASE_URL = "http://localhost:5000/api/v1/test-case";

// GitHub-style Dropdown Component
const GitHubDropdown = ({ value, options, onChange, label, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex items-center justify-between gap-2"
            >
                <span className="font-medium text-gray-700 truncate">{value}</span>
                <GoogleArrowDown size={12} className="text-gray-500 flex-shrink-0" />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
                    >
                        {options.map((option) => (
                            <motion.button
                                key={option}
                                whileHover={{ backgroundColor: "#f3f4f6" }}
                                onClick={() => {
                                    onChange(option);
                                    setIsOpen(false);
                                }}
                                className="w-full px-3 py-2 text-xs text-left text-gray-700 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
                            >
                                {option}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const TestCaseSplitView = () => {
    const { showAlert } = useAlert();
    const { showConfirm } = useConfirm();
    const { testTypeId, testTypeName } = useTestType();

    const projectId =
        typeof window !== "undefined"
            ? localStorage.getItem("currentProjectId")
            : null;
    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // State Management
    const [testCases, setTestCases] = useState([]);
    const [selectedTestCase, setSelectedTestCase] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [sidebarWidth, setSidebarWidth] = useState(400);
    const [isResizing, setIsResizing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [selectedImageModal, setSelectedImageModal] = useState(null);
    const [imageDropdownOpen, setImageDropdownOpen] = useState(false);
    const [refLinkDropdownOpen, setRefLinkDropdownOpen] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);

    const sidebarRef = useRef(null);
    const datePickerRef = useRef(null);
    const fileInputRef = useRef(null);

    // Fetch Test Cases
    const fetchTestCases = async () => {
        if (!projectId || !testTypeId || !token) return;

        setLoading(true);
        try {
            let url = `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases`;

            // Add date filter if present
            if (dateFilter.start && dateFilter.end) {
                url = `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases/filter/custom-date-range?startDate=${dateFilter.start}&endDate=${dateFilter.end}`;
            }

            // Add search if present
            if (searchTerm.trim()) {
                url = `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases/search?search=${encodeURIComponent(searchTerm)}`;
            }

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setTestCases(data.testCases || []);
            } else {
                showAlert({ type: "error", message: data.message || "Failed to fetch test cases" });
            }
        } catch (error) {
            showAlert({ type: "error", message: "Error fetching test cases" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTestCases();
    }, [projectId, testTypeId, dateFilter]);

    // Handle Search with Debounce
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (searchTerm) {
                fetchTestCases();
            }
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

    // Filter Test Cases
    const filteredTestCases = testCases.filter((tc) => {
        const matchesSearch =
            searchTerm === "" ||
            tc.testCaseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tc.testCaseDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tc.moduleName?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    // Fetch Comments
    const fetchComments = async (testCaseId) => {
        // Placeholder - implement when comment API is available
        setComments([]);
    };

    // Submit Comment
    const submitComment = async (testCaseId) => {
        if (!newComment.trim()) return;

        setSubmittingComment(true);
        try {
            // Placeholder - implement when comment API is available
            showAlert({ type: "info", message: "Comment feature coming soon" });
            setNewComment("");
        } catch (error) {
            showAlert({ type: "error", message: "Error submitting comment" });
        } finally {
            setSubmittingComment(false);
        }
    };

    // Handle Edit
    const handleEditClick = () => {
        setIsEditing(true);
        setEditFormData({
            moduleName: selectedTestCase.moduleName || "",
            testCaseType: selectedTestCase.testCaseType || "",
            testCaseDescription: selectedTestCase.testCaseDescription || "",
            actualResult: selectedTestCase.actualResult || "",
            expectedResult: selectedTestCase.expectedResult || "",
            severity: selectedTestCase.severity || "Medium",
            priority: selectedTestCase.priority || "Medium",
            status: selectedTestCase.status || "New",
            image: selectedTestCase.image || [],
        });
        setSelectedImages(selectedTestCase.image || []);
    };

    const handleSaveClick = async () => {
        try {
            const response = await fetch(`${BASE_URL}/test-cases/${selectedTestCase._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...editFormData,
                    image: selectedImages,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showAlert({ type: "success", message: "Test case updated successfully" });
                setSelectedTestCase(data.testCase);
                setIsEditing(false);
                fetchTestCases();
            } else {
                showAlert({ type: "error", message: data.message || "Failed to update test case" });
            }
        } catch (error) {
            showAlert({ type: "error", message: "Error updating test case" });
        }
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setEditFormData({});
        setSelectedImages(selectedTestCase.image || []);
    };

    // Handle Field Edit (Dropdowns)
    const handleFieldEdit = async (field, value) => {
        try {
            const response = await fetch(`${BASE_URL}/test-cases/${selectedTestCase._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...selectedTestCase,
                    [field]: value,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showAlert({ type: "success", message: `${field} updated successfully` });
                setSelectedTestCase(data.testCase);
                fetchTestCases();
            } else {
                showAlert({ type: "error", message: data.message || "Failed to update test case" });
            }
        } catch (error) {
            showAlert({ type: "error", message: "Error updating test case" });
        }
    };

    // Move to Trash
    const moveTestCaseToTrash = async (testCaseId) => {
        const result = await showConfirm({
            title: "Move Test Case to Trash",
            message: "Are you sure you want to move this test case to trash?",
            confirmText: "Move to Trash",
            cancelText: "Cancel",
            type: "warning",
        });

        if (!result) return;

        try {
            const response = await fetch(`${BASE_URL}/test-cases/${testCaseId}/trash`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                showAlert({ type: "success", message: "Test case moved to trash" });
                fetchTestCases();
                setSelectedTestCase(null);
            } else {
                showAlert({ type: "error", message: data.message || "Failed to move test case to trash" });
            }
        } catch (error) {
            showAlert({ type: "error", message: "Error moving test case to trash" });
        }
    };

    // Delete Permanently
    const deleteTestCasePermanently = async (testCaseId) => {
        const result = await showConfirm({
            title: "Delete Test Case Permanently",
            message: "This action cannot be undone! Are you sure you want to permanently delete this test case?",
            confirmText: "Delete Permanently",
            cancelText: "Cancel",
            type: "danger",
        });

        if (!result) return;

        try {
            const response = await fetch(`${BASE_URL}/test-cases/${testCaseId}/permanent`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                showAlert({ type: "success", message: "Test case deleted permanently" });
                fetchTestCases();
                setSelectedTestCase(null);
            } else {
                showAlert({ type: "error", message: data.message || "Failed to delete test case" });
            }
        } catch (error) {
            showAlert({ type: "error", message: "Error deleting test case" });
        }
    };

    // Bulk Move to Trash
    const moveAllTestCasesToTrash = async () => {
        const result = await showConfirm({
            title: "Move All Test Cases to Trash",
            message: "Are you sure you want to move all test cases to trash? This action cannot be undone!",
            confirmText: "Move to Trash",
            cancelText: "Cancel",
            type: "warning",
        });

        if (!result) return;

        try {
            const testCaseIds = testCases.map((tc) => tc._id);
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases/bulk-move-to-trash`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ testCaseIds }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                showAlert({ type: "success", message: data.message || "All test cases moved to trash" });
                fetchTestCases();
                setSelectedTestCase(null);
            } else {
                showAlert({ type: "error", message: data.message || "Failed to move test cases to trash" });
            }
        } catch (error) {
            showAlert({ type: "error", message: "Error moving test cases to trash" });
        }
    };

    // Bulk Delete Permanently
    const deleteAllTestCasesPermanently = async () => {
        const result = await showConfirm({
            title: "Delete All Test Cases Permanently",
            message: "This action cannot be undone! Are you sure you want to permanently delete all test cases?",
            confirmText: "Delete Permanently",
            cancelText: "Cancel",
            type: "danger",
        });

        if (!result) return;

        try {
            const testCaseIds = testCases.map((tc) => tc._id);
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases/bulk-delete`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ testCaseIds }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                showAlert({ type: "success", message: data.message || "All test cases deleted permanently" });
                fetchTestCases();
                setSelectedTestCase(null);
            } else {
                showAlert({ type: "error", message: data.message || "Failed to delete test cases" });
            }
        } catch (error) {
            showAlert({ type: "error", message: "Error deleting test cases" });
        }
    };

    // Navigation
    const goToPreviousTestCase = () => {
        const currentIndex = filteredTestCases.findIndex((tc) => tc._id === selectedTestCase._id);
        if (currentIndex > 0) {
            setSelectedTestCase(filteredTestCases[currentIndex - 1]);
            fetchComments(filteredTestCases[currentIndex - 1]._id);
        }
    };

    const goToNextTestCase = () => {
        const currentIndex = filteredTestCases.findIndex((tc) => tc._id === selectedTestCase._id);
        if (currentIndex < filteredTestCases.length - 1) {
            setSelectedTestCase(filteredTestCases[currentIndex + 1]);
            fetchComments(filteredTestCases[currentIndex + 1]._id);
        }
    };

    // Image Upload
    const handleImageUpload = async (files) => {
        if (!files || files.length === 0) return;

        setUploadingImages(true);
        try {
            // Placeholder - implement image upload to your backend
            const uploadedUrls = Array.from(files).map((file) => URL.createObjectURL(file));
            setSelectedImages((prev) => [...prev, ...uploadedUrls]);
            showAlert({ type: "success", message: "Images uploaded successfully" });
        } catch (error) {
            showAlert({ type: "error", message: "Error uploading images" });
        } finally {
            setUploadingImages(false);
        }
    };

    const removeImage = (index) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    };

    // Utility Functions
    const copyText = (text) => {
        navigator.clipboard.writeText(text);
        showAlert({ type: "success", message: "Copied to clipboard" });
    };

    const copyToClipboard = (text, showAlert) => {
        navigator.clipboard.writeText(text);
        showAlert({ type: "success", message: "Copied to clipboard" });
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        showAlert({ type: "success", message: "Link copied to clipboard" });
    };

    // Sidebar Resize
    const startResizing = () => {
        setIsResizing(true);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;
            const newWidth = e.clientX;
            if (newWidth >= 300 && newWidth <= 600) {
                setSidebarWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isResizing]);

    // Close Date Picker on Outside Click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setShowDatePicker(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Color Helper Functions
    const getTestCaseTypeColor = (type) => {
        const colors = {
            Functional: "bg-blue-50 text-blue-700 border-blue-200",
            Performance: "bg-purple-50 text-purple-700 border-purple-200",
            Security: "bg-red-50 text-red-700 border-red-200",
            Usability: "bg-green-50 text-green-700 border-green-200",
            Compatibility: "bg-yellow-50 text-yellow-700 border-yellow-200",
        };
        return colors[type] || "bg-gray-50 text-gray-700 border-gray-200";
    };

    const getStatusColor = (status) => {
        const colors = {
            New: "bg-blue-50 text-blue-700 border-blue-200",
            "In Progress": "bg-yellow-50 text-yellow-700 border-yellow-200",
            Passed: "bg-green-50 text-green-700 border-green-200",
            Failed: "bg-red-50 text-red-700 border-red-200",
            Blocked: "bg-gray-50 text-gray-700 border-gray-200",
        };
        return colors[status] || "bg-gray-50 text-gray-700 border-gray-200";
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] w-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            {/* Sidebar */}
            <motion.div
                ref={sidebarRef}
                initial={{ width: sidebarWidth }}
                animate={{
                    width: isSidebarOpen ? sidebarWidth : 0,
                    opacity: isSidebarOpen ? 1 : 0,
                }}
                transition={{
                    duration: 0.3,
                    ease: [0.4, 0.0, 0.2, 1],
                }}
                className="bg-white border-r border-gray-200 flex flex-col user-select-none sidebar-scrollbar sticky top-0 h-full"
                style={{
                    minWidth: isSidebarOpen ? sidebarWidth : 0,
                    overflow: "hidden",
                }}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-[14px] border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h2
                        onClick={() => copyToClipboard(testTypeName, showAlert)}
                        className="text-sm font-bold text-gray-800 tracking-wide cursor-pointer"
                    >
                        {testTypeName || "Select Test Type"}
                    </h2>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-1.5 hover:bg-white rounded-lg transition-colors"
                    >
                        <GoogleArrowRight size={16} className="text-gray-600" />
                    </motion.button>
                </div>

                {/* Search Bar with Date Filter */}
                <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Search test cases..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                        />
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600"
                        >
                            <Calendar size={16} />
                        </motion.button>
                    </div>

                    {/* Date Filter Dropdown */}
                    <AnimatePresence>
                        {showDatePicker && (
                            <motion.div
                                ref={datePickerRef}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                            >
                                <div className="space-y-2">
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 block mb-1">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={dateFilter.start}
                                            onChange={(e) =>
                                                setDateFilter((prev) => ({
                                                    ...prev,
                                                    start: e.target.value,
                                                }))
                                            }
                                            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 block mb-1">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={dateFilter.end}
                                            onChange={(e) =>
                                                setDateFilter((prev) => ({
                                                    ...prev,
                                                    end: e.target.value,
                                                }))
                                            }
                                            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setDateFilter({ start: "", end: "" });
                                            fetchTestCases();
                                        }}
                                        className="w-full px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                    >
                                        Clear Filter
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Bulk Actions */}
                    <div className="mt-3 flex gap-2">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={moveAllTestCasesToTrash}
                            className="flex-1 px-3 py-1.5 text-xs bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                        >
                            Trash All
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={deleteAllTestCasesPermanently}
                            className="flex-1 px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                            Delete All
                        </motion.button>
                    </div>
                </div>

                {/* Test Cases List */}
                <div className="flex-1 overflow-y-auto bg-gray-50">
                    {loading ? (
                        <div className="space-y-2 p-3">
                            {[...Array(5)].map((_, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-xl border border-gray-200 p-3"
                                >
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <motion.div
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="h-6 w-20 bg-gray-200 rounded-md"
                                        />
                                        <div className="flex items-center gap-1.5">
                                            <motion.div
                                                animate={{ opacity: [0.5, 1, 0.5] }}
                                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
                                                className="h-5 w-16 bg-gray-200 rounded-md"
                                            />
                                            <motion.div
                                                animate={{ opacity: [0.5, 1, 0.5] }}
                                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                                                className="h-5 w-16 bg-gray-200 rounded-md"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 mb-2">
                                        <motion.div
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                                            className="h-3 bg-gray-200 rounded w-full"
                                        />
                                        <motion.div
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                                            className="h-3 bg-gray-200 rounded w-3/4"
                                        />
                                    </div>
                                    <motion.div
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                                        className="h-3 w-32 bg-gray-200 rounded"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ) : filteredTestCases.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-16"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="relative mb-6"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-100 via-teal-50 to-blue-100 blur-xl opacity-60"
                                    style={{ width: '120px', height: '120px', left: '-10px', top: '-10px' }}
                                />

                                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 flex items-center justify-center">
                                    <motion.svg
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                                        width="48"
                                        height="48"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <motion.path
                                            d="M20 6L9 17L4 12"
                                            stroke="#10b981"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ delay: 0.5, duration: 0.6 }}
                                        />
                                    </motion.svg>
                                </div>

                                {[...Array(3)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute w-2 h-2 rounded-full bg-emerald-300"
                                        style={{
                                            top: `${20 + i * 25}%`,
                                            left: `${-10 + i * 50}%`,
                                        }}
                                        animate={{
                                            y: [-10, 10, -10],
                                            opacity: [0.3, 0.7, 0.3],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            delay: i * 0.3,
                                            ease: "easeInOut",
                                        }}
                                    />
                                ))}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="text-center"
                            >
                                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                    All Clear!
                                </h3>
                                <p className="text-sm text-gray-500 max-w-xs">
                                    No test cases found. Your test suite is empty.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="mt-6 flex gap-2"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            </motion.div>
                        </motion.div>
                    ) : (
                        <div className="space-y-2 p-3">
                            {filteredTestCases.map((testCase, index) => (
                                <motion.div
                                    key={testCase._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    whileHover={{
                                        y: -2,
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    }}
                                    className={`bg-white rounded-xl border-1 p-3 cursor-pointer transition-all duration-200 ${selectedTestCase?._id === testCase._id
                                            ? "border-blue-500 bg-blue-50 shadow-md"
                                            : "border-gray-200 hover:border-blue-300"
                                        }`}
                                    onClick={() => {
                                        setSelectedTestCase(testCase);
                                        fetchComments(testCase._id);
                                    }}
                                >
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                            {testCase.testCaseId}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <span
                                                className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${getTestCaseTypeColor(
                                                    testCase.testCaseType
                                                )}`}
                                            >
                                                {testCase.testCaseType}
                                            </span>
                                            <span
                                                className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${getStatusColor(
                                                    testCase.status
                                                )}`}
                                            >
                                                {testCase.status}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-700 mb-2 line-clamp-2 min-h-[2rem] leading-relaxed">
                                        {testCase.testCaseDescription || "No description"}
                                    </p>

                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                                        <Clock size={12} className="text-gray-400" />
                                        <span>
                                            {testCase.updatedAt
                                                ? `Updated: ${new Date(
                                                    testCase.updatedAt
                                                ).toLocaleDateString()}`
                                                : `Created: ${new Date(
                                                    testCase.createdAt
                                                ).toLocaleDateString()}`}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Resize Handle */}
            {isSidebarOpen && (
                <motion.div
                    whileHover={{ backgroundColor: "rgb(59, 130, 246)" }}
                    className="w-[1px] bg-gray-200 cursor-col-resize transition-colors"
                    onMouseDown={startResizing}
                />
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden sidebar-scrollbar">
                {/* Top Bar */}
                <div className="flex items-center user-select-none justify-between p-3 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
                        {!isSidebarOpen && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Menu size={18} className="text-gray-700" />
                            </motion.button>
                        )}
                        {selectedTestCase && (
                            <div className="flex items-center gap-2 ml-4">
                                <motion.h2
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => copyText(selectedTestCase.testCaseId)}
                                    className="text-sm font-bold text-gray-800 cursor-pointer bg-gray-100 px-3 py-2 rounded-lg"
                                >
                                    {selectedTestCase.testCaseId}
                                </motion.h2>
                                <GitHubDropdown
                                    value={selectedTestCase.testCaseType || "Functional"}
                                    options={[
                                        "Functional",
                                        "Performance",
                                        "Security",
                                        "Usability",
                                        "Compatibility",
                                    ]}
                                    onChange={(value) => handleFieldEdit("testCaseType", value)}
                                    label="Test Case Type"
                                    className="min-w-[130px]"
                                />
                                <GitHubDropdown
                                    value={selectedTestCase.priority || "Medium"}
                                    options={["Critical", "High", "Medium", "Low"]}
                                    onChange={(value) => handleFieldEdit("priority", value)}
                                    label="Priority"
                                    className="min-w-[110px]"
                                />
                                <GitHubDropdown
                                    value={selectedTestCase.severity || "Medium"}
                                    options={["Critical", "High", "Medium", "Low"]}
                                    onChange={(value) => handleFieldEdit("severity", value)}
                                    label="Severity"
                                    className="min-w-[110px]"
                                />
                                <GitHubDropdown
                                    value={selectedTestCase.status || "New"}
                                    options={[
                                        "New",
                                        "In Progress",
                                        "Passed",
                                        "Failed",
                                        "Blocked",
                                    ]}
                                    onChange={(value) => handleFieldEdit("status", value)}
                                    label="Status"
                                    className="min-w-[130px]"
                                />
                            </div>
                        )}
                    </div>

                    {selectedTestCase && (
                        <div className="flex items-center gap-3">
                            {selectedTestCase.image && selectedTestCase.image.length > 0 && (
                                <div className="relative">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setImageDropdownOpen(!imageDropdownOpen)}
                                        className="flex items-center gap-1.5 px-4 py-2 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm font-medium"
                                    >
                                        <ImageIcon size={13} />
                                        <span>{selectedTestCase.image.length}</span>
                                    </motion.button>

                                    {imageDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[200px] w-64 overflow-y-auto"
                                        >
                                            {selectedTestCase.image.map((image, index) => (
                                                <a
                                                    key={index}
                                                    href={image}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={() => setImageDropdownOpen(false)}
                                                    className="block px-4 py-2.5 text-xs text-gray-700 hover:bg-purple-100 hover:text-purple-700 transition-colors border-b border-gray-100 last:border-b-0 truncate"
                                                >
                                                    {image}
                                                </a>
                                            ))}
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            <div className="text-xs text-gray-600 font-medium bg-gray-100 px-3 py-1.5 rounded-lg">
                                Test Case{" "}
                                {filteredTestCases.findIndex((tc) => tc._id === selectedTestCase._id) + 1}{" "}
                                of {filteredTestCases.length}
                            </div>

                            <div className="flex items-center gap-1">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={goToPreviousTestCase}
                                    disabled={
                                        filteredTestCases.findIndex((tc) => tc._id === selectedTestCase._id) === 0
                                    }
                                    className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={goToNextTestCase}
                                    disabled={
                                        filteredTestCases.findIndex((tc) => tc._id === selectedTestCase._id) ===
                                        filteredTestCases.length - 1
                                    }
                                    className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={18} />
                                </motion.button>
                            </div>

                            {!isEditing ? (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleEditClick}
                                    className="flex items-center gap-1.5 px-4 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                                >
                                    <Edit size={13} />
                                </motion.button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSaveClick}
                                        className="flex items-center gap-1.5 px-4 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium"
                                    >
                                        <Save size={13} />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleCancelClick}
                                        className="flex items-center gap-1.5 px-4 py-2 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-sm font-medium"
                                    >
                                        <X size={13} />
                                    </motion.button>
                                </div>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => moveTestCaseToTrash(selectedTestCase._id)}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm font-medium"
                            >
                                <Archive size={13} />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => deleteTestCasePermanently(selectedTestCase._id)}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm font-medium"
                            >
                                <Trash2 size={13} />
                            </motion.button>
                        </div>
                    )}
                </div>

                {/* Test Case Details */}
                <div className="flex-1 overflow-y-auto p-1">
                    {!selectedTestCase ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center h-full text-gray-500 px-8"
                        >
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                    delay: 0.2,
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 15
                                }}
                                className="relative mb-8"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 w-32 h-32 -left-4 -top-4"
                                >
                                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-200 opacity-40" />
                                </motion.div>

                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 w-40 h-40 -left-8 -top-8"
                                >
                                    <div className="absolute inset-0 rounded-full border-2 border-dotted border-purple-200 opacity-30" />
                                </motion.div>

                                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 flex items-center justify-center shadow-xl">
                                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-100/50 to-purple-100/50 blur-md" />

                                    <motion.div
                                        animate={{
                                            scale: [1, 1.1, 1],
                                            rotate: [0, 5, -5, 0]
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="relative z-10"
                                    >
                                        <svg
                                            width="48"
                                            height="48"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="text-blue-500"
                                        >
                                            <motion.path
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ delay: 0.5, duration: 1 }}
                                                d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </motion.div>
                                </div>

                                {[...Array(4)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-purple-400"
                                        style={{
                                            top: `${[10, 50, 90, 50][i]}%`,
                                            left: `${[50, 90, 50, 10][i]}%`,
                                        }}
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [0.4, 0.8, 0.4],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            delay: i * 0.4,
                                            ease: "easeInOut",
                                        }}
                                    />
                                ))}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="text-center max-w-sm"
                            >
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    No Test Case Selected
                                </h3>
                                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                                    Choose a test case from the list to view its details and information
                                </p>

                                <motion.div
                                    animate={{ x: [0, 8, 0] }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="flex items-center justify-center gap-2 text-xs text-gray-400"
                                >
                                    <span>Click a test case card</span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-blue-400">
                                        <path
                                            d="M19 12H5M5 12L12 5M5 12L12 19"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </motion.div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="mt-8 flex gap-2"
                            >
                                {[...Array(5)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="w-1 h-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [0.3, 0.7, 0.3],
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            delay: i * 0.2,
                                        }}
                                    />
                                ))}
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-full mx-auto"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-4">
                                    {/* Module Name */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
                                    >
                                        <label className="user-select-none text-xs font-bold text-gray-600 mb-2 block tracking-wide">
                                            MODULE
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editFormData.moduleName}
                                                onChange={(e) =>
                                                    setEditFormData((prev) => ({
                                                        ...prev,
                                                        moduleName: e.target.value,
                                                    }))
                                                }
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="Enter module name..."
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-700 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200">
                                                {selectedTestCase.moduleName || "No module specified"}
                                            </p>
                                        )}
                                    </motion.div>

                                    {/* Description */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
                                    >
                                        <label className="user-select-none text-xs font-bold text-gray-600 mb-2 block tracking-wide">
                                            DESCRIPTION
                                        </label>
                                        {isEditing ? (
                                            <textarea
                                                value={editFormData.testCaseDescription}
                                                onChange={(e) =>
                                                    setEditFormData((prev) => ({
                                                        ...prev,
                                                        testCaseDescription: e.target.value,
                                                    }))
                                                }
                                                rows={4}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                                placeholder="Enter test case description..."
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-700 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 min-h-[100px] leading-relaxed">
                                                {selectedTestCase.testCaseDescription || "No description"}
                                            </p>
                                        )}
                                    </motion.div>

                                    {/* Expected Result */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
                                    >
                                        <label className="user-select-none text-xs font-bold text-gray-600 mb-2 block tracking-wide">
                                            EXPECTED RESULT
                                        </label>
                                        {isEditing ? (
                                            <textarea
                                                value={editFormData.expectedResult}
                                                onChange={(e) =>
                                                    setEditFormData((prev) => ({
                                                        ...prev,
                                                        expectedResult: e.target.value,
                                                    }))
                                                }
                                                rows={3}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                                placeholder="Enter expected result..."
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-700 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 min-h-[80px] leading-relaxed">
                                                {selectedTestCase.expectedResult || "No expected result specified"}
                                            </p>
                                        )}
                                    </motion.div>

                                    {/* Actual Result */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
                                    >
                                        <label className="user-select-none text-xs font-bold text-gray-600 mb-2 block tracking-wide">
                                            ACTUAL RESULT
                                        </label>
                                        {isEditing ? (
                                            <textarea
                                                value={editFormData.actualResult}
                                                onChange={(e) =>
                                                    setEditFormData((prev) => ({
                                                        ...prev,
                                                        actualResult: e.target.value,
                                                    }))
                                                }
                                                rows={3}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                                placeholder="Enter actual result..."
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-700 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 min-h-[80px] leading-relaxed">
                                                {selectedTestCase.actualResult || "No actual result specified"}
                                            </p>
                                        )}
                                    </motion.div>

                                    {/* Reference Links */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
                                    >
                                        <label className="user-select-none text-xs font-bold text-gray-600 mb-2 block tracking-wide">
                                            REFERENCE LINKS
                                        </label>

                                        {isEditing ? (
                                            <div className="flex flex-col gap-2">
                                                {Array.isArray(editFormData.refLinks) && editFormData.refLinks.length > 0 ? (
                                                    editFormData.refLinks.map((link, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200"
                                                        >
                                                            <input
                                                                type="text"
                                                                value={link}
                                                                onChange={(e) => {
                                                                    const newLinks = [...editFormData.refLinks];
                                                                    newLinks[index] = e.target.value;
                                                                    setEditFormData((prev) => ({
                                                                        ...prev,
                                                                        refLinks: newLinks,
                                                                    }));
                                                                }}
                                                                className="flex-1 bg-transparent text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1"
                                                                placeholder="https://..."
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const newLinks = editFormData.refLinks.filter((_, i) => i !== index);
                                                                    setEditFormData((prev) => ({
                                                                        ...prev,
                                                                        refLinks: newLinks,
                                                                    }));
                                                                }}
                                                                className="text-red-500 hover:text-red-700 transition"
                                                                title="Remove link"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="flex-1 text-sm text-gray-700 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 truncate">
                                                        No reference links
                                                    </p>
                                                )}

                                                {/* Add new link button */}
                                                <button
                                                    onClick={() =>
                                                        setEditFormData((prev) => ({
                                                            ...prev,
                                                            refLinks: [...(prev.refLinks || []), ""],
                                                        }))
                                                    }
                                                    className="text-sm text-blue-600 hover:underline self-start mt-2"
                                                >
                                                    + Add another link
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2">
                                                {Array.isArray(selectedTestCase?.refLinks) && selectedTestCase.refLinks.length > 0 ? (
                                                    selectedTestCase.refLinks.map((link, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 truncate"
                                                        >
                                                            <a
                                                                href={link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex-1 text-sm text-blue-600 hover:underline truncate"
                                                            >
                                                                {link}
                                                            </a>
                                                            <button
                                                                onClick={() => {
                                                                    handleCopy(link);
                                                                    setCopiedIndex(index);
                                                                    setTimeout(() => setCopiedIndex(null), 2000);
                                                                }}
                                                                className="text-gray-500 hover:text-blue-500 transition"
                                                                title="Copy link"
                                                            >
                                                                {copiedIndex === index ? (
                                                                    <Check size={18} className="text-green-500" />
                                                                ) : (
                                                                    <Copy size={18} />
                                                                )}
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="flex-1 text-sm text-gray-700 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 truncate">
                                                        No reference links
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Test Case Images */}
                                    {selectedTestCase.image && selectedTestCase.image.length > 0 && (
                                        <>
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.35 }}
                                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
                                            >
                                                <label className="user-select-none text-xs font-bold text-gray-600 mb-2 block tracking-wide">
                                                    TEST CASE IMAGES
                                                </label>
                                                {isEditing ? (
                                                    <div className="space-y-3">
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedImages.map((image, index) => (
                                                                <div key={index} className="relative group">
                                                                    <img
                                                                        src={image}
                                                                        alt={`Test case screenshot ${index + 1}`}
                                                                        className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                                                    />
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.1 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                        onClick={() => removeImage(index)}
                                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <X size={12} />
                                                                    </motion.button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <input
                                                                ref={fileInputRef}
                                                                type="file"
                                                                multiple
                                                                accept="image/*"
                                                                onChange={(e) =>
                                                                    handleImageUpload(e.target.files)
                                                                }
                                                                className="hidden"
                                                            />
                                                            <motion.button
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                onClick={() => fileInputRef.current?.click()}
                                                                disabled={uploadingImages}
                                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-xs font-medium"
                                                            >
                                                                <Upload size={14} />
                                                                {uploadingImages ? "Uploading..." : "Add Images"}
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedTestCase.image.map((image, index) => (
                                                            <motion.div
                                                                key={index}
                                                                whileHover={{ scale: 1.05 }}
                                                                className="block"
                                                            >
                                                                <img
                                                                    src={image}
                                                                    alt={`Test case screenshot ${index + 1}`}
                                                                    className="w-24 h-24 object-cover rounded-lg border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
                                                                    onClick={() => setSelectedImageModal(image)}
                                                                    onDoubleClick={() => window.open(image, "_blank")}
                                                                />
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                )}
                                            </motion.div>

                                            {/* Image Modal */}
                                            {selectedImageModal && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="fixed inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-50"
                                                    onClick={() => setSelectedImageModal(null)}
                                                >
                                                    <motion.div
                                                        initial={{ scale: 0.9, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0.9, opacity: 0 }}
                                                        className="relative"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <img
                                                            src={selectedImageModal}
                                                            alt="Large preview"
                                                            className="max-w-4xl max-h-[80vh] object-contain rounded-lg"
                                                        />
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => setSelectedImageModal(null)}
                                                            className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                                                        >
                                                            <X size={20} />
                                                        </motion.button>
                                                    </motion.div>
                                                </motion.div>
                                            )}
                                        </>
                                    )}

                                    {/* Image Upload in Edit Mode */}
                                    {isEditing &&
                                        (!selectedTestCase.image ||
                                            selectedTestCase.image.length === 0) && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.35 }}
                                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
                                            >
                                                <label className="text-xs font-bold text-gray-600 mb-2 block tracking-wide">
                                                    ADD TEST CASE IMAGES
                                                </label>
                                                <div className="space-y-3">
                                                    {selectedImages.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedImages.map((image, index) => (
                                                                <div key={index} className="relative group">
                                                                    <img
                                                                        src={image}
                                                                        alt={`Test case screenshot ${index + 1}`}
                                                                        className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                                                    />
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.1 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                        onClick={() => removeImage(index)}
                                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <X size={12} />
                                                                    </motion.button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className="flex gap-2">
                                                        <input
                                                            ref={fileInputRef}
                                                            type="file"
                                                            multiple
                                                            accept="image/*"
                                                            onChange={(e) =>
                                                                handleImageUpload(e.target.files)
                                                            }
                                                            className="hidden"
                                                        />
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => fileInputRef.current?.click()}
                                                            disabled={uploadingImages}
                                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-xs font-medium"
                                                        >
                                                            <Upload size={14} />
                                                            {uploadingImages
                                                                ? "Uploading..."
                                                                : "Upload Images"}
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                    {/* Timestamps */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="grid grid-cols-2 gap-4 pt-2"
                                    >
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                            <label className="text-xs font-bold text-gray-600 mb-1.5 tracking-wide flex items-center gap-1.5">
                                                <Calendar size={12} />
                                                CREATED AT
                                            </label>
                                            <p className="text-xs text-gray-700 font-medium">
                                                {new Date(selectedTestCase.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        {selectedTestCase.updatedAt && (
                                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                                <label className="text-xs font-bold text-gray-600 mb-1.5 block tracking-wide flex items-center gap-1.5">
                                                    <Clock size={12} />
                                                    UPDATED AT
                                                </label>
                                                <p className="text-xs text-gray-700 font-medium">
                                                    {new Date(selectedTestCase.updatedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                </div>

                                {/* Right Column - Comments */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="lg:col-span-1"
                                >
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 sticky top-1">
                                        <h3 className="user-select-none text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 tracking-wide">
                                            <MessageSquare size={16} className="text-blue-600" />
                                            COMMENTS
                                        </h3>

                                        {/* Add Comment */}
                                        <div className="mb-4">
                                            <textarea
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Add a comment..."
                                                rows={3}
                                                className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2 transition-all resize-none"
                                            />
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => submitComment(selectedTestCase._id)}
                                                disabled={!newComment.trim() || submittingComment}
                                                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center gap-2 font-medium shadow-sm transition-colors"
                                            >
                                                {submittingComment ? (
                                                    <>
                                                        <Loader2 size={13} className="animate-spin" />
                                                        Posting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send size={13} />
                                                        Post Comment
                                                    </>
                                                )}
                                            </motion.button>
                                        </div>

                                        {/* Comments List */}
                                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                            {loadingComments ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <Loader2
                                                        size={24}
                                                        className="animate-spin text-blue-600"
                                                    />
                                                </div>
                                            ) : comments.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500 text-xs">
                                                    <MessageSquare
                                                        size={32}
                                                        className="mx-auto mb-2 text-gray-300"
                                                    />
                                                    <p className="font-medium">No comments yet</p>
                                                    <p className="text-gray-400 mt-1">Be the first to comment</p>
                                                </div>
                                            ) : (
                                                comments.map((comment, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200"
                                                    >
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                                                                <span className="text-xs font-bold text-white">
                                                                    {comment.commentBy?.charAt(0).toUpperCase() ||
                                                                        "U"}
                                                                </span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <span className="text-xs font-bold text-gray-800 block truncate">
                                                                    {comment.commentBy || "Unknown"}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {new Date(
                                                                        comment.createdAt
                                                                    ).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-700 leading-relaxed">
                                                            {comment.comment}
                                                        </p>
                                                    </motion.div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestCaseSplitView;