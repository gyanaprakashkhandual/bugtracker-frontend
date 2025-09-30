// app/view/Split/Main.jsx
'use client';

import { useState, useEffect } from 'react';
import { useProject } from '@/app/utils/Get.project';
import { useTestType } from '@/app/script/TestType.context';
import TestCaseSidebar from './Sidebar';
import TestCaseDetails from './Details';
import axios from 'axios';

const TestCasesMain = () => {
  // Get the current project from ProjectContext or use a default slug
  const [currentSlug, setCurrentSlug] = useState(null);
  const { project, loading: projectLoading, error: projectError } = useProject(currentSlug);
  const { testTypeId, selectedTestType, getCurrentTestTypeId } = useTestType();
  const [testCases, setTestCases] = useState([]);
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  // Get the current testTypeId with multiple fallbacks
  const currentTestTypeId = testTypeId || getCurrentTestTypeId?.() || (typeof window !== 'undefined' ? localStorage.getItem('selectedTestTypeId') : null);

  // Get project slug from localStorage or use a default
  useEffect(() => {
    const savedProjectSlug = localStorage.getItem('currentProjectSlug');
    const savedProjectId = localStorage.getItem('currentProjectId');
    
    console.log('🔍 Project context check:', {
      savedProjectSlug,
      savedProjectId
    });

    if (savedProjectSlug) {
      console.log('🎯 Using saved project slug:', savedProjectSlug);
      setCurrentSlug(savedProjectSlug);
    } else {
      // Try to get from URL or use a default
      const pathSlug = window.location.pathname.split('/').pop();
      console.log('🌐 Path slug from URL:', pathSlug);
      
      if (pathSlug && pathSlug !== 'test-cases') {
        setCurrentSlug(pathSlug);
      } else {
        console.log('❌ No project slug found, you need to select a project first');
      }
    }
  }, []);

  console.log('🔍 TestCasesMain Debug Info:', {
    currentSlug,
    project: project?._id,
    projectName: project?.projectName,
    projectLoading,
    projectError,
    testTypeId,
    currentTestTypeId,
    selectedTestType: selectedTestType?._id,
    hasToken: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false
  });

  useEffect(() => {
    console.log('🔄 TestCasesMain useEffect triggered');
    console.log('📋 Conditions check:', {
      hasProject: !!project,
      hasProjectId: project?._id,
      hasTestTypeId: !!currentTestTypeId,
      projectLoading,
      projectError
    });

    if (project && project._id && currentTestTypeId && !projectLoading && !projectError) {
      console.log('🚀 All conditions met, fetching test cases...');
      fetchTestCases();
    } else {
      console.log('⏳ Waiting for conditions:', {
        waitingForProject: !project,
        waitingForProjectId: !project?._id,
        waitingForTestTypeId: !currentTestTypeId,
        waitingForProjectLoading: projectLoading,
        hasProjectError: !!projectError
      });
    }
  }, [project, currentTestTypeId, projectLoading, projectError]);

  const fetchTestCases = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }

      if (!project?._id || !currentTestTypeId) {
        console.error('❌ Missing required data for API call:', {
          projectId: project?._id,
          testTypeId: currentTestTypeId
        });
        setError('Missing project or test type information');
        return;
      }

      console.log('📡 Making API call with:', {
        projectId: project._id,
        testTypeId: currentTestTypeId,
        url: `http://localhost:5000/api/v1/test-case/projects/${project._id}/test-types/${currentTestTypeId}/test-cases`
      });

      const response = await axios.get(
        `http://localhost:5000/api/v1/test-case/projects/${project._id}/test-types/${currentTestTypeId}/test-cases`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      
      console.log('✅ Test cases fetched successfully:', {
        count: response.data.testCases?.length,
        data: response.data
      });
      setTestCases(response.data.testCases || []);
    } catch (error) {
      console.error('❌ Error fetching test cases:', {
        error: error.response?.data || error.message,
        status: error.response?.status,
        url: error.config?.url
      });
      setError(error.response?.data?.message || error.message || 'Failed to fetch test cases');
    } finally {
      setLoading(false);
    }
  };

  const handleTestCaseSelect = async (testCase) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await axios.get(
        `http://localhost:5000/api/v1/test-case/test-cases/${testCase._id}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      
      console.log('✅ Test case details fetched:', response.data);
      setSelectedTestCase(response.data.testCase);
    } catch (error) {
      console.error('❌ Error fetching test case details:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch test case details');
    }
  };

  const filteredTestCases = testCases.filter(testCase =>
    testCase.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testCase.moduleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testCase.testCaseDescription?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show loading state for project
  if (projectLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  // Show project selection required state
  if (!currentSlug || !project) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full bg-gray-50 items-center justify-center">
        <div className="text-center text-gray-500">
          <h3 className="text-lg font-medium mb-2">Project Selection Required</h3>
          <p>Please select a project first to view test cases</p>
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-sm text-left max-w-md mx-auto">
            <p className="font-medium">Debug Information:</p>
            <p>Current Slug: {currentSlug || 'Not set'}</p>
            <p>Project: {project ? 'Loaded' : 'Not loaded'}</p>
            <p>Project Loading: {projectLoading ? 'Yes' : 'No'}</p>
            <p>Project Error: {projectError || 'None'}</p>
            <p>TestTypeId: {currentTestTypeId || 'None'}</p>
            <p className="mt-2 text-blue-600">
              💡 <strong>Solution:</strong> Make sure you select a project from the project list first
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show project error state
  if (projectError) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full bg-gray-50 items-center justify-center">
        <div className="text-center text-red-600">
          <h3 className="text-lg font-medium mb-2">Project Error</h3>
          <p>{projectError}</p>
          <div className="mt-4 p-4 bg-red-50 rounded-lg text-sm">
            <p>Debug Information:</p>
            <p>Slug: {currentSlug}</p>
            <p>Token: {typeof window !== 'undefined' && localStorage.getItem('token') ? 'Exists' : 'Missing'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show no test type state
  if (!currentTestTypeId) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full bg-gray-50 items-center justify-center">
        <div className="text-center text-gray-500">
          <h3 className="text-lg font-medium mb-2">No Test Type Selected</h3>
          <p>Please select a test type to view test cases</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full bg-gray-50">
      <TestCaseSidebar
        testCases={filteredTestCases}
        selectedTestCase={selectedTestCase}
        onTestCaseSelect={handleTestCaseSelect}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        loading={loading}
        project={project}
        testTypeId={currentTestTypeId}
        error={error}
        onRetry={fetchTestCases}
      />
      
      <TestCaseDetails
        testCase={selectedTestCase}
        project={project}
        testTypeId={currentTestTypeId}
        selectedTestType={selectedTestType}
        onTestCaseUpdate={fetchTestCases}
      />
    </div>
  );
};

export default TestCasesMain;