import { 
    getAllTestTypes, 
    getTestTypesByProject, 
    getTestTypeById,
    searchTestTypes,
    searchTestTypesInProject,
    getTestTypesByFramework,
    getCurrentProjectTestTypes
} from '../api/test.type.api.js'

/**
 * Parse natural language query to extract parameters
 * @param {string} message - User message
 * @returns {Object} Parsed parameters
 */
const parseTestTypeQuery = (message) => {
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
            params.keyword = match[1].trim()
            break
        }
    }

    // Extract framework
    const frameworks = ['selenium', 'cypress', 'playwright', 'jest', 'mocha', 'junit', 'testng', 'pytest', 'robot', 'cucumber']
    for (const fw of frameworks) {
        if (lowerMessage.includes(fw)) {
            params.framework = fw.charAt(0).toUpperCase() + fw.slice(1)
            break
        }
    }

    // Extract test type ID (24 character hex string)
    const idMatch = message.match(/\b[a-f\d]{24}\b/i)
    if (idMatch) {
        params.testTypeId = idMatch[0]
    }

    // Extract project ID
    const projectIdMatch = message.match(/project[:\s]+([a-f\d]{24})/i)
    if (projectIdMatch) {
        params.projectId = projectIdMatch[1]
    }

    // Check for current/this project context
    if (lowerMessage.includes('this project') || lowerMessage.includes('current project')) {
        params.useCurrentProject = true
    }

    // Extract status
    if (lowerMessage.includes('active')) {
        params.options.status = 'active'
    } else if (lowerMessage.includes('trash') || lowerMessage.includes('deleted')) {
        params.options.status = 'trash'
    }

    return params
}

/**
 * Format test types list in a readable way
 * @param {Array} testTypes - Array of test type objects
 * @param {number} total - Total count
 * @returns {string} Formatted message
 */
const formatTestTypesResponse = (testTypes, total) => {
    if (testTypes.length === 0) {
        return "No test types found matching your criteria."
    }

    let response = `Found ${total} test type${total !== 1 ? 's' : ''}. Showing ${testTypes.length}:\n\n`

    testTypes.forEach((testType, index) => {
        response += `${index + 1}. **${testType.testTypeName}**\n`
        
        if (testType.testFramework) {
            response += `   Framework: ${testType.testFramework}\n`
        }
        
        if (testType.testTypeDesc) {
            response += `   Description: ${testType.testTypeDesc.substring(0, 100)}${testType.testTypeDesc.length > 100 ? '...' : ''}\n`
        }
        
        if (testType.project) {
            response += `   Project: ${testType.project.projectName || 'Unknown'}\n`
        }
        
        if (testType.user) {
            response += `   Created by: ${testType.user.name || 'Unknown'}\n`
        }
        
        response += `   Created: ${new Date(testType.createdAt).toLocaleDateString()}\n`
        
        if (testType.aiGenerated) {
            response += `   🤖 AI-Generated\n`
        }
        
        response += '\n'
    })

    return response
}

/**
 * Handle @get-test-types command
 * @param {string} message - User message
 * @returns {Object} Response object
 */
const handleGetTestTypes = async (message) => {
    try {
        const params = parseTestTypeQuery(message)

        // Set default limit if not specified
        if (!params.options.limit) {
            params.options.limit = 10
        }

        let result

        // If searching for specific test type by ID
        if (params.testTypeId) {
            const testType = await getTestTypeById(params.testTypeId)
            return {
                status: 'success',
                message: formatTestTypesResponse([testType], 1),
                testTypes: [testType],
                data: {
                    total: 1,
                    page: 1,
                    totalPages: 1,
                    hasMore: false
                }
            }
        }

        // If filtering by framework
        if (params.framework) {
            result = await getTestTypesByFramework(params.framework, params.options)
        }
        // If filtering by current project
        else if (params.useCurrentProject) {
            result = await getCurrentProjectTestTypes(params.options)
        }
        // If filtering by specific project
        else if (params.projectId) {
            result = await getTestTypesByProject(params.projectId, params.options)
        }
        // If searching
        else if (params.keyword) {
            if (params.projectId || params.useCurrentProject) {
                result = await searchTestTypesInProject(params.projectId, params.keyword, params.options)
            } else {
                result = await searchTestTypes(params.keyword, params.options)
            }
        }
        // Get all test types
        else {
            result = await getAllTestTypes(params.options)
        }

        return {
            status: 'success',
            message: formatTestTypesResponse(result.testTypes, result.pagination.totalTestTypes),
            testTypes: result.testTypes,
            data: {
                total: result.pagination.totalTestTypes,
                page: result.pagination.currentPage,
                totalPages: result.pagination.totalPages,
                hasMore: result.pagination.hasNextPage
            }
        }
    } catch (error) {
        return {
            status: 'error',
            message: `Failed to fetch test types: ${error.message}`,
            data: null
        }
    }
}

/**
 * Handle @get-my-test-types command (test types in current project)
 * @param {string} message - User message
 * @returns {Object} Response object
 */
const handleGetMyTestTypes = async (message) => {
    try {
        const params = parseTestTypeQuery(message)

        // Set default limit if not specified
        if (!params.options.limit) {
            params.options.limit = 10
        }

        const result = await getCurrentProjectTestTypes(params.options)

        return {
            status: 'success',
            message: result.testTypes.length === 0
                ? "You don't have any test types in this project yet. Create your first test type to get started!"
                : formatTestTypesResponse(result.testTypes, result.pagination.totalTestTypes),
            testTypes: result.testTypes,
            data: {
                total: result.pagination.totalTestTypes,
                page: result.pagination.currentPage,
                totalPages: result.pagination.totalPages,
                hasMore: result.pagination.hasNextPage
            }
        }
    } catch (error) {
        return {
            status: 'error',
            message: `Failed to fetch your test types: ${error.message}`,
            data: null
        }
    }
}

/**
 * Handle @search-test-types command
 * @param {string} message - User message
 * @returns {Object} Response object
 */
const handleSearchTestTypes = async (message) => {
    try {
        const params = parseTestTypeQuery(message)

        if (!params.keyword) {
            return {
                status: 'error',
                message: 'Please provide a search keyword. Example: @search-test-types "unit test"',
                data: null
            }
        }

        // Set default limit if not specified
        if (!params.options.limit) {
            params.options.limit = 10
        }

        let result

        if (params.useCurrentProject) {
            result = await searchTestTypesInProject(null, params.keyword, params.options)
        } else if (params.projectId) {
            result = await searchTestTypesInProject(params.projectId, params.keyword, params.options)
        } else {
            result = await searchTestTypes(params.keyword, params.options)
        }

        return {
            status: 'success',
            message: formatTestTypesResponse(result.testTypes, result.pagination.totalTestTypes),
            testTypes: result.testTypes,
            data: {
                total: result.pagination.totalTestTypes,
                page: result.pagination.currentPage,
                totalPages: result.pagination.totalPages,
                hasMore: result.pagination.hasNextPage,
                searchKeyword: params.keyword
            }
        }
    } catch (error) {
        return {
            status: 'error',
            message: `Search failed: ${error.message}`,
            data: null
        }
    }
}

/**
 * Main handler for test type commands
 * @param {string} command - Command type (@get-test-types, @get-my-test-types, @search-test-types)
 * @param {string} message - Full user message
 * @returns {Object} Response object
 */
export const handleTestTypeCommand = async (command, message) => {
    try {
        switch (command) {
            case '@get-test-types':
                return await handleGetTestTypes(message)

            case '@get-my-test-types':
                return await handleGetMyTestTypes(message)

            case '@search-test-types':
                return await handleSearchTestTypes(message)

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
 * Validate if user message contains a valid test type command
 * @param {string} message - User message
 * @returns {boolean}
 */
export const isTestTypeCommand = (message) => {
    const testTypeCommands = ['@get-test-types', '@get-my-test-types', '@search-test-types']
    return testTypeCommands.some(cmd => message.includes(cmd))
}

/**
 * Get helpful examples for test type commands
 * @returns {Object} Examples object
 */
export const getTestTypeCommandExamples = () => {
    return {
        '@get-test-types': [
            '@get-test-types - Show all test types',
            '@get-test-types limit 20 - Show 20 test types',
            '@get-test-types framework cypress - Filter by framework',
            '@get-test-types this project - Test types in current project',
            '@get-test-types page 2 - Show second page'
        ],
        '@get-my-test-types': [
            '@get-my-test-types - Show test types in current project',
            '@get-my-test-types limit 5 - Show 5 test types',
            '@get-my-test-types framework selenium - Filter by framework'
        ],
        '@search-test-types': [
            '@search-test-types "unit test" - Search for test types',
            '@search-test-types "integration" this project - Search in current project',
            '@search-test-types "api" limit 15 - Search with custom limit'
        ]
    }
}

const testTypeClient = {
    handleTestTypeCommand,
    isTestTypeCommand,
    getTestTypeCommandExamples,
    parseTestTypeQuery,
    formatTestTypesResponse
}

export default testTypeClient