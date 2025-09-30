// app/components/TestCases/TestCaseDetails.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2, FiMoreVertical, FiSend } from 'react-icons/fi';
import axios from 'axios';
import EditableField from './Edit';
import DropdownField from './Dropdwon';
import CommentsSection from './Comment';

const TestCaseDetails = ({ testCase, project, testType, onTestCaseUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  if (!testCase) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <h3 className="text-lg font-medium mb-2">No Test Case Selected</h3>
          <p>Select a test case from the sidebar to view details</p>
        </div>
      </div>
    );
  }

  const handleFieldUpdate = async (field, value) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/v1/test-case/test-cases/${testCase._id}`,
        { [field]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onTestCaseUpdate();
    } catch (error) {
      console.error('Error updating test case:', error);
    }
  };

  const handleMoveToTrash = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/v1/test-case/test-cases/${testCase._id}/trash`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onTestCaseUpdate();
      setShowDropdown(false);
    } catch (error) {
      console.error('Error moving to trash:', error);
    }
  };

  const handleDeletePermanently = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/v1/test-case/test-cases/${testCase._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onTestCaseUpdate();
      setShowDropdown(false);
    } catch (error) {
      console.error('Error deleting test case:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/v1/comment/projects/${project._id}/test-types/${testType._id}/test-cases/${testCase._id}/comments`,
        { comment: newComment, testCaseId: testCase._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment('');
      // Refresh comments
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/v1/comment/projects/${project._id}/test-types/${testType._id}/test-cases/${testCase._id}/comments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(response.data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  return (
    <div className="flex-1 bg-white overflow-y-auto">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <EditableField
                value={testCase.serialNumber}
                onSave={(value) => handleFieldUpdate('serialNumber', value)}
                className="text-2xl font-bold text-gray-900"
                isEditing={isEditing}
              />
              <EditableField
                value={testCase.moduleName}
                onSave={(value) => handleFieldUpdate('moduleName', value)}
                className="text-lg text-gray-600 mt-1"
                isEditing={isEditing}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiEdit2 size={18} />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiMoreVertical size={18} />
                </button>
                
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
                  >
                    <button
                      onClick={handleMoveToTrash}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <FiTrash2 className="mr-2" />
                      Move to Trash
                    </button>
                    {testCase.trashStatus === 'trash' && (
                      <button
                        onClick={handleDeletePermanently}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                      >
                        Delete Permanently
                      </button>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Case Type
            </label>
            <EditableField
              value={testCase.testCaseType}
              onSave={(value) => handleFieldUpdate('testCaseType', value)}
              className="text-gray-900"
              isEditing={isEditing}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Severity
            </label>
            <DropdownField
              value={testCase.severity}
              onSave={(value) => handleFieldUpdate('severity', value)}
              options={['Critical', 'High', 'Medium', 'Low']}
              isEditing={isEditing}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <DropdownField
              value={testCase.priority}
              onSave={(value) => handleFieldUpdate('priority', value)}
              options={['Critical', 'High', 'Medium', 'Low']}
              isEditing={isEditing}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <DropdownField
              value={testCase.status}
              onSave={(value) => handleFieldUpdate('status', value)}
              options={['New', 'Reviewed', 'Working', 'Solved', 'Reopen', 'Open', 'Closed']}
              isEditing={isEditing}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Case Description
          </label>
          <EditableField
            value={testCase.testCaseDescription}
            onSave={(value) => handleFieldUpdate('testCaseDescription', value)}
            className="text-gray-900 leading-relaxed"
            isEditing={isEditing}
            multiline
          />
        </div>

        {/* Expected vs Actual Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Result
            </label>
            <EditableField
              value={testCase.expectedResult}
              onSave={(value) => handleFieldUpdate('expectedResult', value)}
              className="text-gray-900 leading-relaxed"
              isEditing={isEditing}
              multiline
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actual Result
            </label>
            <EditableField
              value={testCase.actualResult}
              onSave={(value) => handleFieldUpdate('actualResult', value)}
              className="text-gray-900 leading-relaxed"
              isEditing={isEditing}
              multiline
            />
          </div>
        </div>

        {/* Comments Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Comments</h3>
          
          {/* Add Comment */}
          <div className="mb-6">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                <FiSend className="mr-2" />
                Send
              </button>
            </div>
          </div>

          {/* Comments List */}
          <CommentsSection
            comments={comments}
            project={project}
            testType={testType}
            testCase={testCase}
          />
        </div>
      </div>
    </div>
  );
};

export default TestCaseDetails;