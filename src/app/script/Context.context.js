"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ContentContext = createContext();

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useContent must be used within ContentProvider");
  }
  return context;
};

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState({
    visible: false,
    text: "",
    position: null,
    targetRect: null,
    placement: "bottom",
    customClass: "",
  });

  const [hoverTimeout, setHoverTimeout] = useState(null);

  const showContent = useCallback((text, targetRect, placement = "bottom", customClass = "") => {
    setContent({
      visible: true,
      text,
      position: { x: 0, y: 0 },
      targetRect,
      placement,
      customClass,
    });
  }, []);

  const hideContent = useCallback(() => {
    setContent((prev) => ({ ...prev, visible: false }));
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  }, [hoverTimeout]);

  useEffect(() => {
    const handleMouseOver = (e) => {
      const target = e.target.closest("[content-data]");
      if (!target) return;

      const text = target.getAttribute("content-data");
      const placement = target.getAttribute("content-placement") || "bottom";
      const customClass = target.getAttribute("content-class") || "";

      if (!text) return;

      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }

      const timeout = setTimeout(() => {
        const rect = target.getBoundingClientRect();
        showContent(text, rect, placement, customClass);
      }, 500);

      setHoverTimeout(timeout);
    };

    const handleMouseOut = (e) => {
      const target = e.target.closest("[content-data]");
      if (!target) return;

      hideContent();
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [showContent, hideContent, hoverTimeout]);

  return (
    <ContentContext.Provider value={{ content, showContent, hideContent }}>
      {children}
    </ContentContext.Provider>
  );
};