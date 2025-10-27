"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, X, CheckCircle2, AlertCircle, Link } from 'lucide-react';
import { GoogleArrowDown } from '../utils/Icon';
import { useAlert } from '@/app/script/Alert.context';
import { useTestType } from '@/app/script/TestType.context';
import { useProject } from '@/app/script/Project.context';

export const BUG_EVENTS = {
    CREATED: 'bug:created',
    UPDATED: 'bug:updated',
    DELETED: 'bug:deleted',
    IMPORTED: 'bug:imported',
    CHANGED: 'bug:changed',
};

const emitBugEvent = (eventType, bugData = null) => {
    if (typeof window !== 'undefined') {
        const event = new CustomEvent(eventType, {
            detail: { bug: bugData, timestamp: Date.now() }
        });
        window.dispatchEvent(event);

        const changeEvent = new CustomEvent(BUG_EVENTS.CHANGED, {
            detail: { type: eventType, bug: bugData, timestamp: Date.now() }
        });
        window.dispatchEvent(changeEvent);
    }
};

const LoadingSpinner = ({ size = 'sm' }) => {
    const sizeClasses = {
        sm: 'w-3 h-3 border-[1.5px]',
        md: 'w-4 h-4 border-2',
        lg: 'w-5 h-5 border-2'
    };

    return (
        <div className={`${sizeClasses[size]} border-white border-t-transparent rounded-full animate-spin`} />
    );
};

const BugSidebar = ({ isOpen, onClose }) => {
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
    const [isListening, setIsListening] = useState(false);
    const [showGoogleSheetModal, setShowGoogleSheetModal] = useState(false);
    const [googleSheetUrl, setGoogleSheetUrl] = useState('');
    const [importStatus, setImportStatus] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const recognitionRef = useRef(null);

    const { showAlert } = useAlert();
    const { selectedProject } = useProject();
    const { testTypeId } = useTestType();

    const BASE_URL = 'https://caffetest.onrender.com/api/v1/bug';
    const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dvytvjplt/image/upload';

    const navItems = [
        { id: 'text-prompt', label: 'Text Prompt' },
        { id: 'fill-bug', label: 'Fill Bug' },
        { id: 'cloud-upload', label: 'Cloud Upload' }
    ];

    const dropdownOptions = {
        bugType: ['Functional', 'User-Interface', 'Security', 'Database', 'Performance'],
        severity: ['High', 'Low', 'Medium', 'Critical'],
        priority: ['High', 'Low', 'Medium', 'Critical'],
        status: ['New', 'Open', 'In Progress', 'In Review', 'Closed', 'Re Open']
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    }
                }

                if (finalTranscript) {
                    setPrompt(prev => prev + finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event) => {
                setIsListening(false);
                if (event.error !== 'no-speech' && event.error !== 'aborted') {
                    showAlert({
                        type: 'error',
                        message: 'Voice recognition error. Please try again.'
                    });
                }
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                }
            }
        };
    }, []);

    const toggleVoiceRecognition = () => {
        if (!recognitionRef.current) {
            showAlert({
                type: 'error',
                message: 'Voice recognition is not supported in your browser'
            });
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                setIsListening(false);
            }
        }
    };

    const uploadImageToCloudinary = async (file) => {
        try {
            setIsUploadingImage(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'test_case_preset');

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

    const createTraditionalBug = async () => {
        try {
            setIsSubmitting(true);
            const token = localStorage.getItem("token");

            if (!selectedProject?._id || !testTypeId || !token) {
                throw new Error('Missing required project or authentication data');
            }

            let imageUrl = 'No Image provided';
            if (formData.image) {
                imageUrl = await uploadImageToCloudinary(formData.image);
            }

            const response = await fetch(`${BASE_URL}/projects/${selectedProject._id}/test-types/${testTypeId}/bugs`, {
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
                    severity: formData.severity || 'Medium',
                    priority: formData.priority || 'Medium',
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

            emitBugEvent(BUG_EVENTS.CREATED, data);

            setFormData({
                bugType: '',
                moduleName: '',
                bugDesc: '',
                bugRequirement: '',
                refLink: '',
                priority: '',
                status: '',
                image: null
            });

            return data;
        } catch (error) {
            showAlert({
                type: 'error',
                message: error.message || 'Failed to create bug'
            });
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const createAIBug = async (rawText) => {
        try {
            setIsSubmitting(true);
            const token = localStorage.getItem("token");

            if (!selectedProject?._id || !testTypeId || !token) {
                throw new Error('Missing required project or authentication data');
            }

            const response = await fetch(`${BASE_URL}/projects/${selectedProject._id}/test-types/${testTypeId}/bugs/ai-text`, {
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

            emitBugEvent(BUG_EVENTS.CREATED, data);

            return data;
        } catch (error) {
            showAlert({
                type: 'error',
                message: error.message || 'Failed to create bug from text'
            });
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const importFromGoogleSheet = async () => {
        if (!googleSheetUrl.trim()) {
            showAlert({
                type: 'error',
                message: 'Please enter a Google Sheet URL'
            });
            return;
        }

        try {
            setIsImporting(true);
            setImportStatus(null);

            const token = localStorage.getItem("token");

            if (!selectedProject?._id || !testTypeId || !token) {
                throw new Error('Missing required project or authentication data');
            }

            const response = await fetch(
                `${BASE_URL}/projects/${selectedProject._id}/test-types/${testTypeId}/bugs/import/google-sheets`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ googleSheetUrl: googleSheetUrl.trim() })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to import bugs from Google Sheet');
            }

            setImportStatus({
                success: true,
                message: data.message,
                importedCount: data.importedCount,
                errorCount: data.errorCount || 0,
                errors: data.errors
            });

            showAlert({
                type: 'success',
                message: `Successfully imported ${data.importedCount} bugs`
            });

            emitBugEvent(BUG_EVENTS.IMPORTED, data);

        } catch (error) {
            setImportStatus({
                success: false,
                message: error.message || 'Failed to import bugs',
                importedCount: 0,
                errorCount: 0
            });

            showAlert({
                type: 'error',
                message: error.message || 'Failed to import bugs from Google Sheet'
            });
        } finally {
            setIsImporting(false);
        }
    };

    const handleSubmit = async () => {
        try {
            if (!formData.bugDesc) {
                showAlert({
                    type: 'error',
                    message: 'Bug description is required'
                });
                return;
            }

            await createTraditionalBug();
        } catch (error) {
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
        } catch (error) {
        }
    };

    const closeGoogleSheetModal = () => {
        setShowGoogleSheetModal(false);
        setGoogleSheetUrl('');
        setImportStatus(null);
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
                        className="w-full p-3 pr-20 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-0.5 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none resize-none bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        rows="1"
                        style={{ minHeight: '180px', maxHeight: '480px' }}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 480) + 'px';
                        }}
                        disabled={isSubmitting}
                    />
                    <div className="absolute right-3 bottom-3 flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleVoiceRecognition}
                            disabled={isSubmitting}
                            className={`p-2 rounded-lg transition-colors ${isListening
                                ? 'bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handlePromptSubmit}
                            disabled={!prompt.trim() || isSubmitting}
                            className="p-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {isSubmitting ? <LoadingSpinner size="sm" /> : <Send size={16} />}
                        </motion.button>
                    </div>
                </div>
                {isListening && (
                    <div className="text-center text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
                        🎤 Listening...
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
                className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-left flex items-center justify-between hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 bg-white dark:bg-gray-900 hover:bg-sky-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-xs focus:outline-none"
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
            className="p-4 space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto"
        >
            <div className="grid grid-cols-4 gap-2">
    {renderDropdown('bugType', dropdownOptions.bugType)}
    {renderDropdown('severity', dropdownOptions.severity)}
    {renderDropdown('priority', dropdownOptions.priority)}
    {renderDropdown('status', dropdownOptions.status)}
</div>

            <div>
                <input
                    type="text"
                    value={formData.moduleName}
                    onChange={(e) => handleInputChange('moduleName', e.target.value)}
                    className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-0.5 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none bg-white dark:bg-gray-900 dark:hover:bg-gray-800 transition-all duration-200 font-medium text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Module Name"
                    disabled={isSubmitting}
                />
            </div>

            <div>
                <textarea
                    value={formData.bugDesc}
                    onChange={(e) => handleInputChange('bugDesc', e.target.value)}
                    className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-0.5 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none h-20 resize-none bg-white dark:bg-gray-900  dark:hover:bg-gray-800 transition-all duration-200 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Bug Description"
                    disabled={isSubmitting}
                />
            </div>

            <div>
                <textarea
                    value={formData.bugRequirement}
                    onChange={(e) => handleInputChange('bugRequirement', e.target.value)}
                    className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-0.5 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none h-20 resize-none bg-white dark:bg-gray-900  dark:hover:bg-gray-800 transition-all duration-200 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Bug Requirement"
                    disabled={isSubmitting}
                />
            </div>

            <div>
                <input
                    type="text"
                    value={formData.refLink}
                    onChange={(e) => handleInputChange('refLink', e.target.value)}
                    className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-0.5 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none bg-white dark:bg-gray-900  dark:hover:bg-gray-800 transition-all duration-200 font-medium text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Reference Link"
                    disabled={isSubmitting}
                />
            </div>

            <div>
                <div className="flex items-center justify-center w-full">
                    <label className={`flex flex-col items-center justify-center w-full h-16 border-2 border-gray-200 dark:border-gray-700 border-dashed rounded-lg cursor-pointer bg-white dark:bg-gray-900 hover:bg-sky-50 dark:hover:bg-gray-800 transition-all duration-200 group ${isSubmitting || isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
                            onChange={(e) => handleInputChange('image', e.target.files?.[0] || null)}
                            disabled={isSubmitting || isUploadingImage}
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
                    disabled={isSubmitting || isUploadingImage}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center gap-2 focus:outline-none"
                >
                    {isSubmitting ? (
                        <>
                            <LoadingSpinner size="sm" />
                            Submitting...
                        </>
                    ) : (
                        'Submit'
                    )}
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancel}
                    disabled={isSubmitting || isUploadingImage}
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
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-1">Import Bugs</h3>
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
            </div>
        </motion.div>
    );

    const renderGoogleSheetModal = () => (
        <AnimatePresence>
            {showGoogleSheetModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={closeGoogleSheetModal}
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
                                <Link size={18} className="text-blue-600 dark:text-blue-400" />
                                <h3 className="text-xs font-bold text-gray-800 dark:text-gray-100">Import from Google Sheets</h3>
                            </div>
                            <button
                                onClick={closeGoogleSheetModal}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none"
                            >
                                <X size={16} className="text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>

                        <div className="p-4 space-y-3">
                            {!importStatus ? (
                                <>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Google Sheet URL
                                        </label>
                                        <input
                                            type="text"
                                            value={googleSheetUrl}
                                            onChange={(e) => setGoogleSheetUrl(e.target.value)}
                                            placeholder="https://docs.google.com/spreadsheets/d/..."
                                            className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-0.5 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                            disabled={isImporting}
                                        />
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={importFromGoogleSheet}
                                        disabled={isImporting || !googleSheetUrl.trim()}
                                        className="w-full bg-blue-600 dark:bg-blue-500 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center gap-2 focus:outline-none"
                                    >
                                        {isImporting ? (
                                            <>
                                                <LoadingSpinner size="sm" />
                                                Importing...
                                            </>
                                        ) : (
                                            'Import Bugs'
                                        )}
                                    </motion.button>
                                </>
                            ) : (
                                <div className="space-y-3">
                                    <div className={`p-3 rounded-lg border ${importStatus.success
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                        }`}>
                                        <div className="flex items-start gap-2">
                                            {importStatus.success ? (
                                                <CheckCircle2 size={16} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                            ) : (
                                                <AlertCircle size={16} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                            )}
                                            <div className="flex-1">
                                                <p className={`text-xs font-semibold mb-1 ${importStatus.success
                                                    ? 'text-green-800 dark:text-green-400'
                                                    : 'text-red-800 dark:text-red-400'
                                                    }`}>
                                                    {importStatus.success ? 'Import Successful' : 'Import Failed'}
                                                </p>
                                                <p className={`text-xs ${importStatus.success
                                                    ? 'text-green-700 dark:text-green-500'
                                                    : 'text-red-700 dark:text-red-500'
                                                    }`}>
                                                    {importStatus.message}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {importStatus.success && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Imported</p>
                                                <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                                                    {importStatus.importedCount}
                                                </p>
                                            </div>
                                            {importStatus.errorCount > 0 && (
                                                <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Errors</p>
                                                    <p className="text-lg font-bold text-orange-700 dark:text-orange-400">
                                                        {importStatus.errorCount}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {importStatus.errors && importStatus.errors.length > 0 && (
                                        <div className="max-h-32 overflow-y-auto">
                                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Errors:</p>
                                            <div className="space-y-1">
                                                {importStatus.errors.map((error, index) => (
                                                    <div key={index} className="p-1.5 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600 dark:text-red-400">
                                                        {error}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                setImportStatus(null);
                                                setGoogleSheetUrl('');
                                            }}
                                            className="flex-1 bg-blue-600 dark:bg-blue-500 text-white px-3 py-2 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 text-xs focus:outline-none"
                                        >
                                            Import Another
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={closeGoogleSheetModal}
                                            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 text-xs focus:outline-none"
                                        >
                                            Close
                                        </motion.button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    if (!isOpen) return null;

    return (
        <>
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
                        {activeTab === 'fill-bug' && renderBugForm()}
                        {activeTab === 'cloud-upload' && renderCloudUpload()}
                    </AnimatePresence>
                </div>
            </div>

            {renderGoogleSheetModal()}
        </>
    );
};

export default BugSidebar;