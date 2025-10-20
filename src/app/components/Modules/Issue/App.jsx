'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, Trash2, Archive, RefreshCw, 
  ChevronDown, Link as LinkIcon, Image as ImageIcon,
  Calendar, User, CheckCircle2, Circle, Clock,
  AlertCircle, Save, Upload, X, Edit2, MoreVertical,
  CheckCircle, XCircle
} from 'lucide-react';
import { useProject } from '@/app/script/Project.context';

const BASE_URL = 'http://localhost:5000/api/v1';
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dvytvjplt/image/upload';
const UPLOAD_PRESET = 'test_case_preset';

const STATUS_OPTIONS = ['Open', 'On Going', 'In Review', 'Closed'];
const STATUS_COLORS = {
  'Open': 'bg-blue-100 text-blue-700 border-blue-300',
  'On Going': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'In Review': 'bg-purple-100 text-purple-700 border-purple-300',
  'Closed': 'bg-green-100 text-green-700 border-green-300'
};

const STATUS_ICONS = {
  'Open': Circle,
  'On Going': Clock,
  'In Review': AlertCircle,
  'Closed': CheckCircle2
};

const IssueTracker = () => {
  const { selectedProject } = useProject();
  const projectId = selectedProject?._id;

  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showTrash, setShowTrash] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState({});
  const [uploadingImage, setUploadingImage] = useState({});
  const [newIssue, setNewIssue] = useState({
    issueType: '',
    issueDesc: '',
    refLink: [],
    image: [],
    assignTo: null,
    startDate: '',
    endDate: '',
    status: 'Open'
  });

  const autoSaveTimers = useRef({});

  const getToken = () => localStorage.getItem('token');

  const fetchIssues = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const res = await fetch(
        `${BASE_URL}/issue/project/${projectId}?includeTrash=${showTrash}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const data = await res.json();
      if (data.success) {
        setIssues(data.data);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId, showTrash]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/admin/users`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
    fetchUsers();
  }, [fetchIssues, fetchUsers]);

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    return data.secure_url;
  };

  const autoSave = useCallback((issueId, field, value) => {
    if (autoSaveTimers.current[issueId]) {
      clearTimeout(autoSaveTimers.current[issueId]);
    }

    autoSaveTimers.current[issueId] = setTimeout(async () => {
      setSaving(prev => ({ ...prev, [issueId]: true }));
      try {
        const res = await fetch(`${BASE_URL}/issue/${issueId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({ [field]: value })
        });
        const data = await res.json();
        if (data.success) {
          setIssues(prev => prev.map(i => i._id === issueId ? data.data : i));
        }
      } catch (error) {
        console.error('Auto-save error:', error);
      } finally {
        setSaving(prev => ({ ...prev, [issueId]: false }));
      }
    }, 1000);
  }, []);

  const createIssue = async () => {
    if (!projectId) return;
    
    try {
      setSaving(prev => ({ ...prev, new: true }));
      const res = await fetch(`${BASE_URL}/issue/project/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(newIssue)
      });
      const data = await res.json();
      if (data.success) {
        setIssues(prev => [data.data, ...prev]);
        setNewIssue({
          issueType: '',
          issueDesc: '',
          refLink: [],
          image: [],
          assignTo: null,
          startDate: '',
          endDate: '',
          status: 'Open'
        });
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Create error:', error);
    } finally {
      setSaving(prev => ({ ...prev, new: false }));
    }
  };

  const moveToTrash = async (issueId) => {
    try {
      const res = await fetch(`${BASE_URL}/issue/${issueId}/trash`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) {
        fetchIssues();
      }
    } catch (error) {
      console.error('Move to trash error:', error);
    }
  };

  const restoreIssue = async (issueId) => {
    try {
      const res = await fetch(`${BASE_URL}/issue/${issueId}/restore`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) {
        fetchIssues();
      }
    } catch (error) {
      console.error('Restore error:', error);
    }
  };

  const deleteForever = async (issueId) => {
    if (!confirm('Delete permanently?')) return;
    
    try {
      const res = await fetch(`${BASE_URL}/issue/${issueId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) {
        fetchIssues();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleImageUpload = async (issueId, file, isNew = false) => {
    const key = isNew ? 'new' : issueId;
    setUploadingImage(prev => ({ ...prev, [key]: true }));
    
    try {
      const url = await uploadToCloudinary(file);
      
      if (isNew) {
        setNewIssue(prev => ({ ...prev, image: [...prev.image, url] }));
      } else {
        const issue = issues.find(i => i._id === issueId);
        const updatedImages = [...(issue.image || []), url];
        
        const res = await fetch(`${BASE_URL}/issue/${issueId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({ image: updatedImages })
        });
        const data = await res.json();
        if (data.success) {
          setIssues(prev => prev.map(i => i._id === issueId ? data.data : i));
        }
      }
    } catch (error) {
      console.error('Image upload error:', error);
    } finally {
      setUploadingImage(prev => ({ ...prev, [key]: false }));
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.issueType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.issueDesc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">Issues</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTrash(!showTrash)}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${
                  showTrash ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                {showTrash ? 'Hide Trash' : 'Show Trash'}
              </button>
              <button
                onClick={fetchIssues}
                className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Issue
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Dropdown
              trigger={
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Status: {filterStatus === 'all' ? 'All' : filterStatus}
                  <ChevronDown className="w-4 h-4" />
                </button>
              }
              items={[
                { label: 'All', value: 'all' },
                ...STATUS_OPTIONS.map(s => ({ label: s, value: s }))
              ]}
              onSelect={(item) => setFilterStatus(item.value)}
            />
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
            <div className="col-span-1">ID</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-3">Description</div>
            <div className="col-span-2">Assigned To</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Dates</div>
            <div className="col-span-1">Actions</div>
          </div>

          {/* New Issue Row */}
          <AnimatePresence>
            {isCreating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-b border-gray-200"
              >
                <IssueRow
                  issue={newIssue}
                  isNew
                  users={users}
                  saving={saving.new}
                  uploadingImage={uploadingImage.new}
                  onChange={(field, value) => setNewIssue(prev => ({ ...prev, [field]: value }))}
                  onImageUpload={(file) => handleImageUpload(null, file, true)}
                  onSave={createIssue}
                  onCancel={() => setIsCreating(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Issue Rows */}
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading...</div>
          ) : filteredIssues.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No issues found</div>
          ) : (
            filteredIssues.map((issue) => (
              <IssueRow
                key={issue._id}
                issue={issue}
                users={users}
                saving={saving[issue._id]}
                uploadingImage={uploadingImage[issue._id]}
                showTrash={showTrash}
                onChange={(field, value) => autoSave(issue._id, field, value)}
                onImageUpload={(file) => handleImageUpload(issue._id, file)}
                onMoveToTrash={() => moveToTrash(issue._id)}
                onRestore={() => restoreIssue(issue._id)}
                onDelete={() => deleteForever(issue._id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const IssueRow = ({ 
  issue, 
  isNew, 
  users, 
  saving, 
  uploadingImage,
  showTrash,
  onChange, 
  onImageUpload,
  onSave,
  onCancel,
  onMoveToTrash,
  onRestore,
  onDelete
}) => {
  const [localIssue, setLocalIssue] = useState(issue);
  const fileInputRef = useRef(null);
  const StatusIcon = STATUS_ICONS[localIssue.status];

  const handleChange = (field, value) => {
    setLocalIssue(prev => ({ ...prev, [field]: value }));
    if (!isNew) {
      onChange(field, value);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 px-4 py-4 border-b border-gray-200 hover:bg-gray-50 items-start group">
      {/* ID */}
      <div className="col-span-1 text-sm text-gray-600 font-mono flex items-center gap-2">
        {localIssue.serialNumber || '—'}
        {saving && <Save className="w-3 h-3 text-blue-500 animate-pulse" />}
      </div>

      {/* Type */}
      <div className="col-span-2">
        <input
          type="text"
          value={localIssue.issueType || ''}
          onChange={(e) => handleChange('issueType', e.target.value)}
          placeholder="Issue type"
          className="w-full px-2 py-1 text-sm border border-transparent hover:border-gray-300 focus:border-blue-500 rounded focus:outline-none transition-colors"
        />
      </div>

      {/* Description */}
      <div className="col-span-3">
        <textarea
          value={localIssue.issueDesc || ''}
          onChange={(e) => handleChange('issueDesc', e.target.value)}
          placeholder="Issue description"
          rows={2}
          className="w-full px-2 py-1 text-sm border border-transparent hover:border-gray-300 focus:border-blue-500 rounded focus:outline-none resize-none transition-colors"
        />
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 disabled:opacity-50"
          >
            <ImageIcon className="w-3 h-3" />
            {uploadingImage ? 'Uploading...' : `${localIssue.image?.length || 0} images`}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && onImageUpload(e.target.files[0])}
            className="hidden"
          />
        </div>
      </div>

      {/* Assigned To */}
      <div className="col-span-2">
        <Dropdown
          trigger={
            <button className="w-full px-2 py-1 text-sm text-left border border-transparent hover:border-gray-300 rounded flex items-center justify-between group/btn">
              <span className="flex items-center gap-2">
                <User className="w-3 h-3" />
                {localIssue.assignTo?.name || 'Unassigned'}
              </span>
              <ChevronDown className="w-3 h-3 opacity-0 group-hover/btn:opacity-100" />
            </button>
          }
          items={[
            { label: 'Unassigned', value: null },
            ...users.map(u => ({ label: u.name, value: u._id, subtitle: u.email }))
          ]}
          onSelect={(item) => handleChange('assignTo', item.value)}
        />
      </div>

      {/* Status */}
      <div className="col-span-1">
        <Dropdown
          trigger={
            <button className={`w-full px-2 py-1 text-xs rounded border flex items-center gap-1 ${STATUS_COLORS[localIssue.status]}`}>
              {StatusIcon && <StatusIcon className="w-3 h-3" />}
              {localIssue.status}
            </button>
          }
          items={STATUS_OPTIONS.map(s => ({ label: s, value: s }))}
          onSelect={(item) => handleChange('status', item.value)}
        />
      </div>

      {/* Dates */}
      <div className="col-span-2 space-y-1">
        <input
          type="date"
          value={localIssue.startDate?.split('T')[0] || ''}
          onChange={(e) => handleChange('startDate', e.target.value)}
          className="w-full px-2 py-1 text-xs border border-transparent hover:border-gray-300 focus:border-blue-500 rounded focus:outline-none"
        />
        <input
          type="date"
          value={localIssue.endDate?.split('T')[0] || ''}
          onChange={(e) => handleChange('endDate', e.target.value)}
          className="w-full px-2 py-1 text-xs border border-transparent hover:border-gray-300 focus:border-blue-500 rounded focus:outline-none"
        />
      </div>

      {/* Actions */}
      <div className="col-span-1 flex items-center gap-1">
        {isNew ? (
          <>
            <button
              onClick={onSave}
              disabled={saving}
              className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button
              onClick={onCancel}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </>
        ) : showTrash ? (
          <>
            <button
              onClick={onRestore}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
              title="Restore"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
              title="Delete Forever"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={onMoveToTrash}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100"
            title="Move to Trash"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

const Dropdown = ({ trigger, items, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[200px] max-h-[300px] overflow-auto"
          >
            {items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelect(item);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex flex-col"
              >
                <span className="font-medium">{item.label}</span>
                {item.subtitle && (
                  <span className="text-xs text-gray-500">{item.subtitle}</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IssueTracker;