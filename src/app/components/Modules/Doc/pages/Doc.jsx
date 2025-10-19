'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Typography from '@tiptap/extension-typography';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlock from '@tiptap/extension-code-block';
import Blockquote from '@tiptap/extension-blockquote';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';

import { useTestType } from '@/app/script/TestType.context';
import { useAlert } from '@/app/script/Alert.context';
import { useProject } from '@/app/script/Project.context';
import { useDoc } from '@/app/script/Doc.context';
import {
  Save,
  ArrowLeft,
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
  Loader2,
  FileText,
  Highlighter,
  Type
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const DocumentEditor = () => {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { selectedProject } = useProject();
  const projectId = selectedProject?._id;
  const { testTypeId, testTypeName } = useTestType();
  const { docId, docName } = useDoc();

  const [document, setDocument] = useState(null);
  const [title, setTitle] = useState('Untitled Document');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const saveTimeoutRef = useRef(null);

  // Initialize Tiptap Editor
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        history: true,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-400 underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-4',
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-600 p-2 min-w-[100px]',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-600 p-2 bg-gray-800 font-bold',
        },
      }),
      TextStyle,
      Color,
      FontFamily,
      Typography,
      Placeholder.configure({
        placeholder: 'Start writing your document...',
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-800 text-gray-100 p-4 rounded-lg font-mono text-sm',
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: 'border-l-4 border-blue-500 pl-4 italic text-gray-300',
        },
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'my-4 border-gray-700',
        },
      }),
      Dropcursor,
      Gapcursor,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-lg max-w-none focus:outline-none min-h-[600px] p-8',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      handleContentChange(html);
    },
  });

  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Create new document on mount if none exists
  useEffect(() => {
    if (projectId && testTypeId && !document) {
      createNewDocument();
    }
  }, [projectId, testTypeId]);

  // Create new document
  const createNewDocument = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/v1/doc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title,
          content: {},
          testType: testTypeId,
          project: projectId
        })
      });

      if (response.ok) {
        const newDoc = await response.json();
        setDocument(newDoc);
        showAlert('Document created successfully', 'success');
      } else {
        throw new Error('Failed to create document');
      }
    } catch (error) {
      showAlert('Failed to create document', 'error');
      console.error('Create error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save functionality
  const autoSave = useCallback(async (contentToSave) => {
    if (!document?._id) return;

    setIsSaving(true);

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/v1/doc/${docId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: { html: contentToSave },
          title: title,
          version: (document.version || 1) + 1
        })
      });

      if (response.ok) {
        const updatedDoc = await response.json();
        setDocument(updatedDoc);
        setLastSaved(new Date());
      } else {
        throw new Error('Failed to save document');
      }
    } catch (error) {
      showAlert('Failed to save document', 'error');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [document, title, showAlert]);

  // Debounced auto-save on content change
  const handleContentChange = useCallback((newContent) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      autoSave(newContent);
    }, 2000);
  }, [autoSave]);

  // Manual save
  const handleManualSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (editor) {
      autoSave(editor.getHTML());
    }
  };

  // Insert link
  const insertLink = () => {
    if (linkUrl && editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setShowLinkDialog(false);
      setLinkUrl('');
    }
  };

  // Insert image
  const insertImage = () => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setShowImageDialog(false);
      setImageUrl('');
    }
  };

  // Insert table
  const insertTable = () => {
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }
  };

  const colors = [
    '#ffffff', '#000000', '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#3b82f6', '#8b5cf6', '#ec4899', '#64748b', '#06b6d4', '#10b981'
  ];

  const highlightColors = [
    '#000000', '#374151', '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#3b82f6', '#8b5cf6', '#ec4899', '#64748b', '#06b6d4', '#10b981'
  ];

  if (!editor) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50"
      >
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-semibold bg-transparent border-none outline-none text-gray-100 placeholder-gray-500"
                placeholder="Document Title"
              />
              <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                <FileText className="w-4 h-4" />
                <span>{testTypeName}</span>
                {lastSaved && (
                  <>
                    <span>•</span>
                    <span>Last saved {lastSaved.toLocaleTimeString()}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isSaving && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </div>
            )}
            <button
              onClick={handleManualSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-t border-gray-800 overflow-x-auto">
          <div className="flex items-center gap-2 flex-wrap">
            {/* History */}
            <div className="flex items-center gap-1 border-r border-gray-700 pr-2">
              <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="p-2 hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
                title="Undo"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="p-2 hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
                title="Redo"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>

            {/* Headings */}
            <div className="flex items-center gap-1 border-r border-gray-700 pr-2">
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 hover:bg-gray-800 rounded transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-800' : ''}`}
                title="Heading 1"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 hover:bg-gray-800 rounded transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-800' : ''}`}
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`p-2 hover:bg-gray-800 rounded transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-800' : ''}`}
                title="Heading 3"
              >
                <Heading3 className="w-4 h-4" />
              </button>
            </div>

            {/* Text Formatting */}
            <div className="flex items-center gap-1 border-r border-gray-700 pr-2">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 hover:bg-gray-800 rounded transition-colors ${editor.isActive('bold') ? 'bg-gray-800' : ''}`}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 hover:bg-gray-800 rounded transition-colors ${editor.isActive('italic') ? 'bg-gray-800' : ''}`}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 hover:bg-gray-800 rounded transition-colors ${editor.isActive('underline') ? 'bg-gray-800' : ''}`}
                title="Underline"
              >
                <UnderlineIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-2 hover:bg-gray-800 rounded transition-colors ${editor.isActive('strike') ? 'bg-gray-800' : ''}`}
                title="Strikethrough"
              >
                <Strikethrough className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={`p-2 hover:bg-gray-800 rounded transition-colors ${editor.isActive('code') ? 'bg-gray-800' : ''}`}
                title="Code"
              >
                <Code className="w-4 h-4" />
              </button>
            </div>

            {/* Colors */}
            <div className="flex items-center gap-1 border-r border-gray-700 pr-2 relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-2 hover:bg-gray-800 rounded transition-colors relative"
                title="Text Color"
              >
                <Palette className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                className="p-2 hover:bg-gray-800 rounded transition-colors"
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
                    className="absolute top-full left-0 mt-2 p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50"
                  >
                    <div className="grid grid-cols-6 gap-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => {
                            editor.chain().focus().setColor(color).run();
                            setShowColorPicker(false);
                          }}
                          className="w-8 h-8 rounded border-2 border-gray-600 hover:border-blue-500 transition-colors"
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
                    className="absolute top-full left-0 mt-2 p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50"
                  >
                    <div className="grid grid-cols-6 gap-2">
                      {highlightColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => {
                            editor.chain().focus().toggleHighlight({ color }).run();
                            setShowHighlightPicker(false);
                          }}
                          className="w-8 h-8 rounded border-2 border-gray-600 hover:border-blue-500 transition-colors"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Alignment */}
            <div className="flex items-center gap-1 border-r border-gray-700 pr-2">
              <button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-2 hover:bg-gray-800 rounded transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-800' : ''}`}
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-2 hover:bg-gray-800 rounded transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-800' : ''}`}
                title="Align Center"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-2 hover:bg-gray-800 rounded transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-800' : ''}`}
                title="Align Right"
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                className={`p-2 hover:bg-gray-800 rounded transition-colors ${editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-800' : ''}`}
                title="Align Justify"
              >
                <AlignJustify className="w-4 h-4" />
              </button>
            </div>

            {/* Lists */}
            <div className="flex items-center gap-1 border-r border-gray-700 pr-2">
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 hover:bg-gray-800 rounded transition-colors ${editor.isActive('bulletList') ? 'bg-gray-800' : ''}`}
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 hover:bg-gray-800 rounded transition-colors ${editor.isActive('orderedList') ? 'bg-gray-800' : ''}`}
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
            </div>

            {/* Insert Elements */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowLinkDialog(true)}
                className="p-2 hover:bg-gray-800 rounded transition-colors"
                title="Insert Link"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowImageDialog(true)}
                className="p-2 hover:bg-gray-800 rounded transition-colors"
                title="Insert Image"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button
                onClick={insertTable}
                className="p-2 hover:bg-gray-800 rounded transition-colors"
                title="Insert Table"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 hover:bg-gray-800 rounded transition-colors ${editor.isActive('blockquote') ? 'bg-gray-800' : ''}`}
                title="Quote"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`p-2 hover:bg-gray-800 rounded transition-colors ${editor.isActive('codeBlock') ? 'bg-gray-800' : ''}`}
                title="Code Block"
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                className="p-2 hover:bg-gray-800 rounded transition-colors"
                title="Horizontal Line"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Editor Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-5xl mx-auto px-6 py-8"
      >
        <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 min-h-[600px]">
          <EditorContent editor={editor} className="text-gray-100" />
        </div>
      </motion.main>

      {/* Link Dialog */}
      <AnimatePresence>
        {showLinkDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowLinkDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-800"
            >
              <h3 className="text-xl font-semibold mb-4">Insert Link</h3>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none focus:border-blue-500 transition-colors mb-4"
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowLinkDialog(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={insertLink}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Insert
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Dialog */}
      <AnimatePresence>
        {showImageDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowImageDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-800"
            >
              <h3 className="text-xl font-semibold mb-4">Insert Image</h3>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none focus:border-blue-500 transition-colors mb-4"
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowImageDialog(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={insertImage}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Insert
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            <p className="text-gray-300">Creating document...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentEditor;