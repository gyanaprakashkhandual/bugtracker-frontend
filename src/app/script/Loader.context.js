"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import Loader from "../components/utils/Loader";

// Create context
const LoaderContext = createContext();

// Custom hook to use Loader context
export const useLoader = () => useContext(LoaderContext);

// Provider component
export const LoaderProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loaderConfig, setLoaderConfig] = useState({
    size: "md",
    color: "#8B4513",
    text: "Loading..."
  });

  // Show loader with optional config
  const showLoader = useCallback((config = {}) => {
    setLoaderConfig((prev) => ({ ...prev, ...config }));
    setIsLoading(true);
  }, []);

  // Hide loader
  const hideLoader = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <LoaderContext.Provider value={{ isLoading, showLoader, hideLoader }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <Loader {...loaderConfig} />
        </div>
      )}
    </LoaderContext.Provider>
  );
};
