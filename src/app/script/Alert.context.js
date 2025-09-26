"use client";
import { createContext, useContext, useState, useCallback } from "react";
import Alert from "../component/utils/Alert";

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  const showAlert = useCallback(({ type = "info", message }) => {
    setAlert({ type, message });
  }, []);

  const hideAlert = useCallback(() => {
    setAlert(null);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {alert && <Alert type={alert.type} message={alert.message} />}
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);