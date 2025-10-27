'use client';

import React, { useState } from 'react';
import {
    Copy, Check, FileText, Code, ExternalLink, Bug, CheckCircle,
    ChevronDown, ChevronUp, Download, Calendar, User, Layers,
    AlertTriangle, Flag, Activity, UserCheck, MonitorSmartphone,
    FileCode, Image as ImageIcon, Link as LinkIcon
} from 'lucide-react';

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

    const getPriorityColor = (priority) => {
        const colors = {
            'Critical': 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
            'High': 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
            'Medium': 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
            'Low': 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
        };
        return colors[priority] || colors['Medium'];
    };

    const getStatusColor = (status) => {
        const colors = {
            'Pass': 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
            'Fail': 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
            'Blocked': 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
            'Skipped': 'bg-slate-50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
            'New': 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            'Open': 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            'Fixed': 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
            'Closed': 'bg-slate-50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
        };
        return colors[status] || colors['Open'];
    };

    const renderTestCasesDocument = (testCases) => {
        if (!testCases || !Array.isArray(testCases) || testCases.length === 0) return null;

        const documentContent = testCases.map((tc, index) => `
# Test Case ${index + 1}: ${tc.serialNumber || 'N/A'}

**Module:** ${tc.moduleName || 'N/A'}
**Type:** ${tc.testCaseType || 'N/A'}
**Priority:** ${tc.priority || 'N/A'}
**Severity:** ${tc.severity || 'N/A'}
**Status:** ${tc.status || 'N/A'}
**Reported By:** ${tc.user?.name || 'N/A'}
**Reported Date:** ${tc.createdAt ? new Date(tc.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}

## Test Case Description
${tc.testCaseDescription || 'No description provided'}

## Expected Result
${tc.expectedResult || 'Expected behavior not defined'}

## Actual Result
${tc.actualResult || 'Not executed'}

${tc.image ? `## Attachment\n${tc.image}` : ''}

---
        `).join('\n\n');

        const isCopied = copiedIndex === 'testcases-document';

        return (
            <div className="my-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800   ">
                <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-white">Test Cases Report</span>
                            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs text-white font-medium backdrop-blur-sm">
                                {testCases.length} {testCases.length === 1 ? 'case' : 'cases'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <button
                            onClick={() => downloadAsMarkdown(documentContent, 'test_cases')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white text-emerald-600 rounded-lg text-xs font-semibold transition-all   hover:shadow">
                            <Download className="w-3.5 h-3.5" />
                            Export
                        </button>
                        <button
                            onClick={() => copyToClipboard(documentContent, 'testcases-document')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white text-emerald-600 rounded-lg text-xs font-semibold transition-all   hover:shadow">
                            {isCopied ? <><Check className="w-3.5 h-3.5" />Copied</> : <><Copy className="w-3.5 h-3.5" />Copy</>}
                        </button>
                    </div>
                </div>

                <div className="p-6 h-[100vh] overflow-y-auto sidebar-scrollbar">
                    {testCases.map((tc, index) => (
                        <div key={index} className="mb-6 last:mb-0">
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden   hover:shadow-md transition-shadow">
                                <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 px-5 py-4 border-b border-slate-200 dark:border-slate-600">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                                    {tc.serialNumber || 'N/A'}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                                {tc.moduleName || 'General Module'}
                                            </p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(tc.status)}`}>
                                            {tc.status || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 space-y-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Layers className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Type</span>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{tc.testCaseType || 'N/A'}</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Flag className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Priority</span>
                                            </div>
                                            <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold border ${getPriorityColor(tc.priority)}`}>
                                                {tc.priority || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                                            <div className="flex items-center gap-2 mb-1">
                                                <AlertTriangle className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Severity</span>
                                            </div>
                                            <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold border ${getPriorityColor(tc.severity)}`}>
                                                {tc.severity || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                                            <div className="flex items-center gap-2 mb-1">
                                                <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Reporter</span>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{tc.user?.name || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Description</span>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                            {tc.testCaseDescription || 'No description provided'}
                                        </p>
                                    </div>

                                    <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Expected Result</span>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                            {tc.expectedResult || 'Expected behavior not defined'}
                                        </p>
                                    </div>

                                    <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Activity className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Actual Result</span>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                            {tc.actualResult || 'Not executed'}
                                        </p>
                                    </div>

                                    {tc.image && tc.image !== 'No image provided' && (
                                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                                            <div className="flex items-center gap-2 mb-2">
                                                <ImageIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Attachment</span>
                                            </div>
                                            <a
                                                href={tc.image}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
                                                View Attachment
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                    )}

                                    {tc.createdAt && (
                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-600">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>Reported: {new Date(tc.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderBugsDocument = (bugs) => {
        if (!bugs || !Array.isArray(bugs) || bugs.length === 0) return null;

        const documentContent = bugs.map((bug, index) => `
# Bug ${index + 1}: ${bug.serialNumber || 'N/A'}

**Module:** ${bug.moduleName || 'N/A'}
**Type:** ${bug.bugType || 'N/A'}
**Priority:** ${bug.priority || 'N/A'}
**Severity:** ${bug.severity || 'N/A'}
**Status:** ${bug.status || 'N/A'}
**Reported By:** ${bug.user?.name || 'N/A'}
**Reported Date:** ${bug.createdAt ? new Date(bug.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}

## Bug Description
${bug.bugDesc || 'No description'}

## Requirements
${bug.bugRequirement || 'Not specified'}

${bug.refLinks && bug.refLinks.length > 0 ? `## Reference Links\n${bug.refLinks.map(link => `- ${link}`).join('\n')}` : ''}

${bug.images && bug.images.length > 0 ? `## Attachments\n${bug.images.map(img => `- ${img}`).join('\n')}` : ''}

---
        `).join('\n\n');

        const isCopied = copiedIndex === 'bugs-document';

        return (
            <div className="my-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800   ">
                <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 dark:from-rose-600 dark:to-pink-600">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Bug className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-white">Bug Report</span>
                            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs text-white font-medium backdrop-blur-sm">
                                {bugs.length} {bugs.length === 1 ? 'bug' : 'bugs'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <button
                            onClick={() => downloadAsMarkdown(documentContent, 'bugs')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white text-rose-600 rounded-lg text-xs font-semibold transition-all   hover:shadow">
                            <Download className="w-3.5 h-3.5" />
                            Export
                        </button>
                        <button
                            onClick={() => copyToClipboard(documentContent, 'bugs-document')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white text-rose-600 rounded-lg text-xs font-semibold transition-all   hover:shadow">
                            {isCopied ? <><Check className="w-3.5 h-3.5" />Copied</> : <><Copy className="w-3.5 h-3.5" />Copy</>}
                        </button>
                    </div>
                </div>

                <div className="p-6 h-[100vh] overflow-y-auto sidebar-scrollbar">
                    {bugs.map((bug, index) => (
                        <div key={index} className="mb-6 last:mb-0">
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden   hover:shadow-md transition-shadow">
                                <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 px-5 py-4 border-b border-slate-200 dark:border-slate-600">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Bug className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                                    {bug.serialNumber || 'N/A'}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                                {bug.moduleName || 'General Module'}
                                            </p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(bug.status)}`}>
                                            {bug.status || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 space-y-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Layers className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Type</span>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{bug.bugType || 'N/A'}</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Flag className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Priority</span>
                                            </div>
                                            <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold border ${getPriorityColor(bug.priority)}`}>
                                                {bug.priority || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                                            <div className="flex items-center gap-2 mb-1">
                                                <AlertTriangle className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Severity</span>
                                            </div>
                                            <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold border ${getPriorityColor(bug.severity)}`}>
                                                {bug.severity || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                                            <div className="flex items-center gap-2 mb-1">
                                                <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Reporter</span>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{bug.user?.name || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="bg-rose-50 dark:bg-rose-950/30 rounded-lg p-4 border border-rose-200 dark:border-rose-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">Bug Description</span>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                            {bug.bugDesc || 'No description'}
                                        </p>
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Requirements</span>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                            {bug.bugRequirement || 'Not specified'}
                                        </p>
                                    </div>

                                    {bug.refLinks && bug.refLinks.length > 0 && (
                                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                                            <div className="flex items-center gap-2 mb-2">
                                                <LinkIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Reference Links</span>
                                            </div>
                                            <div className="space-y-1.5">
                                                {bug.refLinks.map((link, i) => (
                                                    <a
                                                        key={i}
                                                        href={link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
                                                        <ImageIcon className="w-3 h-3 flex-shrink-0" />
                                                        Image {i + 1}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {bug.createdAt && (
                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-600">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>Reported: {new Date(bug.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

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
            <div className="my-4 rounded-xl overflow-hidden border border-slate-700 dark:border-slate-600    bg-slate-900 dark:bg-slate-950">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-800 dark:bg-slate-900 border-b border-slate-700 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                            <Code className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-xs text-slate-300 font-semibold uppercase tracking-wide">{language}</span>
                        <span className="text-xs text-slate-500">• {lineCount} lines</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {lineCount > 10 && (
                            <button
                                onClick={() => toggleSection(`code-${index}`)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-xs text-slate-300 font-medium transition-all">
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                {isExpanded ? 'Collapse' : 'Expand'}
                            </button>
                        )}
                        <button
                            onClick={downloadCode}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs text-white font-semibold transition-all  ">
                            <Download className="w-3.5 h-3.5" />
                            Download
                        </button>
                        <button
                            onClick={() => copyToClipboard(code, `code-${index}`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs text-white font-semibold transition-all  ">
                            {isCopied ? <><Check className="w-3.5 h-3.5" />Copied</> : <><Copy className="w-3.5 h-3.5" />Copy</>}
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

    const renderAttachments = (attachments) => {
        if (!attachments || attachments.length === 0) return null;

        return (
            <div className="mt-3 mb-4 flex flex-wrap gap-3">
                {attachments.map((attachment, index) => (
                    <div key={index} className="relative group">
                        {attachment.type === 'image' ? (
                            <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all shadow-md hover:shadow-xl">
                                <img src={attachment.url} alt={attachment.name} className="max-w-xs h-auto" />
                            </a>
                        ) : (
                            <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all   border border-slate-200 dark:border-slate-700">
                                <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
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
                    if (!line.trim()) return <div key={index} className="h-2" />;

                    if (/^(\d+\.|-|\*)\s+/.test(line)) {
                        const match = line.match(/^(\d+\.|-|\*)\s+(.+)$/);
                        if (match) {
                            return (
                                <div key={index} className="flex gap-3 ml-4 items-start">
                                    <span className={role === 'user' ? 'text-blue-300 dark:text-blue-400 font-semibold mt-0.5' : 'text-slate-600 dark:text-slate-400 font-semibold mt-0.5'}>
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

                    return <p key={index} className="leading-relaxed text-base">{formatInlineText(line)}</p>;
                })}
            </div>
        );
    };

    const elements = parseContent(content);

    const renderMetadataContent = () => {
        if (!metadata || !metadata.data || !Array.isArray(metadata.data) || metadata.data.length === 0) {
            return null;
        }

        const data = metadata.data;
        const operation = metadata.operation || '';

        const isTestCaseData = data.some(item =>
            item.hasOwnProperty('testCaseDescription') ||
            item.hasOwnProperty('expectedResult') ||
            item.hasOwnProperty('actualResult') ||
            operation.includes('TEST_CASE')
        );

        const isBugData = data.some(item =>
            item.hasOwnProperty('bugDesc') ||
            item.hasOwnProperty('bugRequirement') ||
            item.hasOwnProperty('bugType') ||
            operation.includes('BUG')
        );

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
            {attachments && attachments.length > 0 && renderAttachments(attachments)}
            {renderMetadataContent()}
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