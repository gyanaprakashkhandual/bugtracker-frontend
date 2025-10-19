'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const SheetContext = createContext();

export const SheetProvider = ({ children }) => {
  const [sheetId, setSheetId] = useState(null);
  const [sheetName, setSheetName] = useState(null);

  // Load from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSheetId = sessionStorage.getItem('selectedSheetId');
      const savedSheetName = sessionStorage.getItem('selectedSheetName');
      
      if (savedSheetId) setSheetId(savedSheetId);
      if (savedSheetName) setSheetName(savedSheetName);
    }
  }, []);

  const setSelectedSheet = (id, name) => {
    console.log('🔵 SheetContext: Setting selected sheet:', { id, name });
    setSheetId(id);
    setSheetName(name);
    
    // Persist to sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedSheetId', id);
      sessionStorage.setItem('selectedSheetName', name);
    }
  };

  const clearSelectedSheet = () => {
    console.log('🔴 SheetContext: Clearing selected sheet');
    setSheetId(null);
    setSheetName(null);
    
    // Clear from sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('selectedSheetId');
      sessionStorage.removeItem('selectedSheetName');
    }
  };

  console.log('📘 SheetContext current state:', { sheetId, sheetName });

  return (
    <SheetContext.Provider value={{ sheetId, sheetName, setSelectedSheet, clearSelectedSheet }}>
      {children}
    </SheetContext.Provider>
  );
};

export const useSheet = () => {
  const context = useContext(SheetContext);
  if (!context) {
    throw new Error('useSheet must be used within a SheetProvider');
  }
  return context;
};