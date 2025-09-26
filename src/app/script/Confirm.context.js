"use client";
import { createContext, useContext, useState, useCallback } from "react";
import ConfirmModal from "../component/utils/Confirm";

const ConfirmContext = createContext();

export const ConfirmProvider = ({ children }) => {
  const [confirmConfig, setConfirmConfig] = useState(null);

  // Open modal
  const showConfirm = useCallback(
    ({
      title = "Confirm Action",
      message = "Are you sure you want to proceed?",
      confirmText = "Confirm",
      cancelText = "Cancel",
      type = "default",
      onConfirm,
    }) => {
      setConfirmConfig({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm,
      });
    },
    []
  );

  // Close modal
  const hideConfirm = useCallback(() => {
    setConfirmConfig(null);
  }, []);

  // Handle confirm button
  const handleConfirm = useCallback(() => {
    if (confirmConfig?.onConfirm) confirmConfig.onConfirm();
    hideConfirm();
  }, [confirmConfig, hideConfirm]);

  return (
    <ConfirmContext.Provider value={{ showConfirm, hideConfirm }}>
      {children}
      {confirmConfig && (
        <ConfirmModal
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          cancelText={confirmConfig.cancelText}
          type={confirmConfig.type}
          onClose={hideConfirm}
          onConfirm={handleConfirm}
        />
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => useContext(ConfirmContext);
