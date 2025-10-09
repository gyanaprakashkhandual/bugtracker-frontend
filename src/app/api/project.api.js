// apis/project.api.js
// Complete API service for Project operations

const BASE_URL = 'http://localhost:5000/api/v1/project';

// Helper function to get stored credentials
const getCredentials = () => {
    if (typeof window === 'undefined') {
        throw new Error("Window is not available. This function must be called in a browser environment.");
    }

    try {
        const token = window.localStorage?.getItem("token");

        if (!token) {
            throw new Error("Missing authentication token. Please ensure you're logged in.");
        }

        return { token };
    } catch (error) {
        // Fallback to window.authToken if localStorage fails
        const token = window.authToken;
        if (!token) {
            throw new Error("Missing authentication token. Please ensure you're logged in.");
        }
        return { token };
    }
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
 * Get all projects (organization-wide for admin, own projects for users)
 * @param {Object} options - Query parameters
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Results per page (default: 10)
 * @param {string} options.search - Search keyword
 * @param {string} options.userId - Filter by user ID (Admin only)
 */
export const getAllProjects = async (options = {}) => {
    const { token } = getCredentials();

    const queryParams = new URLSearchParams();
    if (options.page) queryParams.append('page', options.page);
    if (options.limit) queryParams.append('limit', options.limit);
    if (options.search) queryParams.append('search', options.search);
    if (options.userId) queryParams.append('userId', options.userId);

    const response = await fetch(
        `${BASE_URL}?${queryParams}`,
        {
            method: 'GET',
            headers: getHeaders(token)
        }
    );

    return handleResponse(response);
};

/**
 * Get current user's own projects
 * @param {Object} options - Query parameters
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Results per page (default: 10)
 * @param {string} options.search - Search keyword
 */
export const getMyProjects = async (options = {}) => {
    const { token } = getCredentials();

    const queryParams = new URLSearchParams();
    if (options.page) queryParams.append('page', options.page);
    if (options.limit) queryParams.append('limit', options.limit);
    if (options.search) queryParams.append('search', options.search);

    const response = await fetch(
        `${BASE_URL}/my-projects?${queryParams}`,
        {
            method: 'GET',
            headers: getHeaders(token)
        }
    );

    return handleResponse(response);
};

/**
 * Get project by ID
 * @param {string} projectId - Project ID
 */
export const getProjectById = async (projectId) => {
    const { token } = getCredentials();

    if (!projectId) {
        throw new Error("Project ID is required.");
    }

    const response = await fetch(
        `${BASE_URL}/${projectId}`,
        {
            method: 'GET',
            headers: getHeaders(token)
        }
    );

    return handleResponse(response);
};

/**
 * Get project by slug
 * @param {string} slug - Project slug
 */
export const getProjectBySlug = async (slug) => {
    const { token } = getCredentials();

    if (!slug) {
        throw new Error("Project slug is required.");
    }

    const response = await fetch(
        `${BASE_URL}/slug/${slug}`,
        {
            method: 'GET',
            headers: getHeaders(token)
        }
    );

    return handleResponse(response);
};

/**
 * Get project statistics (Admin only)
 * @returns {Object} Project statistics including counts and recent projects
 */
export const getProjectStats = async () => {
    const { token } = getCredentials();

    const response = await fetch(
        `${BASE_URL}/admin/stats`,
        {
            method: 'GET',
            headers: getHeaders(token)
        }
    );

    return handleResponse(response);
};

/**
 * Get current project from memory
 */
export const getCurrentProject = async () => {
    if (typeof window === 'undefined') {
        throw new Error("Window is not available.");
    }

    const projectId = window.localStorage?.getItem("currentProjectId") || window.currentProjectId;

    if (!projectId) {
        throw new Error("No project selected. Please select a project first.");
    }

    return await getProjectById(projectId);
};

// ============================================
// SEARCH OPERATIONS
// ============================================

/**
 * Search all projects by keyword
 * @param {string} keyword - Search keyword
 * @param {Object} options - Additional query parameters
 */
export const searchProjects = async (keyword, options = {}) => {
    if (!keyword || keyword.trim() === '') {
        throw new Error("Search keyword is required.");
    }

    return await getAllProjects({
        ...options,
        search: keyword
    });
};

/**
 * Search user's own projects by keyword
 * @param {string} keyword - Search keyword
 * @param {Object} options - Additional query parameters
 */
export const searchMyProjects = async (keyword, options = {}) => {
    if (!keyword || keyword.trim() === '') {
        throw new Error("Search keyword is required.");
    }

    return await getMyProjects({
        ...options,
        search: keyword
    });
};

// ============================================
// FILTER OPERATIONS
// ============================================

/**
 * Get projects by user ID (Admin only)
 * @param {string} userId - User ID
 * @param {Object} options - Additional query parameters
 */
export const getProjectsByUser = async (userId, options = {}) => {
    if (!userId) {
        throw new Error("User ID is required.");
    }

    return await getAllProjects({
        ...options,
        userId: userId
    });
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Find project by name
 * @param {string} projectName - Project name
 * @returns {Object} Project object
 */
export const findProjectByName = async (projectName) => {
    if (!projectName) {
        throw new Error("Project name is required.");
    }

    const result = await getAllProjects({ search: projectName, limit: 100 });

    const project = result.projects.find(
        p => p.projectName.toLowerCase() === projectName.toLowerCase()
    );

    if (!project) {
        throw new Error(`Project with name "${projectName}" not found.`);
    }

    return project;
};

/**
 * Check if project exists
 * @param {string} projectId - Project ID
 * @returns {boolean}
 */
export const projectExists = async (projectId) => {
    try {
        await getProjectById(projectId);
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Get total project count
 * @returns {number} Total number of projects
 */
export const getProjectCount = async () => {
    const result = await getAllProjects({ limit: 1 });
    return result.pagination.totalProjects;
};

/**
 * Get my project count
 * @returns {number} Total number of user's own projects
 */
export const getMyProjectCount = async () => {
    const result = await getMyProjects({ limit: 1 });
    return result.pagination.totalProjects;
};

/**
 * Set current project in memory
 * @param {string} projectId - Project ID
 */
export const setCurrentProject = (projectId) => {
    if (!projectId) {
        throw new Error("Project ID is required.");
    }

    if (typeof window !== 'undefined') {
        try {
            window.localStorage?.setItem("currentProjectId", projectId);
        } catch (e) {
            window.currentProjectId = projectId;
        }
    }
};

/**
 * Clear current project from memory
 */
export const clearCurrentProject = () => {
    if (typeof window !== 'undefined') {
        try {
            window.localStorage?.removeItem("currentProjectId");
        } catch (e) {
            window.currentProjectId = null;
        }
    }
};

/**
 * Get project ID from memory
 * @returns {string|null} Project ID or null
 */
export const getCurrentProjectId = () => {
    if (typeof window === 'undefined') return null;

    try {
        return window.localStorage?.getItem("currentProjectId") || window.currentProjectId || null;
    } catch (e) {
        return window.currentProjectId || null;
    }
};

// Export all functions
const projectApi = {
    // Core operations
    getAllProjects,
    getMyProjects,
    getProjectById,
    getProjectBySlug,
    getProjectStats,
    getCurrentProject,

    // Search operations
    searchProjects,
    searchMyProjects,

    // Filter operations
    getProjectsByUser,

    // Utilities
    findProjectByName,
    projectExists,
    getProjectCount,
    getMyProjectCount,
    setCurrentProject,
    clearCurrentProject,
    getCurrentProjectId
};

export default projectApi;