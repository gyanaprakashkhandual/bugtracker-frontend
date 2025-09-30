// app/components/TestCases/TestCasesMain.jsx
'use client';

import { useState, useEffect } from 'react';
import { useProject } from '@/app/utils/Get.project';
import { useTestType } from '@/app/script/TestType.context';
import TestCaseSidebar from './Sidebar';
import TestCaseDetails from './Details';
import axios from 'axios';

const TestCasesMain = ({ slug }) => {
  const { project } = useProject(slug);
  const { selectedTestType } = useTestType();
  const [testCases, setTestCases] = useState([]);
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (project && selectedTestType) {
      fetchTestCases();
    }
  }, [project, selectedTestType]);

  const fetchTestCases = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/v1/test-case/projects/${project._id}/test-types/${selectedTestType._id}/test-cases`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTestCases(response.data.testCases);
    } catch (error) {
      console.error('Error fetching test cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestCaseSelect = async (testCase) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/v1/test-case/test-cases/${testCase._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSelectedTestCase(response.data.testCase);
    } catch (error) {
      console.error('Error fetching test case details:', error);
    }
  };

  const filteredTestCases = testCases.filter(testCase =>
    testCase.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testCase.moduleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testCase.testCaseDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full bg-gray-50">
      <TestCaseSidebar
        testCases={filteredTestCases}
        selectedTestCase={selectedTestCase}
        onTestCaseSelect={handleTestCaseSelect}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        loading={loading}
      />
      
      <TestCaseDetails
        testCase={selectedTestCase}
        project={project}
        testType={selectedTestType}
        onTestCaseUpdate={fetchTestCases}
      />
    </div>
  );
};

export default TestCasesMain;