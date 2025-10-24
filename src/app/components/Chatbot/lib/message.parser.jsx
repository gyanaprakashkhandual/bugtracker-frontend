'use client';

import React, { useState } from 'react';
import { Copy, Check, FileText, Table, Code, ExternalLink, Bug, CheckCircle, Beaker, ChevronDown, ChevronUp, Download, X, AlertCircle, Calendar, User, Tag, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import * as XLSX from 'xlsx';

const MessageParser = ({ content = '', role, attachments = [], metadata = {} }) => {
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});

    const copyToClipboard = async (text, index) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const toggleSection = (key) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const downloadTableAsExcel = (headers, rows, filename = 'data') => {
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        XLSX.writeFile(workbook, `${filename}_${Date.now()}.xlsx`);
    };

    const downloadTableAsCSV = (headers, rows, filename = 'data') => {
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}_${Date.now()}.csv`;
        link.click();
    };

    // ✅ NEW: Render test cases as table
    const renderTestCasesTable = (testCases) => {
        if (!testCases || !Array.isArray(testCases) || testCases.length === 0) return null;

        const headers = [
            'Serial Number',
            'Module',
            'Type',
            'Description',
            'Expected Result',
            'Actual Result',
            'Priority',
            'Severity',
            'Status'
        ];

        const rows = testCases.map(tc => [
            tc.serialNumber || 'N/A',
            tc.moduleName || 'N/A',
            tc.testCaseType || 'N/A',
            tc.testCaseDescription || 'N/A',
            tc.expectedResult || 'N/A',
            tc.actualResult || 'N/A',
            tc.priority || 'N/A',
            tc.severity || 'N/A',
            tc.status || 'N/A'
        ]);

        const isExpanded = expandedSections['testcases-table'] !== false;
        const isCopied = copiedIndex === 'testcases-table';

        return (
            <div className="my-6 rounded-xl overflow-hidden border-2 border-emerald-200 dark:border-emerald-700 shadow-2xl bg-white dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 border-b-2 border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                        <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                            <CheckCircle className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
                        </div>
                        <div>
                            <span className="text-base font-bold block text-emerald-700 dark:text-emerald-300">Test Cases</span>
                            <span className="text-xs opacity-75 text-emerald-700 dark:text-emerald-300">{rows.length} {rows.length === 1 ? 'test case' : 'test cases'} • {headers.length} columns</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {rows.length > 5 && (
                            <button onClick={() => toggleSection('testcases-table')}
                                className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-medium transition-all shadow-sm">
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                {isExpanded ? 'Collapse' : 'Expand'}
                            </button>
                        )}
                        <button onClick={() => downloadTableAsExcel(headers, rows, 'test_cases')}
                            className="flex items-center gap-2 px-3 py-2 bg-green-600 dark:bg-green-700 hover:bg-green-500 dark:hover:bg-green-600 rounded-lg text-xs text-white font-medium transition-all shadow-md hover:shadow-lg">
                            <Download className="w-3.5 h-3.5" />
                            <span>Excel</span>
                        </button>
                        <button onClick={() => downloadTableAsCSV(headers, rows, 'test_cases')}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 dark:bg-blue-700 hover:bg-blue-500 dark:hover:bg-blue-600 rounded-lg text-xs text-white font-medium transition-all shadow-md hover:shadow-lg">
                            <Download className="w-3.5 h-3.5" />
                            <span>CSV</span>
                        </button>
                        <button onClick={() => copyToClipboard(JSON.stringify(testCases, null, 2), 'testcases-table')}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-700 dark:bg-slate-600 hover:bg-slate-600 dark:hover:bg-slate-500 rounded-lg text-sm text-white font-medium transition-all shadow-md hover:shadow-lg">
                            {isCopied ? (<><Check className="w-4 h-4" /><span>Copied!</span></>) : (<><Copy className="w-4 h-4" /><span>Copy</span></>)}
                        </button>
                    </div>
                </div>
                <div className={`overflow-x-auto transition-all ${!isExpanded && rows.length > 5 ? 'max-h-96' : 'max-h-[700px]'} overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-slate-100 dark:scrollbar-track-slate-800`}>
                    <table className="w-full min-w-full">
                        <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 z-10 shadow-sm">
                            <tr>
                                {headers.map((header, idx) => (
                                    <th key={idx} className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-600 uppercase tracking-wider whitespace-nowrap">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, rowIdx) => (
                                <tr key={rowIdx} className={`${rowIdx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-850'} hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors border-b border-slate-200 dark:border-slate-700`}>
                                    {row.map((cell, cellIdx) => {
                                        const cellLower = cell.toLowerCase();
                                        let cellClass = 'px-4 py-3 text-sm text-slate-700 dark:text-slate-300';
                                        let badge = false;

                                        if (['critical', 'high', 'medium', 'low', 'pass', 'fail', 'functional', 'ui', 'api', 'performance', 'security', 'integration', 'regression', 'smoke'].includes(cellLower)) {
                                            badge = true;
                                            cellClass = 'px-4 py-3';
                                        }

                                        const getBadgeClass = (value) => {
                                            const val = value.toLowerCase();
                                            if (val === 'critical') return 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800';
                                            if (val === 'high') return 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-800';
                                            if (val === 'medium') return 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800';
                                            if (val === 'low') return 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800';
                                            if (val === 'pass') return 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800';
                                            if (['fail', 'failed'].includes(val)) return 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800';
                                            if (['functional', 'ui', 'api', 'performance', 'security', 'integration', 'regression', 'smoke'].includes(val)) return 'bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 border-violet-300 dark:border-violet-800';
                                            return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600';
                                        };

                                        return (
                                            <td key={cellIdx} className={cellClass}>
                                                {badge ? (
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeClass(cell)}`}>
                                                        {cell}
                                                    </span>
                                                ) : (
                                                    <span className="font-medium" title={cell}>{cell.length > 50 ? cell.substring(0, 50) + '...' : cell}</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const parseContent = (text) => {
        if (!text) return [];
        const elements = [];
        let currentIndex = 0;
        const codeBlockPattern = /```(\w+)?\n([\s\S]*?)```/g;
        const tablePattern = /\|(.+)\|[\r\n]+\|([-:\s|]+)\|[\r\n]+((?:\|.+\|[\r\n]*)+)/g;

        const codeBlocks = [];
        let match;
        while ((match = codeBlockPattern.exec(text)) !== null) {
            codeBlocks.push({
                type: 'code',
                start: match.index,
                end: match.index + match[0].length,
                language: match[1] || 'plaintext',
                code: match[2].trim()
            });
        }

        const tables = [];
        tablePattern.lastIndex = 0;
        while ((match = tablePattern.exec(text)) !== null) {
            const isInCodeBlock = codeBlocks.some(
                (block) => match.index >= block.start && match.index < block.end
            );
            if (!isInCodeBlock) {
                tables.push({
                    type: 'table',
                    start: match.index,
                    end: match.index + match[0].length,
                    content: match[0]
                });
            }
        }

        const specialElements = [...codeBlocks, ...tables].sort((a, b) => a.start - b.start);

        specialElements.forEach((element, index) => {
            if (currentIndex < element.start) {
                const textContent = text.substring(currentIndex, element.start);
                elements.push({ type: 'text', content: textContent, key: `text-${index}` });
            }
            elements.push({ ...element, key: `${element.type}-${index}` });
            currentIndex = element.end;
        });

        if (currentIndex < text.length) {
            elements.push({ type: 'text', content: text.substring(currentIndex), key: `text-final` });
        }

        if (elements.length === 0) {
            elements.push({ type: 'text', content: text, key: 'text-only' });
        }

        return elements;
    };

    const formatInlineText = (text) => {
        if (!text) return <span></span>;
        const parts = [];
        let lastIndex = 0;

        const patterns = [
            { regex: /`([^`]+)`/g, type: 'inline-code' },
            { regex: /\*\*(.+?)\*\*/g, type: 'bold' },
            { regex: /\*(.+?)\*/g, type: 'italic' },
            { regex: /\[([^\]]+)\]\(([^)]+)\)/g, type: 'link' }
        ];

        const allMatches = [];
        patterns.forEach((pattern) => {
            let match;
            const regex = new RegExp(pattern.regex);
            while ((match = regex.exec(text)) !== null) {
                allMatches.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    type: pattern.type,
                    match: match
                });
            }
        });

        allMatches.sort((a, b) => a.start - b.start);

        const filteredMatches = [];
        allMatches.forEach((current) => {
            const hasOverlap = filteredMatches.some(
                (existing) =>
                    (current.start >= existing.start && current.start < existing.end) ||
                    (current.end > existing.start && current.end <= existing.end)
            );
            if (!hasOverlap) {
                filteredMatches.push(current);
            }
        });

        filteredMatches.forEach((item, index) => {
            if (lastIndex < item.start) {
                parts.push(<span key={`text-${index}`}>{text.substring(lastIndex, item.start)}</span>);
            }

            switch (item.type) {
                case 'inline-code':
                    parts.push(
                        <code key={`code-${index}`} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 rounded-md text-sm font-mono border border-slate-200 dark:border-slate-700">
                            {item.match[1]}
                        </code>
                    );
                    break;
                case 'bold':
                    parts.push(<strong key={`bold-${index}`} className="font-bold text-gray-900 dark:text-gray-100">{item.match[1]}</strong>);
                    break;
                case 'italic':
                    parts.push(<em key={`italic-${index}`} className="italic text-gray-700 dark:text-gray-300">{item.match[1]}</em>);
                    break;
                case 'link':
                    parts.push(
                        <a key={`link-${index}`} href={item.match[2]} target="_blank" rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline decoration-blue-400 underline-offset-2 inline-flex items-center gap-1 font-medium transition-colors">
                            {item.match[1]}
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    );
                    break;
                default:
                    parts.push(<span key={`default-${index}`}>{item.match[0]}</span>);
            }

            lastIndex = item.end;
        });

        if (lastIndex < text.length) {
            parts.push(<span key="text-final">{text.substring(lastIndex)}</span>);
        }

        return parts.length > 0 ? parts : <span>{text}</span>;
    };

    const renderCodeBlock = (code, language, index) => {
        const isCopied = copiedIndex === `code-${index}`;
        const isExpanded = expandedSections[`code-${index}`] !== false;
        const lineCount = code.split('\n').length;

        const downloadCode = () => {
            const blob = new Blob([code], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `code_${language}_${Date.now()}.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'txt'}`;
            a.click();
            URL.revokeObjectURL(url);
        };

        return (
            <div className="my-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900">
                <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-900 dark:to-slate-800 border-b border-slate-600 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-700 dark:bg-slate-800 rounded-lg">
                            <Code className="w-4 h-4 text-emerald-400 dark:text-emerald-500" />
                        </div>
                        <div>
                            <span className="text-sm text-slate-200 dark:text-slate-300 font-semibold uppercase tracking-wide">{language}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">• {lineCount} lines</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {lineCount > 10 && (
                            <button onClick={() => toggleSection(`code-${index}`)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 dark:bg-slate-800 hover:bg-slate-600 dark:hover:bg-slate-700 rounded-lg text-xs text-slate-200 dark:text-slate-300 transition-all">
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                {isExpanded ? 'Collapse' : 'Expand'}
                            </button>
                        )}
                        <button onClick={downloadCode}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 dark:bg-blue-700 hover:bg-blue-500 dark:hover:bg-blue-600 rounded-lg text-xs text-white font-medium transition-all shadow-md hover:shadow-lg">
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                        </button>
                        <button onClick={() => copyToClipboard(code, `code-${index}`)}
                            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-500 dark:hover:bg-emerald-600 rounded-lg text-sm text-white font-medium transition-all shadow-md hover:shadow-lg">
                            {isCopied ? (<><Check className="w-4 h-4" /><span>Copied!</span></>) : (<><Copy className="w-4 h-4" /><span>Copy</span></>)}
                        </button>
                    </div>
                </div>
                <div className={`overflow-x-auto transition-all ${!isExpanded && lineCount > 10 ? 'max-h-64' : 'max-h-[600px]'} overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 dark:scrollbar-thumb-slate-700 scrollbar-track-slate-800 dark:scrollbar-track-slate-900`}>
                    <pre className="p-5 text-sm text-slate-100 dark:text-slate-200 font-mono leading-relaxed">
                        <code>{code}</code>
                    </pre>
                </div>
            </div>
        );
    };

    const detectTableType = (headers) => {
        const headerStr = headers.join(' ').toLowerCase();

        if (headerStr.includes('bug') || headerStr.includes('defect') || headerStr.includes('issue') || headerStr.includes('serial')) {
            return { type: 'bug', icon: Bug, label: 'Bug Report', color: 'rose' };
        }
        if (headerStr.includes('test case') || headerStr.includes('scenario') || headerStr.includes('expected') || headerStr.includes('actual')) {
            return { type: 'testcase', icon: CheckCircle, label: 'Test Cases', color: 'emerald' };
        }
        if (headerStr.includes('test type') || headerStr.includes('framework') || headerStr.includes('automation')) {
            return { type: 'testtype', icon: Beaker, label: 'Test Types', color: 'blue' };
        }
        if (headerStr.includes('stats') || headerStr.includes('statistics') || headerStr.includes('count') || headerStr.includes('total')) {
            return { type: 'stats', icon: BarChart3, label: 'Statistics', color: 'purple' };
        }
        return { type: 'general', icon: Table, label: 'Data Table', color: 'slate' };
    };

    const renderTable = (tableContent, index) => {
        const lines = tableContent.trim().split('\n');
        if (lines.length < 3) return null;

        const headers = lines[0].split('|').filter((cell) => cell.trim()).map((cell) => cell.trim());
        const alignments = lines[1].split('|').filter((cell) => cell.trim()).map((cell) => {
            const trimmed = cell.trim();
            if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
            if (trimmed.endsWith(':')) return 'right';
            return 'left';
        });

        const rows = lines.slice(2).map((line) => line.split('|').filter((cell) => cell.trim()).map((cell) => cell.trim()));

        const isCopied = copiedIndex === `table-${index}`;
        const isExpanded = expandedSections[`table-${index}`] !== false;
        const tableType = detectTableType(headers);
        const IconComponent = tableType.icon;

        const colorClasses = {
            rose: 'from-rose-50 to-rose-100 dark:from-rose-950/50 dark:to-rose-900/50 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300',
            emerald: 'from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
            blue: 'from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
            purple: 'from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
            slate: 'from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
        };

        const tableDataForExport = rows.map(row => [...row]);

        return (
            <div className="my-6 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-2xl bg-white dark:bg-slate-900">
                <div className={`flex flex-wrap items-center justify-between px-5 py-4 bg-gradient-to-r ${colorClasses[tableType.color]} border-b-2`}>
                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                        <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                            <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-base font-bold block">{tableType.label}</span>
                            <span className="text-xs opacity-75">{rows.length} {rows.length === 1 ? 'row' : 'rows'} • {headers.length} columns</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {rows.length > 5 && (
                            <button onClick={() => toggleSection(`table-${index}`)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-medium transition-all shadow-sm">
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                {isExpanded ? 'Collapse' : 'Expand'}
                            </button>
                        )}
                        <button onClick={() => downloadTableAsExcel(headers, tableDataForExport, tableType.label.toLowerCase().replace(/\s+/g, '_'))}
                            className="flex items-center gap-2 px-3 py-2 bg-green-600 dark:bg-green-700 hover:bg-green-500 dark:hover:bg-green-600 rounded-lg text-xs text-white font-medium transition-all shadow-md hover:shadow-lg">
                            <Download className="w-3.5 h-3.5" />
                            <span>Excel</span>
                        </button>
                        <button onClick={() => downloadTableAsCSV(headers, tableDataForExport, tableType.label.toLowerCase().replace(/\s+/g, '_'))}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 dark:bg-blue-700 hover:bg-blue-500 dark:hover:bg-blue-600 rounded-lg text-xs text-white font-medium transition-all shadow-md hover:shadow-lg">
                            <Download className="w-3.5 h-3.5" />
                            <span>CSV</span>
                        </button>
                        <button onClick={() => copyToClipboard(tableContent, `table-${index}`)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-700 dark:bg-slate-600 hover:bg-slate-600 dark:hover:bg-slate-500 rounded-lg text-sm text-white font-medium transition-all shadow-md hover:shadow-lg">
                            {isCopied ? (<><Check className="w-4 h-4" /><span>Copied!</span></>) : (<><Copy className="w-4 h-4" /><span>Copy</span></>)}
                        </button>
                    </div>
                </div>
                <div className={`overflow-x-auto transition-all ${!isExpanded && rows.length > 5 ? 'max-h-96' : 'max-h-[700px]'} overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-slate-100 dark:scrollbar-track-slate-800`}>
                    <table className="w-full min-w-full">
                        <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 z-10 shadow-sm">
                            <tr>
                                {headers.map((header, idx) => (
                                    <th key={idx} className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-600 uppercase tracking-wider whitespace-nowrap"
                                        style={{ textAlign: alignments[idx] || 'left' }}>
                                        {header}
                                    </th>
                                ))}</tr>
                        </thead>
                        <tbody>
                            {rows.map((row, rowIdx) => (
                                <tr key={rowIdx} className={`${rowIdx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-850'} hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors border-b border-slate-200 dark:border-slate-700`}>
                                    {row.map((cell, cellIdx) => {
                                        const cellLower = cell.toLowerCase();
                                        let cellClass = 'px-4 py-3 text-sm text-slate-700 dark:text-slate-300';
                                        let badge = false;
                                        if (['critical', 'high', 'medium', 'low', 'new', 'open', 'pending', 'in progress', 'testing', 'fixed', 'closed', 'pass', 'fail', 'failed', 'blocked', 'functional', 'ui', 'api', 'performance', 'security'].includes(cellLower)) {
                                            badge = true;
                                            cellClass = 'px-4 py-3';
                                        }

                                        const getBadgeClass = (value) => {
                                            const val = value.toLowerCase();
                                            if (val === 'critical') return 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800';
                                            if (val === 'high') return 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-800';
                                            if (val === 'medium') return 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800';
                                            if (val === 'low') return 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800';
                                            if (['new', 'open', 'pending'].includes(val)) return 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800';
                                            if (['in progress', 'testing'].includes(val)) return 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800';
                                            if (['fixed', 'closed', 'pass'].includes(val)) return 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800';
                                            if (['fail', 'failed', 'blocked'].includes(val)) return 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800';
                                            if (['functional', 'ui', 'api', 'performance', 'security'].includes(val)) return 'bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 border-violet-300 dark:border-violet-800';
                                            return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600';
                                        };

                                        return (
                                            <td key={cellIdx} className={cellClass} style={{ textAlign: alignments[cellIdx] || 'left' }}>
                                                {badge ? (
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeClass(cell)}`}>
                                                        {cell}
                                                    </span>
                                                ) : (
                                                    <span className="font-medium">{cell.length > 100 ? cell.substring(0, 100) + '...' : cell}</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderAttachments = (attachments) => {
        if (!attachments || attachments.length === 0) return null;

        return (
            <div className="mt-4 mb-3 flex flex-wrap gap-3">
                {attachments.map((attachment, index) => (
                    <div key={index} className="relative group">
                        {attachment.type === 'image' ? (
                            <a href={attachment.url} target="_blank" rel="noopener noreferrer"
                                className="block rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105">
                                <img src={attachment.url} alt={attachment.name} className="max-w-sm h-auto" />
                            </a>
                        ) : (
                            <a href={attachment.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-3 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700">
                                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg">
                                    <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                </div>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{attachment.name}</span>
                            </a>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const renderText = (text) => {
        if (!text) return null;
        const lines = text.split('\n');
        return (
            <div className="space-y-2">
                {lines.map((line, index) => {
                    if (!line.trim()) return <div key={index} className="h-3" />;

                    if (/^(\d+\.|-|\*)\s+/.test(line)) {
                        const match = line.match(/^(\d+\.|-|\*)\s+(.+)$/);
                        if (match) {
                            return (
                                <div key={index} className="flex gap-3 ml-4 items-start">
                                    <span className={role === 'user' ? 'text-blue-300 dark:text-blue-400 font-medium' : 'text-slate-600 dark:text-slate-400 font-medium mt-0.5'}>
                                        {match[1]}
                                    </span>
                                    <span className="flex-1">{formatInlineText(match[2])}</span>
                                </div>
                            );
                        }
                    }

                    if (/^#{1,6}\s+/.test(line)) {
                        const match = line.match(/^(#{1,6})\s+(.+)$/);
                        if (match) {
                            const level = match[1].length;
                            const HeadingTag = `h${level}`;
                            const headingClasses = {
                                1: 'text-3xl font-bold mt-6 mb-3 text-slate-900 dark:text-slate-100',
                                2: 'text-2xl font-bold mt-5 mb-3 text-slate-800 dark:text-slate-200',
                                3: 'text-xl font-semibold mt-4 mb-2 text-slate-800 dark:text-slate-200',
                                4: 'text-lg font-semibold mt-3 mb-2 text-slate-700 dark:text-slate-300',
                                5: 'text-base font-semibold mt-3 mb-1 text-slate-700 dark:text-slate-300',
                                6: 'text-sm font-semibold mt-2 mb-1 text-slate-600 dark:text-slate-400'
                            };
                            return React.createElement(HeadingTag, { key: index, className: headingClasses[level] }, formatInlineText(match[2]));
                        }
                    }

                    return <p key={index} className="leading-relaxed text-base">{formatInlineText(line)}</p>;
                })}
            </div>
        );
    };

    const elements = parseContent(content);

    return (
        <div className={`${role === 'user' ? 'text-white dark:text-slate-100' : 'text-slate-800 dark:text-slate-200'} font-sans`}>
            {attachments && attachments.length > 0 && renderAttachments(attachments)}

            {/* ✅ NEW: Render test cases table if metadata contains data */}
            {metadata?.data && Array.isArray(metadata.data) && metadata.data.length > 0 && renderTestCasesTable(metadata.data)}

            {elements.map((element, index) => {
                switch (element.type) {
                    case 'code':
                        return renderCodeBlock(element.code, element.language, index);
                    case 'table':
                        return renderTable(element.content, index);
                    case 'text':
                    default:
                        return <div key={element.key}>{renderText(element.content)}</div>;
                }
            })}
        </div>
    );
};
export default MessageParser;
