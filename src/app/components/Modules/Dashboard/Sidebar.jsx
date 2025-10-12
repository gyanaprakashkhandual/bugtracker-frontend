'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Folder, FileCode, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProjects } from '@/app/hooks/project.hook';
import { useTestTypes } from '@/app/hooks/test.type.hook';

// Skeleton Loader Component
const SkeletonLoader = ({ count = 3 }) => (
    <div className="space-y-2">
        {[...Array(count)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-md p-3 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
        ))}
    </div>
);

export default function DashboardSidebar() {
    const [projectSearch, setProjectSearch] = useState('');
    const [testTypeSearch, setTestTypeSearch] = useState('');
    const [showProjectDetail, setShowProjectDetail] = useState(false);
    const [showTestTypeDetail, setShowTestTypeDetail] = useState(false);
    const [projectPage, setProjectPage] = useState(1);
    const [testTypePage, setTestTypePage] = useState(1);

    // Use project hook
    const {
        projects,
        loading: projectsLoading,
        error: projectsError,
        selectedProjectId,
        pagination: projectPagination,
        selectProject,
        getSelectedProject,
        fetchProjectById
    } = useProjects(projectSearch, projectPage);

    // Use test type hook
    const {
        testTypes,
        loading: testTypesLoading,
        error: testTypesError,
        selectedTestTypeId,
        pagination: testTypePagination,
        selectTestType,
        getSelectedTestType,
        fetchTestTypeById
    } = useTestTypes(selectedProjectId, testTypeSearch, testTypePage);

    const handleProjectClick = (projectId) => {
        selectProject(projectId);
        setTestTypePage(1);
        setShowProjectDetail(false);
        setShowTestTypeDetail(false);
    };

    const handleProjectDetailClick = async (e, projectId) => {
        e.stopPropagation();
        selectProject(projectId);
        setShowProjectDetail(true);
        setShowTestTypeDetail(false);

        try {
            const fullProject = await fetchProjectById(projectId);
            console.log('Full Project Details:', fullProject);
        } catch (error) {
            console.error('Error loading project details:', error);
        }
    };

    const handleTestTypeClick = async (testTypeId) => {
        selectTestType(testTypeId);
        setShowTestTypeDetail(true);
        setShowProjectDetail(false);

        try {
            const fullTestType = await fetchTestTypeById(testTypeId);
            console.log('Full Test Type Details:', fullTestType);
        } catch (error) {
            console.error('Error loading test type details:', error);
        }
    };

    const selectedProject = getSelectedProject();
    const selectedTestType = getSelectedTestType();

    return (
        <div className="sidebar-scrollbar">
            <div className="max-w-full mx-auto">
                <div className="flex gap-6">
                    {/* Left Column */}
                    <div className="flex flex-col border-r border-gray-200">
                        {/* Projects Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-gray-200"
                            style={{ minWidth: '200px', maxWidth: '200px', minHeight: '300px', maxHeight: '300px' }}
                        >
                            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wide">
                                    <Folder className="w-4 h-4 text-blue-600" />
                                    Projects
                                </h2>
                            </div>

                            {/* Project List */}
                            <div className="sidebar-scrollbar overflow-y-auto p-3" style={{ maxHeight: '220px' }}>
                                {projectsLoading && projects.length === 0 ? (
                                    <SkeletonLoader count={4} />
                                ) : projectsError ? (
                                    <div className="text-center py-8 text-red-500 text-xs">{projectsError}</div>
                                ) : projects.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400 text-xs">No projects found</div>
                                ) : (
                                    <div className="space-y-1.5">
                                        {projects.map((project) => (
                                            <motion.div
                                                key={project._id}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                                onClick={() => handleProjectClick(project._id)}
                                                onDoubleClick={(e) => handleProjectDetailClick(e, project._id)}
                                                className={`p-2.5 rounded-md cursor-pointer transition-all ${selectedProjectId === project._id
                                                        ? 'bg-blue-50 border border-blue-500 shadow-sm'
                                                        : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                                    }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 truncate text-xs">{project.projectName}</h3>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {projectPagination.totalPages > 1 && (
                                <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 bg-gray-50">
                                    <button
                                        onClick={() => setProjectPage(prev => Math.max(1, prev - 1))}
                                        disabled={!projectPagination.hasPrev}
                                        className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
                                    </button>
                                    <span className="text-xs text-gray-600 font-medium">
                                        {projectPagination.currentPage} / {projectPagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => setProjectPage(prev => prev + 1)}
                                        disabled={!projectPagination.hasNext}
                                        className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                                    </button>
                                </div>
                            )}
                        </motion.div>

                        {/* Test Types Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white border-t-0 border border-gray-200 flex flex-col"
                            style={{
                                minWidth: '200px',
                                maxWidth: '200px',
                                height: '359px',
                                overflow: 'hidden'
                            }}
                        >
                            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wide">
                                    <FileCode className="w-4 h-4 text-indigo-600" />
                                    Test Types
                                </h2>
                            </div>

                            {!selectedProjectId ? (
                                <div className="flex items-center justify-center flex-1 text-gray-400 text-center px-4 text-xs">
                                    Select a project to view test types
                                </div>
                            ) : (
                                <>
                                    {/* Search Bar */}
                                    <div className="relative p-3 border-b border-gray-200">
                                        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            value={testTypeSearch}
                                            onChange={(e) => setTestTypeSearch(e.target.value)}
                                            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        />
                                    </div>

                                    {/* Test Type List */}
                                    <div className="sidebar-scrollbar overflow-y-auto flex-1 p-3">
                                        {testTypesLoading ? (
                                            <SkeletonLoader count={5} />
                                        ) : testTypesError ? (
                                            <div className="text-center py-8 text-red-500 text-xs">{testTypesError}</div>
                                        ) : testTypes.length === 0 ? (
                                            <div className="text-center py-8 text-gray-400 text-xs">No test types found</div>
                                        ) : (
                                            <div className="space-y-1.5">
                                                {testTypes.map((testType) => (
                                                    <motion.div
                                                        key={testType._id}
                                                        whileHover={{ scale: 1.01 }}
                                                        whileTap={{ scale: 0.99 }}
                                                        onClick={() => handleTestTypeClick(testType._id)}
                                                        className={`p-2.5 rounded-md cursor-pointer transition-all ${selectedTestTypeId === testType._id
                                                                ? 'bg-indigo-50 border border-indigo-500 shadow-sm'
                                                                : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                                            }`}
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-gray-900 truncate text-xs">{testType.testTypeName}</h3>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Pagination */}
                                    {testTypePagination.totalPages > 1 && (
                                        <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 bg-gray-50">
                                            <button
                                                onClick={() => setTestTypePage(prev => Math.max(1, prev - 1))}
                                                disabled={!testTypePagination.hasPrev}
                                                className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
                                            </button>
                                            <span className="text-xs text-gray-600 font-medium">
                                                {testTypePagination.currentPage} / {testTypePagination.totalPages}
                                            </span>
                                            <button
                                                onClick={() => setTestTypePage(prev => prev + 1)}
                                                disabled={!testTypePagination.hasNext}
                                                className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    </div>

                    {/* Right Column - Detail Panels */}
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            {showProjectDetail && selectedProject && (
                                <motion.div
                                    key="project-detail"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-white border border-gray-200 shadow-sm"
                                >
                                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
                                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Project Details</h2>
                                        <button
                                            onClick={() => setShowProjectDetail(false)}
                                            className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                                        >
                                            <X className="w-4 h-4 text-gray-600" />
                                        </button>
                                    </div>

                                    <div className="p-5 space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Project ID</label>
                                            <p className="text-xs text-gray-600 mt-1 font-mono bg-gray-50 p-2 rounded-md border border-gray-200">{selectedProject._id}</p>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Project Name</label>
                                            <p className="text-sm text-gray-900 mt-1 font-semibold">{selectedProject.projectName}</p>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Description</label>
                                            <p className="text-xs text-gray-700 mt-1 leading-relaxed">{selectedProject.projectDesc || 'No description'}</p>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Created By</label>
                                            <p className="text-xs text-gray-900 mt-1 font-medium">{selectedProject.user?.name || 'Unknown'}</p>
                                            <p className="text-xs text-gray-500">{selectedProject.user?.email || ''}</p>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Created At</label>
                                            <p className="text-xs text-gray-700 mt-1">
                                                {new Date(selectedProject.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {showTestTypeDetail && selectedTestType && (
                                <motion.div
                                    key="testtype-detail"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-white border border-gray-200 shadow-sm"
                                >
                                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
                                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Test Type Details</h2>
                                        <button
                                            onClick={() => setShowTestTypeDetail(false)}
                                            className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                                        >
                                            <X className="w-4 h-4 text-gray-600" />
                                        </button>
                                    </div>

                                    <div className="p-5 space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Test Type ID</label>
                                            <p className="text-xs text-gray-600 mt-1 font-mono bg-gray-50 p-2 rounded-md border border-gray-200">{selectedTestType._id}</p>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Test Type Name</label>
                                            <p className="text-sm text-gray-900 mt-1 font-semibold">{selectedTestType.testTypeName}</p>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Description</label>
                                            <p className="text-xs text-gray-700 mt-1 leading-relaxed">{selectedTestType.testTypeDesc || 'No description'}</p>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Framework</label>
                                            <p className="text-xs text-gray-900 mt-1 font-medium">{selectedTestType.testFramework}</p>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Project</label>
                                            <p className="text-xs text-gray-900 mt-1 font-medium">{selectedTestType.project?.projectName || 'N/A'}</p>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Created By</label>
                                            <p className="text-xs text-gray-900 mt-1 font-medium">{selectedTestType.user?.name || 'Unknown'}</p>
                                            <p className="text-xs text-gray-500">{selectedTestType.user?.email || ''}</p>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Status</label>
                                            <span className={`inline-block px-2 py-0.5 rounded-md text-xs mt-1 font-bold uppercase tracking-wide ${selectedTestType.status === 'active' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
                                                }`}>
                                                {selectedTestType.status}
                                            </span>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Created At</label>
                                            <p className="text-xs text-gray-700 mt-1">
                                                {new Date(selectedTestType.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}