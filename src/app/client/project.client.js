// services/projectCommandHandler.js
// Handles all project-related commands from the chatbot

import { getAllProjects, getMyProjects } from '../api/project.api'

/**
 * Parse natural language query to extract parameters
 * @param {string} message - User message
 * @returns {Object} Parsed parameters
 */
const parseProjectQuery = (message) => {
    const params = { options: {} }
    const lowerMessage = message.toLowerCase()

    // Extract pagination
    const pageMatch = message.match(/page\s*[:\s]*(\d+)/i)
    if (pageMatch) {
        params.options.page = parseInt(pageMatch[1])
    }

    const limitMatch = message.match(/(?:limit|show|display)\s*[:\s]*(\d+)/i)
    if (limitMatch) {
        params.options.limit = parseInt(limitMatch[1])
    }

    // Extract search keyword
    const searchPatterns = [
        /search\s+(?:for\s+)?["']?([^"'\n]+?)["']?(?:\s|$)/i,
        /find\s+["']?([^"'\n]+?)["']?(?:\s|$)/i,
        /with\s+name\s+["']?([^"'\n]+?)["']?(?:\s|$)/i,
        /containing\s+["']?([^"'\n]+?)["']?(?:\s|$)/i
    ]

    for (const pattern of searchPatterns) {
        const match = message.match(pattern)
        if (match) {
            params.options.search = match[1].trim()
            break
        }
    }

    // Extract user ID for admin queries
    const userIdMatch = message.match(/user[:\s]+([a-f\d]{24})/i)
    if (userIdMatch) {
        params.options.userId = userIdMatch[1]
    }

    return params
}

/**
 * Format project list in a readable way
 * @param {Array} projects - Array of project objects
 * @param {number} total - Total count
 * @returns {string} Formatted message
 */
const formatProjectsResponse = (projects, total) => {
    if (projects.length === 0) {
        return "No projects found matching your criteria."
    }

    let response = `Found ${total} project${total !== 1 ? 's' : ''}. Showing ${projects.length}:\n\n`

    projects.forEach((project, index) => {
        response += `${index + 1}. **${project.projectName}**\n`
        if (project.projectDesc) {
            response += `   Description: ${project.projectDesc.substring(0, 100)}${project.projectDesc.length > 100 ? '...' : ''}\n`
        }
        response += `   Owner: ${project.user?.name || 'Unknown'} (${project.user?.email || 'N/A'})\n`
        response += `   Created: ${new Date(project.createdAt).toLocaleDateString()}\n`
        if (project.slug) {
            response += `   Slug: ${project.slug}\n`
        }
        if (project.aiGenerated) {
            response += `   🤖 AI-Generated\n`
        }
        response += '\n'
    })

    return response
}

/**
 * Handle @get-projects command
 * @param {string} message - User message
 * @returns {Object} Response object
 */
const handleGetProjects = async (message) => {
    try {
        const params = parseProjectQuery(message)

        // Set default limit if not specified
        if (!params.options.limit) {
            params.options.limit = 10
        }

        const result = await getAllProjects(params.options)

        return {
            status: 'success',
            message: formatProjectsResponse(result.projects, result.pagination.totalProjects),
            projects: result.projects,
            data: {
                total: result.pagination.totalProjects,
                page: result.pagination.currentPage,
                totalPages: result.pagination.totalPages,
                hasMore: result.pagination.hasNextPage
            }
        }
    } catch (error) {
        return {
            status: 'error',
            message: `Failed to fetch projects: ${error.message}`,
            data: null
        }
    }
}

/**
 * Handle @get-my-projects command
 * @param {string} message - User message
 * @returns {Object} Response object
 */
const handleGetMyProjects = async (message) => {
    try {
        const params = parseProjectQuery(message)

        // Set default limit if not specified
        if (!params.options.limit) {
            params.options.limit = 10
        }

        const result = await getMyProjects(params.options)

        return {
            status: 'success',
            message: result.projects.length === 0
                ? "You don't have any projects yet. Create your first project to get started!"
                : formatProjectsResponse(result.projects, result.pagination.totalProjects),
            projects: result.projects,
            data: {
                total: result.pagination.totalProjects,
                page: result.pagination.currentPage,
                totalPages: result.pagination.totalPages,
                hasMore: result.pagination.hasNextPage
            }
        }
    } catch (error) {
        return {
            status: 'error',
            message: `Failed to fetch your projects: ${error.message}`,
            data: null
        }
    }
}

/**
 * Main handler for project commands
 * @param {string} command - Command type (@get-projects, @get-my-projects)
 * @param {string} message - Full user message
 * @returns {Object} Response object
 */
export const handleProjectCommand = async (command, message) => {
    try {
        switch (command) {
            case '@get-projects':
                return await handleGetProjects(message)

            case '@get-my-projects':
                return await handleGetMyProjects(message)

            default:
                return {
                    status: 'error',
                    message: `Unknown command: ${command}`,
                    data: null
                }
        }
    } catch (error) {
        return {
            status: 'error',
            message: `Command execution failed: ${error.message}`,
            data: null
        }
    }
}

/**
 * Validate if user message contains a valid project command
 * @param {string} message - User message
 * @returns {boolean}
 */
export const isProjectCommand = (message) => {
    const projectCommands = ['@get-projects', '@get-my-projects']
    return projectCommands.some(cmd => message.includes(cmd))
}

/**
 * Get helpful examples for project commands
 * @returns {Object} Examples object
 */
export const getProjectCommandExamples = () => {
    return {
        '@get-projects': [
            '@get-projects - Show all projects',
            '@get-projects limit 20 - Show 20 projects',
            '@get-projects search "mobile app" - Search for projects',
            '@get-projects page 2 - Show second page'
        ],
        '@get-my-projects': [
            '@get-my-projects - Show your projects',
            '@get-my-projects limit 5 - Show 5 of your projects',
            '@get-my-projects search "testing" - Search your projects'
        ]
    }
}

const projectClient = {
    handleProjectCommand,
    isProjectCommand,
    getProjectCommandExamples,
    parseProjectQuery,
    formatProjectsResponse
}

export default projectClient