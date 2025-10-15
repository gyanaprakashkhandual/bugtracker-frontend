'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const DocContext = createContext();

export function DocProvider({ children }) {
  const [docId, setDocId] = useState('');
  const [docSlug, setDocSlug] = useState('');
  const [docData, setDocData] = useState(null);

  // Load docId from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedDocId = localStorage.getItem('currentDocId');
      if (storedDocId) {
        setDocId(storedDocId);
      }
    }
  }, []);

  // Save docId to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && docId) {
      localStorage.setItem('currentDocId', docId);
    }
  }, [docId]);

  // Save docSlug to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && docSlug) {
      localStorage.setItem('currentDocSlug', docSlug);
    }
  }, [docSlug]);

  const clearDoc = () => {
    setDocId('');
    setDocSlug('');
    setDocData(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentDocId');
      localStorage.removeItem('currentDocSlug');
    }
  };

  const value = {
    docId,
    setDocId,
    docSlug,
    setDocSlug,
    docData,
    setDocData,
    clearDoc,
  };

  return <DocContext.Provider value={value}>{children}</DocContext.Provider>;
}

export function useDoc() {
  const context = useContext(DocContext);
  if (context === undefined) {
    throw new Error('useDoc must be used within a DocProvider');
  }
  return context;
}