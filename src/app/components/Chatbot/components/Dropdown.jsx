'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Bug,
  FolderOpen,
  CheckSquare,
  Edit3,
  Trash2,
  Search,
  Database,
  Code,
  FileCode,
  GitBranch,
  AlertCircle,
  Clock,
  Users,
  Settings
} from 'lucide-react';

const CommandDropdown = ({ onSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

const commands = [
  // ===== TEST CASE COMMANDS =====
  {
    id: 'add-test-case',
    name: 'Add Test Case',
    description: 'Create a new test case with AI enhancement',
    icon: FileText,
    category: 'Test Cases',
    color: 'text-blue-500 dark:text-blue-400'
  },
  {
    id: 'get-test-cases',
    name: 'Get Test Cases',
    description: 'List all test cases with filters',
    icon: Database,
    category: 'Test Cases',
    color: 'text-purple-500 dark:text-purple-400'
  },
  {
    id: 'search-test-cases',
    name: 'Search Test Cases',
    description: 'Search test cases by keyword',
    icon: Search,
    category: 'Test Cases',
    color: 'text-indigo-500 dark:text-indigo-400'
  },
  {
    id: 'import-google-sheets',
    name: 'Import from Google Sheets',
    description: 'Import test cases from Google Sheets',
    icon: FileCode,
    category: 'Import',
    color: 'text-emerald-500 dark:text-emerald-400'
  },
  {
    id: 'import-github',
    name: 'Import from GitHub',
    description: 'Generate test cases from GitHub repository',
    icon: GitBranch,
    category: 'Import',
    color: 'text-orange-500 dark:text-orange-400'
  },

  // ===== BUG COMMANDS (Keep as is or add backend support) =====
  {
    id: 'add-bug',
    name: 'Add Bug',
    description: 'Report a new bug',
    icon: Bug,
    category: 'Bugs',
    color: 'text-orange-500 dark:text-orange-400'
  },
  {
    id: 'update-bug',
    name: 'Update Bug',
    description: 'Update bug status or details',
    icon: AlertCircle,
    category: 'Bugs',
    color: 'text-yellow-500 dark:text-yellow-400'
  },
  {
    id: 'get-bugs',
    name: 'Get Bugs',
    description: 'List all bugs',
    icon: Database,
    category: 'Bugs',
    color: 'text-red-600 dark:text-red-400'
  },
];

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onSelect(filteredCommands[selectedIndex].id);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredCommands, selectedIndex, onSelect, onClose]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute bottom-full left-0 mb-2 w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
    >
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search commands..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          💡 <strong>Future Feature:</strong> Commands will trigger specific actions (add test case, create bug, etc.)
        </p>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {Object.keys(groupedCommands).length === 0 ? (
          <div className="p-8 text-center">
            <Search className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No commands found</p>
          </div>
        ) : (
          <div className="p-2">
            {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
              <div key={category} className="mb-3">
                <div className="px-3 py-1 mb-1">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {category}
                  </h3>
                </div>

                {categoryCommands.map((command, idx) => {
                  const globalIndex = filteredCommands.indexOf(command);
                  const Icon = command.icon;
                  const isSelected = globalIndex === selectedIndex;

                  return (
                    <motion.button
                      key={command.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSelect(command.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-gray-100 dark:bg-gray-700'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${command.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {command.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {command.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">↵</div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Use ↑↓ to navigate</span>
          <span>↵ to select • Esc to close</span>
        </div>
      </div>
    </motion.div>
  );
};

export default CommandDropdown;