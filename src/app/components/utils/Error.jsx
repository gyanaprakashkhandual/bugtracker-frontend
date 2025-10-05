import { motion } from 'framer-motion';
import { AlertCircle, X, Mail } from 'lucide-react';
import { useState } from 'react';

const Error = ({
    message = 'An error occurred',
    onClose,
    autoClose = false,
    autoCloseDelay = 5000
}) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleClose = () => {
        setIsVisible(false);
        if (onClose) {
            setTimeout(() => onClose(), 300);
        }
    };

    if (autoClose) {
        setTimeout(handleClose, autoCloseDelay);
    }

    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-w-[300px] max-w-[300px] min-h-[100px] max-h-[300px] w-full"
        >
            <div className="bg-red-50 border border-red-200 rounded-lg shadow-sm p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>

                <div className="flex items-start gap-3 pl-2">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    >
                        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    </motion.div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-red-800 mb-1">
                            Error
                        </h3>
                        <p className="text-sm text-red-700 break-words">
                            {message}
                        </p>
                    </div>

                    {onClose && (
                        <button
                            onClick={handleClose}
                            className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors duration-200 p-1 rounded-full hover:bg-red-100"
                            aria-label="Close error message"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 mt-3 pl-2">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.open('http://localhost:3000/bug-report')}
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors duration-200 flex items-center justify-center gap-1.5"
                    >
                        <AlertCircle className="w-3.5 h-3.5" />
                        Bug Report
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.open('mailto:service.caffetest@gmail.com', '_blank')}
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors duration-200 flex items-center justify-center gap-1.5"
                    >
                        <Mail className="w-3.5 h-3.5" />
                        Contact
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default Error;