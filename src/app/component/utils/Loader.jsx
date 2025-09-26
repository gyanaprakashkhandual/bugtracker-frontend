"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FaCoffee } from 'react-icons/fa';

const Loader = ({
    size = 'md',
    color = '#8B4513',
    text,
    className = ''
}) => {
    const sizeClasses = {
        sm: 'w-6 h-6 text-xl',
        md: 'w-10 h-10 text-3xl',
        lg: 'w-16 h-16 text-5xl',
        xl: 'w-24 h-24 text-7xl'
    };

    const containerSizes = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-32 h-32',
        xl: 'w-48 h-48'
    };

    const textSizes = {
        sm: 'text-xs mt-2',
        md: 'text-sm mt-3',
        lg: 'text-base mt-4',
        xl: 'text-lg mt-5'
    };

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div className={`relative ${containerSizes[size]} flex items-center justify-center`}>
                {/* Outer rotating ring */}
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-transparent"
                    style={{
                        borderTopColor: color,
                        borderRightColor: `${color}40`
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />

                {/* Inner pulsing ring */}
                <motion.div
                    className="absolute inset-2 rounded-full border border-transparent"
                    style={{ borderColor: `${color}30` }}
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Coffee icon with animations */}
                <motion.div
                    className={`${sizeClasses[size]} flex items-center justify-center`}
                    animate={{
                        y: [0, -4, 0],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <FaCoffee
                        style={{ color }}
                        className="drop-shadow-sm"
                    />
                </motion.div>

                {/* Steam effect */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    {[0, 1, 2].map((index) => (
                        <motion.div
                            key={index}
                            className="w-0.5 h-3 bg-gradient-to-t from-transparent via-gray-400 to-transparent rounded-full absolute"
                            style={{
                                left: `${(index - 1) * 3}px`,
                                background: `linear-gradient(to top, transparent, ${color}60, transparent)`
                            }}
                            animate={{
                                opacity: [0, 1, 0],
                                y: [0, -8, -16],
                                scale: [1, 0.8, 0.6]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: index * 0.2,
                                ease: "easeOut"
                            }}
                        />
                    ))}
                </div>

                {/* Floating particles */}
                {[0, 1, 2, 3].map((index) => (
                    <motion.div
                        key={index}
                        className="absolute w-1 h-1 rounded-full"
                        style={{
                            backgroundColor: `${color}40`,
                            top: '50%',
                            left: '50%'
                        }}
                        animate={{
                            x: [0, Math.cos(index * Math.PI / 2) * 20],
                            y: [0, Math.sin(index * Math.PI / 2) * 20],
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: index * 0.5,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>

            {/* Loading text */}
            {text && (
                <motion.p
                    className={`${textSizes[size]} font-medium text-gray-600 select-none`}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    {text}
                </motion.p>
            )}

            {/* Progress dots */}
            <motion.div className="flex space-x-1 mt-2">
                {[0, 1, 2].map((index) => (
                    <motion.div
                        key={index}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: `${color}60` }}
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.4, 1, 0.4]
                        }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: index * 0.2,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </motion.div>
        </div>
    );
};

export default Loader;