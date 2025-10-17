// api.test.type.js
// Complete API service for Test Type operations

const BASE_URL = 'http://localhost:5000/api/v1/test-types';

// Helper function to get stored credentials
const getCredentials = () => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Missing authentication token. Please ensure you're logged in.");
    }

    return { token };
};

// Helper function to get project ID (optional, may not always be needed)
const getProjectId = () => {
    return localStorage.getItem("currentProjectId");
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
// READ OPERATIONS
// ============================================

/**
 * Get all test types for the current user/organization
 * @param {Object} options - Query parameters
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Results per page (default: 10)
 * @param {string} options.status - Filter by status (active/trash) - Admin only
 * @param {string} options.search - Search keyword
 * @param {string} options.userId - Filter by user ID - Admin only
 * @param {string} options.projectId - Filter by project ID
 * @param {string} options.framework - Filter by test framework
 */
export const getAllTestTypes = async (options = {}) => {
    const { token } = getCredentials();

    const queryParams = new URLSearchParams();
    if (options.page) queryParams.append('page', options.page);
    if (options.limit) queryParams.append('limit', options.limit);
    if (options.status) queryParams.append('status', options.status);
    if (options.search) queryParams.append('search', options.search);
    if (options.userId) queryParams.append('userId', options.userId);
    if (options.projectId) queryParams.append('projectId', options.projectId);
    if (options.framework) queryParams.append('framework', options.framework);

    const response = await fetch(
        `${BASE_URL}/test-types?${queryParams}`,
        {
            method: 'GET',
            headers: getHeaders(token)
        }
    );

    return handleResponse(response);
};

/**
 * Get test types by project ID
 * @param {string} projectId - Project ID (optional, uses localStorage if not provided)
 * @param {Object} options - Query parameters
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Results per page (default: 10)
 * @param {string} options.search - Search keyword
 * @param {string} options.framework - Filter by test framework
 * @param {boolean} options.includeTrash - Include trashed items (Admin only)
 */
export const getTestTypesByProject = async (projectId = null, options = {}) => {
    const { token } = getCredentials();

    // Use provided projectId or get from localStorage
    const targetProjectId = projectId || getProjectId();

    if (!targetProjectId) {
        throw new Error("Project ID is required. Please provide projectId or ensure currentProjectId is set in localStorage.");
    }

    const queryParams = new URLSearchParams();
    if (options.page) queryParams.append('page', options.page);
    if (options.limit) queryParams.append('limit', options.limit);
    if (options.search) queryParams.append('search', options.search);
    if (options.framework) queryParams.append('framework', options.framework);
    if (options.includeTrash) queryParams.append('includeTrash', 'true');

    const response = await fetch(
        `${BASE_URL}/projects/${targetProjectId}/test-types?${queryParams}`,
        {
            method: 'GET',
            headers: getHeaders(token)
        }
    );

    return handleResponse(response);
};

/**
 * Get test type by ID
 * @param {string} testTypeId - Test Type ID
 */
export const getTestTypeById = async (testTypeId) => {
    const { token } = getCredentials();

    if (!testTypeId) {
        throw new Error("Test Type ID is required.");
    }

    const response = await fetch(
        `${BASE_URL}/test-types/${testTypeId}`,
        {
            method: 'GET',
            headers: getHeaders(token)
        }
    );

    return handleResponse(response);
};

/**
 * Get test type from localStorage (selectedTestTypeId)
 */
export const getSelectedTestType = async () => {
    const testTypeId = localStorage.getItem("selectedTestTypeId");

    if (!testTypeId) {
        throw new Error("No test type selected. Please select a test type first.");
    }

    return await getTestTypeById(testTypeId);
};

// ============================================
// SEARCH AND FILTER OPERATIONS
// ============================================

/**
 * Search test types by keyword
 * @param {string} keyword - Search keyword
 * @param {Object} options - Additional query parameters
 */
export const searchTestTypes = async (keyword, options = {}) => {
    if (!keyword || keyword.trim() === '') {
        throw new Error("Search keyword is required.");
    }

    return await getAllTestTypes({
        ...options,
        search: keyword
    });
};

/**
 * Search test types within a specific project
 * @param {string} projectId - Project ID
 * @param {string} keyword - Search keyword
 * @param {Object} options - Additional query parameters
 */
export const searchTestTypesInProject = async (projectId, keyword, options = {}) => {
    if (!keyword || keyword.trim() === '') {
        throw new Error("Search keyword is required.");
    }

    return await getTestTypesByProject(projectId, {
        ...options,
        search: keyword
    });
};

/**
 * Get test types by framework
 * @param {string} framework - Test framework name
 * @param {Object} options - Additional query parameters
 */
export const getTestTypesByFramework = async (framework, options = {}) => {
    if (!framework) {
        throw new Error("Framework is required.");
    }

    return await getAllTestTypes({
        ...options,
        framework: framework
    });
};

/**
 * Get test types by status (Admin only)
 * @param {string} status - Status (active/trash)
 * @param {Object} options - Additional query parameters
 */
export const getTestTypesByStatus = async (status, options = {}) => {
    const validStatuses = ['active', 'trash'];

    if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    return await getAllTestTypes({
        ...options,
        status: status
    });
};

/**
 * Get test types by user ID (Admin only)
 * @param {string} userId - User ID
 * @param {Object} options - Additional query parameters
 */
export const getTestTypesByUser = async (userId, options = {}) => {
    if (!userId) {
        throw new Error("User ID is required.");
    }

    return await getAllTestTypes({
        ...options,
        userId: userId
    });
};

// ============================================
// UTILITY AND HELPER FUNCTIONS
// ============================================

/**
 * Get test types for current project from localStorage
 * @param {Object} options - Query parameters
 */
export const getCurrentProjectTestTypes = async (options = {}) => {
    const projectId = getProjectId();

    if (!projectId) {
        throw new Error("No project selected. Please select a project first.");
    }

    return await getTestTypesByProject(projectId, options);
};

/**
 * Find test type by name
 * @param {string} testTypeName - Test type name
 * @param {string} projectId - Optional project ID to narrow search
 */
export const findTestTypeByName = async (testTypeName, projectId = null) => {
    if (!testTypeName) {
        throw new Error("Test type name is required.");
    }

    const options = { search: testTypeName, limit: 100 };

    let result;
    if (projectId) {
        result = await getTestTypesByProject(projectId, options);
    } else {
        result = await getAllTestTypes(options);
    }

    const testType = result.testTypes.find(
        tt => tt.testTypeName.toLowerCase() === testTypeName.toLowerCase()
    );

    if (!testType) {
        throw new Error(`Test type with name "${testTypeName}" not found.`);
    }

    return testType;
};

/**
 * Check if test type exists
 * @param {string} testTypeId - Test Type ID
 * @returns {boolean}
 */
export const testTypeExists = async (testTypeId) => {
    try {
        await getTestTypeById(testTypeId);
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Get test type count for a project
 * @param {string} projectId - Project ID
 */
export const getTestTypeCount = async (projectId = null) => {
    const result = await getTestTypesByProject(projectId, { limit: 1 });
    return result.pagination.totalTestTypes;
};

/**
 * Get all frameworks from test types
 * @param {string} projectId - Optional project ID
 */
export const getAllFrameworks = async (projectId = null) => {
    const options = { limit: 1000 };

    let result;
    if (projectId) {
        result = await getTestTypesByProject(projectId, options);
    } else {
        result = await getAllTestTypes(options);
    }

    const frameworks = [...new Set(
        result.testTypes
            .map(tt => tt.testFramework)
            .filter(fw => fw && fw.trim() !== '')
    )];

    return frameworks;
};

// ============================================
// CHATBOT-SPECIFIC HELPERS
// ============================================

/**
 * Process chatbot command for test type operations
 * @param {string} command - Natural language command
 * @param {Object} params - Extracted parameters from command
 */
export const processChatbotCommand = async (command, params = {}) => {
    const lowerCommand = command.toLowerCase();

    try {
        // Get operations
        if (lowerCommand.includes('get') || lowerCommand.includes('show') || lowerCommand.includes('list') || lowerCommand.includes('find')) {

            // Get by ID
            if (params.testTypeId) {
                return await getTestTypeById(params.testTypeId);
            }

            // Get by name
            if (params.testTypeName) {
                return await findTestTypeByName(params.testTypeName, params.projectId);
            }

            // Get by framework
            if (params.framework) {
                return await getTestTypesByFramework(params.framework, params.options);
            }

            // Get by status
            if (params.status) {
                return await getTestTypesByStatus(params.status, params.options);
            }

            // Get by project
            if (params.projectId || lowerCommand.includes('project')) {
                return await getTestTypesByProject(params.projectId, params.options);
            }

            // Get selected test type
            if (lowerCommand.includes('selected') || lowerCommand.includes('current')) {
                return await getSelectedTestType();
            }

            // Get all
            return await getAllTestTypes(params.options);
        }

        // Search operations
        if (lowerCommand.includes('search')) {
            if (params.projectId) {
                return await searchTestTypesInProject(params.projectId, params.keyword, params.options);
            }
            return await searchTestTypes(params.keyword, params.options);
        }

        // Count operations
        if (lowerCommand.includes('count') || lowerCommand.includes('how many')) {
            return await getTestTypeCount(params.projectId);
        }

        // Framework list
        if (lowerCommand.includes('frameworks') || lowerCommand.includes('framework list')) {
            return await getAllFrameworks(params.projectId);
        }

        throw new Error('Unable to process command. Please rephrase your request.');
    } catch (error) {
        throw new Error(`Command processing failed: ${error.message}`);
    }
};

/**
 * Parse common chatbot queries for test types
 * @param {string} query - User query
 * @returns {Object} Parsed parameters
 */
export const parseTestTypeQuery = (query) => {
    const lowerQuery = query.toLowerCase();
    const params = { options: {} };

    // Extract test type ID (assuming format like: 507f1f77bcf86cd799439011)
    const idMatch = query.match(/\b[a-f\d]{24}\b/i);
    if (idMatch) {
        params.testTypeId = idMatch[0];
    }

    // Extract test type name (in quotes)
    const nameMatch = query.match(/["']([^"']+)["']/);
    if (nameMatch) {
        params.testTypeName = nameMatch[1];
    }

    // Check for framework mentions
    const frameworks = ['selenium', 'cypress', 'playwright', 'jest', 'mocha', 'junit', 'testng', 'pytest', 'robot'];
    for (const fw of frameworks) {
        if (lowerQuery.includes(fw)) {
            params.framework = fw.charAt(0).toUpperCase() + fw.slice(1);
            break;
        }
    }

    // Check for status
    if (lowerQuery.includes('active')) {
        params.status = 'active';
    } else if (lowerQuery.includes('trash') || lowerQuery.includes('deleted')) {
        params.status = 'trash';
    }

    // Check for project context
    if (lowerQuery.includes('this project') || lowerQuery.includes('current project')) {
        params.projectId = getProjectId();
    }

    // Extract search keyword (after "search for" or "find")
    const searchMatch = query.match(/(?:search for|find)\s+(.+?)(?:\s+in|\s+with|$)/i);
    if (searchMatch) {
        params.keyword = searchMatch[1].trim();
    }

    return params;
};

// Export all functions
const testTypeApi = {
    // Core operations
    getAllTestTypes,
    getTestTypesByProject,
    getTestTypeById,
    getSelectedTestType,

    // Search and filter
    searchTestTypes,
    searchTestTypesInProject,
    getTestTypesByFramework,
    getTestTypesByStatus,
    getTestTypesByUser,

    // Utilities
    getCurrentProjectTestTypes,
    findTestTypeByName,
    testTypeExists,
    getTestTypeCount,
    getAllFrameworks,

    // Chatbot helpers
    processChatbotCommand,
    parseTestTypeQuery
};

export default testTypeApi;