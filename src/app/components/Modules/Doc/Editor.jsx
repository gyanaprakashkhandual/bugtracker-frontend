'use client';

// DocEditor.jsx - Complete Main Component File

import { motion, AnimatePresence } from 'framer-motion';
import {
    Image, Paperclip, Copy, Trash2, Download, MessageSquare,
    Save, RefreshCw, X, Menu, ZoomIn, ZoomOut, Monitor,
    Eye, Edit3, History, Users, Activity, Settings, Sparkles,
    Tag, Plus, Clock, TrendingUp, Upload, CheckCircle, AlertCircle,
    FileText, Code, Table as TableIcon, CornerDownRight, Check,
    Reply, Send, Maximize2, Globe, Lock, Filter, Search,
    ChevronRight, ChevronDown, MoreVertical, Star, Pin, Archive,
    Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter,
    AlignRight, AlignJustify, Highlighter, Type, Palette
} from 'lucide-react';

// Import all dependencies
import { useDocEditor } from './Hooks';
import * as Utils from './Utils';
import {
    DOCUMENT_CATEGORIES,
    PRIORITY_LEVELS,
    STATUS_OPTIONS,
    TAB_OPTIONS,
    EXPORT_FORMATS
} from './Constant';

// ========================
// NOTIFICATION COMPONENTS
// ========================

const NotificationMessages = ({ success, error }) => (
    <AnimatePresence>
        {success && (
            <motion.div
                initial={{ opacity: 0, y: -20, x: 100 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: -20, x: 100 }}
                className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 z-50 text-sm"
            >
                <CheckCircle size={16} />
                <span>{success}</span>
            </motion.div>
        )}
        {error && (
            <motion.div
                initial={{ opacity: 0, y: -20, x: 100 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: -20, x: 100 }}
                className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 z-50 text-sm"
            >
                <AlertCircle size={16} />
                <span>{error}</span>
            </motion.div>
        )}
    </AnimatePresence>
);

// ========================
// TOP NAVIGATION BAR
// ========================

const TopNavigationBar = ({
    title,
    setTitle,
    document,
    wordCount,
    characterCount,
    status,
    setStatus,
    handleUpdateStatus,
    priority,
    setPriority,
    viewCount,
    collaborators,
    handleFetchCollaborators,
    autoSaveEnabled,
    setAutoSaveEnabled,
    isSaving,
    saveDocument
}) => (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <Menu size={18} className="text-gray-600" />
            </button>
            <FileText size={20} className="text-blue-600" />
            <div className="flex flex-col">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-sm font-medium text-gray-800 bg-transparent border-none outline-none px-1 py-0.5 hover:bg-gray-50 rounded focus:bg-white focus:ring-1 focus:ring-blue-500"
                    placeholder="Untitled Document"
                />
                <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
                    <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {document?.updatedAt ? new Date(document.updatedAt).toLocaleDateString() : 'Not saved'}
                    </span>
                    <span>•</span>
                    <span>{wordCount} words</span>
                    <span>•</span>
                    <span>{characterCount} chars</span>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-2">
            <select
                value={status}
                onChange={(e) => {
                    setStatus(e.target.value);
                    if (document?._id) handleUpdateStatus(e.target.value);
                }}
                className={`text-xs px-2.5 py-1 rounded-full font-medium border ${status === 'published' ? 'bg-green-50 text-green-700 border-green-200' :
                    status === 'draft' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        status === 'archived' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
            >
                {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>

            <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium border ${priority === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                    priority === 'medium' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
            >
                {PRIORITY_LEVELS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>

            <div className="flex items-center gap-1 text-xs text-gray-500 px-2 py-1 bg-gray-50 rounded-lg">
                <Eye size={12} />
                <span>{viewCount}</span>
            </div>

            <button
                onClick={() => {
                    if (document?._id) handleFetchCollaborators();
                }}
                className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-xs font-medium"
            >
                <Users size={12} />
                <span>{collaborators.length}</span>
            </button>

            <button
                onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${autoSaveEnabled ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'
                    }`}
            >
                <RefreshCw size={12} className={autoSaveEnabled ? 'animate-spin' : ''} />
                <span>{autoSaveEnabled ? 'Auto-save ON' : 'Auto-save OFF'}</span>
            </button>

            <button
                onClick={saveDocument}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium disabled:opacity-50"
            >
                <Save size={14} />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>

            <div className="relative">
                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical size={16} className="text-gray-600" />
                </button>
            </div>
        </div>
    </div>
);

// ========================
// SECONDARY TOOLBAR
// ========================

const SecondaryToolbar = ({
    editorRef,
    currentFormat,
    setCurrentFormat,
    showColorPicker,
    setShowColorPicker,
    showBgColorPicker,
    setShowBgColorPicker,
    document,
    handleToggleStar,
    handleTogglePin,
    handleExportDocument,
    handleMultipleImageUpload,
    handleMultipleFileUpload,
    setShowCommentBox,
    setTextFormats,
    setSelectedText,
    setSelectionStart,
    setSelectionEnd,
    showNotification
}) => {
    const applyFormatting = (formatType) => {
        Utils.applyTextFormatting(
            formatType,
            editorRef,
            () => Utils.getSelectedRange(editorRef),
            currentFormat,
            setTextFormats,
            setSelectedText,
            setSelectionStart,
            setSelectionEnd
        );
    };

    return (
        <div className="bg-white border-b border-gray-200 px-4 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1">
                <button
                    onClick={() => applyFormatting('bold')}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="Bold"
                >
                    <Bold size={16} className="text-gray-700" />
                </button>
                <button
                    onClick={() => applyFormatting('italic')}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="Italic"
                >
                    <Italic size={16} className="text-gray-700" />
                </button>
                <button
                    onClick={() => applyFormatting('underline')}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="Underline"
                >
                    <Underline size={16} className="text-gray-700" />
                </button>
                <button
                    onClick={() => applyFormatting('strikethrough')}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="Strikethrough"
                >
                    <Strikethrough size={16} className="text-gray-700" />
                </button>

                <div className="w-px h-5 bg-gray-300 mx-1"></div>

                <button
                    onClick={() => Utils.applyAlignment('left', editorRef, setCurrentFormat)}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="Align Left"
                >
                    <AlignLeft size={16} className="text-gray-700" />
                </button>
                <button
                    onClick={() => Utils.applyAlignment('center', editorRef, setCurrentFormat)}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="Align Center"
                >
                    <AlignCenter size={16} className="text-gray-700" />
                </button>
                <button
                    onClick={() => Utils.applyAlignment('right', editorRef, setCurrentFormat)}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="Align Right"
                >
                    <AlignRight size={16} className="text-gray-700" />
                </button>
                <button
                    onClick={() => Utils.applyAlignment('justify', editorRef, setCurrentFormat)}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="Justify"
                >
                    <AlignJustify size={16} className="text-gray-700" />
                </button>

                <div className="w-px h-5 bg-gray-300 mx-1"></div>

                <select
                    value={currentFormat.fontSize}
                    onChange={(e) => Utils.applyFontSize(parseInt(e.target.value), setCurrentFormat)}
                    className="text-xs px-2 py-1 border border-gray-300 rounded hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32].map(size => (
                        <option key={size} value={size}>{size}px</option>
                    ))}
                </select>

                <div className="relative">
                    <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors flex items-center gap-1"
                        title="Text Color"
                    >
                        <Type size={16} className="text-gray-700" />
                        <div className="w-4 h-1 rounded" style={{ backgroundColor: currentFormat.textColor }}></div>
                    </button>
                    {showColorPicker && (
                        <div className="absolute top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50">
                            <input
                                type="color"
                                value={currentFormat.textColor}
                                onChange={(e) => {
                                    Utils.applyTextColor(e.target.value, setCurrentFormat);
                                    setShowColorPicker(false);
                                }}
                                className="w-24 h-24 cursor-pointer"
                            />
                        </div>
                    )}
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors flex items-center gap-1"
                        title="Background Color"
                    >
                        <Highlighter size={16} className="text-gray-700" />
                        <div className="w-4 h-1 rounded" style={{ backgroundColor: currentFormat.backgroundColor }}></div>
                    </button>
                    {showBgColorPicker && (
                        <div className="absolute top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50">
                            <input
                                type="color"
                                value={currentFormat.backgroundColor}
                                onChange={(e) => {
                                    Utils.applyBackgroundColor(e.target.value, setCurrentFormat);
                                    setShowBgColorPicker(false);
                                }}
                                className="w-24 h-24 cursor-pointer"
                            />
                        </div>
                    )}
                </div>

                <div className="w-px h-5 bg-gray-300 mx-1"></div>

                <button
                    onClick={() => document.getElementById('image-upload').click()}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="Insert Image"
                >
                    <Image size={16} className="text-gray-700" />
                </button>
                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files) handleMultipleImageUpload(e.target.files);
                    }}
                />

                <button
                    onClick={() => document.getElementById('file-upload').click()}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="Attach File"
                >
                    <Paperclip size={16} className="text-gray-700" />
                </button>
                <input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files) handleMultipleFileUpload(e.target.files);
                    }}
                />

                <button
                    onClick={() => setShowCommentBox(true)}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="Add Comment"
                >
                    <MessageSquare size={16} className="text-gray-700" />
                </button>

                <button
                    onClick={() => Utils.removeAllFormatting(editorRef, setTextFormats, showNotification)}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors text-xs px-2"
                    title="Clear Formatting"
                >
                    Clear
                </button>
            </div>

            <div className="flex items-center gap-2">
                {document && (
                    <>
                        <button
                            onClick={() => document._id && handleToggleStar()}
                            className={`p-1.5 rounded transition-colors ${document.starred ? 'text-yellow-500 bg-yellow-50' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            title="Star Document"
                        >
                            <Star size={16} fill={document.starred ? 'currentColor' : 'none'} />
                        </button>
                        <button
                            onClick={() => document._id && handleTogglePin()}
                            className={`p-1.5 rounded transition-colors ${document.pinned ? 'text-blue-500 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            title="Pin Document"
                        >
                            <Pin size={16} fill={document.pinned ? 'currentColor' : 'none'} />
                        </button>
                    </>
                )}

                <div className="relative group">
                    <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                        <Download size={16} className="text-gray-700" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg hidden group-hover:block min-w-[120px] z-50">
                        {EXPORT_FORMATS.map(format => (
                            <button
                                key={format.value}
                                onClick={() => document?._id && handleExportDocument(format.value)}
                                className="w-full px-3 py-1.5 text-xs text-left hover:bg-gray-50 flex items-center gap-2"
                            >
                                <FileText size={12} /> {format.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ========================
// LEFT SIDEBAR
// ========================

const LeftSidebar = ({
    showSidebar,
    activeTab,
    setActiveTab,
    comments,
    suggestions,
    document,
    handleFetchVersions,
    handleDuplicateDocument,
    handleArchiveDocument,
    handleDeleteDocument
}) => (
    <motion.div
        initial={{ width: 240 }}
        animate={{ width: showSidebar ? 240 : 0 }}
        className="bg-white border-r border-gray-200 overflow-hidden"
    >
        <div className="w-60 h-full flex flex-col">
            <div className="p-3 border-b border-gray-200">
                <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search documents..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                <div className="space-y-1">
                    {TAB_OPTIONS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                if (tab.id === 'versions' && document?._id) handleFetchVersions();
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {tab.icon === 'Edit3' && <Edit3 size={14} />}
                            {tab.icon === 'Eye' && <Eye size={14} />}
                            {tab.icon === 'MessageSquare' && <MessageSquare size={14} />}
                            {tab.icon === 'Sparkles' && <Sparkles size={14} />}
                            {tab.icon === 'History' && <History size={14} />}
                            {tab.icon === 'Users' && <Users size={14} />}
                            {tab.icon === 'Image' && <Image size={14} />}
                            {tab.icon === 'Activity' && <Activity size={14} />}
                            {tab.icon === 'Settings' && <Settings size={14} />}
                            <span>{tab.label}</span>
                            {tab.id === 'comments' && comments.length > 0 && (
                                <span className="ml-auto bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{comments.length}</span>
                            )}
                            {tab.id === 'suggestions' && suggestions.length > 0 && (
                                <span className="ml-auto bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{suggestions.length}</span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">Quick Actions</p>
                    <div className="space-y-1">
                        <button
                            onClick={() => {
                                if (document?._id) {
                                    const newTitle = prompt('Enter new title for duplicate:');
                                    if (newTitle) handleDuplicateDocument(newTitle);
                                }
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <Copy size={14} />
                            <span>Duplicate</span>
                        </button>
                        <button
                            onClick={() => {
                                if (document?._id && confirm('Archive this document?')) {
                                    handleArchiveDocument();
                                }
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <Archive size={14} />
                            <span>Archive</span>
                        </button>
                        <button
                            onClick={() => {
                                if (document?._id && confirm('Delete this document permanently?')) {
                                    handleDeleteDocument();
                                }
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <Trash2 size={14} />
                            <span>Delete</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
);

// ========================
// EDITOR TAB
// ========================

const EditorTab = ({
    editorRef,
    title,
    setTitle,
    description,
    setDescription,
    tags,
    handleAddTag,
    handleRemoveTag,
    content,
    handleContentChange,
    currentFormat,
    images,
    document,
    handleDeleteImage,
    codeBlocks,
    handleDeleteCodeBlock,
    handleCopyCodeBlock,
    tables,
    handleDeleteTable,
    updateCursorStats,
    handleImageFromClipboard
}) => {
    const handleEditorInput = (e) => {
        const text = e.currentTarget.textContent || '';
        handleContentChange(text);
    };

    const handleEditorKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            const selection = window.getSelection();
            const range = selection.getRangeAt(0);

            const br = document.createElement('br');
            range.deleteContents();
            range.insertNode(br);

            range.setStartAfter(br);
            range.setEndAfter(br);
            range.collapse(true);

            selection.removeAllRanges();
            selection.addRange(range);

            const text = editorRef.current.textContent || '';
            handleContentChange(text);
            updateCursorStats();
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 min-h-[800px]">
                <div className="p-12">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Document Title"
                        className="w-full text-3xl font-bold text-gray-900 border-none outline-none mb-2 placeholder-gray-300"
                    />
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add a description..."
                        className="w-full text-sm text-gray-600 border-none outline-none mb-6 placeholder-gray-300"
                    />

                    <div className="flex flex-wrap gap-2 mb-6">
                        {tags.map((tag, idx) => (
                            <span
                                key={`tag-${idx}-${tag}`}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                            >
                                <Tag size={10} />
                                {tag}
                                <button
                                    onClick={() => handleRemoveTag(tag)}
                                    className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
                                >
                                    <X size={10} />
                                </button>
                            </span>
                        ))}
                        <button
                            onClick={() => {
                                const tag = prompt('Enter tag:');
                                if (tag) handleAddTag(tag);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 border border-dashed border-gray-300 text-gray-500 rounded-full text-xs hover:border-blue-400 hover:text-blue-600"
                        >
                            <Plus size={10} />
                            Add Tag
                        </button>
                    </div>

                    <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleEditorInput}
                        onKeyDown={handleEditorKeyDown}
                        onSelect={updateCursorStats}
                        onPaste={handleImageFromClipboard}
                        className="min-h-[600px] text-sm text-gray-800 leading-relaxed outline-none focus:outline-none"
                        style={{
                            fontFamily: currentFormat.fontFamily,
                            fontSize: `${currentFormat.fontSize}px`,
                            lineHeight: currentFormat.lineHeight,
                            textAlign: currentFormat.textAlign,
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word'
                        }}
                        suppressContentEditableWarning
                    >
                        {content}
                    </div>

                    {images.length > 0 && (
                        <div className="mt-6 space-y-4">
                            {images.map((img) => (
                                <div key={`image-${img._id}`} className="relative group">
                                    <img
                                        src={img.url}
                                        alt={img.altText || 'Document image'}
                                        className="max-w-full rounded-lg border border-gray-200"
                                    />
                                    {img.caption && (
                                        <p className="text-xs text-gray-600 italic mt-1">{img.caption}</p>
                                    )}
                                    <button
                                        onClick={() => document?._id && handleDeleteImage(img._id)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {codeBlocks.length > 0 && (
                        <div className="mt-6 space-y-4">
                            {codeBlocks.map((cb) => (
                                <div key={`codeblock-${cb._id}`} className="relative group">
                                    <div className="bg-gray-900 rounded-lg overflow-hidden">
                                        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                                            <span className="text-xs text-gray-300">{cb.language}</span>
                                            <button
                                                onClick={() => document?._id && handleCopyCodeBlock(cb._id)}
                                                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-300 hover:text-white transition-colors"
                                            >
                                                <Copy size={12} />
                                                Copy
                                            </button>
                                        </div>
                                        <pre className="p-4 overflow-x-auto">
                                            <code className="text-xs text-gray-100 font-mono">{cb.code}</code>
                                        </pre>
                                    </div>
                                    <button
                                        onClick={() => document?._id && handleDeleteCodeBlock(cb._id)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {tables.length > 0 && (
                        <div className="mt-6 space-y-4">
                            {tables.map((table) => (
                                <div key={`table-${table._id}`} className="relative group overflow-x-auto">
                                    <table className="w-full border-collapse border border-gray-300 text-xs">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                {table.headers?.map((header, idx) => (
                                                    <th key={`header-${idx}`} className="border border-gray-300 px-3 py-2 text-left font-semibold">
                                                        {header}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {table.rows?.map((row, rowIdx) => (
                                                <tr key={`row-${rowIdx}`}>
                                                    {row.map((cell, cellIdx) => (
                                                        <td key={`cell-${rowIdx}-${cellIdx}`} className="border border-gray-300 px-3 py-2">
                                                            {cell}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <button
                                        onClick={() => document?._id && handleDeleteTable(table._id)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ========================
// PREVIEW TAB
// ========================

const PreviewTab = ({ title, description, tags, content, images }) => (
    <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 min-h-[800px] p-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            {description && (
                <p className="text-sm text-gray-600 mb-6">{description}</p>
            )}

            <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag, idx) => (
                    <span key={`preview-tag-${idx}`} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                        {tag}
                    </span>
                ))}
            </div>

            <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />
            </div>

            {images.length > 0 && (
                <div className="mt-6 space-y-4">
                    {images.map((img) => (
                        <div key={`preview-image-${img._id}`}>
                            <img src={img.url} alt={img.altText} className="max-w-full rounded-lg" />
                            {img.caption && <p className="text-xs text-gray-600 italic mt-1">{img.caption}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
);

// ========================
// COMMENTS TAB
// ========================

const CommentsTab = ({
    comments,
    document,
    setShowCommentBox,
    handleResolveComment,
    handleDeleteComment,
    replyingTo,
    setReplyingTo,
    replyText,
    setReplyText,
    handleReplyToComment
}) => (
    <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Comments</h2>
                <button
                    onClick={() => setShowCommentBox(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                    <Plus size={16} />
                    New Comment
                </button>
            </div>

            <div className="space-y-4">
                {comments.map((comment) => (
                    <motion.div
                        key={`comment-${comment._id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg border border-gray-200 p-4"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                    {comment.userId?.name?.[0] || 'U'}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{comment.userId?.name || 'Anonymous'}</p>
                                    <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {comment.resolved ? (
                                    <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">Resolved</span>
                                ) : (
                                    <button
                                        onClick={() => document?._id && handleResolveComment(comment._id)}
                                        className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        Resolve
                                    </button>
                                )}
                                <button
                                    onClick={() => document?._id && handleDeleteComment(comment._id)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{comment.text}</p>

                        {comment.replies && comment.replies.length > 0 && (
                            <div className="ml-8 space-y-2 mt-3 pt-3 border-t border-gray-100">
                                {comment.replies.map((reply, idx) => (
                                    <div key={`reply-${comment._id}-${idx}`} className="flex items-start gap-2">
                                        <CornerDownRight size={14} className="text-gray-400 mt-1" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-xs font-semibold text-gray-900">{reply.userId?.name || 'Anonymous'}</p>
                                                <p className="text-xs text-gray-500">{new Date(reply.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <p className="text-xs text-gray-700">{reply.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {replyingTo === comment._id ? (
                            <div className="ml-8 mt-3">
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Write a reply..."
                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows={2}
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                    <button
                                        onClick={() => {
                                            setReplyingTo(null);
                                            setReplyText('');
                                        }}
                                        className="px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleReplyToComment(comment._id, { text: replyText })}
                                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    >
                                        Reply
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setReplyingTo(comment._id)}
                                className="ml-8 mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                            >
                                <Reply size={12} />
                                Reply
                            </button>
                        )}
                    </motion.div>
                ))}

                {comments.length === 0 && (
                    <div className="text-center py-12">
                        <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-sm text-gray-500">No comments yet</p>
                        <p className="text-xs text-gray-400 mt-1">Be the first to add a comment</p>
                    </div>
                )}
            </div>
        </div>
    </div>
);

// ========================
// SUGGESTIONS TAB
// ========================

const SuggestionsTab = ({
    suggestions,
    document,
    setShowSuggestionBox,
    handleAcceptSuggestion,
    handleRejectSuggestion
}) => (
    <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Suggestions</h2>
                <button
                    onClick={() => setShowSuggestionBox(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                >
                    <Sparkles size={16} />
                    New Suggestion
                </button>
            </div>

            <div className="space-y-4">
                {suggestions.map((suggestion) => (
                    <motion.div
                        key={`suggestion-${suggestion._id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg border border-gray-200 p-4"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-purple-600" />
                                <div>
                                    <p className="text-xs text-gray-500">Suggested by {suggestion.userId?.name || 'Anonymous'}</p>
                                    <p className="text-xs text-gray-400">{new Date(suggestion.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${suggestion.status === 'accepted' ? 'bg-green-50 text-green-700' :
                                suggestion.status === 'rejected' ? 'bg-red-50 text-red-700' :
                                    'bg-yellow-50 text-yellow-700'
                                }`}>
                                {suggestion.status}
                            </span>
                        </div>

                        <div className="space-y-2 mb-3">
                            <div className="bg-red-50 border border-red-200 rounded p-2">
                                <p className="text-xs text-gray-500 mb-1">Original:</p>
                                <p className="text-sm text-gray-900 line-through">{suggestion.originalText}</p>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded p-2">
                                <p className="text-xs text-gray-500 mb-1">Suggested:</p>
                                <p className="text-sm text-gray-900">{suggestion.suggestedText}</p>
                            </div>
                        </div>

                        {suggestion.description && (
                            <p className="text-xs text-gray-600 mb-3">{suggestion.description}</p>
                        )}

                        {suggestion.status === 'pending' && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => document?._id && handleAcceptSuggestion(suggestion._id)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs"
                                >
                                    <Check size={12} />
                                    Accept
                                </button>
                                <button
                                    onClick={() => document?._id && handleRejectSuggestion(suggestion._id)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs"
                                >
                                    <X size={12} />
                                    Reject
                                </button>
                            </div>
                        )}
                    </motion.div>
                ))}

                {suggestions.length === 0 && (
                    <div className="text-center py-12">
                        <Sparkles size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-sm text-gray-500">No suggestions yet</p>
                    </div>
                )}
            </div>
        </div>
    </div>
);

// ========================
// VERSIONS TAB
// ========================

const VersionsTab = ({
    versions,
    document,
    setShowVersionModal,
    handleRestoreVersion
}) => (
    <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Version History</h2>
                <button
                    onClick={() => setShowVersionModal(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                    <Plus size={16} />
                    Create Version
                </button>
            </div>

            <div className="space-y-3">
                {versions.map((version, idx) => (
                    <motion.div
                        key={`version-${version._id || idx}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <History size={16} className="text-blue-600" />
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        {version.versionName || `Version ${version.versionNumber}`}
                                    </h3>
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                        v{version.versionNumber}
                                    </span>
                                </div>
                                {version.description && (
                                    <p className="text-xs text-gray-600 mb-2">{version.description}</p>
                                )}
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span>{new Date(version.createdAt).toLocaleString()}</span>
                                    <span>•</span>
                                    <span>By {version.createdBy?.name || 'Unknown'}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (document?._id && confirm(`Restore to version ${version.versionNumber}?`)) {
                                        handleRestoreVersion(version.versionNumber);
                                    }
                                }}
                                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Restore
                            </button>
                        </div>
                    </motion.div>
                ))}

                {versions.length === 0 && (
                    <div className="text-center py-12">
                        <History size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-sm text-gray-500">No version history</p>
                    </div>
                )}
            </div>
        </div>
    </div>
);

// ========================
// COLLABORATORS TAB
// ========================

const CollaboratorsTab = ({
    collaborators,
    currentEditors,
    document,
    setShowCollaboratorBox,
    handleUpdateCollaboratorPermission,
    handleRemoveCollaborator
}) => (
    <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Collaborators</h2>
                <button
                    onClick={() => setShowCollaboratorBox(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                >
                    <Plus size={16} />
                    Add Collaborator
                </button>
            </div>

            {currentEditors.length > 0 && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-green-900 mb-3">Currently Editing</h3>
                    <div className="space-y-2">
                        {currentEditors.map((editor, idx) => (
                            <div key={`editor-${editor.userId || idx}`} className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-green-800">{editor.userId?.name || 'Anonymous'}</span>
                                <span className="text-xs text-green-600">• Line {editor.lineNumber}, Col {editor.columnNumber}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {collaborators.map((collab) => (
                    <motion.div
                        key={`collaborator-${collab._id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg border border-gray-200 p-4"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                    {collab.userId?.name?.[0] || 'U'}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{collab.userId?.name || 'Anonymous'}</p>
                                    <p className="text-xs text-gray-500">{collab.userId?.email || 'No email'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    value={collab.permission}
                                    onChange={(e) => {
                                        if (document?._id) {
                                            handleUpdateCollaboratorPermission(collab._id, { permission: e.target.value });
                                        }
                                    }}
                                    className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="view">View</option>
                                    <option value="comment">Comment</option>
                                    <option value="edit">Edit</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <button
                                    onClick={() => {
                                        if (document?._id && confirm('Remove this collaborator?')) {
                                            handleRemoveCollaborator(collab._id);
                                        }
                                    }}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {collaborators.length === 0 && (
                    <div className="text-center py-12">
                        <Users size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-sm text-gray-500">No collaborators yet</p>
                    </div>
                )}
            </div>
        </div>
    </div>
);

// ========================
// MEDIA TAB
// ========================

const MediaTab = ({
    images, attachments, document,
    handleMultipleImageUpload, handleMultipleFileUpload, handleVideoUpload,
    handleDeleteImage, handleDeleteAttachment, handleDownloadAttachment,
    showNotification
}) => (
    <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Media & Files</h2>

            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => document.getElementById('media-image-upload').click()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                    <Image size={16} />
                    Upload Images
                </button>
                <input
                    id="media-image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files) handleMultipleImageUpload(e.target.files);
                    }}
                />
                <button
                    onClick={() => document.getElementById('media-file-upload').click()}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                >
                    <Paperclip size={16} />
                    Upload Files
                </button>
                <input
                    id="media-file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files) handleMultipleFileUpload(e.target.files);
                    }}
                />
                <button
                    onClick={() => document.getElementById('media-video-upload').click()}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                    <Monitor size={16} />
                    Upload Video
                </button>
                <input
                    id="media-video-upload"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files?.[0]) handleVideoUpload(e.target.files[0]);
                    }}
                />
            </div>

            {images.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Images ({images.length})</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((img) => (
                            <motion.div
                                key={`media-image-${img._id}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative group bg-white rounded-lg border border-gray-200 overflow-hidden"
                            >
                                <img
                                    src={img.url}
                                    alt={img.altText}
                                    className="w-full h-40 object-cover"
                                />
                                <div className="p-2">
                                    <p className="text-xs text-gray-600 truncate">{img.caption || 'No caption'}</p>
                                    <p className="text-xs text-gray-400">{(img.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <button
                                        onClick={() => Utils.copyToClipboard(img.url, showNotification)}
                                        className="p-1.5 bg-blue-600 text-white rounded shadow-lg hover:bg-blue-700"
                                    >
                                        <Copy size={12} />
                                    </button>
                                    <button
                                        onClick={() => document?._id && handleDeleteImage(img._id)}
                                        className="p-1.5 bg-red-600 text-white rounded shadow-lg hover:bg-red-700"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {attachments.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Attachments ({attachments.length})</h3>
                    <div className="space-y-2">
                        {attachments.map((att) => (
                            <motion.div
                                key={`attachment-${att._id}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white rounded-lg border border-gray-200 p-3 flex items-center justify-between hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                        <Paperclip size={18} className="text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{att.name}</p>
                                        <p className="text-xs text-gray-500">{att.fileType?.toUpperCase()} • {(att.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => document?._id && handleDownloadAttachment(att._id)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    >
                                        <Download size={16} />
                                    </button>
                                    <button
                                        onClick={() => document?._id && handleDeleteAttachment(att._id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {images.length === 0 && attachments.length === 0 && (
                <div className="text-center py-16">
                    <Image size={64} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-sm text-gray-500">No media or files yet</p>
                    <p className="text-xs text-gray-400 mt-1">Upload images, files, or add code blocks to get started</p>
                </div>
            )}
        </div>
    </div>
);

// ========================
// ANALYTICS TAB
// ========================

const AnalyticsTab = ({
    viewCount, comments, collaborators, currentEditors, versions, accessLogs,
    document, handleFetchStats, handleFetchAccessLogs
}) => (
    <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Analytics & Activity</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600">Total Views</span>
                        <Eye size={16} className="text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{viewCount}</p>
                    <p className="text-xs text-gray-500 mt-1">All time</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600">Comments</span>
                        <MessageSquare size={16} className="text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{comments.length}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {comments.filter(c => !c.resolved).length} unresolved
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600">Collaborators</span>
                        <Users size={16} className="text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{collaborators.length}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {currentEditors.length} active now
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600">Versions</span>
                        <History size={16} className="text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{versions.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Snapshots saved</p>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
                    <button
                        onClick={() => document?._id && handleFetchAccessLogs(50)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <RefreshCw size={12} />
                        Refresh
                    </button>
                </div>

                <div className="space-y-2">
                    {accessLogs.map((log, idx) => (
                        <motion.div
                            key={`access-log-${log._id || idx}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className="flex items-center gap-3 py-2 px-3 hover:bg-gray-50 rounded-lg"
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${log.action === 'view' ? 'bg-blue-100' :
                                log.action === 'edit' ? 'bg-green-100' :
                                    log.action === 'comment' ? 'bg-purple-100' :
                                        'bg-gray-100'
                                }`}>
                                {log.action === 'view' && <Eye size={14} className="text-blue-600" />}
                                {log.action === 'edit' && <Edit3 size={14} className="text-green-600" />}
                                {log.action === 'comment' && <MessageSquare size={14} className="text-purple-600" />}
                                {log.action === 'download' && <Download size={14} className="text-gray-600" />}
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-900">
                                    {log.userId?.name || 'Anonymous'} {log.action}ed the document
                                </p>
                                <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${log.action === 'view' ? 'bg-blue-50 text-blue-700' :
                                log.action === 'edit' ? 'bg-green-50 text-green-700' :
                                    log.action === 'comment' ? 'bg-purple-50 text-purple-700' :
                                        'bg-gray-50 text-gray-700'
                                }`}>
                                {log.action}
                            </span>
                        </motion.div>
                    ))}

                    {accessLogs.length === 0 && (
                        <div className="text-center py-8">
                            <Activity size={40} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-xs text-gray-500">No activity logs yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
);

// ========================
// SETTINGS TAB
// ========================

const SettingsTab = ({
    category, setCategory, isPublic, setIsPublic, autoSaveEnabled, setAutoSaveEnabled,
    currentFormat, setCurrentFormat, document, handleArchiveDocument, handleDeleteDocument,
    saveDocument
}) => (
    <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Document Settings</h2>

            <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">General</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {DOCUMENT_CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <div>
                                    <span className="text-sm font-medium text-gray-900">Public Document</span>
                                    <p className="text-xs text-gray-500">Anyone with the link can view this document</p>
                                </div>
                            </label>
                        </div>

                        <div>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={autoSaveEnabled}
                                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <div>
                                    <span className="text-sm font-medium text-gray-900">Auto-save</span>
                                    <p className="text-xs text-gray-500">Automatically save changes every 30 seconds</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Editor Preferences</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">Default Font Size</label>
                            <input
                                type="range"
                                min="10"
                                max="24"
                                value={currentFormat.fontSize}
                                onChange={(e) => setCurrentFormat(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                                className="w-full"
                            />
                            <span className="text-xs text-gray-600">{currentFormat.fontSize}px</span>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">Line Height</label>
                            <input
                                type="range"
                                min="1"
                                max="2.5"
                                step="0.1"
                                value={currentFormat.lineHeight}
                                onChange={(e) => setCurrentFormat(prev => ({ ...prev, lineHeight: parseFloat(e.target.value) }))}
                                className="w-full"
                            />
                            <span className="text-xs text-gray-600">{currentFormat.lineHeight}</span>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">Font Family</label>
                            <select
                                value={currentFormat.fontFamily}
                                onChange={(e) => setCurrentFormat(prev => ({ ...prev, fontFamily: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Arial">Arial</option>
                                <option value="Helvetica">Helvetica</option>
                                <option value="Times New Roman">Times New Roman</option>
                                <option value="Georgia">Georgia</option>
                                <option value="Courier New">Courier New</option>
                                <option value="Verdana">Verdana</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-red-200 p-6">
                    <h3 className="text-sm font-semibold text-red-900 mb-4">Danger Zone</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-3 border-b border-red-100">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Archive Document</p>
                                <p className="text-xs text-gray-500">Hide this document from active lists</p>
                            </div>
                            <button
                                onClick={() => {
                                    if (document?._id && confirm('Archive this document?')) {
                                        handleArchiveDocument();
                                    }
                                }}
                                className="px-3 py-1.5 text-xs text-orange-700 border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors"
                            >
                                Archive
                            </button>
                        </div>

                        <div className="flex items-center justify-between py-3">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Delete Document</p>
                                <p className="text-xs text-gray-500">Permanently delete this document and all its data</p>
                            </div>
                            <button
                                onClick={() => {
                                    if (document?._id && confirm('Are you sure? This action cannot be undone!')) {
                                        handleDeleteDocument();
                                    }
                                }}
                                className="px-3 py-1.5 text-xs text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={saveDocument}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                        Save All Settings
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// ========================
// RIGHT SIDEBAR
// ========================

const RightSidebar = ({
    cursorPosition, wordCount, characterCount, images, attachments, comments,
    textFormats, currentEditors, document, content, collaborators, showNotification
}) => (
    <div className="w-48 bg-white border-l border-gray-200 p-4 overflow-y-auto hidden lg:block">
        <div className="space-y-4">
            <div>
                <h3 className="text-xs font-semibold text-gray-700 mb-2">Cursor Position</h3>
                <div className="text-xs text-gray-600 space-y-1">
                    <p>Line: {cursorPosition.line + 1}</p>
                    <p>Column: {cursorPosition.column + 1}</p>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-700 mb-2">Document Stats</h3>
                <div className="text-xs text-gray-600 space-y-1">
                    <p>Words: {wordCount}</p>
                    <p>Characters: {characterCount}</p>
                    <p>Images: {images.length}</p>
                    <p>Attachments: {attachments.length}</p>
                    <p>Comments: {comments.length}</p>
                </div>
            </div>

            {textFormats.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-700 mb-2">Active Formats</h3>
                    <div className="flex flex-wrap gap-1">
                        {[...new Set(textFormats.map(f => f.format))].map((format, idx) => (
                            <span
                                key={`format-${idx}`}
                                className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px]"
                            >
                                {format}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {currentEditors.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-700 mb-2">Active Users</h3>
                    <div className="space-y-2">
                        {currentEditors.map((editor, idx) => (
                            <div key={`active-editor-${editor.userId || idx}`} className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-gray-600 truncate">
                                    {editor.userId?.name || 'User'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="pt-4 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-700 mb-2">Quick Actions</h3>
                <div className="space-y-1">
                    <button
                        onClick={() => window.print()}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded transition-colors"
                    >
                        <Monitor size={12} />
                        Print
                    </button>
                    <button
                        onClick={() => Utils.copyToClipboard(content, showNotification)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded transition-colors"
                    >
                        <Copy size={12} />
                        Copy All
                    </button>
                    <button
                        onClick={() => {
                            if (document?._id) {
                                const stats = `Words: ${wordCount}\nCharacters: ${characterCount}\nComments: ${comments.length}\nCollaborators: ${collaborators.length}`;
                                alert(stats);
                            }
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded transition-colors"
                    >
                        <TrendingUp size={12} />
                        Stats
                    </button>
                </div>
            </div>

            {document?.createdAt && (
                <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-700 mb-2">Document Info</h3>
                    <div className="text-xs text-gray-600 space-y-1">
                        <p className="flex items-center gap-1">
                            <Clock size={10} />
                            Created: {new Date(document.createdAt).toLocaleDateString()}
                        </p>
                        <p className="flex items-center gap-1">
                            <RefreshCw size={10} />
                            Updated: {new Date(document.updatedAt).toLocaleDateString()}
                        </p>
                        {document.owner && (
                            <p className="flex items-center gap-1">
                                <Users size={10} />
                                Owner: {document.owner.name}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    </div>
);

// ========================
// BOTTOM STATUS BAR
// ========================

const BottomStatusBar = ({
    isSaving, isLoading, document, cursorPosition, wordCount, characterCount,
    autoSaveEnabled, currentFormat, editorRef, setCurrentFormat
}) => (
    <div className="bg-white border-t border-gray-200 px-4 py-1.5 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
                <Activity size={12} />
                {isSaving ? 'Saving...' : isLoading ? 'Loading...' : 'Ready'}
            </span>
            {document?._id && (
                <span className="text-gray-400">ID: {document._id.slice(-8)}</span>
            )}
        </div>

        <div className="flex items-center gap-4">
            <span>Line {cursorPosition.line + 1}, Col {cursorPosition.column + 1}</span>
            <span>•</span>
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{characterCount} characters</span>
            {autoSaveEnabled && (
                <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-green-600">
                        <RefreshCw size={10} />
                        Auto-save ON
                    </span>
                </>
            )}
        </div>

        <div className="flex items-center gap-2">
            <button
                onClick={() => {
                    if (editorRef.current) {
                        editorRef.current.style.fontSize = `${Math.max(10, currentFormat.fontSize - 2)}px`;
                        setCurrentFormat(prev => ({ ...prev, fontSize: Math.max(10, prev.fontSize - 2) }));
                    }
                }}
                className="p-1 hover:bg-gray-100 rounded"
                title="Zoom Out"
            >
                <ZoomOut size={12} />
            </button>
            <span className="text-xs">{currentFormat.fontSize}px</span>
            <button
                onClick={() => {
                    if (editorRef.current) {
                        editorRef.current.style.fontSize = `${Math.min(32, currentFormat.fontSize + 2)}px`;
                        setCurrentFormat(prev => ({ ...prev, fontSize: Math.min(32, prev.fontSize + 2) }));
                    }
                }}
                className="p-1 hover:bg-gray-100 rounded"
                title="Zoom In"
            >
                <ZoomIn size={12} />
            </button>
        </div>
    </div>
);

// ========================
// FLOATING ACTION BUTTONS
// ========================

const FloatingActionButtons = ({
    showSidebar, setShowSidebar, setShowCommentBox, comments, isSaving, saveDocument
}) => (
    <div className="fixed bottom-6 left-6 flex flex-col gap-2 z-40">
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSidebar(!showSidebar)}
            className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center"
            title={showSidebar ? 'Hide Sidebar' : 'Show Sidebar'}
        >
            {showSidebar ? <X size={20} /> : <Menu size={20} />}
        </motion.button>

        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowCommentBox(true)}
            className="w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 flex items-center justify-center relative"
            title="Add Comment"
        >
            <MessageSquare size={20} />
            {comments.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {comments.length}
                </span>
            )}
        </motion.button>

        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={saveDocument}
            disabled={isSaving}
            className="w-12 h-12 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 flex items-center justify-center disabled:opacity-50"
            title="Save Document"
        >
            {isSaving ? (
                <RefreshCw size={20} className="animate-spin" />
            ) : (
                <Save size={20} />
            )}
        </motion.button>
    </div>
);

// ========================
// MODALS
// ========================

const CommentModal = ({ showCommentBox, setShowCommentBox, commentText, setCommentText, handleCommentCreate }) => (
    <AnimatePresence>
        {showCommentBox && (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed bottom-6 right-6 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-50"
            >
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Add Comment</h3>
                    <button
                        onClick={() => setShowCommentBox(false)}
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <X size={16} className="text-gray-600" />
                    </button>
                </div>
                <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write your comment..."
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                />
                <div className="flex justify-end gap-2 mt-3">
                    <button
                        onClick={() => {
                            setShowCommentBox(false);
                            setCommentText('');
                        }}
                        className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCommentCreate}
                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Add Comment
                    </button>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

const SuggestionModal = ({
    showSuggestionBox, setShowSuggestionBox, suggestionText, setSuggestionText,
    suggestionDescription, setSuggestionDescription, handleSuggestionCreate
}) => (
    <AnimatePresence>
        {showSuggestionBox && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowSuggestionBox(false)}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Suggestion</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Suggested Text</label>
                            <textarea
                                value={suggestionText}
                                onChange={(e) => setSuggestionText(e.target.value)}
                                placeholder="Enter your suggested text..."
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                rows={3}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Description (Optional)</label>
                            <textarea
                                value={suggestionDescription}
                                onChange={(e) => setSuggestionDescription(e.target.value)}
                                placeholder="Why are you suggesting this change?"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                rows={2}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            onClick={() => {
                                setShowSuggestionBox(false);
                                setSuggestionText('');
                                setSuggestionDescription('');
                            }}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSuggestionCreate}
                            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Add Suggestion
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

const VersionModal = ({
    showVersionModal, setShowVersionModal, versionName, setVersionName,
    versionDescription, setVersionDescription, handleVersionCreate
}) => (
    <AnimatePresence>
        {showVersionModal && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowVersionModal(false)}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Version Snapshot</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Version Name</label>
                            <input
                                type="text"
                                value={versionName}
                                onChange={(e) => setVersionName(e.target.value)}
                                placeholder="e.g., Final Draft, Review Version"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={versionDescription}
                                onChange={(e) => setVersionDescription(e.target.value)}
                                placeholder="What changed in this version?"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                rows={3}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            onClick={() => {
                                setShowVersionModal(false);
                                setVersionName('');
                                setVersionDescription('');
                            }}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleVersionCreate}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Create Version
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

const CollaboratorModal = ({
    showCollaboratorBox, setShowCollaboratorBox, collaboratorEmail, setCollaboratorEmail,
    collaboratorPermission, setCollaboratorPermission, handleCollaboratorAdd
}) => (
    <AnimatePresence>
        {showCollaboratorBox && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowCollaboratorBox(false)}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Collaborator</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Email or User ID</label>
                            <input
                                type="text"
                                value={collaboratorEmail}
                                onChange={(e) => setCollaboratorEmail(e.target.value)}
                                placeholder="user@example.com"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Permission Level</label>
                            <select
                                value={collaboratorPermission}
                                onChange={(e) => setCollaboratorPermission(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="view">View Only</option>
                                <option value="comment">Can Comment</option>
                                <option value="edit">Can Edit</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            onClick={() => {
                                setShowCollaboratorBox(false);
                                setCollaboratorEmail('');
                                setCollaboratorPermission('view');
                            }}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCollaboratorAdd}
                            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Add Collaborator
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

const LoadingOverlay = ({ isLoading }) => (
    <AnimatePresence>
        {isLoading && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
            >
                <div className="bg-white rounded-lg shadow-2xl p-6 flex flex-col items-center gap-3">
                    <RefreshCw size={32} className="text-blue-600 animate-spin" />
                    <p className="text-sm font-medium text-gray-900">Loading...</p>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

// ========================
// MAIN DOC EDITOR COMPONENT
// ========================

const DocEditor = ({ docId = null, onSave = null }) => {
    const {
        document, content, title, description, category, priority, status, tags, isPublic,
        activeTab, isLoading, error, success, isSaving,
        selectedText, selectionStart, selectionEnd, textFormats, currentFormat,
        comments, showCommentBox, commentText, replyingTo, replyText,
        suggestions, showSuggestionBox, suggestionText, suggestionDescription,
        versions, showVersionModal, versionName, versionDescription,
        collaborators, currentEditors, showCollaboratorBox, collaboratorEmail, collaboratorPermission,
        showColorPicker, showBgColorPicker, showSidebar,
        images, attachments, tables, codeBlocks,
        accessLogs, viewCount,
        cursorPosition, autoSaveEnabled, wordCount, characterCount,
        editorRef,
        setContent, setTitle, setDescription, setCategory, setPriority, setStatus, setTags, setIsPublic,
        setActiveTab, setShowCommentBox, setCommentText, setReplyingTo, setReplyText,
        setShowSuggestionBox, setSuggestionText, setSuggestionDescription,
        setShowVersionModal, setVersionName, setVersionDescription,
        setShowCollaboratorBox, setCollaboratorEmail, setCollaboratorPermission,
        setShowColorPicker, setShowBgColorPicker, setShowSidebar,
        setCursorPosition, setAutoSaveEnabled, setCurrentFormat, setTextFormats,
        setSelectedText, setSelectionStart, setSelectionEnd,
        saveDocument, handleContentChange, handleAddTag, handleRemoveTag,
        handleAddComment, handleReplyToComment, handleResolveComment, handleDeleteComment,
        handleAddSuggestion, handleAcceptSuggestion, handleRejectSuggestion,
        handleCreateVersion, handleFetchVersions, handleRestoreVersion,
        handleAddCollaborator, handleUpdateCollaboratorPermission, handleRemoveCollaborator, handleFetchCollaborators,
        handleImageUpload, handleMultipleImageUpload, handleFileUpload, handleMultipleFileUpload,
        handleVideoUpload, handleDeleteImage, handleDeleteAttachment, handleDownloadAttachment,
        handleAddCodeBlock, handleUpdateCodeBlock, handleDeleteCodeBlock, handleCopyCodeBlock,
        handleAddTable, handleUpdateTable, handleDeleteTable,
        handleExportDocument, handleUpdateStatus, handleDuplicateDocument,
        handleTogglePin, handleToggleStar, handleArchiveDocument, handleDeleteDocument,
        handleFetchStats, handleFetchAccessLogs, showNotification,
    } = useDocEditor(docId, onSave);

    const updateCursorStats = () => {
        const stats = Utils.updateCursorStats(editorRef);
        setCursorPosition(stats);
    };

    const getSelectedRange = () => {
        return Utils.getSelectedRange(editorRef);
    };

    const handleCommentCreate = () => {
        if (!document?._id || !commentText) return;
        const { start, end } = getSelectedRange();
        handleAddComment({
            text: commentText,
            startIndex: start,
            endIndex: end,
        });
    };

    const handleSuggestionCreate = () => {
        if (!document?._id || !suggestionText) return;
        const { start, end } = getSelectedRange();
        handleAddSuggestion({
            originalText: selectedText,
            suggestedText: suggestionText,
            startIndex: start,
            endIndex: end,
            description: suggestionDescription,
        });
    };

    const handleCollaboratorAdd = () => {
        if (!document?._id || !collaboratorEmail) return;
        handleAddCollaborator({
            userId: collaboratorEmail,
            permission: collaboratorPermission,
        });
    };

    const handleVersionCreate = () => {
        if (!document?._id) return;
        handleCreateVersion({
            versionName,
            description: versionDescription,
        });
    };

    const handleImageFromClipboard = (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let item of items) {
            if (item.type.indexOf('image') !== -1) {
                const blob = item.getAsFile();
                if (blob && Utils.validateFile(blob, ['image/png', 'image/jpeg', 'image/gif'], 5242880, showNotification)) {
                    handleImageUpload(blob, '', 'Pasted image');
                }
            }
        }
    };

    return (
        <div className="w-full h-screen bg-gray-50 flex flex-col overflow-hidden">
            <NotificationMessages success={success} error={error} />

            <TopNavigationBar
                title={title}
                setTitle={setTitle}
                document={document}
                wordCount={wordCount}
                characterCount={characterCount}
                status={status}
                setStatus={setStatus}
                handleUpdateStatus={handleUpdateStatus}
                priority={priority}
                setPriority={setPriority}
                viewCount={viewCount}
                collaborators={collaborators}
                handleFetchCollaborators={handleFetchCollaborators}
                autoSaveEnabled={autoSaveEnabled}
                setAutoSaveEnabled={setAutoSaveEnabled}
                isSaving={isSaving}
                saveDocument={saveDocument}
            />

            <SecondaryToolbar
                editorRef={editorRef}
                currentFormat={currentFormat}
                setCurrentFormat={setCurrentFormat}
                showColorPicker={showColorPicker}
                setShowColorPicker={setShowColorPicker}
                showBgColorPicker={showBgColorPicker}
                setShowBgColorPicker={setShowBgColorPicker}
                document={document}
                handleToggleStar={handleToggleStar}
                handleTogglePin={handleTogglePin}
                handleExportDocument={handleExportDocument}
                handleMultipleImageUpload={handleMultipleImageUpload}
                handleMultipleFileUpload={handleMultipleFileUpload}
                setShowCommentBox={setShowCommentBox}
                setTextFormats={setTextFormats}
                setSelectedText={setSelectedText}
                setSelectionStart={setSelectionStart}
                setSelectionEnd={setSelectionEnd}
                showNotification={showNotification}
            />

            <div className="flex-1 flex overflow-hidden">
                <LeftSidebar
                    showSidebar={showSidebar}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    comments={comments}
                    suggestions={suggestions}
                    document={document}
                    handleFetchVersions={handleFetchVersions}
                    handleDuplicateDocument={handleDuplicateDocument}
                    handleArchiveDocument={handleArchiveDocument}
                    handleDeleteDocument={handleDeleteDocument}
                />

                <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
                    {activeTab === 'edit' && (
                        <EditorTab
                            editorRef={editorRef}
                            title={title}
                            setTitle={setTitle}
                            description={description}
                            setDescription={setDescription}
                            tags={tags}
                            handleAddTag={handleAddTag}
                            handleRemoveTag={handleRemoveTag}
                            content={content}
                            handleContentChange={handleContentChange}
                            currentFormat={currentFormat}
                            images={images}
                            document={document}
                            handleDeleteImage={handleDeleteImage}
                            codeBlocks={codeBlocks}
                            handleDeleteCodeBlock={handleDeleteCodeBlock}
                            handleCopyCodeBlock={handleCopyCodeBlock}
                            tables={tables}
                            handleDeleteTable={handleDeleteTable}
                            updateCursorStats={updateCursorStats}
                            handleImageFromClipboard={handleImageFromClipboard}
                        />
                    )}

                    {activeTab === 'preview' && (
                        <PreviewTab
                            title={title}
                            description={description}
                            tags={tags}
                            content={content}
                            images={images}
                        />
                    )}

                    {activeTab === 'comments' && (
                        <CommentsTab
                            comments={comments}
                            document={document}
                            setShowCommentBox={setShowCommentBox}
                            handleResolveComment={handleResolveComment}
                            handleDeleteComment={handleDeleteComment}
                            replyingTo={replyingTo}
                            setReplyingTo={setReplyingTo}
                            replyText={replyText}
                            setReplyText={setReplyText}
                            handleReplyToComment={handleReplyToComment}
                        />
                    )}

                    {activeTab === 'suggestions' && (
                        <SuggestionsTab
                            suggestions={suggestions}
                            document={document}
                            setShowSuggestionBox={setShowSuggestionBox}
                            handleAcceptSuggestion={handleAcceptSuggestion}
                            handleRejectSuggestion={handleRejectSuggestion}
                        />
                    )}

                    {activeTab === 'versions' && (
                        <VersionsTab
                            versions={versions}
                            document={document}
                            setShowVersionModal={setShowVersionModal}
                            handleRestoreVersion={handleRestoreVersion}
                        />
                    )}

                    {activeTab === 'collaborators' && (
                        <CollaboratorsTab
                            collaborators={collaborators}
                            currentEditors={currentEditors}
                            document={document}
                            setShowCollaboratorBox={setShowCollaboratorBox}
                            handleUpdateCollaboratorPermission={handleUpdateCollaboratorPermission}
                            handleRemoveCollaborator={handleRemoveCollaborator}
                        />
                    )}

                    {activeTab === 'media' && (
                        <MediaTab
                            images={images}
                            attachments={attachments}
                            document={document}
                            handleMultipleImageUpload={handleMultipleImageUpload}
                            handleMultipleFileUpload={handleMultipleFileUpload}
                            handleVideoUpload={handleVideoUpload}
                            handleDeleteImage={handleDeleteImage}
                            handleDeleteAttachment={handleDeleteAttachment}
                            handleDownloadAttachment={handleDownloadAttachment}
                            showNotification={showNotification}
                        />
                    )}

                    {activeTab === 'analytics' && (
                        <AnalyticsTab
                            viewCount={viewCount}
                            comments={comments}
                            collaborators={collaborators}
                            currentEditors={currentEditors}
                            versions={versions}
                            accessLogs={accessLogs}
                            document={document}
                            handleFetchStats={handleFetchStats}
                            handleFetchAccessLogs={handleFetchAccessLogs}
                        />
                    )}

                    {activeTab === 'settings' && (
                        <SettingsTab
                            category={category}
                            setCategory={setCategory}
                            isPublic={isPublic}
                            setIsPublic={setIsPublic}
                            autoSaveEnabled={autoSaveEnabled}
                            setAutoSaveEnabled={setAutoSaveEnabled}
                            currentFormat={currentFormat}
                            setCurrentFormat={setCurrentFormat}
                            document={document}
                            handleArchiveDocument={handleArchiveDocument}
                            handleDeleteDocument={handleDeleteDocument}
                            saveDocument={saveDocument}
                        />
                    )}
                </div>

                <RightSidebar
                    cursorPosition={cursorPosition}
                    wordCount={wordCount}
                    characterCount={characterCount}
                    images={images}
                    attachments={attachments}
                    comments={comments}
                    textFormats={textFormats}
                    currentEditors={currentEditors}
                    document={document}
                    content={content}
                    collaborators={collaborators}
                    showNotification={showNotification}
                />
            </div>

            <BottomStatusBar
                isSaving={isSaving}
                isLoading={isLoading}
                document={document}
                cursorPosition={cursorPosition}
                wordCount={wordCount}
                characterCount={characterCount}
                autoSaveEnabled={autoSaveEnabled}
                currentFormat={currentFormat}
                editorRef={editorRef}
                setCurrentFormat={setCurrentFormat}
            />

            <FloatingActionButtons
                showSidebar={showSidebar}
                setShowSidebar={setShowSidebar}
                setShowCommentBox={setShowCommentBox}
                comments={comments}
                isSaving={isSaving}
                saveDocument={saveDocument}
            />

            <CommentModal
                showCommentBox={showCommentBox}
                setShowCommentBox={setShowCommentBox}
                commentText={commentText}
                setCommentText={setCommentText}
                handleCommentCreate={handleCommentCreate}
            />

            <SuggestionModal
                showSuggestionBox={showSuggestionBox}
                setShowSuggestionBox={setShowSuggestionBox}
                suggestionText={suggestionText}
                setSuggestionText={setSuggestionText}
                suggestionDescription={suggestionDescription}
                setSuggestionDescription={setSuggestionDescription}
                handleSuggestionCreate={handleSuggestionCreate}
            />

            <VersionModal
                showVersionModal={showVersionModal}
                setShowVersionModal={setShowVersionModal}
                versionName={versionName}
                setVersionName={setVersionName}
                versionDescription={versionDescription}
                setVersionDescription={setVersionDescription}
                handleVersionCreate={handleVersionCreate}
            />

            <CollaboratorModal
                showCollaboratorBox={showCollaboratorBox}
                setShowCollaboratorBox={setShowCollaboratorBox}
                collaboratorEmail={collaboratorEmail}
                setCollaboratorEmail={setCollaboratorEmail}
                collaboratorPermission={collaboratorPermission}
                setCollaboratorPermission={setCollaboratorPermission}
                handleCollaboratorAdd={handleCollaboratorAdd}
            />

            <LoadingOverlay isLoading={isLoading} />
        </div>
    );
};

export default DocEditor;