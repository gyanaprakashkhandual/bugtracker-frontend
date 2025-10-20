'use client';

import { motion } from 'framer-motion';

const SplitSkeletonLoader = () => {
  const shimmer = {
    hidden: { backgroundPosition: '-100% 0' },
    visible: {
      backgroundPosition: '100% 0',
      transition: {
        duration: 1.5,
        ease: 'linear',
        repeat: Infinity,
      },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  const SkeletonBox = ({ className = '' }) => (
    <motion.div
      className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] rounded ${className}`}
      variants={shimmer}
      initial="hidden"
      animate="visible"
    />
  );

  return (
    <motion.div
      className="flex h-screen bg-gray-50 dark:bg-gray-950"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      {/* Left Sidebar */}
      <div className="w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4">
        {/* Header */}
        <div className="mb-4">
          <SkeletonBox className="h-8 w-40 mb-4" />
        </div>

        {/* Search Bar */}
        <SkeletonBox className="h-10 w-full mb-4" />

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <SkeletonBox className="h-10 flex-1" />
          <SkeletonBox className="h-10 flex-1" />
        </div>

        {/* Bug List Items */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="border border-gray-200 dark:border-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <SkeletonBox className="h-5 w-20" />
                <SkeletonBox className="h-5 w-16" />
                <SkeletonBox className="h-5 w-12" />
              </div>
              <SkeletonBox className="h-4 w-full mb-2" />
              <SkeletonBox className="h-4 w-4/5 mb-3" />
              <SkeletonBox className="h-3 w-28" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <SkeletonBox className="h-10 w-28" />
            <SkeletonBox className="h-10 w-24" />
            <SkeletonBox className="h-10 w-24" />
            <SkeletonBox className="h-10 w-24" />
            <SkeletonBox className="h-10 w-24" />
          </div>
          <div className="flex items-center gap-3">
            <SkeletonBox className="h-10 w-20" />
            <SkeletonBox className="h-10 w-10" />
            <SkeletonBox className="h-10 w-28" />
            <SkeletonBox className="h-10 w-10" />
            <SkeletonBox className="h-10 w-10" />
            <SkeletonBox className="h-10 w-10" />
            <SkeletonBox className="h-10 w-10" />
            <SkeletonBox className="h-10 w-10" />
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Module Section */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <SkeletonBox className="h-5 w-20 mb-4" />
            <SkeletonBox className="h-6 w-32" />
          </div>

          {/* Description Section */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <SkeletonBox className="h-5 w-32 mb-4" />
            <SkeletonBox className="h-4 w-full mb-2" />
            <SkeletonBox className="h-4 w-5/6" />
          </div>

          {/* Requirement Section */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <SkeletonBox className="h-5 w-36 mb-4" />
            <SkeletonBox className="h-4 w-full mb-2" />
            <SkeletonBox className="h-4 w-3/4" />
          </div>

          {/* Reference Links Section */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <SkeletonBox className="h-5 w-36 mb-4" />
            <div className="space-y-3">
              <SkeletonBox className="h-10 w-full" />
              <SkeletonBox className="h-10 w-full" />
              <SkeletonBox className="h-10 w-5/6" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SplitSkeletonLoader;