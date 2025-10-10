// components/RecentBugs.jsx
'use client';

import { motion } from 'framer-motion';
import { FiClock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export default function RecentBugs({ bugs }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <FiCheckCircle className="text-green-500" />;
      case 'pending':
        return <FiClock className="text-yellow-500" />;
      default:
        return <FiAlertCircle className="text-red-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-xl p-6 shadow-lg"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Bugs</h3>
      
      <div className="space-y-4">
        {bugs?.length > 0 ? (
          bugs.map((bug, index) => (
            <motion.div
              key={bug._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(bug.status)}
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {bug.serialNumber || `BUG-${bug._id.slice(-6)}`}
                  </p>
                  <p className="text-gray-500 text-xs truncate max-w-[200px]">
                    {bug.moduleName}
                  </p>
                </div>
              </div>
              
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(bug.priority)}`}>
                {bug.priority}
              </span>
            </motion.div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            <FiAlertCircle className="mx-auto text-4xl mb-2 text-gray-300" />
            <p>No recent bugs found</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}