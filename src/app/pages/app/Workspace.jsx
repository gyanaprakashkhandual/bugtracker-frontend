'use client'
import Navbar from '@/app/components/Navbars/Workspace'
import React, { useState, useEffect } from 'react'
import TestCaseCardView from '../view/case-module/Card'
import TestCaseChartView from '../view/case-module/Chart'
import TestCaseSplitView from '../view/case-module/Split'
import TestCaseSpreadsheet from '../view/case-module/Table'
import BugSpreadsheet from '../view/bug-module/Table'
import BugCardView from '../view/bug-module/Card'
import BugStatisticsDashboard from '../view/bug-module/Chart'
import BugSplitView from '../view/bug-module/Split'
import TestResultCardView from '../view/result-module/Card'
import TestResultTableView from '../view/result-module/Table'
import TestResultChartView from '../view/result-module/Chart'
import TestResultSplitView from '../view/result-module/Split'

function Workspace() {
    // Initialize state from memory storage or defaults
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

    const [selectedData, setSelectedData] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.workspaceState?.selectedData || 'fromManual';
        }
        return 'fromManual';
    });

    // Initialize window.workspaceState if it doesn't exist
    useEffect(() => {
        if (typeof window !== 'undefined' && !window.workspaceState) {
            window.workspaceState = {
                selectedView: 'split',
                selectedReport: 'bug',
                selectedData: 'fromManual'
            };
        }
    }, []);

    // Save to memory storage whenever state changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.workspaceState = {
                selectedView,
                selectedReport,
                selectedData
            };
        }
    }, [selectedView, selectedReport, selectedData]);

    // Function to render the appropriate component based on selections
    const renderComponent = () => {
        // VS Code Data Source - Only View matters, Report is disabled
        if (selectedData === 'fromVsCode') {
            switch (selectedView) {
                case 'split':
                    return <TestResultSplitView />;
                case 'card':
                    return <TestResultCardView />;
                case 'chart':
                    return <TestResultChartView />;
                case 'table':
                    return <TestResultTableView />;
                default:
                    return <TestResultSplitView />; // Default to split view
            }
        }

        // Manual Data Source (default) - Both View and Report matter
        if (selectedData === 'fromManual') {
            // Bug Report (default)
            if (selectedReport === 'bug') {
                switch (selectedView) {
                    case 'split':
                        return <BugSplitView />;
                    case 'card':
                        return <BugCardView />;
                    case 'chart':
                        return <BugStatisticsDashboard />;
                    case 'table':
                        return <BugSpreadsheet />;
                    default:
                        return <BugSplitView />; // Default to split view
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
                        return <TestCaseSplitView />; // Default to split view
                }
            }
        }

        // Fallback - should never reach here with defaults
        return <BugSplitView />;
    };

    return (
        <div>
            <Navbar
                onViewChange={setSelectedView}
                onReportChange={setSelectedReport}
                onDataChange={setSelectedData}
            />
            <div className="pt-16">
                {renderComponent()}
            </div>
        </div>
    )
}

export default Workspace