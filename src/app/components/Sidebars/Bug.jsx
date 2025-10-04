import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Mic,
    MicOff,
    Upload,
    Link,
    File,
    FileSpreadsheet
} from 'lucide-react';
import { GoogleArrowDown } from '../utils/Icon';
import { useAlert } from '@/app/script/Alert.context';
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
    const recognitionRef = useRef(null);

    const { showAlert } = useAlert();

    const BASE_URL = 'http://localhost:5000/api/v1/bug';
    const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dvytvjplt/image/upload';

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

    // Initialize speech recognition
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
                console.error('Speech recognition error:', event.error);
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
                    // Ignore errors on cleanup
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
                console.error('Failed to start recognition:', e);
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

    const createTraditionalBug = async () => {
        try {
            setIsSubmitting(true);
            const projectId = typeof window !== 'undefined' ? localStorage.getItem("currentProjectId") : null;
            const testTypeId = typeof window !== 'undefined' ? localStorage.getItem("selectedTestTypeId") : null;
            const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

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

    const createAIBug = async (rawText) => {
        try {
            setIsSubmitting(true);
            const projectId = typeof window !== 'undefined' ? localStorage.getItem("currentProjectId") : null;
            const testTypeId = typeof window !== 'undefined' ? localStorage.getItem("selectedTestTypeId") : null;
            const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

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
            if (!formData.bugDesc && !formData.testCaseDescription) {
                showAlert({
                    type: 'error',
                    message: 'Bug description is required'
                });
                return;
            }

            await createTraditionalBug();

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
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="text-center text-gray-500 mt-20">
                    <p className="text-sm">Start a conversation...</p>
                </div>
            </div>

            <div className="p-6 border-t bg-white">
                <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Message..."
                        className="w-full p-3 pr-20 border border-gray-200 rounded-2xl resize-none bg-gray-50 hover:bg-gray-100 transition-colors text-sm"
                        rows={1}
                        style={{ minHeight: '48px', maxHeight: '120px' }}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                        }}
                        disabled={isSubmitting}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleVoiceRecognition}
                            disabled={isSubmitting}
                            className={`p-2 rounded-full transition-colors ${isListening
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title={isListening ? 'Stop recording' : 'Start voice dictation'}
                        >
                            {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handlePromptSubmit}
                            disabled={!prompt.trim() || isSubmitting}
                            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={14} />
                        </motion.button>
                    </div>
                </div>
                {isListening && (
                    <div className="text-center text-xs text-red-600 mt-2 font-medium">
                        🎤 Listening...
                    </div>
                )}
                {isSubmitting && (
                    <div className="text-center text-xs text-gray-500 mt-2">
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
                className="w-full p-2.5 border border-gray-200 rounded-xl text-left flex items-center justify-between hover:border-gray-300 transition-all duration-200 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
                <span className={formData[field] ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                    {formData[field] || getDropdownPlaceholder(field)}
                </span>
                <motion.div
                    animate={{ rotate: openDropdowns[field] ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <GoogleArrowDown size={14} className="text-gray-400" />
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
                                className="w-full p-2.5 text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors font-medium text-gray-700 hover:text-gray-900 text-sm"
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
            className="p-6 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto"
        >
            <div className="grid grid-cols-2 gap-3">
                {renderDropdown('bugType', dropdownOptions.bugType)}
                {renderDropdown('severity', dropdownOptions.severity)}
            </div>

            <div className="grid grid-cols-2 gap-3">
                {renderDropdown('priority', dropdownOptions.priority)}
                {renderDropdown('status', dropdownOptions.status)}
            </div>

            <div>
                <input
                    type="text"
                    value={formData.moduleName}
                    onChange={(e) => handleInputChange('moduleName', e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 font-medium text-sm"
                    placeholder="Module Name"
                    disabled={isSubmitting}
                />
            </div>

            <div>
                <textarea
                    value={formData.bugDesc}
                    onChange={(e) => handleInputChange('bugDesc', e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl h-24 resize-none bg-gray-50 hover:bg-gray-100 transition-all duration-200 text-sm"
                    placeholder="Bug Description"
                    disabled={isSubmitting}
                />
            </div>

            <div>
                <textarea
                    value={formData.bugRequirement}
                    onChange={(e) => handleInputChange('bugRequirement', e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl h-24 resize-none bg-gray-50 hover:bg-gray-100 transition-all duration-200 text-sm"
                    placeholder="Bug Requirement"
                    disabled={isSubmitting}
                />
            </div>

            <div>
                <input
                    type="text"
                    value={formData.refLink}
                    onChange={(e) => handleInputChange('refLink', e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 font-medium text-sm"
                    placeholder="Reference Link"
                    disabled={isSubmitting}
                />
            </div>

            <div>
                <div className="flex items-center justify-center w-full">
                    <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200 group ${isSubmitting || isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <div className="flex flex-col items-center justify-center pt-4 pb-5">
                            <div className="p-2.5 bg-white rounded-full mb-3 group-hover:bg-blue-50 transition-colors">
                                <Upload className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                            </div>
                            <p className="mb-1.5 text-xs text-gray-600 font-medium">
                                <span className="text-blue-600">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 10MB)</p>
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
                        className="mt-2.5 p-2.5 bg-green-50 border border-green-200 rounded-xl"
                    >
                        <p className="text-xs text-green-700 font-medium">
                            ✓ {formData.image.name}
                        </p>
                    </motion.div>
                )}
                {isUploadingImage && (
                    <div className="text-center text-xs text-gray-500 mt-2">
                        Uploading image to Cloudinary...
                    </div>
                )}
            </div>

            <div className="flex gap-3 pt-3">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={isSubmitting || isUploadingImage}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancel}
                    disabled={isSubmitting || isUploadingImage}
                    className="flex-1 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
            className="p-6 space-y-3"
        >
            <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-1.5">Choose Upload Method</h3>
                <p className="text-xs text-gray-600">Select how you want to upload your test cases</p>
            </div>

            <div className="space-y-2.5">
                {uploadOptions.map((option, index) => {
                    const IconComponent = option.icon;
                    return (
                        <motion.button
                            key={option.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full p-3.5 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 flex items-center gap-3.5 group bg-gray-50 hover:shadow-md"
                        >
                            <div className="p-2.5 bg-white rounded-lg group-hover:bg-blue-100 transition-colors shadow-sm">
                                <IconComponent size={20} className="text-gray-600 group-hover:text-blue-600" />
                            </div>
                            <span className="text-gray-700 font-semibold group-hover:text-blue-700 text-sm">
                                {option.label}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );

    if (!isOpen) return null;

    return (
        <div className="h-[calc(100vh-4rem)] fixed right-0 sidebar-scrollbar mt-16 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 w-[28rem] flex flex-col shadow-xl z-50">
            <div className="border-b border-gray-200 bg-white">
                <div className="flex">
                    {navItems.map((item) => (
                        <motion.button
                            key={item.id}
                            whileHover={{ backgroundColor: '#f8fafc' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex-1 p-3.5 text-center transition-all duration-200 border-r border-gray-200 last:border-r-0 ${activeTab === item.id
                                ? 'bg-blue-50 border-b-2 border-blue-600 text-blue-700'
                                : 'text-gray-700 hover:text-gray-900'
                                }`}
                        >
                            <span className="font-semibold text-xs">{item.label}</span>
                        </motion.button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                    {activeTab === 'text-prompt' && <div key="text-prompt">{renderTextPrompt()}</div>}
                    {activeTab === 'fill-bug' && <div key="fill-bug">{renderBugForm()}</div>}
                    {activeTab === 'cloud-upload' && <div key="cloud-upload">{renderCloudUpload()}</div>}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default BugSidebar;