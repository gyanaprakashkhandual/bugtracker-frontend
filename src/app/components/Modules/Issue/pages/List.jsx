'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, Trash2, Archive, RefreshCw, 
  ChevronDown, Link as LinkIcon, Image as ImageIcon,
  Calendar, User, CheckCircle2, Circle, Clock,
  AlertCircle, Save, Upload, X, Edit2, MoreVertical,
  CheckCircle, XCircle, ExternalLink
} from 'lucide-react';
import { useProject } from '@/app/script/Project.context';

const BASE_URL = 'http://localhost:5000/api/v1';
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dvytvjplt/image/upload';
const UPLOAD_PRESET = 'test_case_preset';

const STATUS_OPTIONS = ['Open', 'On Going', 'In Review', 'Closed'];
const STATUS_COLORS = {
  'Open': 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  'On Going': 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  'In Review': 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
  'Closed': 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
};

const STATUS_ICONS = {
  'Open': Circle,
  'On Going': Clock,
  'In Review': AlertCircle,
  'Closed': CheckCircle2
};

const BugTracker = () => {
  const { selectedProject } = useProject();
  const projectId = selectedProject?._id;

  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showTrash, setShowTrash] = useState(false);
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

  // Debug logging function
  const debugLog = (action, data) => {
    console.log(`[BUG TRACKER DEBUG] ${action}:`, {
      timestamp: new Date().toISOString(),
      data: data
    });
  };

  const fetchIssues = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      debugLog('FETCH_ISSUES_START', { projectId, showTrash });
      
      const res = await fetch(
        `${BASE_URL}/issue/project/${projectId}?includeTrash=${showTrash}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const data = await res.json();
      
      debugLog('FETCH_ISSUES_RESPONSE', { 
        success: data.success, 
        count: data.data?.length 
      });
      
      if (data.success) {
        setIssues(data.data);
      }
    } catch (error) {
      debugLog('FETCH_ISSUES_ERROR', error);
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId, showTrash]);

  const fetchUsers = useCallback(async () => {
    try {
      debugLog('FETCH_USERS_START', {});
      
      const res = await fetch(`${BASE_URL}/auth/admin/users`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      
      debugLog('FETCH_USERS_RESPONSE', { 
        success: data.success, 
        userCount: data.data?.length 
      });
      
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      debugLog('FETCH_USERS_ERROR', error);
      console.error('Error fetching users:', error);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
    fetchUsers();
  }, [fetchIssues, fetchUsers]);

  const uploadToCloudinary = async (file) => {
    debugLog('IMAGE_UPLOAD_START', { 
      fileName: file.name, 
      fileSize: file.size 
    });
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    
    debugLog('IMAGE_UPLOAD_COMPLETE', { 
      url: data.secure_url 
    });
    
    return data.secure_url;
  };

  const autoSave = useCallback((issueId, field, value) => {
    debugLog('AUTO_SAVE_TRIGGERED', { 
      issueId, 
      field, 
      value,
      valueLength: typeof value === 'string' ? value.length : 'N/A',
      valueType: typeof value
    });

    if (autoSaveTimers.current[issueId]) {
      clearTimeout(autoSaveTimers.current[issueId]);
    }

    autoSaveTimers.current[issueId] = setTimeout(async () => {
      debugLog('AUTO_SAVE_EXECUTING', { issueId, field, value });
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
        
        debugLog('AUTO_SAVE_RESPONSE', { 
          success: data.success, 
          issueId,
          updatedField: field
        });
        
        if (data.success) {
          setIssues(prev => prev.map(i => i._id === issueId ? data.data : i));
        }
      } catch (error) {
        debugLog('AUTO_SAVE_ERROR', { issueId, field, error });
        console.error('Auto-save error:', error);
      } finally {
        setSaving(prev => ({ ...prev, [issueId]: false }));
      }
    }, 1000);
  }, []);

  const createIssue = async (issueData) => {
    if (!projectId) return;
    
    debugLog('CREATE_ISSUE_START', { 
      projectId,
      issueData,
      dataSize: JSON.stringify(issueData).length
    });
    
    try {
      setSaving(prev => ({ ...prev, new: true }));
      const res = await fetch(`${BASE_URL}/issue/project/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(issueData)
      });
      const data = await res.json();
      
      debugLog('CREATE_ISSUE_RESPONSE', { 
        success: data.success,
        newIssueId: data.data?._id,
        serialNumber: data.data?.serialNumber
      });
      
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
        return true;
      }
    } catch (error) {
      debugLog('CREATE_ISSUE_ERROR', error);
      console.error('Create error:', error);
    } finally {
      setSaving(prev => ({ ...prev, new: false }));
    }
    return false;
  };

  const moveToTrash = async (issueId) => {
    try {
      debugLog('MOVE_TO_TRASH', { issueId });
      const res = await fetch(`${BASE_URL}/issue/${issueId}/trash`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) {
        fetchIssues();
      }
    } catch (error) {
      debugLog('MOVE_TO_TRASH_ERROR', error);
      console.error('Move to trash error:', error);
    }
  };

  const restoreIssue = async (issueId) => {
    try {
      debugLog('RESTORE_ISSUE', { issueId });
      const res = await fetch(`${BASE_URL}/issue/${issueId}/restore`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) {
        fetchIssues();
      }
    } catch (error) {
      debugLog('RESTORE_ERROR', error);
      console.error('Restore error:', error);
    }
  };

  const deleteForever = async (issueId) => {
    if (!confirm('Delete permanently?')) return;
    
    try {
      debugLog('DELETE_PERMANENTLY', { issueId });
      const res = await fetch(`${BASE_URL}/issue/${issueId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) {
        fetchIssues();
      }
    } catch (error) {
      debugLog('DELETE_ERROR', error);
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
        debugLog('NEW_ISSUE_IMAGE_ADDED', { url, totalImages: newIssue.image.length + 1 });
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
        
        debugLog('ISSUE_IMAGE_UPDATED', { issueId, totalImages: updatedImages.length });
        
        if (data.success) {
          setIssues(prev => prev.map(i => i._id === issueId ? data.data : i));
        }
      }
    } catch (error) {
      debugLog('IMAGE_UPLOAD_ERROR', error);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Compact Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-[1600px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Issues</h1>
              
              <div className="flex-1 max-w-md relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <Dropdown
                trigger={
                  <button className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    <Filter className="w-3.5 h-3.5" />
                    {filterStatus === 'all' ? 'All Status' : filterStatus}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                }
                items={[
                  { label: 'All Status', value: 'all' },
                  ...STATUS_OPTIONS.map(s => ({ label: s, value: s }))
                ]}
                onSelect={(item) => setFilterStatus(item.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTrash(!showTrash)}
                className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm transition-colors ${
                  showTrash 
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-transparent'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                {showTrash ? 'Hide Trash' : 'Trash'}
              </button>
              <button
                onClick={fetchIssues}
                className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            <div className="col-span-1">ID</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-3">Description</div>
            <div className="col-span-1">Links</div>
            <div className="col-span-2">Assigned</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Dates</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* New Issue Row - Always Visible at Top */}
          <NewIssueRow
            issue={newIssue}
            users={users}
            saving={saving.new}
            uploadingImage={uploadingImage.new}
            onChange={(field, value) => {
              debugLog('NEW_ISSUE_FIELD_CHANGE', { 
                field, 
                value,
                valueLength: typeof value === 'string' ? value.length : 'N/A'
              });
              setNewIssue(prev => ({ ...prev, [field]: value }));
            }}
            onImageUpload={(file) => handleImageUpload(null, file, true)}
            onCreate={createIssue}
          />

          {/* Issue Rows */}
          {loading ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">Loading...</div>
          ) : filteredIssues.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">No issues found</div>
          ) : (
            filteredIssues.map((issue) => (
              <IssueRow
                key={issue._id}
                issue={issue}
                users={users}
                saving={saving[issue._id]}
                uploadingImage={uploadingImage[issue._id]}
                showTrash={showTrash}
                onChange={(field, value) => {
                  debugLog('ISSUE_FIELD_CHANGE', { 
                    issueId: issue._id,
                    field, 
                    value,
                    valueLength: typeof value === 'string' ? value.length : 'N/A'
                  });
                  autoSave(issue._id, field, value);
                }}
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

const NewIssueRow = ({ issue, users, saving, uploadingImage, onChange, onImageUpload, onCreate }) => {
  const fileInputRef = useRef(null);
  const [linkInput, setLinkInput] = useState('');

  const handleKeyPress = async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      console.log('[NEW ISSUE] Enter pressed - Attempting to save');
      console.log('[NEW ISSUE] Current data:', {
        issueType: issue.issueType,
        issueDesc: issue.issueDesc,
        refLink: issue.refLink,
        assignTo: issue.assignTo,
        status: issue.status,
        totalCharacters: (issue.issueType?.length || 0) + (issue.issueDesc?.length || 0)
      });
      
      if (issue.issueType.trim() || issue.issueDesc.trim()) {
        const success = await onCreate(issue);
        if (success) {
          console.log('[NEW ISSUE] Successfully saved and cleared');
        }
      } else {
        console.log('[NEW ISSUE] Skipped - No data to save');
      }
    }
  };

  const addRefLink = () => {
    if (linkInput.trim()) {
      onChange('refLink', [...issue.refLink, linkInput.trim()]);
      setLinkInput('');
      console.log('[NEW ISSUE] Link added:', linkInput);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b-2 border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10">
      <div className="col-span-1 text-xs text-gray-400 dark:text-gray-500 font-mono flex items-center gap-1">
        <Plus className="w-3 h-3" />
        New
        {saving && <Save className="w-3 h-3 text-blue-500 animate-pulse" />}
      </div>

      <div className="col-span-2">
        <input
          type="text"
          value={issue.issueType}
          onChange={(e) => onChange('issueType', e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Issue type..."
          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      <div className="col-span-3">
        <textarea
          value={issue.issueDesc}
          onChange={(e) => onChange('issueDesc', e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Describe the issue... (Press Enter to save)"
          rows={2}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
          className="mt-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 disabled:opacity-50"
        >
          <ImageIcon className="w-3 h-3" />
          {uploadingImage ? 'Uploading...' : `${issue.image?.length || 0} images`}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && onImageUpload(e.target.files[0])}
          className="hidden"
        />
      </div>

      <div className="col-span-1">
        <div className="flex gap-1 mb-1">
          <input
            type="text"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addRefLink();
              }
            }}
            placeholder="URL"
            className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            onClick={addRefLink}
            className="px-2 py-1 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 text-xs"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
        {issue.refLink.map((link, idx) => (
          <div key={idx} className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 mb-1">
            <ExternalLink className="w-3 h-3" />
            <a href={link} target="_blank" rel="noopener noreferrer" className="truncate flex-1 hover:underline">
              {link.substring(0, 20)}...
            </a>
            <button
              onClick={() => onChange('refLink', issue.refLink.filter((_, i) => i !== idx))}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      <div className="col-span-2">
        <Dropdown
          trigger={
            <button className="w-full px-2 py-1.5 text-sm text-left border border-gray-300 dark:border-gray-600 rounded flex items-center justify-between bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white">
              <span className="flex items-center gap-2 text-xs">
                <User className="w-3 h-3" />
                {issue.assignTo ? users.find(u => u._id === issue.assignTo)?.name : 'Unassigned'}
              </span>
              <ChevronDown className="w-3 h-3" />
            </button>
          }
          items={[
            { label: 'Unassigned', value: null },
            ...users.map(u => ({ label: u.name, value: u._id, subtitle: u.email }))
          ]}
          onSelect={(item) => onChange('assignTo', item.value)}
        />
      </div>

      <div className="col-span-1">
        <Dropdown
          trigger={
            <button className={`w-full px-2 py-1.5 text-xs rounded border flex items-center justify-center gap-1 ${STATUS_COLORS[issue.status]}`}>
              {React.createElement(STATUS_ICONS[issue.status], { className: "w-3 h-3" })}
              {issue.status}
            </button>
          }
          items={STATUS_OPTIONS.map(s => ({ label: s, value: s }))}
          onSelect={(item) => onChange('status', item.value)}
        />
      </div>

      <div className="col-span-1 space-y-1">
        <input
          type="date"
          value={issue.startDate}
          onChange={(e) => onChange('startDate', e.target.value)}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <input
          type="date"
          value={issue.endDate}
          onChange={(e) => onChange('endDate', e.target.value)}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div className="col-span-1 flex items-center justify-end">
        <span className="text-xs text-gray-400 dark:text-gray-500">Press Enter</span>
      </div>
    </div>
  );
};

const IssueRow = ({ 
  issue, 
  users, 
  saving, 
  uploadingImage,
  showTrash,
  onChange, 
  onImageUpload,
  onMoveToTrash,
  onRestore,
  onDelete
}) => {
  const [localIssue, setLocalIssue] = useState(issue);
  const [linkInput, setLinkInput] = useState('');
  const fileInputRef = useRef(null);
  const StatusIcon = STATUS_ICONS[localIssue.status];

  const handleChange = (field, value) => {
    setLocalIssue(prev => ({ ...prev, [field]: value }));
    onChange(field, value);
  };

  const handleKeyPress = (e, field) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log(`[ISSUE ${issue._id}] Enter pressed on field: ${field}`);
      console.log(`[ISSUE ${issue._id}] Data being saved:`, {
        field,
        value: localIssue[field],
        valueLength: typeof localIssue[field] === 'string' ? localIssue[field].length : 'N/A'
      });
      e.target.blur();
    }
  };

  const addRefLink = () => {
    if (linkInput.trim()) {
      const updatedLinks = [...(localIssue.refLink || []), linkInput.trim()];
      handleChange('refLink', updatedLinks);
      setLinkInput('');
      console.log(`[ISSUE ${issue._id}] Link added:`, linkInput);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 items-start group transition-colors">
      <div className="col-span-1 text-xs text-gray-600 dark:text-gray-400 font-mono flex items-center gap-2">
        {localIssue.serialNumber}
        {saving && <Save className="w-3 h-3 text-blue-500 animate-pulse" />}
      </div>

      <div className="col-span-2">
        <input
          type="text"
          value={localIssue.issueType || ''}
          onChange={(e) => handleChange('issueType', e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, 'issueType')}
          placeholder="Issue type"
          className="w-full px-2 py-1.5 text-sm border border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded focus:outline-none transition-colors bg-transparent text-gray-900 dark:text-white"
        />
      </div>

      <div className="col-span-3">
        <textarea
          value={localIssue.issueDesc || ''}
          onChange={(e) => handleChange('issueDesc', e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, 'issueDesc')}
          placeholder="Issue description"
          rows={2}
          className="w-full px-2 py-1.5 text-sm border border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded focus:outline-none resize-none transition-colors bg-transparent text-gray-900 dark:text-white"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
          className="mt-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 disabled:opacity-50"
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

      <div className="col-span-1">
        <div className="flex gap-1 mb-1">
          <input
            type="text"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addRefLink();
              }
            }}
            placeholder="URL"
            className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            onClick={addRefLink}
            className="px-2 py-1 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 text-xs"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
        {(localIssue.refLink || []).map((link, idx) => (
          <div key={idx} className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 mb-1">
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
            <a 
              href={link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="truncate flex-1 hover:underline"
              title={link}
            >
              {link.length > 25 ? link.substring(0, 25) + '...' : link}
            </a>
            <button
              onClick={() => handleChange('refLink', localIssue.refLink.filter((_, i) => i !== idx))}
              className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex-shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {(localIssue.refLink?.length || 0) === 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500">No links</p>
        )}
      </div>

      <div className="col-span-2">
        <Dropdown
          trigger={
            <button className="w-full px-2 py-1.5 text-sm text-left border border-transparent hover:border-gray-300 dark:hover:border-gray-600 rounded flex items-center justify-between group/btn bg-transparent text-gray-900 dark:text-white">
              <span className="flex items-center gap-2 text-xs">
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

      <div className="col-span-1">
        <Dropdown
          trigger={
            <button className={`w-full px-2 py-1.5 text-xs rounded border flex items-center justify-center gap-1 ${STATUS_COLORS[localIssue.status]}`}>
              {StatusIcon && <StatusIcon className="w-3 h-3" />}
              {localIssue.status}
            </button>
          }
          items={STATUS_OPTIONS.map(s => ({ label: s, value: s }))}
          onSelect={(item) => handleChange('status', item.value)}
        />
      </div>

      <div className="col-span-1 space-y-1">
        <input
          type="date"
          value={localIssue.startDate?.split('T')[0] || ''}
          onChange={(e) => handleChange('startDate', e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, 'startDate')}
          className="w-full px-2 py-1 text-xs border border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded focus:outline-none bg-transparent text-gray-900 dark:text-white"
        />
        <input
          type="date"
          value={localIssue.endDate?.split('T')[0] || ''}
          onChange={(e) => handleChange('endDate', e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, 'endDate')}
          className="w-full px-2 py-1 text-xs border border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded focus:outline-none bg-transparent text-gray-900 dark:text-white"
        />
      </div>

      <div className="col-span-1 flex items-center justify-end gap-1">
        {showTrash ? (
          <>
            <button
              onClick={onRestore}
              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              title="Restore"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              title="Delete Forever"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={onMoveToTrash}
            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-all"
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
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.1 }}
            className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 min-w-[220px] max-h-[320px] overflow-auto"
          >
            {items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelect(item);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
                {item.subtitle && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.subtitle}</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BugTracker;