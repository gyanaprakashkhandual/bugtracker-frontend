'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertCircle, CheckCircle, Clock, XCircle, RefreshCw, Image as ImageIcon } from 'lucide-react';

const TestCaseDashboard = () => {
    const [selectedTestCase, setSelectedTestCase] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const testCaseData = [
  {
    "serialNumber": "TC-LOGIN-001",
    "moduleName": "Authentication",
    "testCaseType": "Functional",
    "testCaseDescription": "Verify that a registered user is able to log in to the system successfully using a valid email ID and password. The login process should authenticate the credentials against the database, create a user session, and then redirect the user to the application dashboard. The dashboard should load all personalized data and navigation items relevant to the user’s role (e.g., Admin, Developer, QA).",
    "expectedResult": "The system should validate the credentials, generate a valid session token, and redirect the user to the dashboard page within 3 seconds. The dashboard should display the correct username in the navbar and show all modules accessible to the user.",
    "actualResult": "User entered valid credentials, system authenticated successfully, session was created, and dashboard loaded with personalized modules and the username visible in the navbar.",
    "severity": "High",
    "priority": "Critical",
    "status": "Solved"
  },
  {
    "serialNumber": "TC-LOGIN-002",
    "moduleName": "Authentication",
    "testCaseType": "Functional",
    "testCaseDescription": "Verify that the system prevents login when an invalid password is entered. The test should ensure that no session is created, and the system should provide a clear and visible error message stating 'Invalid username or password'. Additionally, the password field should not reveal characters and should remain secure with masking enabled.",
    "expectedResult": "System should reject login, display an error message 'Invalid username or password', and clear the password field for security. No session or cookie should be created in the browser.",
    "actualResult": "System rejected login attempt, displayed the correct error message, password field was cleared, and no session cookie was created in browser storage.",
    "severity": "Medium",
    "priority": "High",
    "status": "Closed"
  },
  {
    "serialNumber": "TC-LOGIN-003",
    "moduleName": "Authentication",
    "testCaseType": "Security",
    "testCaseDescription": "Verify that the system locks a user account temporarily after multiple failed login attempts. The system should track the number of consecutive failed attempts, and after the 5th failure, it should block further login attempts from the same account for a predefined duration (e.g., 15 minutes). This is to prevent brute-force attacks. The lockout message should be displayed clearly, and attempts to reset the password should still be allowed.",
    "expectedResult": "After 5 failed login attempts, the system should lock the account for 15 minutes and display a message 'Your account has been locked due to multiple failed login attempts. Please try again after 15 minutes or reset your password.'",
    "actualResult": "System successfully locked the account after 5 consecutive failures and displayed the correct lockout message. Password reset option remained available.",
    "severity": "High",
    "priority": "High",
    "status": "Reviewed"
  },
  {
    "serialNumber": "TC-LOGIN-004",
    "moduleName": "Authentication",
    "testCaseType": "User-Interface",
    "testCaseDescription": "Verify that the 'Login' button remains disabled until both the username/email and password fields are filled. This ensures that users cannot accidentally attempt to submit empty forms. The system should validate that both fields contain values before enabling the login button. Additionally, verify that error states are shown if a field loses focus without being filled in.",
    "expectedResult": "Login button should remain disabled until both fields contain text. Once both fields are filled, the button should become enabled. If a user leaves a field empty and clicks elsewhere, the system should display a red border and helper text indicating the missing input.",
    "actualResult": "Login button was disabled until both inputs were filled. Empty fields correctly showed validation messages when focus was lost. The button enabled properly once valid inputs were provided.",
    "severity": "Low",
    "priority": "Medium",
    "status": "Open"
  },
  {
    "serialNumber": "TC-LOGIN-005",
    "moduleName": "Authentication",
    "testCaseType": "Performance",
    "testCaseDescription": "Verify that the login API responds within an acceptable time limit under normal load. For this test, measure the API response time for login attempts with valid credentials. The system should be able to handle at least 100 concurrent login requests without exceeding the response time SLA (2 seconds). The test should also validate that the backend session is created correctly and that no errors are thrown during high traffic.",
    "expectedResult": "For each login attempt, the system should respond with status code 200 and a valid session token within 2 seconds. At least 95% of concurrent login requests should meet the SLA. No timeouts or backend errors should occur.",
    "actualResult": "System responded with status code 200 for all test requests. 98% of requests were completed within 2 seconds, with the longest response time being 2.3 seconds. No backend errors occurred.",
    "severity": "Medium",
    "priority": "High",
    "status": "Working"
  }
]


    // Filter test cases based on search query
    const filteredTestCases = testCaseData.filter(testCase =>
        testCase.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        testCase.moduleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        testCase.testCaseDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        testCase.status.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get status icon and color
    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'new':
                return { icon: AlertCircle, color: 'text-blue-500 bg-blue-50' };
            case 'reviewed':
                return { icon: CheckCircle, color: 'text-green-500 bg-green-50' };
            case 'working':
                return { icon: Clock, color: 'text-yellow-500 bg-yellow-50' };
            case 'reopen':
                return { icon: RefreshCw, color: 'text-red-500 bg-red-50' };
            default:
                return { icon: XCircle, color: 'text-gray-500 bg-gray-50' };
        }
    };

    // Get severity color
    const getSeverityColor = (severity) => {
        switch (severity.toLowerCase()) {
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Get priority color
    const getPriorityColor = (priority) => {
        switch (priority.toLowerCase()) {
            case 'critical':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'medium':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'low':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Truncate text
    const truncateText = (text, maxLength = 50) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex bg-gray-50 sidebar-scrollbar">
            {/* Sidebar */}
            <div className="w-96 bg-white border-r border-gray-200 flex flex-col shadow-lg">
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search test cases..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 bg-gray-50 hover:bg-white transition-all duration-200"
                        />
                    </div>
                </div>

                {/* Test Case Cards */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <AnimatePresence>
                        {filteredTestCases.map((testCase, index) => {
                            const statusInfo = getStatusIcon(testCase.status);
                            const StatusIcon = statusInfo.icon;

                            return (
                                <motion.div
                                    key={testCase.serialNumber}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedTestCase(testCase)}
                                    className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md bg-white ${
                                        selectedTestCase?.serialNumber === testCase.serialNumber
                                            ? 'border-blue-500 shadow-lg ring-2 ring-blue-100'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-bold text-gray-900">{testCase.serialNumber}</span>
                                        <div className={`p-1.5 rounded-full ${statusInfo.color}`}>
                                            <StatusIcon size={14} />
                                        </div>
                                    </div>

                                    {/* Module Name */}
                                    <div className="mb-2">
                                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                            {testCase.moduleName}
                                        </span>
                                    </div>

                                    {/* Test Case Description */}
                                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                                        {truncateText(testCase.testCaseDescription)}
                                    </p>

                                    {/* Status */}
                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${statusInfo.color.replace('bg-', 'bg-').replace('text-', 'text-')} border-current`}>
                                            {testCase.status}
                                        </span>
                                        <span className="text-xs text-gray-400">{testCase.testCaseType}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {filteredTestCases.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-2">
                                <Search size={48} className="mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">No test cases found</p>
                                <p className="text-sm">Try adjusting your search criteria</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white">
                {selectedTestCase ? (
                    <motion.div
                        key={selectedTestCase.serialNumber}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="h-full overflow-y-auto p-8"
                    >
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-4 mb-4">
                                <h1 className="text-3xl font-bold text-gray-900">{selectedTestCase.serialNumber}</h1>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(selectedTestCase.severity)}`}>
                                    {selectedTestCase.severity}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(selectedTestCase.priority)}`}>
                                    {selectedTestCase.priority}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                                    {selectedTestCase.moduleName}
                                </span>
                                <span className="bg-gray-50 text-gray-700 px-3 py-1 rounded-full font-medium">
                                    {selectedTestCase.testCaseType}
                                </span>
                                <div className="flex items-center gap-2">
                                    {(() => {
                                        const statusInfo = getStatusIcon(selectedTestCase.status);
                                        const StatusIcon = statusInfo.icon;
                                        return (
                                            <>
                                                <div className={`p-1 rounded-full ${statusInfo.color}`}>
                                                    <StatusIcon size={12} />
                                                </div>
                                                <span className="font-medium">{selectedTestCase.status}</span>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Test Case Description */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    Test Case Description
                                </h3>
                                <p className="text-gray-700 leading-relaxed">{selectedTestCase.testCaseDescription}</p>
                            </div>

                            {/* Expected Result */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    Expected Result
                                </h3>
                                <p className="text-gray-700 leading-relaxed">{selectedTestCase.expectedResult}</p>
                            </div>

                            {/* Actual Result */}
                            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-2xl border border-orange-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    Actual Result
                                </h3>
                                <p className="text-gray-700 leading-relaxed">{selectedTestCase.actualResult}</p>
                            </div>

                            {/* Screenshot */}
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    Screenshot
                                </h3>
                                <div className="flex items-center justify-center h-32 bg-white rounded-xl border-2 border-dashed border-purple-200 group hover:border-purple-300 transition-colors cursor-pointer">
                                    <div className="text-center">
                                        <ImageIcon className="mx-auto text-purple-400 group-hover:text-purple-500 mb-2" size={32} />
                                        <p className="text-sm text-purple-600 font-medium">View Screenshot</p>
                                        <p className="text-xs text-purple-400 mt-1">Click to open</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Details */}
                        <div className="mt-8 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Details</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-white rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-500 mb-1">User ID</p>
                                    <p className="text-sm font-mono text-gray-700 truncate">{selectedTestCase.user}</p>
                                </div>
                                <div className="text-center p-4 bg-white rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-500 mb-1">Project ID</p>
                                    <p className="text-sm font-mono text-gray-700 truncate">{selectedTestCase.project}</p>
                                </div>
                                <div className="text-center p-4 bg-white rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-500 mb-1">Test Type ID</p>
                                    <p className="text-sm font-mono text-gray-700 truncate">{selectedTestCase.testType}</p>
                                </div>
                                <div className="text-center p-4 bg-white rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-500 mb-1">Trash Status</p>
                                    <p className="text-sm font-medium text-gray-700 capitalize">{selectedTestCase.trashStatus}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="text-gray-400" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Test Case</h3>
                            <p className="text-gray-600 max-w-md">
                                Choose a test case from the sidebar to view its complete details and information.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestCaseDashboard;