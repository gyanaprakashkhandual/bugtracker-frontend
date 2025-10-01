// app/components/TestCases/TestCaseDetails.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2, FiMoreVertical, FiSend, FiAlertCircle, FiCalendar } from 'react-icons/fi';
import axios from 'axios';
import EditableField from './Edit';
import DropdownField from './Dropdwon';
import CommentsSection from './Comment';

const TestCaseDetails = ({ testCase, project, testTypeId, selectedTestType, onTestCaseUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  // Debug logs
  useEffect(() => {
    console.log('=== TestCaseDetails Debug ===');
    console.log('testCase:', testCase);
    console.log('project:', project);
    console.log('testTypeId:', testTypeId);
    console.log('selectedTestType:', selectedTestType);
    
    // Check localStorage
    const storedProjectId = localStorage.getItem('currentProjectId');
    const storedTestType = localStorage.getItem('selectedTestType');
    const storedTestCaseId = localStorage.getItem('currentTestCaseId');
    const token = localStorage.getItem('token');
    
    console.log('localStorage - currentProjectId:', storedProjectId);
    console.log('localStorage - selectedTestType:', storedTestType);
    console.log('localStorage - currentTestCaseId:', storedTestCaseId);
    console.log('localStorage - token exists:', !!token);
    console.log('============================');
  }, [testCase, project, testTypeId, selectedTestType]);

  // Fetch comments when test case is selected
  useEffect(() => {
    if (testCase && project && testTypeId) {
      console.log('Fetching comments...');
      fetchComments();
    } else {
      console.log('Missing data for fetching comments:', {
        hasTestCase: !!testCase,
        hasProject: !!project,
        hasTestTypeId: !!testTypeId
      });
    }
  }, [testCase, project, testTypeId]);

  const fetchComments = async () => {
    if (!testCase?._id || !project?._id || !testTypeId) {
      console.log('Cannot fetch comments - missing IDs');
      return;
    }
    
    try {
      setLoadingComments(true);
      const token = localStorage.getItem('token');
      console.log('Fetching comments from:', `http://localhost:5000/api/v1/comment/projects/${project._id}/test-types/${testTypeId}/test-cases/${testCase._id}/comments`);
      
      const response = await axios.get(
        `http://localhost:5000/api/v1/comment/projects/${project._id}/test-types/${testTypeId}/test-cases/${testCase._id}/comments`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      console.log('Comments fetched:', response.data.comments);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleFieldUpdate = async (field, value) => {
    if (!testCase?._id) {
      console.log('Cannot update - no test case ID');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      console.log('Updating field:', field, 'with value:', value);
      console.log('URL:', `http://localhost:5000/api/v1/test-case/test-cases/${testCase._id}`);
      
      await axios.put(
        `http://localhost:5000/api/v1/test-case/test-cases/${testCase._id}`,
        { [field]: value },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      console.log('Field updated successfully');
      onTestCaseUpdate(); // Refresh the test cases list
    } catch (error) {
      console.error('Error updating test case:', error);
      console.error('Error response:', error.response?.data);
      alert('Failed to update test case: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleMoveToTrash = async () => {
    if (!testCase?._id) return;
    
    try {
      const token = localStorage.getItem('token');
      console.log('Moving to trash:', testCase._id);
      
      await axios.patch(
        `http://localhost:5000/api/v1/test-case/test-cases/${testCase._id}/trash`,
        {},
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      console.log('Moved to trash successfully');
      onTestCaseUpdate();
      setShowDropdown(false);
    } catch (error) {
      console.error('Error moving to trash:', error);
      console.error('Error response:', error.response?.data);
      alert('Failed to move to trash: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeletePermanently = async () => {
    if (!testCase?._id) return;
    
    try {
      const token = localStorage.getItem('token');
      console.log('Deleting permanently:', testCase._id);
      
      await axios.delete(
        `http://localhost:5000/api/v1/test-case/test-cases/${testCase._id}`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      console.log('Deleted successfully');
      onTestCaseUpdate();
      setShowDropdown(false);
    } catch (error) {
      console.error('Error deleting test case:', error);
      console.error('Error response:', error.response?.data);
      alert('Failed to delete test case: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !testCase?._id || !project?._id || !testTypeId) {
      console.log('Cannot add comment - missing data');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Adding comment:', newComment);
      console.log('URL:', `http://localhost:5000/api/v1/comment/projects/${project._id}/test-types/${testTypeId}/test-cases/${testCase._id}/comments`);
      
      await axios.post(
        `http://localhost:5000/api/v1/comment/projects/${project._id}/test-types/${testTypeId}/test-cases/${testCase._id}/comments`,
        { 
          comment: newComment, 
          testCaseId: testCase._id 
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      console.log('Comment added successfully');
      setNewComment('');
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Error adding comment:', error);
      console.error('Error response:', error.response?.data);
      alert('Failed to add comment: ' + (error.response?.data?.message || error.message));
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!testCase) {
    console.log('No test case - showing empty state');
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <FiAlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium mb-2">No Test Case Selected</h3>
          <p>Select a test case from the sidebar to view details</p>
        </div>
      </div>
    );
  }

  console.log('Rendering test case:', testCase.serialNumber);

  return (
    <div className="flex-1 bg-white overflow-y-auto">
      {/* Header - Single Line with all info */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-gray-200 bg-white sticky top-0 z-10"
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Left side - Serial Number, Severity, Priority, Status */}
            <div className="flex items-center gap-4 flex-wrap">
              <EditableField
                value={testCase.serialNumber || 'No Serial Number'}
                onSave={(value) => handleFieldUpdate('serialNumber', value)}
                className="text-xl font-bold text-gray-900"
                isEditing={isEditing}
              />
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Severity:</span>
                <DropdownField
                  value={testCase.severity || 'Medium'}
                  onSave={(value) => handleFieldUpdate('severity', value)}
                  options={['Critical', 'High', 'Medium', 'Low']}
                  isEditing={isEditing}
                />
              </div>
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Priority:</span>
                <DropdownField
                  value={testCase.priority || 'Medium'}
                  onSave={(value) => handleFieldUpdate('priority', value)}
                  options={['Critical', 'High', 'Medium', 'Low']}
                  isEditing={isEditing}
                />
              </div>
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Status:</span>
                <DropdownField
                  value={testCase.status || 'New'}
                  onSave={(value) => handleFieldUpdate('status', value)}
                  options={['New', 'Reviewed', 'Working', 'Solved', 'Reopen', 'Open', 'Closed']}
                  isEditing={isEditing}
                />
              </div>
            </div>

            {/* Right side - Date/Time and Action Buttons */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FiCalendar size={16} />
                <span>{formatDateTime(testCase.createdAt)}</span>
              </div>
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`p-2 rounded-lg transition-all ${
                  isEditing 
                    ? 'text-blue-600 bg-blue-50 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                tooltip-data={isEditing ? "Save Changes" : "Edit Test Case"}
                tooltip-placement="top"
              >
                <FiEdit2 size={18} />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  tooltip-data="More Options"
                  tooltip-placement="right"
                >
                  <FiMoreVertical size={18} />
                </button>
                
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
                  >
                    <button
                      onClick={handleMoveToTrash}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                    >
                      <FiTrash2 className="mr-2" size={16} />
                      Move to Trash
                    </button>
                    {testCase.trashStatus === 'trash' && (
                      <button
                        onClick={handleDeletePermanently}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                      >
                        <FiTrash2 className="mr-2" size={16} />
                        Delete Permanently
                      </button>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Test Case Description */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Test Case Description
          </label>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <EditableField
              value={testCase.testCaseDescription || 'No description available'}
              onSave={(value) => handleFieldUpdate('testCaseDescription', value)}
              className="text-gray-900 leading-relaxed"
              isEditing={isEditing}
              multiline
            />
          </div>
        </motion.div>

        {/* Actual Result */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Actual Result
          </label>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <EditableField
              value={testCase.actualResult || 'Not executed'}
              onSave={(value) => handleFieldUpdate('actualResult', value)}
              className="text-gray-900 leading-relaxed"
              isEditing={isEditing}
              multiline
            />
          </div>
        </motion.div>

        {/* Expected Result */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Expected Result
          </label>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <EditableField
              value={testCase.expectedResult || 'Expected behavior not defined'}
              onSave={(value) => handleFieldUpdate('expectedResult', value)}
              className="text-gray-900 leading-relaxed"
              isEditing={isEditing}
              multiline
            />
          </div>
        </motion.div>

        {/* Image if available */}
        {testCase.image && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Attached Image
            </label>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <img 
                src={testCase.image} 
                alt="Test case attachment" 
                className="max-w-full h-auto rounded-lg shadow-md"
              />
            </div>
          </motion.div>
        )}

        {/* Comments Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border-t border-gray-200 pt-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>
          
          {/* Add Comment */}
          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center shadow-sm hover:shadow"
              >
                <FiSend className="mr-2" size={16} />
                Send
              </button>
            </div>
          </div>

          {/* Comments List */}
          {loadingComments ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
              <p className="text-gray-500">Loading comments...</p>
            </div>
          ) : (
            <CommentsSection
              comments={comments}
              project={project}
              testTypeId={testTypeId}
              testCase={testCase}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TestCaseDetails;