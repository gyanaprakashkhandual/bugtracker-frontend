// components/TiptapEditor.jsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { lowlight } from 'lowlight';
import { useState, useEffect } from 'react';

export default function TiptapEditor({ document, onSave }) {
  const [title, setTitle] = useState(document?.title || '');
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: document?.content || '',
  });

  const handleSave = async () => {
    if (!editor) return;
    
    setIsSaving(true);
    try {
      await onSave({
        title,
        content: editor.getJSON(),
        version: document ? document.version + 1 : 1
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!editor) return null;

  return (
    <div className="border rounded-lg bg-white">
      {/* Title Input */}
      <div className="p-4 border-b">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Document Title"
          className="w-full text-2xl font-bold outline-none"
        />
      </div>

      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
        >
          <u>U</u>
        </button>

        {/* Text Alignment */}
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
        >
          Left
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
        >
          Center
        </button>

        {/* Color Picker */}
        <input
          type="color"
          onChange={event => editor.chain().focus().setColor(event.target.value).run()}
          className="w-8 h-8"
        />

        {/* Headings */}
        <select
          onChange={event => {
            const level = parseInt(event.target.value);
            if (level === 0) {
              editor.chain().focus().setParagraph().run();
            } else {
              editor.chain().focus().toggleHeading({ level }).run();
            }
          }}
          className="p-2 border rounded"
        >
          <option value="0">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
        >
          • List
        </button>

        {/* Table */}
        <button
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className="p-2 rounded"
        >
          Table
        </button>

        {/* Code Block */}
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded ${editor.isActive('codeBlock') ? 'bg-gray-200' : ''}`}
        >
          Code
        </button>

        {/* Image Upload */}
        <input
          type="file"
          accept="image/*"
          onChange={async (event) => {
            const file = event.target.files[0];
            if (file) {
              // Implement your image upload logic here
              const imageUrl = await uploadImage(file);
              editor.chain().focus().setImage({ src: imageUrl }).run();
            }
          }}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="p-2 rounded cursor-pointer">
          Image
        </label>
      </div>

      {/* Editor Content */}
      <div className="p-6 min-h-[500px]">
        <EditorContent editor={editor} />
      </div>

      {/* Save Button */}
      <div className="p-4 border-t">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Document'}
        </button>
      </div>
    </div>
  );
}