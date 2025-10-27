'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, ExternalLink, X, Coffee, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTestType } from '@/app/script/TestType.context';
import { useAlert } from '@/app/script/Alert.context';
import { useProject } from '@/app/script/Project.context';
import { useSheet } from '@/app/script/Sheet.context';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { FaCoffee } from 'react-icons/fa';

const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
      </div>
    </div>
  </div>
);

export default function SheetManagement() {
  const { showAlert } = useAlert();
  const { selectedProject } = useProject();
  const projectId = selectedProject?._id;
  const { testTypeId, testTypeName } = useTestType();
  const { setSelectedSheet } = useSheet();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug;

  const [sheets, setSheets] = useState([]);
  const [filteredSheets, setFilteredSheets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentSheet, setCurrentSheet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    project: projectId,
    testType: testTypeId
  });

  const API_BASE_URL = 'https://caffetest.onrender.com/api/v1/sheet';

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const fetchSheets = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(
        `${API_BASE_URL}/project/${projectId}/test-type/${testTypeId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSheets(data);
        setFilteredSheets(data);
      } else {
        showAlert('Failed to fetch sheets', 'error');
      }
    } catch (error) {
      showAlert('Error fetching sheets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId && testTypeId) {
      fetchSheets();
    }
  }, [projectId, testTypeId]);

  useEffect(() => {
    const filtered = sheets.filter(sheet =>
      sheet.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSheets(filtered);
  }, [searchQuery, sheets]);

  const handleCreateSheet = async () => {
    if (!formData.title.trim()) {
      showAlert('Please enter a title', 'error');
      return;
    }

    try {
      setIsCreating(true);
      const token = getToken();
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          project: projectId,
          testType: testTypeId
        })
      });

      if (response.ok) {
        showAlert('Sheet created successfully', 'success');
        setIsCreateModalOpen(false);
        setFormData({ title: '', content: '', project: projectId, testType: testTypeId });
        fetchSheets();
      } else {
        showAlert('Failed to create sheet', 'error');
      }
    } catch (error) {
      showAlert('Error creating sheet', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateSheet = async () => {
    if (!formData.title.trim()) {
      showAlert('Please enter a title', 'error');
      return;
    }

    try {
      setIsUpdating(true);
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/${currentSheet._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          version: (currentSheet.version || 1) + 1
        })
      });

      if (response.ok) {
        showAlert('Sheet updated successfully', 'success');
        setIsEditModalOpen(false);
        setCurrentSheet(null);
        setFormData({ title: '', content: '', project: projectId, testType: testTypeId });
        fetchSheets();
      } else {
        showAlert('Failed to update sheet', 'error');
      }
    } catch (error) {
      showAlert('Error updating sheet', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteSheet = async (id) => {
    if (!confirm('Are you sure you want to delete this sheet?')) return;

    try {
      setDeletingId(id);
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showAlert('Sheet deleted successfully', 'success');
        fetchSheets();
      } else {
        showAlert('Failed to delete sheet', 'error');
      }
    } catch (error) {
      showAlert('Error deleting sheet', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (sheet) => {
    setCurrentSheet(sheet);
    setFormData({
      title: sheet.title,
      content: sheet.content,
      project: projectId,
      testType: testTypeId
    });
    setIsEditModalOpen(true);
  };

  const handleOpenSheet = (sheet) => {
    setSelectedSheet(sheet._id, sheet.title);
    setTimeout(() => {
      router.push(`/app/projects/${slug}/sheet/${sheet.slug}`);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FaCoffee className="w-8 h-8 text-blue-900" />
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedProject?.projectName || 'Project'}
                </span>
                <span className="text-gray-400 dark:text-slate-500">/</span>
                <span className="text-lg font-semibold text-gray-700 dark:text-slate-300">
                  {testTypeName || 'Test Type'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search sheets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full sm:w-64 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 transition-all"
                />
              </div>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg font-medium"
              >
                <Plus className="w-4 h-4" />
                Create Sheet
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredSheets.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-800 mb-4">
              <Search className="w-8 h-8 text-gray-400 dark:text-slate-500" />
            </div>
            <p className="text-gray-500 dark:text-slate-400 text-lg font-medium">No sheets found</p>
            <p className="text-gray-400 dark:text-slate-500 text-sm mt-1">Create your first sheet to get started</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredSheets.map((sheet) => (
              <motion.div
                key={sheet._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 sm:p-6 hover:shadow-lg hover:border-gray-300 dark:hover:border-slate-600 transition-all"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
                      {sheet.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleOpenSheet(sheet)}
                      className="p-2.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                      tooltip-data="Open Sheet"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => openEditModal(sheet)}
                      className="p-2.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-colors"
                      tooltip-data="Edit Sheet"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSheet(sheet._id)}
                      disabled={deletingId === sheet._id}
                      className="p-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors disabled:opacity-50"
                      tooltip-data="Delete Sheet"
                    >
                      {deletingId === sheet._id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
            onClick={() => setIsCreateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Sheet</h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Sheet Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    placeholder="Enter sheet title..."
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isCreating}
                  className="px-6 py-2.5 text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateSheet}
                  disabled={isCreating}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white rounded-xl transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isCreating ? 'Creating...' : 'Create Sheet'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Sheet</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Sheet Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    placeholder="Enter sheet title..."
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isUpdating}
                  className="px-6 py-2.5 text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateSheet}
                  disabled={isUpdating}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 text-white rounded-xl transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isUpdating ? 'Updating...' : 'Update Sheet'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}