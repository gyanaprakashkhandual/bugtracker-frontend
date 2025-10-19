'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const DocContext = createContext();

export const DocProvider = ({ children }) => {
  const [docId, setDocId] = useState(null);
  const [docName, setDocName] = useState(null);

  // Load from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDocId = sessionStorage.getItem('selectedDocId');
      const savedDocName = sessionStorage.getItem('selectedDocName');

      if (savedDocId) setDocId(savedDocId);
      if (savedDocName) setDocName(savedDocName);
    }
  }, []);

  const setSelectedDoc = (id, name) => {
    console.log('🔵 DocContext: Setting selected doc:', { id, name });
    setDocId(id);
    setDocName(name);

    // Persist to sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedDocId', id);
      sessionStorage.setItem('selectedDocName', name);
    }
  };

  const clearSelectedDoc = () => {
    console.log('🔴 DocContext: Clearing selected doc');
    setDocId(null);
    setDocName(null);

    // Clear from sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('selectedDocId');
      sessionStorage.removeItem('selectedDocName');
    }
  };

  console.log('📘 DocContext current state:', { docId, docName });

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