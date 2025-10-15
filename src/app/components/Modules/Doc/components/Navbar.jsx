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
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useDoc } from '@/app/script/Doc.context';
import { useTestType } from '@/app/script/TestType.context';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1/doc';
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dvytvjplt/upload';
const UPLOAD_PRESET = 'test_case_preset';

const Navbar = ({ leftSidebarOpen, setLeftSidebarOpen, toolbarCollapsed, setToolbarCollapsed }) => {
  const { docId } = useDoc();
  const { testTypeId } = useTestType();
  const [projectId, setProjectId] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('draft');
  const [priority, setPriority] = useState('medium');
  const [viewCount, setViewCount] = useState(0);
  const [collaboratorCount, setCollaboratorCount] = useState(0);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Safely access localStorage on the client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setProjectId(localStorage.getItem('currentProjectId') || '');
      setToken(localStorage.getItem('token') || '');
    }
  }, []);

  // Event handlers for toolbar actions
  const handleTextFormat = async (format) => {
    if (!docId) return;
    try {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      const startIndex = range.startOffset;
      const endIndex = range.endOffset;

      const response = await axios.put(
        `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}`,
        {
          textFormat: {
            startIndex,
            endIndex,
            format,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(`${format} applied successfully`, response.data);
    } catch (error) {
      console.error(`Error applying ${format}:`, error.response?.data?.message || error.message);
    }
  };

  const handleAlignment = async (textAlign) => {
    if (!docId) return;
    try {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      const startIndex = range.startOffset;
      const endIndex = range.endOffset;

      const response = await axios.put(
        `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}`,
        {
          textFormat: {
            startIndex,
            endIndex,
            format: 'align',
            textAlign,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(`Alignment ${textAlign} applied successfully`, response.data);
    } catch (error) {
      console.error(`Error applying alignment ${textAlign}:`, error.response?.data?.message || error.message);
    }
  };

  const handleFontSize = async (fontSize) => {
    if (!docId) return;
    try {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      const startIndex = range.startOffset;
      const endIndex = range.endOffset;

      const response = await axios.put(
        `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}`,
        {
          textFormat: {
            startIndex,
            endIndex,
            format: 'fontSize',
            fontSize: parseInt(fontSize),
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(`Font size ${fontSize} applied successfully`, response.data);
    } catch (error) {
      console.error(`Error applying font size ${fontSize}:`, error.response?.data?.message || error.message);
    }
  };

  const handleClearFormatting = async () => {
    if (!docId) return;
    try {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      const startIndex = range.startOffset;
      const endIndex = range.endOffset;

      const response = await axios.delete(
        `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/formatting`,
        {
          data: { startIndex, endIndex },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('Formatting cleared successfully', response.data);
    } catch (error) {
      console.error('Error clearing formatting:', error.response?.data?.message || error.message);
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
      const response = await axios.put(
        `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}`,
        { content: document.getElementById('editor').innerText },
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
            <span className="font-medium">Project Name</span>
            <span className="text-slate-400">/</span>
            <span>Test Type Name</span>
            <span className="text-slate-400">/</span>
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
                    title="Bold"
                  >
                    <FiBold className="h-3.5 w-3.5 text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleTextFormat('italic')}
                    className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                    title="Italic"
                  >
                    <FiItalic className="h-3.5 w-3.5 text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleTextFormat('underline')}
                    className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                    title="Underline"
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

                {/* Alignment */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleAlignment('left')}
                    className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                    title="Align Left"
                  >
                    <FiAlignLeft className="h-3.5 w-3.5 text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleAlignment('center')}
                    className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                    title="Align Center"
                  >
                    <FiAlignCenter className="h-3.5 w-3.5 text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleAlignment('right')}
                    className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                    title="Align Right"
                  >
                    <FiAlignRight className="h-3.5 w-3.5 text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleAlignment('justify')}
                    className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                    title="Justify"
                  >
                    <FiAlignJustify className="h-3.5 w-3.5 text-slate-600" />
                  </button>
                </div>

                <div className="h-4 w-px bg-slate-200"></div>

                {/* Font Size */}
                <select
                  onChange={(e) => handleFontSize(e.target.value)}
                  className="px-2 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="16">16px</option>
                  <option value="14">14px</option>
                  <option value="12">12px</option>
                  <option value="18">18px</option>
                  <option value="20">20px</option>
                </select>

                <div className="h-4 w-px bg-slate-200"></div>

                {/* Color & Media */}
                <div className="flex items-center space-x-1">
                  <button className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Text Color">
                    <div className="h-3.5 w-3.5 border-2 border-slate-400 rounded"></div>
                  </button>
                  <button className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Background Color">
                    <div className="h-3.5 w-3.5 bg-yellow-200 border border-slate-300 rounded"></div>
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
                    title="Add Comment"
                  >
                    <FiMessageSquare className="h-3.5 w-3.5 text-slate-600" />
                  </button>
                </div>

                <div className="h-4 w-px bg-slate-200"></div>

                {/* Clear Formatting */}
                <button
                  onClick={handleClearFormatting}
                  className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded transition-colors"
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
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-2 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="in-progress">In Review</option>
              <option value="completed">Approved</option>
            </select>

            <select
              value={priority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="px-2 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="high">High</option>
            </select>

            <div className="flex items-center space-x-1 px-2 py-1 bg-slate-50 rounded-lg border border-slate-200">
              <FiEye className="h-3 w-3 text-slate-500" />
              <span className="text-xs text-slate-600">{viewCount}</span>
            </div>

            <div className="flex items-center space-x-1 px-2 py-1 bg-slate-50 rounded-lg border border-slate-200">
              <FiUsers className="h-3 w-3 text-slate-500" />
              <span className="text-xs text-slate-600">{collaboratorCount}</span>
            </div>

            <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 rounded-lg border border-green-200">
              <FiRefreshCw className={isAutoSaving ? 'h-3 w-3 text-green-600 animate-spin' : 'h-3 w-3 text-green-600'} />
              <span className="text-xs text-green-700">Auto-save ON</span>
            </div>

            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
            >
              <FiSave className="h-3 w-3 inline mr-1" />
              Save
            </button>

            <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
              <svg className="h-4 w-4 text-slate-600" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="3" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="8" cy="13" r="1.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;