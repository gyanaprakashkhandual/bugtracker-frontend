'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMessageSquare, 
  FiImage, 
  FiUser, 
  FiCalendar,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiFilter,
  FiX,
  FiCheck,
  FiClock
} from 'react-icons/fi';

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [filters, setFilters] = useState({
    hasImage: 'all',
    user: 'all',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Form states
  const [formData, setFormData] = useState({
    feedbackDescription: '',
    image: ''
  });

  const BASE_URL = 'http://localhost:5000/api/v1/feed-back';

  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // API call function
  const apiCall = async (url, options = {}) => {
    const token = getToken();
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  // Fetch all feedbacks
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await apiCall(`${BASE_URL}/all`);
      setFeedbacks(data.data || []);
      setFilteredFeedbacks(data.data || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      alert('Failed to fetch feedbacks');
    } finally {
      setLoading(false);
    }
  };

  // Create feedback
  const createFeedback = async (e) => {
    e.preventDefault();
    try {
      await apiCall(BASE_URL, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      setShowCreateModal(false);
      setFormData({ feedbackDescription: '', image: '' });
      fetchFeedbacks();
      alert('Feedback created successfully!');
    } catch (error) {
      alert('Failed to create feedback: ' + error.message);
    }
  };

  // Update feedback
  const updateFeedback = async (e) => {
    e.preventDefault();
    try {
      await apiCall(`${BASE_URL}/${editingFeedback._id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      
      setEditingFeedback(null);
      setFormData({ feedbackDescription: '', image: '' });
      fetchFeedbacks();
      alert('Feedback updated successfully!');
    } catch (error) {
      alert('Failed to update feedback: ' + error.message);
    }
  };

  // Delete feedback
  const deleteFeedback = async (id) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    
    try {
      await apiCall(`${BASE_URL}/${id}`, {
        method: 'DELETE'
      });
      
      fetchFeedbacks();
      alert('Feedback deleted successfully!');
    } catch (error) {
      alert('Failed to delete feedback: ' + error.message);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...feedbacks];

    // Filter by image
    if (filters.hasImage === 'with') {
      filtered = filtered.filter(fb => fb.image);
    } else if (filters.hasImage === 'without') {
      filtered = filtered.filter(fb => !fb.image);
    }

    // Filter by user
    if (filters.user !== 'all') {
      filtered = filtered.filter(fb => fb.user?._id === filters.user);
    }

    // Filter by date range
    if (filters.startDate) {
      filtered = filtered.filter(fb => new Date(fb.createdAt) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(fb => new Date(fb.createdAt) <= new Date(filters.endDate));
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[filters.sortBy];
      const bVal = b[filters.sortBy];
      
      if (filters.sortOrder === 'desc') {
        return new Date(bVal) - new Date(aVal);
      } else {
        return new Date(aVal) - new Date(bVal);
      }
    });

    setFilteredFeedbacks(filtered);
    setShowFilterModal(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      hasImage: 'all',
      user: 'all',
      startDate: '',
      endDate: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setFilteredFeedbacks(feedbacks);
    setShowFilterModal(false);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Initialize edit form
  const initEdit = (feedback) => {
    setEditingFeedback(feedback);
    setFormData({
      feedbackDescription: feedback.feedbackDescription,
      image: feedback.image || ''
    });
  };

  // Cancel edit/create
  const cancelForm = () => {
    setEditingFeedback(null);
    setShowCreateModal(false);
    setFormData({ feedbackDescription: '', image: '' });
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm">Loading feedbacks...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Feedback Management</h1>
              <p className="text-gray-600 text-sm mt-1">
                Total {filteredFeedbacks.length} feedback{filteredFeedbacks.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilterModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
              >
                <FiFilter className="w-4 h-4" />
                Filter
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <FiPlus className="w-4 h-4" />
                New Feedback
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Feedback Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredFeedbacks.map((feedback, index) => (
              <motion.div
                key={feedback._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                {/* User Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiUser className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {feedback.user?.name || 'Unknown User'}
                    </p>
                    <p className="text-gray-500 text-xs truncate">
                      {feedback.user?.role || 'No role'}
                    </p>
                  </div>
                </div>

                {/* Feedback Content */}
                <div className="mb-4">
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                    {feedback.feedbackDescription}
                  </p>
                </div>

                {/* Image */}
                {feedback.image && (
                  <div className="mb-4">
                    <img
                      src={feedback.image}
                      alt="Feedback attachment"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Date and Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <FiClock className="w-3 h-3" />
                    {formatDate(feedback.createdAt)}
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => initEdit(feedback)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FiEdit className="w-3 h-3" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteFeedback(feedback._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredFeedbacks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FiMessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No feedbacks found</h3>
            <p className="text-gray-500 text-sm mb-6">
              {feedbacks.length === 0 ? 'Create your first feedback to get started' : 'Try adjusting your filters'}
            </p>
            {feedbacks.length === 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Create Feedback
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {(showCreateModal || editingFeedback) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={cancelForm}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {editingFeedback ? 'Edit Feedback' : 'Create New Feedback'}
                  </h2>
                  
                  <form onSubmit={editingFeedback ? updateFeedback : createFeedback}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Feedback Description
                        </label>
                        <textarea
                          required
                          value={formData.feedbackDescription}
                          onChange={(e) => setFormData({...formData, feedbackDescription: e.target.value})}
                          rows="4"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="Enter your feedback..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Image URL (Optional)
                        </label>
                        <input
                          type="url"
                          value={formData.image}
                          onChange={(e) => setFormData({...formData, image: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        type="button"
                        onClick={cancelForm}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        {editingFeedback ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Modal */}
        <AnimatePresence>
          {showFilterModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowFilterModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Filter Feedbacks</h2>
                    <button
                      onClick={() => setShowFilterModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Image Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image Filter
                      </label>
                      <select
                        value={filters.hasImage}
                        onChange={(e) => setFilters({...filters, hasImage: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="all">All Feedbacks</option>
                        <option value="with">With Images</option>
                        <option value="without">Without Images</option>
                      </select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          From Date
                        </label>
                        <input
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          To Date
                        </label>
                        <input
                          type="date"
                          value={filters.endDate}
                          onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>

                    {/* Sort Options */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sort By
                        </label>
                        <select
                          value={filters.sortBy}
                          onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="createdAt">Date Created</option>
                          <option value="updatedAt">Date Updated</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Order
                        </label>
                        <select
                          value={filters.sortOrder}
                          onChange={(e) => setFilters({...filters, sortOrder: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="desc">Newest First</option>
                          <option value="asc">Oldest First</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={resetFilters}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      Reset
                    </button>
                    <button
                      onClick={applyFilters}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FeedbackPage;