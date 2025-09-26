import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, User, Shield, Users } from 'lucide-react';
import Modal from './Modal';

const CreateUserModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'developer',
    password: ''
  });

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const roles = [
    { 
      value: 'developer', 
      label: 'Developer', 
      description: 'Can read and write code',
      icon: User,
      color: 'text-green-600 bg-green-50'
    },
    { 
      value: 'admin', 
      label: 'Admin', 
      description: 'Full system access',
      icon: Shield,
      color: 'text-purple-600 bg-purple-50'
    },
    { 
      value: 'manager', 
      label: 'Manager', 
      description: 'Can manage team members',
      icon: Users,
      color: 'text-blue-600 bg-blue-50'
    }
  ];

  const selectedRole = roles.find(role => role.value === formData.role);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      onSubmit(formData);
      // Reset form after submission
      setFormData({
        name: '',
        email: '',
        role: 'developer',
        password: ''
      });
      setIsRoleDropdownOpen(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      name: '',
      email: '',
      role: 'developer',
      password: ''
    });
    setIsRoleDropdownOpen(false);
    onClose();
  };

  const handleRoleSelect = (roleValue) => {
    setFormData({ ...formData, role: roleValue });
    setIsRoleDropdownOpen(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New User">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Enter user name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Enter email address"
          />
        </div>
        
        {/* GitHub Style Dropdown for Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded ${selectedRole.color}`}>
                  <selectedRole.icon className="w-3 h-3" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">{selectedRole.label}</span>
                  <span className="text-xs text-gray-500 ml-1">— {selectedRole.description}</span>
                </div>
              </div>
              <ChevronDown 
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  isRoleDropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            <AnimatePresence>
              {isRoleDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1"
                >
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => handleRoleSelect(role.value)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded ${role.color}`}>
                          <role.icon className="w-3 h-3" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{role.label}</div>
                          <div className="text-xs text-gray-500">{role.description}</div>
                        </div>
                      </div>
                      {formData.role === role.value && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password (Optional)</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Leave empty for default password"
          />
        </div>
        
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create User
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateUserModal;