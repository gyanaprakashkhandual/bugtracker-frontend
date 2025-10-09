"use client";
import { createContext, useContext, useState, useCallback } from "react";
import ConfirmModal from "../components/utils/Confirm";

const ConfirmContext = createContext();

export const ConfirmProvider = ({ children }) => {
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [resolveRef, setResolveRef] = useState(null);

  // Open modal and return a Promise<boolean>
  const showConfirm = useCallback(
    ({
      title = "Confirm Action",
      message = "Are you sure you want to proceed?",
      confirmText = "Confirm",
      cancelText = "Cancel",
      type = "default",
    }) => {
      return new Promise((resolve) => {
        setResolveRef(() => resolve); // store resolve function
        setConfirmConfig({
          isOpen: true,
          title,
          message,
          confirmText,
          cancelText,
          type,
        });
      });
    },
    []
  );

  // Close modal without confirming
  const hideConfirm = useCallback(() => {
    if (resolveRef) resolveRef(false); // return false on cancel
    setResolveRef(null);
    setConfirmConfig(null);
  }, [resolveRef]);

  // Handle confirm button
  const handleConfirm = useCallback(() => {
    if (resolveRef) resolveRef(true); // return true on confirm
    setResolveRef(null);
    setConfirmConfig(null);
  }, [resolveRef]);

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
