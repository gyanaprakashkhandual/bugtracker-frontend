'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Check,
    AlertCircle,
    Zap,
    Save
} from 'lucide-react';
import { useProject } from '@/app/script/Project.context';

const DocumentStatusBar = ({
    editor,
    testTypeName,
    docName,
    lastSaved,
    autoSaveStatus = 'saved',
    handleManualSave
}) => {
    const { selectedProject } = useProject();

    const getWordCount = () => {
        if (editor?.storage?.characterCount) {
            return editor.storage.characterCount.words();
        }
        return 0;
    };

    const getCharacterCount = () => {
        if (editor?.storage?.characterCount) {
            return editor.storage.characterCount.characters();
        }
        return 0;
    };

    const formatLastSaved = () => {
        if (!lastSaved) return 'Not saved';
        const now = new Date();
        const saved = new Date(lastSaved);
        const diffMs = now - saved;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);

        if (diffSecs < 5) return 'Just now';
        if (diffSecs < 60) return `${diffSecs}s ago`;
        if (diffMins < 60) return `${diffMins}m ago`;
        return saved.toLocaleTimeString();
    };

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-0 left-0 right-0 h-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-between px-3 text-xs z-40 select-none"
        >
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-0.5 rounded cursor-pointer transition-colors">
                    {autoSaveStatus === 'saving' ? (
                        <>
                            <Zap className="w-3 h-3 animate-pulse text-blue-500" />
                            <span>Saving...</span>
                        </>
                    ) : autoSaveStatus === 'error' ? (
                        <>
                            <AlertCircle className="w-3 h-3 text-red-500" />
                            <span>Save Failed</span>
                        </>
                    ) : (
                        <>
                            <Check className="w-3 h-3 text-green-500" />
                            <span>Auto-save: {formatLastSaved()}</span>
                        </>
                    )}
                </div>

                <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>

                <div className="flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-0.5 rounded cursor-pointer transition-colors">
                    <FileText className="w-3 h-3" />
                    <span>{docName || 'Untitled'}</span>
                </div>

                <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>

                <button
                    onClick={handleManualSave}
                    className="flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-0.5 rounded transition-colors"
                    title="Save Document"
                >
                    <Save className="w-3 h-3" />
                    <span>Save</span>
                </button>
            </div>

            <div className="flex items-center gap-4">
                <div className="hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-0.5 rounded cursor-pointer transition-colors">
                    <span>{selectedProject?.projectName || 'No Project'}</span>
                </div>

                <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>

                <div className="hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-0.5 rounded cursor-pointer transition-colors">
                    <span>{testTypeName || 'No Test Type'}</span>
                </div>

                <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>

                {editor && (
                    <>
                        <div className="hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-0.5 rounded cursor-pointer transition-colors">
                            <span>Words: {getWordCount()}</span>
                        </div>

                        <div className="hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-0.5 rounded cursor-pointer transition-colors">
                            <span>Characters: {getCharacterCount()}</span>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
};

export default DocumentStatusBar;