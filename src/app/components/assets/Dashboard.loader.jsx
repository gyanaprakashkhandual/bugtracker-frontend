'use client';

import { motion } from 'framer-motion';
import { 
  Activity, 
  Target, 
  Clock, 
  ClipboardCheck, 
  CheckCircle, 
  Bug, 
  Flame, 
  AlertTriangle, 
  Clock3, 
  XCircle, 
  FileCheck, 
  Check, 
  X, 
  Shield, 
  Calendar, 
  TrendingUp 
} from 'lucide-react';

const SkeletonCard = ({ delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-t-4 border-gray-200 dark:border-gray-700"
  >
    <div className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse mb-4" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3 w-24" />
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16" />
  </motion.div>
);

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-200">
      <div className="max-w-full mx-auto">
        {/* Issues Overview Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={`issue-${i}`} delay={i * 0.1} />
            ))}
          </div>
        </motion.div>

        {/* Bugs Overview Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-36" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={`bug-${i}`} delay={i * 0.1} />
            ))}
          </div>
        </motion.div>

        {/* Test Cases Overview Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={`test-${i}`} delay={i * 0.1} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}