'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSheet } from '@/app/script/Sheet.context';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, AlignLeft, AlignCenter, AlignRight,
  ChevronDown, Palette, Link as LinkIcon, Image as ImageIcon, Search, Redo2, Undo2,
  Type, Subscript as SubIcon, Superscript as SuperIcon, WrapText, Merge, X
} from 'lucide-react';

const INITIAL_ROWS = 50;
const INITIAL_COLS = 15;
const ROW_INCREMENT = 10;
const COL_INCREMENT = 5;
const ROW_THRESHOLD = 40;
const COL_THRESHOLD = 10;
const DEFAULT_ROW_HEIGHT = 28;
const DEFAULT_COL_WIDTH = 100;

const SheetEditor = () => {
  const { sheetId } = useSheet();
  const [cells, setCells] = useState({});
  const [selectedCell, setSelectedCell] = useState(null);
  const [rowHeights, setRowHeights] = useState({});
  const [colWidths, setColWidths] = useState({});
  const [totalRows, setTotalRows] = useState(INITIAL_ROWS);
  const [totalCols, setTotalCols] = useState(INITIAL_COLS);
  const [isResizing, setIsResizing] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [fontSize, setFontSize] = useState('14px');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const saveTimeoutRef = useRef(null);
  const containerRef = useRef(null);
  const resizeStartRef = useRef(null);

  const getColLabel = (index) => {
    let label = '';
    let num = index;
    while (num >= 0) {
      label = String.fromCharCode(65 + (num % 26)) + label;
      num = Math.floor(num / 26) - 1;
    }
    return label;
  };

  const getCellKey = (row, col) => `${row}-${col}`;
  const getRowHeight = (row) => rowHeights[row] || DEFAULT_ROW_HEIGHT;
  const getColWidth = (col) => colWidths[col] || DEFAULT_COL_WIDTH;

  // TipTap Editor for selected cell
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
      Image,
      Subscript,
      Superscript,
    ],
    content: '',
    onUpdate: ({ editor }) => {
      if (selectedCell) {
        const { row, col } = selectedCell;
        updateCell(row, col, { content: editor.getHTML() });
      }
    },
  });

  // Load data from API
  useEffect(() => {
    if (!sheetId) return;

    const loadSheet = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/v1/sheet/${sheetId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            setCells(data.data.cells || {});
            setRowHeights(data.data.rowHeights || {});
            setColWidths(data.data.colWidths || {});
          }
        }
      } catch (error) {
        console.error('Failed to load sheet:', error);
      }
    };

    loadSheet();

    const stored = localStorage.getItem(`sheet-dimensions-${sheetId}`);
    if (stored) {
      const { rowHeights: rh, colWidths: cw } = JSON.parse(stored);
      setRowHeights(rh || {});
      setColWidths(cw || {});
    }
  }, [sheetId]);

  // Update editor content when cell selection changes
  useEffect(() => {
    if (editor && selectedCell) {
      const key = getCellKey(selectedCell.row, selectedCell.col);
      const cell = cells[key];
      editor.commands.setContent(cell?.content || '');

      // Auto-expand rows when user reaches threshold
      if (selectedCell.row >= totalRows - ROW_THRESHOLD) {
        setTotalRows(prev => prev + ROW_INCREMENT);
      }

      // Auto-expand columns when user reaches threshold
      if (selectedCell.col >= totalCols - COL_THRESHOLD) {
        setTotalCols(prev => prev + COL_INCREMENT);
      }
    }
  }, [selectedCell, editor, totalRows, totalCols]);

  // Auto-save to localStorage
  useEffect(() => {
    if (!sheetId) return;
    localStorage.setItem(`sheet-dimensions-${sheetId}`, JSON.stringify({ rowHeights, colWidths }));
  }, [rowHeights, colWidths, sheetId]);

  // Auto-save to API
  const saveToAPI = useCallback(async (cellData) => {
    if (!sheetId) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/v1/sheet/${sheetId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            cells: cellData,
            rowHeights,
            colWidths
          },
          version: Date.now()
        })
      });
    } catch (error) {
      console.error('Failed to save:', error);
    }
  }, [sheetId, rowHeights, colWidths]);

  // Debounced auto-save
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveToAPI(cells);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [cells, saveToAPI]);

  const updateCell = (row, col, updates) => {
    const key = getCellKey(row, col);
    setCells(prev => ({
      ...prev,
      [key]: { ...prev[key], ...updates }
    }));
  };

  const handleResize = (type, index, delta) => {
    if (type === 'row') {
      setRowHeights(prev => ({
        ...prev,
        [index]: Math.max(20, (prev[index] || DEFAULT_ROW_HEIGHT) + delta)
      }));
    } else {
      setColWidths(prev => ({
        ...prev,
        [index]: Math.max(50, (prev[index] || DEFAULT_COL_WIDTH) + delta)
      }));
    }
  };

  const startResize = (e, type, index) => {
    e.preventDefault();
    setIsResizing({ type, index });
    resizeStartRef.current = {
      startPos: type === 'row' ? e.clientY : e.clientX,
      startSize: type === 'row' ? getRowHeight(index) : getColWidth(index)
    };
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const { startPos, startSize } = resizeStartRef.current;
      const delta = (isResizing.type === 'row' ? e.clientY : e.clientX) - startPos;
      handleResize(isResizing.type, isResizing.index, delta);
    };

    const handleMouseUp = () => {
      setIsResizing(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const searchAndReplace = () => {
    if (!searchText) return;

    const newCells = { ...cells };
    let replaced = false;

    Object.keys(newCells).forEach(key => {
      if (newCells[key].content?.includes(searchText)) {
        newCells[key].content = newCells[key].content.replace(
          new RegExp(searchText, 'g'),
          replaceText
        );
        replaced = true;
      }
    });

    if (replaced) {
      setCells(newCells);
    }
    setSearchOpen(false);
  };

  const insertLink = () => {
    if (!editor || !linkUrl) return;
    editor.chain().focus().setLink({ href: linkUrl }).run();
    setLinkModalOpen(false);
    setLinkUrl('');
  };

  const insertImage = () => {
    if (!editor || !imageUrl) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageModalOpen(false);
    setImageUrl('');
  };

  const applyFontSize = (size) => {
    if (!editor) return;
    editor.chain().focus().setMark('textStyle', { fontSize: size }).run();
    setShowSizeMenu(false);
  };

  const applyFontFamily = (family) => {
    if (!editor) return;
    editor.chain().focus().setMark('textStyle', { fontFamily: family }).run();
    setShowFontMenu(false);
  };

  const applyColor = (color) => {
    if (!editor) return;
    editor.chain().focus().setColor(color).run();
    setTextColor(color);
  };

  const applyBgColor = (color) => {
    if (!editor) return;
    editor.chain().focus().setHighlight({ color }).run();
    setBgColor(color);
  };

  const ToolbarButton = ({ onClick, icon: Icon, active, title, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
        }`}
    >
      <Icon size={18} />
    </button>
  );

  const fontSizes = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px'];
  const fontFamilies = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Comic Sans MS'];

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 py-2 flex items-center gap-2 flex-wrap">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1 border-r pr-2">
            <ToolbarButton
              onClick={() => editor?.chain().focus().undo().run()}
              icon={Undo2}
              title="Undo"
              disabled={!editor?.can().undo()}
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().redo().run()}
              icon={Redo2}
              title="Redo"
              disabled={!editor?.can().redo()}
            />
          </div>

          {/* Font Family */}
          <div className="relative">
            <button
              onClick={() => setShowFontMenu(!showFontMenu)}
              className="px-3 py-2 border rounded hover:bg-gray-50 flex items-center gap-2"
            >
              <Type size={16} />
              <span className="text-sm">{fontFamily}</span>
              <ChevronDown size={16} />
            </button>
            {showFontMenu && (
              <div className="absolute top-full mt-1 bg-white border rounded shadow-lg z-50 w-48">
                {fontFamilies.map(font => (
                  <button
                    key={font}
                    onClick={() => applyFontFamily(font)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                    style={{ fontFamily: font }}
                  >
                    {font}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font Size */}
          <div className="relative">
            <button
              onClick={() => setShowSizeMenu(!showSizeMenu)}
              className="px-3 py-2 border rounded hover:bg-gray-50 flex items-center gap-2"
            >
              <span className="text-sm">{fontSize}</span>
              <ChevronDown size={16} />
            </button>
            {showSizeMenu && (
              <div className="absolute top-full mt-1 bg-white border rounded shadow-lg z-50 w-32">
                {fontSizes.map(size => (
                  <button
                    key={size}
                    onClick={() => applyFontSize(size)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Text Formatting */}
          <div className="flex items-center gap-1 border-r pr-2">
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleBold().run()}
              icon={Bold}
              active={editor?.isActive('bold')}
              title="Bold"
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              icon={Italic}
              active={editor?.isActive('italic')}
              title="Italic"
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              icon={UnderlineIcon}
              active={editor?.isActive('underline')}
              title="Underline"
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              icon={Strikethrough}
              active={editor?.isActive('strike')}
              title="Strikethrough"
            />
          </div>

          {/* Sub/Superscript */}
          <div className="flex items-center gap-1 border-r pr-2">
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleSubscript().run()}
              icon={SubIcon}
              active={editor?.isActive('subscript')}
              title="Subscript"
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleSuperscript().run()}
              icon={SuperIcon}
              active={editor?.isActive('superscript')}
              title="Superscript"
            />
          </div>

          {/* Colors */}
          <div className="flex items-center gap-1 border-r pr-2">
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-2 rounded hover:bg-gray-100"
                title="Text Color"
              >
                <div className="flex flex-col items-center">
                  <Type size={18} />
                  <div className="h-1 w-full" style={{ backgroundColor: textColor }}></div>
                </div>
              </button>
              {showColorPicker && (
                <div className="absolute top-full mt-1 bg-white border rounded shadow-lg p-2 z-50">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => applyColor(e.target.value)}
                    className="w-32 h-32 cursor-pointer"
                  />
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowBgPicker(!showBgPicker)}
                className="p-2 rounded hover:bg-gray-100"
                title="Background Color"
              >
                <Palette size={18} />
              </button>
              {showBgPicker && (
                <div className="absolute top-full mt-1 bg-white border rounded shadow-lg p-2 z-50">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => applyBgColor(e.target.value)}
                    className="w-32 h-32 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 border-r pr-2">
            <ToolbarButton
              onClick={() => editor?.chain().focus().setTextAlign('left').run()}
              icon={AlignLeft}
              active={editor?.isActive({ textAlign: 'left' })}
              title="Align Left"
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().setTextAlign('center').run()}
              icon={AlignCenter}
              active={editor?.isActive({ textAlign: 'center' })}
              title="Align Center"
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().setTextAlign('right').run()}
              icon={AlignRight}
              active={editor?.isActive({ textAlign: 'right' })}
              title="Align Right"
            />
          </div>

          {/* Insert */}
          <div className="flex items-center gap-1 border-r pr-2">
            <ToolbarButton
              onClick={() => setLinkModalOpen(true)}
              icon={LinkIcon}
              title="Insert Link"
            />
            <ToolbarButton
              onClick={() => setImageModalOpen(true)}
              icon={ImageIcon}
              title="Insert Image"
            />
          </div>

          {/* Search */}
          <ToolbarButton
            onClick={() => setSearchOpen(true)}
            icon={Search}
            title="Search and Replace"
          />
        </div>
      </div>

      {/* Sheet Grid */}
      <div ref={containerRef} className="flex-1 overflow-auto">
        <div className="inline-block min-w-full">
          {/* Column Headers */}
          <div className="flex sticky top-0 z-40 bg-gray-50">
            <div className="w-12 h-8 border-r border-b border-gray-300 bg-gray-100 flex-shrink-0"></div>
            {Array.from({ length: totalCols }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="border-r border-b border-gray-300 bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-700 relative flex-shrink-0"
                style={{ width: getColWidth(colIndex) }}
              >
                {getColLabel(colIndex)}
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
                  onMouseDown={(e) => startResize(e, 'col', colIndex)}
                ></div>
              </div>
            ))}
          </div>

          {/* Rows */}
          {Array.from({ length: totalRows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex">
              {/* Row Header */}
              <div
                className="w-12 border-r border-b border-gray-300 bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-700 relative flex-shrink-0"
                style={{ height: getRowHeight(rowIndex) }}
              >
                {rowIndex + 1}
                <div
                  className="absolute left-0 right-0 bottom-0 h-1 cursor-row-resize hover:bg-blue-500"
                  onMouseDown={(e) => startResize(e, 'row', rowIndex)}
                ></div>
              </div>

              {/* Cells */}
              {Array.from({ length: totalCols }).map((_, colIndex) => {
                const key = getCellKey(rowIndex, colIndex);
                const cell = cells[key];
                const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;

                return (
                  <div
                    key={key}
                    className={`border-r border-b border-gray-300 overflow-hidden flex-shrink-0 ${isSelected ? 'ring-2 ring-blue-500 z-10' : ''
                      }`}
                    style={{
                      width: getColWidth(colIndex),
                      height: getRowHeight(rowIndex),
                    }}
                    onClick={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                  >
                    {isSelected ? (
                      <div className="w-full h-full">
                        <EditorContent editor={editor} className="h-full w-full p-1 text-sm prose prose-sm max-w-none" />
                      </div>
                    ) : (
                      <div
                        className="p-1 text-sm"
                        dangerouslySetInnerHTML={{ __html: cell?.content || '' }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl p-6 w-96"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Search and Replace</h3>
                <button onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <input
                type="text"
                placeholder="Search for..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full border rounded px-3 py-2 mb-3"
              />
              <input
                type="text"
                placeholder="Replace with..."
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                className="w-full border rounded px-3 py-2 mb-4"
              />
              <button
                onClick={searchAndReplace}
                className="w-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
              >
                Replace All
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Link Modal */}
      <AnimatePresence>
        {linkModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
            onClick={() => setLinkModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl p-6 w-96"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Insert Link</h3>
                <button onClick={() => setLinkModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <input
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full border rounded px-3 py-2 mb-4"
              />
              <button
                onClick={insertLink}
                className="w-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
              >
                Insert Link
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Modal */}
      <AnimatePresence>
        {imageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
            onClick={() => setImageModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl p-6 w-96"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Insert Image</h3>
                <button onClick={() => setImageModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <input
                type="url"
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full border rounded px-3 py-2 mb-4"
              />
              <button
                onClick={insertImage}
                className="w-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
              >
                Insert Image
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SheetEditor;