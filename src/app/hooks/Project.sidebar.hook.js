// hooks/useSidebar.js
'use client';

import { useState, useEffect, useCallback } from 'react';

export const useSidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Initialize sidebar state from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebarOpen');
            if (saved !== null) {
                setIsSidebarOpen(JSON.parse(saved));
            } else {
                // First time visitor - default to open and save to localStorage
                localStorage.setItem('sidebarOpen', JSON.stringify(true));
                setIsSidebarOpen(true);
            }
        }
    }, []);

    const toggleSidebar = useCallback((newState) => {
        setIsSidebarOpen(prev => {
            const state = typeof newState === 'boolean' ? newState : !prev;

            if (typeof window !== 'undefined') {
                localStorage.setItem('sidebarOpen', JSON.stringify(state));

                // Dispatch custom event for other components to listen to
                const event = new CustomEvent('sidebarStateChanged', {
                    detail: { isOpen: state }
                });
                window.dispatchEvent(event);
            }

            return state;
        });
    }, []);

    return {
        isSidebarOpen,
        toggleSidebar,
        setIsSidebarOpen
    };
};