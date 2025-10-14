// docEditorHooks.js

import { useState, useCallback, useEffect, useRef } from 'react';
import { DEFAULT_FORMAT, AUTO_SAVE_INTERVAL, CURSOR_UPDATE_INTERVAL } from './Constant';
import { calculateTextStats, createNotificationHandler, validateFile } from './Utils';
import * as API from './api.service';

// ========================
// MAIN CUSTOM HOOK
// ========================

export const useDocEditor = (docId = null, onSave = null) => {
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
  const [currentFormat, setCurrentFormat] = useState(DEFAULT_FORMAT);

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

  // Refs
  const editorRef = useRef(null);
  const autoSaveTimerRef = useRef(null);
  const cursorUpdateTimerRef = useRef(null);

  // ========================
  // NOTIFICATION HANDLER
  // ========================

  const showNotification = useCallback(createNotificationHandler(setSuccess, setError), []);

  // ========================
  // DOCUMENT OPERATIONS
  // ========================

  const loadDocument = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const doc = await API.fetchDocById(id, showNotification);
      if (doc) {
        setDocument(doc);
        setTitle(doc.title || '');
        setDescription(doc.description || '');
        setContent(doc.content || '');
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

        const stats = calculateTextStats(doc.content || '');
        setWordCount(stats.words);
        setCharacterCount(stats.characters);
      }
    } catch (err) {
      console.error('Failed to load document:', err);
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  const createDocument = useCallback(async (docData) => {
    setIsLoading(true);
    try {
      const newDoc = await API.createNewDoc(docData, showNotification);
      if (newDoc) {
        setDocument(newDoc);
        return newDoc;
      }
    } catch (err) {
      console.error('Failed to create document:', err);
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  const saveDocument = useCallback(async () => {
    if (!document || !document._id) {
      const docData = {
        title: title || 'Untitled Document',
        description,
        content,
        category,
        priority,
        status,
        tags,
        isPublic,
      };
      return await createDocument(docData);
    } else {
      setIsSaving(true);
      try {
        const updatedDoc = await API.updateDocInfo(
          document._id,
          { title, description, content, category, priority, status, tags, isPublic },
          showNotification,
          onSave
        );
        if (updatedDoc) {
          setDocument(updatedDoc);
        }
        return updatedDoc;
      } catch (err) {
        console.error('Failed to save document:', err);
      } finally {
        setIsSaving(false);
      }
    }
  }, [document, title, description, content, category, priority, status, tags, isPublic, createDocument, showNotification, onSave]);

  // ========================
  // CONTENT OPERATIONS
  // ========================

  const handleContentChange = useCallback((newContent) => {
    setContent(newContent);
    const stats = calculateTextStats(newContent);
    setWordCount(stats.words);
    setCharacterCount(stats.characters);
  }, []);

  const handleAddTag = useCallback((tag) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  }, [tags]);

  const handleRemoveTag = useCallback((tag) => {
    setTags(tags.filter(t => t !== tag));
  }, [tags]);

  // ========================
  // COMMENT OPERATIONS
  // ========================

  const handleAddComment = useCallback(async (commentData) => {
    if (!document?._id) return;
    const result = await API.addComment(document._id, commentData, showNotification);
    if (result) {
      setComments(result);
      setCommentText('');
      setShowCommentBox(false);
    }
  }, [document, showNotification]);

  const handleReplyToComment = useCallback(async (commentId, replyData) => {
    if (!document?._id) return;
    const result = await API.replyToComment(document._id, commentId, replyData, showNotification);
    if (result) {
      setComments(prev => prev.map(c => c._id === commentId ? result : c));
      setReplyText('');
      setReplyingTo(null);
    }
  }, [document, showNotification]);

  const handleResolveComment = useCallback(async (commentId) => {
    if (!document?._id) return;
    const result = await API.resolveComment(document._id, commentId, showNotification);
    if (result) {
      setComments(prev => prev.map(c => c._id === commentId ? result : c));
    }
  }, [document, showNotification]);

  const handleDeleteComment = useCallback(async (commentId) => {
    if (!document?._id) return;
    const result = await API.deleteComment(document._id, commentId, showNotification);
    if (result) {
      setComments(prev => prev.filter(c => c._id !== commentId));
    }
  }, [document, showNotification]);

  // ========================
  // SUGGESTION OPERATIONS
  // ========================

  const handleAddSuggestion = useCallback(async (suggestionData) => {
    if (!document?._id) return;
    const result = await API.addSuggestion(document._id, suggestionData, showNotification);
    if (result) {
      setSuggestions(result);
      setSuggestionText('');
      setSuggestionDescription('');
      setShowSuggestionBox(false);
    }
  }, [document, showNotification]);

  const handleAcceptSuggestion = useCallback(async (suggestionId) => {
    if (!document?._id) return;
    const result = await API.acceptSuggestion(document._id, suggestionId, showNotification);
    if (result) {
      setSuggestions(prev => prev.map(s => s._id === suggestionId ? result : s));
    }
  }, [document, showNotification]);

  const handleRejectSuggestion = useCallback(async (suggestionId) => {
    if (!document?._id) return;
    const result = await API.rejectSuggestion(document._id, suggestionId, showNotification);
    if (result) {
      setSuggestions(prev => prev.map(s => s._id === suggestionId ? result : s));
    }
  }, [document, showNotification]);

  // ========================
  // VERSION OPERATIONS
  // ========================

  const handleCreateVersion = useCallback(async (versionData) => {
    if (!document?._id) return;
    const result = await API.createVersionSnapshot(document._id, versionData, showNotification);
    if (result) {
      setVersions(result);
      setVersionName('');
      setVersionDescription('');
      setShowVersionModal(false);
    }
  }, [document, showNotification]);

  const handleFetchVersions = useCallback(async () => {
    if (!document?._id) return;
    const result = await API.fetchVersions(document._id, showNotification);
    if (result) {
      setVersions(result);
    }
  }, [document, showNotification]);

  const handleRestoreVersion = useCallback(async (versionNumber) => {
    if (!document?._id) return;
    const result = await API.restoreVersion(document._id, versionNumber, showNotification);
    if (result) {
      setDocument(result);
      setContent(result.content);
    }
  }, [document, showNotification]);

  // ========================
  // COLLABORATOR OPERATIONS
  // ========================

  const handleAddCollaborator = useCallback(async (collaboratorData) => {
    if (!document?._id) return;
    const result = await API.addCollaborator(document._id, collaboratorData, showNotification);
    if (result) {
      setCollaborators(result);
      setCollaboratorEmail('');
      setCollaboratorPermission('view');
      setShowCollaboratorBox(false);
    }
  }, [document, showNotification]);

  const handleUpdateCollaboratorPermission = useCallback(async (collaboratorId, permissionData) => {
    if (!document?._id) return;
    const result = await API.updateCollaboratorPermission(document._id, collaboratorId, permissionData, showNotification);
    if (result) {
      setCollaborators(result);
    }
  }, [document, showNotification]);

  const handleRemoveCollaborator = useCallback(async (collaboratorId) => {
    if (!document?._id) return;
    const result = await API.removeCollaborator(document._id, collaboratorId, showNotification);
    if (result) {
      setCollaborators(result);
    }
  }, [document, showNotification]);

  const handleFetchCollaborators = useCallback(async () => {
    if (!document?._id) return;
    const result = await API.fetchCollaborators(document._id, showNotification);
    if (result) {
      setCollaborators(result.collaborators || []);
      setCurrentEditors(result.activeEditors || []);
    }
  }, [document, showNotification]);

  // ========================
  // MEDIA OPERATIONS
  // ========================

  const handleImageUpload = useCallback(async (file, caption = '', altText = '') => {
    if (!document?._id) {
      showNotification('Please save the document first', 'error');
      return;
    }

    if (!validateFile(file, ['image/png', 'image/jpeg', 'image/gif'], 5242880, showNotification)) {
      return;
    }

    try {
      showNotification('Uploading image...');
      const cloudinaryData = await API.uploadToCloudinary(file, 'image', showNotification);

      const result = await API.addImage(document._id, {
        url: cloudinaryData.url,
        publicId: cloudinaryData.publicId,
        caption,
        altText,
        width: cloudinaryData.width,
        height: cloudinaryData.height,
        format: cloudinaryData.format,
        size: cloudinaryData.size,
      }, showNotification);

      if (result) {
        setImages(result);
      }

      return cloudinaryData;
    } catch (err) {
      console.error('Image upload failed:', err);
    }
  }, [document, showNotification]);

  const handleMultipleImageUpload = useCallback(async (files, captions = []) => {
    if (!document?._id) {
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
      console.error('Multiple image upload failed:', err);
    }
  }, [document, handleImageUpload, showNotification]);

  const handleFileUpload = useCallback(async (file, description = '') => {
    if (!document?._id) {
      showNotification('Please save the document first', 'error');
      return;
    }

    try {
      showNotification('Uploading file...');
      const cloudinaryData = await API.uploadToCloudinary(file, 'auto', showNotification);

      const mimeType = file.type || 'application/octet-stream';
      const fileType = file.name.split('.').pop() || 'unknown';

      const result = await API.addAttachment(document._id, {
        name: file.name,
        url: cloudinaryData.url,
        publicId: cloudinaryData.publicId,
        fileType,
        mimeType,
        size: cloudinaryData.size,
        description,
      }, showNotification);

      if (result) {
        setAttachments(result);
      }

      showNotification('File uploaded successfully');
      return cloudinaryData;
    } catch (err) {
      console.error('File upload failed:', err);
    }
  }, [document, showNotification]);

  const handleMultipleFileUpload = useCallback(async (files, descriptions = []) => {
    if (!document?._id) {
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
      console.error('Multiple file upload failed:', err);
    }
  }, [document, handleFileUpload, showNotification]);

  const handleVideoUpload = useCallback(async (file, caption = '') => {
    if (!document?._id) {
      showNotification('Please save the document first', 'error');
      return;
    }

    try {
      showNotification('Uploading video...');
      const cloudinaryData = await API.uploadToCloudinary(file, 'video', showNotification);

      const result = await API.addImage(document._id, {
        url: cloudinaryData.url,
        publicId: cloudinaryData.publicId,
        caption,
        altText: 'video',
        width: cloudinaryData.width,
        height: cloudinaryData.height,
        format: cloudinaryData.format,
        size: cloudinaryData.size,
      }, showNotification);

      if (result) {
        setImages(result);
      }

      showNotification('Video uploaded successfully');
      return cloudinaryData;
    } catch (err) {
      console.error('Video upload failed:', err);
    }
  }, [document, showNotification]);

  const handleDeleteImage = useCallback(async (imageId) => {
    if (!document?._id) return;
    const result = await API.deleteImage(document._id, imageId, showNotification);
    if (result) {
      setImages(prev => prev.filter(img => img._id !== imageId));
    }
  }, [document, showNotification]);

  const handleDeleteAttachment = useCallback(async (attachmentId) => {
    if (!document?._id) return;
    const result = await API.deleteAttachment(document._id, attachmentId, showNotification);
    if (result) {
      setAttachments(prev => prev.filter(att => att._id !== attachmentId));
    }
  }, [document, showNotification]);

  const handleDownloadAttachment = useCallback(async (attachmentId) => {
    if (!document?._id) return;
    await API.downloadAttachment(document._id, attachmentId, showNotification);
  }, [document, showNotification]);

  // ========================
  // CODE BLOCK OPERATIONS
  // ========================

  const handleAddCodeBlock = useCallback(async (codeBlockData) => {
    if (!document?._id) return;
    const result = await API.addCodeBlock(document._id, codeBlockData, showNotification);
    if (result) {
      setCodeBlocks(result);
    }
  }, [document, showNotification]);

  const handleUpdateCodeBlock = useCallback(async (codeBlockId, codeBlockData) => {
    if (!document?._id) return;
    const result = await API.updateCodeBlock(document._id, codeBlockId, codeBlockData, showNotification);
    if (result) {
      setCodeBlocks(prev => prev.map(cb => cb._id === codeBlockId ? result : cb));
    }
  }, [document, showNotification]);

  const handleDeleteCodeBlock = useCallback(async (codeBlockId) => {
    if (!document?._id) return;
    const result = await API.deleteCodeBlock(document._id, codeBlockId, showNotification);
    if (result) {
      setCodeBlocks(prev => prev.filter(cb => cb._id !== codeBlockId));
    }
  }, [document, showNotification]);

  const handleCopyCodeBlock = useCallback(async (codeBlockId) => {
    if (!document?._id) return;
    const result = await API.copyCodeBlock(document._id, codeBlockId, showNotification);
    if (result) {
      setCodeBlocks(prev => prev.map(cb => cb._id === codeBlockId ? { ...cb, copyCount: result.copyCount } : cb));
    }
  }, [document, showNotification]);

  // ========================
  // TABLE OPERATIONS
  // ========================

  const handleAddTable = useCallback(async (tableData) => {
    if (!document?._id) return;
    const result = await API.addTable(document._id, tableData, showNotification);
    if (result) {
      setTables(result);
    }
  }, [document, showNotification]);

  const handleUpdateTable = useCallback(async (tableId, tableData) => {
    if (!document?._id) return;
    const result = await API.updateTable(document._id, tableId, tableData, showNotification);
    if (result) {
      setTables(prev => prev.map(t => t._id === tableId ? result : t));
    }
  }, [document, showNotification]);

  const handleDeleteTable = useCallback(async (tableId) => {
    if (!document?._id) return;
    const result = await API.deleteTable(document._id, tableId, showNotification);
    if (result) {
      setTables(prev => prev.filter(t => t._id !== tableId));
    }
  }, [document, showNotification]);

  // ========================
  // DOCUMENT ACTIONS
  // ========================

  const handleExportDocument = useCallback(async (format) => {
    if (!document?._id) return;
    await API.exportDocument(document._id, format, title, showNotification);
  }, [document, title, showNotification]);

  const handleUpdateStatus = useCallback(async (newStatus) => {
    if (!document?._id) return;
    const result = await API.updateDocStatus(document._id, { status: newStatus }, showNotification);
    if (result) {
      setDocument(result);
      setStatus(result.status);
    }
  }, [document, showNotification]);

  const handleDuplicateDocument = useCallback(async (newTitle) => {
    if (!document?._id) return;
    return await API.duplicateDocument(document._id, newTitle, showNotification);
  }, [document, showNotification]);

  const handleTogglePin = useCallback(async () => {
    if (!document?._id) return;
    const result = await API.togglePin(document._id, showNotification);
    if (result) {
      setDocument(prev => ({ ...prev, pinned: result.pinned }));
    }
  }, [document, showNotification]);

  const handleToggleStar = useCallback(async () => {
    if (!document?._id) return;
    const result = await API.toggleStar(document._id, showNotification);
    if (result) {
      setDocument(prev => ({ ...prev, starred: result.starred }));
    }
  }, [document, showNotification]);

  const handleArchiveDocument = useCallback(async () => {
    if (!document?._id) return;
    const result = await API.archiveDocument(document._id, showNotification);
    if (result) {
      setDocument(prev => ({ ...prev, status: 'archived' }));
      setStatus('archived');
    }
  }, [document, showNotification]);

  const handleUnarchiveDocument = useCallback(async () => {
    if (!document?._id) return;
    const result = await API.unarchiveDocument(document._id, showNotification);
    if (result) {
      setDocument(prev => ({ ...prev, status: 'draft' }));
      setStatus('draft');
    }
  }, [document, showNotification]);

  const handleDeleteDocument = useCallback(async () => {
    if (!document?._id) return;
    return await API.deleteDocument(document._id, showNotification);
  }, [document, showNotification]);

  // ========================
  // ANALYTICS OPERATIONS
  // ========================

  const handleFetchStats = useCallback(async () => {
    if (!document?._id) return;
    return await API.getDocStats(document._id, showNotification);
  }, [document, showNotification]);

  const handleFetchAccessLogs = useCallback(async (limit = 50, skip = 0) => {
    if (!document?._id) return;
    const result = await API.fetchAccessLogs(document._id, limit, skip, showNotification);
    if (result) {
      setAccessLogs(result.logs || []);
    }
  }, [document, showNotification]);

  // ========================
  // EFFECTS
  // ========================

  // Initialize document
  useEffect(() => {
    if (docId) {
      loadDocument(docId);
    } else {
      const initializeNewDoc = async () => {
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
        await createDocument(docData);
      };
      initializeNewDoc();
    }
  }, [docId]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !document?._id) return;

    autoSaveTimerRef.current = setInterval(() => {
      saveDocument().catch(() => {
        // Silent fail for auto-save
      });
    }, AUTO_SAVE_INTERVAL);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [autoSaveEnabled, document?._id, saveDocument]);

  // Cursor position update
  useEffect(() => {
    if (!document?._id) return;

    cursorUpdateTimerRef.current = setInterval(() => {
      API.updateCursorPosition(document._id, {
        position: selectionStart,
        lineNumber: cursorPosition.line,
        columnNumber: cursorPosition.column,
      }).then((editors) => {
        if (editors) setCurrentEditors(editors);
      }).catch(() => {
        // Silent fail for cursor updates
      });
    }, CURSOR_UPDATE_INTERVAL);

    return () => {
      if (cursorUpdateTimerRef.current) {
        clearInterval(cursorUpdateTimerRef.current);
      }
    };
  }, [document?._id, selectionStart, cursorPosition]);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.textContent) {
      editorRef.current.textContent = content;
    }
  }, [content]);

  // Handle tab changes to load appropriate data
  useEffect(() => {
    if (!document?._id) return;

    switch (activeTab) {
      case 'versions':
        handleFetchVersions();
        break;
      case 'collaborators':
        handleFetchCollaborators();
        break;
      case 'analytics':
        handleFetchStats();
        handleFetchAccessLogs();
        break;
      default:
        break;
    }
  }, [activeTab, document?._id]);

  // ========================
  // RETURN ALL STATE AND HANDLERS
  // ========================

  return {
    // Document State
    document,
    content,
    title,
    description,
    category,
    priority,
    status,
    tags,
    isPublic,
    
    // UI State
    activeTab,
    isLoading,
    error,
    success,
    isSaving,
    
    // Formatting State
    selectedText,
    selectionStart,
    selectionEnd,
    textFormats,
    currentFormat,
    
    // Comment State
    comments,
    showCommentBox,
    commentText,
    replyingTo,
    replyText,
    
    // Suggestion State
    suggestions,
    showSuggestionBox,
    suggestionText,
    suggestionDescription,
    
    // Version State
    versions,
    showVersionModal,
    versionName,
    versionDescription,
    
    // Collaboration State
    collaborators,
    currentEditors,
    showCollaboratorBox,
    collaboratorEmail,
    collaboratorPermission,
    
    // UI State
    showColorPicker,
    showBgColorPicker,
    showSidebar,
    
    // Media State
    images,
    attachments,
    tables,
    codeBlocks,
    
    // Analytics State
    accessLogs,
    viewCount,
    
    // Cursor State
    cursorPosition,
    autoSaveEnabled,
    wordCount,
    characterCount,
    
    // Refs
    editorRef,
    
    // Setters
    setContent,
    setTitle,
    setDescription,
    setCategory,
    setPriority,
    setStatus,
    setTags,
    setIsPublic,
    setActiveTab,
    setShowCommentBox,
    setCommentText,
    setReplyingTo,
    setReplyText,
    setShowSuggestionBox,
    setSuggestionText,
    setSuggestionDescription,
    setShowVersionModal,
    setVersionName,
    setVersionDescription,
    setShowCollaboratorBox,
    setCollaboratorEmail,
    setCollaboratorPermission,
    setShowColorPicker,
    setShowBgColorPicker,
    setShowSidebar,
    setCursorPosition,
    setAutoSaveEnabled,
    setCurrentFormat,
    setTextFormats,
    setSelectedText,
    setSelectionStart,
    setSelectionEnd,
    setDocument,
    setComments,
    setSuggestions,
    setVersions,
    setCollaborators,
    setCurrentEditors,
    setImages,
    setAttachments,
    setTables,
    setCodeBlocks,
    setAccessLogs,
    
    // Handlers
    loadDocument,
    createDocument,
    saveDocument,
    handleContentChange,
    handleAddTag,
    handleRemoveTag,
    handleAddComment,
    handleReplyToComment,
    handleResolveComment,
    handleDeleteComment,
    handleAddSuggestion,
    handleAcceptSuggestion,
    handleRejectSuggestion,
    handleCreateVersion,
    handleFetchVersions,
    handleRestoreVersion,
    handleAddCollaborator,
    handleUpdateCollaboratorPermission,
    handleRemoveCollaborator,
    handleFetchCollaborators,
    handleImageUpload,
    handleMultipleImageUpload,
    handleFileUpload,
    handleMultipleFileUpload,
    handleVideoUpload,
    handleDeleteImage,
    handleDeleteAttachment,
    handleDownloadAttachment,
    handleAddCodeBlock,
    handleUpdateCodeBlock,
    handleDeleteCodeBlock,
    handleCopyCodeBlock,
    handleAddTable,
    handleUpdateTable,
    handleDeleteTable,
    handleExportDocument,
    handleUpdateStatus,
    handleDuplicateDocument,
    handleTogglePin,
    handleToggleStar,
    handleArchiveDocument,
    handleUnarchiveDocument,
    handleDeleteDocument,
    handleFetchStats,
    handleFetchAccessLogs,
    showNotification,
  };
};