'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Trash2, RefreshCw, BellOff } from 'lucide-react';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const API_BASE_URL = 'http://localhost:5000/api/v1/notification';

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
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

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="space-y-1">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="p-4 border-b border-gray-100 animate-pulse">
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-2 h-2 bg-gray-300 rounded-full" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
            <div className="flex-shrink-0 flex gap-1">
              <div className="w-8 h-8 bg-gray-200 rounded-lg" />
              <div className="w-8 h-8 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <motion.button
        tooltip-data="Notification"
        tooltip-placement="bottom"
        className="p-2 rounded-lg transition-all relative bg-gray-100"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={22} className="text-gray-700" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg ring-2 ring-white"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute right-0 mt-4 w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-200"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 text-white p-5 z-10 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2.5">
                    <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Bell size={18} />
                    </div>
                    Notifications
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
                  >
                    <X size={20} />
                  </motion.button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={fetchNotifications}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 backdrop-blur-sm shadow-sm"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-all backdrop-blur-sm shadow-sm"
                    >
                      <Check size={14} />
                      Mark All Read
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto max-h-[500px] custom-scrollbar bg-gradient-to-b from-gray-50/30 to-white">
                {loading && notifications.length === 0 ? (
                  <SkeletonLoader />
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-6">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-5 shadow-inner"
                    >
                      <BellOff className="text-gray-400" size={48} />
                    </motion.div>
                    <h3 className="text-gray-800 font-bold mb-2 text-lg">No notifications yet</h3>
                    <p className="text-gray-500 text-sm text-center leading-relaxed">
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
                        className={`relative border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 ${!notification.isRead ? 'bg-gradient-to-r from-blue-50 to-transparent' : ''
                          }`}
                      >
                        <div className="p-4">
                          <div className="flex gap-3">
                            {/* Unread Indicator */}
                            {!notification.isRead && (
                              <div className="flex-shrink-0 mt-1.5">
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ repeat: Infinity, duration: 2 }}
                                  className="w-2 h-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/50"
                                />
                              </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              {notification.title && (
                                <h4 className="font-bold text-gray-900 mb-2 text-sm truncate" content-placement="top" content-data={notification.title}>
                                  {truncateText(notification.title, 40)}
                                </h4>
                              )}
                              <div className="flex items-center gap-2.5 text-xs">
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium">
                                  {formatTime(notification.createdAt)}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className="font-semibold text-blue-600 truncate max-w-[120px]" tooltip-placement="right" tooltip-data={notification.createdBy}>
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
                                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all shadow-sm hover:shadow-md"
                                  tooltip-data="Mark as read"
                                  tooltip-placement="bottom"
                                >
                                  <Check size={16} />
                                </motion.button>
                              )}
                              <motion.button
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.85 }}
                                onClick={() => deleteNotification(notification._id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all shadow-sm hover:shadow-md"
                                tooltip-data="Delete"
                                tooltip-placement="bottom"
                              >
                                <Trash2 size={16} />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f9fafb;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #cbd5e1, #94a3b8);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #94a3b8, #64748b);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default NotificationCenter;