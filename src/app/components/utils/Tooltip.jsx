'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTooltip } from '@/app/script/Tooltip.context';

export default function Tooltip() {
  const { tooltip, showTooltip, hideTooltip } = useTooltip();
  const tooltipRef = useRef(null);

  useEffect(() => {
    const handleMouseOver = (e) => {
      const target = e.target.closest('[tooltip-data]');
      if (target) {
        const text = target.getAttribute('tooltip-data');
        const placement = target.getAttribute('tooltip-placement') || 'top';
        const rect = target.getBoundingClientRect();
        
        let x = rect.left + rect.width / 2;
        let y = rect.top + rect.height / 2; // Changed to center of element
        
        // Calculate position based on placement
        switch(placement) {
          case 'top':
            x = rect.left + rect.width / 2;
            y = rect.top + rect.height / 2;
            break;
          case 'bottom':
            x = rect.left + rect.width / 2;
            y = rect.bottom + 8;
            break;
          case 'left':
            x = rect.left - 8;
            y = rect.top + rect.height / 2;
            break;
          case 'right':
            x = rect.right + 8;
            y = rect.top + rect.height / 2;
            break;
          case 'top-left':
            x = rect.left;
            y = rect.top + rect.height / 2;
            break;
          case 'top-right':
            x = rect.right;
            y = rect.top + rect.height / 2;
            break;
          case 'bottom-left':
            x = rect.left;
            y = rect.bottom + 8;
            break;
          case 'bottom-right':
            x = rect.right;
            y = rect.bottom + 8;
            break;
        }
        
        showTooltip(text, x, y, placement);
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target.closest('[tooltip-data]');
      if (target) {
        hideTooltip();
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [showTooltip, hideTooltip]);

  const getTransformStyle = () => {
    const placement = tooltip.placement || 'top';
    
    switch(placement) {
      case 'top':
        return 'translateX(-50%) translateY(calc(-100% - 12px))'; // Added gap from element
      case 'bottom':
        return 'translateX(-50%) translateY(0%)';
      case 'left':
        return 'translateX(-100%) translateY(-50%)';
      case 'right':
        return 'translateX(0%) translateY(-50%)';
      case 'top-left':
        return 'translateX(0%) translateY(calc(-100% - 12px))';
      case 'top-right':
        return 'translateX(-100%) translateY(calc(-100% - 12px))';
      case 'bottom-left':
        return 'translateX(0%) translateY(0%)';
      case 'bottom-right':
        return 'translateX(-100%) translateY(0%)';
      default:
        return 'translateX(-50%) translateY(calc(-100% - 12px))';
    }
  };

  const getArrowStyle = () => {
    const placement = tooltip.placement || 'top';
    
    switch(placement) {
      case 'top':
        return {
          className: 'absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-gray-900 rotate-45'
        };
      case 'bottom':
        return {
          className: 'absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-gray-900 rotate-45'
        };
      case 'left':
        return {
          className: 'absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-gray-900 rotate-45'
        };
      case 'right':
        return {
          className: 'absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-gray-900 rotate-45'
        };
      case 'top-left':
        return {
          className: 'absolute left-4 -bottom-1 w-2 h-2 bg-gray-900 rotate-45'
        };
      case 'top-right':
        return {
          className: 'absolute right-4 -bottom-1 w-2 h-2 bg-gray-900 rotate-45'
        };
      case 'bottom-left':
        return {
          className: 'absolute left-4 -top-1 w-2 h-2 bg-gray-900 rotate-45'
        };
      case 'bottom-right':
        return {
          className: 'absolute right-4 -top-1 w-2 h-2 bg-gray-900 rotate-45'
        };
      default:
        return {
          className: 'absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-gray-900 rotate-45'
        };
    }
  };

  return (
    <AnimatePresence>
      {tooltip.visible && (
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: getTransformStyle()
          }}
        >
          <div className="relative">
            <div className="bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
              {tooltip.text}
            </div>
            {/* Arrow */}
            <div className={getArrowStyle().className} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}