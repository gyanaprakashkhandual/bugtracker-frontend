'use client';

import { motion } from 'framer-motion';

export default function FeedbackHeader() {
  return (
    <div className="relative w-screen min-w-full max-w-full h-[200px] min-h-[200px] max-h-[200px] overflow-hidden bg-gradient-radial from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated Water Waves Background */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="waveGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {/* Wave Layer 1 */}
        <motion.path
          d="M0,100 C300,150 600,50 900,100 C1050,125 1200,75 1200,100 L1200,200 L0,200 Z"
          fill="url(#waveGradient1)"
          initial={{ d: "M0,100 C300,150 600,50 900,100 C1050,125 1200,75 1200,100 L1200,200 L0,200 Z" }}
          animate={{
            d: [
              "M0,100 C300,150 600,50 900,100 C1050,125 1200,75 1200,100 L1200,200 L0,200 Z",
              "M0,90 C300,40 600,140 900,90 C1050,65 1200,115 1200,90 L1200,200 L0,200 Z",
              "M0,100 C300,150 600,50 900,100 C1050,125 1200,75 1200,100 L1200,200 L0,200 Z"
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Wave Layer 2 */}
        <motion.path
          d="M0,120 C400,80 700,160 1000,120 C1100,100 1200,140 1200,120 L1200,200 L0,200 Z"
          fill="url(#waveGradient2)"
          initial={{ d: "M0,120 C400,80 700,160 1000,120 C1100,100 1200,140 1200,120 L1200,200 L0,200 Z" }}
          animate={{
            d: [
              "M0,120 C400,80 700,160 1000,120 C1100,100 1200,140 1200,120 L1200,200 L0,200 Z",
              "M0,130 C400,170 700,90 1000,130 C1100,150 1200,110 1200,130 L1200,200 L0,200 Z",
              "M0,120 C400,80 700,160 1000,120 C1100,100 1200,140 1200,120 L1200,200 L0,200 Z"
            ]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />

        {/* Wave Layer 3 */}
        <motion.path
          d="M0,140 C350,110 650,170 950,140 C1075,125 1200,155 1200,140 L1200,200 L0,200 Z"
          fill="url(#waveGradient3)"
          initial={{ d: "M0,140 C350,110 650,170 950,140 C1075,125 1200,155 1200,140 L1200,200 L0,200 Z" }}
          animate={{
            d: [
              "M0,140 C350,110 650,170 950,140 C1075,125 1200,155 1200,140 L1200,200 L0,200 Z",
              "M0,150 C350,180 650,120 950,150 C1075,165 1200,135 1200,150 L1200,200 L0,200 Z",
              "M0,140 C350,110 650,170 950,140 C1075,125 1200,155 1200,140 L1200,200 L0,200 Z"
            ]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </svg>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* App Name */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-2"
          >
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Caffetest
            </h2>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-3"
          >
            Give Feedback
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            Your valuable feedback helps us improve. We're committed to working on every suggestion you share.
          </motion.p>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="absolute top-8 left-8 sm:left-12"
        >
          <svg width="30" height="30" viewBox="0 0 30 30" className="text-indigo-300 opacity-60">
            <motion.circle
              cx="15"
              cy="15"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 1, delay: 0.8 }}
            />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="absolute bottom-8 right-8 sm:right-12"
        >
          <svg width="25" height="25" viewBox="0 0 25 25" className="text-purple-300 opacity-60">
            <motion.polygon
              points="12.5,2 15,10 23,10 17,15 19,23 12.5,18 6,23 8,15 2,10 10,10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}