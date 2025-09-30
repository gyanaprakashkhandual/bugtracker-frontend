// app/script/TestType.context.jsx
'use client';

import { createContext, useState, useContext, useEffect } from "react";

const TestTypeContext = createContext();

export const TestTypeProvider = ({ children }) => {
  const [selectedTestType, setSelectedTestType] = useState(null);
  const [testTypeId, setTestTypeId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null);

  // Load testTypeId from localStorage on component mount
  useEffect(() => {
    const savedTestTypeId = localStorage.getItem('selectedTestTypeId');
    console.log('🔄 TestTypeContext: Loading from localStorage:', savedTestTypeId);
    if (savedTestTypeId) {
      setTestTypeId(savedTestTypeId);
    }
  }, []);

  // Sync testTypeId to localStorage whenever it changes
  useEffect(() => {
    if (testTypeId) {
      console.log('💾 TestTypeContext: Saving to localStorage:', testTypeId);
      localStorage.setItem('selectedTestTypeId', testTypeId);
    }
  }, [testTypeId]);

  const openEditModal = (testType) => {
    setSelectedTestType(testType);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedTestType(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const openViewModal = (testType) => {
    setSelectedTestType(testType);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const openDeleteModal = (testType) => {
    setSelectedTestType(testType);
    setModalMode('delete');
    setIsModalOpen(true);
  };

  const openDuplicateModal = (testType) => {
    setSelectedTestType(testType);
    setModalMode('duplicate');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTestType(null);
    setModalMode(null);
  };

  const selectTestType = (testType) => {
    console.log('🎯 TestTypeContext: Selecting test type:', testType);
    setSelectedTestType(testType);
    if (testType && testType._id) {
      setTestTypeId(testType._id);
    }
  };

  const clearTestType = () => {
    console.log('🗑️ TestTypeContext: Clearing test type');
    setSelectedTestType(null);
    setTestTypeId(null);
    localStorage.removeItem('selectedTestTypeId');
  };

  // Helper function to get the current testTypeId (with localStorage fallback)
  // Only use testTypeId from state, do not access localStorage directly here
  const getCurrentTestTypeId = () => {
    console.log('🔍 TestTypeContext: Current testTypeId:', testTypeId);
    return testTypeId;
  };

  return (
    <TestTypeContext.Provider
      value={{
        selectedTestType,
        testTypeId, // Use state directly
        setSelectedTestType,
        isModalOpen,
        setIsModalOpen,
        modalMode,
        setModalMode,
        openEditModal,
        openCreateModal,
        openViewModal,
        openDeleteModal,
        openDuplicateModal,
        closeModal,
        selectTestType,
        clearTestType,
        getCurrentTestTypeId, // Export the helper function
      }}
    >
      {children}
    </TestTypeContext.Provider>
  );
};

export const useTestType = () => {
  const context = useContext(TestTypeContext);
  if (context === undefined) {
    throw new Error('useTestType must be used within a TestTypeProvider');
  }
  return context;
};