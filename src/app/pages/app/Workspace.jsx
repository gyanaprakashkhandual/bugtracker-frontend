'use client'
import Navbar from '@/app/components/Navbars/Workspace'
import React, { useState, useEffect } from 'react'
import TestCaseCardView from '../view/case-module/Card'
import TestCaseChartView from '../view/case-module/Chart'
import TestCaseSplitView from '../view/case-module/Split'
import TestCaseSpreadsheet from '../view/case-module/Table'
import BugSpreadsheet from '../view/bug-module/Table'
import BugCardView from '../view/bug-module/Card'
import BugSplitView from '../view/bug-module/Split'
import Dashboard from '../view/bug-module/Chart/App'

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

    // Initialize workspace state
    useEffect(() => {
        if (typeof window !== 'undefined' && !window.workspaceState) {
            window.workspaceState = {
                selectedView: 'split',
                selectedReport: 'bug'
            };
        }
    }, []);

    // Update window state when local state changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.workspaceState = {
                selectedView,
                selectedReport
            };
        }
    }, [selectedView, selectedReport]);

    // Listen for state changes from navbar
    useEffect(() => {
        const handleStateChange = (event) => {
            const { type, value } = event.detail;
            if (type === 'view') {
                setSelectedView(value);
            } else if (type === 'report') {
                setSelectedReport(value);
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
        // Bug Report (default)
        if (selectedReport === 'bug') {
            switch (selectedView) {
                case 'split':
                    return <BugSplitView />;
                case 'card':
                    return <BugCardView />;
                case 'chart':
                    return <Dashboard />;
                case 'table':
                    return <BugSpreadsheet />;
                default:
                    return <BugSplitView />;
            }
        }

        // Test Case Report
        if (selectedReport === 'test-case') {
            switch (selectedView) {
                case 'split':
                    return <TestCaseSplitView />;
                case 'card':
                    return <TestCaseCardView />;
                case 'chart':
                    return <TestCaseChartView />;
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