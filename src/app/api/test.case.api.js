// api.test.case.js
// Complete API service for Test Case operations

const BASE_URL = 'http://localhost:5000/api/v1/test-case';

// Helper function to get stored credentials
const getCredentials = () => {
  const projectId = localStorage.getItem("currentProjectId");
  const testTypeId = localStorage.getItem("selectedTestTypeId");
  const token = localStorage.getItem("token");
  
  if (!projectId || !testTypeId || !token) {
    throw new Error("Missing required credentials. Please ensure you're logged in and have selected a project and test type.");
  }
  
  return { projectId, testTypeId, token };
};

// Helper function to create headers
const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `Error: ${response.status}`);
  }
  
  return data;
};

// ============================================
// CREATE OPERATIONS
// ============================================

/**
 * Create a new test case (Traditional method)
 * @param {Object} testCaseData - Test case details
 */
export const createTestCase = async (testCaseData) => {
  const { projectId, testTypeId, token } = getCredentials();
  
  const response = await fetch(
    `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases`,
    {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(testCaseData)
    }
  );
  
  return handleResponse(response);
};

/**
 * Create test case from raw text using AI
 * @param {string} rawText - Raw text description
 * @param {string} image - Optional image URL
 */
export const createTestCaseFromText = async (rawText, image = null) => {
  const { projectId, testTypeId, token } = getCredentials();
  
  const response = await fetch(
    `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases/ai-text`,
    {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ rawText, image })
    }
  );
  
  return handleResponse(response);
};

/**
 * Import test cases from Google Sheets
 * @param {string} googleSheetUrl - Google Sheet URL
 */
export const importFromGoogleSheets = async (googleSheetUrl) => {
  const { projectId, testTypeId, token } = getCredentials();
  
  const response = await fetch(
    `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases/import/google-sheets`,
    {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ googleSheetUrl })
    }
  );
  
  return handleResponse(response);
};

/**
 * Generate test cases from GitHub repository
 * @param {string} githubRepoUrl - GitHub repository URL
 */
export const generateFromGitHub = async (githubRepoUrl) => {
  const { projectId, testTypeId, token } = getCredentials();
  
  const response = await fetch(
    `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases/generate/github`,
    {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ githubRepoUrl })
    }
  );
  
  return handleResponse(response);
};

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get all test cases for current project and test type
 * @param {Object} options - Query parameters (page, limit, filters)
 */
export const getAllTestCases = async (options = {}) => {
  const { projectId, testTypeId, token } = getCredentials();
  
  const queryParams = new URLSearchParams();
  if (options.page) queryParams.append('page', options.page);
  if (options.limit) queryParams.append('limit', options.limit);
  if (options.trashStatus) queryParams.append('trashStatus', options.trashStatus);
  
  const response = await fetch(
    `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases?${queryParams}`,
    {
      method: 'GET',
      headers: getHeaders(token)
    }
  );
  
  return handleResponse(response);
};

/**
 * Get test case by ID
 * @param {string} testCaseId - Test case ID
 */
export const getTestCaseById = async (testCaseId) => {
  const { token } = getCredentials();
  
  const response = await fetch(
    `${BASE_URL}/test-cases/${testCaseId}`,
    {
      method: 'GET',
      headers: getHeaders(token)
    }
  );
  
  return handleResponse(response);
};

/**
 * Search test cases by keyword
 * @param {string} keyword - Search keyword
 * @param {Object} options - Additional query parameters
 */
export const searchTestCases = async (keyword, options = {}) => {
  const { projectId, testTypeId, token } = getCredentials();
  
  const queryParams = new URLSearchParams({ search: keyword });
  if (options.page) queryParams.append('page', options.page);
  if (options.limit) queryParams.append('limit', options.limit);
  
  const response = await fetch(
    `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases/search?${queryParams}`,
    {
      method: 'GET',
      headers: getHeaders(token)
    }
  );
  
  return handleResponse(response);
};

/**
 * Get test cases by date range (from startDate to today)
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {Object} options - Additional query parameters
 */
export const getTestCasesByDateRange = async (startDate, options = {}) => {
  const { projectId, testTypeId, token } = getCredentials();
  
  const queryParams = new URLSearchParams({ startDate });
  if (options.page) queryParams.append('page', options.page);
  if (options.limit) queryParams.append('limit', options.limit);
  
  const response = await fetch(
    `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases/filter/date-range?${queryParams}`,
    {
      method: 'GET',
      headers: getHeaders(token)
    }
  );
  
  return handleResponse(response);
};

/**
 * Get test cases by custom date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {Object} options - Additional query parameters
 */
export const getTestCasesByCustomDateRange = async (startDate, endDate, options = {}) => {
  const { projectId, testTypeId, token } = getCredentials();
  
  const queryParams = new URLSearchParams({ startDate, endDate });
  if (options.page) queryParams.append('page', options.page);
  if (options.limit) queryParams.append('limit', options.limit);
  
  const response = await fetch(
    `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases/filter/custom-date-range?${queryParams}`,
    {
      method: 'GET',
      headers: getHeaders(token)
    }
  );
  
  return handleResponse(response);
};

/**
 * Get test cases by severity
 * @param {string} severity - Severity level (Critical, High, Medium, Low)
 * @param {Object} options - Additional query parameters
 */
export const getTestCasesBySeverity = async (severity, options = {}) => {
  const { projectId, testTypeId, token } = getCredentials();
  
  const queryParams = new URLSearchParams({ severity });
  if (options.page) queryParams.append('page', options.page);
  if (options.limit) queryParams.append('limit', options.limit);
  
  const response = await fetch(
    `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases/filter/severity?${queryParams}`,
    {
      method: 'GET',
      headers: getHeaders(token)
    }
  );
  
  return handleResponse(response);
};

/**
 * Get test cases by priority
 * @param {string} priority - Priority level (Critical, High, Medium, Low)
 * @param {Object} options - Additional query parameters
 */
export const getTestCasesByPriority = async (priority, options = {}) => {
  const { projectId, testTypeId, token } = getCredentials();
  
  const queryParams = new URLSearchParams({ priority });
  if (options.page) queryParams.append('page', options.page);
  if (options.limit) queryParams.append('limit', options.limit);
  
  const response = await fetch(
    `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases/filter/priority?${queryParams}`,
    {
      method: 'GET',
      headers: getHeaders(token)
    }
  );
  
  return handleResponse(response);
};

/**
 * Get test cases by status
 * @param {string} status - Status (Pass, Fail, Blocked, Skip, Pending)
 * @param {Object} options - Additional query parameters
 */
export const getTestCasesByStatus = async (status, options = {}) => {
  const { projectId, testTypeId, token } = getCredentials();
  
  const queryParams = new URLSearchParams({ status });
  if (options.page) queryParams.append('page', options.page);
  if (options.limit) queryParams.append('limit', options.limit);
  
  const response = await fetch(
    `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases/filter/status?${queryParams}`,
    {
      method: 'GET',
      headers: getHeaders(token)
    }
  );
  
  return handleResponse(response);
};

/**
 * Get test case statistics
 * @param {Object} options - Query parameters (userId, trashStatus)
 */
export const getTestCaseStats = async (options = {}) => {
  const { projectId, testTypeId, token } = getCredentials();
  
  const queryParams = new URLSearchParams();
  if (options.userId) queryParams.append('userId', options.userId);
  if (options.trashStatus) queryParams.append('trashStatus', options.trashStatus);
  
  const response = await fetch(
    `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases/stats?${queryParams}`,
    {
      method: 'GET',
      headers: getHeaders(token)
    }
  );
  
  return handleResponse(response);
};

// ============================================
// UPDATE OPERATIONS
// ============================================

/**
 * Update test case (Manual update)
 * @param {string} testCaseId - Test case ID
 * @param {Object} updateData - Updated test case data
 */
export const updateTestCase = async (testCaseId, updateData) => {
  const { token } = getCredentials();
  
  const response = await fetch(
    `${BASE_URL}/test-cases/${testCaseId}`,
    {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(updateData)
    }
  );
  
  return handleResponse(response);
};

/**
 * AI-powered edit of test case
 * @param {string} testCaseId - Test case ID
 * @param {string} instructions - Edit instructions for AI
 */
export const aiEditTestCase = async (testCaseId, instructions) => {
  const { projectId, testTypeId, token } = getCredentials();
  
  const response = await fetch(
    `${BASE_URL}/test-cases/${projectId}/${testTypeId}/${testCaseId}/ai-edit`,
    {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify({ instructions })
    }
  );
  
  return handleResponse(response);
};

// ============================================
// TRASH OPERATIONS
// ============================================

/**
 * Move test case to trash (Manual)
 * @param {string} testCaseId - Test case ID
 */
export const moveToTrash = async (testCaseId) => {
  const { token } = getCredentials();
  
  const response = await fetch(
    `${BASE_URL}/test-cases/${testCaseId}/trash`,
    {
      method: 'PATCH',
      headers: getHeaders(token)
    }
  );
  
  return handleResponse(response);
};

/**
 * AI-powered move to trash with reasoning
 * @param {string} testCaseId - Test case ID
 * @param {string} reason - Reason for moving to trash
 */
export const aiMoveToTrash = async (testCaseId, reason = null) => {
  const { projectId, testTypeId, token } = getCredentials();
  
  const response = await fetch(
    `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases/${testCaseId}/ai-trash`,
    {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify({ reason })
    }
  );
  
  return handleResponse(response);
};

/**
 * AI-powered bulk move to trash
 * @param {Object} criteria - Filter criteria for bulk trash
 * @param {string} reason - Reason for bulk trash
 */
export const aiBulkTrash = async (criteria, reason = null) => {
  const { projectId, testTypeId, token } = getCredentials();
  
  const response = await fetch(
    `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases/ai-bulk-trash`,
    {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify({ criteria, reason })
    }
  );
  
  return handleResponse(response);
};

/**
 * Restore test case from trash (Admin only)
 * @param {string} testCaseId - Test case ID
 */
export const restoreFromTrash = async (testCaseId) => {
  const { token } = getCredentials();
  
  const response = await fetch(
    `${BASE_URL}/test-cases/${testCaseId}/restore`,
    {
      method: 'PATCH',
      headers: getHeaders(token)
    }
  );
  
  return handleResponse(response);
};

// ============================================
// DELETE OPERATIONS
// ============================================

/**
 * AI-powered single test case deletion with analysis
 * @param {string} testCaseId - Test case ID
 * @param {string} reason - Reason for deletion
 */
export const aiDeleteTestCase = async (testCaseId, reason = null) => {
  const { projectId, testTypeId, token } = getCredentials();
  
  const response = await fetch(
    `${BASE_URL}/test-cases/${projectId}/${testTypeId}/${testCaseId}/ai-delete`,
    {
      method: 'DELETE',
      headers: getHeaders(token),
      body: JSON.stringify({ reason })
    }
  );
  
  return handleResponse(response);
};

/**
 * AI-powered bulk delete all test cases
 * @param {Object} criteria - Filter criteria for bulk deletion
 * @param {string} reason - Reason for bulk deletion
 */
export const aiDeleteAllTestCases = async (criteria, reason = null) => {
  const { projectId, testTypeId, token } = getCredentials();
  
  const response = await fetch(
    `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/test-cases/ai-delete-all`,
    {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ criteria, reason })
    }
  );
  
  return handleResponse(response);
};

/**
 * Permanently delete test case (Admin only)
 * @param {string} testCaseId - Test case ID
 */
export const deletePermanently = async (testCaseId) => {
  const { token } = getCredentials();
  
  const response = await fetch(
    `${BASE_URL}/test-cases/${testCaseId}/permanent`,
    {
      method: 'DELETE',
      headers: getHeaders(token)
    }
  );
  
  return handleResponse(response);
};

// ============================================
// HELPER/UTILITY FUNCTIONS
// ============================================

/**
 * Find test case by serial number
 * @param {string} serialNumber - Serial number (e.g., TC-000001)
 */
export const findBySerialNumber = async (serialNumber) => {
  const allTestCases = await getAllTestCases({ limit: 1000 });
  const testCase = allTestCases.testCases.find(
    tc => tc.serialNumber === serialNumber
  );
  
  if (!testCase) {
    throw new Error(`Test case with serial number ${serialNumber} not found`);
  }
  
  return testCase;
};

/**
 * Get test case ID from serial number or ID
 * @param {string} identifier - Test case ID or serial number
 */
export const resolveTestCaseId = async (identifier) => {
  // If it looks like a serial number (TC-XXXXXX)
  if (identifier.match(/^TC-\d{6}$/)) {
    const testCase = await findBySerialNumber(identifier);
    return testCase._id;
  }
  
  // Otherwise assume it's an ID
  return identifier;
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * Build filter criteria object
 * @param {Object} filters - Filter parameters
 */
export const buildFilterCriteria = (filters) => {
  const criteria = {};
  
  if (filters.status) criteria.status = filters.status;
  if (filters.priority) criteria.priority = filters.priority;
  if (filters.severity) criteria.severity = filters.severity;
  if (filters.testCaseType) criteria.testCaseType = filters.testCaseType;
  
  return criteria;
};

// ============================================
// CHATBOT-SPECIFIC HELPERS
// ============================================

/**
 * Process chatbot command to execute appropriate API call
 * @param {string} command - Natural language command
 * @param {Object} params - Extracted parameters from command
 */
export const processChatbotCommand = async (command, params) => {
  const lowerCommand = command.toLowerCase();
  
  try {
    // Delete operations
    if (lowerCommand.includes('delete')) {
      if (params.testCaseId || params.serialNumber) {
        const id = await resolveTestCaseId(params.testCaseId || params.serialNumber);
        return await aiDeleteTestCase(id, params.reason);
      }
      if (params.criteria) {
        return await aiDeleteAllTestCases(params.criteria, params.reason);
      }
    }
    
    // Get/Fetch operations with filters
    if (lowerCommand.includes('get') || lowerCommand.includes('show') || lowerCommand.includes('find')) {
      // By status
      if (params.status) {
        return await getTestCasesByStatus(params.status, params.options);
      }
      // By priority
      if (params.priority) {
        return await getTestCasesByPriority(params.priority, params.options);
      }
      // By severity
      if (params.severity) {
        return await getTestCasesBySeverity(params.severity, params.options);
      }
      // By date
      if (params.date === 'today') {
        return await getTestCasesByDateRange(getTodayDate(), params.options);
      }
      if (params.startDate) {
        if (params.endDate) {
          return await getTestCasesByCustomDateRange(params.startDate, params.endDate, params.options);
        }
        return await getTestCasesByDateRange(params.startDate, params.options);
      }
      // By ID or serial number
      if (params.testCaseId || params.serialNumber) {
        const id = await resolveTestCaseId(params.testCaseId || params.serialNumber);
        return await getTestCaseById(id);
      }
      // Search by keyword
      if (params.keyword) {
        return await searchTestCases(params.keyword, params.options);
      }
      // Get all
      return await getAllTestCases(params.options);
    }
    
    // Update operations
    if (lowerCommand.includes('update') || lowerCommand.includes('edit') || lowerCommand.includes('modify')) {
      const id = await resolveTestCaseId(params.testCaseId || params.serialNumber);
      if (params.instructions) {
        return await aiEditTestCase(id, params.instructions);
      }
      return await updateTestCase(id, params.updateData);
    }
    
    // Move to trash
    if (lowerCommand.includes('trash') || lowerCommand.includes('archive')) {
      if (params.testCaseId || params.serialNumber) {
        const id = await resolveTestCaseId(params.testCaseId || params.serialNumber);
        return await aiMoveToTrash(id, params.reason);
      }
      if (params.criteria) {
        return await aiBulkTrash(params.criteria, params.reason);
      }
    }
    
    // Create operations
    if (lowerCommand.includes('create') || lowerCommand.includes('add') || lowerCommand.includes('new')) {
      if (params.rawText) {
        return await createTestCaseFromText(params.rawText, params.image);
      }
      return await createTestCase(params.testCaseData);
    }
    
    // Statistics
    if (lowerCommand.includes('stats') || lowerCommand.includes('statistics') || lowerCommand.includes('summary')) {
      return await getTestCaseStats(params.options);
    }
    
    throw new Error('Unable to process command. Please rephrase your request.');
  } catch (error) {
    throw new Error(`Command processing failed: ${error.message}`);
  }
};

// Export all functions
const testCaseApi = {
  // Create
  createTestCase,
  createTestCaseFromText,
  importFromGoogleSheets,
  generateFromGitHub,
  
  // Read
  getAllTestCases,
  getTestCaseById,
  searchTestCases,
  getTestCasesByDateRange,
  getTestCasesByCustomDateRange,
  getTestCasesBySeverity,
  getTestCasesByPriority,
  getTestCasesByStatus,
  getTestCaseStats,
  
  // Update
  updateTestCase,
  aiEditTestCase,
  
  // Trash
  moveToTrash,
  aiMoveToTrash,
  aiBulkTrash,
  restoreFromTrash,
  
  // Delete
  aiDeleteTestCase,
  aiDeleteAllTestCases,
  deletePermanently,
  
  // Helpers
  findBySerialNumber,
  resolveTestCaseId,
  getTodayDate,
  buildFilterCriteria,
  processChatbotCommand
};

export default testCaseApi;