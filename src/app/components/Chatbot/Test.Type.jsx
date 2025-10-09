import { FlaskConical, Code2, Calendar, Hash, Sparkles, User } from 'lucide-react'

/**
 * TestTypeCard Component
 * Displays individual test type information in a card format
 * 
 * @param {Object} props
 * @param {Object} props.testType - Test type object containing all details
 * @param {Function} props.onClick - Optional click handler for the card
 * @param {boolean} props.compact - Whether to show compact version
 */
export const TestTypeCard = ({ testType, onClick, compact = false }) => {
    if (!testType) return null

    return (
        <div
            onClick={onClick}
            className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-indigo-300 transition-all ${onClick ? 'cursor-pointer' : ''
                }`}
        >
            {/* Header Section */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FlaskConical className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <h3 className="font-semibold text-gray-900 truncate">
                        {testType.testTypeName || 'Untitled Test Type'}
                    </h3>
                </div>
                {testType.aiGenerated && (
                    <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex-shrink-0 ml-2">
                        <Sparkles className="w-3 h-3" />
                        AI
                    </span>
                )}
            </div>

            {/* Framework Badge */}
            {testType.testFramework && (
                <div className="mb-2">
                    <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        <Code2 className="w-3 h-3" />
                        {testType.testFramework}
                    </span>
                </div>
            )}

            {/* Description Section */}
            {!compact && testType.testTypeDesc && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {testType.testTypeDesc}
                </p>
            )}

            {/* Footer Section */}
            <div className="space-y-2">
                {/* Project and Creator Info */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                    {testType.project && (
                        <div className="flex items-center gap-1 truncate">
                            <Hash className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">
                                {testType.project.projectName || 'Unknown Project'}
                            </span>
                        </div>
                    )}
                    {testType.user && (
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                            <User className="w-3 h-3" />
                            <span className="truncate">
                                {testType.user.name || 'Unknown'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Date Info */}
                <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>
                        {testType.createdAt
                            ? new Date(testType.createdAt).toLocaleDateString()
                            : 'N/A'
                        }
                    </span>
                </div>
            </div>

            {/* ID for debugging (optional) */}
            {!compact && testType._id && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-400 font-mono">
                        ID: {testType._id}
                    </span>
                </div>
            )}
        </div>
    )
}

/**
 * TestTypesGrid Component
 * Displays a grid of test type cards with title and empty state
 * 
 * @param {Object} props
 * @param {Array} props.testTypes - Array of test type objects
 * @param {string} props.title - Optional title for the grid
 * @param {Function} props.onTestTypeClick - Optional click handler for individual test types
 * @param {boolean} props.compact - Whether to show compact cards
 * @param {number} props.columns - Number of columns (1, 2, or 3)
 * @param {boolean} props.showCount - Whether to show test type count
 */
export const TestTypesGrid = ({
    testTypes = [],
    title,
    onTestTypeClick,
    compact = false,
    columns = 2,
    showCount = true
}) => {
    // Determine grid columns class
    const getGridClass = () => {
        switch (columns) {
            case 1:
                return 'grid-cols-1'
            case 2:
                return 'grid-cols-1 md:grid-cols-2'
            case 3:
                return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            default:
                return 'grid-cols-1 md:grid-cols-2'
        }
    }

    return (
        <div className="mt-4">
            {/* Title Section */}
            {title && (
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    {showCount && testTypes.length > 0 && (
                        <span className="text-sm text-gray-500">
                            {testTypes.length} test type{testTypes.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            )}

            {/* Empty State */}
            {testTypes.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <FlaskConical className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No test types found</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Try adjusting your search or filters
                    </p>
                </div>
            ) : (
                <>
                    {/* Test Types Grid */}
                    <div className={`grid ${getGridClass()} gap-3`}>
                        {testTypes.map((testType) => (
                            <TestTypeCard
                                key={testType._id || testType.id}
                                testType={testType}
                                onClick={onTestTypeClick ? () => onTestTypeClick(testType) : undefined}
                                compact={compact}
                            />
                        ))}
                    </div>

                    {/* Bottom Count */}
                    {showCount && testTypes.length > 0 && (
                        <div className="mt-3 text-sm text-gray-500 text-center">
                            Showing {testTypes.length} test type{testTypes.length !== 1 ? 's' : ''}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

/**
 * TestTypesList Component
 * Displays test types in a list format (vertical stack)
 * 
 * @param {Object} props
 * @param {Array} props.testTypes - Array of test type objects
 * @param {string} props.title - Optional title for the list
 * @param {Function} props.onTestTypeClick - Optional click handler for individual test types
 * @param {boolean} props.showCount - Whether to show test type count
 */
export const TestTypesList = ({
    testTypes = [],
    title,
    onTestTypeClick,
    showCount = true
}) => {
    return (
        <div className="mt-4">
            {/* Title Section */}
            {title && (
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    {showCount && testTypes.length > 0 && (
                        <span className="text-sm text-gray-500">
                            {testTypes.length} test type{testTypes.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            )}

            {/* Empty State */}
            {testTypes.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <FlaskConical className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No test types found</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Try adjusting your search or filters
                    </p>
                </div>
            ) : (
                <>
                    {/* Test Types List */}
                    <div className="space-y-2">
                        {testTypes.map((testType) => (
                            <TestTypeCard
                                key={testType._id || testType.id}
                                testType={testType}
                                onClick={onTestTypeClick ? () => onTestTypeClick(testType) : undefined}
                                compact={false}
                            />
                        ))}
                    </div>

                    {/* Bottom Count */}
                    {showCount && testTypes.length > 0 && (
                        <div className="mt-3 text-sm text-gray-500 text-center">
                            Showing {testTypes.length} test type{testTypes.length !== 1 ? 's' : ''}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

/**
 * TestTypesTable Component
 * Displays test types in a table format
 * 
 * @param {Object} props
 * @param {Array} props.testTypes - Array of test type objects
 * @param {string} props.title - Optional title for the table
 * @param {Function} props.onTestTypeClick - Optional click handler for individual test types
 */
export const TestTypesTable = ({
    testTypes = [],
    title,
    onTestTypeClick
}) => {
    return (
        <div className="mt-4">
            {/* Title Section */}
            {title && (
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
            )}

            {/* Empty State */}
            {testTypes.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <FlaskConical className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No test types found</p>
                </div>
            ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Test Type Name</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Framework</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Project</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Created By</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Created</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {testTypes.map((testType) => (
                                <tr
                                    key={testType._id || testType.id}
                                    onClick={onTestTypeClick ? () => onTestTypeClick(testType) : undefined}
                                    className={`hover:bg-gray-50 ${onTestTypeClick ? 'cursor-pointer' : ''}`}
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <FlaskConical className="w-4 h-4 text-indigo-600" />
                                            <span className="font-medium text-gray-900">
                                                {testType.testTypeName || 'Untitled'}
                                            </span>
                                            {testType.aiGenerated && (
                                                <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                                                    AI
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {testType.testFramework ? (
                                            <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                <Code2 className="w-3 h-3" />
                                                {testType.testFramework}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {testType.project?.projectName || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {testType.user?.name || 'Unknown'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {testType.createdAt
                                            ? new Date(testType.createdAt).toLocaleDateString()
                                            : 'N/A'
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

/**
 * CompactTestTypeInfo Component
 * Shows minimal test type information inline
 * 
 * @param {Object} props
 * @param {Object} props.testType - Test type object
 */
export const CompactTestTypeInfo = ({ testType }) => {
    if (!testType) return null

    return (
        <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
            <FlaskConical className="w-4 h-4 text-indigo-600" />
            <span className="font-medium text-gray-900 text-sm">
                {testType.testTypeName || 'Untitled'}
            </span>
            {testType.testFramework && (
                <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                    {testType.testFramework}
                </span>
            )}
            {testType.aiGenerated && (
                <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                    AI
                </span>
            )}
        </div>
    )
}

/**
 * TestTypesByFramework Component
 * Groups and displays test types by framework
 * 
 * @param {Object} props
 * @param {Array} props.testTypes - Array of test type objects
 * @param {Function} props.onTestTypeClick - Optional click handler
 */
export const TestTypesByFramework = ({ testTypes = [], onTestTypeClick }) => {
    // Group test types by framework
    const groupedTestTypes = testTypes.reduce((acc, testType) => {
        const framework = testType.testFramework || 'Other'
        if (!acc[framework]) {
            acc[framework] = []
        }
        acc[framework].push(testType)
        return acc
    }, {})

    const frameworks = Object.keys(groupedTestTypes).sort()

    if (frameworks.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <FlaskConical className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No test types found</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 mt-4">
            {frameworks.map((framework) => (
                <div key={framework}>
                    <div className="flex items-center gap-2 mb-3">
                        <Code2 className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-800">{framework}</h3>
                        <span className="text-sm text-gray-500">
                            ({groupedTestTypes[framework].length})
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {groupedTestTypes[framework].map((testType) => (
                            <TestTypeCard
                                key={testType._id || testType.id}
                                testType={testType}
                                onClick={onTestTypeClick ? () => onTestTypeClick(testType) : undefined}
                                compact={true}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

/**
 * TestTypesStats Component
 * Shows statistics about test types
 * 
 * @param {Object} props
 * @param {Array} props.testTypes - Array of test type objects
 */
export const TestTypesStats = ({ testTypes = [] }) => {
    // Calculate statistics
    const totalCount = testTypes.length
    const aiGeneratedCount = testTypes.filter(tt => tt.aiGenerated).length
    const frameworkCounts = testTypes.reduce((acc, tt) => {
        const framework = tt.testFramework || 'Other'
        acc[framework] = (acc[framework] || 0) + 1
        return acc
    }, {})

    const topFramework = Object.entries(frameworkCounts)
        .sort((a, b) => b[1] - a[1])[0]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {/* Total Test Types */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                    <FlaskConical className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm text-gray-600">Total Test Types</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
            </div>

            {/* AI Generated */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-gray-600">AI Generated</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                    {aiGeneratedCount}
                    <span className="text-sm text-gray-500 ml-2">
                        ({totalCount > 0 ? Math.round((aiGeneratedCount / totalCount) * 100) : 0}%)
                    </span>
                </div>
            </div>

            {/* Top Framework */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Code2 className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Top Framework</span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                    {topFramework ? (
                        <>
                            {topFramework[0]}
                            <span className="text-sm text-gray-500 ml-2">
                                ({topFramework[1]})
                            </span>
                        </>
                    ) : (
                        <span className="text-gray-400">-</span>
                    )}
                </div>
            </div>
        </div>
    )
}

/**
 * TestTypeFilter Component
 * Filter component for test types
 * 
 * @param {Object} props
 * @param {Array} props.frameworks - Available frameworks
 * @param {string} props.selectedFramework - Currently selected framework
 * @param {Function} props.onFrameworkChange - Callback when framework changes
 * @param {string} props.searchTerm - Current search term
 * @param {Function} props.onSearchChange - Callback when search changes
 */
export const TestTypeFilter = ({
    frameworks = [],
    selectedFramework = 'all',
    onFrameworkChange,
    searchTerm = '',
    onSearchChange
}) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Test Types
                    </label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                        placeholder="Search by name or description..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Framework Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filter by Framework
                    </label>
                    <select
                        value={selectedFramework}
                        onChange={(e) => onFrameworkChange && onFrameworkChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="all">All Frameworks</option>
                        {frameworks.map((fw) => (
                            <option key={fw} value={fw}>
                                {fw}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    )
}

// Export all components
export default {
    TestTypeCard,
    TestTypesGrid,
    TestTypesList,
    TestTypesTable,
    CompactTestTypeInfo,
    TestTypesByFramework,
    TestTypesStats,
    TestTypeFilter
}