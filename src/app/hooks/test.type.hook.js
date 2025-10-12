/* eslint-disable react-hooks/exhaustive-deps */
// test.type.hook.js
import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api/v1';

export const useTestTypes = (projectId, searchQuery = '', page = 1, limit = 50) => {
  const [testTypes, setTestTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTestTypeId, setSelectedTestTypeId] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTestTypes: 0,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    if (projectId) {
      fetchTestTypes();
    } else {
      setTestTypes([]);
      setSelectedTestTypeId(null);
    }
  }, [projectId, searchQuery, page]);

  const fetchTestTypes = async () => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    try {
      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${API_BASE}/test-type/projects/${projectId}/test-types?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch test types: ${response.status}`);
      }
      
      const data = await response.json();
      setTestTypes(data.testTypes || []);
      setPagination(data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalTestTypes: 0,
        hasNext: false,
        hasPrev: false
      });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching test types:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestTypeById = async (testTypeId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/test-types/${testTypeId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch test type: ${response.status}`);
      }
      
      const data = await response.json();
      return data.testType;
    } catch (err) {
      console.error('Error fetching test type by ID:', err);
      throw err;
    }
  };

  const selectTestType = (testTypeId) => {
    setSelectedTestTypeId(testTypeId);
    console.log('Test Type selected:', testTypeId);
  };

  const clearSelection = () => {
    setSelectedTestTypeId(null);
  };

  const getSelectedTestType = () => {
    return testTypes.find(t => t._id === selectedTestTypeId);
  };

  return {
    testTypes,
    loading,
    error,
    selectedTestTypeId,
    pagination,
    selectTestType,
    clearSelection,
    getSelectedTestType,
    fetchTestTypeById,
    refetch: fetchTestTypes
  };
};