// LeftSidebar.jsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Copy, Download, Archive, Trash,  Star } from 'lucide-react';
import { FaThumbtack } from 'react-icons/fa';

const LeftSidebar = ({
  doc,
  versions,
  onRestore,
  onDuplicate,
  onExport,
  onArchive,
  onUnarchive,
  onDelete,
  onPin,
  onStar,
}) => {
  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-64 bg-white border-r p-4 overflow-auto text-sm"
    >
      <h3 className="font-bold mb-2">Versions</h3>
      {versions.map((ver) => (
        <div key={ver.versionNumber} className="p-2 border-b flex justify-between">
          <p className="text-gray-800">
            {ver.versionName} (v{ver.versionNumber})
          </p>
          <button
            onClick={() => onRestore(ver)}
            className="text-blue-600 text-xs"
          >
            Restore
          </button>
        </div>
      ))}
      <h3 className="font-bold mb-2 mt-4">Actions</h3>
      <button
        onClick={onDuplicate}
        className="flex items-center mb-2 text-gray-800 hover:text-blue-600"
      >
        <Copy size={16} className="mr-2" /> Duplicate
      </button>
      <button
        onClick={() => onExport('txt')}
        className="flex items-center mb-2 text-gray-800 hover:text-blue-600"
      >
        <Download size={16} className="mr-2" /> Export
      </button>
      <button
        onClick={onArchive}
        className="flex items-center mb-2 text-gray-800 hover:text-blue-600"
      >
        <Archive size={16} className="mr-2" /> Archive
      </button>
      <button
        onClick={onUnarchive}
        className="flex items-center mb-2 text-gray-800 hover:text-blue-600"
      >
        <Archive size={16} className="mr-2" /> Unarchive
      </button>
      <button
        onClick={onDelete}
        className="flex items-center mb-2 text-gray-800 hover:text-red-600"
      >
        <Trash size={16} className="mr-2" /> Delete
      </button>
      <button
        onClick={onPin}
        className="flex items-center mb-2 text-gray-800 hover:text-blue-600"
      >
        <FaThumbtack size={16} className="mr-2" /> Pin
      </button>
      <button
        onClick={onStar}
        className="flex items-center mb-2 text-gray-800 hover:text-blue-600"
      >
        <Star size={16} className="mr-2" /> Star
      </button>
    </motion.div>
  );
};

export default LeftSidebar;