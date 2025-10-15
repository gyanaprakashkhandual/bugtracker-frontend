'use client';

import { useState, useEffect, useCallback } from 'react';
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
    FiFilter,
    FiX,
    FiChevronDown,
    FiEye,
    FiMoreVertical,
    FiRefreshCw,
    FiSave,
    FiTag,
    FiFileText,
    FiFolder,
    FiCheckCircle
} from 'react-icons/fi';
import {
    FaRegFileAlt,
    FaRegCheckCircle,
    FaRegClock,
    FaExclamationTriangle
} from 'react-icons/fa';
import { useProject } from '@/app/utils/Get.project';
import { useTestType } from "@/app/script/TestType.context";

const BASE_URL = 'http://localhost:5000/api/v1/doc';

const DocManager = () => {
    const router = useRouter();
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedPriority, setSelectedPriority] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const [actionMenu, setActionMenu] = useState(null);
    const [projectId, setProjectId] = useState('');

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
    const { project, error } = useProject(slug);
    const { testTypeId, testTypeName } = useTestType();

    const categories = ['documentation', 'test-case', 'requirement', 'bug-report', 'meeting-notes'];
    const statuses = ['draft', 'in-review', 'approved', 'archived'];
    const priorities = ['low', 'medium', 'high', 'critical'];

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

    // Filter by category
    const filterByCategory = async (category) => {
        if (!projectId || !testTypeId) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/category/${category}`,
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
            console.error('Error filtering by category:', error);
        }
    };

    // Create document
    const createDocument = async (docData) => {
        if (!projectId || !testTypeId) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...docData,
                        project: projectId,
                        testType: testTypeId,
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                setShowCreateModal(false);
                resetForm();
                fetchDocs();
                return data;
            } else {
                throw new Error('Failed to create document');
            }
        } catch (error) {
            console.error('Error creating document:', error);
            throw error;
        }
    };

    // Update document
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

            if (response.ok) {
                setEditingDoc(null);
                fetchDocs();
            }
        } catch (error) {
            console.error('Error updating document:', error);
        }
    };

    // Archive document
    const archiveDocument = async (docId) => {
        if (!projectId || !testTypeId) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/archive`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                fetchDocs();
            }
        } catch (error) {
            console.error('Error archiving document:', error);
        }
    };

    // Unarchive document
    const unarchiveDocument = async (docId) => {
        if (!projectId || !testTypeId) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/unarchive`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                fetchDocs();
            }
        } catch (error) {
            console.error('Error unarchiving document:', error);
        }
    };

    // Delete document
    const deleteDocument = async (docId) => {
        if (!projectId || !testTypeId) return;

        if (!confirm('Are you sure you want to delete this document?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                fetchDocs();
            }
        } catch (error) {
            console.error('Error deleting document:', error);
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

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDoc) {
                await updateDocument(editingDoc._id, formData);
            } else {
                await createDocument(formData);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
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
    };

    // Handle open document with slug
    const handleOpenDocument = async (docId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="mt-3 text-sm text-slate-600">Loading project information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Enhanced Navbar */}
            <nav className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-center h-14">
                        <div className="flex items-center space-x-3">
                            <FiFileText className="h-5 w-5 text-blue-600" />
                            <div className="flex items-center space-x-2">
                                <h1 className="text-sm font-semibold text-slate-900">Documents</h1>
                                <span className="text-slate-300">/</span>
                                <span className="text-xs text-slate-500">{project?.name || 'Loading...'}</span>
                                {testTypeName && (
                                    <>
                                        <span className="text-slate-300">/</span>
                                        <span className="text-xs text-slate-500">{testTypeName}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* Search Bar */}
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search documents..."
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    className="w-64 pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                                />
                            </div>

                            {/* Filter Button */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                    showFilters
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                <FiFilter className="h-3.5 w-3.5 mr-1.5" />
                                Filters
                                {(selectedCategory || selectedStatus || selectedPriority) && (
                                    <span className="ml-1.5 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-blue-600 rounded-full">
                                        1
                                    </span>
                                )}
                            </button>

                            {/* Create Button */}
                            <button
                                onClick={() => {
                                    setEditingDoc(null);
                                    resetForm();
                                    setShowCreateModal(true);
                                }}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
                            >
                                <FiPlus className="h-3.5 w-3.5 mr-1.5" />
                                New Document
                            </button>

                            {/* Refresh Button */}
                            <button
                                onClick={fetchDocs}
                                className="inline-flex items-center p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                <FiRefreshCw className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Filters Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border-t border-slate-200 py-3"
                            >
                                <div className="flex items-center space-x-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            Category
                                        </label>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => {
                                                setSelectedCategory(e.target.value);
                                                if (e.target.value) {
                                                    filterByCategory(e.target.value);
                                                } else {
                                                    fetchDocs();
                                                }
                                            }}
                                            className="block w-36 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map((category) => (
                                                <option key={category} value={category}>
                                                    {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="block w-36 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">All Status</option>
                                            {statuses.map((status) => (
                                                <option key={status} value={status}>
                                                    {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            Priority
                                        </label>
                                        <select
                                            value={selectedPriority}
                                            onChange={(e) => setSelectedPriority(e.target.value)}
                                            className="block w-36 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">All Priorities</option>
                                            {priorities.map((priority) => (
                                                <option key={priority} value={priority}>
                                                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setSelectedCategory('');
                                            setSelectedStatus('');
                                            setSelectedPriority('');
                                            fetchDocs();
                                        }}
                                        className="self-end inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                                    >
                                        <FiX className="h-3.5 w-3.5 mr-1" />
                                        Clear
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto py-6 px-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center py-16">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                        </div>
                    ) : docs.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                                <FiFileText className="h-6 w-6 text-slate-400" />
                            </div>
                            <h3 className="text-sm font-medium text-slate-900">No documents found</h3>
                            <p className="mt-1 text-xs text-slate-500">
                                Get started by creating your first document.
                            </p>
                            <div className="mt-4">
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center px-4 py-2 text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
                                >
                                    <FiPlus className="h-3.5 w-3.5 mr-1.5" />
                                    Create Document
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Document
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Priority
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Updated
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Author
                                        </th>
                                        <th className="relative px-4 py-2.5">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {docs.map((doc) => (
                                        <motion.tr
                                            key={doc._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-slate-50 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50">
                                                        <FiFileText className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-xs font-medium text-slate-900">
                                                            {doc.title}
                                                        </div>
                                                        {doc.description && (
                                                            <div className="text-xs text-slate-500 truncate max-w-xs mt-0.5">
                                                                {doc.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                    <FiTag className="h-3 w-3 mr-1" />
                                                    {doc.category.replace('-', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusBadge(doc.status)}`}>
                                                    {doc.status === 'approved' && <FiCheckCircle className="h-3 w-3 mr-1" />}
                                                    {doc.status === 'in-review' && <FiClock className="h-3 w-3 mr-1" />}
                                                    {doc.status === 'archived' && <FiArchive className="h-3 w-3 mr-1" />}
                                                    {doc.status.replace('-', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${getPriorityBadge(doc.priority)}`}>
                                                    {doc.priority}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-600">
                                                <div className="flex items-center">
                                                    <FiClock className="h-3 w-3 mr-1.5 text-slate-400" />
                                                    {formatDate(doc.updatedAt)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-600">
                                                <div className="flex items-center">
                                                    <FiUser className="h-3 w-3 mr-1.5 text-slate-400" />
                                                    {doc.createdBy?.name || 'Unknown'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleOpenDocument(doc._id)}
                                                        className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                                    >
                                                        Open
                                                    </button>

                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setActionMenu(actionMenu === doc._id ? null : doc._id)}
                                                            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-all"
                                                        >
                                                            <FiMoreVertical className="h-3.5 w-3.5" />
                                                        </button>

                                                        <AnimatePresence>
                                                            {actionMenu === doc._id && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                                    className="absolute right-0 mt-1 w-40 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                                                                >
                                                                    <div className="py-1">
                                                                        <button
                                                                            onClick={() => {
                                                                                handleEdit(doc);
                                                                                setActionMenu(null);
                                                                            }}
                                                                            className="flex items-center px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left transition-colors"
                                                                        >
                                                                            <FiEdit className="h-3.5 w-3.5 mr-2" />
                                                                            Edit
                                                                        </button>

                                                                        {doc.status === 'archived' ? (
                                                                            <button
                                                                                onClick={() => {
                                                                                    unarchiveDocument(doc._id);
                                                                                    setActionMenu(null);
                                                                                }}
                                                                                className="flex items-center px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left transition-colors"
                                                                            >
                                                                                <FiArchive className="h-3.5 w-3.5 mr-2" />
                                                                                Unarchive
                                                                            </button>
                                                                        ) : (
                                                                            <button
                                                                                onClick={() => {
                                                                                    archiveDocument(doc._id);
                                                                                    setActionMenu(null);
                                                                                }}
                                                                                className="flex items-center px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left transition-colors"
                                                                            >
                                                                                <FiArchive className="h-3.5 w-3.5 mr-2" />
                                                                                Archive
                                                                            </button>
                                                                        )}

                                                                        <button
                                                                            onClick={() => {
                                                                                deleteDocument(doc._id);
                                                                                setActionMenu(null);
                                                                            }}
                                                                            className="flex items-center px-3 py-2 text-xs text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                                                                        >
                                                                            <FiTrash2 className="h-3.5 w-3.5 mr-2" />
                                                                            Delete
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
                        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => {
                            setShowCreateModal(false);
                            setEditingDoc(null);
                            resetForm();
                        }} />

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl"
                        >
                            <div className="px-6 py-4 border-b border-slate-200">
                                <h3 className="text-base font-semibold text-slate-900">
                                    {editingDoc ? 'Edit Document' : 'Create New Document'}
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    {editingDoc ? 'Update document details' : 'Fill in the details to create a new document'}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="px-6 py-4">
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="title" className="block text-xs font-medium text-slate-700 mb-1.5">
                                            Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="title"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter document title"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="description" className="block text-xs font-medium text-slate-700 mb-1.5">
                                            Description
                                        </label>
                                        <textarea
                                            id="description"
                                            rows={2}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            placeholder="Brief description of the document"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label htmlFor="category" className="block text-xs font-medium text-slate-700 mb-1.5">
                                                Category
                                            </label>
                                            <select
                                                id="category"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                {categories.map((category) => (
                                                    <option key={category} value={category}>
                                                        {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="priority" className="block text-xs font-medium text-slate-700 mb-1.5">
                                                Priority
                                            </label>
                                            <select
                                                id="priority"
                                                value={formData.priority}
                                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                {priorities.map((priority) => (
                                                    <option key={priority} value={priority}>
                                                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="content" className="block text-xs font-medium text-slate-700 mb-1.5">
                                            Content
                                        </label>
                                        <textarea
                                            id="content"
                                            rows={6}
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            placeholder="Document content..."
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end space-x-2 mt-6 pt-4 border-t border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            setEditingDoc(null);
                                            resetForm();
                                        }}
                                        className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="inline-flex items-center px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                                    >
                                        <FiSave className="h-3.5 w-3.5 mr-1.5" />
                                        {editingDoc ? 'Update Document' : 'Create Document'}
                                    </button>
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