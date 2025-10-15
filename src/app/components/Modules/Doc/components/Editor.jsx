'use client';

import { useState, useEffect, useRef } from 'react';
import { useDoc } from '@/app/script/Doc.context';
import { useTestType } from '@/app/script/TestType.context';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_BASE_URL = 'http://localhost:5000/api/v1/doc';
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dvytvjplt/upload';
const UPLOAD_PRESET = 'test_case_preset';

const Editor = () => {
  const { docId } = useDoc();
  const { testTypeId } = useTestType();
  const projectId = localStorage.getItem('currentProjectId');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const editorRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Fetch document content on mount and set it imperatively
  useEffect(() => {
    if (!docId) return;
    const fetchDoc = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const fetchedContent = response.data.doc.content || '';
        setContent(fetchedContent);
        // Set initial content imperatively to avoid React-managed children
        if (editorRef.current) {
          editorRef.current.innerText = fetchedContent;
        }
        setImages(response.data.doc.images || []);
        setAttachments(response.data.doc.attachments || []);
      } catch (error) {
        console.error('Error fetching document:', error.response?.data?.message || error.message);
      }
    };
    fetchDoc();
  }, [docId, projectId, testTypeId, token]);

  // Auto-save content
  const autoSave = async () => {
    if (!docId || !content) return;
    setIsAutoSaving(true);
    try {
      await axios.put(
        `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Document auto-saved');
    } catch (error) {
      console.error('Error auto-saving document:', error.response?.data?.message || error.message);
    } finally {
      setIsAutoSaving(false);
    }
  };

  // Handle content changes with debounce
  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerText;
      setContent(newContent);

      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(autoSave, 1000);
    }
  };

  // Handle Enter key for new line
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const br = document.createElement('br');
      range.insertNode(br);
      range.setStartAfter(br);
      range.setEndAfter(br);
      selection.removeAllRanges();
      selection.addRange(range);
      handleContentChange();
    }
  };

  // Handle paste for images
  const handlePaste = async (e) => {
    e.preventDefault();
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.includes('image')) {
        const file = item.getAsFile();
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', UPLOAD_PRESET);

          const response = await axios.post(CLOUDINARY_URL, formData);
          const { secure_url, public_id } = response.data;

          const docResponse = await axios.post(
            `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/images`,
            {
              url: secure_url,
              publicId: public_id,
              caption: file.name,
              altText: file.name,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setImages([...images, docResponse.data.images[docResponse.data.images.length - 1]]);

          const img = document.createElement('img');
          img.src = secure_url;
          img.alt = file.name;
          img.style.maxWidth = '100%';
          const selection = window.getSelection();
          const range = selection.getRangeAt(0);
          range.insertNode(img);
          range.setStartAfter(img);
          selection.removeAllRanges();
          selection.addRange(range);
          handleContentChange();
        } catch (error) {
          console.error('Error uploading pasted image:', error.response?.data?.message || error.message);
        }
      } else if (item.type.includes('text')) {
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
        handleContentChange();
      }
    }
  };

  // Update cursor position
  const updateCursorPosition = async () => {
    if (!docId) return;
    try {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editorRef.current);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      const position = preCaretRange.toString().length;
      const lineNumber = editorRef.current.innerText.substr(0, position).split('\n').length;
      const columnNumber = position - editorRef.current.innerText.lastIndexOf('\n', position - 1);

      await axios.put(
        `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/cursor`,
        {
          position,
          lineNumber,
          columnNumber,
          selectionStart: range.startOffset,
          selectionEnd: range.endOffset,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error updating cursor position:', error.response?.data?.message || error.message);
    }
  };

  // Clean up cursor on unmount
  useEffect(() => {
    return () => {
      if (!docId) return;
      axios.delete(
        `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/cursor`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch((error) => {
        console.error('Error removing cursor:', error.response?.data?.message || error.message);
      });
    };
  }, [docId, projectId, testTypeId, token]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 bg-white min-h-screen"
    >
      <div
        id="editor"
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onClick={updateCursorPosition}
        onKeyUp={updateCursorPosition}
        className="prose max-w-4xl mx-auto outline-none"
        style={{ minHeight: '300px' }}
      />
      <div className="mt-4">
        {images.map((img) => (
          <img
            key={img._id}
            src={img.url}
            alt={img.altText}
            className="max-w-full my-2"
          />
        ))}
        {attachments.map((att) => (
          <a
            key={att._id}
            href={att.url}
            className="text-blue-600 underline block my-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            {att.name}
          </a>
        ))}
      </div>
      {isAutoSaving && (
        <div className="fixed bottom-4 right-4 bg-green-50 text-green-700 px-3 py-1 rounded-lg">
          Saving...
        </div>
      )}
    </motion.div>
  );
};

export default Editor;