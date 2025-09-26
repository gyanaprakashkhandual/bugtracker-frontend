'use client';

import { createContext, useState, useContext } from "react";

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <ProjectContext.Provider value={{ selectedProject, setSelectedProject }}>
      {children}
    </ProjectContext.Provider>
  )
}

export const useProject = () => useContext(ProjectContext);
