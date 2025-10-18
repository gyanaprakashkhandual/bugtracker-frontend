"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Github, Link, X, Loader2 } from 'lucide-react';
import { useAlert } from '@/app/script/Alert.context';
import { useProject } from '@/app/script/Project.context';
import { useTestType } from '@/app/script/TestType.context';
import { GoogleArrowDown } from '../utils/Icon';

export const TESTCASE_EVENTS = {
    CREATED: 'testcase:created',
    UPDATED: 'testcase:updated',
    DELETED: 'testcase:deleted',
    IMPORTED: 'testcase:imported',
    CHANGED: 'testcase:changed',
};

const emitTestCaseEvent = (eventType, testCaseData = null) => {
    if (typeof window !== 'undefined') {
        const event = new CustomEvent(eventType, {
            detail: { testCase: testCaseData, timestamp: Date.now() }
        });
        window.dispatchEvent(event);

        const changeEvent = new CustomEvent(TESTCASE_EVENTS.CHANGED, {
            detail: { type: eventType, testCase: testCaseData, timestamp: Date.now() }
        });
        window.dispatchEvent(changeEvent);
    }
};

const TestCaseSidebar = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const [activeTab, setActiveTab] = useState('text-prompt');
    const [formData, setFormData] = useState({
        moduleName: '',
        testCaseType: '',
        testCaseDescription: '',
        actualResult: '',
        expectedResult: '',
        priority: '',
        status: '',
        image: null
    });
    const [prompt, setPrompt] = useState('');
    const [openDropdowns, setOpenDropdowns] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showGoogleSheetModal, setShowGoogleSheetModal] = useState(false);
    const [showGithubModal, setShowGithubModal] = useState(false);
    const [googleSheetUrl, setGoogleSheetUrl] = useState('');
    const [githubRepoUrl, setGithubRepoUrl] = useState('');
    const [importResults, setImportResults] = useState(null);

    const { showAlert } = useAlert();
    const { selectedProject } = useProject();

    const BASE_URL = 'http://localhost:5000/api/v1/test-case';

    const navItems = [
        { id: 'text-prompt', label: 'Text Prompt' },
        { id: 'fill-test-case', label: 'Fill Test Case' },
        { id: 'cloud-upload', label: 'Cloud Upload' }
    ];

    const dropdownOptions = {
        testCaseType: ['Functional', 'User-Interface', 'Performance', 'API', 'Database', 'Security', 'Others'],
        priority: ['Critical', 'High', 'Medium', 'Low'],
        status: ['Pass', 'Fail']
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleDropdown = (field) => {
        setOpenDropdowns(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const uploadImageToCloudinary = async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'test_case_preset');
            formData.append('cloud_name', 'dvytvjplt');

            const response = await fetch('https://api.cloudinary.com/v1_1/dvytvjplt/image/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Image upload failed');
            }

            return data.secure_url;
        } catch (error) {
            throw error;
        }
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);

            const token = localStorage.getItem("token");
            const { testTypeId } = useTestType();

            if (!token || !selectedProject?._id || !testTypeId) {
                showAlert({
                    type: "error",
                    message: "Missing required information. Please select a project and test type."
                });
                return;
            }

            let imageUrl = '';
            if (formData.image) {
                try {
                    imageUrl = await uploadImageToCloudinary(formData.image);
                } catch (error) {
                    showAlert({
                        type: "warning",
                        message: "Image upload failed. Submitting without image."
                    });
                    imageUrl = 'No image provided';
                }
            }

            const payload = {
                moduleName: formData.moduleName || 'General',
                testCaseType: formData.testCaseType || 'Functional',
                testCaseDescription: formData.testCaseDescription || 'No description provided',
                actualResult: formData.actualResult || 'Not executed',
                expectedResult: formData.expectedResult || 'Expected behavior not defined',
                priority: formData.priority || 'Medium',
                status: formData.status || 'Pass',
                image: imageUrl || 'No image provided'
            };

            const response = await fetch(`${BASE_URL}/projects/${selectedProject._id}/test-types/${testTypeId}/test-cases`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to create test case');
            }

            setFormData({
                moduleName: '',
                testCaseType: '',
                testCaseDescription: '',
                actualResult: '',
                expectedResult: '',
                priority: '',
                status: '',
                image: null
            });

            showAlert({
                type: "success",
                message: "Test case added successfully"
            });

            emitTestCaseEvent(TESTCASE_EVENTS.CREATED, responseData);

        } catch (error) {
            showAlert({
                type: "error",
                message: error.message || 'Failed to create test case'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePromptSubmit = async () => {
        try {
            if (!prompt.trim()) return;

            setIsSubmitting(true);

            const token = localStorage.getItem("token");
            const testTypeId = localStorage.getItem("selectedTestTypeId");

            if (!token || !selectedProject?._id || !testTypeId) {
                showAlert({
                    type: "error",
                    message: "Missing required information. Please select a project and test type."
                });
                return;
            }

            const payload = {
                rawText: prompt.trim()
            };

            const response = await fetch(`${BASE_URL}/projects/${selectedProject._id}/test-types/${testTypeId}/test-cases/ai-text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to create test case from text');
            }

            setPrompt('');

            showAlert({
                type: "success",
                message: "Test case created successfully from text"
            });

            emitTestCaseEvent(TESTCASE_EVENTS.CREATED, responseData);

        } catch (error) {
            showAlert({
                type: "error",
                message: error.message || 'Failed to create test case from text'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSheetImport = async () => {
        try {
            setIsSubmitting(true);

            const token = localStorage.getItem("token");
            const testTypeId = localStorage.getItem("selectedTestTypeId");

            if (!token || !selectedProject?._id || !testTypeId) {
                showAlert({
                    type: "error",
                    message: "Missing required information"
                });
                return;
            }

            if (!googleSheetUrl.trim()) {
                showAlert({
                    type: "error",
                    message: "Please enter a Google Sheet URL"
                });
                return;
            }

            const response = await fetch(`${BASE_URL}/projects/${selectedProject._id}/test-types/${testTypeId}/test-cases/import/google-sheets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ googleSheetUrl: googleSheetUrl.trim() })
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to import from Google Sheets');
            }

            setImportResults(responseData);

            showAlert({
                type: "success",
                message: `Successfully imported ${responseData.importedCount} test cases`
            });

            emitTestCaseEvent(TESTCASE_EVENTS.IMPORTED, responseData);

        } catch (error) {
            showAlert({
                type: "error",
                message: error.message || 'Failed to import from Google Sheets'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGithubImport = async () => {
        try {
            setIsSubmitting(true);

            const token = localStorage.getItem("token");
            const testTypeId = localStorage.getItem("selectedTestTypeId");

            if (!token || !selectedProject?._id || !testTypeId) {
                showAlert({
                    type: "error",
                    message: "Missing required information"
                });
                return;
            }

            if (!githubRepoUrl.trim()) {
                showAlert({
                    type: "error",
                    message: "Please enter a GitHub repository URL"
                });
                return;
            }

            const response = await fetch(`${BASE_URL}/projects/${selectedProject._id}/test-types/${testTypeId}/test-cases/generate/github`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ githubRepoUrl: githubRepoUrl.trim() })
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to generate from GitHub');
            }

            setImportResults(responseData);

            showAlert({
                type: "success",
                message: `Successfully generated ${responseData.statistics?.successfullyImported || 0} test cases`
            });

            emitTestCaseEvent(TESTCASE_EVENTS.IMPORTED, responseData);

        } catch (error) {
            showAlert({
                type: "error",
                message: error.message || 'Failed to generate from GitHub'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getDropdownPlaceholder = (field) => {
        const placeholders = {
            testCaseType: 'Type',
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
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="text-center text-gray-400 dark:text-gray-500 mt-20">
                    <p className="text-xs">Start a conversation...</p>
                </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Message..."
                        className="w-full p-3 pr-12 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-0.5 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none resize-none bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        rows="1"
                        style={{ minHeight: '180px', maxHeight: '480px' }}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 480) + 'px';
                        }}
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handlePromptSubmit}
                        disabled={!prompt.trim() || isSubmitting}
                        className="absolute right-3 bottom-3 p-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );

    const renderDropdown = (field, options) => (
        <div className="relative flex-1">
            <button
                onClick={() => toggleDropdown(field)}
                className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-left flex items-center justify-between hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 bg-white dark:bg-gray-900 hover:bg-sky-50 dark:hover:bg-gray-800 text-xs focus:outline-none"
            >
                <span className={formData[field] ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-500 dark:text-gray-400'}>
                    {formData[field] || getDropdownPlaceholder(field)}
                </span>
                <motion.div
                    animate={{ rotate: openDropdowns[field] ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <GoogleArrowDown size={14} className="text-gray-400 dark:text-gray-500" />
                </motion.div>
            </button>

            <AnimatePresence>
                {openDropdowns[field] && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto"
                    >
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => {
                                    handleInputChange(field, option);
                                    toggleDropdown(field);
                                }}
                                className="w-full p-2.5 text-left hover:bg-sky-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg transition-colors font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 text-xs focus:outline-none"
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
            className="p-4 space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto"
        >
            <div className="grid grid-cols-3 gap-2">
                {renderDropdown('testCaseType', dropdownOptions.testCaseType)}
                {renderDropdown('priority', dropdownOptions.priority)}
                {renderDropdown('status', dropdownOptions.status)}
            </div>

            <div>
                <input
                    type="text"
                    value={formData.moduleName}
                    onChange={(e) => handleInputChange('moduleName', e.target.value)}
                    className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-0.5 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none bg-white dark:bg-gray-900  dark:hover:bg-gray-800 transition-all duration-200 font-medium text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Module Name"
                />
            </div>

            <div>
                <textarea
                    value={formData.testCaseDescription}
                    onChange={(e) => handleInputChange('testCaseDescription', e.target.value)}
                    className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-0.5 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none h-20 resize-none bg-white dark:bg-gray-900 dark:hover:bg-gray-800 transition-all duration-200 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Test Case Description"
                />
            </div>

            <div>
                <textarea
                    value={formData.actualResult}
                    onChange={(e) => handleInputChange('actualResult', e.target.value)}
                    className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-0.5 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none h-20 resize-none bg-white dark:bg-gray-900  dark:hover:bg-gray-800 transition-all duration-200 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Actual Result"
                />
            </div>

            <div>
                <textarea
                    value={formData.expectedResult}
                    onChange={(e) => handleInputChange('expectedResult', e.target.value)}
                    className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-0.5 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none h-20 resize-none bg-white dark:bg-gray-900  dark:hover:bg-gray-800 transition-all duration-200 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Expected Result"
                />
            </div>

            <div>
                <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-gray-200 dark:border-gray-700 border-dashed rounded-lg cursor-pointer bg-white dark:bg-gray-900 hover:bg-sky-50 dark:hover:bg-gray-800 transition-all duration-200 group">
                        <div className="flex flex-col items-center justify-center">
                            <p className="mb-1 text-xs text-gray-600 dark:text-gray-400 font-medium">
                                <span className="text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG or GIF (MAX. 10MB)</p>
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
                        className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                    >
                        <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                            {formData.image.name}
                        </p>
                    </motion.div>
                )}
            </div>

            <div className="flex gap-3 pt-2">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center gap-2 focus:outline-none"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        'Submit'
                    )}
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({
                        moduleName: '',
                        testCaseType: '',
                        testCaseDescription: '',
                        actualResult: '',
                        expectedResult: '',
                        priority: '',
                        status: '',
                        image: null
                    })}
                    disabled={isSubmitting}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs focus:outline-none"
                >
                    Clear
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
            className="p-4 space-y-3"
        >
            <div className="text-center mb-4">
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-1">Import Test Cases</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Select your import method</p>
            </div>

            <div className="space-y-2">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowGoogleSheetModal(true)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:bg-sky-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-3 group bg-white dark:bg-gray-800 focus:outline-none"
                >
                    <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20 transition-colors">
                        <Link size={18} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                    <span className="text-xs text-gray-700 dark:text-gray-300 font-semibold group-hover:text-blue-700 dark:group-hover:text-blue-400">
                        Import from Google Sheet
                    </span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowGithubModal(true)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:bg-sky-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-3 group bg-white dark:bg-gray-800 focus:outline-none"
                >
                    <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20 transition-colors">
                        <Github size={18} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                    <span className="text-xs text-gray-700 dark:text-gray-300 font-semibold group-hover:text-blue-700 dark:group-hover:text-blue-400">
                        Connect with GitHub
                    </span>
                </motion.button>
            </div>
        </motion.div>
    );

    const renderImportModal = (title, url, setUrl, onSubmit, icon) => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => {
                setUrl('');
                setImportResults(null);
                title.includes('Google') ? setShowGoogleSheetModal(false) : setShowGithubModal(false);
            }}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[500px] max-h-[80vh] overflow-y-auto"
            >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {React.createElement(icon, { size: 18, className: "text-blue-600 dark:text-blue-400" })}
                        <h3 className="text-xs font-bold text-gray-800 dark:text-gray-100">{title}</h3>
                    </div>
                    <button
                        onClick={() => {
                            setUrl('');
                            setImportResults(null);
                            title.includes('Google') ? setShowGoogleSheetModal(false) : setShowGithubModal(false);
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none"
                    >
                        <X size={16} className="text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                <div className="p-4 space-y-3">
                    {!importResults ? (
                        <>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {title.includes('Google') ? 'Google Sheet URL' : 'GitHub Repository URL'}
                                </label>
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder={title.includes('Google')
                                        ? 'https://docs.google.com/spreadsheets/d/...'
                                        : 'https://github.com/owner/repo'}
                                    className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-0.5 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onSubmit}
                                disabled={!url.trim() || isSubmitting}
                                className="w-full bg-blue-600 dark:bg-blue-500 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center gap-2 focus:outline-none"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    'Import Test Cases'
                                )}
                            </motion.button>
                        </>
                    ) : (
                        <div className="space-y-3">
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <p className="text-xs font-semibold text-green-800 dark:text-green-400 mb-1">
                                    Import Successful
                                </p>
                                <p className="text-xs text-green-700 dark:text-green-500">
                                    {importResults.importedCount || importResults.statistics?.successfullyImported || 0} test cases imported
                                </p>
                            </div>

                            {importResults.testCases && importResults.testCases.length > 0 && (
                                <div className="max-h-60 overflow-y-auto space-y-2">
                                    {importResults.testCases.slice(0, 5).map((testCase, index) => (
                                        <div key={index} className="p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{testCase.moduleName}</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{testCase.testCaseDescription}</p>
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded">{testCase.priority}</span>
                                                <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded">{testCase.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {importResults.testCases.length > 5 && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                                            +{importResults.testCases.length - 5} more test cases
                                        </p>
                                    )}
                                </div>
                            )}

                            {importResults.errors && importResults.errors.length > 0 && (
                                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                    <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-400 mb-1">
                                        ⚠ Some errors occurred
                                    </p>
                                    <div className="max-h-20 overflow-y-auto space-y-1">
                                        {importResults.errors.map((error, index) => (
                                            <p key={index} className="text-xs text-yellow-700 dark:text-yellow-500">{error}</p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    setUrl('');
                                    setImportResults(null);
                                    title.includes('Google') ? setShowGoogleSheetModal(false) : setShowGithubModal(false);
                                }}
                                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-xs focus:outline-none"
                            >
                                Close
                            </motion.button>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );

    return (
        <div className="h-[calc(100vh-4rem)] fixed right-0 sidebar-scrollbar mt-16 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 w-[28rem] flex flex-col shadow-xl z-50">
            <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex">
                    {navItems.map((item) => (
                        <motion.button
                            key={item.id}
                            whileHover={{ backgroundColor: activeTab === item.id ? '' : 'rgb(240 249 255)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex-1 p-3 text-center transition-all duration-200 border-r border-gray-200 dark:border-gray-700 last:border-r-0 focus:outline-none ${activeTab === item.id
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-600 dark:border-blue-400 text-blue-700 dark:text-blue-400'
                                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                                }`}
                        >
                            <span className="font-semibold text-xs">{item.label}</span>
                        </motion.button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                    {activeTab === 'text-prompt' && renderTextPrompt()}
                    {activeTab === 'fill-test-case' && renderTestCaseForm()}
                    {activeTab === 'cloud-upload' && renderCloudUpload()}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {showGoogleSheetModal && renderImportModal(
                    'Import from Google Sheets',
                    googleSheetUrl,
                    setGoogleSheetUrl,
                    handleGoogleSheetImport,
                    Link
                )}
                {showGithubModal && renderImportModal(
                    'Import from GitHub',
                    githubRepoUrl,
                    setGithubRepoUrl,
                    handleGithubImport,
                    Github
                )}
            </AnimatePresence>
        </div>
    );
};

export default TestCaseSidebar;