import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    FileText,
    Cloud,
    Send,
    ChevronDown,
    Github,
    FileSpreadsheet,
    Upload,
    Link,
    File
} from 'lucide-react';

const AddTestCaseSidebar = () => {
    const [activeTab, setActiveTab] = useState('text-prompt');
    const [formData, setFormData] = useState({
        serialNumber: '',
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

    const navItems = [
        { id: 'text-prompt', label: 'Text Prompt', icon: MessageSquare },
        { id: 'fill-test-case', label: 'Fill Test Case', icon: FileText },
        { id: 'cloud-upload', label: 'Cloud Upload', icon: Cloud }
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

    const handleSubmit = () => {
        console.log('Form submitted:', formData);
        // Handle form submission logic here
    };

    const handleCancel = () => {
        setFormData({
            serialNumber: '',
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
    };

    const handlePromptSubmit = () => {
        console.log('Prompt submitted:', prompt);
        // Handle prompt submission logic here
    };

    const renderTextPrompt = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6 space-y-4"
        >
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Enter your prompt</label>
                <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Type your message here..."
                        className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                </div>
            </div>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePromptSubmit}
                className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
                <Send size={16} />
                Send
            </motion.button>
        </motion.div>
    );

    const renderDropdown = (field, options) => (
        <div className="relative">
            <button
                onClick={() => toggleDropdown(field)}
                className="w-full p-3 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 transition-colors"
            >
                <span className={formData[field] ? 'text-gray-900' : 'text-gray-500'}>
                    {formData[field] || `Select ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                </span>
                <motion.div
                    animate={{ rotate: openDropdowns[field] ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={16} />
                </motion.div>
            </button>

            <AnimatePresence>
                {openDropdowns[field] && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto"
                    >
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => {
                                    handleInputChange(field, option);
                                    toggleDropdown(field);
                                }}
                                className="w-full p-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
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
            className="p-6 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto"
        >
            <div className="grid gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
                    <input
                        type="text"
                        value={formData.serialNumber}
                        onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter serial number"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Module Name</label>
                    <input
                        type="text"
                        value={formData.moduleName}
                        onChange={(e) => handleInputChange('moduleName', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter module name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Test Case Type</label>
                    {renderDropdown('testCaseType', dropdownOptions.testCaseType)}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Test Case Description</label>
                    <textarea
                        value={formData.testCaseDescription}
                        onChange={(e) => handleInputChange('testCaseDescription', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                        placeholder="Enter test case description"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Actual Result</label>
                    <textarea
                        value={formData.actualResult}
                        onChange={(e) => handleInputChange('actualResult', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                        placeholder="Enter actual result"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Result</label>
                    <textarea
                        value={formData.expectedResult}
                        onChange={(e) => handleInputChange('expectedResult', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                        placeholder="Enter expected result"
                    />
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                        {renderDropdown('severity', dropdownOptions.severity)}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                        {renderDropdown('priority', dropdownOptions.priority)}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        {renderDropdown('status', dropdownOptions.status)}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 800x400px)</p>
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
                        <p className="text-sm text-green-600 mt-2">
                            ✓ {formData.image.name}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Submit
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancel}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
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
            <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Choose Upload Method</h3>
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
                        className="w-full p-4 border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex items-center gap-3 group"
                    >
                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                            <option.icon size={20} className="text-gray-600 group-hover:text-blue-600" />
                        </div>
                        <span className="text-gray-700 font-medium group-hover:text-blue-700">
                            {option.label}
                        </span>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );

    return (
        <div className="h-[calc(100vh-4rem)] mt-16 bg-gradient-to-b from-slate-50 to-white border-r border-gray-200 w-[28rem] flex flex-col">
            {/* Navigation Header */}
            <div className="border-b border-gray-200">
                <div className="flex">
                    {navItems.map((item, index) => (
                        <motion.button
                            key={item.id}
                            whileHover={{ backgroundColor: '#f8fafc' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex-1 p-4 text-center flex flex-col items-center gap-2 transition-all duration-200 border-r border-gray-200 last:border-r-0 ${activeTab === item.id
                                    ? 'bg-blue-50 border-b-2 border-blue-600 text-blue-700'
                                    : 'text-gray-700 hover:text-gray-900'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium text-sm">{item.label}</span>
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

export default AddTestCaseSidebar;