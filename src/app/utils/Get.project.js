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
    if (!slug) return;

    const fetchProject = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/v1/project/slug/${slug}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProject(response.data.project);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

  return { project, loading, error };
};
