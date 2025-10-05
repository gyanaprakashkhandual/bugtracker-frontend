"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

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
  const [hideTimeout, setHideTimeout] = useState(null);
  const isOverTooltip = useRef(false);
  const isOverTarget = useRef(false);

  const showContent = useCallback((text, targetRect, placement = "bottom", customClass = "") => {
    // Clear any pending hide timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }

    setContent({
      visible: true,
      text,
      position: { x: 0, y: 0 },
      targetRect,
      placement,
      customClass,
    });
  }, [hideTimeout]);

  const hideContent = useCallback(() => {
    // Only hide if cursor is neither over target nor tooltip
    if (!isOverTarget.current && !isOverTooltip.current) {
      setContent((prev) => ({ ...prev, visible: false }));
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        setHoverTimeout(null);
      }
    }
  }, [hoverTimeout]);

  const scheduleHide = useCallback(() => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }

    const timeout = setTimeout(() => {
      if (!isOverTarget.current && !isOverTooltip.current) {
        setContent((prev) => ({ ...prev, visible: false }));
      }
    }, 100);

    setHideTimeout(timeout);
  }, [hideTimeout]);

  // Expose tooltip hover state to Context component
  const setTooltipHover = useCallback((isHovering) => {
    isOverTooltip.current = isHovering;
    if (!isHovering) {
      scheduleHide();
    }
  }, [scheduleHide]);

  useEffect(() => {
    const handleMouseOver = (e) => {
      const target = e.target.closest("[content-data]");
      if (!target) return;

      const text = target.getAttribute("content-data");
      const placement = target.getAttribute("content-placement") || "bottom";
      const customClass = target.getAttribute("content-class") || "";

      if (!text) return;

      isOverTarget.current = true;

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

      isOverTarget.current = false;

      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        setHoverTimeout(null);
      }

      scheduleHide();
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [showContent, scheduleHide, hoverTimeout, hideTimeout]);

  return (
    <ContentContext.Provider value={{ content, showContent, hideContent, setTooltipHover }}>
      {children}
    </ContentContext.Provider>
  );
};