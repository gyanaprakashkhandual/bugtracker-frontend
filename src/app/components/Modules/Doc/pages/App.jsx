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
        <div className="h-screen flex flex-col bg-slate-50">
            {/* Navbar */}
            <Navbar
                leftSidebarOpen={leftSidebarOpen}
                setLeftSidebarOpen={setLeftSidebarOpen}
                toolbarCollapsed={toolbarCollapsed}
                setToolbarCollapsed={setToolbarCollapsed}
            />

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar */}
                <LeftSidebar
                    leftSidebarOpen={leftSidebarOpen}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

                {/* Main Editor Area */}
                <main className="flex-1 overflow-hidden">
                    {renderContent()}
                </main>

                {/* Right Sidebar */}
                <RightSidebar
                    rightSidebarOpen={rightSidebarOpen}
                    setRightSidebarOpen={setRightSidebarOpen}
                />
            </div>

            {/* Status Bar */}
            <StatusBar />
        </div>
    );
};

export default DocumentEditor;