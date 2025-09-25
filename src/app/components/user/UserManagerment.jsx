'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, 
  FiUserPlus, 
  FiSearch, 
  FiFilter,
  FiEdit,
  FiTrash2,
  FiUserCheck,
  FiUserX,
  FiKey,
  FiBarChart2,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiRefreshCw
} from 'react-icons/fi';
import UserStats from './Stats';
import UserList from './List';
import UserForm from './Form';
import UserDetailsModal from './Modal';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const tabs = [
    { id: 'stats', label: 'Statistics', icon: FiBarChart2 },
    { id: 'users', label: 'All Users', icon: FiUsers },
    { id: 'create', label: 'Create User', icon: FiUserPlus },
  ];

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 max-w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          User Management
        </h1>
        <p className="text-gray-600">
          Manage user accounts, permissions, and access controls
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-wrap gap-2 p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[600px]">
        <AnimatePresence mode="wait">
          {activeTab === 'stats' && (
            <UserStats 
              key="stats"
              refreshTrigger={refreshTrigger}
            />
          )}
          
          {activeTab === 'users' && (
            <UserList
              key="users"
              refreshTrigger={refreshTrigger}
              onEditUser={(user) => {
                setSelectedUser(user);
                setShowUserForm(true);
              }}
              onViewUser={(user) => {
                setSelectedUser(user);
                setShowDetailsModal(true);
              }}
              onUserCreated={refreshData}
              onUserUpdated={refreshData}
            />
          )}
          
          {activeTab === 'create' && (
            <UserForm
              key="create"
              onUserCreated={() => {
                setActiveTab('users');
                refreshData();
              }}
              onCancel={() => setActiveTab('users')}
            />
          )}
        </AnimatePresence>
      </div>

      {/* User Form Modal */}
      <AnimatePresence>
        {showUserForm && (
          <UserForm
            user={selectedUser}
            onUserCreated={() => {
              setShowUserForm(false);
              setSelectedUser(null);
              refreshData();
            }}
            onUserUpdated={() => {
              setShowUserForm(false);
              setSelectedUser(null);
              refreshData();
            }}
            onCancel={() => {
              setShowUserForm(false);
              setSelectedUser(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* User Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedUser && (
          <UserDetailsModal
            user={selectedUser}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedUser(null);
            }}
            onEdit={() => {
              setShowDetailsModal(false);
              setShowUserForm(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;