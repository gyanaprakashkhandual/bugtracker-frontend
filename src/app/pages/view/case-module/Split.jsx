"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trash2,
    Search,
    AlertCircle,
    Loader2,
    Archive,
    MessageSquare,
    X,
    Send,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Clock,
    Edit,
    Save,
    Menu,
    ChevronRight as ChevronRightIcon,
    Image as ImageIcon,
    Link2,
    Upload,
    Copy,
    Check,
    Play,
    Square
} from "lucide-react";
import { useAlert } from "@/app/script/Alert.context";
import { useTestType } from "@/app/script/TestType.context";
import { useConfirm } from "@/app/script/Confirm.context";
import { GoogleArrowDown, GoogleArrowRight } from "@/app/components/utils/Icon";
import { copyToClipboard } from "@/app/utils/Copy.text";
import Loader from "@/app/components/utils/Loader";

const TestCaseSplitView = () => {
    const [imageDropdownOpen, setImageDropdownOpen] = useState(false);
    const [testCases, setTestCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTestCase, setSelectedTestCase] = useState(null);
    const [loadingTestCase, setLoadingTestCase] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [savingField, setSavingField] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(300);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isResizing, setIsResizing] = useState(false);
    const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedImageModal, setSelectedImageModal] = useState(null);
    const sidebarRef = useRef(null);
    const datePickerRef = useRef(null);
    const fileInputRef = useRef(null);

    const { showAlert } = useAlert();
    const { showConfirm } = useConfirm();
    const { testTypeId, testTypeName } = useTestType();

    const handleCopy = (text) => {
        copyToClipboard(text, showAlert);
    };

    const [editFormData, setEditFormData] = useState({
        moduleName: "",
        testCaseType: "",
        testCaseDescription: "",
        actualResult: "",
        expectedResult: "",
        priority: "",
        severity: "",
        status: "",
        image: "",
    });

    const copyText = (text) => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                showAlert({
                    type: "success",
                    message: "Serial Number Copied",
                });
            })
            .catch(() => {
                console.log("Failed to copy");
            });
    };

    c

    const BASE_URL = "http://localhost:5000/api/v1/test-case";

    // Get all test cases API
    const fetchTestCases = useCallback(async () => {
        if (!projectId || !testTypeId || !token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases?page=1&limit=1000000`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) throw new Error("Failed to fetch test cases");

            const data = await response.json();
            setTestCases(data.testCases || []);
        } catch (error) {
            console.error("Error fetching test cases:", error);
            showAlert({ type: "error", message: "Failed to fetch test cases" });
        } finally {
            setLoading(false);
        }
    }, [projectId, testTypeId, token]);

    // Get single test case by ID
    const fetchTestCaseById = async (testCaseId) => {
        if (!token || !testCaseId) return;

        setLoadingTestCase(true);
        try {
            const response = await fetch(
                `${BASE_URL}/test-cases/${testCaseId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) throw new Error("Failed to fetch test case");

            const data = await response.json();
            setSelectedTestCase(data.testCase);
        } catch (error) {
            console.error("Error fetching test case:", error);
            showAlert({ type: "error", message: "Failed to fetch test case" });
        } finally {
            setLoadingTestCase(false);
        }
    };

    // Update test case API
    const updateTestCase = async (testCaseId, field, value) => {
        setSavingField(field);

        try {
            const response = await fetch(`${BASE_URL}/test-cases/${testCaseId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ [field]: value }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update test case");
            }

            const data = await response.json();

            setTestCases((prev) =>
                prev.map((testCase) =>
                    testCase._id === testCaseId ? { ...testCase, [field]: value } : testCase
                )
            );

            if (selectedTestCase?._id === testCaseId) {
                setSelectedTestCase((prev) => ({ ...prev, [field]: value }));
            }

            showAlert({ type: "success", message: "Test case updated successfully" });
            setTimeout(() => setSavingField(null), 500);
        } catch (error) {
            console.error("Error updating test case:", error);
            showAlert({
                type: "error",
                message: error.message || "Failed to update test case",
            });
            setSavingField(null);
        }
    };

    // Update test case fields (Edit)
    const updateTestCaseFields = async (testCaseId, fields) => {
        try {
            const response = await fetch(`${BASE_URL}/test-cases/${testCaseId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(fields),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update test case");
            }

            const data = await response.json();

            setTestCases((prev) =>
                prev.map((testCase) => (testCase._id === testCaseId ? { ...testCase, ...fields } : testCase))
            );

            if (selectedTestCase?._id === testCaseId) {
                setSelectedTestCase((prev) => ({ ...prev, ...fields }));
            }

            showAlert({ type: "success", message: "Test case updated successfully" });
            return true;
        } catch (error) {
            console.error("Error updating test case:", error);
            showAlert({
                type: "error",
                message: error.message || "Failed to update test case",
            });
            return false;
        }
    };

    // Move test case to trash API
    const moveTestCaseToTrash = async (testCaseId) => {
        try {
            const response = await fetch(
                `${BASE_URL}/test-cases/${testCaseId}/trash`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to move test case to trash");
            }

            const data = await response.json();

            setTestCases((prev) => prev.filter((testCase) => testCase._id !== testCaseId));
            if (selectedTestCase?._id === testCaseId) {
                setSelectedTestCase(null);
            }

            showAlert({
                type: "success",
                message: "Test case moved to trash successfully",
            });
        } catch (error) {
            console.error("Error moving test case to trash:", error);
            showAlert({
                type: "error",
                message: error.message || "Failed to move test case to trash",
            });
        }
    };

    // Delete test case permanently API
    const deleteTestCasePermanently = async (testCaseId) => {
        try {
            const response = await fetch(
                `${BASE_URL}/test-cases/${testCaseId}/permanent`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to delete test case permanently"
                );
            }

            const data = await response.json();

            setTestCases((prev) => prev.filter((testCase) => testCase._id !== testCaseId));
            if (selectedTestCase?._id === testCaseId) {
                setSelectedTestCase(null);
            }

            showAlert({ type: "success", message: "Test case deleted permanently" });
        } catch (error) {
            console.error("Error deleting test case permanently:", error);
            showAlert({
                type: "error",
                message: error.message || "Failed to delete test case",
            });
        }
    };

    // Move all test cases to trash API
    const moveAllTestCasesToTrash = async () => {
        try {
            const result = await showConfirm({
                title: "Move All Test Cases to Trash",
                message: "Are you sure you want to move all test cases to trash? This action cannot be undone!",
                confirmText: "Move to Trash",
                cancelText: "Cancel",
                type: "warning",
            });

            if (!result) return;

            // Move each test case individually
            const promises = testCases.map(testCase =>
                moveTestCaseToTrash(testCase._id)
            );

            await Promise.all(promises);

            showAlert({
                type: "success",
                message: "All test cases moved to trash successfully",
            });
        } catch (error) {
            console.error("Error moving all test cases to trash:", error);
            showAlert({
                type: "error",
                message: error.message || "Failed to move test cases to trash",
            });
        }
    };

    // Delete all test cases permanently API
    const deleteAllTestCasesPermanently = async () => {
        try {
            const result = await showConfirm({
                title: "Delete All Test Cases Permanently",
                message: "Are you sure you want to permanently delete all test cases? This action cannot be undone!",
                confirmText: "Delete All",
                cancelText: "Cancel",
                type: "warning",
            });

            if (!result) return;

            // Delete each test case individually
            const promises = testCases.map(testCase =>
                deleteTestCasePermanently(testCase._id)
            );

            await Promise.all(promises);

            showAlert({ type: "success", message: "All test cases deleted permanently" });
        } catch (error) {
            console.error("Error deleting all test cases:", error);
            showAlert({
                type: "error",
                message: error.message || "Failed to delete all test cases",
            });
        }
    };

    // Cloudinary image upload function
    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "test_case_preset");

        try {
            const response = await fetch(
                "https://api.cloudinary.com/v1_1/dvytvjplt/image/upload",
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!response.ok) throw new Error("Upload failed");

            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error("Error uploading to Cloudinary:", error);
            throw error;
        }
    };

    // Image Uploading
    const handleImageUpload = async (file) => {
        setUploadingImage(true);

        try {
            const imageUrl = await uploadToCloudinary(file);

            setSelectedImage(imageUrl);
            setEditFormData((prev) => ({
                ...prev,
                image: imageUrl,
            }));

            showAlert({ type: "success", message: "Image uploaded successfully" });
        } catch (error) {
            console.error("Error uploading image:", error);
            showAlert({ type: "error", message: "Failed to upload image" });
        } finally {
            setUploadingImage(false);
        }
    };

    const handleFieldEdit = (field, value) => {
        updateTestCase(selectedTestCase._id, field, value);
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setEditFormData({
            moduleName: selectedTestCase.moduleName || "",
            testCaseType: selectedTestCase.testCaseType || "",
            testCaseDescription: selectedTestCase.testCaseDescription || "",
            actualResult: selectedTestCase.actualResult || "",
            expectedResult: selectedTestCase.expectedResult || "",
            priority: selectedTestCase.priority || "",
            severity: selectedTestCase.severity || "",
            status: selectedTestCase.status || "",
            image: selectedTestCase.image || "",
        });
        setSelectedImage(selectedTestCase.image || null);
    };

    const handleSaveClick = async () => {
        const success = await updateTestCaseFields(selectedTestCase._id, editFormData);
        if (success) {
            setIsEditing(false);
        }
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setEditFormData({
            moduleName: selectedTestCase.moduleName || "",
            testCaseType: selectedTestCase.testCaseType || "",
            testCaseDescription: selectedTestCase.testCaseDescription || "",
            actualResult: selectedTestCase.actualResult || "",
            expectedResult: selectedTestCase.expectedResult || "",
            priority: selectedTestCase.priority || "",
            severity: selectedTestCase.severity || "",
            status: selectedTestCase.status || "",
            image: selectedTestCase.image || "",
        });
        setSelectedImage(selectedTestCase.image || null);
    };

    const goToNextTestCase = () => {
        const currentIndex = filteredTestCases.findIndex(
            (testCase) => testCase._id === selectedTestCase._id
        );
        if (currentIndex < filteredTestCases.length - 1) {
            const nextTestCase = filteredTestCases[currentIndex + 1];
            setSelectedTestCase(nextTestCase);
            setIsEditing(false);
        }
    };

    const goToPreviousTestCase = () => {
        const currentIndex = filteredTestCases.findIndex(
            (testCase) => testCase._id === selectedTestCase._id
        );
        if (currentIndex > 0) {
            const prevTestCase = filteredTestCases[currentIndex - 1];
            setSelectedTestCase(prevTestCase);
            setIsEditing(false);
        }
    };

    const startResizing = useCallback((e) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback(
        (e) => {
            if (isResizing) {
                const newWidth = e.clientX;
                if (newWidth >= 300 && newWidth <= 600) {
                    setSidebarWidth(newWidth);
                }
            }
        },
        [isResizing]
    );

    useEffect(() => {
        document.addEventListener("mousemove", resize);
        document.addEventListener("mouseup", stopResizing);
        return () => {
            document.removeEventListener("mousemove", resize);
            document.removeEventListener("mouseup", stopResizing);
        };
    }, [resize, stopResizing]);

    useEffect(() => {
        fetchTestCases();
    }, [fetchTestCases]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                datePickerRef.current &&
                !datePickerRef.current.contains(event.target)
            ) {
                setShowDatePicker(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Search functionality
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.trim()) {
                // Implement search logic here if needed
                // For now, we'll just filter the existing test cases
                const filtered = testCases.filter(testCase =>
                    testCase.moduleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    testCase.testCaseDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    testCase.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setTestCases(filtered);
            } else if (dateFilter.start || dateFilter.end) {
                // Implement date filtering here if needed
                fetchTestCases();
            } else {
                fetchTestCases();
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, dateFilter.start, dateFilter.end]);

    const filteredTestCases = testCases;

    const getTestCaseTypeColor = (type) => {
        const colors = {
            Functional: "bg-blue-100 text-blue-800 border-blue-300",
            "User-Interface": "bg-purple-100 text-purple-800 border-purple-300",
            Performance: "bg-orange-100 text-orange-800 border-orange-300",
            API: "bg-green-100 text-green-800 border-green-300",
            Database: "bg-indigo-100 text-indigo-800 border-indigo-300",
            Security: "bg-red-100 text-red-800 border-red-300",
            Others: "bg-gray-100 text-gray-800 border-gray-300",
        };
        return colors[type] || "bg-gray-100 text-gray-800 border-gray-300";
    };

    const getStatusColor = (status) => {
        const colors = {
            Pass: "bg-green-100 text-green-800 border-green-300",
            Fail: "bg-red-100 text-red-800 border-red-300",
        };
        return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
    };

    const getPriorityColor = (priority) => {
        const colors = {
            Critical: "bg-red-100 text-red-800 border-red-300",
            High: "bg-orange-100 text-orange-800 border-orange-300",
            Medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
            Low: "bg-green-100 text-green-800 border-green-300",
        };
        return colors[priority] || "bg-gray-100 text-gray-800 border-gray-300";
    };

    const GitHubDropdown = ({
        value,
        options,
        onChange,
        label,
        className = "",
    }) => {
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef(null);

        useEffect(() => {
            const handleClickOutside = (event) => {
                if (
                    dropdownRef.current &&
                    !dropdownRef.current.contains(event.target)
                ) {
                    setIsOpen(false);
                }
            };

            document.addEventListener("mousedown", handleClickOutside);
            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        const handleSelect = (option) => {
            onChange(option);
            setIsOpen(false);
        };

        const getDropdownColor = () => {
            if (label === "Priority") return getPriorityColor(value);
            if (label === "Status") return getStatusColor(value);
            if (label === "TestCase Type") return getTestCaseTypeColor(value);
            return "bg-white text-gray-900 border-gray-200";
        };

        return (
            <div className={`relative inline-block text-left`} ref={dropdownRef}>
                <button
                    type="button"
                    className={`inline-flex justify-between items-center px-2 py-1.5 text-xs font-semibold border rounded-md transition-all duration-200 hover:shadow-sm hover:border-opacity-60 focus:outline-none ${getDropdownColor()}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="mr-1">{value}</span>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <GoogleArrowDown className="h-4 w-4" />
                    </motion.div>
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -8 }}
                            transition={{ duration: 0.12 }}
                            className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-xl bg-white ring-1 ring-gray-200 z-20 overflow-hidden"
                        >
                            <div className="py-1" role="menu">
                                {options.map((option) => (
                                    <motion.button
                                        key={option}
                                        whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.08)" }}
                                        className={`block w-full text-left px-2.5 py-1.5 text-xs transition-colors font-medium ${value === option
                                            ? "bg-blue-50 text-blue-600 border-l-2 border-blue-500"
                                            : "text-gray-700 hover:text-gray-900"
                                            }`}
                                        onClick={() => handleSelect(option)}
                                        role="menuitem"
                                    >
                                        {option}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    if (loading) {
        return <Loader />;
    }

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
                        className="text-sm font-bold text-gray-800 tracking-wide"
                    >
                        {testTypeName || 'Select Test Type'}
                    </h2>

                    <motion.button
                        tooltip-data="Close Sidebar"
                        tooltip-placement="right"
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
                        // Skeleton Loader
                        <div className="space-y-2 p-3">
                            {[...Array(5)].map((_, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-xl border border-gray-200 p-3"
                                >
                                    {/* Header Skeleton */}
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

                                    {/* Description Skeleton */}
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

                                    {/* Date Skeleton */}
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
                            {/* Animated Icon Container */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="relative mb-6"
                            >
                                {/* Outer Circle with Gradient */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-100 via-teal-50 to-blue-100 blur-xl opacity-60"
                                    style={{ width: '120px', height: '120px', left: '-10px', top: '-10px' }}
                                />

                                {/* Main Circle */}
                                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 flex items-center justify-center">
                                    {/* Checkmark SVG */}
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

                                {/* Floating Particles */}
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

                            {/* Text Content */}
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
                                    No test cases found. Create your first test case to get started.
                                </p>
                            </motion.div>

                            {/* Decorative Elements */}
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
                                    }}
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                            {testCase.serialNumber}
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

                                    {/* Description */}
                                    <p className="text-xs text-gray-700 mb-2 line-clamp-2 min-h-[2rem] leading-relaxed">
                                        {testCase.testCaseDescription || "No description"}
                                    </p>

                                    {/* Date */}
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
                                tooltip-data="Open Sidebar"
                                tooltip-placement="right"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Menu size={18} className="text-gray-700" />
                            </motion.button>
                        )}
                        {/* Header with Serial Number and Dropdowns */}
                        {selectedTestCase && (
                            <div className="flex items-center gap-2 ml-4">
                                <motion.h2
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => copyText(selectedTestCase.serialNumber)}
                                    className="text-sm font-bold text-gray-800 cursor-pointer bg-gray-100 px-3 py-2 rounded-lg"
                                >
                                    {selectedTestCase.serialNumber}
                                </motion.h2>
                                <GitHubDropdown
                                    value={selectedTestCase.testCaseType || "Functional"}
                                    options={[
                                        "Functional",
                                        "User-Interface",
                                        "Performance",
                                        "API",
                                        "Database",
                                        "Security",
                                        "Others",
                                    ]}
                                    onChange={(value) => handleFieldEdit("testCaseType", value)}
                                    label="TestCase Type"
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
                                    value={selectedTestCase.status || "Pass"}
                                    options={["Pass", "Fail"]}
                                    onChange={(value) => handleFieldEdit("status", value)}
                                    label="Status"
                                    className="min-w-[110px]"
                                />
                            </div>
                        )}
                    </div>

                    {selectedTestCase && (
                        <div className="flex items-center gap-3">
                            {/* Image Button with Dropdown */}
                            {selectedTestCase.image && (
                                <div className="relative">
                                    <motion.button
                                        tooltip-data="View Image"
                                        tooltip-placement="bottom"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setImageDropdownOpen(!imageDropdownOpen)}
                                        className="flex items-center gap-1.5 px-4 py-2 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm font-medium"
                                    >
                                        <ImageIcon size={13} />
                                    </motion.button>

                                    {/* Image Dropdown */}
                                    {imageDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-64"
                                        >
                                            <a
                                                href={selectedTestCase.image}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={() => setImageDropdownOpen(false)}
                                                className="block px-4 py-2.5 text-xs text-gray-700 hover:bg-purple-100 hover:text-purple-700 transition-colors truncate"
                                            >
                                                {selectedTestCase.image}
                                            </a>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {/* Test Case counter */}
                            <div className="text-xs text-gray-600 font-medium bg-gray-100 px-3 py-1.5 rounded-lg">
                                Test Case{" "}
                                {filteredTestCases.findIndex((b) => b._id === selectedTestCase._id) + 1}{" "}
                                of {filteredTestCases.length}
                            </div>

                            {/* Navigation buttons */}
                            <div className="flex items-center gap-1">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={goToPreviousTestCase}
                                    disabled={
                                        filteredTestCases.findIndex((b) => b._id === selectedTestCase._id) ===
                                        0
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
                                        filteredTestCases.findIndex((b) => b._id === selectedTestCase._id) ===
                                        filteredTestCases.length - 1
                                    }
                                    className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={18} />
                                </motion.button>
                            </div>

                            {/* Edit/Save buttons */}
                            {!isEditing ? (
                                <motion.button
                                    tooltip-data="Edit"
                                    tooltip-placement="bottom"
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
                                        tooltip-data="Save"
                                        tooltip-placement="bottom"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSaveClick}
                                        className="flex items-center gap-1.5 px-4 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium"
                                    >
                                        <Save size={13} />
                                    </motion.button>
                                    <motion.button
                                        tooltip-data="Cancel"
                                        tooltip-placement="bottom"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleCancelClick}
                                        className="flex items-center gap-1.5 px-4 py-2 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-sm font-medium"
                                    >
                                        <X size={13} />
                                    </motion.button>
                                </div>
                            )}

                            {/* Archive and Delete buttons */}
                            <motion.button
                                tooltip-data="Archive"
                                tooltip-placement="bottom"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => moveTestCaseToTrash(selectedTestCase._id)}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm font-medium"
                            >
                                <Archive size={13} />
                            </motion.button>
                            <motion.button
                                tooltip-data="Delete"
                                tooltip-placement="bottom"
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
                            {/* Animated Icon Container */}
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
                                {/* Orbiting Rings */}
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

                                {/* Main Circle Background */}
                                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 flex items-center justify-center shadow-xl">
                                    {/* Inner Glow */}
                                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-100/50 to-purple-100/50 blur-md" />

                                    {/* Icon */}
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

                                {/* Floating Dots */}
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

                            {/* Text Content */}
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
                                    Choose a test case from the list to view its details and execution information
                                </p>

                                {/* Visual Indicator */}
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

                            {/* Bottom Decorative Elements */}
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
                                {/* Left Column - Test Case Details */}
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

                                    {/* Test Case Description */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
                                    >
                                        <label className="user-select-none text-xs font-bold text-gray-600 mb-2 block tracking-wide">
                                            TEST CASE DESCRIPTION
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
                                                {selectedTestCase.expectedResult ||
                                                    "No expected result specified"}
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
                                                {selectedTestCase.actualResult ||
                                                    "No actual result specified"}
                                            </p>
                                        )}
                                    </motion.div>

                                    {/* Image Display */}
                                    {selectedTestCase.image && (
                                        <>
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
                                            >
                                                <label className="user-select-none text-xs font-bold text-gray-600 mb-2 block tracking-wide">
                                                    TEST CASE IMAGE
                                                </label>
                                                {isEditing ? (
                                                    <div className="space-y-3">
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedImage && (
                                                                <div className="relative group">
                                                                    <img
                                                                        src={selectedImage}
                                                                        alt="Test case screenshot"
                                                                        className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                                                    />
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.1 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                        onClick={() => {
                                                                            setSelectedImage(null);
                                                                            setEditFormData((prev) => ({
                                                                                ...prev,
                                                                                image: "",
                                                                            }));
                                                                        }}
                                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <X size={12} />
                                                                    </motion.button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <input
                                                                ref={fileInputRef}
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) =>
                                                                    handleImageUpload(e.target.files[0])
                                                                }
                                                                className="hidden"
                                                            />
                                                            <motion.button
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                onClick={() => fileInputRef.current?.click()}
                                                                disabled={uploadingImage}
                                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-xs font-medium"
                                                            >
                                                                <Upload size={14} />
                                                                {uploadingImage ? "Uploading..." : "Change Image"}
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        <motion.div
                                                            whileHover={{ scale: 1.05 }}
                                                            className="block"
                                                        >
                                                            <img
                                                                src={selectedTestCase.image}
                                                                alt="Test case screenshot"
                                                                className="w-24 h-24 object-cover rounded-lg border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
                                                                onClick={() => setSelectedImageModal(selectedTestCase.image)}
                                                                onDoubleClick={() => window.open(selectedTestCase.image, "_blank")}
                                                            />
                                                        </motion.div>
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
                                    {isEditing && !selectedTestCase.image && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
                                        >
                                            <label className="text-xs font-bold text-gray-600 mb-2 block tracking-wide">
                                                ADD TEST CASE IMAGE
                                            </label>
                                            <div className="space-y-3">
                                                {selectedImage && (
                                                    <div className="flex flex-wrap gap-2">
                                                        <div className="relative group">
                                                            <img
                                                                src={selectedImage}
                                                                alt="Test case screenshot"
                                                                className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                                            />
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => {
                                                                    setSelectedImage(null);
                                                                    setEditFormData((prev) => ({
                                                                        ...prev,
                                                                        image: "",
                                                                    }));
                                                                }}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X size={12} />
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex gap-2">
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) =>
                                                            handleImageUpload(e.target.files[0])
                                                        }
                                                        className="hidden"
                                                    />
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => fileInputRef.current?.click()}
                                                        disabled={uploadingImage}
                                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-xs font-medium"
                                                    >
                                                        <Upload size={14} />
                                                        {uploadingImage
                                                            ? "Uploading..."
                                                            : "Upload Image"}
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Timestamps */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 }}
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
                                                <label className="text-xs font-bold text-gray-600 mb-1.5 block tracking-wide  items-center gap-1.5">
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

                                {/* Right Column - Additional Info */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="lg:col-span-1"
                                >
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 top-1">
                                        <h3 className="user-select-none text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 tracking-wide">
                                            <Play size={16} className="text-green-600" />
                                            EXECUTION INFO
                                        </h3>

                                        {/* Test Case Type */}
                                        <div className="mb-4">
                                            <label className="text-xs font-bold text-gray-600 mb-2 block">
                                                TEST CASE TYPE
                                            </label>
                                            {isEditing ? (
                                                <select
                                                    value={editFormData.testCaseType}
                                                    onChange={(e) =>
                                                        setEditFormData((prev) => ({
                                                            ...prev,
                                                            testCaseType: e.target.value,
                                                        }))
                                                    }
                                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="Functional">Functional</option>
                                                    <option value="User-Interface">User-Interface</option>
                                                    <option value="Performance">Performance</option>
                                                    <option value="API">API</option>
                                                    <option value="Database">Database</option>
                                                    <option value="Security">Security</option>
                                                    <option value="Others">Others</option>
                                                </select>
                                            ) : (
                                                <p className={`px-3 py-2 text-xs font-semibold rounded-lg border ${getTestCaseTypeColor(selectedTestCase.testCaseType)}`}>
                                                    {selectedTestCase.testCaseType}
                                                </p>
                                            )}
                                        </div>

                                        {/* Priority */}
                                        <div className="mb-4">
                                            <label className="text-xs font-bold text-gray-600 mb-2 block">
                                                PRIORITY
                                            </label>
                                            {isEditing ? (
                                                <select
                                                    value={editFormData.priority}
                                                    onChange={(e) =>
                                                        setEditFormData((prev) => ({
                                                            ...prev,
                                                            priority: e.target.value,
                                                        }))
                                                    }
                                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="Critical">Critical</option>
                                                    <option value="High">High</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="Low">Low</option>
                                                </select>
                                            ) : (
                                                <p className={`px-3 py-2 text-xs font-semibold rounded-lg border ${getPriorityColor(selectedTestCase.priority)}`}>
                                                    {selectedTestCase.priority}
                                                </p>
                                            )}
                                        </div>

                                        {/* Status */}
                                        <div className="mb-4">
                                            <label className="text-xs font-bold text-gray-600 mb-2 block">
                                                STATUS
                                            </label>
                                            {isEditing ? (
                                                <select
                                                    value={editFormData.status}
                                                    onChange={(e) =>
                                                        setEditFormData((prev) => ({
                                                            ...prev,
                                                            status: e.target.value,
                                                        }))
                                                    }
                                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="Pass">Pass</option>
                                                    <option value="Fail">Fail</option>
                                                </select>
                                            ) : (
                                                <p className={`px-3 py-2 text-xs font-semibold rounded-lg border ${getStatusColor(selectedTestCase.status)}`}>
                                                    {selectedTestCase.status}
                                                </p>
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