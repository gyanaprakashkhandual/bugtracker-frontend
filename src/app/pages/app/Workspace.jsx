'use client'
import Navbar from '@/app/components/Navbars/Workspace'
import React, { useState } from 'react'
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
  const [selectedView, setSelectedView] = useState(null); // 'chart', 'table', 'card', 'split'
  const [selectedReport, setSelectedReport] = useState(null); // 'bug', 'test-case'
  const [selectedData, setSelectedData] = useState(null); // 'fromVsCode', 'fromManual'

  // Function to render the appropriate component based on selections
  const renderComponent = () => {
    // If no selections made, show default message
    if (!selectedView && !selectedReport && !selectedData) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-gray-600">Please select options from the navbar to view content</p>
          </div>
        </div>
      );
    }

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

    // Manual Data Source - Both View and Report matter
    if (selectedData === 'fromManual') {
      // Bug Report
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

      // If Manual is selected but no report, show message
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-gray-600">Please select a Report type (Bug or Test Case)</p>
          </div>
        </div>
      );
    }

    // If only View or Report is selected without Data source
    if (!selectedData) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-gray-600">Please select a Data source (Manual or VS Code)</p>
          </div>
        </div>
      );
    }

    // Fallback
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">Please make your selections from the navbar</p>
        </div>
      </div>
    );
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

export default Workspace;