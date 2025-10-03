"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useContent } from "@/app/script/Context.context";

const Context = () => {
  const { content, hideContent } = useContent();
  const contextRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleScroll = () => {
      if (content.visible) {
        hideContent();
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [content.visible, hideContent]);

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

  return (
    <AnimatePresence>
      {content.visible && content.text && (
        <motion.div
          ref={contextRef}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
          className={`fixed z-[99999] pointer-events-none ${content.customClass || ""}`}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            maxWidth: "300px",
            minWidth: "100px",
          }}
        >
          <div className="bg-white text-gray-800 text-[13px] leading-[18px] px-3 py-2 rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.15)] border border-gray-200 font-normal">
            {content.text}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Context;