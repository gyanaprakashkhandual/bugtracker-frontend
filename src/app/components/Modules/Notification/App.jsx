'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Trash2, RefreshCw, BellOff } from 'lucide-react';

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const API_BASE_URL = 'http://localhost:5000/api/v1/notification';

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return 'your-token-here';
    }
    return null;
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(API_BASE_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.notifications?.filter(n => !n.isRead).length || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n._id === id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const notification = notifications.find(n => n._id === id);
        setNotifications(prev => prev.filter(n => n._id !== id));
        if (!notification?.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    for (const notification of unreadNotifications) {
      await markAsRead(notification._id);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diff = Math.floor((now - notifDate) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return notifDate.toLocaleDateString();
  };

  const truncateText = (text, maxLength = 40) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const SkeletonLoader = () => (
    <div className="space-y-1">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="p-4 border-b border-gray-200 dark:border-gray-700 animate-pulse">
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            </div>
            <div className="flex-shrink-0 flex gap-1">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full max-h-[calc(100vh-65px)] bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 dark:from-blue-700 dark:via-blue-800 dark:to-blue-900 text-white dark:text-gray-100 p-4 sm:p-5 lg:p-6 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center gap-2.5">
              <div className="p-1.5 bg-white/20 dark:bg-white/10 rounded-lg backdrop-blur-sm">
                <Bell size={18} className="sm:w-5 sm:h-5" />
              </div>
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 px-2.5 py-0.5 bg-red-500 dark:bg-red-600 text-white dark:text-gray-100 text-xs font-bold rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </h2>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchNotifications}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 backdrop-blur-sm shadow-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 dark:border-gray-100/30 border-t-white dark:border-t-gray-100 rounded-full animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              Refresh
            </motion.button>
            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={markAllAsRead}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 rounded-xl text-sm font-semibold transition-all backdrop-blur-sm shadow-sm"
              >
                <Check size={14} />
                Mark All Read
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-gray-50/30 to-white dark:from-gray-800/30 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          {loading && notifications.length === 0 ? (
            <SkeletonLoader />
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 lg:py-24 px-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full mb-5 shadow-inner"
              >
                <BellOff className="text-gray-400 dark:text-gray-500" size={48} />
              </motion.div>
              <h3 className="text-gray-800 dark:text-gray-100 font-bold mb-2 text-lg">No notifications yet</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center leading-relaxed">
                When you get notifications,<br />they'll show up here
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`relative border-b border-gray-100 dark:border-gray-700 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent dark:hover:from-blue-900/20 dark:hover:to-transparent transition-all duration-200 ${
                    !notification.isRead 
                      ? 'bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/30 dark:to-transparent' 
                      : ''
                  }`}
                >
                  <div className="p-4 sm:p-5 lg:p-6">
                    <div className="flex gap-3 sm:gap-4">
                      {/* Unread Indicator */}
                      {!notification.isRead && (
                        <div className="flex-shrink-0 mt-1.5">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-2 h-2 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-full shadow-lg shadow-blue-500/50"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {notification.title && (
                          <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2 text-sm sm:text-base truncate">
                            {truncateText(notification.title, 60)}
                          </h4>
                        )}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs sm:text-sm">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md font-medium">
                            {formatTime(notification.createdAt)}
                          </span>
                          <span className="text-gray-400 dark:text-gray-500">•</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400 truncate max-w-[150px]">
                            {notification.createdBy}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex gap-1.5">
                        {!notification.isRead && (
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.85 }}
                            onClick={() => markAsRead(notification._id)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all shadow-sm hover:shadow-md"
                            tooltip-data="Mark as read"
                          >
                            <Check size={16} className="sm:w-5 sm:h-5" />
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.85 }}
                          onClick={() => deleteNotification(notification._id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all shadow-sm hover:shadow-md"
                          tooltip-data="Delete"
                        >
                          <Trash2 size={16} className="sm:w-5 sm:h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f9fafb;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #cbd5e1, #94a3b8);
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #4b5563, #6b7280);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #94a3b8, #64748b);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #6b7280, #9ca3af);
        }
      `}</style>
    </div>
  );
};

export default NotificationPanel;