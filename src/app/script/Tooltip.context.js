'use client';

import { createContext, useContext, useState } from 'react';

const TooltipContext = createContext();

export const useTooltip = () => {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltip must be used within TooltipProvider');
  }
  return context;
};

export function TooltipProvider({ children }) {
  const [tooltip, setTooltip] = useState({
    visible: false,
    text: '',
    x: 0,
    y: 0,
    placement: 'top'
  });

  const showTooltip = (text, x, y, placement = 'top') => {
    setTooltip({ visible: true, text, x, y, placement });
  };

  const hideTooltip = () => {
    setTooltip({ visible: false, text: '', x: 0, y: 0, placement: 'top' });
  };

  return (
    <TooltipContext.Provider value={{ tooltip, showTooltip, hideTooltip }}>
      {children}
    </TooltipContext.Provider>
  );
}