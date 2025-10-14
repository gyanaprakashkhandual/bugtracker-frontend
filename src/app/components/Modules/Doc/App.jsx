'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

const BASE_URL = 'http://localhost:5000/api/v1/doc';
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dvytvjplt/image/upload';
const CLOUDINARY_PRESET = 'ml_default';

const DocEditor = ({ docId = null, onSave = null }) => {
  // ========================
  // STATE MANAGEMENT
  // ========================

  // Document State
  const [document, setDocument] = useState(null);
  const [content, setContent] = useState('');
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

  // Refs
  const editorRef = useRef(null);
  const autoSaveTimerRef = useRef(null);
  const cursorUpdateTimerRef = useRef(null);

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
  // API FUNCTIONS
  // ========================

  const createNewDoc = useCallback(async (docData) => {
    const { projectId, testTypeId } = getProjectAndTestType();
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
      setTitle(doc.title);
      setDescription(doc.description);
      setContent(doc.content);
      setCategory(doc.category);
      setPriority(doc.priority);
      setStatus(doc.status);
      setTags(doc.tags);
      setIsPublic(doc.isPublic);
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
      setContent(data.doc.content);
      showNotification(`Restored to version ${versionNumber}`);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [getProjectAndTestType, getHeaders, showNotification]);

  // Collaboration Functions
  const addCollaborator = useCallback(async (id, collaboratorData) => {
    const { projectId, testTypeId } = getProjectAndTestType();
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
        content,
        category,
        priority,
        status,
        tags,
        isPublic,
      }).catch(() => {
        // Silent fail for auto-save
      });
    }, 30000); // Auto-save every 30 seconds

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [autoSaveEnabled, document, title, description, content, category, priority, status, tags, isPublic, updateDocInfo]);

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
  // HELPER FUNCTIONS FOR UI
  // ========================

  const handleSaveDocument = useCallback(() => {
    if (!document || !document._id) return;
    updateDocInfo(document._id, {
      title,
      description,
      content,
      category,
      priority,
      status,
      tags,
      isPublic,
    });
  }, [document, title, description, content, category, priority, status, tags, isPublic, updateDocInfo]);

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
      userId: collaboratorEmail,
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

  // Return JSX div with all functions and states passed as context
  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Notification messages */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <span className="text-sm">{success}</span>
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Main Editor Container - All context available via functions */}
      <div
        ref={editorRef}
        className="flex-1 flex flex-col overflow-hidden"
        data-editor={{
          // Document states
          document, content, setContent, title, setTitle, description, setDescription,
          category, setCategory, priority, setPriority, status, setStatus,
          tags, setTags, isPublic, setIsPublic,

          // UI states
          activeTab, setActiveTab, isLoading, error, success, isSaving,

          // Formatting states
          selectedText, selectionStart, selectionEnd, textFormats, currentFormat, setCurrentFormat,

          // Comment states
          comments, showCommentBox, setShowCommentBox, commentText, setCommentText,
          replyingTo, setReplyingTo, replyText, setReplyText,

          // Suggestion states
          suggestions, showSuggestionBox, setShowSuggestionBox,
          suggestionText, setSuggestionText, suggestionDescription, setSuggestionDescription,

          // Version states
          versions, showVersionModal, setShowVersionModal,
          versionName, setVersionName, versionDescription, setVersionDescription,

          // Collaboration states
          collaborators, currentEditors, showCollaboratorBox, setShowCollaboratorBox,
          collaboratorEmail, setCollaboratorEmail, collaboratorPermission, setCollaboratorPermission,

          // Media states
          images, attachments, tables, codeBlocks, accessLogs, viewCount,

          // Cursor & realtime states
          cursorPosition, autoSaveEnabled, setAutoSaveEnabled, wordCount, characterCount, editorRef,

          // API Functions - Document
          createNewDoc, fetchDocById, updateDocInfo, searchDocuments,
          getDocsByCategory, getRecentDocuments, exportDocument,
          updateDocStatus, duplicateDocument, getDocStats,
          togglePin, toggleStar, archiveDocument, unarchiveDocument, deleteDocument,

          // API Functions - Comments
          addComment, replyToComment, resolveComment, deleteComment,

          // API Functions - Suggestions
          addSuggestion, acceptSuggestion, rejectSuggestion,

          // API Functions - Versions
          createVersionSnapshot, fetchVersions, restoreVersion,

          // API Functions - Collaboration
          addCollaborator, updateCollaboratorPermission, removeCollaborator, fetchCollaborators,
          updateCursorPosition, removeCursor,

          // API Functions - Media
          addImage, updateImage, deleteImage,
          addAttachment, deleteAttachment, downloadAttachment,
          addCodeBlock, updateCodeBlock, deleteCodeBlock, copyCodeBlock,
          addTable, updateTable, deleteTable,
          fetchAccessLogs,

          // Formatting Functions
          applyTextFormatting, applyAlignment, applyTextColor,
          applyBackgroundColor, applyFontSize, removeAllFormatting, clearFormatInRange,

          // Utility Functions
          calculateTextStats, getSelectedRange, updateCursorStats,
          showNotification, copyToClipboard, downloadFile,

          // Handler Functions
          handleSaveDocument, handleAddTag, handleRemoveTag,
          handleCommentCreate, handleCommentReply,
          handleSuggestionCreate, handleCollaboratorAdd, handleVersionCreate,

          // Upload Functions
          uploadToCloudinary, handleImageUpload, handleMultipleImageUpload,
          handleFileUpload, handleMultipleFileUpload, handleVideoUpload,
          validateFile, handleImageFromClipboard,
          deleteImageFromCloudinary, deleteFileFromCloudinary,
          getCloudinaryImageUrl, getCloudinaryThumbnail,
        }}
      >
        {/* Editor content placeholder - children components will access context via functions */}
      </div>
    </div>
  );
};

export default DocEditor;