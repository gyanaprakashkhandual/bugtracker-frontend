// RightSidebar.jsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { MessageSquare, Lightbulb, Users } from 'lucide-react';

const RightSidebar = ({
  comments,
  onAddComment,
  onReplyComment,
  onResolveComment,
  onDeleteComment,
  suggestions,
  onAddSuggestion,
  onAcceptSuggestion,
  onRejectSuggestion,
  collaborators,
  onAddCollaborator,
  onUpdatePermission,
  onRemoveCollaborator,
  cursors,
  onUpdateStatus,
}) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [newSuggestion, setNewSuggestion] = useState('');
  const [newCollaborator, setNewCollaborator] = useState('');

  return (
    <motion.div
      initial={{ x: 300 }}
      animate={{ x: 0 }}
      className="w-64 bg-white border-l p-4 overflow-auto text-sm"
    >
      <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
        <TabList className="flex border-b">
          <Tab className="px-4 py-2 cursor-pointer flex items-center">
            <MessageSquare size={16} className="mr-2" /> Comments
          </Tab>
          <Tab className="px-4 py-2 cursor-pointer flex items-center">
            <Lightbulb size={16} className="mr-2" /> Suggestions
          </Tab>
          <Tab className="px-4 py-2 cursor-pointer flex items-center">
            <Users size={16} className="mr-2" /> Collaborators
          </Tab>
          <Tab className="px-4 py-2 cursor-pointer">Status</Tab>
        </TabList>

        <TabPanel>
          <div className="flex flex-col space-y-2">
            {comments.map((comment) => (
              <div key={comment._id} className="p-2 border-b">
                <p className="text-gray-800">{comment.text}</p>
                <div className="flex space-x-2 mt-1">
                  <button
                    onClick={() => onResolveComment(comment._id)}
                    className="text-blue-600 text-xs"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => onDeleteComment(comment._id)}
                    className="text-red-600 text-xs"
                  >
                    Delete
                  </button>
                </div>
                {comment.replies.map((reply) => (
                  <p key={reply._id} className="text-gray-600 text-xs ml-4">
                    {reply.text}
                  </p>
                ))}
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Reply"
                  className="w-full p-1 mt-1 border rounded text-xs"
                />
                <button
                  onClick={() => {
                    onReplyComment(comment._id, { text: newComment });
                    setNewComment('');
                  }}
                  className="mt-1 bg-blue-600 text-white px-2 py-1 rounded text-xs"
                >
                  Send
                </button>
              </div>
            ))}
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add comment"
              className="w-full p-1 border rounded text-xs"
            />
            <button
              onClick={() => {
                onAddComment({ text: newComment, startIndex: 0, endIndex: 1 });
                setNewComment('');
              }}
              className="mt-1 bg-blue-600 text-white px-2 py-1 rounded text-xs"
            >
              Add
            </button>
          </div>
        </TabPanel>

        <TabPanel>
          <div className="flex flex-col space-y-2">
            {suggestions.map((sug) => (
              <div key={sug._id} className="p-2 border-b">
                <p className="text-gray-800">{sug.suggestedText}</p>
                <div className="flex space-x-2 mt-1">
                  <button
                    onClick={() => onAcceptSuggestion(sug._id)}
                    className="text-green-600 text-xs"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onRejectSuggestion(sug._id)}
                    className="text-red-600 text-xs"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
            <input
              value={newSuggestion}
              onChange={(e) => setNewSuggestion(e.target.value)}
              placeholder="Add suggestion"
              className="w-full p-1 border rounded text-xs"
            />
            <button
              onClick={() => {
                onAddSuggestion({
                  originalText: '',
                  suggestedText: newSuggestion,
                  startIndex: 0,
                  endIndex: 1,
                });
                setNewSuggestion('');
              }}
              className="mt-1 bg-blue-600 text-white px-2 py-1 rounded text-xs"
            >
              Add
            </button>
          </div>
        </TabPanel>

        <TabPanel>
          <div className="flex flex-col space-y-2">
            {collaborators.map((col) => (
              <div key={col.user._id} className="p-2 border-b flex justify-between">
                <p className="text-gray-800">
                  {col.user.name} - {col.permission}
                </p>
                <button
                  onClick={() => onRemoveCollaborator(col.user._id)}
                  className="text-red-600 text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
            <input
              value={newCollaborator}
              onChange={(e) => setNewCollaborator(e.target.value)}
              placeholder="Add collaborator ID"
              className="w-full p-1 border rounded text-xs"
            />
            <button
              onClick={() => {
                onAddCollaborator({ userId: newCollaborator, permission: 'view' });
                setNewCollaborator('');
              }}
              className="mt-1 bg-blue-600 text-white px-2 py-1 rounded text-xs"
            >
              Add
            </button>
            <div className="mt-2">
              <p className="font-bold">Active Cursors:</p>
              {cursors.map((cur) => (
                <p key={cur.user._id} className="text-gray-600 text-xs">
                  {cur.user.name} at position {cur.position}
                </p>
              ))}
            </div>
          </div>
        </TabPanel>

        <TabPanel>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => onUpdateStatus({ status: 'draft' })}
              className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
            >
              Set Draft
            </button>
            <button
              onClick={() => onUpdateStatus({ approvalStatus: 'approved' })}
              className="bg-green-600 text-white px-2 py-1 rounded text-xs"
            >
              Approve
            </button>
          </div>
        </TabPanel>
      </Tabs>
    </motion.div>
  );
};

export default RightSidebar;