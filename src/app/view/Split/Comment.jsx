// app/components/TestCases/CommentsSection.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const CommentsSection = ({ comments, project, testType, testCase }) => {
  const [localComments, setLocalComments] = useState(comments);

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  if (!localComments || localComments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {localComments.map((comment, index) => (
        <motion.div
          key={comment._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gray-50 rounded-lg p-4"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {comment.user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-medium text-gray-900">{comment.user?.name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
          
          {comment.mentionedUsers && comment.mentionedUsers.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {comment.mentionedUsers.map((email, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  @{email}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default CommentsSection;