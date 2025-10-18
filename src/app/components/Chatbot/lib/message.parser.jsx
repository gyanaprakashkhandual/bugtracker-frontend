import React, { useState } from 'react';
import { Copy, Check, FileText, Table, Code, ExternalLink, Bug, CheckCircle, Beaker, ChevronDown, ChevronUp } from 'lucide-react';

const MessageParser = ({ content = '', role, attachments = [] }) => {
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
                        <code key={`code-${index}`} className="px-2 py-0.5 bg-slate-100 text-rose-600 rounded-md text-sm font-mono border border-slate-200">
                            {item.match[1]}
                        </code>
                    );
                    break;
                case 'bold':
                    parts.push(<strong key={`bold-${index}`} className="font-bold text-gray-900">{item.match[1]}</strong>);
                    break;
                case 'italic':
                    parts.push(<em key={`italic-${index}`} className="italic text-gray-700">{item.match[1]}</em>);
                    break;
                case 'link':
                    parts.push(
                        <a key={`link-${index}`} href={item.match[2]} target="_blank" rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 underline decoration-blue-400 underline-offset-2 inline-flex items-center gap-1 font-medium transition-colors">
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

        return (
            <div className="my-4 rounded-xl overflow-hidden border border-slate-200 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-700 rounded-lg">
                            <Code className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                            <span className="text-sm text-slate-200 font-semibold uppercase tracking-wide">{language}</span>
                            <span className="text-xs text-slate-400 ml-2">• {lineCount} lines</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {lineCount > 10 && (
                            <button onClick={() => toggleSection(`code-${index}`)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-slate-200 transition-all">
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                {isExpanded ? 'Collapse' : 'Expand'}
                            </button>
                        )}
                        <button onClick={() => copyToClipboard(code, `code-${index}`)}
                            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm text-white font-medium transition-all shadow-md hover:shadow-lg">
                            {isCopied ? (<><Check className="w-4 h-4" /><span>Copied!</span></>) : (<><Copy className="w-4 h-4" /><span>Copy</span></>)}
                        </button>
                    </div>
                </div>
                <div className={`overflow-x-auto transition-all ${!isExpanded && lineCount > 10 ? 'max-h-64' : 'max-h-[600px]'} overflow-y-auto`}>
                    <pre className="p-5 text-sm text-slate-100 font-mono leading-relaxed">
                        <code>{code}</code>
                    </pre>
                </div>
            </div>
        );
    };

    const detectTableType = (headers) => {
        const headerStr = headers.join(' ').toLowerCase();

        if (headerStr.includes('bug') || headerStr.includes('defect') || headerStr.includes('issue')) {
            return { type: 'bug', icon: Bug, label: 'Bug Report', color: 'rose' };
        }
        if (headerStr.includes('test case') || headerStr.includes('scenario') || headerStr.includes('expected') || headerStr.includes('actual')) {
            return { type: 'testcase', icon: CheckCircle, label: 'Test Cases', color: 'emerald' };
        }
        if (headerStr.includes('test type') || headerStr.includes('framework') || headerStr.includes('automation')) {
            return { type: 'testtype', icon: Beaker, label: 'Test Types', color: 'blue' };
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
            rose: 'from-rose-50 to-rose-100 border-rose-200 text-rose-700',
            emerald: 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700',
            blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-700',
            slate: 'from-slate-50 to-slate-100 border-slate-200 text-slate-700'
        };

        return (
            <div className="my-4 rounded-xl overflow-hidden border-2 border-slate-200 shadow-xl bg-white">
                <div className={`flex items-center justify-between px-5 py-3 bg-gradient-to-r ${colorClasses[tableType.color]} border-b-2`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-sm font-bold">{tableType.label}</span>
                            <span className="text-xs ml-2 opacity-75">• {rows.length} {rows.length === 1 ? 'row' : 'rows'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {rows.length > 5 && (
                            <button onClick={() => toggleSection(`table-${index}`)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium transition-all shadow-sm">
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                {isExpanded ? 'Collapse' : 'Expand'}
                            </button>
                        )}
                        <button onClick={() => copyToClipboard(tableContent, `table-${index}`)}
                            className="flex items-center gap-2 px-4 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white font-medium transition-all shadow-md hover:shadow-lg">
                            {isCopied ? (<><Check className="w-4 h-4" /><span>Copied!</span></>) : (<><Copy className="w-4 h-4" /><span>Copy</span></>)}
                        </button>
                    </div>
                </div>
                <div className={`overflow-x-auto transition-all ${!isExpanded && rows.length > 5 ? 'max-h-80' : 'max-h-[600px]'} overflow-y-auto`}>
                    <table className="w-full">
                        <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
                            <tr>
                                {headers.map((header, idx) => (
                                    <th key={idx} className="px-4 py-3 text-left text-xs font-bold text-slate-700 border-b-2 border-slate-300 uppercase tracking-wider whitespace-nowrap"
                                        style={{ textAlign: alignments[idx] || 'left' }}>
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, rowIdx) => (
                                <tr key={rowIdx} className={`${rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors border-b border-slate-200`}>
                                    {row.map((cell, cellIdx) => {
                                        const cellLower = cell.toLowerCase();
                                        let cellClass = 'px-4 py-3 text-sm text-slate-700';
                                        let badge = false;

                                        if (['critical', 'high', 'medium', 'low', 'new', 'open', 'pending', 'in progress', 'testing', 'fixed', 'closed', 'pass', 'fail', 'failed', 'blocked'].includes(cellLower)) {
                                            badge = true;
                                            cellClass = 'px-4 py-3';
                                        }

                                        const getBadgeClass = (value) => {
                                            const val = value.toLowerCase();
                                            if (val === 'critical') return 'bg-red-100 text-red-700 border-red-300';
                                            if (val === 'high') return 'bg-orange-100 text-orange-700 border-orange-300';
                                            if (val === 'medium') return 'bg-yellow-100 text-yellow-700 border-yellow-300';
                                            if (val === 'low') return 'bg-green-100 text-green-700 border-green-300';
                                            if (['new', 'open', 'pending'].includes(val)) return 'bg-blue-100 text-blue-700 border-blue-300';
                                            if (['in progress', 'testing'].includes(val)) return 'bg-amber-100 text-amber-700 border-amber-300';
                                            if (['fixed', 'closed', 'pass'].includes(val)) return 'bg-emerald-100 text-emerald-700 border-emerald-300';
                                            if (['fail', 'failed', 'blocked'].includes(val)) return 'bg-rose-100 text-rose-700 border-rose-300';
                                            return 'bg-slate-100 text-slate-700 border-slate-300';
                                        };

                                        return (
                                            <td key={cellIdx} className={cellClass} style={{ textAlign: alignments[cellIdx] || 'left' }}>
                                                {badge ? (
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeClass(cell)}`}>
                                                        {cell}
                                                    </span>
                                                ) : (
                                                    <span className="font-medium">{cell}</span>
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
                                className="block rounded-xl overflow-hidden border-2 border-slate-200 hover:border-blue-400 transition-all shadow-md hover:shadow-xl transform hover:scale-105">
                                <img src={attachment.url} alt={attachment.name} className="max-w-sm h-auto" />
                            </a>
                        ) : (
                            <a href={attachment.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-3 px-4 py-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all shadow-sm hover:shadow-md border border-slate-200">
                                <div className="p-2 bg-white rounded-lg">
                                    <FileText className="w-5 h-5 text-slate-600" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">{attachment.name}</span>
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
                                    <span className={role === 'user' ? 'text-blue-300 font-medium' : 'text-slate-600 font-medium mt-0.5'}>
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
                                1: 'text-3xl font-bold mt-6 mb-3 text-slate-900',
                                2: 'text-2xl font-bold mt-5 mb-3 text-slate-800',
                                3: 'text-xl font-semibold mt-4 mb-2 text-slate-800',
                                4: 'text-lg font-semibold mt-3 mb-2 text-slate-700',
                                5: 'text-base font-semibold mt-3 mb-1 text-slate-700',
                                6: 'text-sm font-semibold mt-2 mb-1 text-slate-600'
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
        <div className={`${role === 'user' ? 'text-white' : 'text-slate-800'} font-sans`}>
            {attachments && attachments.length > 0 && renderAttachments(attachments)}
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