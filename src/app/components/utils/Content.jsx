"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useContent } from "@/app/script/Content.context";

const Context = () => {
  const { content, hideContent, setTooltipHover } = useContent();
  const contextRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (content.visible) {
        hideContent();
        setCopied(false);
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [content.visible, hideContent]);

  useEffect(() => {
    if (!content.visible) {
      setCopied(false);
    }
  }, [content.visible]);

  useEffect(() => {
    if (!content.visible || !content.targetRect || !contextRef.current) {
      return;
    }

    const calculatePosition = () => {
      const contextRect = contextRef.current.getBoundingClientRect();
      const { targetRect, placement } = content;
      const gap = 8;

      let top = 0;
      let left = 0;

      switch (placement) {
        case "top":
          top = targetRect.top - contextRect.height - gap;
          left = targetRect.left + targetRect.width / 2 - contextRect.width / 2;
          break;
        case "bottom":
          top = targetRect.bottom + gap;
          left = targetRect.left + targetRect.width / 2 - contextRect.width / 2;
          break;
        case "left":
          top = targetRect.top + targetRect.height / 2 - contextRect.height / 2;
          left = targetRect.left - contextRect.width - gap;
          break;
        case "right":
          top = targetRect.top + targetRect.height / 2 - contextRect.height / 2;
          left = targetRect.right + gap;
          break;
        default:
          top = targetRect.bottom + gap;
          left = targetRect.left + targetRect.width / 2 - contextRect.width / 2;
      }

      // Keep content within viewport
      const padding = 8;
      if (left < padding) left = padding;
      if (left + contextRect.width > window.innerWidth - padding) {
        left = window.innerWidth - contextRect.width - padding;
      }
      if (top < padding) top = padding;
      if (top + contextRect.height > window.innerHeight - padding) {
        top = window.innerHeight - contextRect.height - padding;
      }

      setPosition({ top, left });
    };

    requestAnimationFrame(calculatePosition);
  }, [content.visible, content.targetRect, content.placement]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content.text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 300);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleMouseEnter = () => {
    setTooltipHover(true);
  };

  const handleMouseLeave = () => {
    setTooltipHover(false);
  };

  return (
    <AnimatePresence>
      {content.visible && content.text && (
        <motion.div
          ref={contextRef}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`fixed z-[99999] ${content.customClass || ""}`}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            maxWidth: "300px",
            minWidth: "100px",
          }}
        >
          <div className="bg-white text-gray-800 text-[13px] leading-[18px] px-3 py-2 rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.15)] border border-gray-200 font-normal flex items-start gap-2">
            <span className="flex-1">{content.text}</span>
            <button
              onClick={handleCopy}
              className="pointer-events-auto flex-shrink-0 hover:bg-gray-100 rounded p-1 transition-colors"
              aria-label="Copy to clipboard"
            >
              {copied ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-600"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-600"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Context;