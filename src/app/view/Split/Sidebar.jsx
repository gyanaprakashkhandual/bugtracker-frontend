// app/components/TestCases/TestCaseSidebar.jsx
'use client';

import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';

const TestCaseSidebar = ({
  testCases,
  selectedTestCase,
  onTestCaseSelect,
  searchTerm,
  onSearchChange,
  loading
}) => {
  return (
    <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
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
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-sm text-blue-600">
                    {testCase.serialNumber}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      testCase.status === 'New'
                        ? 'bg-blue-100 text-blue-800'
                        : testCase.status === 'Solved'
                        ? 'bg-green-100 text-green-800'
                        : testCase.status === 'Working'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {testCase.status}
                  </span>
                </div>
                
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                  {testCase.moduleName}
                </h3>
                
                <p className="text-sm text-gray-600 line-clamp-2">
                  {testCase.testCaseDescription}
                </p>
                
                <div className="flex justify-between items-center mt-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      testCase.severity === 'High'
                        ? 'bg-red-100 text-red-800'
                        : testCase.severity === 'Medium'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {testCase.severity}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(testCase.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
            
            {testCases.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No test cases found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCaseSidebar;