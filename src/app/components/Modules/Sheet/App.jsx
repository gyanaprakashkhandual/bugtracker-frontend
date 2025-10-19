'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, ExternalLink, X, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTestType } from '@/app/script/TestType.context';
import { useAlert } from '@/app/script/Alert.context';
import { useProject } from '@/app/script/Project.context';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function SheetManagement() {
  const { showAlert } = useAlert();
  const { selectedProject } = useProject();
  const projectId = selectedProject?._id;
  const { testTypeId, testTypeName } = useTestType();
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
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    project: projectId,
    testType: testTypeId
  });

  const API_BASE_URL = 'http://localhost:5000/api/v1/sheet';

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
        showAlert({ type: 'error', message: 'Failed to fetch sheets' });
      }
    } catch (error) {
      showAlert({ type: 'error', message: 'Error fetching sheets' });
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
      showAlert({ type: 'error', message: 'Please enter a title' });
      return;
    }

    try {
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
        showAlert({ type: 'success', message: 'Sheet created successfully' });
        setIsCreateModalOpen(false);
        setFormData({ title: '', content: '', project: projectId, testType: testTypeId });
        fetchSheets();
      } else {
        showAlert({ type: 'error', message: 'Failed to create sheet' });
      }
    } catch (error) {
      showAlert({ type: 'error', message: 'Error creating sheet' });
    }
  };

  const handleUpdateSheet = async () => {
    if (!formData.title.trim()) {
      showAlert({ type: 'error', message: 'Please enter a title' });
      return;
    }

    try {
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
        showAlert({ type: 'success', message: 'Sheet updated successfully' });
        setIsEditModalOpen(false);
        setCurrentSheet(null);
        setFormData({ title: '', content: '', project: projectId, testType: testTypeId });
        fetchSheets();
      } else {
        showAlert({ type: 'error', message: 'Failed to update sheet' });
      }
    } catch (error) {
      showAlert({ type: 'error', message: 'Error updating sheet' });
    }
  };

  const handleDeleteSheet = async (id) => {
    if (!confirm('Are you sure you want to delete this sheet?')) return;

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showAlert({ type: 'success', message: 'Sheet deleted successfully' });
        fetchSheets();
      } else {
        showAlert({ type: 'error', message: 'Failed to delete sheet' });
      }
    } catch (error) {
      showAlert({ type: 'error', message: 'Error deleting sheet' });
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
    router.push(`/app/projects/${slug}/sheet/${sheet.slug}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <nav className="bg-white dark:bg-slate-800 shadow-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Coffee className="w-6 h-6 text-amber-600 dark:text-amber-500" />
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  {selectedProject?.name || 'Project'}
                </span>
                <span className="text-slate-400 dark:text-slate-500">/</span>
                <span className="text-lg font-medium text-slate-600 dark:text-slate-300">
                  {testTypeName || 'Test Type'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search sheets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
                />
              </div>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Sheet
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-500"></div>
          </div>
        ) : filteredSheets.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 dark:text-slate-400 text-lg">No sheets found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredSheets.map((sheet) => (
              <motion.div
                key={sheet._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      {sheet.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Created by: {sheet.createdBy?.name || 'Unknown'} • Version: {sheet.version || 1}
                    </p>
                    {sheet.slug && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Slug: {sheet.slug}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenSheet(sheet)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Open Sheet"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => openEditModal(sheet)}
                      className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="Edit Sheet"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSheet(sheet._id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete Sheet"
                    >
                      <Trash2 className="w-5 h-5" />
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsCreateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Create New Sheet</h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Sheet Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    placeholder="Enter sheet content..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateSheet}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Create Sheet
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Edit Sheet</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Sheet Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    placeholder="Enter sheet content..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateSheet}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Update Sheet
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}