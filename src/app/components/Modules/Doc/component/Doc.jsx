'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, Clock, Search, Loader2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProject } from '@/app/script/Project.context';
import { useTestType } from '@/app/script/TestType.context';
import { useAlert } from '@/app/script/Alert.context';

const OpenDocs = ({ onClose }) => {
  const router = useRouter();
  const { selectedProject } = useProject();
  const projectId = selectedProject?._id;
  const { testTypeId } = useTestType();
  const { showAlert } = useAlert();

  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const API_BASE_URL = 'http://localhost:5000/api/v1/doc';

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const fetchDocuments = async () => {
    if (!projectId || !testTypeId) {
      showAlert('Project or Test Type not selected', 'error');
      return;
    }

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
        setDocuments(data);
        setFilteredDocs(data);
      } else {
        showAlert('Failed to fetch documents', 'error');
      }
    } catch (error) {
      showAlert('Error fetching documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [projectId, testTypeId]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDocs(documents);
    } else {
      const filtered = documents.filter(doc =>
        doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.slug?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDocs(filtered);
    }
  }, [searchQuery, documents]);

  const handleDocumentClick = (doc, event) => {
    if (!doc.slug || !selectedProject?.slug) {
      showAlert('Document or project information missing', 'error');
      return;
    }

    // Single click - open in current tab
    if (event.detail === 1) {
      router.push(`/app/projects/${selectedProject.slug}/doc/${doc.slug}`);
      onClose();
    }
  };

  const handleDocumentDoubleClick = (doc) => {
    if (!doc.slug || !selectedProject?.slug) {
      showAlert('Document or project information missing', 'error');
      return;
    }

    // Double click - open in new tab
    const url = `/app/projects/${selectedProject.slug}/doc/${doc.slug}`;
    window.open(url, '_blank');
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text) return 'Untitled Document';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '..';
  };

  // Skeleton Loader Component
  const DocumentSkeleton = () => (
    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
  initial={{ x: -320, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  exit={{ x: -320, opacity: 0 }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
  className="fixed left-0 top-0 h-full z-50 w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-auto"
  >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05, duration: 0.15 }}
        className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800"
      >
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Open Documents</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDocuments}
            disabled={loading}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
            tooltip-data="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
          tooltip-data="Close"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08, duration: 0.15 }}
        className="p-4 border-b border-gray-200 dark:border-gray-800"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
          />
        </div>
      </motion.div>

      {/* Documents List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          // Skeleton Loaders
          <div className="space-y-2">
            {[...Array(6)].map((_, index) => (
              <DocumentSkeleton key={index} />
            ))}
          </div>
        ) : filteredDocs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center p-4"
          >
            <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No documents found' : 'No documents yet'}
            </p>
            {!searchQuery && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Create your first document to get started
              </p>
            )}
          </motion.div>
        ) : (
          filteredDocs.map((doc, index) => (
            <motion.div
              key={doc._id || doc.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 + index * 0.02, duration: 0.15 }}
              onClick={(e) => handleDocumentClick(doc, e)}
              onDoubleClick={() => handleDocumentDoubleClick(doc)}
              className="p-3 rounded-lg border cursor-pointer transition-all bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p
                    className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate"
                    tooltip-data={doc.title || 'Untitled Document'}
                  >
                    {truncateText(doc.title || 'Untitled Document')}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12, duration: 0.15 }}
        className="p-4 border-t border-gray-200 dark:border-gray-800"
      >
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
              <span>Loading...</span>
            </div>
          ) : (
            `${filteredDocs.length} document${filteredDocs.length !== 1 ? 's' : ''} found`
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OpenDocs;