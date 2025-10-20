'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Trash2, RefreshCw, ChevronDown, Link as LinkIcon,
    Image as ImageIcon, User, CheckCircle2, Circle, Clock,
    AlertCircle, Save, X, ExternalLink, MessageSquare,
    Send, Loader2, Copy, ZoomIn
} from 'lucide-react';
import { useProject } from '@/app/script/Project.context';

const BASE_URL = 'http://localhost:5000/api/v1';
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dvytvjplt/image/upload';
const UPLOAD_PRESET = 'test_case_preset';
const BASE_COMMENT_URL = 'http://localhost:5000/api/v1/comment';

const STATUS_OPTIONS = ['Open', 'On Going', 'In Review', 'Closed'];
const STATUS_COLORS = {
    'Open': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    'On Going': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
    'In Review': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
    'Closed': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
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
    const [showTrash, setShowTrash] = useState(false);
    const [saving, setSaving] = useState({});
    const [uploadingImage, setUploadingImage] = useState({});
    const [comments, setComments] = useState({});
    const [loadingComments, setLoadingComments] = useState({});
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

    const fetchComments = async (issueId) => {
        try {
            setLoadingComments(prev => ({ ...prev, [issueId]: true }));
            debugLog('FETCH_COMMENTS_START', { issueId });

            const res = await fetch(`${BASE_COMMENT_URL}/issue/${issueId}`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            const data = await res.json();

            debugLog('FETCH_COMMENTS_RESPONSE', {
                success: data.success,
                count: data.data?.length
            });

            if (data.success) {
                setComments(prev => ({ ...prev, [issueId]: data.data }));
            }
        } catch (error) {
            debugLog('FETCH_COMMENTS_ERROR', error);
            console.error('Error fetching comments:', error);
        } finally {
            setLoadingComments(prev => ({ ...prev, [issueId]: false }));
        }
    };

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
            <div className="max-w-full">
                <div className="bg-white dark:bg-gray-800 border border-blue-100 dark:border-gray-700 shadow-xl overflow-hidden">
                    <div className="overflow-hidden border border-gray-200 dark:border-gray-700 sticky top-0">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 border-b-2 border-indigo-400 dark:border-indigo-800">
                            <div className="col-span-1 text-xs font-bold text-white uppercase tracking-wider flex items-center">
                                <span className="bg-white/20 dark:bg-white/10 px-2 py-1 rounded backdrop-blur-sm">ID</span>
                            </div>
                            <div className="col-span-2 text-xs font-bold text-white uppercase tracking-wider flex items-center">
                                <span className="bg-white/20 dark:bg-white/10 px-2 py-1 rounded backdrop-blur-sm">Type</span>
                            </div>
                            <div className="col-span-3 text-xs font-bold text-white uppercase tracking-wider flex items-center">
                                <span className="bg-white/20 dark:bg-white/10 px-2 py-1 rounded backdrop-blur-sm">Description</span>
                            </div>
                            <div className="col-span-2 text-xs font-bold text-white uppercase tracking-wider flex items-center">
                                <span className="bg-white/20 dark:bg-white/10 px-2 py-1 rounded backdrop-blur-sm">Assigned</span>
                            </div>
                            <div className="col-span-1 text-xs font-bold text-white uppercase tracking-wider flex items-center">
                                <span className="bg-white/20 dark:bg-white/10 px-2 py-1 rounded backdrop-blur-sm">Status</span>
                            </div>
                            <div className="col-span-2 text-xs font-bold text-white uppercase tracking-wider flex items-center">
                                <span className="bg-white/20 dark:bg-white/10 px-2 py-1 rounded backdrop-blur-sm">Timeline</span>
                            </div>
                            <div className="col-span-1 text-xs font-bold text-white uppercase tracking-wider flex items-center justify-center">
                                <span className="bg-white/20 dark:bg-white/10 px-2 py-1 rounded backdrop-blur-sm">Actions</span>
                            </div>
                        </div>
                    </div>

                    {/* New Issue Row */}
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
                        <div className="p-12 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">Loading issues...</p>
                        </div>
                    ) : issues.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                            <Circle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p>No issues found</p>
                        </div>
                    ) : (
                        issues.map((issue) => (
                            <IssueRow
                                key={issue._id}
                                issue={issue}
                                users={users}
                                saving={saving[issue._id]}
                                uploadingImage={uploadingImage[issue._id]}
                                showTrash={showTrash}
                                comments={comments[issue._id]}
                                loadingComments={loadingComments[issue._id]}
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
                                onFetchComments={() => fetchComments(issue._id)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const NewIssueRow = ({ issue, users, saving, uploadingImage, onChange, onImageUpload, onCreate }) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleKeyPress = async (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();

            console.log('[NEW ISSUE] Enter pressed - Attempting to save');

            if (issue.issueType.trim() || issue.issueDesc.trim()) {
                const success = await onCreate(issue);
                if (success) {
                    console.log('[NEW ISSUE] Successfully saved and cleared');
                    setIsFocused(false);
                }
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-12 gap-4 px-6 py-4 border-b-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50/50 to-sky-50/50 dark:from-blue-900/10 dark:to-sky-900/10"
        >
            <div className="col-span-1 flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <Plus className="w-4 h-4" />
                <span>New</span>
                {saving && <Save className="w-4 h-4 text-blue-500 animate-pulse" />}
            </div>

            <div className="col-span-2">
                <input
                    type="text"
                    value={issue.issueType}
                    onChange={(e) => onChange('issueType', e.target.value)}
                    onKeyPress={handleKeyPress}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => !issue.issueType && setIsFocused(false)}
                    placeholder="Issue type..."
                    style={{ minWidth: '200px', maxWidth: '200px' }}
                    className="w-full px-3 py-2 text-sm border-2 border-blue-200 dark:border-blue-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                />
            </div>

            <div className="col-span-3">
                <textarea
                    value={issue.issueDesc}
                    onChange={(e) => onChange('issueDesc', e.target.value)}
                    onKeyPress={handleKeyPress}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => !issue.issueDesc && setIsFocused(false)}
                    placeholder="Describe the issue... (Press Enter to save)"
                    rows={isFocused ? 3 : 1}
                    style={{
                        minWidth: isFocused ? '500px' : '300px',
                        maxWidth: isFocused ? '500px' : '300px',
                        minHeight: isFocused ? '72px' : '40px'
                    }}
                    className="w-full px-3 py-2 text-sm border-2 border-blue-200 dark:border-blue-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300"
                />
            </div>

            <div className="col-span-2">
                <Dropdown
                    trigger={
                        <button className="w-full px-3 py-2 text-sm text-left border-2 border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-all duration-200">
                            <span className="flex items-center gap-2 text-xs">
                                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                {issue.assignTo ? users.find(u => u._id === issue.assignTo)?.name : 'Unassigned'}
                            </span>
                            <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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
                        <button className={`w-full px-3 py-2 text-xs font-semibold rounded-lg border-2 flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-md ${STATUS_COLORS[issue.status]}`}>
                            {React.createElement(STATUS_ICONS[issue.status], { className: "w-4 h-4" })}
                            {issue.status}
                        </button>
                    }
                    items={STATUS_OPTIONS.map(s => ({ label: s, value: s }))}
                    onSelect={(item) => onChange('status', item.value)}
                />
            </div>

            <div className="col-span-2 space-y-2">
                <input
                    type="date"
                    value={issue.startDate}
                    onChange={(e) => onChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 text-xs border-2 border-blue-200 dark:border-blue-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                />
                <input
                    type="date"
                    value={issue.endDate}
                    onChange={(e) => onChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 text-xs border-2 border-blue-200 dark:border-blue-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                />
            </div>

            <div className="col-span-1 flex items-center justify-center">
                <ActionsColumn
                    issue={issue}
                    isNew={true}
                    onImageUpload={onImageUpload}
                    uploadingImage={uploadingImage}
                    onChange={onChange}
                />
            </div>
        </motion.div>
    );
};

const IssueRow = ({
    issue,
    users,
    saving,
    uploadingImage,
    showTrash,
    comments,
    loadingComments,
    onChange,
    onImageUpload,
    onMoveToTrash,
    onRestore,
    onDelete,
    onFetchComments
}) => {
    const [localIssue, setLocalIssue] = useState(issue);
    const [isFocusedType, setIsFocusedType] = useState(false);
    const [isFocusedDesc, setIsFocusedDesc] = useState(false);
    const StatusIcon = STATUS_ICONS[localIssue.status];

    const handleChange = (field, value) => {
        setLocalIssue(prev => ({ ...prev, [field]: value }));
        onChange(field, value);
    };

    const handleKeyPress = (e, field) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.target.blur();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-blue-100 dark:border-gray-700 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-sky-50/30 dark:hover:from-blue-900/10 dark:hover:to-sky-900/10 items-start group transition-all duration-200"
        >
            <div className="col-span-1 flex items-center gap-2 text-xs font-mono text-gray-600 dark:text-gray-400">
                {localIssue.serialNumber}
                {saving && <Save className="w-3 h-3 text-blue-500 animate-pulse" />}
            </div>

            <div className="col-span-2">
                <input
                    type="text"
                    value={localIssue.issueType || ''}
                    onChange={(e) => handleChange('issueType', e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'issueType')}
                    onFocus={() => setIsFocusedType(true)}
                    onBlur={() => setIsFocusedType(false)}
                    placeholder="Issue type"
                    style={{ minWidth: '200px', maxWidth: '200px' }}
                    className="w-full px-3 py-2 text-sm border border-transparent hover:border-blue-200 dark:hover:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-200 bg-transparent text-gray-900 dark:text-white"
                />
            </div>

            <div className="col-span-3">
                <textarea
                    value={localIssue.issueDesc || ''}
                    onChange={(e) => handleChange('issueDesc', e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'issueDesc')}
                    onFocus={() => setIsFocusedDesc(true)}
                    onBlur={() => setIsFocusedDesc(false)}
                    placeholder="Issue description"
                    rows={isFocusedDesc ? 3 : 1}
                    style={{
                        minWidth: isFocusedDesc ? '500px' : '300px',
                        maxWidth: isFocusedDesc ? '500px' : '300px',
                        minHeight: isFocusedDesc ? '72px' : '40px'
                    }}
                    className="w-full px-3 py-2 text-sm border border-transparent hover:border-blue-200 dark:hover:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 resize-none transition-all duration-300 bg-transparent text-gray-900 dark:text-white"
                />
            </div>

            <div className="col-span-2">
                <Dropdown
                    trigger={
                        <button className="w-full px-3 py-2 text-sm text-left border border-transparent hover:border-blue-200 dark:hover:border-blue-800 rounded-lg flex items-center justify-between group/btn bg-transparent text-gray-900 dark:text-white transition-all duration-200">
                            <span className="flex items-center gap-2 text-xs">
                                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                {localIssue.assignTo?.name || 'Unassigned'}
                            </span>
                            <ChevronDown className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 text-blue-600 dark:text-blue-400 transition-opacity" />
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
                        <button className={`w-full px-3 py-2 text-xs font-semibold rounded-lg border-2 flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-md ${STATUS_COLORS[localIssue.status]}`}>
                            {StatusIcon && <StatusIcon className="w-4 h-4" />}
                            {localIssue.status}
                        </button>
                    }
                    items={STATUS_OPTIONS.map(s => ({ label: s, value: s }))}
                    onSelect={(item) => handleChange('status', item.value)}
                />
            </div>

            <div className="col-span-2 space-y-2">
                <input
                    type="date"
                    value={localIssue.startDate?.split('T')[0] || ''}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'startDate')}
                    className="w-full px-3 py-2 text-xs border border-transparent hover:border-blue-200 dark:hover:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 bg-transparent text-gray-900 dark:text-white transition-all duration-200"
                />
                <input
                    type="date"
                    value={localIssue.endDate?.split('T')[0] || ''}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'endDate')}
                    className="w-full px-3 py-2 text-xs border border-transparent hover:border-blue-200 dark:hover:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 bg-transparent text-gray-900 dark:text-white transition-all duration-200"
                />
            </div>

            <div className="col-span-1 flex items-center justify-center">
                <ActionsColumn
                    issue={localIssue}
                    showTrash={showTrash}
                    onImageUpload={onImageUpload}
                    uploadingImage={uploadingImage}
                    onChange={handleChange}
                    onMoveToTrash={onMoveToTrash}
                    onRestore={onRestore}
                    onDelete={onDelete}
                    comments={comments}
                    loadingComments={loadingComments}
                    onFetchComments={onFetchComments}
                />
            </div>
        </motion.div>
    );
};

const ActionsColumn = ({
    issue,
    isNew = false,
    showTrash = false,
    onImageUpload,
    uploadingImage,
    onChange,
    onMoveToTrash,
    onRestore,
    onDelete,
    comments = [],
    loadingComments = false,
    onFetchComments
}) => {
    const [activeModal, setActiveModal] = useState(null);
    const [newLink, setNewLink] = useState('');
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                setActiveModal(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddLink = () => {
        if (newLink.trim()) {
            const updatedLinks = [...(issue.refLink || []), newLink.trim()];
            onChange('refLink', updatedLinks);
            setNewLink('');
            console.log(`[ISSUE ${issue._id}] Link added:`, newLink);
        }
    };

    const handleRemoveLink = (link) => {
        const updatedLinks = (issue.refLink || []).filter(l => l !== link);
        onChange('refLink', updatedLinks);
        console.log(`[ISSUE ${issue._id}] Link removed:`, link);
    };

    const handleRemoveImage = (imageUrl) => {
        const updatedImages = (issue.image || []).filter(img => img !== imageUrl);
        onChange('image', updatedImages);
        console.log(`[ISSUE ${issue._id}] Image removed:`, imageUrl);
    };

    const submitComment = async () => {
        if (!newComment.trim() || isNew) return;

        setSubmittingComment(true);
        try {
            const res = await fetch(`http://localhost:5000/api/v1/comment/issue/${issue._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ comment: newComment })
            });

            if (res.ok) {
                setNewComment('');
                onFetchComments && onFetchComments();
            }
        } catch (error) {
            console.error('Comment submit error:', error);
        } finally {
            setSubmittingComment(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const validLinks = (issue.refLink || []).filter(link => link && link !== 'No Link Provided');
    const validImages = (issue.image || []).filter(img => img && img !== 'No Image Provided' && img !== 'No Image provided');

    return (
        <div className="relative flex items-center justify-center gap-1">
            {/* Comment Button */}
            {!isNew && (
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        setActiveModal(activeModal === 'comment' ? null : 'comment');
                        if (activeModal !== 'comment' && onFetchComments) {
                            onFetchComments();
                        }
                    }}
                    className="p-2 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                    title="Comments"
                >
                    <MessageSquare className="w-4 h-4" />
                </motion.button>
            )}

            {/* Images Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveModal(activeModal === 'images' ? null : 'images')}
                className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md relative"
                title="Images"
            >
                <ImageIcon className="w-4 h-4" />
                {validImages.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-purple-600 dark:bg-purple-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                        {validImages.length}
                    </span>
                )}
            </motion.button>

            {/* Links Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveModal(activeModal === 'links' ? null : 'links')}
                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md relative"
                title="Links"
            >
                <LinkIcon className="w-4 h-4" />
                {validLinks.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 dark:bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                        {validLinks.length}
                    </span>
                )}
            </motion.button>

            {/* Delete/Restore Button */}
            {!isNew && (
                showTrash ? (
                    <>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onRestore}
                            className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Restore"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onDelete}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Delete Forever"
                        >
                            <Trash2 className="w-4 h-4" />
                        </motion.button>
                    </>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onMoveToTrash}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Move to Trash"
                    >
                        <Trash2 className="w-4 h-4" />
                    </motion.button>
                )
            )}

            {/* Modals */}
            <AnimatePresence>
                {activeModal === 'comment' && !isNew && (
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full mt-2 right-0 w-96 bg-white dark:bg-gray-800 border-2 border-sky-200 dark:border-sky-800 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 border-b-2 border-sky-200 dark:border-sky-800">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                                <h3 className="font-bold text-gray-800 dark:text-gray-200">Comments</h3>
                            </div>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="px-4 py-3 border-b-2 border-sky-100 dark:border-sky-900/30">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            submitComment();
                                        }
                                    }}
                                    placeholder="Add a comment..."
                                    className="flex-1 px-3 py-2 text-sm border-2 border-sky-200 dark:border-sky-800 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-transparent transition-all duration-200"
                                    disabled={submittingComment}
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={submitComment}
                                    disabled={!newComment.trim() || submittingComment}
                                    className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-700 dark:to-blue-700 text-white rounded-lg hover:from-sky-700 hover:to-blue-700 dark:hover:from-sky-600 dark:hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                                >
                                    {submittingComment ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </motion.button>
                            </div>
                        </div>

                        <div className="overflow-y-auto max-h-72">
                            {loadingComments ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-sky-600 dark:text-sky-400" />
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                                    No comments yet. Be the first to comment!
                                </div>
                            ) : (
                                <div className="divide-y divide-sky-100 dark:divide-sky-900/30">
                                    {comments.map((comment, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="px-4 py-3 hover:bg-sky-50/50 dark:hover:bg-sky-900/10 transition-colors"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 dark:from-sky-600 dark:to-blue-700 flex items-center justify-center flex-shrink-0 shadow-md">
                                                    <span className="text-sm font-bold text-white">
                                                        {comment.commentBy?.charAt(0).toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                                            {comment.commentBy || 'Unknown User'}
                                                        </span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {new Date(comment.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 break-words">{comment.comment}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeModal === 'images' && (
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full mt-2 right-0 w-96 bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-800 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-b-2 border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-bold text-gray-800 dark:text-gray-200">Images</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) onImageUpload(file);
                                    }}
                                    className="hidden"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingImage}
                                    className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all duration-200"
                                    title="Upload new image"
                                >
                                    <Plus className="w-5 h-5" />
                                </motion.button>
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto max-h-96">
                            {uploadingImage && (
                                <div className="px-4 py-3 border-b border-purple-100 dark:border-purple-900/30 bg-purple-50/50 dark:bg-purple-900/10">
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="w-5 h-5 animate-spin text-purple-600 dark:text-purple-400" />
                                        <span className="text-sm text-purple-700 dark:text-purple-300">Uploading image...</span>
                                    </div>
                                </div>
                            )}
                            {validImages.length === 0 && !uploadingImage ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                                    No images added yet
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 p-4">
                                    {validImages.map((image, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="relative group"
                                        >
                                            <img
                                                src={image}
                                                alt={`Image ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border-2 border-purple-200 dark:border-purple-800 shadow-md cursor-pointer hover:shadow-xl transition-all duration-200"
                                                onClick={() => setImagePreview(image)}
                                            />
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setImagePreview(image)}
                                                    className="p-1.5 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 rounded-lg shadow-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                                                    title="View full size"
                                                >
                                                    <ZoomIn className="w-4 h-4" />
                                                </motion.button>
                                                {!isNew && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleRemoveImage(image)}
                                                        className="p-1.5 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 rounded-lg shadow-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                        title="Remove image"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </motion.button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeModal === 'links' && (
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full mt-2 right-0 w-96 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-800 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-100 to-sky-100 dark:from-blue-900/30 dark:to-sky-900/30 border-b-2 border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-2">
                                <LinkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-bold text-gray-800 dark:text-gray-200">Links</h3>
                            </div>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="px-4 py-3 border-b-2 border-blue-100 dark:border-blue-900/30">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newLink}
                                    onChange={(e) => setNewLink(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddLink();
                                        }
                                    }}
                                    placeholder="Enter link URL..."
                                    className="flex-1 px-3 py-2 text-sm border-2 border-blue-200 dark:border-blue-800 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleAddLink}
                                    disabled={!newLink.trim()}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-600 dark:from-blue-700 dark:to-sky-700 text-white rounded-lg hover:from-blue-700 hover:to-sky-700 dark:hover:from-blue-600 dark:hover:to-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                                >
                                    <Plus className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </div>

                        <div className="overflow-y-auto max-h-72">
                            {validLinks.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                                    No links added yet
                                </div>
                            ) : (
                                <div className="divide-y divide-blue-100 dark:divide-blue-900/30">
                                    {validLinks.map((link, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="px-4 py-3 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <a
                                                    href={link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 truncate hover:underline"
                                                    title={link}
                                                >
                                                    {link}
                                                </a>
                                                <div className="flex items-center gap-1">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => copyToClipboard(link)}
                                                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                        title="Copy link"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </motion.button>
                                                    {!isNew && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleRemoveLink(link)}
                                                            className="p-1.5 text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            title="Remove link"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </motion.button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {imagePreview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                        onClick={() => setImagePreview(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            className="relative max-w-4xl max-h-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="max-w-full max-h-[90vh] rounded-xl shadow-2xl"
                            />
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setImagePreview(null)}
                                className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-full shadow-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
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
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-800 rounded-xl shadow-2xl z-50 min-w-[240px] max-h-80 overflow-auto"
                    >
                        {items.map((item, idx) => (
                            <motion.button
                                key={idx}
                                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                                onClick={() => {
                                    onSelect(item);
                                    setIsOpen(false);
                                }}
                                className="w-full px-4 py-3 text-left text-sm hover:bg-blue-50
                dark:hover:bg-blue-900/20 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl"
                            >
                                <span className="font-medium text-gray-900 dark:text-white block">{item.label}</span>
                                {item.subtitle && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 block">{item.subtitle}</span>
                                )}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BugTracker;