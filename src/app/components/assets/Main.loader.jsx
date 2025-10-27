'use client';

import { motion } from 'framer-motion';

export default function BugTrackerSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a1628] text-gray-900 dark:text-gray-300">
      {/* Header */}
      <header className="bg-white dark:bg-[#0d1b2e] border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <SkeletonBox className="w-6 h-6" />
          <SkeletonBox className="w-24 h-6" />
          <SkeletonBox className="w-96 h-9 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonBox className="w-20 h-9 rounded-md" />
          <SkeletonBox className="w-24 h-9 rounded-md" />
          <SkeletonBox className="w-20 h-9 rounded-md" />
          <SkeletonBox className="w-28 h-9 rounded-md" />
          <SkeletonBox className="w-20 h-9 rounded-md" />
          <SkeletonBox className="w-24 h-9 rounded-md" />
          <SkeletonBox className="w-20 h-9 rounded-md" />
          <SkeletonBox className="w-24 h-9 rounded-md" />
          <SkeletonBox className="w-10 h-9 rounded-md" />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-80 bg-[#0d1b2e] border-r border-gray-800 p-4 min-h-[calc(100vh-60px)]">
          {/* Unit Test Header */}
          <div className="flex items-center justify-between mb-4">
            <SkeletonBox className="w-24 h-6" />
            <SkeletonBox className="w-6 h-6 rounded" />
          </div>

          {/* Search */}
          <SkeletonBox className="w-full h-10 rounded-lg mb-4" />

          {/* Action Buttons */}
          <div className="flex gap-2 mb-6">
            <SkeletonBox className="flex-1 h-10 rounded-lg" />
            <SkeletonBox className="flex-1 h-10 rounded-lg" />
          </div>

          {/* Bug List */}
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: item * 0.2
                }}
                className="bg-[#1a2a3e] border border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <SkeletonBox className="w-24 h-5" />
                  <div className="flex gap-2">
                    <SkeletonBox className="w-20 h-5 rounded-full" />
                    <SkeletonBox className="w-14 h-5 rounded-full" />
                  </div>
                </div>
                <SkeletonBox className="w-full h-4 mb-3" />
                <SkeletonBox className="w-32 h-3" />
              </motion.div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Bug Header */}
          <div className="bg-[#0d1b2e] border border-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SkeletonBox className="w-24 h-6" />
                <SkeletonBox className="w-24 h-7 rounded-md" />
                <SkeletonBox className="w-20 h-7 rounded-md" />
                <SkeletonBox className="w-20 h-7 rounded-md" />
                <SkeletonBox className="w-16 h-7 rounded-md" />
              </div>
              <div className="flex items-center gap-2">
                <SkeletonBox className="w-10 h-9 rounded-md" />
                <SkeletonBox className="w-28 h-6" />
                <SkeletonBox className="w-10 h-9 rounded-md" />
                <SkeletonBox className="w-10 h-9 rounded-md" />
                <SkeletonBox className="w-10 h-9 rounded-md" />
                <SkeletonBox className="w-10 h-9 rounded-md" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="col-span-2 space-y-6">
              {/* Module */}
              <div>
                <SkeletonBox className="w-20 h-5 mb-3" />
                <SkeletonBox className="w-full h-12 rounded-lg" />
              </div>

              {/* Description */}
              <div>
                <SkeletonBox className="w-32 h-5 mb-3" />
                <SkeletonBox className="w-full h-32 rounded-lg" />
              </div>

              {/* Requirement */}
              <div>
                <SkeletonBox className="w-32 h-5 mb-3" />
                <SkeletonBox className="w-full h-20 rounded-lg" />
              </div>

              {/* Reference Link */}
              <div>
                <SkeletonBox className="w-36 h-5 mb-3" />
                <SkeletonBox className="w-full h-12 rounded-lg" />
              </div>

              {/* Created/Updated */}
              <div className="flex gap-6">
                <div className="flex-1">
                  <SkeletonBox className="w-24 h-5 mb-3" />
                  <SkeletonBox className="w-full h-10 rounded-lg" />
                </div>
                <div className="flex-1">
                  <SkeletonBox className="w-24 h-5 mb-3" />
                  <SkeletonBox className="w-full h-10 rounded-lg" />
                </div>
              </div>
            </div>

            {/* Right Column - Comments */}
            <div className="col-span-1">
              <div className="bg-[#0d1b2e] border border-gray-800 rounded-lg p-4">
                <SkeletonBox className="w-28 h-6 mb-4" />
                <SkeletonBox className="w-full h-24 rounded-lg mb-4" />
                <SkeletonBox className="w-full h-10 rounded-lg mb-8" />
                <div className="text-center">
                  <SkeletonBox className="w-12 h-12 rounded-full mx-auto mb-2" />
                  <SkeletonBox className="w-32 h-4 mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SkeletonBox({ className = "" }) {
  return (
    <motion.div
      className={`bg-gradient-to-r from-gray-700/40 via-gray-600/40 to-gray-700/40 bg-[length:200%_100%] ${className}`}
      animate={{
        backgroundPosition: ["0% 0%", "100% 0%"]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  );
}