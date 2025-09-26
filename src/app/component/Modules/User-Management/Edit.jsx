import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const EditUserModal = ({ isOpen, onClose, onSubmit, selectedUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: 'developer',
    isActive: false
  });

  // Update form data when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      setFormData({
        name: selectedUser.name || '',
        role: selectedUser.role || 'developer',
        isActive: selectedUser.isActive || false
      });
    }
  }, [selectedUser]);

  const handleSubmit = () => {
    if (formData.name && selectedUser?._id) {
      onSubmit(selectedUser._id, formData);
      // Reset form after submission
      setFormData({
        name: '',
        role: 'developer',
        isActive: false
      });
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      name: '',
      role: 'developer',
      isActive: false
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit User">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter user name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="developer">Developer</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="mr-2"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Active User
          </label>
        </div>
        
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Update User
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditUserModal;