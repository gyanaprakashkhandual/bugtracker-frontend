// docEditorUI.js - Part 1: Layout Components and Top Bar

import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, FileText, Eye, MessageSquare, Users, History, Settings,
  Download, Upload, Image, Paperclip, Code, Table, Bold, Italic,
  Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, Highlighter, Type, Palette, MoreVertical, X,
  Check, Star, Pin, Archive, Copy, Trash2, Send, Reply,
  Plus, Minus, ChevronDown, Search, Filter, Tag, Lock,
  Globe, Clock, TrendingUp, Activity, RefreshCw, ZoomIn,
  ZoomOut, Maximize2, Menu, ChevronRight, Edit3, BookOpen,
  FileCode, Monitor, Smartphone, AlertCircle, CheckCircle,
  Sparkles, Link, List, CornerDownRight
} from 'lucide-react';
import {
  DOCUMENT_CATEGORIES,
  PRIORITY_LEVELS,
  STATUS_OPTIONS,
  PERMISSION_LEVELS,
  FONT_SIZES,
  FONT_FAMILIES,
  EXPORT_FORMATS,
  TAB_OPTIONS
} from './docEditorConstants';
import * as Utils from './docEditorUtils';

// ========================
// NOTIFICATION COMPONENTS
// ========================

export const NotificationMessages = ({ success, error }) => (
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

export const TopNavigationBar = ({
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
      {/* Status Badge */}
      <select
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          if (document?._id) handleUpdateStatus(e.target.value);
        }}
        className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
          status === 'published' ? 'bg-green-50 text-green-700 border-green-200' :
          status === 'draft' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
          status === 'archived' ? 'bg-gray-50 text-gray-700 border-gray-200' :
          'bg-blue-50 text-blue-700 border-blue-200'
        }`}
      >
        {STATUS_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* Priority */}
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
          priority === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
          priority === 'medium' ? 'bg-orange-50 text-orange-700 border-orange-200' :
          'bg-gray-50 text-gray-700 border-gray-200'
        }`}
      >
        {PRIORITY_LEVELS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* View Count */}
      <div className="flex items-center gap-1 text-xs text-gray-500 px-2 py-1 bg-gray-50 rounded-lg">
        <Eye size={12} />
        <span>{viewCount}</span>
      </div>

      {/* Collaborators */}
      <button
        onClick={() => {
          if (document?._id) handleFetchCollaborators();
        }}
        className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-xs font-medium"
      >
        <Users size={12} />
        <span>{collaborators.length}</span>
      </button>

      {/* Auto-save Toggle */}
      <button
        onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
          autoSaveEnabled ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'
        }`}
      >
        <RefreshCw size={12} className={autoSaveEnabled ? 'animate-spin' : ''} />
        <span>{autoSaveEnabled ? 'Auto-save ON' : 'Auto-save OFF'}</span>
      </button>

      {/* Save Button */}
      <button
        onClick={saveDocument}
        disabled={isSaving}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium disabled:opacity-50"
      >
        <Save size={14} />
        <span>{isSaving ? 'Saving...' : 'Save'}</span>
      </button>

      {/* More Options */}
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

export const SecondaryToolbar = ({
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
  getSelectedRange,
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
        {/* Formatting Toolbar */}
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

        {/* Alignment */}
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

        {/* Font Size */}
        <select
          value={currentFormat.fontSize}
          onChange={(e) => Utils.applyFontSize(parseInt(e.target.value), setCurrentFormat)}
          className="text-xs px-2 py-1 border border-gray-300 rounded hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {FONT_SIZES.map(size => (
            <option key={size} value={size}>{size}px</option>
          ))}
        </select>

        {/* Text Color */}
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

        {/* Background Color */}
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

        {/* Insert Options */}
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
        {/* Document Actions */}
        {document && (
          <>
            <button
              onClick={() => document._id && handleToggleStar()}
              className={`p-1.5 rounded transition-colors ${
                document.starred ? 'text-yellow-500 bg-yellow-50' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Star Document"
            >
              <Star size={16} fill={document.starred ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => document._id && handleTogglePin()}
              className={`p-1.5 rounded transition-colors ${
                document.pinned ? 'text-blue-500 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Pin Document"
            >
              <Pin size={16} fill={document.pinned ? 'currentColor' : 'none'} />
            </button>
          </>
        )}

        {/* Export */}
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
// LEFT SIDEBAR - NAVIGATION
// ========================

export const LeftSidebar = ({
  showSidebar,
  activeTab,
  setActiveTab,
  comments,
  suggestions,
  document,
  handleFetchVersions,
  handleDuplicateDocument,
  handleArchiveDocument,
  handleDeleteDocument,
  searchDocuments
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
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value) {
                searchDocuments(e.target.value);
              }
            }}
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
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
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