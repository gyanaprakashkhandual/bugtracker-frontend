'use client';

import { useState } from 'react';
import CommentComponent from '../components/Comment';
import VersionControlComponent from '../components/Version';
import CollaborationComponent from '../components/Collaborate';
import SuggestionComponent from '../components/Suggestions';
import MediaComponent from '../components/Media';
import PreviewComponent from '../components/Preview';
import Editor from '../components/Editor';
import Setting from '../components/Setting';
import Navbar from '../components/Navbar';
import StatusBar from '../components/Statusbar';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';

// Main Document Editor Component
const DocumentEditor = () => {
    const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
    const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('editor');
    const [toolbarCollapsed, setToolbarCollapsed] = useState(false);

    const renderContent = () => {
        switch (activeTab) {
            case 'editor':
                return <Editor />;
            case 'preview':
                return <PreviewComponent />;
            case 'comments':
                return <CommentComponent />;
            case 'suggestions':
                return <SuggestionComponent />;
            case 'history':
                return <VersionControlComponent />;
            case 'collaborators':
                return <CollaborationComponent />;
            case 'media':
                return <MediaComponent />;
            case 'settings':
                return <Setting />;
            default:
                return <Editor />;
        }
    };

    return (
        <div className="h-screen flex flex-col bg-slate-50 sidebar-scrollbar">
            {/* Navbar */}
            <div className="sticky top-0 z-50">
                <Navbar
                    leftSidebarOpen={leftSidebarOpen}
                    setLeftSidebarOpen={setLeftSidebarOpen}
                    toolbarCollapsed={toolbarCollapsed}
                    setToolbarCollapsed={setToolbarCollapsed}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar */}
                <div className="sticky top-0 self-start">
                    <LeftSidebar
                        leftSidebarOpen={leftSidebarOpen}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />
                </div>

                {/* Main Editor Area */}
                <main className="flex-1 overflow-auto">
                    {renderContent()}
                </main>

                {/* Right Sidebar */}
                <div className="sticky top-0 self-start">
                    <RightSidebar
                        rightSidebarOpen={rightSidebarOpen}
                        setRightSidebarOpen={setRightSidebarOpen}
                    />
                </div>
            </div>

            {/* Status Bar */}
            <StatusBar />
        </div>
    );
};

export default DocumentEditor;