"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  FileText,
  Sparkles,
  Clock,
  Eye,
  Code,
  Type,
  List,
  Link2,
  Calendar,
  Hash,
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
  Copy,
  BarChart3,
  RefreshCw,
  Download,
  Menu,
  X,
} from "lucide-react";

const DocComponent = () => {
  // State Management
  const [content, setContent] = useState("");
  const [contentId, setContentId] = useState(null);
  const [styledHTML, setStyledHTML] = useState("");
  const [structuredStyle, setStructuredStyle] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [allContents, setAllContents] = useState([]);
  const [statistics, setStatistics] = useState(null);

  // UI State
  const [saveStatus, setSaveStatus] = useState("saved"); // 'saving', 'saved', 'error'
  const [lastSaved, setLastSaved] = useState(null);
  const [viewMode, setViewMode] = useState("editor"); // 'editor', 'preview', 'split'
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState("documents"); // 'documents', 'statistics'
  const [notification, setNotification] = useState(null);

  // Refs
  const autoSaveTimerRef = useRef(null);
  const editorRef = useRef(null);

  // API Base Configuration
  const BASE_URL = "http://localhost:5000/api/v1/doc";

  // Get credentials from localStorage
  const getCredentials = () => {
    const projectId = localStorage.getItem("currentProjectId");
    const testTypeId = localStorage.getItem("selectedTestTypeId");
    const token = localStorage.getItem("token");
    return { projectId, testTypeId, token };
  };

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch all documents
  const fetchDocuments = useCallback(async () => {
    const { projectId, testTypeId, token } = getCredentials();
    if (!projectId || !testTypeId || !token) return;

    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/content`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAllContents(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  }, []);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    const { projectId, testTypeId, token } = getCredentials();
    if (!projectId || !testTypeId || !token) return;

    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/content/statistics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStatistics(data.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  }, []);

  // Auto-save function
  const autoSave = useCallback(async (text) => {
    const { projectId, testTypeId, token } = getCredentials();
    if (!projectId || !testTypeId || !token || !text.trim()) return;

    setSaveStatus("saving");

    try {
      let response;
      const userId = localStorage.getItem("userId");

      if (contentId) {
        // Update existing content
        response = await fetch(
          `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/content/${contentId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ rawText: text }),
          }
        );
      } else {
        // Create new content
        response = await fetch(
          `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/content`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ rawText: text, userId }),
          }
        );
      }

      if (response.ok) {
        const result = await response.json();
        setContentId(result.data.id);
        setStyledHTML(result.data.styledHTML);
        setStructuredStyle(result.data.structuredStyle);
        setMetadata(result.data.metadata);
        setSaveStatus("saved");
        setLastSaved(new Date());
        fetchDocuments();
        fetchStatistics();
      } else {
        setSaveStatus("error");
        showNotification("Failed to save document", "error");
      }
    } catch (error) {
      console.error("Auto-save error:", error);
      setSaveStatus("error");
      showNotification("Save error occurred", "error");
    }
  }, [contentId, fetchDocuments, fetchStatistics]);

  // Handle content change with debounce
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    setSaveStatus("editing");

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer for 3 seconds
    autoSaveTimerRef.current = setTimeout(() => {
      autoSave(newContent);
    }, 3000);
  };

  // Load specific document
  const loadDocument = async (docId) => {
    const { projectId, testTypeId, token } = getCredentials();
    if (!projectId || !testTypeId || !token) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/content/${docId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        const doc = result.data;
        setContentId(doc._id);
        setContent(doc.rawText);
        setStyledHTML(doc.styledHTML);
        setStructuredStyle(doc.structuredStyle);
        setMetadata(doc.metadata);
        setSaveStatus("saved");
        setLastSaved(new Date(doc.updatedAt));
        showNotification("Document loaded successfully");
      }
    } catch (error) {
      console.error("Error loading document:", error);
      showNotification("Failed to load document", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete document
  const deleteDocument = async (docId) => {
    const { projectId, testTypeId, token } = getCredentials();
    if (!projectId || !testTypeId || !token) return;

    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/content/${docId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        showNotification("Document deleted successfully");
        fetchDocuments();
        fetchStatistics();
        if (contentId === docId) {
          createNewDocument();
        }
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      showNotification("Failed to delete document", "error");
    }
  };

  // Duplicate document
  const duplicateDocument = async (docId) => {
    const { projectId, testTypeId, token } = getCredentials();
    if (!projectId || !testTypeId || !token) return;

    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/content/${docId}/duplicate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      );

      if (response.ok) {
        showNotification("Document duplicated successfully");
        fetchDocuments();
      }
    } catch (error) {
      console.error("Error duplicating document:", error);
      showNotification("Failed to duplicate document", "error");
    }
  };

  // Create new document
  const createNewDocument = () => {
    setContentId(null);
    setContent("");
    setStyledHTML("");
    setStructuredStyle(null);
    setMetadata(null);
    setSaveStatus("saved");
    setLastSaved(null);
    showNotification("New document created");
  };

  // Initial load
  useEffect(() => {
    fetchDocuments();
    fetchStatistics();
  }, [fetchDocuments, fetchStatistics]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Get status icon
  const getStatusIcon = () => {
    switch (saveStatus) {
      case "saving":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case "saved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return "Never";
    const now = new Date();
    const diff = Math.floor((now - lastSaved) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return lastSaved.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 mt-15">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50"
          >
            <div
              className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
                notification.type === "error"
                  ? "bg-red-500 text-white"
                  : "bg-green-500 text-white"
              }`}
            >
              {notification.type === "error" ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">AI Document Editor</h1>
                  <p className="text-sm text-gray-500">Intelligent styling powered by AI</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Save Status */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                {getStatusIcon()}
                <span className="text-sm font-medium text-gray-700">
                  {saveStatus === "saving"
                    ? "Saving..."
                    : saveStatus === "saved"
                    ? "Saved"
                    : saveStatus === "error"
                    ? "Error"
                    : "Editing"}
                </span>
                <span className="text-xs text-gray-500">• {formatLastSaved()}</span>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("editor")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === "editor"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Type className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("split")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === "split"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Code className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("preview")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === "preview"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* New Document */}
              <button
                onClick={createNewDocument}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                New Document
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="w-80 bg-white border-r border-gray-200 h-[calc(100vh-73px)] overflow-y-auto"
            >
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("documents")}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === "documents"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Documents
                </button>
                <button
                  onClick={() => setActiveTab("statistics")}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === "statistics"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  Stats
                </button>
              </div>

              {/* Documents List */}
              {activeTab === "documents" && (
                <div className="p-4 space-y-2">
                  {allContents.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No documents yet</p>
                      <p className="text-xs mt-1">Start typing to create one</p>
                    </div>
                  ) : (
                    allContents.map((doc) => (
                      <motion.div
                        key={doc._id}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          contentId === doc._id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div onClick={() => loadDocument(doc._id)}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                                {doc.rawText.substring(0, 50) || "Untitled Document"}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">
                                {doc.metadata?.wordCount || 0} words • {doc.contentType}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {doc.rawText.substring(0, 100)}...
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  duplicateDocument(doc._id);
                                }}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteDocument(doc._id);
                                }}
                                className="p-1 hover:bg-red-100 hover:text-red-600 rounded"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* Statistics */}
              {activeTab === "statistics" && statistics && (
                <div className="p-4 space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {statistics.totalContent}
                    </h3>
                    <p className="text-sm text-gray-600">Total Documents</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 text-sm">Content Types</h4>
                    {statistics.contentByType?.map((type) => (
                      <div key={type.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700 capitalize">{type.type}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{type.count}</span>
                          <span className="text-xs text-gray-500">{type.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 text-sm">Word Statistics</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-xs text-gray-600">Average</p>
                        <p className="text-lg font-bold text-green-600">
                          {statistics.wordStatistics?.average || 0}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-gray-600">Total</p>
                        <p className="text-lg font-bold text-blue-600">
                          {statistics.wordStatistics?.total || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Editor Area */}
        <main className="flex-1 h-[calc(100vh-73px)] overflow-hidden">
          <div className="h-full flex">
            {/* Editor */}
            {(viewMode === "editor" || viewMode === "split") && (
              <div className={`${viewMode === "split" ? "w-1/2" : "w-full"} h-full overflow-y-auto p-8`}>
                <div className="max-w-4xl mx-auto">
                  <textarea
                    ref={editorRef}
                    value={content}
                    onChange={handleContentChange}
                    placeholder="Start typing your document... AI will automatically style it for you."
                    className="w-full min-h-[600px] p-6 bg-white rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none resize-none font-mono text-gray-800 leading-relaxed shadow-sm transition-all"
                    style={{ fontSize: "15px" }}
                  />

                  {/* Metadata Display */}
                  {metadata && (
                    <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Document Metadata
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Type className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{metadata.wordCount} words</span>
                        </div>
                        {metadata.hasLinks && (
                          <div className="flex items-center gap-2 text-sm">
                            <Link2 className="w-4 h-4 text-blue-500" />
                            <span className="text-gray-600">Has links</span>
                          </div>
                        )}
                        {metadata.hasNumbers && (
                          <div className="flex items-center gap-2 text-sm">
                            <Hash className="w-4 h-4 text-green-500" />
                            <span className="text-gray-600">Has numbers</span>
                          </div>
                        )}
                        {metadata.hasDates && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-purple-500" />
                            <span className="text-gray-600">Has dates</span>
                          </div>
                        )}
                        {metadata.language && (
                          <div className="flex items-center gap-2 text-sm">
                            <Code className="w-4 h-4 text-orange-500" />
                            <span className="text-gray-600">{metadata.language}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Preview */}
            {(viewMode === "preview" || viewMode === "split") && (
              <div
                className={`${
                  viewMode === "split" ? "w-1/2 border-l border-gray-200" : "w-full"
                } h-full overflow-y-auto p-8 bg-gray-50`}
              >
                <div className="max-w-4xl mx-auto">
                  {styledHTML ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl shadow-lg p-8"
                      dangerouslySetInnerHTML={{ __html: styledHTML }}
                    />
                  ) : (
                    <div className="text-center py-20 text-gray-400">
                      <Eye className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p className="text-lg">Preview will appear here</p>
                      <p className="text-sm mt-2">Start typing to see AI-styled content</p>
                    </div>
                  )}

                  {/* Style Information */}
                  {structuredStyle && (
                    <div className="mt-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        AI Detected Elements
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {structuredStyle.detectedElements?.map((element, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm border border-gray-200"
                          >
                            {element}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Content Type:</span>{" "}
                          <span className="capitalize">{structuredStyle.contentType}</span>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-semibold">Theme:</span>{" "}
                          <span className="capitalize">{structuredStyle.theme}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            <p className="text-gray-700 font-medium">Loading document...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocComponent;