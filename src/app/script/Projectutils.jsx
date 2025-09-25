// utils/projectUtils.js

// Store project name in localStorage
export const storeProjectName = (projectName) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentProjectName', projectName);
    console.log("✅ Stored Project Name:", projectName);
  }
};

// Get stored project name from localStorage
export const getStoredProjectName = () => {
  if (typeof window !== 'undefined') {
    const projectName = localStorage.getItem('currentProjectName');
    console.log("📌 Retrieved Project Name:", projectName);
    return projectName;
  }
  return null;
};
