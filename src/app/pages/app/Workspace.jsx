'use client'
import Navbar from '@/app/components/Navbars/Workspace'
import React, { useState, useEffect } from 'react'
import TestCaseCardView from '../view/case-module/Card'
import TestCaseSplitView from '../view/case-module/Split'
import TestCaseSpreadsheet from '../view/case-module/Table'
import BugSpreadsheet from '../view/bug-module/Table'
import BugCardView from '../view/bug-module/Card'
import BugSplitView from '../view/bug-module/Split'
import TestResultsDashboard from '@/app/components/modules/Test-Result/App'
import BugKanbanView from '@/app/pages/view/bug-module/Kanban'

function Workspace() {
    const [selectedView, setSelectedView] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.workspaceState?.selectedView || 'split';
        }
        return 'split';
    });

    const [selectedReport, setSelectedReport] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.workspaceState?.selectedReport || 'bug';
        }
        return 'bug';
    });

    const [isKanbanActive, setIsKanbanActive] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.workspaceState?.isKanbanActive || false;
        }
        return false;
    });

    const [isTestResultActive, setIsTestResultActive] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.workspaceState?.isTestResultActive || false;
        }
        return false;
    });

    useEffect(() => {
        if (typeof window !== 'undefined' && !window.workspaceState) {
            window.workspaceState = {
                selectedView: 'split',
                selectedReport: 'bug',
                isKanbanActive: false,
                isTestResultActive: false
            };
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.workspaceState = {
                selectedView,
                selectedReport,
                isKanbanActive,
                isTestResultActive
            };
        }
    }, [selectedView, selectedReport, isKanbanActive, isTestResultActive]);

    useEffect(() => {
        const handleStateChange = (event) => {
            const { type, value } = event.detail;

            if (type === 'kanban') {
                setIsKanbanActive(value);
                if (value) {
                    setIsTestResultActive(false);
                }
                return;
            }

            if (type === 'testResult') {
                setIsTestResultActive(value);
                if (value) {
                    setIsKanbanActive(false);
                }
                return;
            }

            if (type === 'view') {
                setSelectedView(value);
                setIsKanbanActive(false);
                setIsTestResultActive(false);
                return;
            }

            if (type === 'report') {
                setSelectedReport(value);
                setIsKanbanActive(false);
                setIsTestResultActive(false);
                return;
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('workspaceStateChange', handleStateChange);
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('workspaceStateChange', handleStateChange);
            }
        };
    }, []);

    const renderComponent = () => {
        if (isKanbanActive) {
            return <BugKanbanView />;
        }

        if (isTestResultActive) {
            return <TestResultsDashboard />;
        }

        if (selectedReport === 'bug') {
            switch (selectedView) {
                case 'split':
                    return <BugSplitView />;
                case 'card':
                    return <BugCardView />;
                case 'table':
                    return <BugSpreadsheet />;
                default:
                    return <BugSplitView />;
            }
        }

        if (selectedReport === 'test-case') {
            switch (selectedView) {
                case 'split':
                    return <TestCaseSplitView />;
                case 'card':
                    return <TestCaseCardView />;
                case 'table':
                    return <TestCaseSpreadsheet />;
                default:
                    return <TestCaseSplitView />;
            }
        }

        return <BugSplitView />;
    };

    return (
        <div>
            <Navbar
                onViewChange={setSelectedView}
                onReportChange={setSelectedReport}
            />
            <div>
                {renderComponent()}
            </div>
        </div>
    )
}

export default Workspace;