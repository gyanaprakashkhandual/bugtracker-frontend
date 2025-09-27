import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => {
  const colorStyles = {
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/20',
      glow: 'group-hover:shadow-blue-500/30',
      iconBg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      iconColor: 'text-blue-600'
    },
    green: {
      gradient: 'from-green-500 to-green-600',
      shadow: 'shadow-green-500/20',
      glow: 'group-hover:shadow-green-500/30',
      iconBg: 'bg-gradient-to-br from-green-50 to-green-100',
      iconColor: 'text-green-600'
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
      shadow: 'shadow-purple-500/20',
      glow: 'group-hover:shadow-purple-500/30',
      iconBg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      iconColor: 'text-purple-600'
    },
    orange: {
      gradient: 'from-orange-500 to-orange-600',
      shadow: 'shadow-orange-500/20',
      glow: 'group-hover:shadow-orange-500/30',
      iconBg: 'bg-gradient-to-br from-orange-50 to-orange-100',
      iconColor: 'text-orange-600'
    },
    red: {
      gradient: 'from-red-500 to-red-600',
      shadow: 'shadow-red-500/20',
      glow: 'group-hover:shadow-red-500/30',
      iconBg: 'bg-gradient-to-br from-red-50 to-red-100',
      iconColor: 'text-red-600'
    },
    cyan: {
      gradient: 'from-cyan-500 to-cyan-600',
      shadow: 'shadow-cyan-500/20',
      glow: 'group-hover:shadow-cyan-500/30',
      iconBg: 'bg-gradient-to-br from-cyan-50 to-cyan-100',
      iconColor: 'text-cyan-600'
    },
    indigo: {
      gradient: 'from-indigo-500 to-indigo-600',
      shadow: 'shadow-indigo-500/20',
      glow: 'group-hover:shadow-indigo-500/30',
      iconBg: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
      iconColor: 'text-indigo-600'
    },
    pink: {
      gradient: 'from-pink-500 to-pink-600',
      shadow: 'shadow-pink-500/20',
      glow: 'group-hover:shadow-pink-500/30',
      iconBg: 'bg-gradient-to-br from-pink-50 to-pink-100',
      iconColor: 'text-pink-600'
    }
  };

  const style = colorStyles[color] || colorStyles.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${style.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>

      <div className={`relative bg-white rounded-2xl p-6 shadow-lg ${style.shadow} ${style.glow} transition-all duration-300 border border-gray-100/50 backdrop-blur-sm overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-transparent rounded-full -mr-16 -mt-16 opacity-50"></div>

        <div className="relative z-10 flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</p>
            <motion.p
              className="text-4xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              {value}
            </motion.p>
            {subtitle && (
              <p className="text-sm font-medium text-gray-600 mt-3 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
                {subtitle}
              </p>
            )}
          </div>

          <motion.div
            className={`${style.iconBg} p-4 rounded-xl shadow-sm border border-white/50`}
            whileHover={{ rotate: 5, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Icon className={`w-7 h-7 ${style.iconColor}`} />
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </motion.div>
  );
};

export default StatCard;