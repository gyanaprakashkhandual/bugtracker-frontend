'use client';

import { createContext, useState, useContext } from "react";

const TestTypeContext = createContext();

export const TestTypeProvider = ({ children }) => {
  const [selectedTestType, setSelectedTestType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null);

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
  };

  return (
    <TestTypeContext.Provider
      value={{
        selectedTestType,
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