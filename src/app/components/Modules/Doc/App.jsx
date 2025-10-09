'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Users,
  MessageSquare,
  Clock,
  Share2,
  Download,
  Image as ImageIcon,
  Paperclip,
  Table,
  Code,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  Eye,
  Edit3,
  CheckCircle,
  XCircle,
  Copy,
  Trash2,
  Plus,
  Send,
  MoreVertical,
  FileText,
  Settings,
  ChevronDown,
  AlertCircle,
  Loader2
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/v1/test-data';

const DocEditor = () => {
  const [projectId] = useState(localStorage.getItem('currentProjectId'));
  const [testTypeId] = useState(localStorage.getItem('selectedTestTypeId'));
  const [token] = useState(localStorage.getItem('token'));
  const [docId, setDocId] = useState(null);

  // Document state
  const [title, setTitle] = useState('Untitled Document');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [isPublic, setIsPublic] = useState(false);
  const [version, setVersion] = useState(1);
  
  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [activeEditors, setActiveEditors] = useState([]);
  const [comments, setComments] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [editHistory, setEditHistory] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  
  // Selection state
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [selectedText, setSelectedText] = useState('');
  
  // Media state
  const [images, setImages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [tables, setTables] = useState([]);
  const [codeBlocks, setCodeBlocks] = useState([]);
  
  // Refs
  const contentRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const presenceIntervalRef = useRef(null);

  // Headers for API calls
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // Fetch document
  const fetchDocument = async (id) => {
    try {
      const res = await fetch(
        `${API_BASE}/project/${projectId}/test-type/${testTypeId}/${id}`,
        { headers }
      );
      const data = await res.json();
      if (data.success) {
        const doc = data.data;
        setTitle(doc.title);
        setContent(doc.content);
        setTags(doc.tags);
        setIsPublic(doc.isPublic);
        setVersion(doc.version);
        setComments(doc.comments || []);
        setSuggestions(doc.suggestions || []);
        setImages(doc.images || []);
        setAttachments(doc.attachments || []);
        setTables(doc.tables || []);
        setCodeBlocks(doc.codeBlocks || []);
        setCollaborators(doc.collaborators || []);
        setLastSaved(new Date(doc.updatedAt));
      }
    } catch (error) {
      console.error('Error fetching document:', error);
    }
  };

  // Create new document
  const createDocument = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/project/${projectId}/test-type/${testTypeId}`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title: 'Untitled Document',
            content: '',
            tags: [],
            isPublic: false
          })
        }
      );
      const data = await res.json();
      if (data.success) {
        setDocId(data.data._id);
        return data.data._id;
      }
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  // Auto-save functionality
  const saveDocument = useCallback(async () => {
    if (!docId) return;
    
    setIsSaving(true);
    try {
      const res = await fetch(
        `${API_BASE}/project/${projectId}/test-type/${testTypeId}/${docId}`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            title,
            content,
            tags,
            isPublic,
            cursorPosition: selection.start
          })
        }
      );
      const data = await res.json();
      if (data.success) {
        setLastSaved(new Date());
        setVersion(data.data.version);
      }
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setIsSaving(false);
    }
  }, [docId, title, content, tags, isPublic, selection, projectId, testTypeId]);

  // Debounced auto-save
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (docId) {
        saveDocument();
      }
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, title, docId, saveDocument]);

  // Update presence (heartbeat)
  const updatePresence = useCallback(async () => {
    if (!docId) return;
    
    try {
      await fetch(
        `${API_BASE}/project/${projectId}/test-type/${testTypeId}/${docId}/presence`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            cursorPosition: selection.start,
            selection: { start: selection.start, end: selection.end }
          })
        }
      );
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }, [docId, selection, projectId, testTypeId]);

  // Fetch active editors
  const fetchActiveEditors = useCallback(async () => {
    if (!docId) return;
    
    try {
      const res = await fetch(
        `${API_BASE}/project/${projectId}/test-type/${testTypeId}/${docId}/editors`,
        { headers }
      );
      const data = await res.json();
      if (data.success) {
        setActiveEditors(data.data);
      }
    } catch (error) {
      console.error('Error fetching editors:', error);
    }
  }, [docId, projectId, testTypeId]);

  // Initialize document
  useEffect(() => {
    const initDoc = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');
      
      if (id) {
        setDocId(id);
        await fetchDocument(id);
      } else {
        const newId = await createDocument();
        if (newId) {
          window.history.pushState({}, '', `?id=${newId}`);
        }
      }
    };
    
    initDoc();
  }, []);

  // Presence interval
  useEffect(() => {
    if (docId) {
      presenceIntervalRef.current = setInterval(() => {
        updatePresence();
        fetchActiveEditors();
      }, 5000);
    }

    return () => {
      if (presenceIntervalRef.current) {
        clearInterval(presenceIntervalRef.current);
      }
    };
  }, [docId, updatePresence, fetchActiveEditors]);

  // Text formatting
  const formatText = async (format) => {
    if (selection.start === selection.end) return;

    try {
      await fetch(
        `${API_BASE}/project/${projectId}/test-type/${testTypeId}/${docId}/format`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            format,
            selectionStart: selection.start,
            selectionEnd: selection.end
          })
        }
      );
    } catch (error) {
      console.error('Error formatting text:', error);
    }
  };

  // Add comment
  const addComment = async () => {
    if (!commentText.trim() || selection.start === selection.end) return;

    try {
      const res = await fetch(
        `${API_BASE}/project/${projectId}/test-type/${testTypeId}/${docId}/comments`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            text: commentText,
            selectionStart: selection.start,
            selectionEnd: selection.end
          })
        }
      );
      const data = await res.json();
      if (data.success) {
        setComments(data.data.testData.comments);
        setCommentText('');
        setShowComments(true);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Toggle comment resolution
  const toggleCommentResolution = async (commentId) => {
    try {
      const res = await fetch(
        `${API_BASE}/project/${projectId}/test-type/${testTypeId}/${docId}/comments/${commentId}/toggle-resolve`,
        {
          method: 'PATCH',
          headers
        }
      );
      const data = await res.json();
      if (data.success) {
        setComments(data.data.testData.comments);
      }
    } catch (error) {
      console.error('Error toggling comment:', error);
    }
  };

  // Add suggestion
  const addSuggestion = async () => {
    if (selection.start === selection.end) return;

    const originalText = content.substring(selection.start, selection.end);
    const suggestedText = prompt('Enter suggested text:', originalText);
    
    if (!suggestedText) return;

    try {
      const res = await fetch(
        `${API_BASE}/project/${projectId}/test-type/${testTypeId}/${docId}/suggestions`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            originalText,
            suggestedText,
            selectionStart: selection.start,
            selectionEnd: selection.end
          })
        }
      );
      const data = await res.json();
      if (data.success) {
        setSuggestions(data.data.testData.suggestions);
      }
    } catch (error) {
      console.error('Error adding suggestion:', error);
    }
  };

  // Handle suggestion
  const handleSuggestion = async (suggestionId, action) => {
    try {
      const res = await fetch(
        `${API_BASE}/project/${projectId}/test-type/${testTypeId}/${docId}/suggestions/${suggestionId}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ action })
        }
      );
      const data = await res.json();
      if (data.success) {
        setSuggestions(data.data.testData.suggestions);
        if (action === 'accept') {
          setContent(data.data.testData.content);
        }
      }
    } catch (error) {
      console.error('Error handling suggestion:', error);
    }
  };

  // Create version snapshot
  const createSnapshot = async () => {
    const versionName = prompt('Version name:');
    if (!versionName) return;

    try {
      await fetch(
        `${API_BASE}/project/${projectId}/test-type/${testTypeId}/${docId}/snapshots`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ versionName, description: '' })
        }
      );
      alert('Version snapshot created!');
    } catch (error) {
      console.error('Error creating snapshot:', error);
    }
  };

  // Upload image
  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(
        `${API_BASE}/project/${projectId}/test-type/${testTypeId}/${docId}/images`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        }
      );
      const data = await res.json();
      if (data.success) {
        setImages(data.data.testData.images);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  // Upload attachment
  const uploadAttachment = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(
        `${API_BASE}/project/${projectId}/test-type/${testTypeId}/${docId}/attachments`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        }
      );
      const data = await res.json();
      if (data.success) {
        setAttachments(data.data.testData.attachments);
      }
    } catch (error) {
      console.error('Error uploading attachment:', error);
    }
  };

  // Add table
  const addTable = async () => {
    const cols = parseInt(prompt('Number of columns:', '3'));
    const rows = parseInt(prompt('Number of rows:', '3'));
    
    if (!cols || !rows) return;

    const headers = Array(cols).fill('').map((_, i) => `Column ${i + 1}`);
    const tableRows = Array(rows).fill(null).map(() => Array(cols).fill(''));

    try {
      const res = await fetch(
        `${API_BASE}/project/${projectId}/test-type/${testTypeId}/${docId}/tables`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ title: 'New Table', headers, rows: tableRows })
        }
      );
      const data = await res.json();
      if (data.success) {
        setTables(data.data.testData.tables);
      }
    } catch (error) {
      console.error('Error adding table:', error);
    }
  };

  // Add code block
  const addCodeBlock = async () => {
    const language = prompt('Programming language:', 'javascript');
    const code = prompt('Enter code:');
    
    if (!code) return;

    try {
      const res = await fetch(
        `${API_BASE}/project/${projectId}/test-type/${testTypeId}/${docId}/code-blocks`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ language, code, title: 'Code Snippet' })
        }
      );
      const data = await res.json();
      if (data.success) {
        setCodeBlocks(data.data.testData.codeBlocks);
      }
    } catch (error) {
      console.error('Error adding code block:', error);
    }
  };

  // Duplicate document
  const duplicateDoc = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/project/${projectId}/test-type/${testTypeId}/${docId}/duplicate`,
        {
          method: 'POST',
          headers
        }
      );
      const data = await res.json();
      if (data.success) {
        window.open(`?id=${data.data._id}`, '_blank');
      }
    } catch (error) {
      console.error('Error duplicating document:', error);
    }
  };

  // Export document
  const exportDoc = async (format) => {
    try {
      const res = await fetch(
        `${API_BASE}/project/${projectId}/test-type/${testTypeId}/${docId}/export?format=${format}`,
        { headers }
      );
      const data = await res.json();
      alert(`Export as ${format.toUpperCase()} - Feature implementation pending`);
    } catch (error) {
      console.error('Error exporting document:', error);
    }
  };

  // Fetch edit history
  const fetchHistory = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/project/${projectId}/test-type/${testTypeId}/${docId}/history`,
        { headers }
      );
      const data = await res.json();
      if (data.success) {
        setEditHistory(data.data);
        setShowHistory(true);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  // Handle text selection
  const handleTextSelect = () => {
    const textarea = contentRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      setSelection({ start, end });
      setSelectedText(content.substring(start, end));
      
      if (start !== end) {
        setShowFormatMenu(true);
      } else {
        setShowFormatMenu(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          {/* Title row */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3 flex-1">
              <FileText className="w-6 h-6 text-blue-600" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-medium border-none outline-none focus:ring-0 bg-transparent"
                placeholder="Untitled Document"
              />
              {isSaving && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
              {lastSaved && !isSaving && (
                <span className="text-xs text-gray-500">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Active editors */}
              <div className="flex items-center gap-1">
                {activeEditors.slice(0, 3).map((editor, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium"
                    title={editor.user?.name}
                  >
                    {editor.user?.name?.charAt(0)}
                  </div>
                ))}
                {activeEditors.length > 3 && (
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                    +{activeEditors.length - 3}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowShare(!showShare)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>

          {/* Tools row */}
          <div className="flex items-center gap-1 pb-2 overflow-x-auto">
            <button
              onClick={() => formatText('bold')}
              className="p-1.5 hover:bg-gray-100 rounded"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('italic')}
              className="p-1.5 hover:bg-gray-100 rounded"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('underline')}
              className="p-1.5 hover:bg-gray-100 rounded"
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('strikethrough')}
              className="p-1.5 hover:bg-gray-100 rounded"
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('highlight')}
              className="p-1.5 hover:bg-gray-100 rounded"
              title="Highlight"
            >
              <Highlighter className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            <label className="p-1.5 hover:bg-gray-100 rounded cursor-pointer" title="Insert Image">
              <ImageIcon className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={uploadImage} className="hidden" />
            </label>
            <label className="p-1.5 hover:bg-gray-100 rounded cursor-pointer" title="Attach File">
              <Paperclip className="w-4 h-4" />
              <input type="file" onChange={uploadAttachment} className="hidden" />
            </label>
            <button onClick={addTable} className="p-1.5 hover:bg-gray-100 rounded" title="Insert Table">
              <Table className="w-4 h-4" />
            </button>
            <button onClick={addCodeBlock} className="p-1.5 hover:bg-gray-100 rounded" title="Insert Code">
              <Code className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            <button
              onClick={addComment}
              disabled={selection.start === selection.end}
              className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-50"
              title="Add Comment"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              onClick={addSuggestion}
              disabled={selection.start === selection.end}
              className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-50"
              title="Suggest Edit"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            <button onClick={createSnapshot} className="p-1.5 hover:bg-gray-100 rounded" title="Create Version">
              <Clock className="w-4 h-4" />
            </button>
            <button onClick={fetchHistory} className="p-1.5 hover:bg-gray-100 rounded" title="View History">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={duplicateDoc} className="p-1.5 hover:bg-gray-100 rounded" title="Duplicate">
              <Copy className="w-4 h-4" />
            </button>

            <div className="relative group">
              <button className="p-1.5 hover:bg-gray-100 rounded" title="Export">
                <Download className="w-4 h-4" />
              </button>
              <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-lg py-1 hidden group-hover:block">
                <button onClick={() => exportDoc('pdf')} className="px-4 py-2 hover:bg-gray-100 w-full text-left text-sm">
                  Export as PDF
                </button>
                <button onClick={() => exportDoc('docx')} className="px-4 py-2 hover:bg-gray-100 w-full text-left text-sm">
                  Export as DOCX
                </button>
                <button onClick={() => exportDoc('html')} className="px-4 py-2 hover:bg-gray-100 w-full text-left text-sm">
                  Export as HTML
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6">
        {/* Editor */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-8">
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onSelect={handleTextSelect}
            className="w-full min-h-[calc(100vh-300px)] border-none outline-none resize-none text-sm leading-relaxed"
            placeholder="Start writing..."
          />

          {/* Images */}
          {images.length > 0 && (
            <div className="mt-6 space-y-4">
              {images.map((img) => (
                <div key={img._id} className="relative group">
                  <img src={img.url} alt={img.caption} className="max-w-full rounded-lg" />
                  {img.caption && <p className="text-sm text-gray-600 mt-2">{img.caption}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Tables */}
          {tables.length > 0 && (
            <div className="mt-6 space-y-4">
              {tables.map((table) => (
                <div key={table._id} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <h4 className="text-sm font-medium">{table.title}</h4>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        {table.headers.map((h, i) => (
                          <th key={i} className="px-4 py-2 text-left border-b">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, i) => (
                        <tr key={i} className="border-b">
                          {row.map((cell, j) => (
                            <td key={j} className="px-4 py-2">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          {/* Code Blocks */}
          {codeBlocks.length > 0 && (
            <div className="mt-6 space-y-4">
              {codeBlocks.map((block) => (
                <div key={block._id} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-900 text-gray-300 px-4 py-2 text-xs">
                    {block.language}
                  </div>
                  <pre className="bg-gray-50 p-4 overflow-x-auto text-xs">
                    <code>{block.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          )}

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Attachments</h4>
              {attachments.map((att) => (
                <a
                  key={att._id}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <Paperclip className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{att.name}</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {(att.size / 1024).toFixed(1)} KB
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 space-y-4">
          {/* Comments */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Comments ({comments.filter(c => !c.resolved).length})
              </h3>
            </div>

            {selection.start !== selection.end && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-2">Selected: "{selectedText.substring(0, 50)}..."</p>
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 text-sm border rounded-lg mb-2"
                />
                <button
                  onClick={addComment}
                  className="w-full px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  Comment
                </button>
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {comments.filter(c => !c.resolved).map((comment) => (
                <div key={comment._id} className="p-3 bg-gray-50 rounded-lg text-xs">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                        {comment.user?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{comment.user?.name || 'User'}</p>
                        <p className="text-gray-500">{new Date(comment.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleCommentResolution(comment._id)}
                      className="text-green-600 hover:text-green-700"
                      title="Resolve"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-gray-700 mb-2">{comment.text}</p>
                  {comment.selectionStart !== null && (
                    <p className="text-gray-500 italic">
                      "{content.substring(comment.selectionStart, comment.selectionEnd).substring(0, 30)}..."
                    </p>
                  )}
                </div>
              ))}
            </div>

            {comments.filter(c => c.resolved).length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
                >
                  <ChevronDown className={`w-3 h-3 transition-transform ${showComments ? 'rotate-180' : ''}`} />
                  {comments.filter(c => c.resolved).length} resolved
                </button>
                {showComments && (
                  <div className="mt-2 space-y-2">
                    {comments.filter(c => c.resolved).map((comment) => (
                      <div key={comment._id} className="p-2 bg-green-50 rounded-lg text-xs opacity-60">
                        <p className="font-medium">{comment.user?.name}</p>
                        <p className="text-gray-700">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Suggestions */}
          {suggestions.filter(s => s.status === 'pending').length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
                <Edit3 className="w-4 h-4" />
                Suggestions ({suggestions.filter(s => s.status === 'pending').length})
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {suggestions.filter(s => s.status === 'pending').map((suggestion) => (
                  <div key={suggestion._id} className="p-3 bg-amber-50 rounded-lg text-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">
                        {suggestion.suggestedBy?.name?.charAt(0)}
                      </div>
                      <p className="font-medium">{suggestion.suggestedBy?.name}</p>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-gray-500 mb-1">Original:</p>
                        <p className="text-gray-700 line-through">{suggestion.originalText}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Suggested:</p>
                        <p className="text-green-700 font-medium">{suggestion.suggestedText}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleSuggestion(suggestion._id, 'accept')}
                        className="flex-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleSuggestion(suggestion._id, 'reject')}
                        className="flex-1 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document Info */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-sm font-semibold mb-3">Document Info</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Version:</span>
                <span className="font-medium">{version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Words:</span>
                <span className="font-medium">{content.split(/\s+/).filter(w => w).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Characters:</span>
                <span className="font-medium">{content.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${isPublic ? 'text-green-600' : 'text-gray-600'}`}>
                  {isPublic ? 'Public' : 'Private'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded"
                />
                <span>Make document public</span>
              </label>
            </div>

            {/* Tags */}
            <div className="mt-4">
              <p className="text-xs text-gray-600 mb-2">Tags</p>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
                <button
                  onClick={() => {
                    const newTag = prompt('Add tag:');
                    if (newTag) setTags([...tags, newTag]);
                  }}
                  className="px-2 py-1 border border-dashed border-gray-300 rounded text-xs hover:border-gray-400"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>

          {/* Collaborators */}
          {collaborators.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-semibold mb-3">Collaborators</h3>
              <div className="space-y-2">
                {collaborators.map((collab) => (
                  <div key={collab._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">
                        {collab.user?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-medium">{collab.user?.name}</p>
                        <p className="text-xs text-gray-500">{collab.permission}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShare && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowShare(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold mb-4">Share Document</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Add collaborator</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="User ID"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    id="collaborator-input"
                  />
                  <select className="px-3 py-2 border rounded-lg text-sm" id="permission-select">
                    <option value="view">View</option>
                    <option value="comment">Comment</option>
                    <option value="edit">Edit</option>
                  </select>
                </div>
                <button
                  onClick={async () => {
                    const userId = document.getElementById('collaborator-input').value;
                    const permission = document.getElementById('permission-select').value;
                    if (!userId) return;

                    try {
                      const res = await fetch(
                        `${API_BASE}/project/${projectId}/test-type/${testTypeId}/${docId}/collaborators`,
                        {
                          method: 'POST',
                          headers,
                          body: JSON.stringify({ userId, permission })
                        }
                      );
                      const data = await res.json();
                      if (data.success) {
                        setCollaborators(data.data.testData.collaborators);
                        document.getElementById('collaborator-input').value = '';
                      }
                    } catch (error) {
                      console.error('Error adding collaborator:', error);
                    }
                  }}
                  className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  Add Collaborator
                </button>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-2">Current Collaborators</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {collaborators.map((collab) => (
                    <div key={collab._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">{collab.user?.name}</p>
                        <p className="text-xs text-gray-500">{collab.permission}</p>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await fetch(
                              `${API_BASE}/project/${projectId}/test-type/${testTypeId}/${docId}/collaborators/${collab._id}`,
                              {
                                method: 'DELETE',
                                headers
                              }
                            );
                            setCollaborators(collaborators.filter(c => c._id !== collab._id));
                          } catch (error) {
                            console.error('Error removing collaborator:', error);
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowShare(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold mb-4">Edit History</h2>
              
              <div className="space-y-3">
                {editHistory.map((entry, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 text-white flex items-center justify-center text-xs">
                        {entry.editedBy?.name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">{entry.editedBy?.name || 'User'}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700">{entry.changes}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowHistory(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Format Menu (appears when text is selected) */}
      <AnimatePresence>
        {showFormatMenu && selection.start !== selection.end && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-2 flex items-center gap-1 z-50 border"
          >
            <button
              onClick={() => formatText('bold')}
              className="p-2 hover:bg-gray-100 rounded"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('italic')}
              className="p-2 hover:bg-gray-100 rounded"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('underline')}
              className="p-2 hover:bg-gray-100 rounded"
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-300" />
            <button
              onClick={addComment}
              className="p-2 hover:bg-gray-100 rounded"
              title="Comment"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              onClick={addSuggestion}
              className="p-2 hover:bg-gray-100 rounded"
              title="Suggest"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saving indicator */}
      <AnimatePresence>
        {isSaving && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Saving...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocEditor;