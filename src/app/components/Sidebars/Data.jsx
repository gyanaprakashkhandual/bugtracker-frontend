import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

const DataSidebar = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [prompt, setPrompt] = useState('');

  const handlePromptSubmit = () => {
    console.log('Prompt submitted:', prompt);
    setPrompt('');
  };

  return (
    <div className="h-[calc(100vh-4rem)] fixed right-0 sidebar-scrollbar mt-16 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 w-[28rem] flex flex-col shadow-xl">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="p-4 text-center bg-blue-50 border-b-2 border-blue-600">
          <span className="font-semibold text-sm text-blue-700">Text Prompt</span>
        </div>
      </div>

      {/* Content Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col h-full"
      >
        {/* Chat messages area - placeholder for now */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="text-center text-gray-500 mt-20">
            <p>Start a conversation...</p>
          </div>
        </div>

        {/* Chat input at bottom */}
        <div className="p-6 border-t bg-white">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Message..."
              className="w-full p-4 pr-12 border border-gray-200 rounded-2xl resize-none bg-gray-50 hover:bg-gray-100 transition-colors"
              rows="1"
              style={{ minHeight: '52px', maxHeight: '120px' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePromptSubmit}
              disabled={!prompt.trim()}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DataSidebar;