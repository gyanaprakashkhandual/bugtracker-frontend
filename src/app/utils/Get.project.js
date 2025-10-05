// Updated Get.project.js with more detailed debugging
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Custom hook to fetch project by slug
 * @param {string} slug - project slug from URL
 * @returns {object} { project, loading, error }
 */
export const useProject = (slug) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🎯 useProject hook called with slug:', slug, 'Type:', typeof slug);
    
    if (!slug) {
      console.log('❌ No slug provided, returning early');
      setLoading(false);
      setError('No slug provided');
      return;
    }

    const fetchProject = async () => {
      try {
        console.log('🚀 Fetching project for slug:', slug);
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        console.log('🔑 Token exists:', !!token);
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const url = `http://localhost:5000/api/v1/project/slug/${slug}`;
        console.log('🌐 API URL:', url);
        
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log('✅ Project API Response:', response.data);
        
        if (response.data.project) {
          console.log('📦 Project data received:', response.data.project);
          setProject(response.data.project);
        } else {
          console.log('❌ No project data in response');
          setError('No project data received');
        }
      } catch (err) {
        console.error('❌ Error fetching project:', err);
        console.error('📄 Error response:', err.response?.data);
        setError(err.response?.data?.message || err.message || 'Failed to fetch project');
      } finally {
        console.log('🏁 Setting project loading to false');
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

  // Log when the hook returns values
  useEffect(() => {
    console.log('🔄 useProject state update:', {
      project: project?._id,
      loading,
      error
    });
  }, [project, loading, error]);

  return { project, loading, error };
};
