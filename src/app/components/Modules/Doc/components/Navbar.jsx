'use client';

import { useState, useEffect } from 'react';
import {
    FiMenu,
    FiRefreshCw,
    FiBold,
    FiItalic,
    FiUnderline,
    FiMinus,
    FiAlignLeft,
    FiAlignCenter,
    FiAlignRight,
    FiAlignJustify,
    FiImage,
    FiPaperclip,
    FiMessageSquare,
    FiChevronLeft,
    FiChevronRight,
    FiFile,
    FiSave,
    FiEye,
    FiUsers,
    FiList,
    FiLink,
    FiType,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useDoc } from '@/app/script/Doc.context';
import { useTestType } from '@/app/script/TestType.context';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { useProject } from '@/app/utils/Get.project';
import { GoogleArrowRight } from '@/app/components/utils/Icon';
import { Code, Table } from 'lucide-react';
import DocListSidebar from './RightSidebar';

const API_BASE_URL = 'http://localhost:5000/api/v1/doc';
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dvytvjplt/upload';
const UPLOAD_PRESET = 'test_case_preset';

const Navbar = ({leftSidebarOpen, setLeftSidebarOpen, toolbarCollapsed, setToolbarCollapsed }) => {
    const { docId } = useDoc();
    const { testTypeId, testTypeName } = useTestType();
    const [projectId, setProjectId] = useState('');
    const [RightSidebarOpen, setRightSidebarOpen] = useState(false);
    const [token, setToken] = useState('');
    const [status, setStatus] = useState('draft');
    const [priority, setPriority] = useState('medium');
    const [viewCount, setViewCount] = useState(0);
    const [collaboratorCount, setCollaboratorCount] = useState(0);
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showBgColorPicker, setShowBgColorPicker] = useState(false);
    const [textColor, setTextColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#ffff00');
    const [fontSizeOpen, setFontSizeOpen] = useState(false);
    const [fontSize, setFontSize] = useState(12);
    const [statusOpen, setStatusOpen] = useState(false);
    const [priorityOpen, setPriorityOpen] = useState(false);

    const { slug } = useParams();
    const { project } = useProject(slug);

    // Safely access localStorage on the client side
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setProjectId(localStorage.getItem('currentProjectId') || '');
            setToken(localStorage.getItem('token') || '');
        }
    }, []);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.relative')) {
                setStatusOpen(false);
                setPriorityOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (fontSizeOpen && !e.target.closest('.relative')) {
                setFontSizeOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [fontSizeOpen]);

    // Text formatting functions using window.editorAPI
    const handleTextFormat = (format) => {
        if (window.editorAPI) {
            window.editorAPI.applyTextFormat(format);
        }
    };

    const handleAlignment = (align) => {
        if (window.editorAPI) {
            window.editorAPI.applyAlignment(align);
        }
    };

    const handleFontSize = (size) => {
        if (window.editorAPI) {
            window.editorAPI.applyFontSize(parseInt(size));
        }
    };

    const handleTextColor = (color) => {
        setTextColor(color);
        if (window.editorAPI) {
            window.editorAPI.applyTextColor(color);
        }
        setShowColorPicker(false);
    };

    const handleBgColor = (color) => {
        setBgColor(color);
        if (window.editorAPI) {
            window.editorAPI.applyBackgroundColor(color);
        }
        setShowBgColorPicker(false);
    };

    const handleClearFormatting = () => {
        if (window.editorAPI) {
            window.editorAPI.clearFormatting();
        }
    };

    const handleBulletList = () => {
        if (window.editorAPI) {
            window.editorAPI.insertBulletList();
        }
    };

    const handleNumberedList = () => {
        if (window.editorAPI) {
            window.editorAPI.insertNumberedList();
        }
    };

    const handleInsertLink = () => {
        const url = prompt('Enter URL:');
        if (url && window.editorAPI) {
            window.editorAPI.insertLink(url);
        }
    };

    const handleImageUpload = async (event) => {
        if (!docId) return;
        const file = event.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', UPLOAD_PRESET);

            const response = await axios.post(CLOUDINARY_URL, formData);
            const { secure_url, public_id } = response.data;

            const docResponse = await axios.post(
                `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/images`,
                {
                    url: secure_url,
                    publicId: public_id,
                    caption: file.name,
                    altText: file.name,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('Image uploaded successfully', docResponse.data);

            // Insert image into editor
            const img = `<img src="${secure_url}" alt="${file.name}" style="max-width: 100%; height: auto; display: block; margin: 10px 0;" />`;
            document.execCommand('insertHTML', false, img);
        } catch (error) {
            console.error('Error uploading image:', error.response?.data?.message || error.message);
        }
    };

    const handleFileUpload = async (event) => {
        if (!docId) return;
        const file = event.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', UPLOAD_PRESET);

            const response = await axios.post(CLOUDINARY_URL, formData);
            const { secure_url, public_id } = response.data;

            const docResponse = await axios.post(
                `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/attachments`,
                {
                    name: file.name,
                    url: secure_url,
                    publicId: public_id,
                    fileType: file.type,
                    size: file.size,
                    description: file.name,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('File uploaded successfully', docResponse.data);
        } catch (error) {
            console.error('Error uploading file:', error.response?.data?.message || error.message);
        }
    };

    const handleAddComment = async () => {
        if (!docId) return;
        try {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            const startIndex = range.startOffset;
            const endIndex = range.endOffset;
            const text = prompt('Enter your comment:');
            if (!text) return;

            const response = await axios.post(
                `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/comments`,
                {
                    text,
                    startIndex,
                    endIndex,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('Comment added successfully', response.data);
        } catch (error) {
            console.error('Error adding comment:', error.response?.data?.message || error.message);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (!docId) return;
        try {
            const response = await axios.put(
                `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatus(newStatus);
            console.log('Status updated successfully', response.data);
        } catch (error) {
            console.error('Error updating status:', error.response?.data?.message || error.message);
        }
    };

    const handlePriorityChange = async (newPriority) => {
        if (!docId) return;
        try {
            const response = await axios.put(
                `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}`,
                { priority: newPriority },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPriority(newPriority);
            console.log('Priority updated successfully', response.data);
        } catch (error) {
            console.error('Error updating priority:', error.response?.data?.message || error.message);
        }
    };

    const handleSave = async () => {
        if (!docId) return;
        try {
            const content = window.editorAPI ? window.editorAPI.getContent() : '';
            const response = await axios.put(
                `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}`,
                { content },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('Document saved successfully', response.data);
        } catch (error) {
            console.error('Error saving document:', error.response?.data?.message || error.message);
        }
    };

    // Fetch document stats to update view and collaborator counts
    useEffect(() => {
        if (!docId) return;
        const fetchStats = async () => {
            try {
                const response = await axios.get(
                    `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/stats`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setViewCount(response.data.stats.viewCount);
                setCollaboratorCount(response.data.stats.totalCollaborators);
            } catch (error) {
                console.error('Error fetching stats:', error.response?.data?.message || error.message);
            }
        };
        fetchStats();
    }, [docId, projectId, testTypeId, token]);

    return (
        <nav className="bg-white border-b border-slate-200 flex-shrink-0">
            <div className="px-3 py-2">
                <div className="flex items-center space-x-2">
                    {/* Menu Icon */}
                    <button
                        onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <FiMenu className="h-4 w-4 text-slate-600" />
                    </button>

                    {/* Document Icon */}
                    <div className="p-1.5">
                        <FiFile className="h-4 w-4 text-blue-600" />
                    </div>

                    {/* Breadcrumb */}
                    <div className="flex items-center space-x-1.5 text-xs text-slate-600">
                        <span className="font-medium">{project?.projectName}</span>
                        <span className="text-slate-400">|</span>
                        <span>{testTypeName}</span>
                        <span className="text-slate-400">|</span>
                        <span>Untitled Document</span>
                    </div>

                    <div className="h-4 w-px bg-slate-200 mx-2"></div>

                    {/* Toolbar */}
                    <AnimatePresence>
                        {!toolbarCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="flex items-center space-x-2"
                            >
                                {/* Text Formatting */}
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => handleTextFormat('bold')}
                                        className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                                        title="Bold (Ctrl+B)"
                                    >
                                        <FiBold className="h-3.5 w-3.5 text-slate-600" />
                                    </button>
                                    <button
                                        onClick={() => handleTextFormat('italic')}
                                        className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                                        title="Italic (Ctrl+I)"
                                    >
                                        <FiItalic className="h-3.5 w-3.5 text-slate-600" />
                                    </button>
                                    <button
                                        onClick={() => handleTextFormat('underline')}
                                        className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                                        title="Underline (Ctrl+U)"
                                    >
                                        <FiUnderline className="h-3.5 w-3.5 text-slate-600" />
                                    </button>
                                    <button
                                        onClick={() => handleTextFormat('strikethrough')}
                                        className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                                        title="Strikethrough"
                                    >
                                        <FiMinus className="h-3.5 w-3.5 text-slate-600" />
                                    </button>
                                </div>

                                <div className="h-4 w-px bg-slate-200"></div>

                                {/* Font Size - GitHub Style */}
                                <div className="relative inline-block text-left">
                                    <button
                                        type="button"
                                        className="inline-flex items-center justify-between px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-0.5 focus:ring-blue-500 focus:ring-offset-0 min-w-[80px]"
                                        onClick={() => setFontSizeOpen(!fontSizeOpen)}
                                    >
                                        <span>{fontSize}px</span>
                                        <svg className="ml-2 -mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    {fontSizeOpen && (
                                        <div className="absolute right-0 mt-2 w-32 bg-white border border-slate-300 rounded-md shadow-lg z-10 max-h-64 overflow-auto">
                                            {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36].map((size) => (
                                                <button
                                                    key={size}
                                                    className="block w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 first:rounded-t-md last:rounded-b-md"
                                                    onClick={() => {
                                                        handleFontSize(size);
                                                        setFontSizeOpen(false);
                                                    }}
                                                >
                                                    {size}px
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="h-4 w-px bg-slate-200"></div>

                                {/* Alignment */}
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => handleAlignment('left')}
                                        className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                                        title="Align Left (Ctrl+Shift+L)"
                                    >
                                        <FiAlignLeft className="h-3.5 w-3.5 text-slate-600" />
                                    </button>
                                    <button
                                        onClick={() => handleAlignment('center')}
                                        className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                                        title="Align Center (Ctrl+Shift+E)"
                                    >
                                        <FiAlignCenter className="h-3.5 w-3.5 text-slate-600" />
                                    </button>
                                    <button
                                        onClick={() => handleAlignment('right')}
                                        className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                                        title="Align Right (Ctrl+Shift+R)"
                                    >
                                        <FiAlignRight className="h-3.5 w-3.5 text-slate-600" />
                                    </button>
                                    <button
                                        onClick={() => handleAlignment('justify')}
                                        className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                                        title="Justify (Ctrl+Shift+J)"
                                    >
                                        <FiAlignJustify className="h-3.5 w-3.5 text-slate-600" />
                                    </button>
                                </div>

                                <div className="h-4 w-px bg-slate-200"></div>

                                {/* Lists */}
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={handleBulletList}
                                        className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                                        title="Bullet List (Ctrl+Shift+8)"
                                    >
                                        <FiList className="h-3.5 w-3.5 text-slate-600" />
                                    </button>
                                    <button
                                        onClick={handleNumberedList}
                                        className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                                        title="Numbered List (Ctrl+Shift+7)"
                                    >
                                        <FiType className="h-3.5 w-3.5 text-slate-600" />
                                    </button>
                                </div>

                                <div className="h-4 w-px bg-slate-200"></div>

                                {/* Color & Media */}
                                <div className="flex items-center space-x-1">
                                    {/* Text Color Picker */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowColorPicker(!showColorPicker)}
                                            className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                                            title="Text Color"
                                        >
                                            <div className="h-3.5 w-3.5 border-2 border-slate-400 rounded" style={{ backgroundColor: textColor }}></div>
                                        </button>
                                        {showColorPicker && (
                                            <div className="absolute top-full mt-1 z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-2">
                                                <input
                                                    type="color"
                                                    value={textColor}
                                                    onChange={(e) => handleTextColor(e.target.value)}
                                                    className="w-32 h-8 cursor-pointer"
                                                />
                                                <div className="grid grid-cols-5 gap-1 mt-2">
                                                    {['#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
                                                        '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff'].map(color => (
                                                            <button
                                                                key={color}
                                                                onClick={() => handleTextColor(color)}
                                                                className="w-6 h-6 rounded border border-slate-300 hover:scale-110 transition-transform"
                                                                style={{ backgroundColor: color }}
                                                            />
                                                        ))}
                                                </div>
                                                <button
                                                    onClick={() => setShowColorPicker(false)}
                                                    className="mt-2 w-full text-xs text-slate-600 hover:text-slate-900"
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Background Color Picker */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                                            className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                                            title="Highlight Color"
                                        >
                                            <div className="h-3.5 w-3.5 rounded border border-slate-300" style={{ backgroundColor: bgColor }}></div>
                                        </button>
                                        {showBgColorPicker && (
                                            <div className="absolute top-full mt-1 z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-2">
                                                <input
                                                    type="color"
                                                    value={bgColor}
                                                    onChange={(e) => handleBgColor(e.target.value)}
                                                    className="w-32 h-8 cursor-pointer"
                                                />
                                                <div className="grid grid-cols-5 gap-1 mt-2">
                                                    {['#ffffff', '#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#ff0000', '#0000ff', '#00ff99', '#ff9900', '#99ccff',
                                                        '#ffccff', '#ffcc99', '#ccffcc', '#ccffff', '#ffcccc', '#ccccff', '#ffffcc', '#ccff99', '#ffccee', '#eeccff'].map(color => (
                                                            <button
                                                                key={color}
                                                                onClick={() => handleBgColor(color)}
                                                                className="w-6 h-6 rounded border border-slate-300 hover:scale-110 transition-transform"
                                                                style={{ backgroundColor: color }}
                                                            />
                                                        ))}
                                                </div>
                                                <button
                                                    onClick={() => setShowBgColorPicker(false)}
                                                    className="mt-2 w-full text-xs text-slate-600 hover:text-slate-900"
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleInsertLink}
                                        className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                                        title="Insert Link (Ctrl+K)"
                                    >
                                        <FiLink className="h-3.5 w-3.5 text-slate-600" />
                                    </button>

                                    <label className="p-1.5 hover:bg-slate-100 rounded transition-colors cursor-pointer" title="Insert Image">
                                        <FiImage className="h-3.5 w-3.5 text-slate-600" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            onChange={handleImageUpload}
                                        />
                                    </label>
                                    <label className="p-1.5 hover:bg-slate-100 rounded transition-colors cursor-pointer" title="Attach File">
                                        <FiPaperclip className="h-3.5 w-3.5 text-slate-600" />
                                        <input
                                            type="file"
                                            accept="video/*,application/pdf"
                                            hidden
                                            onChange={handleFileUpload}
                                        />
                                    </label>
                                    <button
                                        onClick={handleAddComment}
                                        className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                                        title="Add Comment (Ctrl+Alt+M)"
                                    >
                                        <FiMessageSquare className="h-3.5 w-3.5 text-slate-600" />
                                    </button>
                                    <button
                                        className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                                    >
                                        <Table className="h-3.5 w-3.5 text-slate-600" />
                                    </button>
                                    <button
                                        className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                                    >
                                        <Code className="h-3.5 w-3.5 text-slate-600" />
                                    </button>
                                </div>

                                <div className="h-4 w-px bg-slate-200"></div>

                                {/* Clear Formatting */}
                                <button
                                    onClick={handleClearFormatting}
                                    className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded transition-colors"
                                    title="Clear Formatting (Ctrl+\"
                                >
                                    Clear
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Collapse/Expand Toolbar */}
                    <button
                        onClick={() => setToolbarCollapsed(!toolbarCollapsed)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors ml-auto"
                        title={toolbarCollapsed ? 'Expand toolbar' : 'Collapse toolbar'}
                    >
                        {toolbarCollapsed ? (
                            <FiChevronRight className="h-3.5 w-3.5 text-slate-600" />
                        ) : (
                            <FiChevronLeft className="h-3.5 w-3.5 text-slate-600" />
                        )}
                    </button>

                    {/* Status Indicators */}
                    <div className="flex items-center space-x-2 ml-2">
                        {/* Status Indicators - GitHub Style */}
                        <div className="flex items-center space-x-2 ml-2">
                            {/* Status Dropdown */}
                            <div className="relative inline-block text-left">
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-between px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-0.5 focus:ring-blue-500 focus:ring-offset-0 min-w-[100px]"
                                    onClick={() => setStatusOpen(!statusOpen)}
                                >
                                    <span>{status === 'draft' ? 'Draft' : status === 'in-progress' ? 'In Review' : 'Approved'}</span>
                                    <svg className="ml-2 -mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {statusOpen && (
                                    <div className="absolute right-0 mt-2 w-32 bg-white border border-slate-300 rounded-md shadow-lg z-10">
                                        <button
                                            className="block w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 first:rounded-t-md"
                                            onClick={() => {
                                                handleStatusChange('draft');
                                                setStatusOpen(false);
                                            }}
                                        >
                                            Draft
                                        </button>
                                        <button
                                            className="block w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                                            onClick={() => {
                                                handleStatusChange('in-progress');
                                                setStatusOpen(false);
                                            }}
                                        >
                                            In Review
                                        </button>
                                        <button
                                            className="block w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 last:rounded-b-md"
                                            onClick={() => {
                                                handleStatusChange('completed');
                                                setStatusOpen(false);
                                            }}
                                        >
                                            Approved
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Priority Dropdown */}
                            <div className="relative inline-block text-left">
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-between px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-0.5 focus:ring-blue-500 focus:ring-offset-0 min-w-[90px]"
                                    onClick={() => setPriorityOpen(!priorityOpen)}
                                >
                                    <span>{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
                                    <svg className="ml-2 -mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {priorityOpen && (
                                    <div className="absolute right-0 mt-2 w-28 bg-white border border-slate-300 rounded-md shadow-lg z-10">
                                        <button
                                            className="block w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 first:rounded-t-md"
                                            onClick={() => {
                                                handlePriorityChange('low');
                                                setPriorityOpen(false);
                                            }}
                                        >
                                            Low
                                        </button>
                                        <button
                                            className="block w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                                            onClick={() => {
                                                handlePriorityChange('medium');
                                                setPriorityOpen(false);
                                            }}
                                        >
                                            Medium
                                        </button>
                                        <button
                                            className="block w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 last:rounded-b-md"
                                            onClick={() => {
                                                handlePriorityChange('high');
                                                setPriorityOpen(false);
                                            }}
                                        >
                                            High
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-1 px-2 py-1 bg-slate-50 rounded-lg border border-slate-200">
                            <FiEye className="h-3 w-3 text-slate-500" />
                            <span className="text-xs text-slate-600">{viewCount}</span>
                        </div>

                        <div className="flex items-center space-x-1 px-2 py-1 bg-slate-50 rounded-lg border border-slate-200">
                            <FiUsers className="h-3 w-3 text-slate-500" />
                            <span className="text-xs text-slate-600">{collaboratorCount}</span>
                        </div>





                        <button
    onClick={() => setRightSidebarOpen(!RightSidebarOpen)}
    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
>
    <GoogleArrowRight />
</button>
<DocListSidebar 
    RightSidebarOpen={RightSidebarOpen}
    setRightSidebarOpen={setRightSidebarOpen}
/>
                    </div>
                </div>
            </div>
            
        </nav>
        
    );
};

export default Navbar;