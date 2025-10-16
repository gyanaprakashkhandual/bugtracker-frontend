'use client';
import React from 'react';
import { motion } from 'framer-motion';

const BugCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      {/* Header with Bug ID and Status Dots */}
      <div className="flex items-center justify-between mb-3">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="h-5 w-24 bg-gray-200 rounded"
        />
        <div className="flex gap-1">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
            className="h-2 w-2 bg-gray-200 rounded-full"
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            className="h-2 w-2 bg-gray-200 rounded-full"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2 mb-4">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="h-4 bg-gray-200 rounded w-full"
        />
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          className="h-4 bg-gray-200 rounded w-4/5"
        />
      </div>

      {/* Date */}
      <div className="mb-4">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="h-3 w-28 bg-gray-200 rounded"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          className="h-8 w-20 bg-gray-200 rounded"
        />
        <div className="ml-auto flex gap-2">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
            className="h-8 w-8 bg-gray-200 rounded"
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            className="h-8 w-8 bg-gray-200 rounded"
          />
        </div>
      </div>
    </div>
  );
};

const BugCardSkeletonGrid = ({ count = 12 }) => {
  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
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
      <div className="flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-gray-200">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="h-5 w-32 bg-gray-200 rounded"
        />
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          className="h-5 w-48 bg-gray-200 rounded"
        />
        <div className="flex gap-2">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            className="h-8 w-8 bg-gray-200 rounded"
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="h-8 w-8 bg-gray-200 rounded"
          />
        </div>
      </div>
    </div>
  );
};


export { BugCardSkeleton, BugCardSkeletonGrid };
