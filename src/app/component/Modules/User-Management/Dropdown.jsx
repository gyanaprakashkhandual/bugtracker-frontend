import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Dropdown = forwardRef(({ trigger, children, isOpen, onToggle }, ref) => (
  <div className="relative" ref={ref}>
    <button onClick={onToggle} className="flex items-center">
      {trigger}
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.1 }}
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
));

Dropdown.displayName = 'Dropdown';

export default Dropdown;