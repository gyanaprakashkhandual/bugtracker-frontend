// Statusbar.jsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

const Statusbar = ({ isSaving, cursors, stats, logs }) => {
  return (
    <motion.div
      initial={{ y: 50 }}
      animate={{ y: 0 }}
      className="h-8 bg-gray-200 flex items-center px-4 text-sm"
    >
      <p className="text-gray-800">{isSaving ? 'Saving...' : 'Saved'}</p>
      <div className="ml-auto flex items-center space-x-4">
        {cursors.map((cur) => (
          <span key={cur.user._id} className="text-gray-600 text-xs">
            {cur.user.name} editing
          </span>
        ))}
        <button onClick={stats} className="text-blue-600 text-xs">
          Stats
        </button>
        <button onClick={logs} className="text-blue-600 text-xs">
          Logs
        </button>
      </div>
    </motion.div>
  );
};

export default Statusbar;