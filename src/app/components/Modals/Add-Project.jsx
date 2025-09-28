"use client";

import { useState, useEffect } from "react";
import { X, Plus, Edit3, Save, Loader2 } from "lucide-react";
import Alert from "../utils/Alert";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const ProjectModal = ({ project, token, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        projectName: "",
        projectDesc: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isVisible, setIsVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Determine if we're creating or editing
    const isEditMode = !!project;

    useEffect(() => {
        setIsVisible(true);
        if (isEditMode && project) {
            setFormData({
                projectName: project.projectName || "",
                projectDesc: project.projectDesc || ""
            });
        } else {
            setFormData({ projectName: "", projectDesc: "" });
        }
    }, [isEditMode, project]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.projectName.trim()) {
            newErrors.projectName = "Project name is required";
        } else if (formData.projectName.trim().length < 3) {
            newErrors.projectName = "Project name must be at least 3 characters";
        }

        if (!formData.projectDesc.trim()) {
            newErrors.projectDesc = "Project description is required";
        } else if (formData.projectDesc.trim().length < 10) {
            newErrors.projectDesc = "Description must be at least 10 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose(), 200);
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            if (!isEditMode) {
                // Create new project
                const response = await axios.post(
                    "http://localhost:5000/api/v1/project/",
                    formData,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        }
                    }
                );

                console.log("Project created successfully:", response.data);
                setSuccessMessage("Project created successfully");
            } else {
                // Update existing project - use the project ID from the prop
                const response = await axios.put(
                    `http://localhost:5000/api/v1/project/${project._id}`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        }
                    }
                );

                console.log("Project updated successfully:", response.data);
                setSuccessMessage("Project updated successfully");
            }

            // Clear the message after a delay and call onSuccess
            setTimeout(() => {
                setSuccessMessage("");
                onSuccess();
            }, 1500);
        } catch (err) {
            console.error(`Error ${isEditMode ? "updating" : "creating"} project:`, err);
            setErrors({
                submit: err.response?.data?.message || `Failed to ${isEditMode ? "update" : "create"} project. Please try again.`
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
        }
        if (errors.submit) {
            setErrors({ ...errors, submit: "" });
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSubmit();
        }
    };

    // Modal animation variants
    const modalVariants = {
        hidden: {
            opacity: 0,
            scale: 0.8,
            transition: { duration: 0.2 }
        },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.3, ease: "easeOut" }
        }
    };

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="fixed inset-0 flex items-center justify-center p-4 z-50 backdrop-blur-md"
                >
                    {/* Success Alert */}
                    <AnimatePresence>
                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -50 }}
                                className="absolute z-50 transform -translate-x-1/2 top-8 left-1/2"
                            >
                                <Alert type="success" message={successMessage} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Backdrop */}
                    <div
                        className="absolute inset-0"
                        onClick={handleClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="relative bg-white rounded-lg shadow-2xl w-full max-w-lg mx-auto"
                        onKeyPress={handleKeyPress}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200 ${!isEditMode
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-emerald-100 text-emerald-600"
                                    }`}>
                                    {!isEditMode ? (
                                        <Plus className="w-5 h-5" />
                                    ) : (
                                        <Edit3 className="w-5 h-5" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {!isEditMode ? "Create New Project" : "Edit Project"}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        {!isEditMode
                                            ? "Add a new project to your workspace"
                                            : "Update project information"
                                        }
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleClose}
                                className="flex items-center justify-center w-8 h-8 text-gray-400 transition-all duration-200 rounded-lg hover:text-gray-600 hover:bg-gray-100"
                                disabled={isLoading}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form Content */}
                        <div className="px-6 py-6 space-y-5">
                            {/* Error Message */}
                            {errors.submit && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="p-3 border border-red-200 rounded-lg bg-red-50"
                                >
                                    <p className="text-sm text-red-600">{errors.submit}</p>
                                </motion.div>
                            )}

                            {/* Project Name Input */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Project Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.projectName}
                                    onChange={(e) => handleInputChange("projectName", e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${errors.projectName
                                        ? "border-red-300 focus:ring-red-500"
                                        : "border-gray-300 focus:ring-blue-500 hover:border-gray-400"
                                        }`}
                                    placeholder="Enter project name"
                                    disabled={isLoading}
                                    autoFocus
                                />
                                {errors.projectName && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center space-x-2"
                                    >
                                        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                        <p className="text-sm text-red-600">{errors.projectName}</p>
                                    </motion.div>
                                )}
                            </div>

                            {/* Project Description Input */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.projectDesc}
                                    onChange={(e) => handleInputChange("projectDesc", e.target.value)}
                                    rows={4}
                                    className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 resize-none ${errors.projectDesc
                                        ? "border-red-300 focus:ring-red-500"
                                        : "border-gray-300 focus:ring-blue-500 hover:border-gray-400"
                                        }`}
                                    placeholder="Describe your project objectives, scope, and key deliverables..."
                                    disabled={isLoading}
                                />
                                {errors.projectDesc && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center space-x-2"
                                    >
                                        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                        <p className="text-sm text-red-600">{errors.projectDesc}</p>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-end px-6 py-5 space-x-3 border-t border-gray-200 rounded-b-lg bg-gray-50">
                            <button
                                onClick={handleClose}
                                disabled={isLoading}
                                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || !formData.projectName.trim() || !formData.projectDesc.trim()}
                                className={`px-6 py-2.5 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 font-medium flex items-center space-x-2 min-w-[140px] justify-center disabled:opacity-50 disabled:cursor-not-allowed ${!isEditMode
                                    ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-400"
                                    : "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 disabled:bg-emerald-400"
                                    }`}
                            >
                                {isLoading ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="flex items-center space-x-2"
                                    >
                                        <span>
                                            {!isEditMode ? "Creating..." : "Saving..."}
                                        </span>
                                    </motion.div>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>{!isEditMode ? "Create Project" : "Save Changes"}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProjectModal;