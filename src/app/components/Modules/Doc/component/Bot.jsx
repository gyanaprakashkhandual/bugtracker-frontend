'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Calendar, Zap, Sparkles } from 'lucide-react';

const ComingSoonFeature = ({ onClose, featureName = "Advanced Document Analytics" }) => {
  const features = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Real-time Collaboration",
      description: "Work simultaneously with your team members on documents"
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Smart Suggestions",
      description: "AI-powered content suggestions and auto-completion"
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "Version History",
      description: "Complete track changes and version control system"
    }
  ];

  const estimatedDate = "December 15, 2024";

  return (
    <motion.div
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -320, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="w-80 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-xl"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05, duration: 0.15 }}
        className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Coming Soon</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Feature Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex justify-center mb-6"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        {/* Feature Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-center mb-2"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {featureName}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            We're working hard to bring you this exciting new feature
          </p>
        </motion.div>

        {/* Estimated Launch */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 mb-6 border border-purple-200 dark:border-purple-800"
        >
          <div className="flex items-center justify-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="font-medium text-purple-700 dark:text-purple-300">Estimated Launch:</span>
            <span className="text-purple-600 dark:text-purple-400">{estimatedDate}</span>
          </div>
        </motion.div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="space-y-4"
        >
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
            What to Expect
          </h4>
          
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 mt-0.5">
                {feature.icon}
              </div>
              <div>
                <h5 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">
                  {feature.title}
                </h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.3 }}
          className="mt-8"
        >
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span>Development Progress</span>
            <span>65%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '65%' }}
              transition={{ delay: 1, duration: 1, ease: "easeOut" }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
            />
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.3 }}
        className="p-4 border-t border-gray-200 dark:border-gray-800"
      >
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Stay tuned for updates!
          </p>
          <button className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
            Notify me when ready
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ComingSoonFeature;