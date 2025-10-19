
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor } from '@tiptap/react';
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
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Loader2 } from 'lucide-react';

import { useTestType } from '@/app/script/TestType.context';
import { useAlert } from '@/app/script/Alert.context';
import { useProject } from '@/app/script/Project.context';
import { useDoc } from '@/app/script/Doc.context';
import DocumentHeader from '../component/Header';
import EditorToolbar from '../component/Toolbar';
import EditorContentArea from '../component/Editor';

const DocumentEditor = () => {
  console.log('🚀 DocumentEditor component rendering...');
  
  const { showAlert } = useAlert();
  const { selectedProject } = useProject();
  const projectId = selectedProject?._id;
  const { testTypeId, testTypeName } = useTestType();
  const { docId, docName } = useDoc();

  console.log('📋 Context values:', {
    projectId,
    testTypeId,
    testTypeName,
    docId,
    docName
  });

  const [document, setDocument] = useState(null);
  const [title, setTitle] = useState('Untitled Document');
  const [lastSaved, setLastSaved] = useState(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const saveTimeoutRef = useRef(null);

  // Initialize Tiptap Editor with additional extensions
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        history: true,
      }),
      Underline,
      Subscript,
      Superscript,
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
      TaskList.configure({
        HTMLAttributes: {
          class: 'list-none space-y-2',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2',
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

  console.log('✏️ Editor initialized:', editor ? 'YES' : 'NO');

  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      console.log('🔑 Token retrieved:', token ? 'EXISTS' : 'NOT FOUND');
      return token;
    }
    return null;
  };

  // Load existing document
  useEffect(() => {
    console.log('🔄 useEffect triggered - docId:', docId);
    if (docId) {
      console.log('✅ docId exists, calling loadDocument...');
      loadDocument();
    } else {
      console.log('❌ docId is missing!');
      setIsLoading(false);
    }
  }, [docId]);

  // Load document from API
  const loadDocument = async () => {
    console.log('📥 loadDocument function called');
    console.log('🔗 API URL:', `http://localhost:5000/api/v1/doc/${docId}`);
    
    setIsLoading(true);
    
    try {
      const token = getToken();
      
      if (!token) {
        console.error('❌ No token available!');
        showAlert('Authentication required', 'error');
        setIsLoading(false);
        return;
      }
      
      console.log('🌐 Fetching document...');
      const response = await fetch(`http://localhost:5000/api/v1/doc/${docId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (response.ok) {
        const doc = await response.json();
        console.log('✅ Document loaded successfully:', doc);
        console.log('📄 Document content:', doc.content);
        
        setDocument(doc);
        setTitle(doc.title || 'Untitled Document');
        
        // Set editor content
        if (editor && doc.content?.html) {
          console.log('✏️ Setting editor content...');
          editor.commands.setContent(doc.content.html);
          console.log('✅ Editor content set');
        } else {
          console.warn('⚠️ Editor not ready or no content:', {
            editorExists: !!editor,
            hasContent: !!doc.content?.html
          });
        }
      } else {
        const errorData = await response.text();
        console.error('❌ Failed to load document:', errorData);
        throw new Error('Failed to load document');
      }
    } catch (error) {
      console.error('💥 Load error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      showAlert('Failed to load document', 'error');
    } finally {
      console.log('🏁 loadDocument finished, setting isLoading to false');
      setIsLoading(false);
    }
  };

  // Auto-save functionality
  const autoSave = useCallback(async (contentToSave) => {
    console.log('💾 autoSave called');
    
    if (!docId) {
      console.warn('⚠️ No docId, skipping auto-save');
      return;
    }

    try {
      const token = getToken();
      console.log('🌐 Saving document to:', `http://localhost:5000/api/v1/doc/${docId}`);
      
      const payload = {
        content: { html: contentToSave },
        title: title,
        version: (document?.version || 1) + 1
      };
      
      console.log('📦 Save payload:', payload);
      
      const response = await fetch(`http://localhost:5000/api/v1/doc/${docId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      console.log('📡 Save response status:', response.status);

      if (response.ok) {
        const updatedDoc = await response.json();
        console.log('✅ Document saved successfully');
        setDocument(updatedDoc);
        setLastSaved(new Date());
      } else {
        const errorData = await response.text();
        console.error('❌ Save failed:', errorData);
        throw new Error('Failed to save document');
      }
    } catch (error) {
      console.error('💥 Save error:', error);
      showAlert('Failed to save document', 'error');
    }
  }, [docId, document, title, showAlert]);

  // Debounced auto-save on content change
  const handleContentChange = useCallback((newContent) => {
    console.log('📝 Content changed, scheduling auto-save...');
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      console.log('⏱️ Cleared previous save timeout');
    }

    saveTimeoutRef.current = setTimeout(() => {
      console.log('⏰ Auto-save timeout triggered');
      autoSave(newContent);
    }, 2000);
  }, [autoSave]);

  // Manual save
  const handleManualSave = () => {
    console.log('💾 Manual save triggered');
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (editor) {
      autoSave(editor.getHTML());
    } else {
      console.warn('⚠️ Editor not available for manual save');
    }
  };

  // Insert table
  const insertTable = () => {
    console.log('📊 Insert table triggered');
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }
  };

  console.log('🔍 Current state:', {
    isLoading,
    editorExists: !!editor,
    documentExists: !!document,
    title
  });

  if (isLoading) {
    console.log('⏳ Showing loading spinner...');
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
          <p className="text-gray-400 mt-4">Loading document...</p>
          <p className="text-gray-600 text-sm mt-2">Doc ID: {docId || 'N/A'}</p>
        </div>
      </div>
    );
  }

  if (!editor) {
    console.log('⏳ Editor not ready yet...');
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
          <p className="text-gray-400 mt-4">Initializing editor...</p>
        </div>
      </div>
    );
  }

  console.log('✅ Rendering main editor component');

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <DocumentHeader
        title={title}
        setTitle={setTitle}
        testTypeName={testTypeName}
        docName={docName}
        lastSaved={lastSaved}
        handleManualSave={handleManualSave}
      />

      <EditorToolbar
        editor={editor}
        setShowLinkDialog={setShowLinkDialog}
        setShowImageDialog={setShowImageDialog}
        insertTable={insertTable}
      />

      <EditorContentArea
        editor={editor}
        showLinkDialog={showLinkDialog}
        setShowLinkDialog={setShowLinkDialog}
        showImageDialog={showImageDialog}
        setShowImageDialog={setShowImageDialog}
      />
    </div>
  );
};

export default DocumentEditor;