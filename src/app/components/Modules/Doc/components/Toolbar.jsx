// Toolbar.jsx
'use client';

import React from 'react';
import { Bold, Italic, Underline, Strikethrough, Code, Highlighter, Subscript, Superscript, AlignLeft, AlignCenter, AlignRight, AlignJustify, Image as ImageIcon, Paperclip, Table } from 'lucide-react';

const Toolbar = ({ quillRef, onAddImage, onAddAttachment, onAddCodeBlock, onAddTable, onClearFormat }) => {
  const handleFormat = (format, value) => {
    if (quillRef.current) {
      quillRef.current.format(format, value);
    }
  };

  return (
    <div className="flex bg-white p-2 border-b text-sm">
      <button onClick={() => handleFormat('bold', true)} className="mx-1 p-1 hover:bg-gray-100 rounded">
        <Bold size={16} />
      </button>
      <button onClick={() => handleFormat('italic', true)} className="mx-1 p-1 hover:bg-gray-100 rounded">
        <Italic size={16} />
      </button>
      <button onClick={() => handleFormat('underline', true)} className="mx-1 p-1 hover:bg-gray-100 rounded">
        <Underline size={16} />
      </button>
      <button onClick={() => handleFormat('strike', true)} className="mx-1 p-1 hover:bg-gray-100 rounded">
        <Strikethrough size={16} />
      </button>
      <button onClick={() => handleFormat('code', true)} className="mx-1 p-1 hover:bg-gray-100 rounded">
        <Code size={16} />
      </button>
      <button onClick={() => handleFormat('background', 'yellow')} className="mx-1 p-1 hover:bg-gray-100 rounded">
        <Highlighter size={16} />
      </button>
      <button onClick={() => handleFormat('script', 'super')} className="mx-1 p-1 hover:bg-gray-100 rounded">
        <Superscript size={16} />
      </button>
      <button onClick={() => handleFormat('script', 'sub')} className="mx-1 p-1 hover:bg-gray-100 rounded">
        <Subscript size={16} />
      </button>
      <button onClick={() => handleFormat('align', '')} className="mx-1 p-1 hover:bg-gray-100 rounded">
        <AlignLeft size={16} />
      </button>
      <button onClick={() => handleFormat('align', 'center')} className="mx-1 p-1 hover:bg-gray-100 rounded">
        <AlignCenter size={16} />
      </button>
      <button onClick={() => handleFormat('align', 'right')} className="mx-1 p-1 hover:bg-gray-100 rounded">
        <AlignRight size={16} />
      </button>
      <button onClick={() => handleFormat('align', 'justify')} className="mx-1 p-1 hover:bg-gray-100 rounded">
        <AlignJustify size={16} />
      </button>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onAddImage(e.target.files[0], 'image')}
        className="hidden"
        id="image-upload"
      />
      <label htmlFor="image-upload" className="mx-1 p-1 hover:bg-gray-100 rounded cursor-pointer">
        <ImageIcon size={16} />
      </label>
      <input
        type="file"
        onChange={(e) => onAddAttachment(e.target.files[0], 'attachment')}
        className="hidden"
        id="attachment-upload"
      />
      <label htmlFor="attachment-upload" className="mx-1 p-1 hover:bg-gray-100 rounded cursor-pointer">
        <Paperclip size={16} />
      </label>
      <button
        onClick={() => onAddCodeBlock({ language: 'javascript', code: '// Code here' })}
        className="mx-1 p-1 hover:bg-gray-100 rounded"
      >
        <Code size={16} />
      </button>
      <button
        onClick={() => onAddTable({ headers: ['Column 1', 'Column 2'], rows: [['', '']] })}
        className="mx-1 p-1 hover:bg-gray-100 rounded"
      >
        <Table size={16} />
      </button>
      <button
        onClick={() => onClearFormat({ startIndex: 0, endIndex: 10 })}
        className="mx-1 p-1 hover:bg-gray-100 rounded text-xs"
      >
        Clear Format
      </button>
    </div>
  );
};

export default Toolbar;