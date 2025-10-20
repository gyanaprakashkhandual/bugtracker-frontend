"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const TooltipContext = createContext();

export const useTooltip = () => {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error("useTooltip must be used within TooltipProvider");
  }
  return context;
};

export const TooltipProvider = ({ children }) => {
  const [tooltip, setTooltip] = useState({
    visible: false,
    content: "",
    position: null,
    targetRect: null,
    placement: "bottom",
    customClass: "",
  });

  const [hoverTimeout, setHoverTimeout] = useState(null);

  const showTooltip = useCallback((content, targetRect, placement = "bottom", customClass = "") => {
    setTooltip({
      visible: true,
      content,
      position: { x: 0, y: 0 },
      targetRect,
      placement,
      customClass,
    });
  }, []);

  const hideTooltip = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }));
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  }, [hoverTimeout]);

  useEffect(() => {
    const handleMouseOver = (e) => {
      const target = e.target.closest("[tooltip-data]");
      if (!target) return;

      const content = target.getAttribute("tooltip-data");
      const placement = target.getAttribute("tooltip-placement") || "bottom";
      const customClass = target.getAttribute("tooltip-class") || "";

      if (!content) return;

      // Clear any existing timeout
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }

      // Delay showing tooltip by 500ms (Google Meet style)
      const timeout = setTimeout(() => {
        const rect = target.getBoundingClientRect();
        showTooltip(content, rect, placement, customClass);
      }, 500);

      setHoverTimeout(timeout);
    };

    const handleMouseOut = (e) => {
      const target = e.target.closest("[tooltip-data]");
      if (!target) return;

      hideTooltip();
    };

    // Add click handler to hide tooltip when element is clicked
    const handleClick = (e) => {
      const target = e.target.closest("[tooltip-data]");
      if (!target) return;

      // Immediately hide tooltip on click
      hideTooltip();
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("click", handleClick, true); // Use capture phase to catch clicks early

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("click", handleClick, true);
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [showTooltip, hideTooltip, hoverTimeout]);

  return (
    <TooltipContext.Provider value={{ tooltip, showTooltip, hideTooltip }}>
      {children}
    </TooltipContext.Provider>
  );
};