'use client';

import { motion } from 'framer-motion';
import { FiX, FiUser, FiMail, FiShield, FiCalendar, FiCheckCircle, FiXCircle, FiEdit } from 'react-icons/fi';

const UserDetailsModal = ({ user, onClose, onEdit }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <FiUser className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Role</label>
                <div className="flex items-center gap-2">
                  <FiShield className="w-4 h-4 text-gray-400" />
                  <span className={`font-medium capitalize ${
                    user.role === 'admin' ? 'text-purple-600' : 'text-blue-600'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="flex items-center gap-2">
                  {user.isActive ? (
                    <FiCheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <FiXCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={user.isActive ? 'text-green-600' : 'text-red-600'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Verified</label>
                <div className="flex items-center gap-2">
                  {user.isVerified ? (
                    <FiCheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <FiXCircle className="w-4 h-4 text-yellow-500" />
                  )}
                  <span className={user.isVerified ? 'text-green-600' : 'text-yellow-600'}>
                    {user.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Member Since</label>
                <div className="flex items-center gap-2">
                  <FiCalendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <FiEdit className="w-4 h-4" />
              Edit User
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserDetailsModal;