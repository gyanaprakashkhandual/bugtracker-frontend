'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Search, Filter, Star, Pin, Archive,
  Edit, Trash2, Download, Share2, Users, MessageSquare,
  Code, Table, Image, Paperclip, Clock,
  ChevronDown, ChevronRight, X, Check, Eye, Copy,
  MoreVertical, Settings, Save, Send, History, Upload,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  List, Link, Quote, Sparkles, Loader, Menu, LogOut
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api/v1';

// Utility function to get token
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// API helper
const apiCall = async (endpoint, options = {}) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API call failed');
  }

  return response.json();
};

// Main App Component
export default function DocManagementSystem() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [testTypes, setTestTypes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTestType, setSelectedTestType] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [view, setView] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showDocEditor, setShowDocEditor] = useState(false);
  const [filter, setFilter] = useState({ status: 'all', category: 'all', priority: 'all' });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchTestTypes(selectedProject._id);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject && selectedTestType) {
      fetchDocuments(selectedProject._id, selectedTestType._id);
    }
  }, [selectedProject, selectedTestType]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/project/');
      setProjects(data.projects || []);
      if (data.projects?.length > 0) {
        setSelectedProject(data.projects[0]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestTypes = async (projectId) => {
    try {
      setLoading(true);
      const data = await apiCall(`/test-type/accessible-test-types`);
      setTestTypes(data.testTypes || []);
      if (data.testTypes?.length > 0) {
        setSelectedTestType(data.testTypes[0]);
      }
    } catch (error) {
      console.error('Error fetching test types:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (projectId, testTypeId) => {
    try {
      setLoading(true);
      const data = await apiCall(`/doc/projects/${projectId}/test-types/${testTypeId}/docs`);
      setDocuments(data.docs || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (docData) => {
    try {
      const data = await apiCall(
        `/doc/projects/${selectedProject._id}/test-types/${selectedTestType._id}/docs`,
        {
          method: 'POST',
          body: JSON.stringify(docData),
        }
      );
      fetchDocuments(selectedProject._id, selectedTestType._id);
      return data.doc;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filter.status === 'all' || doc.status === filter.status;
    const matchesCategory = filter.category === 'all' || doc.category === filter.category;
    const matchesPriority = filter.priority === 'all' || doc.priority === filter.priority;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-slate-800">DocuFlow</h1>
                <p className="text-xs text-slate-500">Documentation System</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm bg-slate-100 border-0 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => {
                setSelectedDoc(null);
                setShowDocEditor(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              New Doc
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="w-72 bg-white border-r border-slate-200 flex flex-col"
            >
              {/* Projects */}
              <div className="p-4 border-b border-slate-200">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Project</label>
                <select
                  value={selectedProject?._id || ''}
                  onChange={(e) => {
                    const project = projects.find(p => p._id === e.target.value);
                    setSelectedProject(project);
                    setSelectedTestType(null);
                    setDocuments([]);
                  }}
                  className="mt-2 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.projectName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Test Types */}
              <div className="p-4 border-b border-slate-200">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Test Type</label>
                <select
                  value={selectedTestType?._id || ''}
                  onChange={(e) => {
                    const testType = testTypes.find(t => t._id === e.target.value);
                    setSelectedTestType(testType);
                  }}
                  className="mt-2 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!selectedProject}
                >
                  {testTypes.map(testType => (
                    <option key={testType._id} value={testType._id}>
                      {testType.testTypeName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filters */}
              <div className="p-4 flex-1 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
                    <select
                      value={filter.status}
                      onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                      className="mt-2 w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <option value="all">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</label>
                    <select
                      value={filter.category}
                      onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                      className="mt-2 w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <option value="all">All Categories</option>
                      <option value="test-plan">Test Plan</option>
                      <option value="test-case">Test Case</option>
                      <option value="bug-report">Bug Report</option>
                      <option value="test-report">Test Report</option>
                      <option value="documentation">Documentation</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</label>
                    <select
                      value={filter.priority}
                      onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
                      className="mt-2 w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <option value="all">All Priorities</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : showDocEditor ? (
            <DocumentEditor
              doc={selectedDoc}
              projectId={selectedProject?._id}
              testTypeId={selectedTestType?._id}
              onClose={() => {
                setShowDocEditor(false);
                setSelectedDoc(null);
              }}
              onSave={async (docData) => {
                if (selectedDoc) {
                  // Update existing
                } else {
                  await createDocument(docData);
                }
                setShowDocEditor(false);
                setSelectedDoc(null);
              }}
            />
          ) : (
            <DocumentList
              documents={filteredDocs}
              onSelect={(doc) => {
                setSelectedDoc(doc);
                setShowDocEditor(true);
              }}
              projectId={selectedProject?._id}
              testTypeId={selectedTestType?._id}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// Document List Component
function DocumentList({ documents, onSelect, projectId, testTypeId }) {
  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      archived: 'bg-slate-100 text-slate-700'
    };
    return colors[status] || colors.draft;
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <FileText className="w-16 h-16 text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">No documents yet</h3>
        <p className="text-sm text-slate-500">Create your first document to get started</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <motion.div
            key={doc._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-xl border border-slate-200 p-4 cursor-pointer hover:shadow-lg transition-all"
            onClick={() => onSelect(doc)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                {doc.pinned && <Pin className="w-3 h-3 text-amber-500" />}
                {doc.starred && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
              </div>
              <button className="p-1 hover:bg-slate-100 rounded">
                <MoreVertical className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <h3 className="font-semibold text-slate-800 text-sm mb-2 line-clamp-2">
              {doc.title}
            </h3>

            {doc.description && (
              <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                {doc.description}
              </p>
            )}

            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(doc.priority)}`}>
                {doc.priority}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                {doc.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {doc.comments?.length || 0}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {doc.viewCount || 0}
                </div>
              </div>
              <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Document Editor Component
function DocumentEditor({ doc, projectId, testTypeId, onClose, onSave }) {
  const [title, setTitle] = useState(doc?.title || '');
  const [description, setDescription] = useState(doc?.description || '');
  const [content, setContent] = useState(doc?.content || '');
  const [category, setCategory] = useState(doc?.category || 'documentation');
  const [priority, setPriority] = useState(doc?.priority || 'medium');
  const [status, setStatus] = useState(doc?.status || 'draft');
  const [tags, setTags] = useState(doc?.tags || []);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        title,
        description,
        content,
        category,
        priority,
        status,
        tags
      });
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              {doc ? 'Edit Document' : 'New Document'}
            </h2>
            <p className="text-xs text-slate-500">
              {doc ? `Last edited ${new Date(doc.updatedAt).toLocaleDateString()}` : 'Unsaved changes'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Editor Toolbar */}
      <div className="flex items-center gap-1 px-6 py-3 border-b border-slate-200 bg-slate-50">
        <button className="p-2 hover:bg-slate-200 rounded transition-colors">
          <Bold className="w-4 h-4 text-slate-600" />
        </button>
        <button className="p-2 hover:bg-slate-200 rounded transition-colors">
          <Italic className="w-4 h-4 text-slate-600" />
        </button>
        <button className="p-2 hover:bg-slate-200 rounded transition-colors">
          <Underline className="w-4 h-4 text-slate-600" />
        </button>
        <div className="w-px h-6 bg-slate-300 mx-2" />
        <button className="p-2 hover:bg-slate-200 rounded transition-colors">
          <AlignLeft className="w-4 h-4 text-slate-600" />
        </button>
        <button className="p-2 hover:bg-slate-200 rounded transition-colors">
          <AlignCenter className="w-4 h-4 text-slate-600" />
        </button>
        <button className="p-2 hover:bg-slate-200 rounded transition-colors">
          <AlignRight className="w-4 h-4 text-slate-600" />
        </button>
        <div className="w-px h-6 bg-slate-300 mx-2" />
        <button className="p-2 hover:bg-slate-200 rounded transition-colors">
          <List className="w-4 h-4 text-slate-600" />
        </button>
        <button className="p-2 hover:bg-slate-200 rounded transition-colors">
          <Link className="w-4 h-4 text-slate-600" />
        </button>
        <button className="p-2 hover:bg-slate-200 rounded transition-colors">
          <Code className="w-4 h-4 text-slate-600" />
        </button>
        <button className="p-2 hover:bg-slate-200 rounded transition-colors">
          <Image className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <input
              type="text"
              placeholder="Document title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl font-bold text-slate-800 placeholder-slate-300 focus:outline-none"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="documentation">Documentation</option>
              <option value="test-plan">Test Plan</option>
              <option value="test-case">Test Case</option>
              <option value="bug-report">Bug Report</option>
              <option value="test-report">Test Report</option>
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <textarea
              placeholder="Add a description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm text-slate-600 placeholder-slate-400 focus:outline-none resize-none"
              rows={2}
            />
          </div>

          <div className="border-t border-slate-200 pt-6">
            <textarea
              placeholder="Start writing..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-sm text-slate-700 placeholder-slate-400 focus:outline-none resize-none min-h-[400px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}