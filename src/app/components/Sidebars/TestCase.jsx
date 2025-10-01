import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Github,
    FileSpreadsheet,
    Upload,
    Link,
    File
} from 'lucide-react';
import { GoogleArrowDown } from '../utils/Icon';

const TestCaseSidebar = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const [activeTab, setActiveTab] = useState('text-prompt');
    const [formData, setFormData] = useState({
        moduleName: '',
        testCaseType: '',
        testCaseDescription: '',
        actualResult: '',
        expectedResult: '',
        severity: '',
        priority: '',
        status: '',
        image: null
    });
    const [prompt, setPrompt] = useState('');
    const [openDropdowns, setOpenDropdowns] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const BASE_URL = 'http://localhost:5000/api/v1/test-case';

    const navItems = [
        { id: 'text-prompt', label: 'Text Prompt' },
        { id: 'fill-test-case', label: 'Fill Test Case' },
        { id: 'cloud-upload', label: 'Cloud Upload' }
    ];

    const dropdownOptions = {
        testCaseType: ['Functional', 'User-Interface', 'Performance', 'API', 'Database', 'Security', 'Others'],
        severity: ['Critical', 'High', 'Medium', 'Low'],
        priority: ['Critical', 'High', 'Medium', 'Low'],
        status: ['New', 'Reviewed', 'Working', 'Solved', 'Reopen', 'Open', 'Closed']
    };

    const uploadOptions = [
        { id: 'github', label: 'Connect with Github', icon: Github },
        { id: 'google-sheet', label: 'Upload Google Sheet Link', icon: Link },
        { id: 'file', label: 'Upload File', icon: File },
        { id: 'microsoft', label: 'Upload Microsoft Spreadsheet Link', icon: FileSpreadsheet },
        { id: 'csv', label: 'Upload CSV', icon: Upload }
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleDropdown = (field) => {
        setOpenDropdowns(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // Function to upload image to Cloudinary
    const uploadImageToCloudinary = async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'test_case_images'); // You'll need to set this up in your Cloudinary account

            const response = await fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Image upload failed');
            }

            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Error uploading image to Cloudinary:', error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);

            const token = localStorage.getItem("token");
            const projectId = localStorage.getItem("currentProjectId");
            const testTypeId = localStorage.getItem("selectedTestTypeId");

            if (!token || !projectId || !testTypeId) {
                alert('Missing required information. Please make sure you have selected a project and test type.');
                return;
            }

            let imageUrl = '';
            if (formData.image) {
                try {
                    imageUrl = await uploadImageToCloudinary(formData.image);
                } catch (error) {
                    console.error('Failed to upload image:', error);
                    alert('Failed to upload image. Please try again.');
                    return;
                }
            }

            const payload = {
                moduleName: formData.moduleName,
                testCaseType: formData.testCaseType,
                testCaseDescription: formData.testCaseDescription,
                actualResult: formData.actualResult,
                expectedResult: formData.expectedResult,
                severity: formData.severity,
                priority: formData.priority,
                status: formData.status,
                image: imageUrl || 'No image provided'
            };

            const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create test case');
            }

            const result = await response.json();
            console.log('Test case created successfully:', result);

            // Reset form and close sidebar
            setFormData({
                moduleName: '',
                testCaseType: '',
                testCaseDescription: '',
                actualResult: '',
                expectedResult: '',
                severity: '',
                priority: '',
                status: '',
                image: null
            });

            if (onClose) onClose();
            alert('Test case created successfully!');

        } catch (error) {
            console.error('Error creating test case:', error);
            alert(error.message || 'Failed to create test case');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            moduleName: '',
            testCaseType: '',
            testCaseDescription: '',
            actualResult: '',
            expectedResult: '',
            severity: '',
            priority: '',
            status: '',
            image: null
        });
        if (onClose) onClose();
    };

    const handlePromptSubmit = async () => {
        try {
            if (!prompt.trim()) return;

            setIsSubmitting(true);

            const token = localStorage.getItem("token");
            const projectId = localStorage.getItem("currentProjectId");
            const testTypeId = localStorage.getItem("selectedTestTypeId");

            if (!token || !projectId || !testTypeId) {
                alert('Missing required information. Please make sure you have selected a project and test type.');
                return;
            }

            const payload = {
                rawText: prompt.trim()
            };

            const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases/ai-text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create test case from text');
            }

            const result = await response.json();
            console.log('AI test case created successfully:', result);

            setPrompt('');
            if (onClose) onClose();
            alert('Test case created successfully from text!');

        } catch (error) {
            console.error('Error creating AI test case:', error);
            alert(error.message || 'Failed to create test case from text');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getDropdownPlaceholder = (field) => {
        const placeholders = {
            testCaseType: 'Type',
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
                        className="w-full p-4 pr-12 border border-gray-200 rounded-2xl  focus:ring-0.5 focus:ring-blue-900   resize-none bg-gray-50 hover:bg-gray-100 transition-colors"
                        rows="1"
                        style={{ minHeight: '52px', maxHeight: '120px' }}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                        }}
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
            </div>
        </motion.div>
    );

    const renderDropdown = (field, options) => (
        <div className="relative flex-1">
            <button
                onClick={() => toggleDropdown(field)}
                className="w-full p-3 border border-gray-200 rounded-xl text-left flex items-center justify-between hover:border-gray-300 transition-all duration-200 bg-gray-50 hover:bg-gray-100"
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
                            >
                                {option}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    const renderTestCaseForm = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6 space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto"
        >
            {/* Dropdowns in one row */}
            <div className="grid grid-cols-2 gap-3">
                {renderDropdown('testCaseType', dropdownOptions.testCaseType)}
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
                    className="w-full p-4 border border-gray-200 rounded-xl  focus:ring-0.5 focus:ring-blue-900   bg-gray-50 hover:bg-gray-100 transition-all duration-200 font-medium"
                    placeholder="Module Name"
                />
            </div>

            {/* Test Case Description */}
            <div>
                <textarea
                    value={formData.testCaseDescription}
                    onChange={(e) => handleInputChange('testCaseDescription', e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-xl  focus:ring-0.5 focus:ring-blue-900   h-28 resize-none bg-gray-50 hover:bg-gray-100 transition-all duration-200"
                    placeholder="Test Case Description"
                />
            </div>

            {/* Actual Result */}
            <div>
                <textarea
                    value={formData.actualResult}
                    onChange={(e) => handleInputChange('actualResult', e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-xl  focus:ring-0.5 focus:ring-blue-900   h-28 resize-none bg-gray-50 hover:bg-gray-100 transition-all duration-200"
                    placeholder="Actual Result"
                />
            </div>

            {/* Expected Result */}
            <div>
                <textarea
                    value={formData.expectedResult}
                    onChange={(e) => handleInputChange('expectedResult', e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-xl  focus:ring-0.5 focus:ring-blue-900   h-28 resize-none bg-gray-50 hover:bg-gray-100 transition-all duration-200"
                    placeholder="Expected Result"
                />
            </div>

            {/* Image Upload */}
            <div>
                <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200 group">
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
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancel}
                    disabled={isSubmitting}
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
                    {activeTab === 'fill-test-case' && renderTestCaseForm()}
                    {activeTab === 'cloud-upload' && renderCloudUpload()}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TestCaseSidebar;