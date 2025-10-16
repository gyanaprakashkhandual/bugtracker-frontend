'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import {
    FiSearch,
    FiPlus,
    FiEdit,
    FiTrash2,
    FiArchive,
    FiClock,
    FiUser,
    FiSave,
    FiTag,
    FiFileText,
    FiCheckCircle,
    FiMoreVertical,
    FiCheck,
    FiX,
} from 'react-icons/fi';
import { useProject } from '@/app/utils/Get.project';
import { useTestType } from "@/app/script/TestType.context";
import { useDoc } from "@/app/script/Doc.context";
import { GoogleArrowDown } from '../../utils/Icon';

const BASE_URL = 'http://localhost:5000/api/v1/doc';

const DocManager = () => {
    const router = useRouter();
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const [actionMenu, setActionMenu] = useState(null);
    const [projectId, setProjectId] = useState('');
    const [deleting, setDeleting] = useState(null);
    const [archiving, setArchiving] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'documentation',
        priority: 'medium',
        content: '',
        tags: []
    });

    const { slug } = useParams();
    const { project } = useProject(slug);
    const { testTypeId, testTypeName } = useTestType();
    const { setDocId } = useDoc();

    const categories = ['documentation', 'test-case', 'requirement', 'bug-report', 'meeting-notes'];
    const priorities = ['low', 'medium', 'high', 'critical'];

    // GitHub-style dropdown states
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [priorityOpen, setPriorityOpen] = useState(false);

    const categoryRef = useRef(null);
    const priorityRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (categoryRef.current && !categoryRef.current.contains(event.target)) {
                setCategoryOpen(false);
            }
            if (priorityRef.current && !priorityRef.current.contains(event.target)) {
                setPriorityOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getCategoryIcon = (category) => {
        const icons = {
            'documentation': '📚',
            'test-case': '🧪',
            'requirement': '📋',
            'bug-report': '🐛',
            'meeting-notes': '📝'
        };
        return icons[category] || '📄';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            medium: 'bg-blue-50 text-blue-700 border-blue-200',
            high: 'bg-orange-50 text-orange-700 border-orange-200',
            critical: 'bg-red-50 text-red-700 border-red-200'
        };
        return colors[priority] || colors.medium;
    };

    const getPriorityDot = (priority) => {
        const colors = {
            low: 'bg-emerald-500',
            medium: 'bg-blue-500',
            high: 'bg-orange-500',
            critical: 'bg-red-500'
        };
        return colors[priority] || colors.medium;
    };

    // Get project ID from localStorage
    useEffect(() => {
        const currentProjectId = typeof window !== 'undefined' ? localStorage.getItem('currentProjectId') : '';
        setProjectId(currentProjectId);
    }, []);

    // Fetch documents
    const fetchDocs = useCallback(async () => {
        if (!projectId || !testTypeId) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setDocs(data.docs || []);
            } else {
                console.error('Failed to fetch documents');
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    }, [projectId, testTypeId]);

    // Search documents
    const searchDocs = async (query) => {
        if (!projectId || !testTypeId) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/search?q=${encodeURIComponent(query)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setDocs(data.docs || []);
            }
        } catch (error) {
            console.error('Error searching documents:', error);
        }
    };

    // Create document - FIXED
    // Create document - ENHANCED WITH LOGGING
    const createDocument = async (docData) => {
        if (!projectId || !testTypeId) {
            console.error('Missing projectId or testTypeId');
            return;
        }

        try {
            const token = localStorage.getItem('token');

            // Remove project and testType from payload since they're in the URL
            const { project, testType, ...cleanDocData } = docData;
            const payload = {
                ...cleanDocData
            };

            console.log('=== CREATE DOCUMENT DEBUG START ===');
            console.log('Project ID from props/state:', projectId);
            console.log('TestType ID from props/state:', testTypeId);
            console.log('Document data:', docData);
            console.log('Cleaned payload (without project/testType):', payload);
            console.log('API URL:', `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs`);
            console.log('Token exists:', !!token);

            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }
            );

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            const data = await response.json();
            console.log('Full response data:', data);

            if (response.ok) {
                console.log('✅ Document created successfully:', data);
                setShowCreateModal(false);
                resetForm();
                fetchDocs();
                return data;
            } else {
                console.error('❌ Error response details:', {
                    status: response.status,
                    statusText: response.statusText,
                    data: data
                });

                // More detailed error messages
                if (data.errors && Array.isArray(data.errors)) {
                    const errorMessages = data.errors.map(err =>
                        `${err.field || 'unknown'}: ${err.message}`
                    ).join('\n');
                    alert(`Failed to create document:\n${errorMessages}`);
                } else {
                    alert(data.message || `Failed to create document. Status: ${response.status}`);
                }
                return null;
            }
        } catch (error) {
            console.error('💥 Network/System error creating document:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            alert('Network error creating document. Please check console for details.');
            return null;
        }
    };
    // Update document - FIXED
    const updateDocument = async (docId, updateData) => {
        if (!projectId || !testTypeId) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateData),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setEditingDoc(null);
                setShowCreateModal(false);
                resetForm();
                fetchDocs();
                return data;
            } else {
                alert(data.message || 'Failed to update document');
                return null;
            }
        } catch (error) {
            console.error('Error updating document:', error);
            alert('Error updating document. Please try again.');
            return null;
        }
    };

    // Archive document - FIXED
    const archiveDocument = async (docId) => {
        if (!projectId || !testTypeId) return;

        try {
            setArchiving(docId);
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/archive`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                await fetchDocs();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to archive document');
            }
        } catch (error) {
            console.error('Error archiving document:', error);
            alert('Error archiving document. Please try again.');
        } finally {
            setArchiving(null);
            setActionMenu(null);
        }
    };

    // Unarchive document - FIXED
    const unarchiveDocument = async (docId) => {
        if (!projectId || !testTypeId) return;

        try {
            setArchiving(docId);
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/unarchive`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                await fetchDocs();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to unarchive document');
            }
        } catch (error) {
            console.error('Error unarchiving document:', error);
            alert('Error unarchiving document. Please try again.');
        } finally {
            setArchiving(null);
            setActionMenu(null);
        }
    };

    // Delete document - FIXED
    const deleteDocument = async (docId) => {
        if (!projectId || !testTypeId) return;

        if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) return;

        try {
            setDeleting(docId);
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                await fetchDocs();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to delete document');
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            alert('Error deleting document. Please try again.');
        } finally {
            setDeleting(null);
            setActionMenu(null);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: 'documentation',
            priority: 'medium',
            content: '',
            tags: []
        });
    };

    // Handle search
    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 2) {
            searchDocs(query);
        } else if (query.length === 0) {
            fetchDocs();
        }
    };

    // Handle form submission - FIXED
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingDoc) {
                await updateDocument(editingDoc._id, formData);
            } else {
                await createDocument(formData);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle edit
    const handleEdit = (doc) => {
        setEditingDoc(doc);
        setFormData({
            title: doc.title,
            description: doc.description,
            category: doc.category,
            priority: doc.priority,
            content: doc.content,
            tags: doc.tags || []
        });
        setShowCreateModal(true);
        setActionMenu(null);
    };

    // Handle open document with slug
    const handleOpenDocument = async (docId) => {
        try {
            setDocId(docId);
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                const docSlug = data.doc.slug;
                if (project?.slug && docSlug) {
                    router.push(`/app/projects/${project.slug}/test-data/${docSlug}`);
                }
            }
        } catch (error) {
            console.error('Error fetching document:', error);
        }
    };

    // Fetch documents when projectId or testTypeId changes
    useEffect(() => {
        if (projectId && testTypeId) {
            fetchDocs();
        }
    }, [projectId, testTypeId, fetchDocs]);

    // Get status badge
    const getStatusBadge = (status) => {
        const styles = {
            approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            'in-review': 'bg-amber-50 text-amber-700 border-amber-200',
            archived: 'bg-slate-50 text-slate-600 border-slate-200',
            draft: 'bg-blue-50 text-blue-700 border-blue-200'
        };
        return styles[status] || styles.draft;
    };

    // Get priority badge
    const getPriorityBadge = (priority) => {
        const styles = {
            critical: 'bg-red-50 text-red-700 border-red-200',
            high: 'bg-orange-50 text-orange-700 border-orange-200',
            medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            low: 'bg-green-50 text-green-700 border-green-200'
        };
        return styles[priority] || styles.medium;
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (!projectId || !testTypeId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-ping mx-auto"></div>
                    </div>
                    <p className="mt-6 text-sm font-medium text-slate-600">Loading project information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
            {/* Enhanced Navbar */}
            <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-full mx-auto px-6">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                                <FiFileText className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex items-center space-x-2.5">
                                <h1 className="text-base font-bold text-slate-900">Documents</h1>
                                <span className="text-slate-300">/</span>
                                <span className="text-sm text-slate-600 font-medium">{project?.projectName || 'Loading...'}</span>
                                {testTypeName && (
                                    <>
                                        <span className="text-slate-300">/</span>
                                        <span className="text-sm px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-200">{testTypeName}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            {/* Enhanced Search Bar */}
                            <div className="relative group">
                                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search documents..."
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    className="w-72 pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:ring-0.5 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-sm hover:border-slate-300"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            fetchDocs();
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-md transition-colors"
                                    >
                                        <FiX className="h-3.5 w-3.5 text-slate-400" />
                                    </button>
                                )}
                            </div>

                            {/* Enhanced Create Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    setEditingDoc(null);
                                    resetForm();
                                    setShowCreateModal(true);
                                }}
                                className="inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm shadow-blue-500/30 hover:shadow-md hover:shadow-blue-500/40"
                            >
                                <FiPlus className="h-4 w-4 mr-2" />
                                New Document
                            </motion.button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-full mx-auto">
                <div className="bg-white/80 backdrop-blur-sm overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col justify-center items-center py-24">
                            <div className="relative">
                                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-400 rounded-full animate-ping"></div>
                            </div>
                            <p className="mt-6 text-sm font-medium text-slate-600">Loading documents...</p>
                        </div>
                    ) : docs.length === 0 ? (
                        <div className="text-center py-24 px-6">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 mb-6 shadow-inner"
                            >
                                <FiFileText className="h-10 w-10 text-slate-400" />
                            </motion.div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">No documents found</h3>
                            <p className="text-sm text-slate-500 mb-6">
                                {searchQuery ? 'Try adjusting your search terms' : 'Get started by creating your first document'}
                            </p>
                            {!searchQuery && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30"
                                >
                                    <FiPlus className="h-4 w-4 mr-2" />
                                    Create Document
                                </motion.button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Document
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Priority
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Updated
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Author
                                        </th>
                                        <th className="relative px-6 py-4">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {docs.map((doc, index) => (
                                        <motion.tr
                                            key={doc._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-blue-50/50 transition-all duration-200 group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 group-hover:from-blue-100 group-hover:to-blue-200 transition-all">
                                                        <FiFileText className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                            {doc.title}
                                                        </div>
                                                        {doc.description && (
                                                            <div className="text-xs text-slate-500 truncate max-w-md mt-1">
                                                                {doc.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                                    <span className="mr-1.5">{getCategoryIcon(doc.category)}</span>
                                                    {doc.category.replace('-', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusBadge(doc.status)}`}>
                                                    {doc.status === 'approved' && <FiCheckCircle className="h-3.5 w-3.5 mr-1.5" />}
                                                    {doc.status === 'in-review' && <FiClock className="h-3.5 w-3.5 mr-1.5" />}
                                                    {doc.status === 'archived' && <FiArchive className="h-3.5 w-3.5 mr-1.5" />}
                                                    {doc.status.replace('-', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${getPriorityBadge(doc.priority)}`}>
                                                    <span className={`w-2 h-2 rounded-full ${getPriorityDot(doc.priority)} mr-2`} />
                                                    {doc.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                <div className="flex items-center">
                                                    <FiClock className="h-4 w-4 mr-2 text-slate-400" />
                                                    {formatDate(doc.updatedAt)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                <div className="flex items-center">
                                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold mr-2 shadow-md">
                                                        {doc.createdBy?.name?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                    {doc.createdBy?.name || 'Unknown'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleOpenDocument(doc._id)}
                                                        className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all border border-blue-200"
                                                    >
                                                        Open
                                                    </motion.button>

                                                    <div className="relative">
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => setActionMenu(actionMenu === doc._id ? null : doc._id)}
                                                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                                            disabled={deleting === doc._id || archiving === doc._id}
                                                        >
                                                            {(deleting === doc._id || archiving === doc._id) ? (
                                                                <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                                                            ) : (
                                                                <FiMoreVertical className="h-4 w-4" />
                                                            )}
                                                        </motion.button>

                                                        <AnimatePresence>
                                                            {actionMenu === doc._id && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                    transition={{ duration: 0.15 }}
                                                                    className="absolute right-0 mt-2 w-48 rounded-xl shadow-xl bg-white border border-slate-200 z-20 overflow-hidden"
                                                                >
                                                                    <div className="py-1">
                                                                        <button
                                                                            onClick={() => handleEdit(doc)}
                                                                            className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                                        >
                                                                            <FiEdit className="h-4 w-4 mr-3" />
                                                                            Edit document
                                                                        </button>

                                                                        {doc.status === 'archived' ? (
                                                                            <button
                                                                                onClick={() => unarchiveDocument(doc._id)}
                                                                                className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                                            >
                                                                                <FiArchive className="h-4 w-4 mr-3" />
                                                                                Unarchive
                                                                            </button>
                                                                        ) : (
                                                                            <button
                                                                                onClick={() => archiveDocument(doc._id)}
                                                                                className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                                            >
                                                                                <FiArchive className="h-4 w-4 mr-3" />
                                                                                Archive
                                                                            </button>
                                                                        )}

                                                                        <div className="border-t border-slate-100 my-1"></div>

                                                                        <button
                                                                            onClick={() => deleteDocument(doc._id)}
                                                                            className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                                                        >
                                                                            <FiTrash2 className="h-4 w-4 mr-3" />
                                                                            Delete document
                                                                        </button>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Enhanced Create/Edit Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center p-4"
                    >
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => {
                            setShowCreateModal(false);
                            setEditingDoc(null);
                            resetForm();
                        }} />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200"
                        >
                            {/* Header with Close Button */}
                            <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between bg-gradient-to-r from-slate-50 to-white">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">
                                        {editingDoc ? 'Edit Document' : 'Create New Document'}
                                    </h3>
                                    <p className="mt-1.5 text-sm text-slate-500">
                                        {editingDoc ? 'Update document details' : 'Fill in the details to create a new document'}
                                    </p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setEditingDoc(null);
                                        resetForm();
                                    }}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    <FiX className="w-5 h-5" />
                                </motion.button>
                            </div>

                            <form onSubmit={handleSubmit} className="px-6 py-6">
                                <div className="space-y-6">
                                    {/* Title and Description in one row */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                                                Title <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="title"
                                                required
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-slate-400"
                                                placeholder="Enter document title"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                                                Description
                                            </label>
                                            <input
                                                type="text"
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-slate-400"
                                                placeholder="Brief description"
                                            />
                                        </div>
                                    </div>

                                    {/* GitHub Style Dropdowns */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Category Dropdown */}
                                        <div ref={categoryRef}>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Category
                                            </label>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setCategoryOpen(!categoryOpen);
                                                        setPriorityOpen(false);
                                                    }}
                                                    className="w-full px-4 py-2.5 text-sm text-left border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all hover:border-slate-400 flex items-center justify-between"
                                                >
                                                    <span className="flex items-center gap-2.5">
                                                        <span className="text-lg">{getCategoryIcon(formData.category)}</span>
                                                        <span className="capitalize font-medium text-slate-700">
                                                            {formData.category.replace('-', ' ')}
                                                        </span>
                                                    </span>
                                                    <GoogleArrowDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${categoryOpen ? 'rotate-180' : ''}`} />
                                                </button>

                                                <AnimatePresence>
                                                    {categoryOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
                                                        >
                                                            <div className="py-1 max-h-60 overflow-y-auto">
                                                                {categories.map((category) => (
                                                                    <button
                                                                        key={category}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setFormData({ ...formData, category });
                                                                            setCategoryOpen(false);
                                                                        }}
                                                                        className={`w-full px-4 py-2.5 text-sm text-left hover:bg-slate-50 transition-colors flex items-center justify-between group ${formData.category === category ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                                                                            }`}
                                                                    >
                                                                        <span className="flex items-center gap-2.5">
                                                                            <span className="text-lg">{getCategoryIcon(category)}</span>
                                                                            <span className="capitalize font-medium">
                                                                                {category.replace('-', ' ')}
                                                                            </span>
                                                                        </span>
                                                                        {formData.category === category && (
                                                                            <FiCheck className="w-4 h-4 text-blue-600" />
                                                                        )}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        {/* Priority Dropdown */}
                                        <div ref={priorityRef}>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Priority
                                            </label>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPriorityOpen(!priorityOpen);
                                                        setCategoryOpen(false);
                                                    }}
                                                    className="w-full px-4 py-2.5 text-sm text-left border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all hover:border-slate-400 flex items-center justify-between"
                                                >
                                                    <span className="flex items-center gap-2.5">
                                                        <span className={`w-2.5 h-2.5 rounded-full ${getPriorityDot(formData.priority)}`} />
                                                        <span className="capitalize font-medium text-slate-700">{formData.priority}</span>
                                                    </span>
                                                    <GoogleArrowDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${priorityOpen ? 'rotate-180' : ''}`} />
                                                </button>

                                                <AnimatePresence>
                                                    {priorityOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
                                                        >
                                                            <div className="py-1">
                                                                {priorities.map((priority) => (
                                                                    <button
                                                                        key={priority}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setFormData({ ...formData, priority });
                                                                            setPriorityOpen(false);
                                                                        }}
                                                                        className={`w-full px-4 py-2.5 text-sm text-left hover:bg-slate-50 transition-colors flex items-center justify-between group ${formData.priority === priority ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                                                                            }`}
                                                                    >
                                                                        <span className="flex items-center gap-2.5">
                                                                            <span className={`w-2.5 h-2.5 rounded-full ${getPriorityDot(priority)}`} />
                                                                            <span className="capitalize font-medium">{priority}</span>
                                                                        </span>
                                                                        {formData.priority === priority && (
                                                                            <FiCheck className="w-4 h-4 text-blue-600" />
                                                                        )}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Footer Buttons */}
                                <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-slate-200">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="button"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            setEditingDoc(null);
                                            resetForm();
                                        }}
                                        className="px-6 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={submitting}
                                        className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed min-w-[160px] justify-center"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                                {editingDoc ? 'Updating...' : 'Creating...'}
                                            </>
                                        ) : (
                                            <>
                                                <FiSave className="h-4 w-4 mr-2" />
                                                {editingDoc ? 'Update Document' : 'Create Document'}
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Close action menu when clicking outside */}
            {actionMenu && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={() => setActionMenu(null)}
                />
            )}
        </div>
    );
};

export default DocManager;