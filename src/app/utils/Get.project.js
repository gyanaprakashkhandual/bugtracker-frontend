// Updated Get.project.js with debugging
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
      setLoading(false); // Set loading to false when no slug
      return;
    }

    const fetchProject = async () => {
      try {
        console.log('🚀 Fetching project for slug:', slug);
        setLoading(true);
        const token = localStorage.getItem('token');
        console.log('🔑 Token exists:', !!token);
        
        const url = `http://localhost:5000/api/v1/project/slug/${slug}`;
        console.log('🌐 API URL:', url);
        
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log('✅ Project fetched successfully:', response.data);
        setProject(response.data.project);
      } catch (err) {
        console.error('❌ Error fetching project:', err);
        console.error('📄 Error response:', err.response?.data);
        setError(err.response?.data?.message || err.message);
      } finally {
        console.log('🏁 Setting project loading to false');
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

  return { project, loading, error };
};