import { FolderOpen, Users, Calendar, Hash, Sparkles } from 'lucide-react'

/**
 * ProjectCard Component
 * Displays individual project information in a card format
 * 
 * @param {Object} props
 * @param {Object} props.project - Project object containing all project details
 * @param {Function} props.onClick - Optional click handler for the card
 * @param {boolean} props.compact - Whether to show compact version
 */
export const ProjectCard = ({ project, onClick, compact = false }) => {
    if (!project) return null

    return (
        <div 
            onClick={onClick}
            className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-indigo-300 transition-all ${
                onClick ? 'cursor-pointer' : ''
            }`}
        >
            {/* Header Section */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FolderOpen className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <h3 className="font-semibold text-gray-900 truncate">
                        {project.projectName || 'Untitled Project'}
                    </h3>
                </div>
                {project.aiGenerated && (
                    <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex-shrink-0 ml-2">
                        <Sparkles className="w-3 h-3" />
                        AI
                    </span>
                )}
            </div>

            {/* Description Section */}
            {!compact && project.projectDesc && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {project.projectDesc}
                </p>
            )}

            {/* Footer Section */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span className="truncate">
                            {project.user?.name || 'Unknown User'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <Calendar className="w-3 h-3" />
                        <span>
                            {project.createdAt 
                                ? new Date(project.createdAt).toLocaleDateString()
                                : 'N/A'
                            }
                        </span>
                    </div>
                </div>

                {/* Email and Slug Row */}
                {!compact && (
                    <div className="flex items-center justify-between text-xs">
                        {project.user?.email && (
                            <span className="text-gray-400 truncate">
                                {project.user.email}
                            </span>
                        )}
                        {project.slug && (
                            <div className="flex items-center gap-1 text-gray-400 flex-shrink-0 ml-2">
                                <Hash className="w-3 h-3" />
                                <span className="font-mono">{project.slug}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ID for debugging (optional) */}
            {!compact && project._id && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-400 font-mono">
                        ID: {project._id}
                    </span>
                </div>
            )}
        </div>
    )
}

/**
 * ProjectsGrid Component
 * Displays a grid of project cards with title and empty state
 * 
 * @param {Object} props
 * @param {Array} props.projects - Array of project objects
 * @param {string} props.title - Optional title for the grid
 * @param {Function} props.onProjectClick - Optional click handler for individual projects
 * @param {boolean} props.compact - Whether to show compact cards
 * @param {number} props.columns - Number of columns (1, 2, or 3)
 * @param {boolean} props.showCount - Whether to show project count
 */
export const ProjectsGrid = ({ 
    projects = [], 
    title, 
    onProjectClick,
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
                    {showCount && projects.length > 0 && (
                        <span className="text-sm text-gray-500">
                            {projects.length} project{projects.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            )}

            {/* Empty State */}
            {projects.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No projects found</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Try adjusting your search or filters
                    </p>
                </div>
            ) : (
                <>
                    {/* Projects Grid */}
                    <div className={`grid ${getGridClass()} gap-3`}>
                        {projects.map((project) => (
                            <ProjectCard 
                                key={project._id || project.id} 
                                project={project}
                                onClick={onProjectClick ? () => onProjectClick(project) : undefined}
                                compact={compact}
                            />
                        ))}
                    </div>

                    {/* Bottom Count */}
                    {showCount && projects.length > 0 && (
                        <div className="mt-3 text-sm text-gray-500 text-center">
                            Showing {projects.length} project{projects.length !== 1 ? 's' : ''}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

/**
 * ProjectList Component
 * Displays projects in a list format (vertical stack)
 * 
 * @param {Object} props
 * @param {Array} props.projects - Array of project objects
 * @param {string} props.title - Optional title for the list
 * @param {Function} props.onProjectClick - Optional click handler for individual projects
 * @param {boolean} props.showCount - Whether to show project count
 */
export const ProjectList = ({ 
    projects = [], 
    title, 
    onProjectClick,
    showCount = true 
}) => {
    return (
        <div className="mt-4">
            {/* Title Section */}
            {title && (
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    {showCount && projects.length > 0 && (
                        <span className="text-sm text-gray-500">
                            {projects.length} project{projects.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            )}

            {/* Empty State */}
            {projects.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No projects found</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Try adjusting your search or filters
                    </p>
                </div>
            ) : (
                <>
                    {/* Projects List */}
                    <div className="space-y-2">
                        {projects.map((project) => (
                            <ProjectCard 
                                key={project._id || project.id} 
                                project={project}
                                onClick={onProjectClick ? () => onProjectClick(project) : undefined}
                                compact={false}
                            />
                        ))}
                    </div>

                    {/* Bottom Count */}
                    {showCount && projects.length > 0 && (
                        <div className="mt-3 text-sm text-gray-500 text-center">
                            Showing {projects.length} project{projects.length !== 1 ? 's' : ''}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

/**
 * ProjectsTable Component
 * Displays projects in a table format
 * 
 * @param {Object} props
 * @param {Array} props.projects - Array of project objects
 * @param {string} props.title - Optional title for the table
 * @param {Function} props.onProjectClick - Optional click handler for individual projects
 */
export const ProjectsTable = ({ 
    projects = [], 
    title, 
    onProjectClick 
}) => {
    return (
        <div className="mt-4">
            {/* Title Section */}
            {title && (
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
            )}

            {/* Empty State */}
            {projects.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No projects found</p>
                </div>
            ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Project Name</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Owner</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Created</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Slug</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {projects.map((project) => (
                                <tr 
                                    key={project._id || project.id}
                                    onClick={onProjectClick ? () => onProjectClick(project) : undefined}
                                    className={`hover:bg-gray-50 ${onProjectClick ? 'cursor-pointer' : ''}`}
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <FolderOpen className="w-4 h-4 text-indigo-600" />
                                            <span className="font-medium text-gray-900">
                                                {project.projectName || 'Untitled'}
                                            </span>
                                            {project.aiGenerated && (
                                                <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                                                    AI
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {project.user?.name || 'Unknown'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {project.createdAt 
                                            ? new Date(project.createdAt).toLocaleDateString()
                                            : 'N/A'
                                        }
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                                        {project.slug || '-'}
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
 * CompactProjectInfo Component
 * Shows minimal project information inline
 * 
 * @param {Object} props
 * @param {Object} props.project - Project object
 */
export const CompactProjectInfo = ({ project }) => {
    if (!project) return null

    return (
        <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
            <FolderOpen className="w-4 h-4 text-indigo-600" />
            <span className="font-medium text-gray-900 text-sm">
                {project.projectName || 'Untitled'}
            </span>
            {project.aiGenerated && (
                <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                    AI
                </span>
            )}
        </div>
    )
}

// Export all components
export default {
    ProjectCard,
    ProjectsGrid,
    ProjectList,
    ProjectsTable,
    CompactProjectInfo
}