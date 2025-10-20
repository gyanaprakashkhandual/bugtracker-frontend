import React from 'react';
import { motion } from 'framer-motion';

const KanbanSkeleton = () => {
  const columns = ['Open', 'In Progress', 'Testing', 'Closed'];
  const cardsPerColumn = [3, 4, 2, 3];

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {columns.map((column, columnIndex) => (
        <motion.div
          key={column}
          className="flex-shrink-0 w-72 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: columnIndex * 0.1 }}
        >
          {/* Column Header Skeleton */}
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 animate-pulse"></div>
            <div className="h-5 w-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
          </div>

          {/* Cards Skeleton */}
          <div className="space-y-2 max-h-[calc(100vh-180px)] overflow-y-auto">
            {Array.from({ length: cardsPerColumn[columnIndex] }).map((_, cardIndex) => (
              <motion.div
                key={cardIndex}
                className="bg-white dark:bg-gray-900 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.3, 
                  delay: columnIndex * 0.1 + cardIndex * 0.05 
                }}
              >
                {/* Card Header - Serial Number & Priority */}
                <div className="flex items-start justify-between mb-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                  <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>

                {/* Card Description */}
                <div className="space-y-2 mb-3">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5 animate-pulse"></div>
                </div>

                {/* Card Footer - Module & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default KanbanSkeleton;