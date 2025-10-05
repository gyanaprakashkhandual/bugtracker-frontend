'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useProject = (slug) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError('No slug provided');
      return;
    }

    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('No authentication token found');
        }

        const url = `http://localhost:5000/api/v1/project/slug/${slug}`;

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.project) {
          setProject(response.data.project);
        } else {
          setError('No project data received');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

  return { project, loading, error };
};