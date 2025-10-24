'use client';

import React, { useState } from 'react';
import { Copy, Check, FileText, Code, ExternalLink, Bug, CheckCircle, ChevronDown, ChevronUp, Download } from 'lucide-react';

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

    const downloadAsMarkdown = (content, filename = 'document') => {
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}_${Date.now()}.md`;
        link.click();
    };

    // ===== RENDER TEST CASES AS DOCUMENT =====
    const renderTestCasesDocument = (testCases) => {
        if (!testCases || !Array.isArray(testCases) || testCases.length === 0) return null;

        const documentContent = testCases.map((tc, index) => `
### Test Case ${index + 1}: ${tc.serialNumber || 'N/A'}

**Module Name:** ${tc.moduleName || 'N/A'}
**Test Case Type:** ${tc.testCaseType || 'N/A'}
**Priority:** ${tc.priority || 'N/A'}
**Severity:** ${tc.severity || 'N/A'}
**Status:** ${tc.status || 'N/A'}

**Description:**
${tc.testCaseDescription || 'No description provided'}

**Expected Result:**
${tc.expectedResult || 'Expected behavior not defined'}

**Actual Result:**
${tc.actualResult || 'Not executed'}

${tc.image && tc.image !== 'No image provided' ? `**Attachment:** ${tc.image}` : ''}

---
        `).join('\n');

        const isCopied = copiedIndex === 'testcases-document';

        return (
            <div className="my-6 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
                <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Test Cases Document</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">({testCases.length} {testCases.length === 1 ? 'test case' : 'test cases'})</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <button onClick={() => downloadAsMarkdown(documentContent, 'test_cases')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 rounded-md text-xs text-white font-medium transition-all shadow-sm">
                            <Download className="w-3.5 h-3.5" />
                            Download MD
                        </button>
                        <button onClick={() => copyToClipboard(documentContent, 'testcases-document')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 rounded-md text-xs text-white font-medium transition-all shadow-sm">
                            {isCopied ? <><Check className="w-3.5 h-3.5" />Copied</> : <><Copy className="w-3.5 h-3.5" />Copy</>}
                        </button>
                    </div>
                </div>
                <div className="p-6 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-slate-100 dark:scrollbar-track-slate-800">
                    {testCases.map((tc, index) => (
                        <div key={index} className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                                Test Case {index + 1}: <span className="text-emerald-600 dark:text-emerald-400">{tc.serialNumber || 'N/A'}</span>
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded">
                                        <span className="font-medium text-slate-600 dark:text-slate-400">Module:</span>
                                        <span className="ml-2 text-slate-800 dark:text-slate-200">{tc.moduleName || 'N/A'}</span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded">
                                        <span className="font-medium text-slate-600 dark:text-slate-400">Type:</span>
                                        <span className="ml-2 text-slate-800 dark:text-slate-200">{tc.testCaseType || 'N/A'}</span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded">
                                        <span className="font-medium text-slate-600 dark:text-slate-400">Priority:</span>
                                        <span className={`ml-2 font-semibold ${tc.priority === 'Critical' ? 'text-red-600 dark:text-red-400' : tc.priority === 'High' ? 'text-orange-600 dark:text-orange-400' : tc.priority === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                                            {tc.priority || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded">
                                        <span className="font-medium text-slate-600 dark:text-slate-400">Severity:</span>
                                        <span className={`ml-2 font-semibold ${tc.severity === 'Critical' ? 'text-red-600 dark:text-red-400' : tc.severity === 'High' ? 'text-orange-600 dark:text-orange-400' : tc.severity === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                                            {tc.severity || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded col-span-2">
                                        <span className="font-medium text-slate-600 dark:text-slate-400">Status:</span>
                                        <span className={`ml-2 font-semibold ${tc.status === 'Pass' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                            {tc.status || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="mt-4">
                                    <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">📝 Description:</p>
                                    <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded leading-relaxed">
                                        {tc.testCaseDescription || 'No description provided'}
                                    </p>
                                </div>
                                
                                <div className="mt-4">
                                    <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">✅ Expected Result:</p>
                                    <p className="text-slate-700 dark:text-slate-300 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded leading-relaxed">
                                        {tc.expectedResult || 'Expected behavior not defined'}
                                    </p>
                                </div>
                                
                                <div className="mt-4">
                                    <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">🔍 Actual Result:</p>
                                    <p className="text-slate-700 dark:text-slate-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded leading-relaxed">
                                        {tc.actualResult || 'Not executed'}
                                    </p>
                                </div>
                                
                                {tc.image && tc.image !== 'No image provided' && (
                                    <div className="mt-4">
                                        <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">📎 Attachment:</p>
                                        <a href={tc.image} target="_blank" rel="noopener noreferrer" 
                                           className="text-blue-600 dark:text-blue-400 hover:underline text-sm break-all">
                                            {tc.image}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // ===== RENDER BUGS AS DOCUMENT =====
    const renderBugsDocument = (bugs) => {
        if (!bugs || !Array.isArray(bugs) || bugs.length === 0) return null;

        const documentContent = bugs.map((bug, index) => `
### Bug ${index + 1}: ${bug.serialNumber || 'N/A'}

**Module Name:** ${bug.moduleName || 'N/A'}
**Bug Type:** ${bug.bugType || 'N/A'}
**Priority:** ${bug.priority || 'N/A'}
**Severity:** ${bug.severity || 'N/A'}
**Status:** ${bug.status || 'N/A'}

**Description:**
${bug.bugDesc || 'No description'}

**Requirements:**
${bug.bugRequirement || 'Not specified'}

${bug.refLinks && bug.refLinks.length > 0 ? `**Reference Links:**\n${bug.refLinks.map(link => `- ${link}`).join('\n')}` : ''}

${bug.images && bug.images.length > 0 ? `**Attachments:** ${bug.images.length} image(s)` : ''}

---
        `).join('\n');

        const isCopied = copiedIndex === 'bugs-document';

        return (
            <div className="my-6 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
                <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <Bug className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bugs Document</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">({bugs.length} {bugs.length === 1 ? 'bug' : 'bugs'})</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <button onClick={() => downloadAsMarkdown(documentContent, 'bugs')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 rounded-md text-xs text-white font-medium transition-all shadow-sm">
                            <Download className="w-3.5 h-3.5" />
                            Download MD
                        </button>
                        <button onClick={() => copyToClipboard(documentContent, 'bugs-document')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 rounded-md text-xs text-white font-medium transition-all shadow-sm">
                            {isCopied ? <><Check className="w-3.5 h-3.5" />Copied</> : <><Copy className="w-3.5 h-3.5" />Copy</>}
                        </button>
                    </div>
                </div>
                <div className="p-6 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-slate-100 dark:scrollbar-track-slate-800">
                    {bugs.map((bug, index) => (
                        <div key={index} className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                                Bug {index + 1}: <span className="text-rose-600 dark:text-rose-400">{bug.serialNumber || 'N/A'}</span>
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded">
                                        <span className="font-medium text-slate-600 dark:text-slate-400">Module:</span>
                                        <span className="ml-2 text-slate-800 dark:text-slate-200">{bug.moduleName || 'N/A'}</span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded">
                                        <span className="font-medium text-slate-600 dark:text-slate-400">Type:</span>
                                        <span className="ml-2 text-slate-800 dark:text-slate-200">{bug.bugType || 'N/A'}</span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded">
                                        <span className="font-medium text-slate-600 dark:text-slate-400">Priority:</span>
                                        <span className={`ml-2 font-semibold ${bug.priority === 'Critical' ? 'text-red-600 dark:text-red-400' : bug.priority === 'High' ? 'text-orange-600 dark:text-orange-400' : bug.priority === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                                            {bug.priority || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded">
                                        <span className="font-medium text-slate-600 dark:text-slate-400">Severity:</span>
                                        <span className={`ml-2 font-semibold ${bug.severity === 'Critical' ? 'text-red-600 dark:text-red-400' : bug.severity === 'High' ? 'text-orange-600 dark:text-orange-400' : bug.severity === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                                            {bug.severity || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded col-span-2">
                                        <span className="font-medium text-slate-600 dark:text-slate-400">Status:</span>
                                        <span className={`ml-2 font-semibold ${['Fixed', 'Closed'].includes(bug.status) ? 'text-emerald-600 dark:text-emerald-400' : ['Open', 'New'].includes(bug.status) ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                            {bug.status || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="mt-4">
                                    <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">🐛 Description:</p>
                                    <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded leading-relaxed">
                                        {bug.bugDesc || 'No description'}
                                    </p>
                                </div>
                                
                                <div className="mt-4">
                                    <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">📋 Requirements:</p>
                                    <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded leading-relaxed">
                                        {bug.bugRequirement || 'Not specified'}
                                    </p>
                                </div>
                                
                                {bug.refLinks && bug.refLinks.length > 0 && (
                                    <div className="mt-4">
                                        <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">🔗 Reference Links:</p>
                                        <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded space-y-1">
                                            {bug.refLinks.map((link, i) => (
                                                <li key={i}>
                                                    <a href={link} target="_blank" rel="noopener noreferrer" 
                                                       className="text-blue-600 dark:text-blue-400 hover:underline break-all">
                                                        {link}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                {bug.images && bug.images.length > 0 && (
                                    <div className="mt-4">
                                        <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            📎 Attachments: <span className="text-slate-600 dark:text-slate-400">{bug.images.length} image(s)</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // ===== PARSE CONTENT =====
    const parseContent = (text) => {
        if (!text) return [];
        const elements = [];
        let currentIndex = 0;
        const codeBlockPattern = /```(\w+)?\n([\s\S]*?)```/g;

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

        codeBlocks.forEach((element, index) => {
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

    // ===== FORMAT INLINE TEXT =====
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
                        <code key={`code-${index}`} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 rounded text-sm font-mono border border-slate-200 dark:border-slate-700">
                            {item.match[1]}
                        </code>
                    );
                    break;
                case 'bold':
                    parts.push(<strong key={`bold-${index}`} className="font-semibold text-slate-900 dark:text-slate-100">{item.match[1]}</strong>);
                    break;
                case 'italic':
                    parts.push(<em key={`italic-${index}`} className="italic text-slate-700 dark:text-slate-300">{item.match[1]}</em>);
                    break;
                case 'link':
                    parts.push(
                        <a key={`link-${index}`} href={item.match[2]} target="_blank" rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline decoration-blue-400 underline-offset-2 inline-flex items-center gap-1 font-medium transition-colors">
                            {item.match[1]}
                            <ExternalLink className="w-3 h-3" />
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

    // ===== RENDER CODE BLOCK =====
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
            <div className="my-4 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md bg-slate-900 dark:bg-slate-950">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 dark:bg-slate-900 border-b border-slate-700 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-slate-300 font-medium uppercase tracking-wide">{language}</span>
                        <span className="text-xs text-slate-500">• {lineCount} lines</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {lineCount > 10 && (
                            <button onClick={() => toggleSection(`code-${index}`)}
                                className="flex items-center gap-1 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-xs text-slate-300 transition-all">
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                {isExpanded ? 'Collapse' : 'Expand'}
                            </button>
                        )}
                        <button onClick={downloadCode}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 rounded text-xs text-white font-medium transition-all">
                            <Download className="w-3.5 h-3.5" />
                            Download
                        </button>
                        <button onClick={() => copyToClipboard(code, `code-${index}`)}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded text-xs text-white font-medium transition-all">
                            {isCopied ? (<><Check className="w-3.5 h-3.5" />Copied</>) : (<><Copy className="w-3.5 h-3.5" />Copy</>)}
                        </button>
                    </div>
                </div>
                <div className={`overflow-x-auto transition-all ${!isExpanded && lineCount > 10 ? 'max-h-64' : 'max-h-[600px]'} overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 dark:scrollbar-thumb-slate-700 scrollbar-track-slate-800 dark:scrollbar-track-slate-900`}>
                    <pre className="p-4 text-sm text-slate-100 dark:text-slate-200 font-mono leading-relaxed">
                        <code>{code}</code>
                    </pre>
                </div>
            </div>
        );
    };

    // ===== RENDER ATTACHMENTS =====
    const renderAttachments = (attachments) => {
        if (!attachments || attachments.length === 0) return null;

        return (
            <div className="mt-4 mb-3 flex flex-wrap gap-3">
                {attachments.map((attachment, index) => (
                    <div key={index} className="relative group">
                        {attachment.type === 'image' ? (
                            <a href={attachment.url} target="_blank" rel="noopener noreferrer"
                                className="block rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all shadow-sm hover:shadow-md">
                                <img src={attachment.url} alt={attachment.name} className="max-w-sm h-auto" />
                            </a>
                        ) : (
                            <a href={attachment.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700transition-all shadow-sm border border-slate-200 dark:border-slate-700">
<FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
<span className="text-sm font-medium text-slate-700 dark:text-slate-300">{attachment.name}</span>
</a>
)}
</div>
))}
</div>
);
};
// ===== RENDER TEXT =====
const renderText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return (
        <div className="space-y-2">
            {lines.map((line, index) => {
                if (!line.trim()) return <div key={index} className="h-2" />;

                // List items
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

                // Headings
                if (/^#{1,6}\s+/.test(line)) {
                    const match = line.match(/^(#{1,6})\s+(.+)$/);
                    if (match) {
                        const level = match[1].length;
                        const HeadingTag = `h${level}`;
                        const headingClasses = {
                            1: 'text-2xl font-bold mt-6 mb-3 text-slate-900 dark:text-slate-100',
                            2: 'text-xl font-bold mt-5 mb-3 text-slate-800 dark:text-slate-200',
                            3: 'text-lg font-semibold mt-4 mb-2 text-slate-800 dark:text-slate-200',
                            4: 'text-base font-semibold mt-3 mb-2 text-slate-700 dark:text-slate-300',
                            5: 'text-sm font-semibold mt-3 mb-1 text-slate-700 dark:text-slate-300',
                            6: 'text-sm font-semibold mt-2 mb-1 text-slate-600 dark:text-slate-400'
                        };
                        return React.createElement(HeadingTag, { key: index, className: headingClasses[level] }, formatInlineText(match[2]));
                    }
                }

                // Regular paragraph
                return <p key={index} className="leading-relaxed text-base">{formatInlineText(line)}</p>;
            })}
        </div>
    );
};

const elements = parseContent(content);

// ===== DETERMINE WHAT TO RENDER BASED ON METADATA =====
const renderMetadataContent = () => {
    if (!metadata || !metadata.data || !Array.isArray(metadata.data) || metadata.data.length === 0) {
        return null;
    }

    const data = metadata.data;
    const operation = metadata.operation || '';

    // Check if it's test cases data
    const isTestCaseData = data.some(item =>
        item.hasOwnProperty('testCaseDescription') ||
        item.hasOwnProperty('expectedResult') ||
        item.hasOwnProperty('actualResult') ||
        operation.includes('TEST_CASE')
    );

    // Check if it's bug data
    const isBugData = data.some(item =>
        item.hasOwnProperty('bugDesc') ||
        item.hasOwnProperty('bugRequirement') ||
        item.hasOwnProperty('bugType') ||
        operation.includes('BUG')
    );

    // Render based on data type
    if (isTestCaseData) {
        return renderTestCasesDocument(data);
    }

    if (isBugData) {
        return renderBugsDocument(data);
    }

    return null;
};

return (
    <div className={`${role === 'user' ? 'text-white dark:text-slate-100' : 'text-slate-800 dark:text-slate-200'} font-sans`}>
        {/* Render attachments */}
        {attachments && attachments.length > 0 && renderAttachments(attachments)}

        {/* Render metadata content (test cases, bugs as documents) */}
        {renderMetadataContent()}

        {/* Render parsed content (code blocks and text) */}
        {elements.map((element, index) => {
            switch (element.type) {
                case 'code':
                    return renderCodeBlock(element.code, element.language, index);
                case 'text':
                default:
                    return <div key={element.key}>{renderText(element.content)}</div>;
            }
        })}
    </div>
);
};
export default MessageParser;