import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

const DeleteModal = ({ isOpen, onClose, onDelete, selectedUser }) => {
  const handleDelete = () => {
    if (selectedUser?._id) {
      onDelete(selectedUser._id);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete User">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">Delete User</h3>
        
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to delete <strong>{selectedUser?.name}</strong>? 
          This action cannot be undone and will permanently remove all user data.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteModal;