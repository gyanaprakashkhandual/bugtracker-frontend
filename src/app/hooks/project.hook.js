// project.hook.js
import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api/v1';

export const useProjects = (searchQuery = '', page = 1, limit = 50) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProjects: 0,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    fetchProjects();
  }, [searchQuery, page]);

  const fetchProjects = async () => {
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

      const token = localStorage.getItem('token'); // Get token from localStorage
      
      const response = await fetch(`${API_BASE}/project?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status}`);
      }
      
      const data = await response.json();
      setProjects(data.projects || []);
      setPagination(data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalProjects: 0,
        hasNext: false,
        hasPrev: false
      });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectById = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/project/${projectId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch project: ${response.status}`);
      }
      
      const data = await response.json();
      return data.project;
    } catch (err) {
      console.error('Error fetching project by ID:', err);
      throw err;
    }
  };

  const selectProject = (projectId) => {
    setSelectedProjectId(projectId);
    console.log('Project selected:', projectId);
  };

  const clearSelection = () => {
    setSelectedProjectId(null);
  };

  const getSelectedProject = () => {
    return projects.find(p => p._id === selectedProjectId);
  };

  return {
    projects,
    loading,
    error,
    selectedProjectId,
    pagination,
    selectProject,
    clearSelection,
    getSelectedProject,
    fetchProjectById,
    refetch: fetchProjects
  };
};

