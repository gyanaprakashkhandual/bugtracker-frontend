// app/components/TestCases/EditableField.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const EditableField = ({ value, onSave, className, isEditing, multiline = false }) => {
  const [isEditingLocal, setIsEditingLocal] = useState(false);
  const [editedValue, setEditedValue] = useState(value);

  const handleSave = () => {
    onSave(editedValue);
    setIsEditingLocal(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditedValue(value);
      setIsEditingLocal(false);
    }
  };

  if ((isEditing || isEditingLocal) && !multiline) {
    return (
      <input
        type="text"
        value={editedValue}
        onChange={(e) => setEditedValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyPress}
        className={`border-b-2 border-blue-500 focus:outline-none bg-transparent ${className}`}
        autoFocus
      />
    );
  }

  if ((isEditing || isEditingLocal) && multiline) {
    return (
      <textarea
        value={editedValue}
        onChange={(e) => setEditedValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyPress}
        className={`w-full border-2 border-blue-500 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        rows={4}
        autoFocus
      />
    );
  }

  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
      onClick={() => setIsEditingLocal(true)}
      className={`rounded-lg transition-colors cursor-pointer p-1 -m-1 ${className}`}
    >
      {multiline ? (
        <p className="whitespace-pre-wrap">{value}</p>
      ) : (
        <span>{value}</span>
      )}
    </motion.div>
  );
};

export default EditableField;