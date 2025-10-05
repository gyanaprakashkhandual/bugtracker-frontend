'use client';

import { createContext, useState, useContext, useEffect } from "react";

const TestTypeContext = createContext();

export const TestTypeProvider = ({ children }) => {
  const [selectedTestType, setSelectedTestType] = useState(null);
  const [testTypeId, setTestTypeId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null);

  useEffect(() => {
    const savedTestTypeId = localStorage.getItem('selectedTestTypeId');
    if (savedTestTypeId) {
      setTestTypeId(savedTestTypeId);
    }
  }, []);

  useEffect(() => {
    if (testTypeId) {
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
    setSelectedTestType(testType);
    if (testType && testType._id) {
      setTestTypeId(testType._id);
    }
  };

  const clearTestType = () => {
    setSelectedTestType(null);
    setTestTypeId(null);
    localStorage.removeItem('selectedTestTypeId');
  };

  const getCurrentTestTypeId = () => {
    return testTypeId;
  };

  return (
    <TestTypeContext.Provider
      value={{
        selectedTestType,
        testTypeId,
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
        getCurrentTestTypeId,
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