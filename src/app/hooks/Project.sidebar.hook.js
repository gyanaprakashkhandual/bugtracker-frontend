'use client';

import { useState, useEffect, useCallback } from 'react';

export const useSidebar = () => {
    // Start with a default value that matches server render
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);

    // Initialize sidebar state from localStorage only after hydration
    useEffect(() => {
        setIsHydrated(true);
        
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('sidebarOpen');
                if (saved !== null) {
                    setIsSidebarOpen(JSON.parse(saved));
                } else {
                    // First time visitor - default to open and save to localStorage
                    localStorage.setItem('sidebarOpen', JSON.stringify(true));
                }
            } catch (error) {
                console.error('Error accessing localStorage:', error);
                // Fallback to default state if localStorage fails
                setIsSidebarOpen(true);
            }
        }
    }, []);

    const toggleSidebar = useCallback((newState) => {
        setIsSidebarOpen(prev => {
            const state = typeof newState === 'boolean' ? newState : !prev;

            if (typeof window !== 'undefined' && isHydrated) {
                try {
                    localStorage.setItem('sidebarOpen', JSON.stringify(state));

                    // Dispatch custom event for other components to listen to
                    const event = new CustomEvent('sidebarStateChanged', {
                        detail: { isOpen: state }
                    });
                    window.dispatchEvent(event);
                } catch (error) {
                    console.error('Error saving to localStorage:', error);
                }
            }

            return state;
        });
    }, [isHydrated]);

    return {
        isSidebarOpen,
        toggleSidebar,
        setIsSidebarOpen,
        isHydrated // Export this to allow components to wait for hydration
    };
};