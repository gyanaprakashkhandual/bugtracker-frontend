"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedProjectId = localStorage.getItem('currentProjectId');
    if (storedProjectId && !selectedProject) {
      const fetchProjectDetails = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;

          const response = await fetch(`https://caffetest.onrender.com/api/v1/project/${storedProjectId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            setSelectedProject(data.project);
          } else {
            localStorage.removeItem('currentProjectId');
          }
        } catch (error) {
          console.error('Error fetching project details:', error);
          localStorage.removeItem('currentProjectId');
        }
      };

      fetchProjectDetails();
    }
  }, [selectedProject]);

  const updateSelectedProject = (project) => {
    setSelectedProject(project);
    if (project && project._id) {
      localStorage.setItem('currentProjectId', project._id);
    }
  };

  const clearSelectedProject = () => {
    setSelectedProject(null);
    localStorage.removeItem('currentProjectId');
  };

  const getProjectById = (projectId) => {
    return projects.find(project => project._id === projectId) || selectedProject;
  };

  const value = {
    selectedProject,
    setSelectedProject: updateSelectedProject,
    clearSelectedProject,
    projects,
    setProjects,
    isLoading,
    setIsLoading,
    getProjectById
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext;