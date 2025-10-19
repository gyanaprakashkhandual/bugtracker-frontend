'use client';

import React, { createContext, useContext, useState } from 'react';

const DocContext = createContext();

export const DocProvider = ({ children }) => {
  const [docId, setDocId] = useState(null);
  const [docName, setDocName] = useState(null);

  const setSelectedDoc = (id, name) => {
    setDocId(id);
    setDocName(name);
  };

  const clearSelectedDoc = () => {
    setDocId(null);
    setDocName(null);
  };

  return (
    <DocContext.Provider value={{ docId, docName, setSelectedDoc, clearSelectedDoc }}>
      {children}
    </DocContext.Provider>
  );
};

export const useDoc = () => {
  const context = useContext(DocContext);
  if (!context) {
    throw new Error('useDoc must be used within a DocProvider');
  }
  return context;
};