'use client';

import React, { useState } from 'react';
import { Copy, Check, FileText, Table, Code, FileCode } from 'lucide-react';

const MessageParser = ({ content = '', role, attachments = [] }) => {
    const [copiedIndex, setCopiedIndex] = useState(null);

    const copyToClipboard = async (text, index) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
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
                elements.push({
                    type: 'text',
                    content: textContent,
                    key: `text-${index}`
                });
            }

            elements.push({
                ...element,
                key: `${element.type}-${index}`
            });

            currentIndex = element.end;
        });

        if (currentIndex < text.length) {
            elements.push({
                type: 'text',
                content: text.substring(currentIndex),
                key: `text-final`
            });
        }

        if (elements.length === 0) {
            elements.push({
                type: 'text',
                content: text,
                key: 'text-only'
            });
        }

        return elements;
    };

    const formatInlineText = (text) => {
        if (!text) return <span></span>;
        let formatted = text;
        const parts = [];
        let lastIndex = 0;

        const patterns = [
            { regex: /```[\s\S]*?```/g, type: 'skip' },
            { regex: /`([^`]+)`/g, type: 'inline-code' },
            { regex: /\*\*(.+?)\*\*/g, type: 'bold' },
            { regex: /\*(.+?)\*/g, type: 'italic' },
            { regex: /\[([^\]]+)\]\(([^)]+)\)/g, type: 'link' },
            { regex: /^(#{1,6})\s+(.+)$/gm, type: 'heading' },
            { regex: /^(\d+\.|-|\*)\s+(.+)$/gm, type: 'list' }
        ];

        const allMatches = [];
        patterns.forEach((pattern) => {
            let match;
            const regex = new RegExp(pattern.regex);
            while ((match = regex.exec(formatted)) !== null) {
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
                parts.push(
                    <span key={`text-${index}`}>{formatted.substring(lastIndex, item.start)}</span>
                );
            }

            switch (item.type) {
                case 'inline-code':
                    parts.push(
                        <code
                            key={`code-${index}`}
                            className="px-1.5 py-0.5 bg-gray-100 text-red-600 rounded text-sm font-mono"
                        >
                            {item.match[1]}
                        </code>
                    );
                    break;
                case 'bold':
                    parts.push(
                        <strong key={`bold-${index}`} className="font-semibold">
                            {item.match[1]}
                        </strong>
                    );
                    break;
                case 'italic':
                    parts.push(
                        <em key={`italic-${index}`} className="italic">
                            {item.match[1]}
                        </em>
                    );
                    break;
                case 'link':
                    parts.push(
                        <a
                            key={`link-${index}`}
                            href={item.match[2]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600 underline"
                        >
                            {item.match[1]}
                        </a>
                    );
                    break;
                case 'heading':
                    const level = item.match[1].length;
                    const HeadingTag = `h${level}`;
                    const headingClasses = {
                        1: 'text-2xl font-bold mt-4 mb-2',
                        2: 'text-xl font-bold mt-3 mb-2',
                        3: 'text-lg font-semibold mt-3 mb-1',
                        4: 'text-base font-semibold mt-2 mb-1',
                        5: 'text-sm font-semibold mt-2 mb-1',
                        6: 'text-xs font-semibold mt-1 mb-1'
                    };
                    parts.push(
                        React.createElement(
                            HeadingTag,
                            { key: `heading-${index}`, className: headingClasses[level] },
                            item.match[2]
                        )
                    );
                    break;
                case 'list':
                    parts.push(
                        <div key={`list-${index}`} className="flex gap-2 my-1">
                            <span className="text-gray-600">{item.match[1]}</span>
                            <span>{item.match[2]}</span>
                        </div>
                    );
                    break;
                default:
                    parts.push(<span key={`default-${index}`}>{item.match[0]}</span>);
            }

            lastIndex = item.end;
        });

        if (lastIndex < formatted.length) {
            parts.push(<span key="text-final">{formatted.substring(lastIndex)}</span>);
        }

        return parts.length > 0 ? parts : <span>{text}</span>;
    };

    const renderCodeBlock = (code, language, index) => {
        const isCopied = copiedIndex === `code-${index}`;

        return (
            <div className="my-4 rounded-lg overflow-hidden border border-gray-200 bg-gray-900">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300 font-mono">{language}</span>
                    </div>
                    <button
                        onClick={() => copyToClipboard(code, `code-${index}`)}
                        className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-200 transition-colors"
                    >
                        {isCopied ? (
                            <>
                                <Check className="w-4 h-4" />
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                <span>Copy</span>
                            </>
                        )}
                    </button>
                </div>
                <div className="p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-100 font-mono leading-relaxed">
                        <code>{code}</code>
                    </pre>
                </div>
            </div>
        );
    };

    const renderTable = (tableContent, index) => {
        const lines = tableContent.trim().split('\n');
        if (lines.length < 3) return null;

        const headers = lines[0]
            .split('|')
            .filter((cell) => cell.trim())
            .map((cell) => cell.trim());

        const alignments = lines[1]
            .split('|')
            .filter((cell) => cell.trim())
            .map((cell) => {
                const trimmed = cell.trim();
                if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
                if (trimmed.endsWith(':')) return 'right';
                return 'left';
            });

        const rows = lines.slice(2).map((line) =>
            line
                .split('|')
                .filter((cell) => cell.trim())
                .map((cell) => cell.trim())
        );

        const isCopied = copiedIndex === `table-${index}`;

        return (
            <div className="my-4 rounded-lg overflow-hidden border border-gray-200">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <Table className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-700 font-medium">Table</span>
                    </div>
                    <button
                        onClick={() => copyToClipboard(tableContent, `table-${index}`)}
                        className="flex items-center gap-2 px-3 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded text-sm text-gray-700 transition-colors"
                    >
                        {isCopied ? (
                            <>
                                <Check className="w-4 h-4" />
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                <span>Copy</span>
                            </>
                        )}
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                {headers.map((header, idx) => (
                                    <th
                                        key={idx}
                                        className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b border-gray-200"
                                        style={{ textAlign: alignments[idx] || 'left' }}
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, rowIdx) => (
                                <tr
                                    key={rowIdx}
                                    className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                >
                                    {row.map((cell, cellIdx) => (
                                        <td
                                            key={cellIdx}
                                            className="px-4 py-2 text-sm text-gray-600 border-b border-gray-100"
                                            style={{ textAlign: alignments[cellIdx] || 'left' }}
                                        >
                                            {cell}
                                        </td>
                                    ))}
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
            <div className="mt-3 flex flex-wrap gap-2">
                {attachments.map((attachment, index) => (
                    <div key={index} className="relative group">
                        {attachment.type === 'image' ? (
                            <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                            >
                                <img
                                    src={attachment.url}
                                    alt={attachment.name}
                                    className="max-w-xs rounded-lg border border-gray-200 hover:border-blue-400 transition-colors cursor-pointer"
                                />
                            </a>
                        ) : (
                            <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <FileText className="w-4 h-4 text-gray-600" />
                                <span className="text-sm text-gray-700">{attachment.name}</span>
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
                    if (!line.trim()) {
                        return <div key={index} className="h-2" />;
                    }

                    if (/^(\d+\.|-|\*)\s+/.test(line)) {
                        const match = line.match(/^(\d+\.|-|\*)\s+(.+)$/);
                        if (match) {
                            return (
                                <div key={index} className="flex gap-2 ml-4">
                                    <span className={role === 'user' ? 'text-blue-200' : 'text-gray-600'}>
                                        {match[1]}
                                    </span>
                                    <span>{formatInlineText(match[2])}</span>
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
                                1: 'text-2xl font-bold mt-4 mb-2',
                                2: 'text-xl font-bold mt-3 mb-2',
                                3: 'text-lg font-semibold mt-3 mb-1',
                                4: 'text-base font-semibold mt-2 mb-1',
                                5: 'text-sm font-semibold mt-2 mb-1',
                                6: 'text-xs font-semibold mt-1 mb-1'
                            };
                            return React.createElement(
                                HeadingTag,
                                { key: index, className: headingClasses[level] },
                                formatInlineText(match[2])
                            );
                        }
                    }

                    return (
                        <p key={index} className="leading-relaxed">
                            {formatInlineText(line)}
                        </p>
                    );
                })}
            </div>
        );
    };

    const elements = parseContent(content);

    return (
        <div className={`${role === 'user' ? 'text-white' : 'text-gray-800'}`}>
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