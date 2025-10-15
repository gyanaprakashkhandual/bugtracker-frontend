'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, FileText, Eye, MessageSquare, Users, History, Settings,
  Download, Upload, Image, Paperclip, Code, Table, Bold, Italic,
  Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, Highlighter, Type, Palette, MoreVertical, X,
  Check, Star, Pin, Archive, Copy, Trash2, Send, Reply,
  Plus, Minus, ChevronDown, Search, Filter, Tag, Lock,
  Globe, Clock, TrendingUp, Activity, RefreshCw, ZoomIn,
  ZoomOut, Maximize2, Menu, ChevronRight, Edit3, BookOpen,
  FileCode, Monitor, Smartphone, AlertCircle, CheckCircle,
  Sparkles, Link, List, CornerDownRight
} from 'lucide-react';
const BASE_URL = 'http://localhost:5000/api/v1/doc';
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dvytvjplt/image/upload';
const CLOUDINARY_PRESET = 'test_case_preset';
const DocEditor = ({ docId = null, onSave = null }) => {
  // ========================
  // STATE MANAGEMENT
  // ========================
  // Document State
  const [document, setDocument] = useState(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [textContent, setTextContent] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('documentation');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('draft');
  const [tags, setTags] = useState([]);
  const [isPublic, setIsPublic] = useState(false);
  // UI State
  const [activeTab, setActiveTab] = useState('edit');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  // Formatting State
  const [selectedText, setSelectedText] = useState('');
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [textFormats, setTextFormats] = useState([]);
  const [currentFormat, setCurrentFormat] = useState({
    textColor: '#000000',
    backgroundColor: 'transparent',
    fontSize: 16,
    fontFamily: 'Arial',
    lineHeight: 1.5,
    textAlign: 'left',
  });
  // Comment State
  const [comments, setComments] = useState([]);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  // Suggestion State
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestionBox, setShowSuggestionBox] = useState(false);
  const [suggestionText, setSuggestionText] = useState('');
  const [suggestionDescription, setSuggestionDescription] = useState('');
  // Version State
  const [versions, setVersions] = useState([]);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [versionDescription, setVersionDescription] = useState('');
  // Collaboration State
  const [collaborators, setCollaborators] = useState([]);
  const [currentEditors, setCurrentEditors] = useState([]);
  const [showCollaboratorBox, setShowCollaboratorBox] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [collaboratorPermission, setCollaboratorPermission] = useState('view');
  // User interface state
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  // Media State
  const [images, setImages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [tables, setTables] = useState([]);
  const [codeBlocks, setCodeBlocks] = useState([]);
  // Access Logs State
  const [accessLogs, setAccessLogs] = useState([]);
  const [viewCount, setViewCount] = useState(0);
  // Cursor & Realtime State
  const [cursorPosition, setCursorPosition] = useState({ line: 0, column: 0 });
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  // Document List State
  const [showDocList, setShowDocList] = useState(false);
  const [allDocs, setAllDocs] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(docId);
  // Refs
  const editorRef = useRef(null);
  const autoSaveTimerRef = useRef(null);
  const cursorUpdateTimerRef = useRef(null);
  const imageUploadRef = useRef(null);
  const fileUploadRef = useRef(null);
  const videoUploadRef = useRef(null);
  const mediaImageUploadRef = useRef(null);
  const mediaFileUploadRef = useRef(null);
  const mediaVideoUploadRef = useRef(null);
  // ========================
  // UTILITY FUNCTIONS
  // ========================
  const getHeaders = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }, []);
  const getProjectAndTestType = useCallback(() => {
    const projectId = typeof window !== 'undefined' ? localStorage.getItem('currentProjectId') : '';
    const testTypeId = typeof window !== 'undefined' ? localStorage.getItem('selectedTestTypeId') : '';
    return { projectId, testTypeId };
  }, []);
  const calculateTextStats = useCallback((text) => {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const characters = text.length;
    setWordCount(words);
    setCharacterCount(characters);
  }, []);
  const getSelectedRange = useCallback(() => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return { start: 0, end: 0 };
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    if (editorRef.current) {
      preCaretRange.selectNodeContents(editorRef.current);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
    }
    const start = preCaretRange.toString().length - range.toString().length;
    const end = start + range.toString().length;
    return { start, end };
  }, []);
  const updateCursorStats = useCallback(() => {
    const selection = window.getSelection();
    if (editorRef.current && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const text = editorRef.current.textContent;
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editorRef.current);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      const position = preCaretRange.toString().length;
      const lines = text.substring(0, position).split('\n');
      const line = lines.length - 1;
      const column = lines[line].length;
      setCursorPosition({ line, column });
    }
  }, []);
  const showNotification = useCallback((message, type = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setError(null);
    } else {
      setError(message);
      setSuccess(null);
    }
    setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 3000);
  }, []);
  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => {
      showNotification('Copied to clipboard');
    }).catch(() => {
      showNotification('Failed to copy', 'error');
    });
  }, [showNotification]);
  const downloadFile = useCallback((content, filename, type = 'text/plain') => {
    const element = document.createElement('a');
    element.setAttribute('href', `data:${type};charset=utf-8,${encodeURIComponent(content)}`);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showNotification('File downloaded');
  }, [showNotification]);
  const applyTextFormatting = useCallback((formatType) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0 || !editorRef.current) return;
    const range = selection.getRangeAt(0);
    setSelectedText(range.toString());
    const { start, end } = getSelectedRange();
    setSelectionStart(start);
    setSelectionEnd(end);
    const span = document.createElement('span');
    switch (formatType) {
      case 'bold':
        span.style.fontWeight = 'bold';
        break;
      case 'italic':
        span.style.fontStyle = 'italic';
        break;
      case 'underline':
        span.style.textDecoration = 'underline';
        break;
      case 'strikethrough':
        span.style.textDecoration = 'line-through';
        break;
      case 'code':
        span.style.backgroundColor = '#f0f0f0';
        span.style.fontFamily = 'monospace';
        span.style.padding = '2px 4px';
        break;
      case 'highlight':
        span.style.backgroundColor = 'yellow';
        break;
    }
    span.appendChild(range.extractContents());
    range.insertNode(span);
    const newFormat = {
      startIndex: start,
      endIndex: end,
      format: formatType,
      ...currentFormat,
    };
    setTextFormats(prev => [...prev, newFormat]);
  }, [getSelectedRange, currentFormat]);
  const applyAlignment = useCallback((alignment) => {
    if (editorRef.current) {
      editorRef.current.style.textAlign = alignment;
      setCurrentFormat(prev => ({
        ...prev,
        textAlign: alignment,
      }));
    }
  }, []);
  const applyTextColor = useCallback((color) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.color = color;
    span.appendChild(range.extractContents());
    range.insertNode(span);
    setCurrentFormat(prev => ({
      ...prev,
      textColor: color,
    }));
  }, []);
  const applyBackgroundColor = useCallback((color) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.backgroundColor = color;
    span.appendChild(range.extractContents());
    range.insertNode(span);
    setCurrentFormat(prev => ({
      ...prev,
      backgroundColor: color,
    }));
  }, []);
  const applyFontSize = useCallback((size) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.fontSize = `${size}px`;
    span.appendChild(range.extractContents());
    range.insertNode(span);
    setCurrentFormat(prev => ({
      ...prev,
      fontSize: size,
    }));
  }, []);
  const removeAllFormatting = useCallback(() => {
    if (editorRef.current) {
      const text = editorRef.current.textContent;
      editorRef.current.innerHTML = text;
      setTextFormats([]);
      showNotification('All formatting removed');
    }
  }, [showNotification]);
  const clearFormatInRange = useCallback(async (id, startIdx, endIdx) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/formatting`,
        {
          method: 'DELETE',
          headers: getHeaders(),
          body: JSON.stringify({ startIndex: startIdx, endIndex: endIdx }),
        }
      );
      if (!response.ok) throw new Error('Failed to clear formatting');
      const data = await response.json();
      setTextFormats(data.textFormats);
      showNotification('Formatting cleared');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  // ========================
  // API FUNCTIONS - FIXED INTEGRATION
  // ========================
  // Fetch all documents
  const fetchAllDocs = useCallback(async () => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs`, { headers: getHeaders() });
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setAllDocs(data.docs || []);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const createNewDoc = useCallback(async (docData) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(docData),
        }
      );
      if (!response.ok) throw new Error('Failed to create document');
      const data = await response.json();
      setDocument(data.doc);
      showNotification('Document created successfully');
      return data.doc;
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const fetchDocById = useCallback(async (id) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}`,
        { headers: getHeaders() }
      );
      if (!response.ok) throw new Error('Failed to fetch document');
      const data = await response.json();
      const doc = data.doc;
      setDocument(doc);
      setTitle(doc.title || '');
      setDescription(doc.description || '');
      setHtmlContent(doc.richContent || doc.content || '');
      setTextContent(doc.content || '');
      setCategory(doc.category || 'documentation');
      setPriority(doc.priority || 'medium');
      setStatus(doc.status || 'draft');
      setTags(doc.tags || []);
      setIsPublic(doc.isPublic || false);
      setComments(doc.comments || []);
      setSuggestions(doc.suggestions || []);
      setTextFormats(doc.textFormats || []);
      setImages(doc.images || []);
      setAttachments(doc.attachments || []);
      setTables(doc.tables || []);
      setCodeBlocks(doc.codeBlocks || []);
      setCollaborators(doc.collaborators || []);
      setCurrentEditors(doc.currentEditors || []);
      setViewCount(doc.viewCount || 0);
      calculateTextStats(doc.content || '');
      showNotification('Document loaded');
      return doc;
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getProjectAndTestType, getHeaders, calculateTextStats, showNotification]);
  const updateDocInfo = useCallback(async (id, docData) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}`,
        {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(docData),
        }
      );
      if (!response.ok) throw new Error('Failed to update document');
      const data = await response.json();
      setDocument(data.doc);
      showNotification('Document updated');
      if (onSave) onSave(data.doc);
      return data.doc;
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [getProjectAndTestType, getHeaders, onSave, showNotification]);
  const searchDocuments = useCallback(async (query, filters = {}) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    const params = new URLSearchParams({ q: query, ...filters });
    setIsLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/search?${params}`,
        { headers: getHeaders() }
      );
      if (!response.ok) throw new Error('Failed to search documents');
      return await response.json();
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const getDocsByCategory = useCallback(async (cat) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/category/${cat}`,
        { headers: getHeaders() }
      );
      if (!response.ok) throw new Error('Failed to fetch documents');
      return await response.json();
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const getRecentDocuments = useCallback(async (limit = 10) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/recent?limit=${limit}`,
        { headers: getHeaders() }
      );
      if (!response.ok) throw new Error('Failed to fetch recent documents');
      return await response.json();
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const exportDocument = useCallback(async (id, format = 'txt') => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/export?format=${format}`,
        { headers: getHeaders() }
      );
      if (!response.ok) throw new Error('Failed to export document');
      const text = await response.text();
      downloadFile(text, `${title || 'document'}.${format}`);
      showNotification(`Document exported as ${format}`);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, title, downloadFile, showNotification]);
  const updateDocStatus = useCallback(async (id, statusData) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/status`,
        {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(statusData),
        }
      );
      if (!response.ok) throw new Error('Failed to update status');
      const data = await response.json();
      setDocument(data.doc);
      setStatus(data.doc.status);
      showNotification('Status updated');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const duplicateDocument = useCallback(async (id, newTitle) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/duplicate`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ title: newTitle }),
        }
      );
      if (!response.ok) throw new Error('Failed to duplicate document');
      const data = await response.json();
      showNotification('Document duplicated');
      return data.doc;
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const getDocStats = useCallback(async (id) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/stats`,
        { headers: getHeaders() }
      );
      if (!response.ok) throw new Error('Failed to fetch stats');
      return await response.json();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const togglePin = useCallback(async (id) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/pin`,
        {
          method: 'PUT',
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error('Failed to toggle pin');
      const data = await response.json();
      setDocument(prev => ({ ...prev, pinned: data.pinned }));
      showNotification(data.pinned ? 'Document pinned' : 'Document unpinned');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const toggleStar = useCallback(async (id) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/star`,
        {
          method: 'PUT',
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error('Failed to toggle star');
      const data = await response.json();
      setDocument(prev => ({ ...prev, starred: data.starred }));
      showNotification(data.starred ? 'Document starred' : 'Document unstarred');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const archiveDocument = useCallback(async (id) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/archive`,
        {
          method: 'PUT',
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error('Failed to archive document');
      setDocument(prev => ({ ...prev, status: 'archived' }));
      setStatus('archived');
      showNotification('Document archived');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const unarchiveDocument = useCallback(async (id) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/unarchive`,
        {
          method: 'PUT',
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error('Failed to unarchive document');
      setDocument(prev => ({ ...prev, status: 'draft' }));
      setStatus('draft');
      showNotification('Document unarchived');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const deleteDocument = useCallback(async (id) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}`,
        {
          method: 'DELETE',
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error('Failed to delete document');
      showNotification('Document deleted');
      return true;
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  // Comment Functions
  const addComment = useCallback(async (id, commentData) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/comments`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(commentData),
        }
      );
      if (!response.ok) throw new Error('Failed to add comment');
      const data = await response.json();
      setComments(data.comments || []);
      setCommentText('');
      setShowCommentBox(false);
      showNotification('Comment added');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const replyToComment = useCallback(async (id, commentId, replyData) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/comments/${commentId}/reply`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(replyData),
        }
      );
      if (!response.ok) throw new Error('Failed to add reply');
      const data = await response.json();
      setComments(prev => prev.map(c => c._id === commentId ? data.comment : c));
      setReplyText('');
      setReplyingTo(null);
      showNotification('Reply added');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const resolveComment = useCallback(async (id, commentId) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/comments/${commentId}/resolve`,
        {
          method: 'PUT',
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error('Failed to resolve comment');
      const data = await response.json();
      setComments(prev => prev.map(c => c._id === commentId ? data.comment : c));
      showNotification('Comment resolved');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const deleteComment = useCallback(async (id, commentId) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error('Failed to delete comment');
      setComments(prev => prev.filter(c => c._id !== commentId));
      showNotification('Comment deleted');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  // Suggestion Functions
  const addSuggestion = useCallback(async (id, suggestionData) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/suggestions`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(suggestionData),
        }
      );
      if (!response.ok) throw new Error('Failed to add suggestion');
      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setSuggestionText('');
      setSuggestionDescription('');
      setShowSuggestionBox(false);
      showNotification('Suggestion added');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const acceptSuggestion = useCallback(async (id, suggestionId) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/suggestions/${suggestionId}/accept`,
        {
          method: 'PUT',
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error('Failed to accept suggestion');
      const data = await response.json();
      setSuggestions(prev => prev.map(s => s._id === suggestionId ? data.suggestion : s));
      showNotification('Suggestion accepted');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const rejectSuggestion = useCallback(async (id, suggestionId) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/suggestions/${suggestionId}/reject`,
        {
          method: 'PUT',
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error('Failed to reject suggestion');
      const data = await response.json();
      setSuggestions(prev => prev.map(s => s._id === suggestionId ? data.suggestion : s));
      showNotification('Suggestion rejected');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  // Version Functions
  const createVersionSnapshot = useCallback(async (id, versionData) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/versions`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(versionData),
        }
      );
      if (!response.ok) throw new Error('Failed to create version');
      const data = await response.json();
      setVersions(data.versionSnapshots || []);
      setVersionName('');
      setVersionDescription('');
      setShowVersionModal(false);
      showNotification('Version created');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const fetchVersions = useCallback(async (id) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/versions`,
        { headers: getHeaders() }
      );
      if (!response.ok) throw new Error('Failed to fetch versions');
      const data = await response.json();
      setVersions(data.versions || []);
      return data.versions;
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const restoreVersion = useCallback(async (id, versionNumber) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/versions/${versionNumber}/restore`,
        {
          method: 'PUT',
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error('Failed to restore version');
      const data = await response.json();
      setDocument(data.doc);
      setHtmlContent(data.doc.richContent || data.doc.content);
      setTextContent(data.doc.content);
      showNotification(`Restored to version ${versionNumber}`);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  // Collaboration Functions
  const addCollaborator = useCallback(async (id, collaboratorData) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/collaborators`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(collaboratorData),
        }
      );
      if (!response.ok) throw new Error('Failed to add collaborator');
      const data = await response.json();
      setCollaborators(data.collaborators || []);
      setCollaboratorEmail('');
      setCollaboratorPermission('view');
      setShowCollaboratorBox(false);
      showNotification('Collaborator added');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const updateCollaboratorPermission = useCallback(async (id, collaboratorId, permissionData) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/collaborators/${collaboratorId}`,
        {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(permissionData),
        }
      );
      if (!response.ok) throw new Error('Failed to update permission');
      const data = await response.json();
      setCollaborators(data.collaborators || []);
      showNotification('Permission updated');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const removeCollaborator = useCallback(async (id, collaboratorId) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/collaborators/${collaboratorId}`,
        {
          method: 'DELETE',
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error('Failed to remove collaborator');
      const data = await response.json();
      setCollaborators(data.collaborators || []);
      showNotification('Collaborator removed');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const fetchCollaborators = useCallback(async (id) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/collaborators`,
        { headers: getHeaders() }
      );
      if (!response.ok) throw new Error('Failed to fetch collaborators');
      const data = await response.json();
      setCollaborators(data.collaborators || []);
      setCurrentEditors(data.activeEditors || []);
      return data;
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  // Real-time Collaboration Functions
  const updateCursorPosition = useCallback(async (id, cursorData) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) return;
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/cursor`,
        {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(cursorData),
        }
      );
      if (!response.ok) throw new Error('Failed to update cursor');
      const data = await response.json();
      setCurrentEditors(data.currentEditors || []);
    } catch (err) {
      console.error(err);
    }
  }, [getProjectAndTestType, getHeaders]);
  const removeCursor = useCallback(async (id) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) return;
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/cursor`,
        {
          method: 'DELETE',
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error('Failed to remove cursor');
      const data = await response.json();
      setCurrentEditors(data.currentEditors || []);
    } catch (err) {
      console.error(err);
    }
  }, [getProjectAndTestType, getHeaders]);
  // Media Operations
  const addImage = useCallback(async (id, imageData) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/images`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(imageData),
        }
      );
      if (!response.ok) throw new Error('Failed to add image');
      const data = await response.json();
      setImages(data.images || []);
      showNotification('Image added');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const updateImage = useCallback(async (id, imageId, imageData) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/images/${imageId}`,
        {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(imageData),
        }
      );
      if (!response.ok) throw new Error('Failed to update image');
      const data = await response.json();
      setImages(prev => prev.map(img => img._id === imageId ? data.image : img));
      showNotification('Image updated');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const deleteImage = useCallback(async (id, imageId) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/images/${imageId}`,
        {
          method: 'DELETE',
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error('Failed to delete image');
      setImages(prev => prev.filter(img => img._id !== imageId));
      showNotification('Image deleted');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const addAttachment = useCallback(async (id, attachmentData) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/attachments`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(attachmentData),
        }
      );
      if (!response.ok) throw new Error('Failed to add attachment');
      const data = await response.json();
      setAttachments(data.attachments || []);
      showNotification('Attachment added');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const deleteAttachment = useCallback(async (id, attachmentId) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/attachments/${attachmentId}`,
        {
          method: 'DELETE',
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error('Failed to delete attachment');
      setAttachments(prev => prev.filter(att => att._id !== attachmentId));
      showNotification('Attachment deleted');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const downloadAttachment = useCallback(async (id, attachmentId) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/attachments/${attachmentId}/download`,
        { headers: getHeaders() }
      );
      if (!response.ok) throw new Error('Failed to download attachment');
      const data = await response.json();
      window.open(data.attachment.url, '_blank');
      showNotification('Download started');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  // Code Block Operations
  const addCodeBlock = useCallback(async (id, codeBlockData) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/code-blocks`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(codeBlockData),
        }
      );
      if (!response.ok) throw new Error('Failed to add code block');
      const data = await response.json();
      setCodeBlocks(data.codeBlocks || []);
      showNotification('Code block added');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const updateCodeBlock = useCallback(async (id, codeBlockId, codeBlockData) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/code-blocks/${codeBlockId}`,
        {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(codeBlockData),
        }
      );
      if (!response.ok) throw new Error('Failed to update code block');
      const data = await response.json();
      setCodeBlocks(prev => prev.map(cb => cb._id === codeBlockId ? data.codeBlock : cb));
      showNotification('Code block updated');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const deleteCodeBlock = useCallback(async (id, codeBlockId) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/code-blocks/${codeBlockId}`,
        {
          method: 'DELETE',
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error('Failed to delete code block');
      setCodeBlocks(prev => prev.filter(cb => cb._id !== codeBlockId));
      showNotification('Code block deleted');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const copyCodeBlock = useCallback(async (id, codeBlockId) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/code-blocks/${codeBlockId}/copy`,
        {
          method: 'POST',
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error('Failed to copy code block');
      const data = await response.json();
      copyToClipboard(data.codeBlock.code);
      setCodeBlocks(prev => prev.map(cb => cb._id === codeBlockId ? { ...cb, copyCount: data.codeBlock.copyCount } : cb));
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, copyToClipboard, showNotification]);
  // Table Operations
  const addTable = useCallback(async (id, tableData) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/tables`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(tableData),
        }
      );
      if (!response.ok) throw new Error('Failed to add table');
      const data = await response.json();
      setTables(data.tables || []);
      showNotification('Table added');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const updateTable = useCallback(async (id, tableId, tableData) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/tables/${tableId}`,
        {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(tableData),
        }
      );
      if (!response.ok) throw new Error('Failed to update table');
      const data = await response.json();
      setTables(prev => prev.map(t => t._id === tableId ? data.table : t));
      showNotification('Table updated');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  const deleteTable = useCallback(async (id, tableId) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/tables/${tableId}`,
        {
          method: 'DELETE',
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error('Failed to delete table');
      setTables(prev => prev.filter(t => t._id !== tableId));
      showNotification('Table deleted');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  // Access Logs Operations
  const fetchAccessLogs = useCallback(async (id, limit = 50, skip = 0) => {
    const { projectId, testTypeId } = getProjectAndTestType();
    if (!projectId || !testTypeId) {
      showNotification('Project ID or Test Type ID missing', 'error');
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/access-logs?limit=${limit}&skip=${skip}`,
        { headers: getHeaders() }
      );
      if (!response.ok) throw new Error('Failed to fetch access logs');
      const data = await response.json();
      setAccessLogs(data.logs || []);
      return data;
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);
  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !document || !document._id) return;
    autoSaveTimerRef.current = setInterval(() => {
      updateDocInfo(document._id, {
        title,
        description,
        content: textContent,
        richContent: htmlContent,
        category,
        priority,
        status,
        tags,
        isPublic,
        textFormats
      }).catch(() => {
        // Silent fail for auto-save
      });
    }, 30000); // Auto-save every 30 seconds
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [autoSaveEnabled, document, title, description, textContent, htmlContent, category, priority, status, tags, isPublic, textFormats, updateDocInfo]);
  // Cursor position update
  useEffect(() => {
    if (!document || !document._id) return;
    cursorUpdateTimerRef.current = setInterval(() => {
      updateCursorPosition(document._id, {
        position: selectionStart,
        lineNumber: cursorPosition.line,
        columnNumber: cursorPosition.column,
      }).catch(() => {
        // Silent fail for cursor updates
      });
    }, 1000);
    return () => {
      if (cursorUpdateTimerRef.current) {
        clearInterval(cursorUpdateTimerRef.current);
      }
    };
  }, [document, selectionStart, cursorPosition, updateCursorPosition]);
  // Cloudinary Upload Functions
  const uploadToCloudinary = useCallback(async (file, resourceType = 'image') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_PRESET);
      formData.append('resource_type', resourceType);
      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to upload to Cloudinary');
      const data = await response.json();
      return {
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
        format: data.format,
        size: data.bytes,
      };
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  }, [showNotification]);
  const handleImageUpload = useCallback(async (file, caption = '', altText = '') => {
    if (!document || !document._id) {
      showNotification('Please save the document first', 'error');
      return;
    }
    try {
      showNotification('Uploading image...');
      const cloudinaryData = await uploadToCloudinary(file, 'image');
      await addImage(document._id, {
        url: cloudinaryData.url,
        publicId: cloudinaryData.publicId,
        caption,
        altText,
        width: cloudinaryData.width,
        height: cloudinaryData.height,
        format: cloudinaryData.format,
        size: cloudinaryData.size,
      });
      return cloudinaryData;
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [document, uploadToCloudinary, addImage, showNotification]);
  const handleMultipleImageUpload = useCallback(async (files, captions = []) => {
    if (!document || !document._id) {
      showNotification('Please save the document first', 'error');
      return;
    }
    try {
      const uploadPromises = Array.from(files).map((file, index) =>
        handleImageUpload(file, captions[index] || '', '')
      );
      const results = await Promise.all(uploadPromises);
      showNotification(`${results.length} images uploaded successfully`);
      return results;
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [document, handleImageUpload, showNotification]);
  const handleFileUpload = useCallback(async (file, description = '') => {
    if (!document || !document._id) {
      showNotification('Please save the document first', 'error');
      return;
    }
    try {
      showNotification('Uploading file...');
      const cloudinaryData = await uploadToCloudinary(file, 'auto');
      const mimeType = file.type || 'application/octet-stream';
      const fileType = file.name.split('.').pop() || 'unknown';
      await addAttachment(document._id, {
        name: file.name,
        url: cloudinaryData.url,
        publicId: cloudinaryData.publicId,
        fileType,
        mimeType,
        size: cloudinaryData.size,
        description,
      });
      showNotification('File uploaded successfully');
      return cloudinaryData;
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [document, uploadToCloudinary, addAttachment, showNotification]);
  const handleMultipleFileUpload = useCallback(async (files, descriptions = []) => {
    if (!document || !document._id) {
      showNotification('Please save the document first', 'error');
      return;
    }
    try {
      const uploadPromises = Array.from(files).map((file, index) =>
        handleFileUpload(file, descriptions[index] || '')
      );
      const results = await Promise.all(uploadPromises);
      showNotification(`${results.length} files uploaded successfully`);
      return results;
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [document, handleFileUpload, showNotification]);
  const handleVideoUpload = useCallback(async (file, caption = '') => {
    if (!document || !document._id) {
      showNotification('Please save the document first', 'error');
      return;
    }
    try {
      showNotification('Uploading video...');
      const cloudinaryData = await uploadToCloudinary(file, 'video');
      await addImage(document._id, {
        url: cloudinaryData.url,
        publicId: cloudinaryData.publicId,
        caption,
        altText: 'video',
        width: cloudinaryData.width,
        height: cloudinaryData.height,
        format: cloudinaryData.format,
        size: cloudinaryData.size,
      });
      showNotification('Video uploaded successfully');
      return cloudinaryData;
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [document, uploadToCloudinary, addImage, showNotification]);
  const validateFile = useCallback((file, allowedTypes = [], maxSize = 10485760) => {
    if (file.size > maxSize) {
      showNotification(`File size exceeds ${maxSize / 1024 / 1024}MB limit`, 'error');
      return false;
    }
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      showNotification(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`, 'error');
      return false;
    }
    return true;
  }, [showNotification]);
  const handleImageFromClipboard = useCallback(async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let item of items) {
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        if (blob && validateFile(blob, ['image/png', 'image/jpeg', 'image/gif'], 5242880)) {
          await handleImageUpload(blob, '', 'Pasted image');
        }
      }
    }
  }, [validateFile, handleImageUpload]);
  const deleteImageFromCloudinary = useCallback(async (publicId) => {
    try {
      // Note: This requires backend support to delete from Cloudinary
      // For now, we just delete from our database
      showNotification('Image removed from document');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [showNotification]);
  const deleteFileFromCloudinary = useCallback(async (publicId) => {
    try {
      // Note: This requires backend support to delete from Cloudinary
      // For now, we just delete from our database
      showNotification('File removed from document');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [showNotification]);
  const getCloudinaryImageUrl = useCallback((publicId, width = 400, height = 300, crop = 'fill') => {
    return `https://res.cloudinary.com/dvytvjplt/image/fetch/w_${width},h_${height},c_${crop}/https://${publicId}`;
  }, []);
  const getCloudinaryThumbnail = useCallback((publicId, size = 200) => {
    return `https://res.cloudinary.com/dvytvjplt/image/fetch/w_${size},h_${size},c_thumb,q_auto/https://${publicId}`;
  }, []);
  // ========================
  // HELPER FUNCTIONS FOR UI - FIXED INTEGRATION
  // ========================
  const handleSaveDocument = useCallback(() => {
    if (!document || !document._id) {
      // Create new document if no ID exists
      const createAndSave = async () => {
        const docData = {
          title: title || 'Untitled Document',
          description,
          content: textContent,
          richContent: htmlContent,
          category,
          priority,
          status,
          tags,
          isPublic,
        };
        try {
          const newDoc = await createNewDoc(docData);
          setDocument(newDoc);
          setSelectedDocId(newDoc._id);
        } catch (err) {
          console.error('Failed to create document:', err);
        }
      };
      createAndSave();
    } else {
      updateDocInfo(document._id, {
        title,
        description,
        content: textContent,
        richContent: htmlContent,
        category,
        priority,
        status,
        tags,
        isPublic,
        textFormats
      });
    }
  }, [document, title, description, textContent, htmlContent, category, priority, status, tags, isPublic, textFormats, updateDocInfo, createNewDoc]);
  const handleAddTag = useCallback((tag) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  }, [tags]);
  const handleRemoveTag = useCallback((tag) => {
    setTags(tags.filter(t => t !== tag));
  }, [tags]);
  const handleCommentCreate = useCallback(() => {
    if (!document || !document._id || !commentText) return;
    const { start, end } = getSelectedRange();
    addComment(document._id, {
      text: commentText,
      startIndex: start,
      endIndex: end,
    });
  }, [document, commentText, getSelectedRange, addComment]);
  const handleCommentReply = useCallback((commentId) => {
    if (!document || !document._id || !replyText) return;
    replyToComment(document._id, commentId, {
      text: replyText,
    });
  }, [document, replyText, replyToComment]);
  const handleSuggestionCreate = useCallback(() => {
    if (!document || !document._id || !suggestionText) return;
    const { start, end } = getSelectedRange();
    addSuggestion(document._id, {
      originalText: selectedText,
      suggestedText: suggestionText,
      startIndex: start,
      endIndex: end,
      description: suggestionDescription,
    });
  }, [document, suggestionText, suggestionDescription, selectedText, getSelectedRange, addSuggestion]);
  const handleCollaboratorAdd = useCallback(() => {
    if (!document || !document._id || !collaboratorEmail) return;
    addCollaborator(document._id, {
      userId: collaboratorEmail, // Assuming email is used to find userId on backend
      permission: collaboratorPermission,
    });
  }, [document, collaboratorEmail, collaboratorPermission, addCollaborator]);
  const handleVersionCreate = useCallback(() => {
    if (!document || !document._id) return;
    createVersionSnapshot(document._id, {
      versionName,
      description: versionDescription,
    });
  }, [document, versionName, versionDescription, createVersionSnapshot]);
  // Handle tab changes to load appropriate data
  useEffect(() => {
    if (!document?._id) return;
    switch (activeTab) {
      case 'versions':
        fetchVersions(document._id);
        break;
      case 'collaborators':
        fetchCollaborators(document._id);
        break;
      case 'analytics':
        getDocStats(document._id);
        fetchAccessLogs(document._id);
        break;
      default:
        break;
    }
  }, [activeTab, document?._id, fetchVersions, fetchCollaborators, getDocStats, fetchAccessLogs]);
  // Initialize document content in editor when htmlContent changes
  useEffect(() => {
    if (editorRef.current && htmlContent !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = htmlContent;
    }
  }, [htmlContent]);
  // Persist last docId for refresh
  useEffect(() => {
    if (selectedDocId) {
      localStorage.setItem('lastDocId', selectedDocId);
    }
  }, [selectedDocId]);

  // Initialize document
  useEffect(() => {
    const init = async () => {
      let idToLoad = selectedDocId || docId;
      if (!idToLoad) {
        const lastId = localStorage.getItem('lastDocId');
        if (lastId) {
          idToLoad = lastId;
          setSelectedDocId(lastId);
        }
      }
      if (idToLoad) {
        await fetchDocById(idToLoad);
      } else {
        const { projectId, testTypeId } = getProjectAndTestType();
        if (projectId && testTypeId) {
          try {
            const docData = {
              title: 'Untitled Document',
              content: '',
              description: '',
              category: 'documentation',
              priority: 'medium',
              status: 'draft',
              tags: [],
              isPublic: false
            };
            const newDoc = await createNewDoc(docData);
            setDocument(newDoc);
            setSelectedDocId(newDoc._id);
          } catch (err) {
            console.error('Failed to create new document:', err);
          }
        }
      }
    };
    init();
  }, [docId, selectedDocId, getProjectAndTestType, createNewDoc, fetchDocById]);
  // ========================
  // RETURN COMPONENT
  // ========================
  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Notification messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 100 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 100 }}
            className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 z-50 text-sm"
          >
            <CheckCircle size={16} />
            <span>{success}</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 100 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 100 }}
            className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 z-50 text-sm"
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <Menu size={18} className="text-gray-600" />
          </button>
          <FileText size={20} className="text-blue-600" />
          <button
            onClick={async () => {
              await fetchAllDocs();
              setShowDocList(true);
            }}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="View Documents"
          >
            <List size={16} className="text-gray-600" />
          </button>
          <div className="flex flex-col">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm font-medium text-gray-800 bg-transparent border-none outline-none px-1 py-0.5 hover:bg-gray-50 rounded focus:bg-white focus:ring-1 focus:ring-blue-500"
              placeholder="Untitled Document"
            />
            <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {document?.updatedAt ? new Date(document.updatedAt).toLocaleDateString() : 'Not saved'}
              </span>
              <span>•</span>
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{characterCount} chars</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              if (document?._id) updateDocStatus(document._id, { status: e.target.value });
            }}
            className={`text-xs px-2.5 py-1 rounded-full font-medium border ${status === 'published' ? 'bg-green-50 text-green-700 border-green-200' :
              status === 'draft' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                status === 'archived' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                  'bg-blue-50 text-blue-700 border-blue-200'
              }`}
          >
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          {/* Priority */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className={`text-xs px-2.5 py-1 rounded-full font-medium border ${priority === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
              priority === 'medium' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                'bg-gray-50 text-gray-700 border-gray-200'
              }`}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {/* View Count */}
          <div className="flex items-center gap-1 text-xs text-gray-500 px-2 py-1 bg-gray-50 rounded-lg">
            <Eye size={12} />
            <span>{viewCount}</span>
          </div>
          {/* Collaborators */}
          <button
            onClick={() => {
              if (document?._id) fetchCollaborators(document._id);
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-xs font-medium"
          >
            <Users size={12} />
            <span>{collaborators.length}</span>
          </button>
          {/* Auto-save Toggle */}
          <button
            onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${autoSaveEnabled ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'
              }`}
          >
            <RefreshCw size={12} className={autoSaveEnabled ? 'animate-spin' : ''} />
            <span>{autoSaveEnabled ? 'Auto-save ON' : 'Auto-save OFF'}</span>
          </button>
          {/* Save Button */}
          <button
            onClick={handleSaveDocument}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium disabled:opacity-50"
          >
            <Save size={14} />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
          {/* More Options */}
          <div className="relative">
            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical size={16} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
      {/* Secondary Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* Formatting Toolbar */}
          <button
            onClick={() => applyTextFormatting('bold')}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Bold"
          >
            <Bold size={16} className="text-gray-700" />
          </button>
          <button
            onClick={() => applyTextFormatting('italic')}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Italic"
          >
            <Italic size={16} className="text-gray-700" />
          </button>
          <button
            onClick={() => applyTextFormatting('underline')}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Underline"
          >
            <Underline size={16} className="text-gray-700" />
          </button>
          <button
            onClick={() => applyTextFormatting('strikethrough')}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Strikethrough"
          >
            <Strikethrough size={16} className="text-gray-700" />
          </button>
          <div className="w-px h-5 bg-gray-300 mx-1"></div>
          {/* Alignment */}
          <button
            onClick={() => applyAlignment('left')}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Align Left"
          >
            <AlignLeft size={16} className="text-gray-700" />
          </button>
          <button
            onClick={() => applyAlignment('center')}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Align Center"
          >
            <AlignCenter size={16} className="text-gray-700" />
          </button>
          <button
            onClick={() => applyAlignment('right')}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Align Right"
          >
            <AlignRight size={16} className="text-gray-700" />
          </button>
          <button
            onClick={() => applyAlignment('justify')}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Justify"
          >
            <AlignJustify size={16} className="text-gray-700" />
          </button>
          <div className="w-px h-5 bg-gray-300 mx-1"></div>
          {/* Font Size */}
          <select
            value={currentFormat.fontSize}
            onChange={(e) => applyFontSize(parseInt(e.target.value))}
            className="text-xs px-2 py-1 border border-gray-300 rounded hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64].map(size => (
              <option key={size} value={size}>{size}px</option>
            ))}
          </select>
          {/* Text Color */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors flex items-center gap-1"
              title="Text Color"
            >
              <Type size={16} className="text-gray-700" />
              <div className="w-4 h-1 rounded" style={{ backgroundColor: currentFormat.textColor }}></div>
            </button>
            {showColorPicker && (
              <div className="absolute top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50">
                <input
                  type="color"
                  value={currentFormat.textColor}
                  onChange={(e) => {
                    applyTextColor(e.target.value);
                    setShowColorPicker(false);
                  }}
                  className="w-24 h-24 cursor-pointer"
                />
              </div>
            )}
          </div>
          {/* Background Color */}
          <div className="relative">
            <button
              onClick={() => setShowBgColorPicker(!showBgColorPicker)}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors flex items-center gap-1"
              title="Background Color"
            >
              <Highlighter size={16} className="text-gray-700" />
              <div className="w-4 h-1 rounded" style={{ backgroundColor: currentFormat.backgroundColor }}></div>
            </button>
            {showBgColorPicker && (
              <div className="absolute top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50">
                <input
                  type="color"
                  value={currentFormat.backgroundColor}
                  onChange={(e) => {
                    applyBackgroundColor(e.target.value);
                    setShowBgColorPicker(false);
                  }}
                  className="w-24 h-24 cursor-pointer"
                />
              </div>
            )}
          </div>
          <div className="w-px h-5 bg-gray-300 mx-1"></div>
          {/* Insert Options */}
          <button
            onClick={() => imageUploadRef.current?.click()}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Insert Image"
          >
            <Image size={16} className="text-gray-700" />
          </button>
          <input
            ref={imageUploadRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleMultipleImageUpload(e.target.files);
            }}
          />
          <button
            onClick={() => fileUploadRef.current?.click()}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Attach File"
          >
            <Paperclip size={16} className="text-gray-700" />
          </button>
          <input
            ref={fileUploadRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleMultipleFileUpload(e.target.files);
            }}
          />
          <button
            onClick={() => setShowCommentBox(!showCommentBox)}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Add Comment"
          >
            <MessageSquare size={16} className="text-gray-700" />
          </button>
          <button
            onClick={removeAllFormatting}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors text-xs px-2"
            title="Clear Formatting"
          >
            Clear
          </button>
        </div>
        <div className="flex items-center gap-2">
          {/* Document Actions */}
          {document && (
            <>
              <button
                onClick={() => document._id && toggleStar(document._id)}
                className={`p-1.5 rounded transition-colors ${document.starred ? 'text-yellow-500 bg-yellow-50' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                title="Star Document"
              >
                <Star size={16} fill={document.starred ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => document._id && togglePin(document._id)}
                className={`p-1.5 rounded transition-colors ${document.pinned ? 'text-blue-500 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                title="Pin Document"
              >
                <Pin size={16} fill={document.pinned ? 'currentColor' : 'none'} />
              </button>
            </>
          )}
          {/* Export */}
          <div className="relative group">
            <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
              <Download size={16} className="text-gray-700" />
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg hidden group-hover:block min-w-[120px] z-50">
              <button
                onClick={() => document?._id && exportDocument(document._id, 'txt')}
                className="w-full px-3 py-1.5 text-xs text-left hover:bg-gray-50 flex items-center gap-2"
              >
                <FileText size={12} /> .txt
              </button>
              <button
                onClick={() => document?._id && exportDocument(document._id, 'html')}
                className="w-full px-3 py-1.5 text-xs text-left hover:bg-gray-50 flex items-center gap-2"
              >
                <FileCode size={12} /> .html
              </button>
              <button
                onClick={() => document?._id && exportDocument(document._id, 'md')}
                className="w-full px-3 py-1.5 text-xs text-left hover:bg-gray-50 flex items-center gap-2"
              >
                <BookOpen size={12} /> .md
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Navigation */}
        <motion.div
          initial={{ width: 240 }}
          animate={{ width: showSidebar ? 240 : 0 }}
          className="bg-white border-r border-gray-200 overflow-hidden"
        >
          <div className="w-60 h-full flex flex-col">
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      searchDocuments(e.target.value);
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('edit')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'edit' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Edit3 size={14} />
                  <span>Editor</span>
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'preview' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Eye size={14} />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'comments' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <MessageSquare size={14} />
                  <span>Comments</span>
                  {comments.length > 0 && (
                    <span className="ml-auto bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{comments.length}</span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('suggestions')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'suggestions' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Sparkles size={14} />
                  <span>Suggestions</span>
                  {suggestions.length > 0 && (
                    <span className="ml-auto bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{suggestions.length}</span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setActiveTab('versions');
                    if (document?._id) fetchVersions(document._id);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'versions' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <History size={14} />
                  <span>Version History</span>
                </button>
                <button
                  onClick={() => setActiveTab('collaborators')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'collaborators' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Users size={14} />
                  <span>Collaborators</span>
                </button>
                <button
                  onClick={() => setActiveTab('media')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'media' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Image size={14} />
                  <span>Media & Files</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('analytics');
                    if (document?._id) {
                      getDocStats(document._id);
                      fetchAccessLogs(document._id);
                    }
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'analytics' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Activity size={14} />
                  <span>Analytics</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Settings size={14} />
                  <span>Settings</span>
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">Quick Actions</p>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      if (document?._id) {
                        const newTitle = prompt('Enter new title for duplicate:');
                        if (newTitle) duplicateDocument(document._id, newTitle);
                      }
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Copy size={14} />
                    <span>Duplicate</span>
                  </button>
                  <button
                    onClick={() => {
                      if (document?._id && confirm('Archive this document?')) {
                        archiveDocument(document._id);
                      }
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Archive size={14} />
                    <span>Archive</span>
                  </button>
                  <button
                    onClick={() => {
                      if (document?._id && confirm('Delete this document permanently?')) {
                        deleteDocument(document._id);
                      }
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          {activeTab === 'edit' && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 min-h-[800px]">
                <div className="p-12">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Document Title"
                    className="w-full text-3xl font-bold text-gray-900 border-none outline-none mb-2 placeholder-gray-300"
                  />
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description..."
                    className="w-full text-sm text-gray-600 border-none outline-none mb-6 placeholder-gray-300"
                  />
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {tags.map((tag, idx) => (
                      <span
                        key={`tag-${idx}-${tag}`}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                      >
                        <Tag size={10} />
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                    <button
                      onClick={() => {
                        const tag = prompt('Enter tag:');
                        if (tag) handleAddTag(tag);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 border border-dashed border-gray-300 text-gray-500 rounded-full text-xs hover:border-blue-400 hover:text-blue-600"
                    >
                      <Plus size={10} />
                      Add Tag
                    </button>
                  </div>
                  <div
                    ref={editorRef}
                    contentEditable
                    onInput={(e) => {
                      const target = e.currentTarget;
                      setHtmlContent(target.innerHTML);
                      const text = target.textContent || '';
                      setTextContent(text);
                      calculateTextStats(text);
                    }}
                    onSelect={updateCursorStats}
                    onPaste={handleImageFromClipboard}
                    className="min-h-[600px] text-sm text-gray-800 leading-relaxed outline-none focus:outline-none"
                    style={{
                      fontFamily: currentFormat.fontFamily,
                      fontSize: `${currentFormat.fontSize}px`,
                      lineHeight: currentFormat.lineHeight,
                      textAlign: currentFormat.textAlign,
                    }}
                    suppressContentEditableWarning
                  />
                  {/* Display Images */}
                  {images.length > 0 && (
                    <div className="mt-6 space-y-4">
                      {images.map((img) => (
                        <div key={`image-${img._id}`} className="relative group">
                          <img
                            src={img.url}
                            alt={img.altText || 'Document image'}
                            className="max-w-full rounded-lg border border-gray-200"
                          />
                          {img.caption && (
                            <p className="text-xs text-gray-600 italic mt-1">{img.caption}</p>
                          )}
                          <button
                            onClick={() => document?._id && deleteImage(document._id, img._id)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Display Code Blocks */}
                  {codeBlocks.length > 0 && (
                    <div className="mt-6 space-y-4">
                      {codeBlocks.map((cb) => (
                        <div key={`codeblock-${cb._id}`} className="relative group">
                          <div className="bg-gray-900 rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                              <span className="text-xs text-gray-300">{cb.language}</span>
                              <button
                                onClick={() => document?._id && copyCodeBlock(document._id, cb._id)}
                                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-300 hover:text-white transition-colors"
                              >
                                <Copy size={12} />
                                Copy
                              </button>
                            </div>
                            <pre className="p-4 overflow-x-auto">
                              <code className="text-xs text-gray-100 font-mono">{cb.code}</code>
                            </pre>
                          </div>
                          <button
                            onClick={() => document?._id && deleteCodeBlock(document._id, cb._id)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Display Tables */}
                  {tables.length > 0 && (
                    <div className="mt-6 space-y-4">
                      {tables.map((table) => (
                        <div key={`table-${table._id}`} className="relative group overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-300 text-xs">
                            <thead>
                              <tr className="bg-gray-50">
                                {table.headers?.map((header, idx) => (
                                  <th key={`header-${idx}`} className="border border-gray-300 px-3 py-2 text-left">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {table.rows?.map((row, rowIdx) => (
                                <tr key={`row-${rowIdx}`}>
                                  {row.map((cell, cellIdx) => (
                                    <td key={`cell-${rowIdx}-${cellIdx}`} className="border border-gray-300 px-3 py-2">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <button
                            onClick={() => document?._id && deleteTable(document._id, table._id)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Floating Comment Box */}
              <AnimatePresence>
                {showCommentBox && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="fixed bottom-6 right-4 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900">Add Comment</h3>
                      <button
                        onClick={() => setShowCommentBox(false)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <X size={16} className="text-gray-600" />
                      </button>
                    </div>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write your comment..."
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={4}
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={() => {
                          setShowCommentBox(false);
                          setCommentText('');
                        }}
                        className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCommentCreate}
                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Add Comment
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          {activeTab === 'preview' && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 min-h-[800px] p-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
                {description && (
                  <p className="text-sm text-gray-600 mb-6">{description}</p>
                )}
                <div className="flex flex-wrap gap-2 mb-6">
                  {tags.map((tag, idx) => (
                    <span key={`preview-tag-${idx}`} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                </div>
                {images.length > 0 && (
                  <div className="mt-6 space-y-4">
                    {images.map((img) => (
                      <div key={`preview-image-${img._id}`}>
                        <img src={img.url} alt={img.altText} className="max-w-full rounded-lg" />
                        {img.caption && <p className="text-xs text-gray-600 italic mt-1">{img.caption}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'comments' && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Comments</h2>
                  <button
                    onClick={() => setShowCommentBox(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <Plus size={16} />
                    New Comment
                  </button>
                </div>
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <motion.div
                      key={`comment-${comment._id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {comment.userId?.name?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{comment.userId?.name || 'Anonymous'}</p>
                            <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {comment.resolved ? (
                            <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">Resolved</span>
                          ) : (
                            <button
                              onClick={() => document?._id && resolveComment(document._id, comment._id)}
                              className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              Resolve
                            </button>
                          )}
                          <button
                            onClick={() => document?._id && deleteComment(document._id, comment._id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{comment.text}</p>
                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-8 space-y-2 mt-3 pt-3 border-t border-gray-100">
                          {comment.replies.map((reply, idx) => (
                            <div key={`reply-${comment._id}-${idx}`} className="flex items-start gap-2">
                              <CornerDownRight size={14} className="text-gray-400 mt-1" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-xs font-semibold text-gray-900">{reply.userId?.name || 'Anonymous'}</p>
                                  <p className="text-xs text-gray-500">{new Date(reply.createdAt).toLocaleDateString()}</p>
                                </div>
                                <p className="text-xs text-gray-700">{reply.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Reply Form */}
                      {replyingTo === comment._id ? (
                        <div className="ml-8 mt-3">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={2}
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                              className="px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 rounded transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleCommentReply(comment._id)}
                              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyingTo(comment._id)}
                          className="ml-8 mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                        >
                          <Reply size={12} />
                          Reply
                        </button>
                      )}
                    </motion.div>
                  ))}
                  {comments.length === 0 && (
                    <div className="text-center py-12">
                      <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-sm text-gray-500">No comments yet</p>
                      <p className="text-xs text-gray-400 mt-1">Be the first to add a comment</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'suggestions' && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Suggestions</h2>
                  <button
                    onClick={() => setShowSuggestionBox(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                  >
                    <Sparkles size={16} />
                    New Suggestion
                  </button>
                </div>
                <div className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <motion.div
                      key={`suggestion-${suggestion._id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles size={16} className="text-purple-600" />
                          <div>
                            <p className="text-xs text-gray-500">Suggested by {suggestion.userId?.name || 'Anonymous'}</p>
                            <p className="text-xs text-gray-400">{new Date(suggestion.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${suggestion.status === 'accepted' ? 'bg-green-50 text-green-700' :
                          suggestion.status === 'rejected' ? 'bg-red-50 text-red-700' :
                            'bg-yellow-50 text-yellow-700'
                          }`}>
                          {suggestion.status}
                        </span>
                      </div>
                      <div className="space-y-2 mb-3">
                        <div className="bg-red-50 border border-red-200 rounded p-2">
                          <p className="text-xs text-gray-500 mb-1">Original:</p>
                          <p className="text-sm text-gray-900 line-through">{suggestion.originalText}</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded p-2">
                          <p className="text-xs text-gray-500 mb-1">Suggested:</p>
                          <p className="text-sm text-gray-900">{suggestion.suggestedText}</p>
                        </div>
                      </div>
                      {suggestion.description && (
                        <p className="text-xs text-gray-600 mb-3">{suggestion.description}</p>
                      )}
                      {suggestion.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => document?._id && acceptSuggestion(document._id, suggestion._id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs"
                          >
                            <Check size={12} />
                            Accept
                          </button>
                          <button
                            onClick={() => document?._id && rejectSuggestion(document._id, suggestion._id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs"
                          >
                            <X size={12} />
                            Reject
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {suggestions.length === 0 && (
                    <div className="text-center py-12">
                      <Sparkles size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-sm text-gray-500">No suggestions yet</p>
                    </div>
                  )}
                </div>
                {/* Suggestion Modal */}
                <AnimatePresence>
                  {showSuggestionBox && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                      onClick={() => setShowSuggestionBox(false)}
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Suggestion</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Suggested Text</label>
                            <textarea
                              value={suggestionText}
                              onChange={(e) => setSuggestionText(e.target.value)}
                              placeholder="Enter your suggested text..."
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                              rows={3}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Description (Optional)</label>
                            <textarea
                              value={suggestionDescription}
                              onChange={(e) => setSuggestionDescription(e.target.value)}
                              placeholder="Why are you suggesting this change?"
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                              rows={2}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          <button
                            onClick={() => {
                              setShowSuggestionBox(false);
                              setSuggestionText('');
                              setSuggestionDescription('');
                            }}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSuggestionCreate}
                            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Add Suggestion
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
          {activeTab === 'versions' && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Version History</h2>
                  <button
                    onClick={() => setShowVersionModal(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <Plus size={16} />
                    Create Version
                  </button>
                </div>
                <div className="space-y-3">
                  {versions.map((version, idx) => (
                    <motion.div
                      key={`version-${version._id || idx}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <History size={16} className="text-blue-600" />
                            <h3 className="text-sm font-semibold text-gray-900">
                              {version.versionName || `Version ${version.versionNumber}`}
                            </h3>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              v{version.versionNumber}
                            </span>
                          </div>
                          {version.description && (
                            <p className="text-xs text-gray-600 mb-2">{version.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{new Date(version.createdAt).toLocaleString()}</span>
                            <span>•</span>
                            <span>By {version.createdBy?.name || 'Unknown'}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (document?._id && confirm(`Restore to version ${version.versionNumber}?`)) {
                              restoreVersion(document._id, version.versionNumber);
                            }
                          }}
                          className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Restore
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  {versions.length === 0 && (
                    <div className="text-center py-12">
                      <History size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-sm text-gray-500">No version history</p>
                    </div>
                  )}
                </div>
                {/* Version Modal */}
                <AnimatePresence>
                  {showVersionModal && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                      onClick={() => setShowVersionModal(false)}
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Version Snapshot</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Version Name</label>
                            <input
                              type="text"
                              value={versionName}
                              onChange={(e) => setVersionName(e.target.value)}
                              placeholder="e.g., Final Draft, Review Version"
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                              value={versionDescription}
                              onChange={(e) => setVersionDescription(e.target.value)}
                              placeholder="What changed in this version?"
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                              rows={3}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          <button
                            onClick={() => {
                              setShowVersionModal(false);
                              setVersionName('');
                              setVersionDescription('');
                            }}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleVersionCreate}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Create Version
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
          {activeTab === 'collaborators' && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Collaborators</h2>
                  <button
                    onClick={() => setShowCollaboratorBox(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                  >
                    <Plus size={16} />
                    Add Collaborator
                  </button>
                </div>
                {/* Current Editors */}
                {currentEditors.length > 0 && (
                  <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-green-900 mb-3">Currently Editing</h3>
                    <div className="space-y-2">
                      {currentEditors.map((editor, idx) => (
                        <div key={`editor-${editor.userId || idx}`} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-800">{editor.userId?.name || 'Anonymous'}</span>
                          <span className="text-xs text-green-600">• Line {editor.lineNumber}, Col {editor.columnNumber}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Collaborators List */}
                <div className="space-y-3">
                  {collaborators.map((collab) => (
                    <motion.div
                      key={`collaborator-${collab._id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {collab.userId?.name?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{collab.userId?.name || 'Anonymous'}</p>
                            <p className="text-xs text-gray-500">{collab.userId?.email || 'No email'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={collab.permission}
                            onChange={(e) => {
                              if (document?._id) {
                                updateCollaboratorPermission(document._id, collab._id, { permission: e.target.value });
                              }
                            }}
                            className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="view">View</option>
                            <option value="comment">Comment</option>
                            <option value="edit">Edit</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => {
                              if (document?._id && confirm('Remove this collaborator?')) {
                                removeCollaborator(document._id, collab._id);
                              }
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {collaborators.length === 0 && (
                    <div className="text-center py-12">
                      <Users size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-sm text-gray-500">No collaborators yet</p>
                    </div>
                  )}
                </div>
                {/* Add Collaborator Modal */}
                <AnimatePresence>
                  {showCollaboratorBox && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                      onClick={() => setShowCollaboratorBox(false)}
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Collaborator</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Email or User ID</label>
                            <input
                              type="text"
                              value={collaboratorEmail}
                              onChange={(e) => setCollaboratorEmail(e.target.value)}
                              placeholder="user@example.com"
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Permission Level</label>
                            <select
                              value={collaboratorPermission}
                              onChange={(e) => setCollaboratorPermission(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="view">View Only</option>
                              <option value="comment">Can Comment</option>
                              <option value="edit">Can Edit</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          <button
                            onClick={() => {
                              setShowCollaboratorBox(false);
                              setCollaboratorEmail('');
                              setCollaboratorPermission('view');
                            }}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleCollaboratorAdd}
                            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Add Collaborator
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
          {activeTab === 'media' && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Media & Files</h2>
                {/* Upload Buttons */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => mediaImageUploadRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <Image size={16} />
                    Upload Images
                  </button>
                  <input
                    ref={mediaImageUploadRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) handleMultipleImageUpload(e.target.files);
                    }}
                  />
                  <button
                    onClick={() => mediaFileUploadRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                  >
                    <Paperclip size={16} />
                    Upload Files
                  </button>
                  <input
                    ref={mediaFileUploadRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) handleMultipleFileUpload(e.target.files);
                    }}
                  />
                  <button
                    onClick={() => mediaVideoUploadRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    <Monitor size={16} />
                    Upload Video
                  </button>
                  <input
                    ref={mediaVideoUploadRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleVideoUpload(e.target.files[0]);
                    }}
                  />
                </div>
                {/* Images Section */}
                {images.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Images ({images.length})</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {images.map((img) => (
                        <motion.div
                          key={`media-image-${img._id}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative group bg-white rounded-lg border border-gray-200 overflow-hidden"
                        >
                          <img
                            src={img.url}
                            alt={img.altText}
                            className="w-full h-40 object-cover"
                          />
                          <div className="p-2">
                            <p className="text-xs text-gray-600 truncate">{img.caption || 'No caption'}</p>
                            <p className="text-xs text-gray-400">{(img.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button
                              onClick={() => copyToClipboard(img.url)}
                              className="p-1.5 bg-blue-600 text-white rounded shadow-lg hover:bg-blue-700"
                            >
                              <Copy size={12} />
                            </button>
                            <button
                              onClick={() => document?._id && deleteImage(document._id, img._id)}
                              className="p-1.5 bg-red-600 text-white rounded shadow-lg hover:bg-red-700"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Attachments Section */}
                {attachments.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Attachments ({attachments.length})</h3>
                    <div className="space-y-2">
                      {attachments.map((att) => (
                        <motion.div
                          key={`attachment-${att._id}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-white rounded-lg border border-gray-200 p-3 flex items-center justify-between hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                              <Paperclip size={18} className="text-gray-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{att.name}</p>
                              <p className="text-xs text-gray-500">{att.fileType?.toUpperCase()} • {(att.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => document?._id && downloadAttachment(document._id, att._id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Download size={16} />
                            </button>
                            <button
                              onClick={() => document?._id && deleteAttachment(document._id, att._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Code Blocks Section */}
                {codeBlocks.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Code Blocks ({codeBlocks.length})</h3>
                    <div className="space-y-3">
                      {codeBlocks.map((cb) => (
                        <motion.div
                          key={`codeblock-media-${cb._id}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-900 rounded-lg overflow-hidden"
                        >
                          <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
                            <span className="text-xs text-gray-300">{cb.language}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">{cb.copyCount || 0} copies</span>
                              <button
                                onClick={() => document?._id && copyCodeBlock(document._id, cb._id)}
                                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                              >
                                <Copy size={12} />
                                Copy
                              </button>
                              <button
                                onClick={() => document?._id && deleteCodeBlock(document._id, cb._id)}
                                className="p-1 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                          <pre className="p-4 overflow-x-auto max-h-60">
                            <code className="text-xs text-gray-100 font-mono">{cb.code}</code>
                          </pre>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Tables Section */}
                {tables.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Tables ({tables.length})</h3>
                    <div className="space-y-4">
                      {tables.map((table) => (
                        <motion.div
                          key={`table-media-${table._id}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                        >
                          <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-700">
                              {table.headers?.length || 0} columns × {table.rows?.length || 0} rows
                            </span>
                            <button
                              onClick={() => document?._id && deleteTable(document._id, table._id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-gray-50">
                                  {table.headers?.map((header, idx) => (
                                    <th key={`table-header-${idx}`} className="px-3 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {table.rows?.slice(0, 5).map((row, rowIdx) => (
                                  <tr key={`table-row-${rowIdx}`} className="border-b border-gray-100">
                                    {row.map((cell, cellIdx) => (
                                      <td key={`table-cell-${rowIdx}-${cellIdx}`} className="px-3 py-2 text-gray-600">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {table.rows && table.rows.length > 5 && (
                              <div className="p-2 text-center text-xs text-gray-500 bg-gray-50">
                                +{table.rows.length - 5} more rows
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                {images.length === 0 && attachments.length === 0 && codeBlocks.length === 0 && tables.length === 0 && (
                  <div className="text-center py-16">
                    <Image size={64} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-sm text-gray-500">No media or files yet</p>
                    <p className="text-xs text-gray-400 mt-1">Upload images, files, or add code blocks to get started</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'analytics' && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Analytics & Activity</h2>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600">Total Views</span>
                      <Eye size={16} className="text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{viewCount}</p>
                    <p className="text-xs text-gray-500 mt-1">All time</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600">Comments</span>
                      <MessageSquare size={16} className="text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{comments.length}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {comments.filter(c => !c.resolved).length} unresolved
                    </p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600">Collaborators</span>
                      <Users size={16} className="text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{collaborators.length}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {currentEditors.length} active now
                    </p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600">Versions</span>
                      <History size={16} className="text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{versions.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Snapshots saved</p>
                  </div>
                </div>
                {/* Access Logs */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
                    <button
                      onClick={() => document?._id && fetchAccessLogs(document._id, 50)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <RefreshCw size={12} />
                      Refresh
                    </button>
                  </div>
                  <div className="space-y-2">
                    {accessLogs.map((log, idx) => (
                      <motion.div
                        key={`access-log-${log._id || idx}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="flex items-center gap-3 py-2 px-3 hover:bg-gray-50 rounded-lg"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${log.action === 'view' ? 'bg-blue-100' :
                          log.action === 'edit' ? 'bg-green-100' :
                            log.action === 'comment' ? 'bg-purple-100' :
                              'bg-gray-100'
                          }`}>
                          {log.action === 'view' && <Eye size={14} className="text-blue-600" />}
                          {log.action === 'edit' && <Edit3 size={14} className="text-green-600" />}
                          {log.action === 'comment' && <MessageSquare size={14} className="text-purple-600" />}
                          {log.action === 'download' && <Download size={14} className="text-gray-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-900">
                            {log.userId?.name || 'Anonymous'} {log.action}ed the document
                          </p>
                          <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${log.action === 'view' ? 'bg-blue-50 text-blue-700' :
                          log.action === 'edit' ? 'bg-green-50 text-green-700' :
                            log.action === 'comment' ? 'bg-purple-50 text-purple-700' :
                              'bg-gray-50 text-gray-700'
                          }`}>
                          {log.action}
                        </span>
                      </motion.div>
                    ))}
                    {accessLogs.length === 0 && (
                      <div className="text-center py-8">
                        <Activity size={40} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-xs text-gray-500">No activity logs yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Document Settings</h2>
                <div className="space-y-6">
                  {/* General Settings */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">General</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="documentation">Documentation</option>
                          <option value="guide">Guide</option>
                          <option value="tutorial">Tutorial</option>
                          <option value="reference">Reference</option>
                          <option value="note">Note</option>
                          <option value="specification">Specification</option>
                        </select>
                      </div>
                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-900">Public Document</span>
                            <p className="text-xs text-gray-500">Anyone with the link can view this document</p>
                          </div>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={autoSaveEnabled}
                            onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-900">Auto-save</span>
                            <p className="text-xs text-gray-500">Automatically save changes every 30 seconds</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                  {/* Editor Settings */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Editor Preferences</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Default Font Size</label>
                        <input
                          type="range"
                          min="10"
                          max="24"
                          value={currentFormat.fontSize}
                          onChange={(e) => setCurrentFormat(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-600">{currentFormat.fontSize}px</span>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Line Height</label>
                        <input
                          type="range"
                          min="1"
                          max="2.5"
                          step="0.1"
                          value={currentFormat.lineHeight}
                          onChange={(e) => setCurrentFormat(prev => ({ ...prev, lineHeight: parseFloat(e.target.value) }))}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-600">{currentFormat.lineHeight}</span>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Font Family</label>
                        <select
                          value={currentFormat.fontFamily}
                          onChange={(e) => setCurrentFormat(prev => ({ ...prev, fontFamily: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Arial">Arial</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Courier New">Courier New</option>
                          <option value="Verdana">Verdana</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  {/* Danger Zone */}
                  <div className="bg-white rounded-lg border border-red-200 p-6">
                    <h3 className="text-sm font-semibold text-red-900 mb-4">Danger Zone</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-3 border-b border-red-100">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Archive Document</p>
                          <p className="text-xs text-gray-500">Hide this document from active lists</p>
                        </div>
                        <button
                          onClick={() => {
                            if (document?._id && confirm('Archive this document?')) {
                              archiveDocument(document._id);
                            }
                          }}
                          className="px-3 py-1.5 text-xs text-orange-700 border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors"
                        >
                          Archive
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Delete Document</p>
                          <p className="text-xs text-gray-500">Permanently delete this document and all its data</p>
                        </div>
                        <button
                          onClick={() => {
                            if (document?._id && confirm('Are you sure? This action cannot be undone!')) {
                              deleteDocument(document._id);
                            }
                          }}
                          className="px-3 py-1.5 text-xs text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Save Settings */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveDocument}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Save All Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Right Sidebar - Cursor Position & Stats */}
        <div className="w-48 bg-white border-l border-gray-200 p-4 overflow-y-auto hidden lg:block">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-gray-700 mb-2">Cursor Position</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p>Line: {cursorPosition.line + 1}</p>
                <p>Column: {cursorPosition.column + 1}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">Document Stats</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p>Words: {wordCount}</p>
                <p>Characters: {characterCount}</p>
                <p>Images: {images.length}</p>
                <p>Attachments: {attachments.length}</p>
                <p>Comments: {comments.length}</p>
              </div>
            </div>
            {textFormats.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-700 mb-2">Active Formats</h3>
                <div className="flex flex-wrap gap-1">
                  {[...new Set(textFormats.map(f => f.format))].map((format, idx) => (
                    <span
                      key={`format-${idx}`}
                      className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px]"
                    >
                      {format}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {currentEditors.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-700 mb-2">Active Users</h3>
                <div className="space-y-2">
                  {currentEditors.map((editor, idx) => (
                    <div key={`active-editor-${editor.userId || idx}`} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-600 truncate">
                        {editor.userId?.name || 'User'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">Quick Actions</h3>
              <div className="space-y-1">
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded transition-colors"
                >
                  <Monitor size={12} />
                  Print
                </button>
                <button
                  onClick={() => copyToClipboard(textContent)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded transition-colors"
                >
                  <Copy size={12} />
                  Copy All
                </button>
                <button
                  onClick={() => {
                    if (document?._id) {
                      const stats = `Title: ${title}\nWords: ${wordCount}\nCharacters: ${characterCount}\nComments: ${comments.length}\nCollaborators: ${collaborators.length}`;
                      alert(stats);
                    }
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded transition-colors"
                >
                  <TrendingUp size={12} />
                  Stats
                </button>
              </div>
            </div>
            {document?.createdAt && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-700 mb-2">Document Info</h3>
                <div className="text-xs text-gray-600 space-y-1">
                  <p className="flex items-center gap-1">
                    <Clock size={10} />
                    Created: {new Date(document.createdAt).toLocaleDateString()}
                  </p>
                  <p className="flex items-center gap-1">
                    <RefreshCw size={10} />
                    Updated: {new Date(document.updatedAt).toLocaleDateString()}
                  </p>
                  {document.owner && (
                    <p className="flex items-center gap-1">
                      <Users size={10} />
                      Owner: {document.owner.name}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Bottom Status Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-1.5 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Activity size={12} />
            {isSaving ? 'Saving...' : isLoading ? 'Loading...' : 'Ready'}
          </span>
          {document?._id && (
            <span className="text-gray-400">ID: {document._id.slice(-8)}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>Line {cursorPosition.line + 1}, Col {cursorPosition.column + 1}</span>
          <span>•</span>
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{characterCount} characters</span>
          {autoSaveEnabled && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1 text-green-600">
                <RefreshCw size={10} />
                Auto-save ON
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (editorRef.current) {
                editorRef.current.style.fontSize = `${Math.max(10, currentFormat.fontSize - 2)}px`;
                setCurrentFormat(prev => ({ ...prev, fontSize: Math.max(10, prev.fontSize - 2) }));
              }
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Zoom Out"
          >
            <ZoomOut size={12} />
          </button>
          <span className="text-xs">{currentFormat.fontSize}px</span>
          <button
            onClick={() => {
              if (editorRef.current) {
                editorRef.current.style.fontSize = `${Math.min(32, currentFormat.fontSize + 2)}px`;
                setCurrentFormat(prev => ({ ...prev, fontSize: Math.min(32, prev.fontSize + 2) }));
              }
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Zoom In"
          >
            <ZoomIn size={12} />
          </button>
        </div>
      </div>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 left-6 flex flex-col gap-2 z-40">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowSidebar(!showSidebar)}
          className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center"
          title={showSidebar ? 'Hide Sidebar' : 'Show Sidebar'}
        >
          {showSidebar ? <X size={20} /> : <Menu size={20} />}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowCommentBox(true)}
          className="w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 flex items-center justify-center relative"
          title="Add Comment"
        >
          <MessageSquare size={20} />
          {comments.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {comments.length}
            </span>
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSaveDocument}
          disabled={isSaving}
          className="w-12 h-12 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 flex items-center justify-center disabled:opacity-50"
          title="Save Document"
        >
          {isSaving ? (
            <RefreshCw size={20} className="animate-spin" />
          ) : (
            <Save size={20} />
          )}
        </motion.button>
      </div>
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-lg shadow-2xl p-6 flex flex-col items-center gap-3">
              <RefreshCw size={32} className="text-blue-600 animate-spin" />
              <p className="text-sm font-medium text-gray-900">Loading...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Context Menu for Editor (Right Click) */}
      <div
        id="context-menu"
        className="hidden fixed bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-50 min-w-[160px]"
        onContextMenu={(e) => e.preventDefault()}
      >
        <button
          onClick={() => {
            document.execCommand('copy');
            document.getElementById('context-menu').classList.add('hidden');
          }}
          className="w-full px-4 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"
        >
          <Copy size={12} />
          Copy
        </button>
        <button
          onClick={() => {
            document.execCommand('cut');
            document.getElementById('context-menu').classList.add('hidden');
          }}
          className="w-full px-4 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"
        >
          <Trash2 size={12} />
          Cut
        </button>
        <button
          onClick={() => {
            document.execCommand('paste');
            document.getElementById('context-menu').classList.add('hidden');
          }}
          className="w-full px-4 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"
        >
          <Paperclip size={12} />
          Paste
        </button>
        <div className="border-t border-gray-200 my-1"></div>
        <button
          onClick={() => {
            setShowCommentBox(true);
            document.getElementById('context-menu').classList.add('hidden');
          }}
          className="w-full px-4 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"
        >
          <MessageSquare size={12} />
          Add Comment
        </button>
        <button
          onClick={() => {
            setShowSuggestionBox(true);
            document.getElementById('context-menu').classList.add('hidden');
          }}
          className="w-full px-4 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"
        >
          <Sparkles size={12} />
          Suggest Edit
        </button>
      </div>
      {/* Document List Modal */}
      <AnimatePresence>
        {showDocList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowDocList(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto"
            >
              <h3 className="text-lg font-semibold mb-4">Documents</h3>
              <button
                onClick={async () => {
                  setShowDocList(false);
                  setSelectedDocId(null);
                  const docData = {
                    title: 'Untitled Document',
                    content: '',
                    description: '',
                    category: 'documentation',
                    priority: 'medium',
                    status: 'draft',
                    tags: [],
                    isPublic: false
                  };
                  const newDoc = await createNewDoc(docData);
                  setSelectedDocId(newDoc._id);
                }}
                className="mb-4 flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg"
              >
                <Plus size={16} /> Create New Document
              </button>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Title</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Updated</th>
                      <th className="px-4 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allDocs.map(doc => (
                      <tr key={doc._id} className="border-t">
                        <td className="px-4 py-2">{doc.title}</td>
                        <td className="px-4 py-2">{doc.status}</td>
                        <td className="px-4 py-2">{new Date(doc.updatedAt).toLocaleDateString()}</td>
                        <td className="px-4 py-2 text-right">
                          <button
                            onClick={async () => {
                              setSelectedDocId(doc._id);
                              setShowDocList(false);
                              await fetchDocById(doc._id);
                            }}
                            className="text-blue-600 hover:underline"
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {allDocs.length === 0 && <p className="text-center py-4">No documents found</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Initialize context menu listener */}
      <script dangerouslySetInnerHTML={{
        __html: `
      document.addEventListener('contextmenu', function(e) {
        if (e.target.closest('[contenteditable]')) {
          e.preventDefault();
          const menu = document.getElementById('context-menu');
          menu.style.left = e.pageX + 'px';
          menu.style.top = e.pageY + 'px';
          menu.classList.remove('hidden');
        }
      });
      document.addEventListener('click', function(e) {
        if (!e.target.closest('#context-menu')) {
          document.getElementById('context-menu')?.classList.add('hidden');
        }
      });
    `}} />
    </div>
  );
}
export default DocEditor;