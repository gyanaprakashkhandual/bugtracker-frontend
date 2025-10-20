'use client';
import React from 'react';
import { motion } from 'framer-motion';

const BugCardSkeletonGrid = ({ count = 12 }) => {
  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {[...Array(count)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <BugCardSkeleton />
          </motion.div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded"
        />
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded"
        />
        <div className="flex gap-2">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"
          />
        </div>
      </div>
    </div>
  );
};

module.exports = BugCardSkeletonGrid;