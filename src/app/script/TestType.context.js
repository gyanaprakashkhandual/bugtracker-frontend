
"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const TestTypeContext = createContext();

export const useTestType = () => {
  const context = useContext(TestTypeContext);
  if (!context) {
    throw new Error('useTestType must be used within TestTypeProvider');
  }
  return context;
};

export const TestTypeProvider = ({ children }) => {
  const params = useParams();
  const projectSlug = params?.slug;

  const [selectedTestType, setSelectedTestType] = useState(null);

  useEffect(() => {
    if (projectSlug) {
      const storageKey = `selectedTestType_${projectSlug}`;
      const savedTestType = localStorage.getItem(storageKey);

      if (savedTestType) {
        try {
          setSelectedTestType(JSON.parse(savedTestType));
        } catch (error) {
          localStorage.removeItem(storageKey);
        }
      } else {
        setSelectedTestType(null);
      }
    }
  }, [projectSlug]);

  const selectTestType = (testType) => {
    if (projectSlug) {
      const storageKey = `selectedTestType_${projectSlug}`;

      if (testType) {
        setSelectedTestType(testType);
        localStorage.setItem(storageKey, JSON.stringify(testType));
      } else {
        setSelectedTestType(null);
        localStorage.removeItem(storageKey);
      }
    }
  };

  const clearTestType = () => {
    if (projectSlug) {
      const storageKey = `selectedTestType_${projectSlug}`;
      setSelectedTestType(null);
      localStorage.removeItem(storageKey);
    }
  };

  const value = {
    selectedTestType,
    selectTestType,
    clearTestType,
    testTypeId: selectedTestType?._id || null,
    testTypeName: selectedTestType?.testTypeName || null
  };

  return (
    <TestTypeContext.Provider value={value}>
      {children}
    </TestTypeContext.Provider>
  );
};
