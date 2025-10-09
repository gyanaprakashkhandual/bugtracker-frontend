// api.project.js
// Complete API service for Project operations

const BASE_URL = 'http://localhost:5000/api/v1/project';

// Helper function to get stored credentials
const getCredentials = () => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("Missing authentication token. Please ensure you're logged in.");
  }
  
  return { token };
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
 * Get current project from localStorage
 */
export const getCurrentProject = async () => {
  const projectId = localStorage.getItem("currentProjectId");
  
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

/**
 * Get AI-generated projects from stats (Admin only)
 * @returns {number} Count of AI-generated projects
 */
export const getAIGeneratedProjectsCount = async () => {
  const stats = await getProjectStats();
  return stats.stats.aiGeneratedCount;
};

/**
 * Get recent projects (last 30 days) count (Admin only)
 * @returns {number} Count of recent projects
 */
export const getRecentProjectsCount = async () => {
  const stats = await getProjectStats();
  return stats.stats.recentProjectsCount;
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
 * Validate project access
 * @param {string} projectId - Project ID
 * @returns {boolean} True if user has access
 */
export const validateProjectAccess = async (projectId) => {
  try {
    await getProjectById(projectId);
    return true;
  } catch (error) {
    if (error.message.includes("Access denied")) {
      return false;
    }
    throw error;
  }
};

/**
 * Set current project in localStorage
 * @param {string} projectId - Project ID
 */
export const setCurrentProject = (projectId) => {
  if (!projectId) {
    throw new Error("Project ID is required.");
  }
  localStorage.setItem("currentProjectId", projectId);
};

/**
 * Clear current project from localStorage
 */
export const clearCurrentProject = () => {
  localStorage.removeItem("currentProjectId");
};

/**
 * Get project ID from localStorage
 * @returns {string|null} Project ID or null
 */
export const getCurrentProjectId = () => {
  return localStorage.getItem("currentProjectId");
};

// ============================================
// ADMIN-SPECIFIC OPERATIONS
// ============================================

/**
 * Get top project creators (Admin only)
 * @returns {Array} List of users with project counts
 */
export const getTopProjectCreators = async () => {
  const stats = await getProjectStats();
  return stats.stats.projectsByUser;
};

/**
 * Get recent projects (Admin only)
 * @returns {Array} List of recent projects
 */
export const getRecentProjects = async () => {
  const stats = await getProjectStats();
  return stats.stats.recentProjects;
};

/**
 * Get organization overview (Admin only)
 * @returns {Object} Organization statistics
 */
export const getOrganizationOverview = async () => {
  const stats = await getProjectStats();
  return {
    organizationName: stats.stats.organizationName,
    organizationId: stats.stats.organizationId,
    totalProjects: stats.stats.totalProjects,
    recentProjectsCount: stats.stats.recentProjectsCount,
    aiGeneratedCount: stats.stats.aiGeneratedCount
  };
};

// ============================================
// CHATBOT-SPECIFIC HELPERS
// ============================================

/**
 * Process chatbot command for project operations
 * @param {string} command - Natural language command
 * @param {Object} params - Extracted parameters from command
 */
export const processChatbotCommand = async (command, params = {}) => {
  const lowerCommand = command.toLowerCase();
  
  try {
    // Get operations
    if (lowerCommand.includes('get') || lowerCommand.includes('show') || lowerCommand.includes('list') || lowerCommand.includes('find')) {
      
      // Get by ID
      if (params.projectId) {
        return await getProjectById(params.projectId);
      }
      
      // Get by slug
      if (params.slug) {
        return await getProjectBySlug(params.slug);
      }
      
      // Get by name
      if (params.projectName) {
        return await findProjectByName(params.projectName);
      }
      
      // Get current project
      if (lowerCommand.includes('current') || lowerCommand.includes('selected')) {
        return await getCurrentProject();
      }
      
      // Get my projects
      if (lowerCommand.includes('my') || lowerCommand.includes('own')) {
        return await getMyProjects(params.options);
      }
      
      // Get by user (Admin only)
      if (params.userId) {
        return await getProjectsByUser(params.userId, params.options);
      }
      
      // Get all
      return await getAllProjects(params.options);
    }
    
    // Search operations
    if (lowerCommand.includes('search')) {
      if (lowerCommand.includes('my')) {
        return await searchMyProjects(params.keyword, params.options);
      }
      return await searchProjects(params.keyword, params.options);
    }
    
    // Statistics operations
    if (lowerCommand.includes('stats') || lowerCommand.includes('statistics')) {
      return await getProjectStats();
    }
    
    // Count operations
    if (lowerCommand.includes('count') || lowerCommand.includes('how many')) {
      if (lowerCommand.includes('my')) {
        return await getMyProjectCount();
      }
      if (lowerCommand.includes('ai')) {
        return await getAIGeneratedProjectsCount();
      }
      if (lowerCommand.includes('recent')) {
        return await getRecentProjectsCount();
      }
      return await getProjectCount();
    }
    
    // Overview operations
    if (lowerCommand.includes('overview') || lowerCommand.includes('summary')) {
      return await getOrganizationOverview();
    }
    
    // Top creators (Admin)
    if (lowerCommand.includes('top') && lowerCommand.includes('creator')) {
      return await getTopProjectCreators();
    }
    
    // Recent projects (Admin)
    if (lowerCommand.includes('recent')) {
      return await getRecentProjects();
    }
    
    throw new Error('Unable to process command. Please rephrase your request.');
  } catch (error) {
    throw new Error(`Command processing failed: ${error.message}`);
  }
};

/**
 * Parse common chatbot queries for projects
 * @param {string} query - User query
 * @returns {Object} Parsed parameters
 */
export const parseProjectQuery = (query) => {
  const lowerQuery = query.toLowerCase();
  const params = { options: {} };
  
  // Extract project ID (assuming MongoDB ObjectId format: 24 hex characters)
  const idMatch = query.match(/\b[a-f\d]{24}\b/i);
  if (idMatch) {
    params.projectId = idMatch[0];
  }
  
  // Extract project name (in quotes)
  const nameMatch = query.match(/["']([^"']+)["']/);
  if (nameMatch) {
    params.projectName = nameMatch[1];
  }
  
  // Extract slug (after "slug:" or "/slug/")
  const slugMatch = query.match(/(?:slug:|\/slug\/)\s*(\S+)/i);
  if (slugMatch) {
    params.slug = slugMatch[1];
  }
  
  // Check for user ID context
  const userIdMatch = query.match(/user[:\s]+([a-f\d]{24})/i);
  if (userIdMatch) {
    params.userId = userIdMatch[1];
  }
  
  // Extract search keyword
  const searchMatch = query.match(/(?:search for|find|looking for)\s+(.+?)(?:\s+project|$)/i);
  if (searchMatch) {
    params.keyword = searchMatch[1].trim().replace(/["']/g, '');
  }
  
  // Pagination
  const pageMatch = query.match(/page\s+(\d+)/i);
  if (pageMatch) {
    params.options.page = parseInt(pageMatch[1]);
  }
  
  const limitMatch = query.match(/(?:limit|show)\s+(\d+)/i);
  if (limitMatch) {
    params.options.limit = parseInt(limitMatch[1]);
  }
  
  return params;
};

/**
 * Format project response for chatbot display
 * @param {Object} project - Project object
 * @returns {string} Formatted string
 */
export const formatProjectForChatbot = (project) => {
  return `
📁 Project: ${project.projectName}
📝 Description: ${project.projectDesc || 'No description'}
👤 Owner: ${project.user?.name || 'Unknown'}
📧 Email: ${project.user?.email || 'N/A'}
🔗 Slug: ${project.slug || 'N/A'}
📅 Created: ${new Date(project.createdAt).toLocaleDateString()}
${project.aiGenerated ? '🤖 AI-Generated' : ''}
  `.trim();
};

/**
 * Format project list for chatbot display
 * @param {Array} projects - Array of project objects
 * @returns {string} Formatted string
 */
export const formatProjectListForChatbot = (projects) => {
  if (projects.length === 0) {
    return "No projects found.";
  }
  
  return projects.map((project, index) => 
    `${index + 1}. ${project.projectName} (${project.slug}) - ${project.user?.name || 'Unknown'}`
  ).join('\n');
};

/**
 * Format project stats for chatbot display
 * @param {Object} stats - Project statistics
 * @returns {string} Formatted string
 */
export const formatStatsForChatbot = (stats) => {
  return `
📊 Project Statistics

🏢 Organization: ${stats.organizationName}
📁 Total Projects: ${stats.totalProjects}
📅 Recent Projects (30 days): ${stats.recentProjectsCount}
🤖 AI-Generated: ${stats.aiGeneratedCount}

👥 Top Project Creators:
${stats.projectsByUser.slice(0, 5).map((user, index) => 
  `${index + 1}. ${user.userName} - ${user.projectCount} projects`
).join('\n')}

📌 Recent Projects:
${stats.recentProjects.map((project, index) => 
  `${index + 1}. ${project.projectName} by ${project.user?.name}`
).join('\n')}
  `.trim();
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
  getAIGeneratedProjectsCount,
  getRecentProjectsCount,
  
  // Utilities
  findProjectByName,
  projectExists,
  getProjectCount,
  getMyProjectCount,
  validateProjectAccess,
  setCurrentProject,
  clearCurrentProject,
  getCurrentProjectId,
  
  // Admin operations
  getTopProjectCreators,
  getRecentProjects,
  getOrganizationOverview,
  
  // Chatbot helpers
  processChatbotCommand,
  parseProjectQuery,
  formatProjectForChatbot,
  formatProjectListForChatbot,
  formatStatsForChatbot
};

export default projectApi;