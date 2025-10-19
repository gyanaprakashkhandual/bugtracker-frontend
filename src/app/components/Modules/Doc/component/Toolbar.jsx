'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Palette,
  Minus,
  Check,
  Highlighter,
  Subscript,
  Superscript,
  RemoveFormatting,
  ChevronDown
} from 'lucide-react';

const EditorToolbar = ({
  editor,
  setShowLinkDialog,
  setShowImageDialog,
  insertTable
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  const colors = [
    '#ffffff', '#000000', '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#3b82f6', '#8b5cf6', '#ec4899', '#64748b', '#06b6d4', '#10b981'
  ];

  const highlightColors = [
    '#000000', '#374151', '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#3b82f6', '#8b5cf6', '#ec4899', '#64748b', '#06b6d4', '#10b981'
  ];

  if (!editor) return null;

  return (
    <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 overflow-x-auto">
      <div className="flex items-center gap-2 flex-wrap">
        {/* History */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors disabled:opacity-50 text-gray-700 dark:text-gray-300"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors disabled:opacity-50 text-gray-700 dark:text-gray-300"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
        </div>

        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('underline') ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('strike') ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('code') ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
            title="Code"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('subscript') ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
            title="Subscript"
          >
            <Subscript className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('superscript') ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
            title="Superscript"
          >
            <Superscript className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().unsetAllMarks().run()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300"
            title="Clear Formatting"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2 relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors relative text-gray-700 dark:text-gray-300"
            title="Text Color"
          >
            <Palette className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowHighlightPicker(!showHighlightPicker)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300"
            title="Highlight"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          {/* Text Color Picker */}
          <AnimatePresence>
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50"
              >
                <div className="grid grid-cols-6 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        editor.chain().focus().setColor(color).run();
                        setShowColorPicker(false);
                      }}
                      className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Highlight Picker */}
          <AnimatePresence>
            {showHighlightPicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50"
              >
                <div className="grid grid-cols-6 gap-2">
                  {highlightColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        editor.chain().focus().toggleHighlight({ color }).run();
                        setShowHighlightPicker(false);
                      }}
                      className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
            title="Align Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('taskList') ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
            title="Task List"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>

        {/* Insert Elements */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowLinkDialog(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300"
            title="Insert Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowImageDialog(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300"
            title="Insert Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            onClick={insertTable}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300"
            title="Insert Table"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('blockquote') ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('codeBlock') ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300"
            title="Horizontal Line"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorToolbar;