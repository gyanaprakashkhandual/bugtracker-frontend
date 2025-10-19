'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  ArrowLeft,
  FileText,
  Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const DocumentHeader = ({ 
  title, 
  setTitle, 
  testTypeName, 
  docName,
  lastSaved, 
  handleManualSave 
}) => {
  const router = useRouter();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50"
    >
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-semibold bg-transparent border-none outline-none text-gray-100 placeholder-gray-500"
              placeholder="Document Title"
            />
            <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
              <FileText className="w-4 h-4" />
              <span>{docName || 'Untitled Document'}</span>
              <span>•</span>
              <span>{testTypeName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-green-400">
            <Check className="w-4 h-4" />
            <span>Auto-save On</span>
          </div>
          <button
            onClick={handleManualSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default DocumentHeader;