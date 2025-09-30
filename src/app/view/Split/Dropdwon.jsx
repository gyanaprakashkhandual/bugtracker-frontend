// app/components/TestCases/DropdownField.jsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';

const DropdownField = ({ value, onSave, options, isEditing }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getColorClass = (val) => {
    const colors = {
      Critical: 'bg-red-100 text-red-800 border-red-200',
      High: 'bg-orange-100 text-orange-800 border-orange-200',
      Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Low: 'bg-green-100 text-green-800 border-green-200',
      New: 'bg-blue-100 text-blue-800 border-blue-200',
      Solved: 'bg-green-100 text-green-800 border-green-200',
      Working: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Reviewed: 'bg-purple-100 text-purple-800 border-purple-200',
      Reopen: 'bg-red-100 text-red-800 border-red-200',
      Open: 'bg-blue-100 text-blue-800 border-blue-200',
      Closed: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[val] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleSelect = (option) => {
    onSave(option);
    setIsOpen(false);
  };

  if (!isEditing) {
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium ${getColorClass(value)}`}>
        {value}
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium ${getColorClass(value)} hover:shadow-sm transition-shadow`}
      >
        {value}
        <FiChevronDown className="ml-1" size={14} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
          >
            {options.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <span className={`w-2 h-2 rounded-full mr-2 ${getColorClass(option).split(' ')[0]}`}></span>
                {option}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DropdownField;