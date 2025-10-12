'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, Folder, FileCode, X, ChevronLeft } from 'lucide-react';
import { useProjects } from '@/app/hooks/project.hook';
import { useTestTypes } from '@/app/hooks/test.type.hook';

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
    setTestTypePage(1); // Reset test type page when switching projects
  };

  const handleProjectDetailClick = async (e, projectId) => {
    e.stopPropagation();
    selectProject(projectId);
    setShowProjectDetail(true);
    setShowTestTypeDetail(false);
    
    // Fetch full project details if needed
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
    
    // Fetch full test type details if needed
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-6">
          {/* Left Column */}
          <div className="flex flex-col gap-6" style={{ width: '400px' }}>
            {/* Projects Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
              style={{ minWidth: '300px', maxWidth: '400px', minHeight: '380px', maxHeight: '380px' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Folder className="w-5 h-5 text-blue-600" />
                  Projects
                </h2>
              </div>

              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Project List */}
              <div className="overflow-y-auto" style={{ maxHeight: '220px' }}>
                {projectsLoading && projects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : projectsError ? (
                  <div className="text-center py-8 text-red-500 text-sm">{projectsError}</div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No projects found</div>
                ) : (
                  <div className="space-y-2">
                    {projects.map((project) => (
                      <motion.div
                        key={project._id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleProjectClick(project._id)}
                        className={`p-3 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                          selectedProjectId === project._id
                            ? 'bg-blue-100 border-2 border-blue-500'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 truncate">{project.projectName}</h3>
                          <p className="text-sm text-gray-600 truncate">{project.projectDesc || 'No description'}</p>
                        </div>
                        <button
                          onClick={(e) => handleProjectDetailClick(e, project._id)}
                          className="ml-2 p-1 hover:bg-white rounded flex-shrink-0"
                        >
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {projectPagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <button
                    onClick={() => setProjectPage(prev => Math.max(1, prev - 1))}
                    disabled={!projectPagination.hasPrev}
                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {projectPagination.currentPage} of {projectPagination.totalPages}
                  </span>
                  <button
                    onClick={() => setProjectPage(prev => prev + 1)}
                    disabled={!projectPagination.hasNext}
                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>

            {/* Test Types Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
              style={{ minWidth: '300px', maxWidth: '400px', minHeight: '380px', maxHeight: '380px' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-indigo-600" />
                  Test Types
                </h2>
              </div>

              {!selectedProjectId ? (
                <div className="flex items-center justify-center h-64 text-gray-500 text-center px-4">
                  Select a project to view test types
                </div>
              ) : (
                <>
                  {/* Search Bar */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search test types..."
                      value={testTypeSearch}
                      onChange={(e) => setTestTypeSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  {/* Test Type List */}
                  <div className="overflow-y-auto" style={{ maxHeight: '220px' }}>
                    {testTypesLoading ? (
                      <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : testTypesError ? (
                      <div className="text-center py-8 text-red-500 text-sm">{testTypesError}</div>
                    ) : testTypes.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No test types found</div>
                    ) : (
                      <div className="space-y-2">
                        {testTypes.map((testType) => (
                          <motion.div
                            key={testType._id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleTestTypeClick(testType._id)}
                            className={`p-3 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                              selectedTestTypeId === testType._id
                                ? 'bg-indigo-100 border-2 border-indigo-500'
                                : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-800 truncate">{testType.testTypeName}</h3>
                              <p className="text-sm text-gray-600 truncate">{testType.testFramework}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pagination */}
                  {testTypePagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <button
                        onClick={() => setTestTypePage(prev => Math.max(1, prev - 1))}
                        disabled={!testTypePagination.hasPrev}
                        className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {testTypePagination.currentPage} of {testTypePagination.totalPages}
                      </span>
                      <button
                        onClick={() => setTestTypePage(prev => prev + 1)}
                        disabled={!testTypePagination.hasNext}
                        className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
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
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Project Details</h2>
                    <button 
                      onClick={() => setShowProjectDetail(false)} 
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Project ID</label>
                      <p className="text-sm text-gray-500 mt-1 font-mono bg-gray-50 p-2 rounded">{selectedProject._id}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Project Name</label>
                      <p className="text-lg text-gray-900 mt-1">{selectedProject.projectName}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Description</label>
                      <p className="text-gray-700 mt-1">{selectedProject.projectDesc || 'No description'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Created By</label>
                      <p className="text-gray-700 mt-1">{selectedProject.user?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{selectedProject.user?.email || ''}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Created At</label>
                      <p className="text-gray-700 mt-1">
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
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Test Type Details</h2>
                    <button 
                      onClick={() => setShowTestTypeDetail(false)} 
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Test Type ID</label>
                      <p className="text-sm text-gray-500 mt-1 font-mono bg-gray-50 p-2 rounded">{selectedTestType._id}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Test Type Name</label>
                      <p className="text-lg text-gray-900 mt-1">{selectedTestType.testTypeName}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Description</label>
                      <p className="text-gray-700 mt-1">{selectedTestType.testTypeDesc || 'No description'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Framework</label>
                      <p className="text-gray-700 mt-1">{selectedTestType.testFramework}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Project</label>
                      <p className="text-gray-700 mt-1">{selectedTestType.project?.projectName || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Created By</label>
                      <p className="text-gray-700 mt-1">{selectedTestType.user?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{selectedTestType.user?.email || ''}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Status</label>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm mt-1 font-medium ${
                        selectedTestType.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedTestType.status}
                      </span>
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Created At</label>
                      <p className="text-gray-700 mt-1">
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