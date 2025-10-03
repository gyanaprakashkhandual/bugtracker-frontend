import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    ChevronDown,
    Github,
    FileSpreadsheet,
    Upload,
    Link,
    File
} from 'lucide-react';
import { GoogleArrowDown } from '../utils/Icon';

const BugSidebar = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const [activeTab, setActiveTab] = useState('text-prompt');
    const [formData, setFormData] = useState({
        bugType: '',
        moduleName: '',
        bugDesc: '',
        bugRequirement: '',
        refLink: '',
        severity: '',
        priority: '',
        status: '',
        image: null
    });
    const [prompt, setPrompt] = useState('');
    const [openDropdowns, setOpenDropdowns] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const { useAlert } = require("../../script/Alert.context");
    const { showAlert } = useAlert();

    const BASE_URL = 'http://localhost:5000/api/v1/bug';
    const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dvytvjplt/image/upload';
    const projectId = localStorage.getItem("currentProjectId");
    const testTypeId = localStorage.getItem("selectedTestTypeId");
    const token = localStorage.getItem("token");

    const navItems = [
        { id: 'text-prompt', label: 'Text Prompt' },
        { id: 'fill-bug', label: 'Fill Bug' },
        { id: 'cloud-upload', label: 'Cloud Upload' }
    ];

    const dropdownOptions = {
        bugType: ['Functional', 'User-Interface', 'Security', 'Database', 'Performance'],
        severity: ['Critical', 'High', 'Medium', 'Low'],
        priority: ['High', 'Low', 'Medium', 'Critical'],
        status: ['New', 'Open', 'In Progress', 'In Review', 'Closed', 'Re Open']
    };

    const uploadOptions = [
        { id: 'google-sheet', label: 'Upload Google Sheet Link', icon: Link },
        { id: 'file', label: 'Upload File', icon: File },
        { id: 'microsoft', label: 'Upload Microsoft Spreadsheet Link', icon: FileSpreadsheet },
        { id: 'csv', label: 'Upload CSV', icon: Upload }
    ];

    const uploadImageToCloudinary = async (file) => {
        try {
            setIsUploadingImage(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'test_case_preset'); // You may need to change this

            const response = await fetch(CLOUDINARY_URL, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload image to Cloudinary');
            }

            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Error uploading image:', error);
            showAlert({
                type: 'error',
                message: 'Failed to upload image'
            });
            throw error;
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleDropdown = (field) => {
        setOpenDropdowns(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // API call for traditional bug creation
    const createTraditionalBug = async () => {
        try {
            setIsSubmitting(true);

            let imageUrl = 'No Image provided';
            if (formData.image) {
                imageUrl = await uploadImageToCloudinary(formData.image);
            }

            const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    bugType: formData.bugType || 'Functional',
                    moduleName: formData.moduleName || 'No Module',
                    bugDesc: formData.bugDesc || 'No Bug Description',
                    bugRequirement: formData.bugRequirement || 'No Requirement',
                    refLink: formData.refLink || 'No Link Provided',
                    priority: formData.priority || 'Medium',
                    severity: formData.severity || 'Medium',
                    status: formData.status || 'New',
                    image: imageUrl
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create bug');
            }

            const data = await response.json();

            showAlert({
                type: 'success',
                message: 'Bug created successfully'
            });

            return data;
        } catch (error) {
            console.error('Error creating bug:', error);
            showAlert({
                type: 'error',
                message: error.message || 'Failed to create bug'
            });
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    // API call for AI-powered bug creation
    const createAIBug = async (rawText) => {
        try {
            setIsSubmitting(true);

            const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/ai-text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    rawText: rawText.trim()
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create bug from text');
            }

            const data = await response.json();

            showAlert({
                type: 'success',
                message: 'Bug created successfully from AI text'
            });

            return data;
        } catch (error) {
            console.error('Error creating AI bug:', error);
            showAlert({
                type: 'error',
                message: error.message || 'Failed to create bug from text'
            });
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        try {
            // Validate required fields
            if (!formData.bugDesc && !formData.testCaseDescription) {
                showAlert({
                    type: 'error',
                    message: 'Bug description is required'
                });
                return;
            }

            await createTraditionalBug();

            // Reset form and close sidebar
            setFormData({
                bugType: '',
                moduleName: '',
                bugDesc: '',
                bugRequirement: '',
                refLink: '',
                severity: '',
                priority: '',
                status: '',
                image: null
            });

            if (onClose) onClose();
        } catch (error) {
            // Error handling is done in the API function
            console.error('Submit error:', error);
        }
    };

    const handleCancel = () => {
        setFormData({
            bugType: '',
            moduleName: '',
            bugDesc: '',
            bugRequirement: '',
            refLink: '',
            severity: '',
            priority: '',
            status: '',
            image: null
        });
        if (onClose) onClose();
    };

    const handlePromptSubmit = async () => {
        if (!prompt.trim()) {
            showAlert({
                type: 'error',
                message: 'Please enter some text'
            });
            return;
        }

        try {
            await createAIBug(prompt);
            setPrompt('');

            if (onClose) onClose();
        } catch (error) {
            // Error handling is done in the API function
            console.error('Prompt submit error:', error);
        }
    };

    const getDropdownPlaceholder = (field) => {
        const placeholders = {
            bugType: 'Type',
            severity: 'Severity',
            priority: 'Priority',
            status: 'Status'
        };
        return placeholders[field] || field;
    };

    const renderTextPrompt = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full"
        >
            {/* Chat messages area - placeholder for now */}
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="text-center text-gray-500 mt-20">
                    <p>Start a conversation...</p>
                </div>
            </div>

            {/* Chat input at bottom */}
            <div className="p-6 border-t bg-white">
                <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Message..."
                        className="w-full p-4 pr-12 border border-gray-200 rounded-2xl resize-none bg-gray-50 hover:bg-gray-100 transition-colors"
                        rows="1"
                        style={{ minHeight: '52px', maxHeight: '120px' }}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                        }}
                        disabled={isSubmitting}
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handlePromptSubmit}
                        disabled={!prompt.trim() || isSubmitting}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={16} />
                    </motion.button>
                </div>
                {isSubmitting && (
                    <div className="text-center text-sm text-gray-500 mt-2">
                        Processing with AI...
                    </div>
                )}
            </div>
        </motion.div>
    );

    const renderDropdown = (field, options) => (
        <div className="relative flex-1">
            <button
                onClick={() => toggleDropdown(field)}
                disabled={isSubmitting}
                className="w-full p-3 border border-gray-200 rounded-xl text-left flex items-center justify-between hover:border-gray-300 transition-all duration-200 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span className={formData[field] ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                    {formData[field] || getDropdownPlaceholder(field)}
                </span>
                <motion.div
                    animate={{ rotate: openDropdowns[field] ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <GoogleArrowDown size={16} className="text-gray-400" />
                </motion.div>
            </button>

            <AnimatePresence>
                {openDropdowns[field] && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto"
                    >
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => {
                                    handleInputChange(field, option);
                                    toggleDropdown(field);
                                }}
                                className="w-full p-3 text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors font-medium text-gray-700 hover:text-gray-900"
                                disabled={isSubmitting}
                            >
                                {option}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    const renderBugForm = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6 space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto"
        >
            {/* Dropdowns in one row */}
            <div className="grid grid-cols-2 gap-3">
                {renderDropdown('bugType', dropdownOptions.bugType)}
                {renderDropdown('severity', dropdownOptions.severity)}
            </div>

            <div className="grid grid-cols-2 gap-3">
                {renderDropdown('priority', dropdownOptions.priority)}
                {renderDropdown('status', dropdownOptions.status)}
            </div>

            {/* Module Name */}
            <div>
                <input
                    type="text"
                    value={formData.moduleName}
                    onChange={(e) => handleInputChange('moduleName', e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 font-medium"
                    placeholder="Module Name"
                    disabled={isSubmitting}
                />
            </div>

            {/* Bug Description */}
            <div>
                <textarea
                    value={formData.bugDesc}
                    onChange={(e) => handleInputChange('bugDesc', e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-xl h-28 resize-none bg-gray-50 hover:bg-gray-100 transition-all duration-200"
                    placeholder="Bug Description"
                    disabled={isSubmitting}
                />
            </div>

            {/* Bug Requirement */}
            <div>
                <textarea
                    value={formData.bugRequirement}
                    onChange={(e) => handleInputChange('bugRequirement', e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-xl h-28 resize-none bg-gray-50 hover:bg-gray-100 transition-all duration-200"
                    placeholder="Bug Requirement"
                    disabled={isSubmitting}
                />
            </div>

            {/* Reference Link */}
            <div>
                <input
                    type="text"
                    value={formData.refLink}
                    onChange={(e) => handleInputChange('refLink', e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 font-medium"
                    placeholder="Reference Link"
                    disabled={isSubmitting}
                />
            </div>

            {/* Image Upload */}
            <div>
                <div className="flex items-center justify-center w-full">
                    <label className={`flex flex-col items-center justify-center w-full h-36 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200 group ${isSubmitting || isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <div className="p-3 bg-white rounded-full mb-4 group-hover:bg-blue-50 transition-colors">
                                <Upload className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                            </div>
                            <p className="mb-2 text-sm text-gray-600 font-medium">
                                <span className="text-blue-600">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 10MB)</p>
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleInputChange('image', e.target.files[0])}
                            disabled={isSubmitting || isUploadingImage}
                        />
                    </label>
                </div>
                {formData.image && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl"
                    >
                        <p className="text-sm text-green-700 font-medium">
                            ✓ {formData.image.name}
                        </p>
                    </motion.div>
                )}
                {isUploadingImage && (
                    <div className="text-center text-sm text-gray-500 mt-2">
                        Uploading image to Cloudinary...
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={isSubmitting || isUploadingImage}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancel}
                    disabled={isSubmitting || isUploadingImage}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Cancel
                </motion.button>
            </div>
        </motion.div>
    );

    const renderCloudUpload = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6 space-y-4"
        >
            <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Choose Upload Method</h3>
                <p className="text-sm text-gray-600">Select how you want to upload your test cases</p>
            </div>

            <div className="space-y-3">
                {uploadOptions.map((option, index) => (
                    <motion.button
                        key={option.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 flex items-center gap-4 group bg-gray-50 hover:shadow-md"
                    >
                        <div className="p-3 bg-white rounded-lg group-hover:bg-blue-100 transition-colors shadow-sm">
                            <option.icon size={22} className="text-gray-600 group-hover:text-blue-600" />
                        </div>
                        <span className="text-gray-700 font-semibold group-hover:text-blue-700">
                            {option.label}
                        </span>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );

    return (
        <div className="h-[calc(100vh-4rem)] fixed right-0 sidebar-scrollbar mt-16 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 w-[28rem] flex flex-col shadow-xl">
            {/* Navigation Header */}
            <div className="border-b border-gray-200 bg-white">
                <div className="flex">
                    {navItems.map((item, index) => (
                        <motion.button
                            key={item.id}
                            whileHover={{ backgroundColor: '#f8fafc' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex-1 p-4 text-center transition-all duration-200 border-r border-gray-200 last:border-r-0 ${activeTab === item.id
                                ? 'bg-blue-50 border-b-2 border-blue-600 text-blue-700'
                                : 'text-gray-700 hover:text-gray-900'
                                }`}
                        >
                            <span className="font-semibold text-sm">{item.label}</span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                    {activeTab === 'text-prompt' && renderTextPrompt()}
                    {activeTab === 'fill-bug' && renderBugForm()}
                    {activeTab === 'cloud-upload' && renderCloudUpload()}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default BugSidebar;