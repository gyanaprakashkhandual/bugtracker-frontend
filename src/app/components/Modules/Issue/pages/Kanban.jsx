'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, ArrowDownToLine, Eye, Archive, Trash, Edit2, Save, ChevronLeft, ChevronRight, X, Link, ImageIcon, Calendar, Clock, MessageSquare, Send } from 'lucide-react';
import axios from 'axios';
import { useProject } from '@/app/script/Project.context';

// Animation variants for columns and cards
const columnVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  hover: { scale: 1.01 },
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  drag: { scale: 0.95, rotate: 2 },
};

// Status colors for columns
const statusColors = {
  Open: 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800',
  'On Going': 'bg-yellow-50 dark:bg-yellow-900/50 border-yellow-200 dark:border-yellow-800',
  'In Review': 'bg-purple-50 dark:bg-purple-900/50 border-purple-200 dark:border-purple-800',
  Closed: 'bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800',
};

// Status badge colors
const statusBadgeColors = {
  Open: 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-100',
  'On Going': 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-100',
  'In Review': 'bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-100',
  Closed: 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-100',
};

// Date formatting utility
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Custom Dropdown Component (simplified for example)
const GitHubDropdown = ({ value, options, onChange, label, name }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    name={name}
    className="text-xs px-3 py-1.5 border border-sky-300 dark:border-sky-700 rounded-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm font-medium text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-600"
  >
    <option value="">{label}</option>
    {options.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);

const KanbanBoard = () => {
  const { selectedProject } = useProject();
  const projectId = selectedProject?._id;

  const [issues, setIssues] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [draggedIssue, setDraggedIssue] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedIssue, setEditedIssue] = useState({});
  const [currentIssueIndex, setCurrentIssueIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleSidebarChange = (event) => {
      const { isOpen } = event.detail;
      console.log('Sidebar is now:', isOpen ? 'open' : 'closed');
      setIsSidebarOpen(isOpen);
    };
    window.addEventListener('sidebarStateChanged', handleSidebarChange);
    return () => {
      window.removeEventListener('sidebarStateChanged', handleSidebarChange);
    };
  }, []);

  const statuses = ['Open', 'On Going', 'In Review', 'Closed'];
  const issueTypeOptions = ['Bug', 'Feature', 'Task', 'Improvement'];
  const statusOptions = statuses;

  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Get axios config with token
  const getAuthConfig = () => {
    const token = getAuthToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  // Fetch issues by project
  const fetchIssues = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `http://localhost:5000/api/v1/issue/project/${projectId}`,
        getAuthConfig()
      );
      setIssues(response.data.data);
    } catch (err) {
      setError('Failed to fetch issues');
      console.error('Error fetching issues:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments for an issue
  const fetchComments = async (issueId, testTypeId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `http://localhost:5000/api/v1/comment/projects/${projectId}/issues/${issueId}/comments`,
        getAuthConfig()
      );
      setComments(response.data.comments);
    } catch (err) {
      setError('Failed to fetch comments');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Post a new comment
  const handlePostComment = async () => {
    if (!newComment.trim() || !selectedIssue || !projectId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(
        `http://localhost:5000/api/v1/comment/projects/${projectId}/issues/${selectedIssue._id}/comments`,
        {
          comment: newComment,
          issueId: selectedIssue._id
        },
        getAuthConfig()
      );
      setComments([...comments, response.data.comment]);
      setNewComment('');
    } catch (err) {
      setError('Failed to post comment');
      console.error('Error posting comment:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update issue status (drag and drop)
  const handleUpdateIssueStatus = async (issueId, newStatus) => {
    try {
      setLoading(true);
      setError(null);
      await axios.put(
        `http://localhost:5000/api/v1/issue/${issueId}`,
        { status: newStatus },
        getAuthConfig()
      );
      // Refresh issues after update
      await fetchIssues();
    } catch (err) {
      setError('Failed to update issue status');
      console.error('Error updating issue status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new issue
  const handleCreateIssue = async (issueData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(
        'http://localhost:5000/api/v1/issue',
        {
          ...issueData,
          project: projectId
        },
        getAuthConfig()
      );
      setIssues([...issues, response.data.data]);
      return response.data.data;
    } catch (err) {
      setError('Failed to create issue');
      console.error('Error creating issue:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update existing issue
  const handleUpdateIssue = async (issueId, issueData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put(
        `http://localhost:5000/api/v1/issue/${issueId}`,
        issueData,
        getAuthConfig()
      );
      // Update local state
      setIssues(issues.map(issue =>
        issue._id === issueId ? response.data.data : issue
      ));
      return response.data.data;
    } catch (err) {
      setError('Failed to update issue');
      console.error('Error updating issue:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete issue
  const handleDeleteIssue = async (issueId) => {
    try {
      setLoading(true);
      setError(null);
      await axios.delete(
        `http://localhost:5000/api/v1/issue/${issueId}`,
        getAuthConfig()
      );
      setIssues(issues.filter(issue => issue._id !== issueId));
    } catch (err) {
      setError('Failed to delete issue');
      console.error('Error deleting issue:', err);
    } finally {
      setLoading(false);
    }
  };

  // Move issue to trash
  const handleMoveIssueToTrash = async (issueId) => {
    try {
      setLoading(true);
      await axios.patch(
        `http://localhost:5000/api/v1/issue/${issueId}/trash`,
        {},
        getAuthConfig()
      );
      setIssues(issues.filter((i) => i._id !== issueId));
      if (selectedIssue?._id === issueId) {
        setIsModalOpen(false);
      }
    } catch (err) {
      setError('Failed to move issue to trash');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete issue permanently
  const handleDeleteIssuePermanently = async (issueId) => {
    try {
      setLoading(true);
      await axios.delete(
        `http://localhost:5000/api/v1/issue/${issueId}`,
        getAuthConfig()
      );
      setIssues(issues.filter((i) => i._id !== issueId));
      if (selectedIssue?._id === issueId) {
        setIsModalOpen(false);
      }
    } catch (err) {
      setError('Failed to delete issue');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Drag handlers
  const handleDragStart = (e, issue) => {
    setDraggedIssue(issue);
    e.dataTransfer.setData('issueId', issue._id);
  };

  const handleDragEnd = () => {
    setDraggedIssue(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (status) => {
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData('issueId');
    const issue = issues.find((i) => i._id === issueId);
    if (issue && issue.status !== newStatus) {
      await handleUpdateIssueStatus(issueId, newStatus);
    }
    setDragOverColumn(null);
  };

  // View issue details
  const handleViewIssue = (issue, index) => {
    setSelectedIssue(issue);
    setEditedIssue({ ...issue });
    setCurrentIssueIndex(index);
    setIsModalOpen(true);
    setIsEditMode(false);
    fetchComments(issue._id, issue.testType || 'default');
  };

  // Navigate between issues
  const handleNavigateIssue = (direction) => {
    const newIndex = direction === 'next' ? currentIssueIndex + 1 : currentIssueIndex - 1;
    if (newIndex >= 0 && newIndex < issues.length) {
      const newIssue = issues[newIndex];
      setSelectedIssue(newIssue);
      setEditedIssue({ ...newIssue });
      setCurrentIssueIndex(newIndex);
      fetchComments(newIssue._id, newIssue.testType || 'default');
    }
  };

  // Get issues by status
  const getIssuesByStatus = (status) => {
    return issues.filter((issue) => issue.status === status);
  };

  // Save edited issue
  const handleSaveEdit = async () => {
    try {
      await handleUpdateIssue(selectedIssue._id, editedIssue);
      setIsEditMode(false);
      setSelectedIssue(editedIssue);
      // Refresh issues to get updated data
      await fetchIssues();
    } catch (err) {
      console.error('Error saving issue:', err);
    }
  };

  // Fetch issues on mount or project change
  useEffect(() => {
    fetchIssues();
  }, [projectId]);

  return (
    <div className="max-h-[calc(100vh-69px)] p-2 kanban-scrollbar justify-center items-center bg-gray-50 dark:bg-gray-900">
      {error && <div className="text-red-500 dark:text-red-400 text-sm mb-2">{error}</div>}
      <div className="flex gap-3 overflow-x-auto">
        {statuses.map((status) => {
          const statusIssues = getIssuesByStatus(status);

          return (
            <motion.div
              key={status}
              variants={columnVariants}
              initial="initial"
              animate="animate"
              className={`flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? 'w-[299px]' : 'w-[355px]'
                } min-h-[calc(100vh-80px)] ${statusColors[status]} border rounded-lg p-3 ${dragOverColumn === status ? 'ring-2 ring-blue-400 dark:ring-blue-600 ring-offset-2' : ''
                }`}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragEnter(status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-100 uppercase tracking-wide">
                  {status}
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadgeColors[status]} font-medium`}>
                  {statusIssues.length}
                </span>
              </div>

              <div className="space-y-2 max-h-[calc(100vh-180px)] overflow-y-auto">
                {statusIssues.length === 0 ? (
                  <motion.div
                    className="flex flex-col items-center justify-center py-16 px-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  >
                    <motion.div
                      className="relative w-20 h-20 mb-4"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Inbox className="w-9 h-9 text-blue-400 dark:text-blue-100" strokeWidth={1.5} />
                      </motion.div>
                      <motion.div
                        className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center border border-blue-100 dark:border-gray-700"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                      >
                        <ArrowDownToLine className="w-4 h-4 text-blue-500 dark:text-blue-100" strokeWidth={2} />
                      </motion.div>
                      <motion.div
                        className="absolute -top-2 -left-2 w-2 h-2 bg-blue-200 dark:bg-blue-900 rounded-full"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <motion.div
                        className="absolute -bottom-2 -left-3 w-1.5 h-1.5 bg-indigo-200 dark:bg-indigo-900 rounded-full"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                      />
                    </motion.div>
                    <motion.h4
                      className="text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1.5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      No Issues Here
                    </motion.h4>
                    <motion.p
                      className="text-xs text-gray-500 dark:text-gray-100 text-center max-w-[200px] leading-relaxed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      Drag and drop issue cards to this column
                    </motion.p>
                    <motion.div
                      className="mt-6 w-32 h-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                      whileHover={{ scale: 1.05, borderColor: '#93c5fd' }}
                    >
                      <span className="text-xs text-gray-400 dark:text-gray-100 font-medium">Drop here</span>
                    </motion.div>
                  </motion.div>
                ) : (
                  <AnimatePresence>
                    {statusIssues.map((issue, index) => (
                      <motion.div
                        key={issue._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, issue)}
                        onDragEnd={handleDragEnd}
                        variants={cardVariants}
                        initial="initial"
                        animate="animate"
                        whileDrag="drag"
                        className={`bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 cursor-move hover:shadow-md transition-all duration-200 ${draggedIssue?._id === issue._id ? 'opacity-40 rotate-2 scale-95' : ''
                          }`}
                        layout
                        transition={{
                          layout: { duration: 0.3, ease: 'easeInOut' },
                          default: { duration: 0.2 },
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-100">{issue.serialNumber}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${issue.issueType === 'Bug'
                              ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100'
                              : issue.issueType === 'Feature'
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100'
                                : issue.issueType === 'Task'
                                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-100'
                                  : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100'
                              }`}
                          >
                            {issue.issueType || 'Unknown'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-100 mb-2 line-clamp-2 leading-relaxed">
                          {issue.issueDesc}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                          <span className="text-xs text-gray-500 dark:text-gray-100">{issue.project?.name || 'No Project'}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewIssue(issue, index)}
                              className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-100" />
                            </button>
                            <button
                              onClick={() => handleMoveIssueToTrash(issue._id)}
                              className="p-1 hover:bg-yellow-50 dark:hover:bg-yellow-900 rounded transition-colors"
                            >
                              <Archive className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-100" />
                            </button>
                            <button
                              onClick={() => handleDeleteIssuePermanently(issue._id)}
                              className="p-1 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                            >
                              <Trash className="w-3.5 h-3.5 text-red-600 dark:text-red-100" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {isModalOpen && selectedIssue && (
          <motion.div
            className="fixed inset-0 backdrop-blur-md bg-white/30 dark:bg-black/30 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl w-full max-w-full h-[100vh] overflow-hidden flex shadow-2xl border border-sky-200 dark:border-sky-900"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-sky-200 dark:border-sky-900 bg-gradient-to-r from-white to-sky-50 dark:from-gray-900 dark:to-sky-950">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedIssue.serialNumber}</h2>
                    <div className="flex items-center gap-2">
                      {isEditMode ? (
                        <>
                          <GitHubDropdown
                            value={editedIssue.issueType}
                            options={issueTypeOptions}
                            onChange={(value) => setEditedIssue({ ...editedIssue, issueType: value })}
                            label="Select Issue Type"
                            name="issueType"
                          />
                          <GitHubDropdown
                            value={editedIssue.status}
                            options={statusOptions}
                            onChange={(value) => setEditedIssue({ ...editedIssue, status: value })}
                            label="Select Status"
                            name="status"
                          />
                        </>
                      ) : (
                        <>
                          <span className="text-xs px-3 py-1.5 border border-sky-300 dark:border-sky-700 rounded-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm font-medium text-gray-700 dark:text-gray-100">
                            {selectedIssue.issueType || 'Unknown'}
                          </span>
                          <span className={`text-xs px-3 py-1.5 rounded-md font-medium backdrop-blur-sm ${statusBadgeColors[selectedIssue.status]}`}>
                            {selectedIssue.status}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-100 font-medium">
                      {currentIssueIndex + 1} / {issues.length}
                    </span>
                    {isEditMode ? (
                      <button
                        onClick={handleUpdateIssue}
                        disabled={loading}
                        className="p-2 hover:bg-sky-100 dark:hover:bg-sky-900 rounded-lg transition-colors backdrop-blur-sm"
                      >
                        <Save className="w-4 h-4 text-sky-600 dark:text-sky-100" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsEditMode(true)}
                        className="p-2 hover:bg-sky-100 dark:hover:bg-sky-900 rounded-lg transition-colors backdrop-blur-sm"
                      >
                        <Edit2 className="w-4 h-4 text-sky-600 dark:text-sky-100" />
                      </button>
                    )}
                    <button
                      onClick={() => handleMoveIssueToTrash(selectedIssue._id)}
                      className="p-2 hover:bg-orange-100 dark:hover:bg-orange-900 rounded-lg transition-colors backdrop-blur-sm"
                    >
                      <Archive className="w-4 h-4 text-orange-600 dark:text-orange-100" />
                    </button>
                    <button
                      onClick={() => handleDeleteIssuePermanently(selectedIssue._id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors backdrop-blur-sm"
                    >
                      <Trash className="w-4 h-4 text-red-600 dark:text-red-100" />
                    </button>
                    <div className="w-px h-6 bg-sky-300 dark:bg-sky-700 mx-1"></div>
                    <button
                      onClick={() => handleNavigateIssue('prev')}
                      disabled={currentIssueIndex <= 0}
                      className="p-2 hover:bg-sky-100 dark:hover:bg-sky-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-100" />
                    </button>
                    <button
                      onClick={() => handleNavigateIssue('next')}
                      disabled={currentIssueIndex >= issues.length - 1}
                      className="p-2 hover:bg-sky-100 dark:hover:bg-sky-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-100" />
                    </button>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="p-2 hover:bg-sky-100 dark:hover:bg-sky-900 rounded-lg transition-colors backdrop-blur-sm"
                    >
                      <X className="w-4 h-4 text-gray-600 dark:text-gray-100" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-white via-sky-50/30 to-white dark:from-gray-900 dark:via-sky-950/30 dark:to-gray-900">
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-sky-200 dark:border-sky-900 rounded-lg p-5">
                    <h3 className="text-xs font-semibold text-sky-600 dark:text-sky-100 uppercase tracking-wider mb-3">PROJECT</h3>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{selectedIssue.project?.name || 'No Project'}</p>
                  </div>

                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-sky-200 dark:border-sky-900 rounded-lg p-5">
                    <h3 className="text-xs font-semibold text-sky-600 dark:text-sky-100 uppercase tracking-wider mb-3">DESCRIPTION</h3>
                    {isEditMode ? (
                      <textarea
                        value={editedIssue.issueDesc}
                        onChange={(e) => setEditedIssue({ ...editedIssue, issueDesc: e.target.value })}
                        rows={4}
                        className="w-full text-sm px-3 py-2 border border-sky-300 dark:border-sky-700 rounded-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-600 resize-none"
                      />
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-100 leading-relaxed">{selectedIssue.issueDesc}</p>
                    )}
                  </div>

                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-sky-200 dark:border-sky-900 rounded-lg p-5">
                    <h3 className="text-xs font-semibold text-sky-600 dark:text-sky-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Link className="w-3.5 h-3.5" />
                      REFERENCE LINKS
                    </h3>
                    {selectedIssue.refLink?.length > 0 ? (
                      <ul className="text-sm text-gray-700 dark:text-gray-100">
                        {selectedIssue.refLink.map((link, index) => (
                          <li key={index}>
                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                              {link}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-100 text-center py-8">No reference links</p>
                    )}
                  </div>

                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-sky-200 dark:border-sky-900 rounded-lg p-5">
                    <h3 className="text-xs font-semibold text-sky-600 dark:text-sky-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <ImageIcon className="w-3.5 h-3.5" />
                      IMAGES
                    </h3>
                    {selectedIssue.image?.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {selectedIssue.image.map((img, index) => (
                          <img key={index} src={img} alt={`Issue ${index + 1}`} className="rounded-lg object-cover w-full h-32" />
                        ))}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-sky-200 dark:border-sky-800 rounded-lg py-12 bg-sky-50/30 dark:bg-sky-950/30">
                        <p className="text-sm text-gray-400 dark:text-gray-100 text-center">No images available</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950 backdrop-blur-xl border border-sky-200 dark:border-sky-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-sky-700 dark:text-sky-100 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">CREATED AT</span>
                      </div>
                      <p className="text-sm font-medium text-sky-900 dark:text-sky-100">{formatDate(selectedIssue.createdAt)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-sky-50 dark:from-purple-950 dark:to-sky-950 backdrop-blur-xl border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-purple-700 dark:text-purple-100 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">UPDATED AT</span>
                      </div>
                      <p className="text-sm font-medium text-purple-900 dark:text-purple-100">{formatDate(selectedIssue.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-96 border-l border-sky-200 dark:border-sky-900 flex flex-col bg-gradient-to-b from-white to-sky-50 dark:from-gray-900 dark:to-sky-950">
                <div className="px-6 py-4 border-b border-sky-200 dark:border-sky-900 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-sky-600 dark:text-sky-100" />
                    COMMENTS ({comments.length})
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                      <MessageSquare className="w-12 h-12 text-sky-300 dark:text-sky-800 mb-3" />
                      <p className="text-sm text-gray-400 dark:text-gray-100 font-medium">No comments yet</p>
                      <p className="text-xs text-gray-400 dark:text-gray-100 mt-1">Be the first to comment</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <motion.div
                        key={comment._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-sky-200 dark:border-sky-800 rounded-lg p-4 shadow-md"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{comment.commentBy}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-100">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-100 leading-relaxed">{comment.comment}</p>
                      </motion.div>
                    ))
                  )}
                </div>

                <div className="p-4 border-t border-sky-200 dark:border-sky-900 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full text-sm px-3 py-2 border border-sky-300 dark:border-sky-700 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-600 resize-none mb-3"
                    rows={3}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handlePostComment();
                      }
                    }}
                  />
                  <button
                    onClick={handlePostComment}
                    disabled={loading || !newComment.trim()}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-700 dark:to-blue-700 text-white dark:text-gray-100 text-sm font-medium rounded-lg hover:from-sky-700 hover:to-blue-700 dark:hover:from-sky-600 dark:hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Post Comment
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KanbanBoard;