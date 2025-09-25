// utils/projectUtils.js

// Store project name in localStorage
export const storeProjectName = (projectName) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentProjectName', projectName);
  }
};

// Get stored project name from localStorage
export const getStoredProjectName = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('currentProjectName');
  }
  return null;
};