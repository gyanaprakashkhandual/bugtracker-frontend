// api.bug.js - Complete Bug API Service
const BASE_URL = 'http://localhost:5000/api/v1/bug';

// Helper function to get auth data from localStorage
const getAuthData = () => {
    const projectId = localStorage.getItem('currentProjectId');
    const testTypeId = localStorage.getItem('selectedTestTypeId');
    const token = localStorage.getItem('token');

    return { projectId, testTypeId, token };
};

// Helper function for API calls
const apiCall = async (url, options = {}) => {
    const { token } = getAuthData();

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// =============================================
// BUG CREATION APIs
// =============================================

/**
 * Create a bug manually
 * @param {Object} bugData - Bug details (bugType, moduleName, bugDesc, etc.)
 * @returns {Object} - Success/failure response with bug data
 */
export const createBug = async (bugData) => {
    const { projectId, testTypeId } = getAuthData();

    if (!projectId || !testTypeId) {
        return { success: false, error: 'Project or Test Type ID not found' };
    }

    const url = `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs`;

    return apiCall(url, {
        method: 'POST',
        body: JSON.stringify(bugData),
    });
};

/**
 * Create bug from raw text using AI
 * @param {string} rawText - Unstructured bug description text
 * @returns {Object} - Success/failure response with structured bug data
 */
export const createBugFromText = async (rawText) => {
    const { projectId, testTypeId } = getAuthData();

    if (!projectId || !testTypeId) {
        return { success: false, error: 'Project or Test Type ID not found' };
    }

    const url = `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/ai-text`;

    return apiCall(url, {
        method: 'POST',
        body: JSON.stringify({ rawText }),
    });
};

/**
 * Import bugs from Google Sheets
 * @param {string} googleSheetUrl - Public Google Sheet URL
 * @returns {Object} - Success/failure response with imported bugs
 */
export const importBugsFromGoogleSheets = async (googleSheetUrl) => {
    const { projectId, testTypeId } = getAuthData();

    if (!projectId || !testTypeId) {
        return { success: false, error: 'Project or Test Type ID not found' };
    }

    const url = `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/import/google-sheets`;

    return apiCall(url, {
        method: 'POST',
        body: JSON.stringify({ googleSheetUrl }),
    });
};

// =============================================
// BUG RETRIEVAL APIs
// =============================================

/**
 * Get all bugs for a project and test type
 * @param {Object} options - { page, limit, search, bugType, status, priority, severity, includeTrash }
 * @returns {Object} - Success/failure response with paginated bugs
 */
export const getBugs = async (options = {}) => {
    const { projectId, testTypeId } = getAuthData();

    if (!projectId || !testTypeId) {
        return { success: false, error: 'Project or Test Type ID not found' };
    }

    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.append(key, value);
        }
    });

    const url = `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs?${params}`;

    return apiCall(url, { method: 'GET' });
};

/**
 * Get a single bug by ID
 * @param {string} bugId - Bug ID
 * @returns {Object} - Success/failure response with bug details
 */
export const getBugById = async (bugId) => {
    if (!bugId) {
        return { success: false, error: 'Bug ID is required' };
    }

    const url = `${BASE_URL}/projects/${bugId}`;

    return apiCall(url, { method: 'GET' });
};

// =============================================
// BUG UPDATE APIs
// =============================================

/**
 * Update bug manually
 * @param {string} bugId - Bug ID
 * @param {Object} bugData - Updated bug details
 * @returns {Object} - Success/failure response with updated bug
 */
export const updateBug = async (bugId, bugData) => {
    const { projectId, testTypeId } = getAuthData();

    if (!projectId || !testTypeId || !bugId) {
        return { success: false, error: 'Missing required parameters' };
    }

    const url = `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/${bugId}`;

    return apiCall(url, {
        method: 'PUT',
        body: JSON.stringify(bugData),
    });
};

/**
 * Update bug using AI from raw text
 * @param {string} bugId - Bug ID
 * @param {string} rawText - Unstructured update text
 * @returns {Object} - Success/failure response with updated bug
 */
export const updateBugByAI = async (bugId, rawText) => {
    const { projectId, testTypeId } = getAuthData();

    if (!projectId || !testTypeId || !bugId) {
        return { success: false, error: 'Missing required parameters' };
    }

    const url = `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/${bugId}/ai-update`;

    return apiCall(url, {
        method: 'PUT',
        body: JSON.stringify({ rawText }),
    });
};

// =============================================
// BUG DELETION/TRASH APIs
// =============================================

/**
 * Move a single bug to trash
 * @param {string} bugId - Bug ID
 * @returns {Object} - Success/failure response
 */
export const moveBugToTrash = async (bugId) => {
    const { projectId, testTypeId } = getAuthData();

    if (!projectId || !testTypeId || !bugId) {
        return { success: false, error: 'Missing required parameters' };
    }

    const url = `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/${bugId}/trash`;

    return apiCall(url, { method: 'PATCH' });
};

/**
 * Move bug to trash using AI (by serial number, ID, or module name)
 * @param {string} rawText - Text identifying the bug (e.g., "B-000001", "bugId", or "moduleName")
 * @returns {Object} - Success/failure response
 */
export const moveBugToTrashByAI = async (rawText) => {
    const { projectId, testTypeId } = getAuthData();

    if (!projectId || !testTypeId) {
        return { success: false, error: 'Project or Test Type ID not found' };
    }

    const url = `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/ai-trash`;

    return apiCall(url, {
        method: 'PATCH',
        body: JSON.stringify({ rawText }),
    });
};

/**
 * Move all bugs to trash in a test type
 * @returns {Object} - Success/failure response
 */
export const moveAllBugsToTrash = async () => {
    const { projectId, testTypeId } = getAuthData();

    if (!projectId || !testTypeId) {
        return { success: false, error: 'Project or Test Type ID not found' };
    }

    const url = `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/trash-all`;

    return apiCall(url, { method: 'PATCH' });
};

/**
 * Delete a bug permanently (AI-based identification)
 * @param {string} rawText - Text identifying the bug
 * @returns {Object} - Success/failure response
 */
export const deleteBugByAI = async (rawText) => {
    const { projectId, testTypeId } = getAuthData();

    if (!projectId || !testTypeId) {
        return { success: false, error: 'Project or Test Type ID not found' };
    }

    const url = `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/ai-delete`;

    return apiCall(url, {
        method: 'DELETE',
        body: JSON.stringify({ rawText }),
    });
};

/**
 * Delete a bug permanently by ID
 * @param {string} bugId - Bug ID
 * @returns {Object} - Success/failure response
 */
export const deleteBugPermanently = async (bugId) => {
    const { projectId, testTypeId } = getAuthData();

    if (!projectId || !testTypeId || !bugId) {
        return { success: false, error: 'Missing required parameters' };
    }

    const url = `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/${bugId}/permanent`;

    return apiCall(url, { method: 'DELETE' });
};

/**
 * Delete multiple bugs using AI
 * @param {string} rawText - Text identifying multiple bugs (e.g., "delete bugs B-000001 and B-000002" or "delete all bugs")
 * @returns {Object} - Success/failure response
 */
export const deleteBulkBugsByAI = async (rawText) => {
    const { projectId, testTypeId } = getAuthData();

    if (!projectId || !testTypeId) {
        return { success: false, error: 'Project or Test Type ID not found' };
    }

    const url = `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/ai-delete-bulk`;

    return apiCall(url, {
        method: 'DELETE',
        body: JSON.stringify({ rawText }),
    });
};

/**
 * Move multiple bugs to trash using AI
 * @param {string} rawText - Text identifying multiple bugs
 * @returns {Object} - Success/failure response
 */
export const trashBulkBugsByAI = async (rawText) => {
    const { projectId, testTypeId } = getAuthData();

    if (!projectId || !testTypeId) {
        return { success: false, error: 'Project or Test Type ID not found' };
    }

    const url = `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/ai-trash-bulk`;

    return apiCall(url, {
        method: 'PATCH',
        body: JSON.stringify({ rawText }),
    });
};

/**
 * Delete all bugs in a test type
 * @returns {Object} - Success/failure response
 */
export const deleteAllBugsInTestType = async () => {
    const { projectId, testTypeId } = getAuthData();

    if (!projectId || !testTypeId) {
        return { success: false, error: 'Project or Test Type ID not found' };
    }

    const url = `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/delete-all`;

    return apiCall(url, { method: 'DELETE' });
};

/**
 * Restore a bug from trash
 * @param {string} bugId - Bug ID
 * @returns {Object} - Success/failure response
 */
export const restoreBugFromTrash = async (bugId) => {
    const { projectId, testTypeId } = getAuthData();

    if (!projectId || !testTypeId || !bugId) {
        return { success: false, error: 'Missing required parameters' };
    }

    const url = `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/${bugId}/restore`;

    return apiCall(url, { method: 'PATCH' });
};

// =============================================
// BUG SEARCH & FILTER APIs
// =============================================

/**
 * Search bugs by text
 * @param {string} search - Search query
 * @param {Object} options - { page, limit }
 * @returns {Object} - Success/failure response with matching bugs
 */
export const searchBugs = async (search, options = {}) => {
    const { projectId, testTypeId } = getAuthData();

    if (!projectId || !testTypeId) {
        return { success: false, error: 'Project or Test Type ID not found' };
    }

    const params = new URLSearchParams({ search, ...options });
    const url = `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/search?${params}`;

    return apiCall(url, { method: 'GET' });
};

/**
 * Filter bugs by date range
 * @param {string} fromDate - Start date (ISO format)
 * @param {string} toDate - End date (ISO format)
 * @param {Object} options - { page, limit }
 * @returns {Object} - Success/failure response with filtered bugs
 */
export const filterBugsByDate = async (fromDate, toDate, options = {}) => {
    const { projectId, testTypeId } = getAuthData();

    if (!projectId || !testTypeId) {
        return { success: false, error: 'Project or Test Type ID not found' };
    }

    const params = new URLSearchParams({ fromDate, toDate, ...options });
    const url = `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/filter/date?${params}`;

    return apiCall(url, { method: 'GET' });
};

/**
 * Filter bugs by severity
 * @param {string} severity - Severity level (e.g., "High", "Medium", "Low")
 * @param {Object} options - { page, limit }
 * @returns {Object} - Success/failure response with filtered bugs
 */
export const filterBugsBySeverity = async (severity, options = {}) => {
    const { projectId, testTypeId } = getAuthData();

    if (!projectId || !testTypeId) {
        return { success: false, error: 'Project or Test Type ID not found' };
    }

    const params = new URLSearchParams({ severity, ...options });
    const url = `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/filter/severity?${params}`;

    return apiCall(url, { method: 'GET' });
};

/**
 * Filter bugs by priority
 * @param {string} priority - Priority level (e.g., "High", "Medium", "Low")
 * @param {Object} options - { page, limit }
 * @returns {Object} - Success/failure response with filtered bugs
 */
export const filterBugsByPriority = async (priority, options = {}) => {
    const { projectId, testTypeId } = getAuthData();

    if (!projectId || !testTypeId) {
        return { success: false, error: 'Project or Test Type ID not found' };
    }

    const params = new URLSearchParams({ priority, ...options });
    const url = `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/filter/priority?${params}`;

    return apiCall(url, { method: 'GET' });
};

/**
 * Filter bugs by status
 * @param {string} status - Bug status (e.g., "New", "Open", "Closed")
 * @param {Object} options - { page, limit }
 * @returns {Object} - Success/failure response with filtered bugs
 */
export const filterBugsByStatus = async (status, options = {}) => {
    const { projectId, testTypeId } = getAuthData();

    if (!projectId || !testTypeId) {
        return { success: false, error: 'Project or Test Type ID not found' };
    }

    const params = new URLSearchParams({ status, ...options });
    const url = `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/filter/status?${params}`;

    return apiCall(url, { method: 'GET' });
};

/**
 * Filter bugs with multiple criteria
 * @param {Object} filters - { search, fromDate, toDate, severity, priority, status, bugType, page, limit }
 * @returns {Object} - Success/failure response with filtered bugs
 */
export const filterBugsCombined = async (filters = {}) => {
    const { projectId, testTypeId } = getAuthData();

    if (!projectId || !testTypeId) {
        return { success: false, error: 'Project or Test Type ID not found' };
    }

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.append(key, value);
        }
    });

    const url = `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/filter/combined?${params}`;

    return apiCall(url, { method: 'GET' });
};

// =============================================
// BUG STATISTICS APIs
// =============================================

/**
 * Get bug statistics for a test type
 * @returns {Object} - Success/failure response with statistics
 */
export const getBugStats = async () => {
    const { projectId, testTypeId } = getAuthData();

    if (!projectId || !testTypeId) {
        return { success: false, error: 'Project or Test Type ID not found' };
    }

    const url = `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/bugs/stats`;

    return apiCall(url, { method: 'GET' });
};

/**
 * Get bug statistics for an entire project
 * @returns {Object} - Success/failure response with project-wide statistics
 */
export const getProjectBugStats = async () => {
    const { projectId } = getAuthData();

    if (!projectId) {
        return { success: false, error: 'Project ID not found' };
    }

    const url = `${BASE_URL}/projects/${projectId}/bugs/stats`;

    return apiCall(url, { method: 'GET' });
};

// =============================================
// HELPER FUNCTIONS FOR CHATBOT
// =============================================

/**
 * Parse user intent and call appropriate API
 * Useful for chatbot to understand commands
 * @param {string} userMessage - User's message
 * @returns {Object} - Suggested API call and parameters
 */
export const parseUserIntent = (userMessage) => {
    const lower = userMessage.toLowerCase();

    // Delete intentions
    if (lower.includes('delete') && lower.includes('bug')) {
        return { action: 'delete', type: 'single' };
    }

    // Trash intentions
    if (lower.includes('trash') || lower.includes('remove')) {
        return { action: 'trash', type: 'single' };
    }

    // Create intentions
    if (lower.includes('create') || lower.includes('new bug') || lower.includes('report bug')) {
        return { action: 'create', type: 'text' };
    }

    // Search/Filter intentions
    if (lower.includes('show') || lower.includes('get') || lower.includes('list')) {
        if (lower.includes('severity') || lower.includes('critical') || lower.includes('high')) {
            return { action: 'filter', filterType: 'severity' };
        }
        if (lower.includes('priority')) {
            return { action: 'filter', filterType: 'priority' };
        }
        if (lower.includes('status') || lower.includes('open') || lower.includes('closed')) {
            return { action: 'filter', filterType: 'status' };
        }
        if (lower.includes('today') || lower.includes('date')) {
            return { action: 'filter', filterType: 'date' };
        }
        return { action: 'list', type: 'all' };
    }

    // Stats intentions
    if (lower.includes('stats') || lower.includes('statistics') || lower.includes('summary')) {
        return { action: 'stats' };
    }

    return { action: 'unknown' };
};

const bugApi = {
    createBug,
    createBugFromText,
    importBugsFromGoogleSheets,
    getBugs,
    getBugById,
    updateBug,
    updateBugByAI,
    moveBugToTrash,
    moveBugToTrashByAI,
    moveAllBugsToTrash,
    deleteBugByAI,
    deleteBugPermanently,
    deleteBulkBugsByAI,
    trashBulkBugsByAI,
    deleteAllBugsInTestType,
    restoreBugFromTrash,
    searchBugs,
    filterBugsByDate,
    filterBugsBySeverity,
    filterBugsByPriority,
    filterBugsByStatus,
    filterBugsCombined,
    getBugStats,
    getProjectBugStats,
    parseUserIntent,
};

export default bugApi;