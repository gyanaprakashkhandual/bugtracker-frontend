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
    Check
} from "lucide-react";
import { useAlert } from "@/app/script/Alert.context";
import { useTestType } from "@/app/script/TestType.context";
import { useConfirm } from "@/app/script/Confirm.context";
import { GoogleArrowDown, GoogleArrowRight } from "@/app/components/utils/Icon";
import { copyToClipboard } from "@/app/utils/Copy.text";
import SplitSkeletonLoader from "@/app/components/assets/Split.loader";
import { BUG_EVENTS } from '@/app/components/Sidebars/Bug';



const BugSplitView = () => {
    const [imageDropdownOpen, setImageDropdownOpen] = useState(false);
    const [refLinkDropdownOpen, setRefLinkDropdownOpen] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [bugs, setBugs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBug, setSelectedBug] = useState(null);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [savingField, setSavingField] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(300);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isResizing, setIsResizing] = useState(false);
    const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
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
        bugDesc: "",
        bugRequirement: "",
        refLinks: "",
        images: [],
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

    const projectId =
        typeof window !== "undefined"
            ? localStorage.getItem("currentProjectId")
            : null;
    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const BASE_URL = "http://localhost:5000/api/v1/bug";
    const COMMENT_URL = "http://localhost:5000/api/v1/comment";

    // Search bugs API
    const searchBugs = useCallback(
        async (searchQuery) => {
            if (!projectId || !testTypeId || !token) {
                console.log('Missing required parameters:', { projectId, testTypeId, token: !!token });
                return;
            }

            try {
                setLoading(true);
                const url = `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/search?search=${encodeURIComponent(searchQuery)}&page=1&limit=100`;
                console.log('Search API URL:', url);
                console.log('Search query:', searchQuery);

                const response = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log('Response status:', response.status);
                console.log('Response ok:', response.ok);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.log('Error response body:', errorText);

                    if (response.status === 403) {
                        throw new Error("Access denied to this project or test type");
                    }
                    if (response.status === 404) {
                        throw new Error("API endpoint not found");
                    }
                    if (response.status === 500) {
                        throw new Error("Server error occurred");
                    }
                    throw new Error(`Failed to search bugs: ${response.status} ${errorText}`);
                }

                const data = await response.json();
                console.log('Search API response data:', data);


            } catch (error) {
                console.error("Error searching bugs:", error);
                console.error("Error details:", {
                    message: error.message,
                    stack: error.stack
                });
                showAlert({
                    type: "error",
                    message: error.message || "Failed to search bugs"
                });
            } finally {
                setLoading(false);
            }
        },
        [projectId, testTypeId, token, showAlert]
    );
    // Filter bugs by date API
    const filterBugsByDate = useCallback(
        async (fromDate, toDate) => {
            if (!projectId || !testTypeId || !token) return;

            try {
                setLoading(true);
                let url = `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/filter/date?page=1&limit=1000000`;

                if (fromDate) url += `&fromDate=${fromDate}`;
                if (toDate) url += `&toDate=${toDate}`;

                const response = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error("Failed to filter bugs by date");

                const data = await response.json();
                setBugs(data.bugs || []);
            } catch (error) {
                console.error("Error filtering bugs by date:", error);
                showAlert({ type: "error", message: "Failed to filter bugs by date" });
            } finally {
                setLoading(false);
            }
        },
        [projectId, testTypeId, token]
    );
    useEffect(() => {
        const handleBugChange = (event) => {
            console.log('Bug changed, refreshing data:', event.detail);
            fetchBugs(); // This will refresh your bugs list
        };

        // Listen to all relevant bug events
        window.addEventListener(BUG_EVENTS.CHANGED, handleBugChange);
        window.addEventListener(BUG_EVENTS.CREATED, handleBugChange);
        window.addEventListener(BUG_EVENTS.UPDATED, handleBugChange);
        window.addEventListener(BUG_EVENTS.DELETED, handleBugChange);
        window.addEventListener(BUG_EVENTS.TRASHED, handleBugChange);
        window.addEventListener(BUG_EVENTS.RESTORED, handleBugChange);

        // Cleanup event listeners on component unmount
        return () => {
            window.removeEventListener(BUG_EVENTS.CHANGED, handleBugChange);
            window.removeEventListener(BUG_EVENTS.CREATED, handleBugChange);
            window.removeEventListener(BUG_EVENTS.UPDATED, handleBugChange);
            window.removeEventListener(BUG_EVENTS.DELETED, handleBugChange);
            window.removeEventListener(BUG_EVENTS.TRASHED, handleBugChange);
            window.removeEventListener(BUG_EVENTS.RESTORED, handleBugChange);
        };
    }, []);
    // Get all bugs API
    const fetchBugs = useCallback(async () => {
        if (!projectId || !testTypeId || !token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs?page=1&limit=1000000`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) throw new Error("Failed to fetch bugs");

            const data = await response.json();
            setBugs(data.bugs || []);
        } catch (error) {
            console.error("Error fetching bugs:", error);
            showAlert({ type: "error", message: "Failed to fetch bugs" });
        } finally {
            setLoading(false);
        }
    }, [projectId, testTypeId, token]);

    // Get All the comments
    const fetchComments = async (bugId) => {
        if (!token || !bugId) return;

        setLoadingComments(true);

        try {
            const response = await fetch(
                `${COMMENT_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/${bugId}/comments`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) throw new Error("Failed to fetch comments");

            const data = await response.json();
            setComments(data.comments || []);
        } catch (error) {
            console.error("Error fetching comments:", error);
            showAlert({ type: "error", message: "Failed to fetch comments" });
        } finally {
            setLoadingComments(false);
        }
    };
    // Add Comment
    const submitComment = async (bugId) => {
        if (!newComment.trim() || submittingComment) return;

        setSubmittingComment(true);

        try {
            const response = await fetch(
                `${COMMENT_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/${bugId}/comments`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        comment: newComment,
                        bugId: bugId,
                    }),
                }
            );

            if (!response.ok) throw new Error("Failed to submit comment");

            const data = await response.json();
            setComments((prev) => [data.comment, ...prev]);
            setNewComment("");
            showAlert({ type: "success", message: "Comment added successfully" });
        } catch (error) {
            console.error("Error submitting comment:", error);
            showAlert({ type: "error", message: "Failed to add comment" });
        } finally {
            setSubmittingComment(false);
        }
    };
    // Update bug API
    const updateBug = async (bugId, field, value) => {
        setSavingField(field);

        try {
            const response = await fetch(`${BASE_URL}/bugs/${bugId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ [field]: value }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update bug");
            }

            const data = await response.json();

            setBugs((prev) =>
                prev.map((bug) =>
                    bug._id === bugId ? { ...bug, [field]: value } : bug
                )
            );

            if (selectedBug?._id === bugId) {
                setSelectedBug((prev) => ({ ...prev, [field]: value }));
            }

            showAlert({ type: "success", message: "Bug updated successfully" });
            setTimeout(() => setSavingField(null), 500);
        } catch (error) {
            console.error("Error updating bug:", error);
            showAlert({
                type: "error",
                message: error.message || "Failed to update bug",
            });
            setSavingField(null);
        }
    };
    // Update BUG fields (Edit)
    const updateBugFields = async (bugId, fields) => {
        try {
            const response = await fetch(`${BASE_URL}/bugs/${bugId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(fields),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update bug");
            }

            const data = await response.json();

            setBugs((prev) =>
                prev.map((bug) => (bug._id === bugId ? { ...bug, ...fields } : bug))
            );

            if (selectedBug?._id === bugId) {
                setSelectedBug((prev) => ({ ...prev, ...fields }));
            }

            showAlert({ type: "success", message: "Bug updated successfully" });
            return true;
        } catch (error) {
            console.error("Error updating bug:", error);
            showAlert({
                type: "error",
                message: error.message || "Failed to update bug",
            });
            return false;
        }
    };
    // Move bug to trash API
    const [lastSelectedBugId, setLastSelectedBugId] = useState(null);

    // Load selected bug from localStorage on component mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedBugId = localStorage.getItem(`selectedBug_${projectId}_${testTypeId}`);
            if (savedBugId) {
                setLastSelectedBugId(savedBugId);
            }
        }
    }, [projectId, testTypeId]);

    // Auto-select bug when bugs are loaded
    useEffect(() => {
        if (bugs.length > 0 && !selectedBug) {
            // Try to select the last saved bug
            if (lastSelectedBugId) {
                const savedBug = bugs.find(bug => bug._id === lastSelectedBugId);
                if (savedBug) {
                    setSelectedBug(savedBug);
                    fetchComments(savedBug._id);
                    return;
                }
            }
            // If no saved bug or saved bug not found, select the first bug
            setSelectedBug(bugs[0]);
            fetchComments(bugs[0]._id);
        }
    }, [bugs, lastSelectedBugId, selectedBug]);

    // Save selected bug to localStorage whenever it changes
    useEffect(() => {
        if (selectedBug && typeof window !== 'undefined') {
            localStorage.setItem(`selectedBug_${projectId}_${testTypeId}`, selectedBug._id);
            setLastSelectedBugId(selectedBug._id);
        }
    }, [selectedBug, projectId, testTypeId]);

    // Enhanced delete function with auto-navigation
    const deleteBugPermanently = async (bugId) => {
        try {
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/${bugId}/permanent`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete bug permanently");
            }

            const data = await response.json();

            // Find the current bug index before removing
            const currentIndex = bugs.findIndex(bug => bug._id === bugId);

            setBugs(prev => prev.filter(bug => bug._id !== bugId));

            // Auto-navigate to another bug
            if (selectedBug?._id === bugId) {
                const remainingBugs = bugs.filter(bug => bug._id !== bugId);

                if (remainingBugs.length === 0) {
                    // No bugs left
                    setSelectedBug(null);
                    localStorage.removeItem(`selectedBug_${projectId}_${testTypeId}`);
                } else {
                    // Select next bug, or previous if last bug was deleted
                    let nextBug;
                    if (currentIndex < remainingBugs.length) {
                        nextBug = remainingBugs[currentIndex];
                    } else {
                        nextBug = remainingBugs[remainingBugs.length - 1];
                    }

                    setSelectedBug(nextBug);
                    fetchComments(nextBug._id);
                    localStorage.setItem(`selectedBug_${projectId}_${testTypeId}`, nextBug._id);
                }
            }

            showAlert({ type: "success", message: "Bug deleted permanently" });
        } catch (error) {
            console.error("Error deleting bug permanently:", error);
            showAlert({
                type: "error",
                message: error.message || "Failed to delete bug",
            });
        }
    };

    // Enhanced move to trash function with auto-navigation
    const moveBugToTrash = async (bugId) => {
        try {
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/${bugId}/trash`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to move bug to trash");
            }

            const data = await response.json();

            // Find the current bug index before removing
            const currentIndex = bugs.findIndex(bug => bug._id === bugId);

            setBugs(prev => prev.filter(bug => bug._id !== bugId));

            // Auto-navigate to another bug
            if (selectedBug?._id === bugId) {
                const remainingBugs = bugs.filter(bug => bug._id !== bugId);

                if (remainingBugs.length === 0) {
                    // No bugs left
                    setSelectedBug(null);
                    localStorage.removeItem(`selectedBug_${projectId}_${testTypeId}`);
                } else {
                    // Select next bug, or previous if last bug was deleted
                    let nextBug;
                    if (currentIndex < remainingBugs.length) {
                        nextBug = remainingBugs[currentIndex];
                    } else {
                        nextBug = remainingBugs[remainingBugs.length - 1];
                    }

                    setSelectedBug(nextBug);
                    fetchComments(nextBug._id);
                    localStorage.setItem(`selectedBug_${projectId}_${testTypeId}`, nextBug._id);
                }
            }

            showAlert({
                type: "success",
                message: "Bug moved to trash successfully",
            });
        } catch (error) {
            console.error("Error moving bug to trash:", error);
            showAlert({
                type: "error",
                message: error.message || "Failed to move bug to trash",
            });
        }
    };
    // Move all bugs to trash API
    const moveAllBugsToTrash = async () => {
        try {
            // Show custom confirmation modal
            const result = await showConfirm({
                title: "Move All Bugs to Trash",
                message: "Are you sure you want to move all bugs to trash? This action cannot be undone!",
                confirmText: "Move to Trash",
                cancelText: "Cancel",
                type: "warning",
            });

            if (!result) return; // User canceled

            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/trash-all`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to move all bugs to trash");
            }

            setBugs([]);
            setSelectedBug(null);

            showAlert({
                type: "success",
                message: "All bugs moved to trash successfully",
            });
        } catch (error) {
            console.error("Error moving all bugs to trash:", error);
            showAlert({
                type: "error",
                message: error.message || "Failed to move bugs to trash",
            });
        }
    };
    // Delete all bugs permanently API
    const deleteAllBugsPermanently = async () => {
        try {
            // Show custom confirmation modal
            const result = await showConfirm({
                title: "Delete All Bugs Permanently",
                message: "Are you sure you want to permanently delete all bugs? This action cannot be undone!",
                confirmText: "Delete All",
                cancelText: "Cancel",
                type: "warning",
            });

            if (!result) return; // User canceled

            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/delete-all`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete all bugs");
            }

            setBugs([]);
            setSelectedBug(null);

            showAlert({ type: "success", message: "All bugs deleted permanently" });
        } catch (error) {
            console.error("Error deleting all bugs:", error);
            showAlert({
                type: "error",
                message: error.message || "Failed to delete all bugs",
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
    const handleImageUpload = async (files) => {
        setUploadingImages(true);

        try {
            const uploadPromises = Array.from(files).map((file) =>
                uploadToCloudinary(file)
            );
            const imageUrls = await Promise.all(uploadPromises);

            setSelectedImages((prev) => [...prev, ...imageUrls]);
            setEditFormData((prev) => ({
                ...prev,
                images: [...prev.images, ...imageUrls],
            }));

            showAlert({ type: "success", message: "Images uploaded successfully" });
        } catch (error) {
            console.error("Error uploading images:", error);
            showAlert({ type: "error", message: "Failed to upload images" });
        } finally {
            setUploadingImages(false);
        }
    };
    // Image Remove functions
    const removeImage = (index) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index));
        setEditFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const handleFieldEdit = (field, value) => {
        updateBug(selectedBug._id, field, value);
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setEditFormData({
            moduleName: selectedBug.moduleName || "",
            bugDesc: selectedBug.bugDesc || "",
            bugRequirement: selectedBug.bugRequirement || "",
            refLinks: selectedBug.refLinks || "",
            images: selectedBug.images || [],
        });
        setSelectedImages(selectedBug.images || []);
    };

    const handleSaveClick = async () => {
        const success = await updateBugFields(selectedBug._id, editFormData);
        if (success) {
            setIsEditing(false);
        }
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setEditFormData({
            moduleName: selectedBug.moduleName || "",
            bugDesc: selectedBug.bugDesc || "",
            bugRequirement: selectedBug.bugRequirement || "",
            refLinks: selectedBug.refLinks || "",
            images: selectedBug.images || [],
        });
        setSelectedImages(selectedBug.images || []);
    };

    const goToNextBug = () => {
        const currentIndex = filteredBugs.findIndex(
            (bug) => bug._id === selectedBug._id
        );
        if (currentIndex < filteredBugs.length - 1) {
            const nextBug = filteredBugs[currentIndex + 1];
            setSelectedBug(nextBug);
            fetchComments(nextBug._id);
            setIsEditing(false);
        }
    };

    const goToPreviousBug = () => {
        const currentIndex = filteredBugs.findIndex(
            (bug) => bug._id === selectedBug._id
        );
        if (currentIndex > 0) {
            const prevBug = filteredBugs[currentIndex - 1];
            setSelectedBug(prevBug);
            fetchComments(prevBug._id);
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
        fetchBugs();
    }, [fetchBugs]);

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

    // Handle search and filter changes
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.trim()) {
                searchBugs(searchTerm);
            } else if (dateFilter.start || dateFilter.end) {
                filterBugsByDate(dateFilter.start, dateFilter.end);
            } else {
                fetchBugs();
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [
        searchTerm,
        dateFilter.start,
        dateFilter.end,
        searchBugs,
        filterBugsByDate,
        fetchBugs,
    ]);

    const filteredBugs = bugs;

    const getBugTypeColor = (type) => {
        const colors = {
            Functional: "bg-blue-100 text-blue-800 border-blue-300",
            "User-Interface": "bg-purple-100 text-purple-800 border-purple-300",
            Security: "bg-red-100 text-red-800 border-red-300",
            Database: "bg-green-100 text-green-800 border-green-300",
            Performance: "bg-orange-100 text-orange-800 border-orange-300",
        };
        return colors[type] || "bg-gray-100 text-gray-800 border-gray-300";
    };

    const getStatusColor = (status) => {
        const colors = {
            New: "bg-blue-100 text-blue-800 border-blue-300",
            Open: "bg-purple-100 text-purple-800 border-purple-300",
            "In Progress": "bg-yellow-100 text-yellow-800 border-yellow-300",
            "In Review": "bg-orange-100 text-orange-800 border-orange-300",
            Closed: "bg-green-100 text-green-800 border-green-300",
            "Re Open": "bg-red-100 text-red-800 border-red-300",
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
    const getSeverityColor = (severity) => {
        const colors = {
            Critical: "bg-red-100 text-red-800 border-red-300",
            High: "bg-orange-100 text-orange-800 border-orange-300",
            Medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
            Low: "bg-green-100 text-green-800 border-green-300",
        };
        return colors[severity] || "bg-gray-100 text-gray-800 border-gray-300";
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
            if ((label = "Severity")) return getSeverityColor(value);
            if (label === "Status") return getStatusColor(value);
            if (label === "Bug Type") return getBugTypeColor(value);
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
        return <SplitSkeletonLoader />
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
                            placeholder="Search bugs..."
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
                                            fetchBugs();
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
                            onClick={moveAllBugsToTrash}
                            className="flex-1 px-3 py-1.5 text-xs bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                        >
                            Trash All
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={deleteAllBugsPermanently}
                            className="flex-1 px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                            Delete All
                        </motion.button>
                    </div>
                </div>

                {/* Bugs List */}
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
                    ) : filteredBugs.length === 0 ? (
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
                                    No bugs found. Your system is running smoothly.
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
                            {filteredBugs.map((bug, index) => (
                                <motion.div
                                    key={bug._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    whileHover={{
                                        y: -2,
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    }}
                                    className={`bg-white rounded-xl border-1 p-3 cursor-pointer transition-all duration-200 ${selectedBug?._id === bug._id
                                        ? "border-blue-500 bg-blue-50 shadow-md"
                                        : "border-gray-200 hover:border-blue-300"
                                        }`}
                                    onClick={() => {
                                        setSelectedBug(bug);
                                        fetchComments(bug._id);
                                    }}
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                            {bug.serialNumber}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <span
                                                className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${getBugTypeColor(
                                                    bug.bugType
                                                )}`}
                                            >
                                                {bug.bugType}
                                            </span>
                                            <span
                                                className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${getStatusColor(
                                                    bug.status
                                                )}`}
                                            >
                                                {bug.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs text-gray-700 mb-2 line-clamp-2 min-h-[2rem] leading-relaxed">
                                        {bug.bugDesc || "No description"}
                                    </p>

                                    {/* Date */}
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                                        <Clock size={12} className="text-gray-400" />
                                        <span>
                                            {bug.updatedAt
                                                ? `Updated: ${new Date(
                                                    bug.updatedAt
                                                ).toLocaleDateString()}`
                                                : `Created: ${new Date(
                                                    bug.createdAt
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
                        {selectedBug && (
                            <div className="flex items-center gap-2 ml-4">
                                <motion.h2
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => copyText(selectedBug.serialNumber)}
                                    className="text-sm font-bold text-gray-800 cursor-pointer bg-gray-100 px-3 py-2 rounded-lg"
                                >
                                    {selectedBug.serialNumber}
                                </motion.h2>
                                <GitHubDropdown
                                    value={selectedBug.bugType || "Functional"}
                                    options={[
                                        "Functional",
                                        "User-Interface",
                                        "Security",
                                        "Database",
                                        "Performance",
                                    ]}
                                    onChange={(value) => handleFieldEdit("bugType", value)}
                                    label="Bug Type"
                                    className="min-w-[130px]"
                                />
                                <GitHubDropdown
                                    value={selectedBug.priority || "Medium"}
                                    options={["Critical", "High", "Medium", "Low"]}
                                    onChange={(value) => handleFieldEdit("priority", value)}
                                    label="Priority"
                                    className="min-w-[110px]"
                                />
                                <GitHubDropdown
                                    value={selectedBug.severity || "Medium"}
                                    options={["Critical", "High", "Medium", "Low"]}
                                    onChange={(value) => handleFieldEdit("severity", value)}
                                    label="Severity"
                                    className="min-w-[110px]"
                                />
                                <GitHubDropdown
                                    value={selectedBug.status || "New"}
                                    options={[
                                        "New",
                                        "Open",
                                        "In Progress",
                                        "In Review",
                                        "Closed",
                                        "Re Open",
                                    ]}
                                    onChange={(value) => handleFieldEdit("status", value)}
                                    label="Status"
                                    className="min-w-[130px]"
                                />
                            </div>
                        )}
                    </div>

                    {selectedBug && (
                        <div className="flex items-center gap-3">
                            {/* Image Button with Dropdown */}
                            {selectedBug.images && selectedBug.images.length > 0 && (
                                <div className="relative">
                                    <motion.button
                                        tooltip-data="View Images"
                                        tooltip-placement="bottom"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setImageDropdownOpen(!imageDropdownOpen)}
                                        className="flex items-center gap-1.5 px-4 py-2 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm font-medium"
                                    >
                                        <ImageIcon size={13} />
                                        <span>{selectedBug.images.length}</span>
                                    </motion.button>

                                    {/* Image Dropdown */}
                                    {imageDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[200px] w-64 overflow-y-auto"
                                        >
                                            {selectedBug.images.map((image, index) => (
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

                            {/* Reference Link Button with Dropdown */}
                            {selectedBug.refLinks &&
                                selectedBug.refLinks !== "No Link Provided" && (
                                    <div className="relative">
                                        <motion.button
                                            tooltip-data="Open Reference"
                                            tooltip-placement="bottom"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setRefLinkDropdownOpen(!refLinkDropdownOpen)}
                                            className="flex items-center gap-1.5 px-4 py-2 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                                        >
                                            <Link2 size={13} />
                                        </motion.button>

                                        {/* Reference Link Dropdown */}
                                        {refLinkDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[200px] w-64 overflow-y-auto"
                                            >
                                                {Array.isArray(selectedBug.refLinks) ? (
                                                    selectedBug.refLinks.map((link, index) => (
                                                        <a
                                                            key={index}
                                                            href={link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={() => setRefLinkDropdownOpen(false)}
                                                            className="block px-4 py-2.5 text-xs text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors border-b border-gray-100 last:border-b-0 truncate"
                                                        >
                                                            {link}
                                                        </a>
                                                    ))
                                                ) : (
                                                    <a
                                                        href={selectedBug.refLinks}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={() => setRefLinkDropdownOpen(false)}
                                                        className="block px-4 py-2.5 text-xs text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors truncate"
                                                    >
                                                        {selectedBug.refLinks}
                                                    </a>
                                                )}
                                            </motion.div>
                                        )}
                                    </div>
                                )}
                            {/* Bug counter */}
                            <div className="text-xs text-gray-600 font-medium bg-gray-100 px-3 py-1.5 rounded-lg">
                                Bug{" "}
                                {filteredBugs.findIndex((b) => b._id === selectedBug._id) + 1}{" "}
                                of {filteredBugs.length}
                            </div>

                            {/* Navigation buttons */}
                            <div className="flex items-center gap-1">
                                <motion.button
                                    tooltip-data="Previous"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={goToPreviousBug}
                                    disabled={
                                        filteredBugs.findIndex((b) => b._id === selectedBug._id) ===
                                        0
                                    }
                                    className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                </motion.button>
                                <motion.button
                                    tooltip-data="Next"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={goToNextBug}
                                    disabled={
                                        filteredBugs.findIndex((b) => b._id === selectedBug._id) ===
                                        filteredBugs.length - 1
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
                                onClick={() => moveBugToTrash(selectedBug._id)}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm font-medium"
                            >
                                <Archive size={13} />
                            </motion.button>
                            <motion.button
                                tooltip-data="Delete"
                                tooltip-placement="bottom"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => deleteBugPermanently(selectedBug._id)}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm font-medium"
                            >
                                <Trash2 size={13} />
                            </motion.button>
                        </div>
                    )}
                </div>

                {/* Bug Details */}
                <div className="flex-1 overflow-y-auto p-1">
                    {!selectedBug ? (
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
                                    No Bug Selected
                                </h3>
                                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                                    Choose a bug from the list to view its details, comments, and tracking information
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
                                    <span>Click a bug card</span>
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
                                {/* Left Column - Bug Details */}
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
                                                {selectedBug.moduleName || "No module specified"}
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
                                                value={editFormData.bugDesc}
                                                onChange={(e) =>
                                                    setEditFormData((prev) => ({
                                                        ...prev,
                                                        bugDesc: e.target.value,
                                                    }))
                                                }
                                                rows={4}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                                placeholder="Enter bug description..."
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-700 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 min-h-[100px] leading-relaxed">
                                                {selectedBug.bugDesc || "No description"}
                                            </p>
                                        )}
                                    </motion.div>

                                    {/* Requirement */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
                                    >
                                        <label className="user-select-none text-xs font-bold text-gray-600 mb-2 block tracking-wide">
                                            REQUIREMENT
                                        </label>
                                        {isEditing ? (
                                            <textarea
                                                value={editFormData.bugRequirement}
                                                onChange={(e) =>
                                                    setEditFormData((prev) => ({
                                                        ...prev,
                                                        bugRequirement: e.target.value,
                                                    }))
                                                }
                                                rows={3}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                                placeholder="Enter bug requirement..."
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-700 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 min-h-[80px] leading-relaxed">
                                                {selectedBug.bugRequirement ||
                                                    "No requirement specified"}
                                            </p>
                                        )}
                                    </motion.div>

                                    {/* Reference Link */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
                                    >
                                        <label className="user-select-none text-xs font-bold text-gray-600 mb-2 block tracking-wide">
                                            REFERENCE LINK
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
                                                        No reference link
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
                                                {Array.isArray(selectedBug?.refLinks) && selectedBug.refLinks.length > 0 ? (
                                                    selectedBug.refLinks.map((link, index) => (
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
                                                        No reference link
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>


                                    {/* Multiple Images Display */}
                                    {selectedBug.images && selectedBug.images.length > 0 && (
                                        <>
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
                                            >
                                                <label className="user-select-none text-xs font-bold text-gray-600 mb-2 block tracking-wide">
                                                    BUG IMAGES
                                                </label>
                                                {isEditing ? (
                                                    <div className="space-y-3">
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedImages.map((image, index) => (
                                                                <div key={index} className="relative group">
                                                                    <img
                                                                        src={image}
                                                                        alt={`Bug screenshot ${index + 1}`}
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
                                                        {selectedBug.images.map((image, index) => (
                                                            <motion.div
                                                                key={index}
                                                                whileHover={{ scale: 1.05 }}
                                                                className="block"
                                                            >
                                                                <img
                                                                    src={image}
                                                                    alt={`Bug screenshot ${index + 1}`}
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
                                        (!selectedBug.images ||
                                            selectedBug.images.length === 0) && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
                                            >
                                                <label className="text-xs font-bold text-gray-600 mb-2 block tracking-wide">
                                                    ADD BUG IMAGES
                                                </label>
                                                <div className="space-y-3">
                                                    {selectedImages.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedImages.map((image, index) => (
                                                                <div key={index} className="relative group">
                                                                    <img
                                                                        src={image}
                                                                        alt={`Bug screenshot ${index + 1}`}
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
                                        transition={{ delay: 0.35 }}
                                        className="grid grid-cols-2 gap-4 pt-2"
                                    >
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                            <label className="text-xs font-bold text-gray-600 mb-1.5 tracking-wide flex items-center gap-1.5">
                                                <Calendar size={12} />
                                                CREATED AT
                                            </label>
                                            <p className="text-xs text-gray-700 font-medium">
                                                {new Date(selectedBug.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        {selectedBug.updatedAt && (
                                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                                <label className="text-xs font-bold text-gray-600 mb-1.5 block tracking-wide  items-center gap-1.5">
                                                    <Clock size={12} />
                                                    UPDATED AT
                                                </label>
                                                <p className="text-xs text-gray-700 font-medium">
                                                    {new Date(selectedBug.updatedAt).toLocaleString()}
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
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 top-1">
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
                                                onClick={() => submitComment(selectedBug._id)}
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

export default BugSplitView;