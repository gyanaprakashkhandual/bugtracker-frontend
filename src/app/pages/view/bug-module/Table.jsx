'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Search, AlertCircle, Loader2, RefreshCw, Archive, ChevronDown, GripVertical, MessageSquare, ExternalLink, X, Send, ChevronLeft, ChevronRight, Image as ImageIcon, Save, Ban, Link as LinkIcon, Copy, ZoomIn, Plus } from 'lucide-react';
import { useTestType } from '@/app/script/TestType.context';
import { useAlert } from '@/app/script/Alert.context';
import { useProject } from '@/app/script/Project.context';
import { BUG_EVENTS } from '@/app/components/Sidebars/Bug';
import TableSkeletonLoader from '@/app/components/assets/Table.loader';

const BugSpreadsheet = () => {
    const [bugs, setBugs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCell, setEditingCell] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [savingCells, setSavingCells] = useState(new Set());
    const [errorCells, setErrorCells] = useState(new Set());
    const [newRowData, setNewRowData] = useState({});
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [dropdownOpenUpward, setDropdownOpenUpward] = useState({});
    const [columnWidths, setColumnWidths] = useState({});
    const [rowHeights, setRowHeights] = useState({});
    const [resizing, setResizing] = useState(null);
    const [isCreatingBug, setIsCreatingBug] = useState(false);
    const [activeCommentModal, setActiveCommentModal] = useState(null);
    const [comments, setComments] = useState({});
    const [loadingComments, setLoadingComments] = useState({});
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalBugs, setTotalBugs] = useState(0);
    const [newRowEditing, setNewRowEditing] = useState(false);
    const [newRowTempData, setNewRowTempData] = useState({});
    const [imagePreviewModal, setImagePreviewModal] = useState(null);
    const [activeLinksDropdown, setActiveLinksDropdown] = useState(null);
    const [activeImagesDropdown, setActiveImagesDropdown] = useState(null);
    const [activeLinkModal, setActiveLinkModal] = useState(null);
    const [activeImageModal, setActiveImageModal] = useState(null);
    const [newLink, setNewLink] = useState('');
    const dropdownRef = useRef(null);
    const commentModalRef = useRef(null);
    const linksDropdownRef = useRef(null);
    const imagesDropdownRef = useRef(null);
    const linkModalRef = useRef(null);
    const imageModalRef = useRef(null);
    const resizeStartX = useRef(0);
    const resizeStartY = useRef(0);
    const resizeStartWidth = useRef(0);
    const resizeStartHeight = useRef(0);
    const dropdownButtonRefs = useRef({});
    const commentButtonRefs = useRef({});
    const linksButtonRefs = useRef({});
    const imagesButtonRefs = useRef({});
    const fileInputRef = useRef(null);
    const { testTypeId, testTypeName } = useTestType();
    const { selectedProject } = useProject();
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const BASE_URL = 'http://localhost:5000/api/v1/bug';
    const COMMENT_URL = 'http://localhost:5000/api/v1/comment';
    const ROWS_PER_PAGE = 11;

    const columns = [
        { key: 'serialNumber', label: 'S.No', width: 90, editable: false, color: 'bg-purple-50 dark:bg-gray-800', sticky: true },
        { key: 'bugType', label: 'Type', width: 130, editable: true, type: 'select', options: ['Functional', 'User-Interface', 'Security', 'Database', 'Performance'], color: 'bg-blue-50 dark:bg-gray-800', sticky: true },
        { key: 'moduleName', label: 'Module', width: 140, editable: true, color: 'bg-green-50 dark:bg-gray-800', sticky: true },
        { key: 'bugDesc', label: 'Description', width: 370, editable: true, color: 'bg-yellow-50 dark:bg-gray-800', expandable: true },
        { key: 'bugRequirement', label: 'Requirement', width: 368, editable: true, color: 'bg-pink-50 dark:bg-gray-800', expandable: true },
        { key: 'priority', label: 'Priority', width: 90, editable: true, type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], color: 'bg-red-50 dark:bg-gray-800' },
        { key: 'severity', label: 'Severity', width: 90, editable: true, type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], color: 'bg-orange-50 dark:bg-gray-800' },
        { key: 'status', label: 'Status', width: 100, editable: true, type: 'select', options: ['New', 'Open', 'In Progress', 'In Review', 'Closed', 'Re Open'], color: 'bg-teal-50 dark:bg-gray-800' },
        { key: 'actions', label: 'Actions', width: 150, editable: false, color: 'bg-gray-100 dark:bg-gray-800' }
    ];

    const { showAlert } = useAlert();

    useEffect(() => {
        const initialWidths = {};
        columns.forEach(col => {
            initialWidths[col.key] = col.width;
        });
        setColumnWidths(initialWidths);
        setRowHeights({ default: 48 });
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
            if (commentModalRef.current && !commentModalRef.current.contains(event.target)) {
                setActiveCommentModal(null);
            }
            if (linksDropdownRef.current && !linksDropdownRef.current.contains(event.target)) {
                setActiveLinksDropdown(null);
            }
            if (imagesDropdownRef.current && !imagesDropdownRef.current.contains(event.target)) {
                setActiveImagesDropdown(null);
            }
            if (linkModalRef.current && !linkModalRef.current.contains(event.target)) {
                setActiveLinkModal(null);
            }
            if (imageModalRef.current && !imageModalRef.current.contains(event.target)) {
                setActiveImageModal(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleBugChange = (event) => {
            fetchBugs();
        };

        window.addEventListener(BUG_EVENTS.CHANGED, handleBugChange);
        window.addEventListener(BUG_EVENTS.CREATED, handleBugChange);
        window.addEventListener(BUG_EVENTS.UPDATED, handleBugChange);
        window.addEventListener(BUG_EVENTS.DELETED, handleBugChange);
        window.addEventListener(BUG_EVENTS.TRASHED, handleBugChange);
        window.addEventListener(BUG_EVENTS.RESTORED, handleBugChange);

        return () => {
            window.removeEventListener(BUG_EVENTS.CHANGED, handleBugChange);
            window.removeEventListener(BUG_EVENTS.CREATED, handleBugChange);
            window.removeEventListener(BUG_EVENTS.UPDATED, handleBugChange);
            window.removeEventListener(BUG_EVENTS.DELETED, handleBugChange);
            window.removeEventListener(BUG_EVENTS.TRASHED, handleBugChange);
            window.removeEventListener(BUG_EVENTS.RESTORED, handleBugChange);
        };
    }, []);

    const fetchBugs = useCallback(async (page = 1) => {
        if (!selectedProject._id || !testTypeId || !token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `${BASE_URL}/projects/${selectedProject._id}/test-types/${testTypeId}/bugs?page=${page}&limit=${ROWS_PER_PAGE}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to fetch bugs');
            const data = await response.json();
            setBugs(data.bugs || []);
            setTotalPages(data.pagination?.totalPages || 1);
            setTotalBugs(data.pagination?.totalBugs || 0);
            setCurrentPage(page);
        } catch (error) {
            showAlert({ type: 'error', message: 'Failed to fetch bugs' });
        } finally {
            setLoading(false);
        }
    }, [selectedProject._id, testTypeId, token]);

    const fetchComments = async (bugId) => {
        if (!token || loadingComments[bugId]) return;

        setLoadingComments(prev => ({ ...prev, [bugId]: true }));
        try {
            const response = await fetch(
                `${COMMENT_URL}/projects/${selectedProject._id}/test-types/${testTypeId}/bugs/${bugId}/comments`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to fetch comments');
            const data = await response.json();
            setComments(prev => ({ ...prev, [bugId]: data.comments || [] }));
        } catch (error) {
            showAlert({ type: 'error', message: 'Failed to fetch comments' });
        } finally {
            setLoadingComments(prev => ({ ...prev, [bugId]: false }));
        }
    };

    const submitComment = async (bugId) => {
        if (!newComment.trim() || submittingComment) return;

        setSubmittingComment(true);
        try {
            const response = await fetch(
                `${COMMENT_URL}/projects/${selectedProject._id}/test-types/${testTypeId}/bugs/${bugId}/comments`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        comment: newComment,
                        bugId: bugId
                    })
                }
            );

            if (!response.ok) throw new Error('Failed to submit comment');
            const data = await response.json();
            setComments(prev => ({
                ...prev,
                [bugId]: [data.comment, ...(prev[bugId] || [])]
            }));
            setNewComment('');
            showAlert({ type: 'success', message: 'Comment added successfully' });
        } catch (error) {
            showAlert({ type: 'error', message: 'Failed to submit comment' });
        } finally {
            setSubmittingComment(false);
        }
    };

    const uploadImageToCloudinary = async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'test_case_preset');

            const response = await fetch('https://api.cloudinary.com/v1_1/dvytvjplt/image/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Failed to upload image');
            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            throw error;
        }
    };

    const createBug = async (bugData) => {
        if (!token || isCreatingBug) return;
        if (!bugData.moduleName && !bugData.bugDesc) return;

        setIsCreatingBug(true);
        try {
            const response = await fetch(
                `${BASE_URL}/projects/${selectedProject._id}/test-types/${testTypeId}/bugs`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        bugType: bugData.bugType || 'Functional',
                        moduleName: bugData.moduleName || '',
                        bugDesc: bugData.bugDesc || '',
                        bugRequirement: bugData.bugRequirement || '',
                        refLinks: bugData.refLinks ? [bugData.refLinks] : [],
                        images: bugData.images ? [bugData.images] : [],
                        priority: bugData.priority || 'Medium',
                        severity: bugData.severity || 'Medium',
                        status: bugData.status || 'New'
                    })
                }
            );

            if (!response.ok) throw new Error('Failed to create bug');
            await fetchBugs(currentPage);
            setNewRowData({});
            setNewRowEditing(false);
            setNewRowTempData({});
            showAlert({ type: 'success', message: 'Bug created successfully' });
        } catch (error) {
            showAlert({ type: 'error', message: 'Failed to create bug' });
        } finally {
            setIsCreatingBug(false);
        }
    };

    const updateBug = async (bugId, field, value) => {
        const cellKey = `${bugId}-${field}`;
        setSavingCells(prev => new Set([...prev, cellKey]));
        setErrorCells(prev => {
            const newSet = new Set(prev);
            newSet.delete(cellKey);
            return newSet;
        });

        try {
            const response = await fetch(
                `${BASE_URL}/bugs/${bugId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ [field]: value })
                }
            );

            if (!response.ok) throw new Error('Failed to update bug');

            setTimeout(() => {
                setSavingCells(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(cellKey);
                    return newSet;
                });
                showAlert({ type: 'success', message: 'Field updated successfully' });
            }, 500);
        } catch (error) {
            setErrorCells(prev => new Set([...prev, cellKey]));
            setSavingCells(prev => {
                const newSet = new Set(prev);
                newSet.delete(cellKey);
                return newSet;
            });
            showAlert({ type: 'error', message: 'Failed to update field' });
            setBugs(prev => prev.map(bug =>
                bug._id === bugId ? { ...bug, [field]: bug[field] } : bug
            ));
        }
    };

    const handleCellEdit = (bugId, columnKey, value) => {
        setBugs(prev => prev.map(bug =>
            bug._id === bugId ? { ...bug, [columnKey]: value } : bug
        ));
        updateBug(bugId, columnKey, value);
    };

    const handleNewRowEdit = (columnKey, value) => {
        const updatedData = { ...newRowData, [columnKey]: value };
        setNewRowData(updatedData);
    };

    const handleNewRowManualSave = () => {
        if (Object.keys(newRowTempData).length > 0 || Object.keys(newRowData).length > 0) {
            const finalData = { ...newRowData, ...newRowTempData };
            createBug(finalData);
        }
        setNewRowEditing(false);
        setNewRowTempData({});
    };

    const handleNewRowCancel = () => {
        setNewRowEditing(false);
        setNewRowTempData({});
        setNewRowData({});
    };

    const handleNewRowCellClick = (columnKey) => {
        if (!newRowEditing) {
            setNewRowEditing(true);
        }
        const currentValue = newRowTempData[columnKey] || newRowData[columnKey] || '';
        startEditing('new', columnKey, currentValue);
    };

    const handleDropdownSelect = (bugId, columnKey, value) => {
        if (bugId === 'new') {
            if (newRowEditing) {
                setNewRowTempData(prev => ({ ...prev, [columnKey]: value }));
            } else {
                handleNewRowEdit(columnKey, value);
            }
        } else {
            handleCellEdit(bugId, columnKey, value);
        }
        setActiveDropdown(null);
    };

    const startEditing = (bugId, columnKey, value) => {
        setEditingCell({ bugId, columnKey });
        setEditValue(value || '');
        if (columnKey === 'bugDesc' || columnKey === 'bugRequirement') {
            setColumnWidths(prev => ({ ...prev, [columnKey]: 600 }));
        }
    };

    const stopEditing = () => {
        if (editingCell) {
            if (editingCell.bugId === 'new') {
                if (newRowEditing) {
                    setNewRowTempData(prev => ({ ...prev, [editingCell.columnKey]: editValue }));
                } else {
                    handleNewRowEdit(editingCell.columnKey, editValue);
                }
            } else {
                handleCellEdit(editingCell.bugId, editingCell.columnKey, editValue);
            }
        }
        setEditingCell(null);
        setEditValue('');
        setColumnWidths(prev => {
            const newWidths = { ...prev };
            columns.forEach(col => {
                if (col.expandable) {
                    newWidths[col.key] = col.width;
                }
            });
            return newWidths;
        });
    };

    const handleImageUpload = async (bugId, file) => {
        if (!file) return;

        try {
            showAlert({ type: 'success', message: 'Uploading image...' });
            const imageUrl = await uploadImageToCloudinary(file);

            if (bugId === 'new') {
                if (newRowEditing) {
                    const currentImages = newRowTempData.images || newRowData.images || '';
                    const imagesArray = currentImages ? currentImages.split(',') : [];
                    imagesArray.push(imageUrl);
                    setNewRowTempData(prev => ({ ...prev, images: imagesArray.join(',') }));
                } else {
                    const currentImages = newRowData.images || '';
                    const imagesArray = currentImages ? currentImages.split(',') : [];
                    imagesArray.push(imageUrl);
                    handleNewRowEdit('images', imagesArray.join(','));
                }
            } else {
                const bug = bugs.find(b => b._id === bugId);
                const currentImages = bug?.images || [];
                const updatedImages = Array.isArray(currentImages) ? [...currentImages, imageUrl] : [imageUrl];
                handleCellEdit(bugId, 'images', updatedImages);
            }
            showAlert({ type: 'success', message: 'Image uploaded successfully' });
        } catch (error) {
            showAlert({ type: 'error', message: 'Failed to upload image' });
        }
    };

    const handleAddLink = (bugId, link) => {
        if (!link.trim()) return;

        if (bugId === 'new') {
            if (newRowEditing) {
                const currentLinks = newRowTempData.refLinks || newRowData.refLinks || '';
                const linksArray = currentLinks ? currentLinks.split(',') : [];
                linksArray.push(link);
                setNewRowTempData(prev => ({ ...prev, refLinks: linksArray.join(',') }));
            } else {
                const currentLinks = newRowData.refLinks || '';
                const linksArray = currentLinks ? currentLinks.split(',') : [];
                linksArray.push(link);
                handleNewRowEdit('refLinks', linksArray.join(','));
            }
        } else {
            const bug = bugs.find(b => b._id === bugId);
            const currentLinks = bug?.refLinks || [];
            const updatedLinks = Array.isArray(currentLinks) ? [...currentLinks, link] : [link];
            handleCellEdit(bugId, 'refLinks', updatedLinks);
        }
        setNewLink('');
        setActiveLinkModal(null);
        showAlert({ type: 'success', message: 'Link added successfully' });
    };

    const handleRemoveImage = (bugId, imageToRemove) => {
        if (bugId === 'new') {
            if (newRowEditing) {
                const currentImages = newRowTempData.images || newRowData.images || '';
                const imagesArray = currentImages ? currentImages.split(',') : [];
                const updatedImages = imagesArray.filter(img => img !== imageToRemove);
                setNewRowTempData(prev => ({ ...prev, images: updatedImages.join(',') }));
            } else {
                const currentImages = newRowData.images || '';
                const imagesArray = currentImages ? currentImages.split(',') : [];
                const updatedImages = imagesArray.filter(img => img !== imageToRemove);
                handleNewRowEdit('images', updatedImages.join(','));
            }
        } else {
            const bug = bugs.find(b => b._id === bugId);
            const currentImages = bug?.images || [];
            const updatedImages = currentImages.filter(img => img !== imageToRemove);
            handleCellEdit(bugId, 'images', updatedImages);
        }
        showAlert({ type: 'success', message: 'Image removed successfully' });
    };

    const handleRemoveLink = (bugId, linkToRemove) => {
        if (bugId === 'new') {
            if (newRowEditing) {
                const currentLinks = newRowTempData.refLinks || newRowData.refLinks || '';
                const linksArray = currentLinks ? currentLinks.split(',') : [];
                const updatedLinks = linksArray.filter(link => link !== linkToRemove);
                setNewRowTempData(prev => ({ ...prev, refLinks: updatedLinks.join(',') }));
            } else {
                const currentLinks = newRowData.refLinks || '';
                const linksArray = currentLinks ? currentLinks.split(',') : [];
                const updatedLinks = linksArray.filter(link => link !== linkToRemove);
                handleNewRowEdit('refLinks', updatedLinks.join(','));
            }
        } else {
            const bug = bugs.find(b => b._id === bugId);
            const currentLinks = bug?.refLinks || [];
            const updatedLinks = currentLinks.filter(link => link !== linkToRemove);
            handleCellEdit(bugId, 'refLinks', updatedLinks);
        }
        showAlert({ type: 'success', message: 'Link removed successfully' });
    };

    const moveBugToTrash = async (bugId) => {
        try {
            const response = await fetch(
                `${BASE_URL}/projects/${selectedProject._id}/test-types/${testTypeId}/bugs/${bugId}/trash`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to move bug to trash');
            await fetchBugs(currentPage);
            showAlert({ type: 'success', message: 'Bug moved to trash' });
        } catch (error) {
            showAlert({ type: 'error', message: 'Failed to move bug to trash' });
        }
    };

    const deleteBugPermanently = async (bugId) => {
        try {
            const response = await fetch(
                `${BASE_URL}/projects/${selectedProject._id}/test-types/${testTypeId}/bugs/${bugId}/permanent`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to delete bug permanently');
            await fetchBugs(currentPage);
            showAlert({ type: 'success', message: 'Bug deleted permanently' });
        } catch (error) {
            showAlert({ type: 'error', message: 'Failed to delete bug permanently' });
        }
    };

    const startColumnResize = (columnKey, e) => {
        e.preventDefault();
        setResizing({ type: 'column', key: columnKey });
        resizeStartX.current = e.clientX;
        resizeStartWidth.current = columnWidths[columnKey];
    };

    const startRowResize = (rowKey, e) => {
        e.preventDefault();
        setResizing({ type: 'row', key: rowKey });
        resizeStartY.current = e.clientY;
        resizeStartHeight.current = rowHeights[rowKey] || rowHeights.default;
    };

    const handleMouseMove = useCallback((e) => {
        if (!resizing) return;

        if (resizing.type === 'column') {
            const diff = e.clientX - resizeStartX.current;
            const newWidth = Math.max(70, resizeStartWidth.current + diff);
            setColumnWidths(prev => ({ ...prev, [resizing.key]: newWidth }));
        } else if (resizing.type === 'row') {
            const diff = e.clientY - resizeStartY.current;
            const newHeight = Math.max(36, resizeStartHeight.current + diff);
            setRowHeights(prev => ({ ...prev, [resizing.key]: newHeight }));
        }
    }, [resizing]);

    const handleMouseUp = useCallback(() => {
        setResizing(null);
    }, []);

    useEffect(() => {
        if (resizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [resizing, handleMouseMove, handleMouseUp]);

    const filteredBugs = bugs.filter(bug =>
        Object.values(bug).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const getPriorityColor = (priority) => {
        const colors = {
            'Critical': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700',
            'High': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700',
            'Medium': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700',
            'Low': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700'
        };
        return colors[priority] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600';
    };

    const getStatusColor = (status) => {
        const colors = {
            'New': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700',
            'Open': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700',
            'In Progress': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700',
            'In Review': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700',
            'Closed': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700',
            'Re Open': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
        };
        return colors[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600';
    };

    const getBugTypeColor = (type) => {
        const colors = {
            'Functional': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700',
            'User-Interface': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700',
            'Security': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700',
            'Database': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700',
            'Performance': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700'
        };
        return colors[type] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600';
    };

    const calculateDropdownPosition = (cellKey) => {
        const buttonElement = dropdownButtonRefs.current[cellKey];
        if (!buttonElement) return false;
        const rect = buttonElement.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        return spaceBelow < 300 && spaceAbove > spaceBelow;
    };

    const handleDropdownClick = (cellKey) => {
        if (activeDropdown === cellKey) {
            setActiveDropdown(null);
        } else {
            const shouldOpenUpward = calculateDropdownPosition(cellKey);
            setDropdownOpenUpward(prev => ({ ...prev, [cellKey]: shouldOpenUpward }));
            setActiveDropdown(cellKey);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showAlert({ type: 'success', message: 'Copied to clipboard' });
    };

    const renderDropdown = (bugId, column, value) => {
        const cellKey = `${bugId}-${column.key}`;
        const isActive = activeDropdown === cellKey;
        const openUpward = dropdownOpenUpward[cellKey] || false;

        let badgeClass = '';
        if (column.key === 'priority' || column.key === 'severity') {
            badgeClass = getPriorityColor(value);
        } else if (column.key === 'status') {
            badgeClass = getStatusColor(value);
        } else if (column.key === 'bugType') {
            badgeClass = getBugTypeColor(value);
        }

        return (
            <div className="relative w-full h-full" ref={isActive ? dropdownRef : null}>
                <button
                    ref={(el) => {
                        if (el) dropdownButtonRefs.current[cellKey] = el;
                    }}
                    onClick={() => handleDropdownClick(cellKey)}
                    className="w-full h-full px-2 py-1.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                >
                    <span className={`px-2 py-1 w-full rounded text-xs font-medium border ${badgeClass}`}>
                        {value || 'Select'}
                    </span>
                </button>

                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            initial={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className={`absolute ${openUpward ? 'bottom-full mb-1' : 'top-full mt-1'} left-0 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden`}
                        >
                            <div className="py-1 max-h-64 overflow-y-auto">
                                {column.options.map((option) => {
                                    let optionBadgeClass = '';
                                    if (column.key === 'priority' || column.key === 'severity') {
                                        optionBadgeClass = getPriorityColor(option);
                                    } else if (column.key === 'status') {
                                        optionBadgeClass = getStatusColor(option);
                                    } else if (column.key === 'bugType') {
                                        optionBadgeClass = getBugTypeColor(option);
                                    }

                                    return (
                                        <button
                                            key={option}
                                            onClick={() => handleDropdownSelect(bugId, column.key, option)}
                                            className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${value === option ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                        >
                                            <span className={`px-2 py-1 rounded text-xs font-medium border ${optionBadgeClass}`}>
                                                {option}
                                            </span>
                                            {value === option && (
                                                <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const renderLinksDropdown = (bugId, refLinks) => {
        const cellKey = `links-${bugId}`;
        const isActive = activeLinksDropdown === cellKey;
        const links = Array.isArray(refLinks) ? refLinks : (refLinks ? [refLinks] : []);
        const validLinks = links.filter(link => link && link !== 'No Link Provided');
        const buttonRef = linksButtonRefs.current[cellKey];
        const rect = buttonRef?.getBoundingClientRect();
        const spaceBelow = window.innerHeight - (rect?.bottom || 0);
        const openUpward = spaceBelow < 300;

        return (
            <>
                <button
                    ref={(el) => {
                        if (el) linksButtonRefs.current[cellKey] = el;
                    }}
                    onClick={() => setActiveLinksDropdown(isActive ? null : cellKey)}
                    className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors relative"
                >
                    <LinkIcon size={14} />
                </button>

                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            ref={linksDropdownRef}
                            initial={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className={`absolute ${openUpward ? 'bottom-full mb-2' : 'top-full mt-2'} right-0 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50`}
                        >
                            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <LinkIcon size={16} className="text-gray-600 dark:text-gray-400" />
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Links</h3>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setActiveLinkModal(bugId)}
                                        className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                        title="Add new link"
                                    >
                                        <Plus size={14} />
                                    </button>
                                    <button
                                        onClick={() => setActiveLinksDropdown(null)}
                                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-64 overflow-y-auto">
                                {validLinks.length === 0 ? (
                                    <div className="px-3 py-4 text-center text-gray-500 dark:text-gray-400 text-xs">
                                        No links added yet
                                    </div>
                                ) : (
                                    validLinks.map((link, index) => (
                                        <div key={index} className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <div className="flex items-center justify-between gap-2">
                                                <a
                                                    href={link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 truncate"
                                                >
                                                    {link}
                                                </a>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => copyToClipboard(link)}
                                                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                                        title="Copy link"
                                                    >
                                                        <Copy size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveLink(bugId, link)}
                                                        className="p-1 text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                        title="Remove link"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
        );
    };

    const renderImagesDropdown = (bugId, images) => {
        const cellKey = `images-${bugId}`;
        const isActive = activeImagesDropdown === cellKey;
        const imageArray = Array.isArray(images) ? images : (images ? [images] : []);
        const validImages = imageArray.filter(img => img && img !== 'No Image Provided' && img !== 'No Image provided');
        const buttonRef = imagesButtonRefs.current[cellKey];
        const rect = buttonRef?.getBoundingClientRect();
        const spaceBelow = window.innerHeight - (rect?.bottom || 0);
        const openUpward = spaceBelow < 300;

        return (
            <>
                <button
                    ref={(el) => {
                        if (el) imagesButtonRefs.current[cellKey] = el;
                    }}
                    onClick={() => setActiveImagesDropdown(isActive ? null : cellKey)}
                    className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors relative"
                >
                    <ImageIcon size={14} />
                </button>

                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            ref={imagesDropdownRef}
                            initial={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className={`absolute ${openUpward ? 'bottom-full mb-2' : 'top-full mt-2'} right-0 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50`}
                        >
                            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <ImageIcon size={16} className="text-gray-600 dark:text-gray-400" />
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Images</h3>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setActiveImageModal(bugId)}
                                        className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                        title="Upload new image"
                                    >
                                        <Plus size={14} />
                                    </button>
                                    <button
                                        onClick={() => setActiveImagesDropdown(null)}
                                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-64 overflow-y-auto">
                                {validImages.length === 0 ? (
                                    <div className="px-3 py-4 text-center text-gray-500 dark:text-gray-400 text-xs">
                                        No images added yet
                                    </div>
                                ) : (
                                    validImages.map((image, index) => (
                                        <div key={index} className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 flex-1">
                                                    <img
                                                        src={image}
                                                        alt={`Image ${index + 1}`}
                                                        className="w-10 h-10 object-cover rounded border border-gray-200 dark:border-gray-600"
                                                    />
                                                    <span className="text-xs text-gray-700 dark:text-gray-300">Image {index + 1}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => setImagePreviewModal(image)}
                                                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                                        title="View full size"
                                                    >
                                                        <ZoomIn size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveImage(bugId, image)}
                                                        className="p-1 text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                        title="Remove image"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
        );
    };

    const renderLinkModal = (bugId) => {
        const isActive = activeLinkModal === bugId;
        if (!isActive) return null;

        const buttonRef = linksButtonRefs.current[`links-${bugId}`];
        const rect = buttonRef?.getBoundingClientRect();
        const spaceBelow = window.innerHeight - (rect?.bottom || 0);
        const openUpward = spaceBelow < 200;

        return (
            <motion.div
                ref={linkModalRef}
                initial={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={`absolute ${openUpward ? 'bottom-full mb-2' : 'top-full mt-2'} right-0 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50`}
            >
                <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Add Link</h3>
                    <button
                        onClick={() => setActiveLinkModal(null)}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
                <div className="p-3">
                    <input
                        type="text"
                        value={newLink}
                        onChange={(e) => setNewLink(e.target.value)}
                        placeholder="Enter link URL..."
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 mb-2"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveLinkModal(null)}
                            className="flex-1 px-2 py-1.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleAddLink(bugId, newLink)}
                            disabled={!newLink.trim()}
                            className="flex-1 px-2 py-1.5 text-xs bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
                        >
                            Add Link
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    };

    const renderImageModal = (bugId) => {
        const isActive = activeImageModal === bugId;
        if (!isActive) return null;

        const buttonRef = imagesButtonRefs.current[`images-${bugId}`];
        const rect = buttonRef?.getBoundingClientRect();
        const spaceBelow = window.innerHeight - (rect?.bottom || 0);
        const openUpward = spaceBelow < 200;

        return (
            <motion.div
                ref={imageModalRef}
                initial={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={`absolute ${openUpward ? 'bottom-full mb-2' : 'top-full mt-2'} right-0 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50`}
            >
                <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Upload Image</h3>
                    <button
                        onClick={() => setActiveImageModal(null)}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
                <div className="p-3">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                handleImageUpload(bugId, file);
                                setActiveImageModal(null);
                            }
                        }}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-2 py-1.5 text-xs bg-purple-600 dark:bg-purple-700 text-white rounded hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors flex items-center justify-center gap-1"
                    >
                        <ImageIcon size={14} />
                        Choose Image
                    </button>
                </div>
            </motion.div>
        );
    };

    const renderCommentModal = (bugId, buttonRef) => {
        const isActive = activeCommentModal === bugId;
        const bugComments = comments[bugId] || [];
        const isLoading = loadingComments[bugId];
        if (!isActive) return null;

        const rect = buttonRef?.getBoundingClientRect();
        const spaceBelow = window.innerHeight - (rect?.bottom || 0);
        const openUpward = spaceBelow < 400;

        return (
            <motion.div
                ref={commentModalRef}
                initial={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`absolute ${openUpward ? 'bottom-full mb-2' : 'top-full mt-2'} right-0 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50`}
                style={{ maxHeight: '360px' }}
            >
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1.5">
                        <MessageSquare size={16} className="text-gray-600 dark:text-gray-400" />
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Comments</h3>
                    </div>
                    <button
                        onClick={() => setActiveCommentModal(null)}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex gap-1.5">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    submitComment(bugId);
                                }
                            }}
                            placeholder="Add a comment..."
                            className="flex-1 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
                            disabled={submittingComment}
                        />
                        <button
                            onClick={() => submitComment(bugId)}
                            disabled={!newComment.trim() || submittingComment}
                            className="px-2 py-1.5 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {submittingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto" style={{ maxHeight: '220px' }}>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 size={20} className="animate-spin text-blue-600 dark:text-blue-400" />
                        </div>
                    ) : bugComments.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-xs">
                            No comments yet. Be the first to comment!
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {bugComments.map((comment, index) => (
                                <div key={index} className="px-3 py-2">
                                    <div className="flex items-start gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                                {comment.commentBy?.charAt(0).toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                                                    {comment.commentBy || 'Unknown User'}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-700 dark:text-gray-300 break-words">{comment.comment}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    const renderCellContent = (bug, column, isNewRow = false) => {
        const bugId = isNewRow ? 'new' : bug?._id;
        const value = isNewRow ? (newRowTempData[column.key] || newRowData[column.key]) : bug?.[column.key];
        const cellKey = `${bugId}-${column.key}`;
        const isSaving = savingCells.has(cellKey);
        const hasError = errorCells.has(cellKey);
        const rowHeight = rowHeights[bugId] || rowHeights.default;

        if (column.key === 'actions') {
            if (isNewRow) {
                return (
                    <div className="flex items-center justify-center h-full space-x-1">
                        {renderLinksDropdown('new', newRowTempData.refLinks || newRowData.refLinks)}
                        {renderImagesDropdown('new', newRowTempData.images || newRowData.images)}
                        {newRowEditing && (
                            <>
                                <button
                                    onClick={handleNewRowManualSave}
                                    className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                    disabled={isCreatingBug}
                                    title="Save"
                                >
                                    <Save size={14} />
                                </button>
                                <button
                                    onClick={handleNewRowCancel}
                                    className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                    title="Cancel"
                                >
                                    <Ban size={14} />
                                </button>
                            </>
                        )}
                        {isCreatingBug && <Loader2 size={14} className="animate-spin text-blue-500 dark:text-blue-400" />}
                        {renderLinkModal('new')}
                        {renderImageModal('new')}
                    </div>
                );
            }

            return (
                <div className="flex items-center justify-center h-full space-x-0.5 relative">
                    {renderLinksDropdown(bug._id, bug.refLinks)}
                    {renderImagesDropdown(bug._id, bug.images)}
                    <button
                        ref={(el) => {
                            if (el) commentButtonRefs.current[bug._id] = el;
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (activeCommentModal === bug._id) {
                                setActiveCommentModal(null);
                            } else {
                                setActiveCommentModal(bug._id);
                                fetchComments(bug._id);
                            }
                        }}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="Comments"
                    >
                        <MessageSquare size={14} />
                    </button>
                    <button
                        onClick={() => moveBugToTrash(bug._id)}
                        className="p-1.5 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition-colors"
                        title="Move to trash"
                    >
                        <Archive size={14} />
                    </button>
                    <button
                        onClick={() => deleteBugPermanently(bug._id)}
                        className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Delete permanently"
                    >
                        <Trash2 size={14} />
                    </button>
                    {renderCommentModal(bug._id, commentButtonRefs.current[bug._id])}
                    {renderLinkModal(bug._id)}
                    {renderImageModal(bug._id)}
                </div>
            );
        }

        if (column.key === 'serialNumber' && !isNewRow) {
            return (
                <div className="flex items-center justify-center h-full px-2 font-medium text-gray-700 dark:text-gray-300 text-xs">
                    {value}
                </div>
            );
        }

        if (column.type === 'select') {
            return renderDropdown(bugId, column, value);
        }

        if (editingCell?.bugId === bugId && editingCell?.columnKey === column.key) {
            return (
                <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={stopEditing}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            stopEditing();
                        }
                        if (e.key === 'Escape') {
                            setEditingCell(null);
                            setEditValue('');
                        }
                    }}
                    className="w-full h-full border-2 border-blue-500 outline-none bg-white dark:bg-gray-700 dark:text-gray-200 px-2 py-1.5 text-xs resize-none"
                    autoFocus
                    style={{ minHeight: rowHeight }}
                />
            );
        }

        const displayValue = value || '';

        return (
            <div
                className={`w-full h-full px-2 py-1.5 flex items-center text-xs relative ${column.editable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''}`}
                onDoubleClick={() => column.editable && (isNewRow ? handleNewRowCellClick(column.key) : startEditing(bugId, column.key, value))}
                style={{
                    minHeight: rowHeight,
                    maxHeight: rowHeight,
                    overflow: 'hidden'
                }}
                content-data={(column.key === 'bugDesc' || column.key === 'bugRequirement') && value ? value : ''}
                content-placement="top"
            >
                <span
                    className={`flex-1 ${!value && isNewRow ? 'text-gray-400 dark:text-gray-500 italic' : 'text-gray-700 dark:text-gray-300'}`}
                    style={{
                        lineHeight: '1.4',
                        maxHeight: rowHeight - 12,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: Math.floor((rowHeight - 12) / 18),
                        WebkitBoxOrient: 'vertical'
                    }}
                >
                    {value ? displayValue : (isNewRow ? 'Double-click to edit' : '')}
                </span>
                {isSaving && <Loader2 size={12} className="ml-1 animate-spin text-blue-500 dark:text-blue-400 flex-shrink-0" />}
                {hasError && <AlertCircle size={12} className="ml-1 text-red-500 dark:text-red-400 flex-shrink-0" />}
            </div>
        );
    };

    useEffect(() => {
        fetchBugs(1);
    }, [fetchBugs]);

    const getStickyLeftPosition = (columnKey) => {
        let position = 0;
        for (const col of columns) {
            if (col.key === columnKey) break;
            if (col.sticky) {
                position += columnWidths[col.key] || col.width;
            }
        }
        return position;
    };

    const goToFirstPage = () => fetchBugs(1);
    const goToLastPage = () => fetchBugs(totalPages);
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            fetchBugs(page);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen mt-15 bg-gradient-to-br from-gray-50 dark:from-gray-900 to-gray-100 dark:to-gray-800">
                <TableSkeletonLoader />
            </div>
        );
    }

    return (
        <div className="w-full bg-gradient-to-br from-gray-50 dark:from-gray-900 to-gray-100 dark:to-gray-800 flex flex-col">
            <AnimatePresence>
                {imagePreviewModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-75 dark:bg-opacity-90 z-50 flex items-center justify-center p-4"
                        onClick={() => setImagePreviewModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="relative max-w-4xl max-h-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setImagePreviewModal(null)}
                                className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
                            >
                                <X size={32} />
                            </button>
                            <img
                                src={imagePreviewModal}
                                alt="Preview"
                                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-1 overflow-auto relative">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto overflow-y-auto">
                        <div className="inline-block min-w-full">
                            <div className="flex sticky top-0 z-30 border-b border-gray-300 dark:border-gray-600 bg-gradient-to-r from-gray-50 dark:from-gray-800 to-gray-100 dark:to-gray-700">
                                {columns.map((column) => (
                                    <div
                                        key={column.key}
                                        className={`px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 text-xs border-r border-gray-300 dark:border-gray-600 relative group ${column.sticky ? 'sticky z-40' : ''}`}
                                        style={{
                                            width: columnWidths[column.key],
                                            minWidth: columnWidths[column.key],
                                            left: column.sticky ? `${getStickyLeftPosition(column.key)}px` : 'auto',
                                            background: column.color
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wide uppercase">
                                                {column.label}
                                            </span>
                                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <GripVertical size={10} className="text-gray-400 dark:text-gray-500" />
                                            </div>
                                        </div>
                                        <div
                                            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 dark:hover:bg-blue-400 group-hover:bg-blue-300 dark:group-hover:bg-blue-500 transition-colors"
                                            onMouseDown={(e) => startColumnResize(column.key, e)}
                                        />
                                    </div>
                                ))}
                                <div className="flex-1 border-b border-gray-300 dark:border-gray-600 bg-gradient-to-r from-gray-100 dark:from-gray-700 to-gray-50 dark:to-gray-800"></div>
                            </div>

                            <div className="flex border-b border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20 relative group">
                                {columns.map((column) => (
                                    <div
                                        key={`new-${column.key}`}
                                        className={`border-r border-gray-200 dark:border-gray-700 ${column.sticky ? 'sticky z-20 bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                                        style={{
                                            width: columnWidths[column.key],
                                            minWidth: columnWidths[column.key],
                                            height: rowHeights['new'] || rowHeights.default,
                                            left: column.sticky ? `${getStickyLeftPosition(column.key)}px` : 'auto'
                                        }}
                                    >
                                        {renderCellContent(null, column, true)}
                                    </div>
                                ))}
                                <div className="flex-1 bg-blue-50/50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800"></div>
                                <div
                                    className="absolute left-0 right-0 bottom-0 h-1 cursor-row-resize hover:bg-blue-500 dark:hover:bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onMouseDown={(e) => startRowResize('new', e)}
                                />
                            </div>

                            {filteredBugs.map((bug) => (
                                <div key={bug._id} className="flex border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative group">
                                    {columns.map((column) => (
                                        <div
                                            key={`${bug._id}-${column.key}`}
                                            className={`border-r border-gray-200 dark:border-gray-700 relative ${column.sticky ? 'sticky z-20 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50' : ''}`}
                                            style={{
                                                width: columnWidths[column.key],
                                                minWidth: columnWidths[column.key],
                                                height: rowHeights[bug._id] || rowHeights.default,
                                                left: column.sticky ? `${getStickyLeftPosition(column.key)}px` : 'auto'
                                            }}
                                        >
                                            {renderCellContent(bug, column)}
                                        </div>
                                    ))}
                                    <div className="flex-1 border-b border-gray-200 dark:border-gray-700 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50"></div>
                                    <div
                                        className="absolute left-0 right-0 bottom-0 h-1 cursor-row-resize hover:bg-blue-500 dark:hover:bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onMouseDown={(e) => startRowResize(bug._id, e)}
                                    />
                                </div>
                            ))}

                            {filteredBugs.length === 0 && (
                                <div className="flex justify-center items-center py-12 text-gray-500 dark:text-gray-400">
                                    <div className="text-center">
                                        <AlertCircle size={32} className="mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                                        <p className="text-sm font-medium dark:text-gray-300">No bugs found</p>
                                        <p className="text-xs mt-1 dark:text-gray-400">Start typing in the blank row above to create your first bug</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-1 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 sm:px-6">
                <div className="flex flex-col sm:flex-row items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Test Type:</span>{' '}
                        <span>{testTypeName || 'Not selected'}</span>
                    </div>
                    <div className="hidden sm:block h-3 w-px bg-gray-300 dark:bg-gray-600 mx-2" />
                    <div>
                        Showing <span className="font-medium">{(currentPage - 1) * ROWS_PER_PAGE + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(currentPage * ROWS_PER_PAGE, totalBugs)}</span> of{' '}
                        <span className="font-medium">{totalBugs}</span> results
                    </div>
                </div>

                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                        onClick={goToFirstPage}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="First page"
                    >
                        <span className="text-xs font-medium">&lt;&lt;</span>
                    </button>
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Previous page"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <div className="relative inline-flex items-center px-4 py-2 text-xs font-semibold text-gray-900 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600">
                        Page {currentPage} of {totalPages}
                    </div>
                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Next page"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                        onClick={goToLastPage}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Last page"
                    >
                        <span className="text-xs font-medium">&gt;&gt;</span>
                    </button>
                </nav>
            </div>
        </div>
    );
};

export default BugSpreadsheet;