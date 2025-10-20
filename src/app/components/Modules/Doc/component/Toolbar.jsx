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
  IndentDecrease,
  IndentIncrease,
  Type,
  Trash2,
  Smile,
  AtSign,
  Hash,
  Youtube,
  Search,
  MessageSquare,
  FileText,
  SpaceIcon as LineHeight,
  Space as LetterSpacing
} from 'lucide-react';

const EditorToolbar = ({
  editor,
  setShowLinkDialog,
  setShowImageDialog,
  insertTable
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLineHeightPicker, setShowLineHeightPicker] = useState(false);
  const [showLetterSpacingPicker, setShowLetterSpacingPicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [showYoutubeDialog, setShowYoutubeDialog] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const colors = [
    '#ffffff', '#000000', '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#3b82f6', '#8b5cf6', '#ec4899', '#64748b', '#06b6d4', '#10b981'
  ];

  const highlightColors = [
    '#000000', '#374151', '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#3b82f6', '#8b5cf6', '#ec4899', '#64748b', '#06b6d4', '#10b981'
  ];

  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'];

  const lineHeights = ['1', '1.15', '1.5', '1.75', '2', '2.5', '3'];

  const letterSpacings = ['-0.05em', '-0.025em', '0', '0.025em', '0.05em', '0.1em', '0.15em'];

  const codeLanguages = [
    'javascript', 'python', 'java', 'cpp', 'csharp', 'php', 'ruby',
    'go', 'rust', 'typescript', 'html', 'css', 'sql', 'bash', 'json'
  ];

  const emojis = [
    '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
    '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛',
    '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👏', '🙌',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '⭐', '🌟', '✨', '💫', '🔥', '💯', '✅', '❌', '⚠️', '📌'
  ];

  if (!editor) return null;

  // Delete selected image
  const deleteSelectedImage = () => {
    if (editor.isActive('image')) {
      editor.chain().focus().deleteSelection().run();
    }
  };

  // Insert mention
  const insertMention = () => {
    const username = prompt('Enter username:');
    if (username) {
      editor.chain().focus().insertContent(`@${username} `).run();
    }
  };

  // Insert hashtag
  const insertHashtag = () => {
    const tag = prompt('Enter hashtag:');
    if (tag) {
      editor.chain().focus().insertContent(`#${tag} `).run();
    }
  };

  // Insert emoji
  const insertEmoji = (emoji) => {
    editor.chain().focus().insertContent(emoji).run();
    setShowEmojiPicker(false);
  };

  // Insert YouTube video
  const insertYoutubeVideo = () => {
    if (youtubeUrl) {
      editor.commands.setYoutubeVideo({
        src: youtubeUrl,
      });
      setYoutubeUrl('');
      setShowYoutubeDialog(false);
    }
  };

  // Search functionality
  const handleSearch = () => {
    if (searchTerm) {
      editor.commands.setSearchTerm(searchTerm);
    }
  };

  // Replace functionality
  const handleReplace = () => {
    if (searchTerm && replaceTerm) {
      editor.commands.replace(replaceTerm);
    }
  };

  const handleReplaceAll = () => {
    if (searchTerm && replaceTerm) {
      editor.commands.replaceAll(replaceTerm);
    }
  };

  return (
    <div className="px-6 py-3 border-t border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
      <div className="flex items-center gap-2 flex-wrap">
        {/* History */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors disabled:opacity-50 text-gray-700 dark:text-gray-300"
            tooltip-data="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors disabled:opacity-50 text-gray-700 dark:text-gray-300"
            tooltip-data="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Headings - FIXED */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
              }`}
            tooltip-data="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
              }`}
            tooltip-data="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
              }`}
            tooltip-data="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
        </div>

        {/* Font Size */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2 relative">
          <button
            onClick={() => setShowFontSizePicker(!showFontSizePicker)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 flex items-center gap-1"
            tooltip-data="Font Size"
          >
            <Type className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showFontSizePicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50"
              >
                <div className="grid grid-cols-2 gap-1">
                  {fontSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        editor.chain().focus().setFontSize(size).run();
                        setShowFontSizePicker(false);
                      }}
                      className="px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-700 dark:text-gray-300"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('bold') ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
              }`}
            tooltip-data="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('italic') ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
              }`}
            tooltip-data="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('underline') ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
              }`}
            tooltip-data="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('strike') ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
              }`}
            tooltip-data="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('code') ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
              }`}
            tooltip-data="Code"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('subscript') ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
              }`}
            tooltip-data="Subscript"
          >
            <Subscript className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('superscript') ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
              }`}
            tooltip-data="Superscript"
          >
            <Superscript className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().unsetAllMarks().run()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300"
            tooltip-data="Clear Formatting"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>
        </div>

        {/* Line Height & Letter Spacing */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2 relative">
          <button
            onClick={() => setShowLineHeightPicker(!showLineHeightPicker)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300"
            tooltip-data="Line Height"
          >
            <LineHeight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowLetterSpacingPicker(!showLetterSpacingPicker)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300"
            tooltip-data="Letter Spacing"
          >
            <LetterSpacing className="w-4 h-4" />
          </button>

          {/* Line Height Picker */}
          <AnimatePresence>
            {showLineHeightPicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50"
              >
                <div className="grid grid-cols-1 gap-1">
                  {lineHeights.map((height) => (
                    <button
                      key={height}
                      onClick={() => {
                        editor.chain().focus().setLineHeight(height).run();
                        setShowLineHeightPicker(false);
                      }}
                      className="px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-700 dark:text-gray-300"
                    >
                      {height}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Letter Spacing Picker */}
          <AnimatePresence>
            {showLetterSpacingPicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50"
              >
                <div className="grid grid-cols-1 gap-1">
                  {letterSpacings.map((spacing) => (
                    <button
                      key={spacing}
                      onClick={() => {
                        editor.chain().focus().setLetterSpacing(spacing).run();
                        setShowLetterSpacingPicker(false);
                      }}
                      className="px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-700 dark:text-gray-300"
                    >
                      {spacing}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2 relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors relative text-gray-700 dark:text-gray-300"
            tooltip-data="Text Color"
          >
            <Palette className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowHighlightPicker(!showHighlightPicker)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300"
            tooltip-data="Highlight"
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
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
              }`}
            tooltip-data="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
              }`}
            tooltip-data="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
              }`}
            tooltip-data="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
              }`}
            tooltip-data="Align Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        {/* Indent */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <button
            onClick={() => editor.chain().focus().outdent().run()}
            disabled={!editor.can().outdent()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors disabled:opacity-50 text-gray-700 dark:text-gray-300"
            tooltip-data="Decrease Indent"
          >
            <IndentDecrease className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().indent().run()}
            disabled={!editor.can().indent()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors disabled:opacity-50 text-gray-700 dark:text-gray-300"
            tooltip-data="Increase Indent"
          >
            <IndentIncrease className="w-4 h-4" />
          </button>
        </div>

        {/* Lists - FIXED */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('bulletList') ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
              }`}
            tooltip-data="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('orderedList') ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
              }`}
            tooltip-data="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('taskList') ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
              }`}
            tooltip-data="Task List"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>

        {/* Mentions & Emojis */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2 relative">
          <button
            onClick={insertMention}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300"
            tooltip-data="Insert Mention"
          >
            <AtSign className="w-4 h-4" />
          </button>
          <button
            onClick={insertHashtag}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300"
            tooltip-data="Insert Hashtag"
          >
            <Hash className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300"
            tooltip-data="Insert Emoji"
          >
            <Smile className="w-4 h-4" />
          </button>

          {/* Emoji Picker */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto"
              >
                <div className="grid grid-cols-8 gap-2">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => insertEmoji(emoji)}
                      className="w-8 h-8 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-xl"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Insert Elements */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <button
            onClick={() => setShowLinkDialog(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300"
            tooltip-data="Insert Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowImageDialog(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300"
            tooltip-data="Insert Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            onClick={deleteSelectedImage}
            disabled={!editor.isActive('image')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            tooltip-data="Delete Selected Image"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={insertTable}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300"
            tooltip-data="Insert Table"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('blockquote') ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
              }`}
            tooltip-data="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 ${editor.isActive('codeBlock') ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
              }`}
            tooltip-data="Code Block"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300"
            tooltip-data="Horizontal Line"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* YouTube & File Upload */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <button
            onClick={() => setShowYoutubeDialog(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300"
            tooltip-data="Insert YouTube Video"
          >
            <Youtube className="w-4 h-4" />
          </button>
          <button
            onClick={() => document.getElementById('file-upload')?.click()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300"
            tooltip-data="Upload File"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Comments */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSearchDialog(!showSearchDialog)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300"
            tooltip-data="Search & Replace"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().addComment().run()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300"
            tooltip-data="Add Comment"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* YouTube Dialog */}
      <AnimatePresence>
        {showYoutubeDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowYoutubeDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Insert YouTube Video
              </h3>
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="Enter YouTube URL"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowYoutubeDialog(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={insertYoutubeVideo}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Insert
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Replace Dialog */}
      <AnimatePresence>
        {showSearchDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowSearchDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Search & Replace
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Search for:
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter search term"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Replace with:
                  </label>
                  <input
                    type="text"
                    value={replaceTerm}
                    onChange={(e) => setReplaceTerm(e.target.value)}
                    placeholder="Enter replacement term"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button
                  onClick={() => setShowSearchDialog(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Search
                </button>
                <button
                  onClick={handleReplace}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Replace
                </button>
                <button
                  onClick={handleReplaceAll}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Replace All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden File Input */}
      <input
        id="file-upload"
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            // Handle file upload logic here
            console.log('File selected:', file);
          }
        }}
      />
    </div>
  );
};

export default EditorToolbar;