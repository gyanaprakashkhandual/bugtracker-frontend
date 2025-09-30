// app/components/TestCases/TestCaseSidebar.jsx
'use client';

import { motion } from 'framer-motion';
import { FiSearch, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

const TestCaseSidebar = ({
  testCases,
  selectedTestCase,
  onTestCaseSelect,
  searchTerm,
  onSearchChange,
  loading,
  project,
  testTypeId,
  error,
  onRetry
}) => {
  return (
    <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
      {/* Header with Project Info */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="font-semibold text-gray-900 truncate">
          {project?.projectName}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Test Type ID: {testTypeId}
        </p>
        
        {/* Search Bar */}
        <div className="relative mt-3">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search test cases..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-700 mb-2">
            <FiAlertCircle className="mr-2" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-600 text-sm mb-3">{error}</p>
          <button
            onClick={onRetry}
            className="flex items-center text-sm text-red-700 hover:text-red-800"
          >
            <FiRefreshCw className="mr-1" size={14} />
            Retry
          </button>
        </div>
      )}

      {/* Test Cases List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {testCases.map((testCase, index) => (
              <motion.div
                key={testCase._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onTestCaseSelect(testCase)}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedTestCase?._id === testCase._id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                {/* ... rest of the test case card content ... */}
              </motion.div>
            ))}
            
            {testCases.length === 0 && !loading && !error && (
              <div className="text-center py-8 text-gray-500">
                <FiAlertCircle className="mx-auto text-gray-400 mb-2" size={24} />
                <p>No test cases found</p>
                <p className="text-sm mt-1">Test cases will appear here once created</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer with Count */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-600 text-center">
          {testCases.length} test case{testCases.length !== 1 ? 's' : ''} found
          {loading && ' (loading...)'}
        </p>
      </div>
    </div>
  );
};

export default TestCaseSidebar;