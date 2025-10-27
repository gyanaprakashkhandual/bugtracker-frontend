'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EditorContent } from '@tiptap/react';
import { Check, Upload, Loader2, X, MessageSquare, Send, Trash2 } from 'lucide-react';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dvytvjplt/image/upload';
const UPLOAD_PRESET = 'test_case_preset';

const EditorContentArea = ({
  editor,
  showLinkDialog,
  setShowLinkDialog,
  showImageDialog,
  setShowImageDialog
}) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [comments, setComments] = useState([]);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const fileInputRef = useRef(null);

  // Upload image to Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };

  // Handle image file selection
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
    }
  };

  // Handle file upload (for general files)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      if (file.type.startsWith('image/')) {
        const imageUrl = await uploadToCloudinary(file);
        editor.chain().focus().setImage({ src: imageUrl }).run();
      } else {
        // Handle other file types (PDF, DOC, etc.)
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        const response = await fetch(CLOUDINARY_URL, {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          editor.chain().focus().insertContent(
            `<a href="${data.secure_url}" target="_blank" class="file-link">${file.name}</a>`
          ).run();
        }
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
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

  // Insert image (from URL or file upload)
  const insertImage = async () => {
    if (!editor) return;

    setIsUploading(true);

    try {
      let finalImageUrl = imageUrl;

      // If file is selected, upload to Cloudinary first
      if (imageFile) {
        finalImageUrl = await uploadToCloudinary(imageFile);
      }

      if (finalImageUrl) {
        editor.chain().focus().setImage({ src: finalImageUrl }).run();
        setShowImageDialog(false);
        setImageUrl('');
        setImageFile(null);
      }
    } catch (error) {
      console.error('Error inserting image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Add comment
  const addComment = () => {
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      text: commentText,
      selectedText: selectedText,
      timestamp: new Date().toLocaleString(),
      author: 'Current User'
    };

    setComments([...comments, newComment]);
    setCommentText('');
    setShowCommentDialog(false);
  };

  // Delete comment
  const deleteComment = (commentId) => {
    setComments(comments.filter(c => c.id !== commentId));
  };

  // Handle paste event for images
  React.useEffect(() => {
    if (!editor) return;

    const handlePaste = async (event) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item.type.indexOf('image') !== -1) {
          event.preventDefault();

          const file = item.getAsFile();
          if (file) {
            try {
              setIsUploading(true);
              const imageUrl = await uploadToCloudinary(file);
              editor.chain().focus().setImage({ src: imageUrl }).run();
            } catch (error) {
              console.error('Error uploading pasted image:', error);
              alert('Failed to upload image. Please try again.');
            } finally {
              setIsUploading(false);
            }
          }
        }
      }
    };

    // Handle drag and drop for files
    const handleDrop = async (event) => {
      event.preventDefault();
      const files = event.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      setIsUploading(true);

      try {
        if (file.type.startsWith('image/')) {
          const imageUrl = await uploadToCloudinary(file);
          editor.chain().focus().setImage({ src: imageUrl }).run();
        } else {
          // Handle other file types
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', UPLOAD_PRESET);

          const response = await fetch(CLOUDINARY_URL, {
            method: 'POST',
            body: formData
          });

          if (response.ok) {
            const data = await response.json();
            editor.chain().focus().insertContent(
              `<a href="${data.secure_url}" target="_blank" class="file-link">${file.name}</a>`
            ).run();
          }
        }
      } catch (error) {
        console.error('Error uploading dropped file:', error);
        alert('Failed to upload file. Please try again.');
      } finally {
        setIsUploading(false);
      }
    };

    const handleDragOver = (event) => {
      event.preventDefault();
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener('paste', handlePaste);
    editorElement.addEventListener('drop', handleDrop);
    editorElement.addEventListener('dragover', handleDragOver);

    return () => {
      editorElement.removeEventListener('paste', handlePaste);
      editorElement.removeEventListener('drop', handleDrop);
      editorElement.removeEventListener('dragover', handleDragOver);
    };
  }, [editor]);

  // Expose file input click to parent
  React.useEffect(() => {
    const fileUploadButton = document.getElementById('trigger-file-upload');
    if (fileUploadButton) {
      fileUploadButton.onclick = () => fileInputRef.current?.click();
    }
  }, []);

  return (
    <>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-5xl mx-auto px-6 py-8"
      >
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 min-h-[600px] relative">
          {/* Simple Bubble Menu functionality - appears on text selection */}
          {editor && editor.isActive && (
            <div className="hidden">
              {/* Bubble menu handled through editor state */}
            </div>
          )}

          <EditorContent editor={editor} className="text-gray-900 dark:text-gray-100" />

          {/* Upload indicator */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center rounded-xl">
              <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-lg flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-gray-900 dark:text-white font-medium">Uploading...</span>
              </div>
            </div>
          )}
        </div>

        {/* Comments Section */}
        {comments.length > 0 && (
          <div className="mt-6 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comments ({comments.length})
            </h3>
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{comment.author}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{comment.timestamp}</p>
                    </div>
                    <button
                      onClick={() => deleteComment(comment.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {comment.selectedText && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-2 border-l-2 border-blue-500 pl-2">
                      "{comment.selectedText}"
                    </p>
                  )}
                  <p className="text-sm text-gray-900 dark:text-gray-100">{comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.main>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        accept="*/*"
      />

      {/* Link Dialog */}
      <AnimatePresence>
        {showLinkDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowLinkDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-800"
            >
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Insert Link</h3>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors mb-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && insertLink()}
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowLinkDialog(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-900 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={insertLink}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 text-white"
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
            className="fixed inset-0 bg-black/40 bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowImageDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-800"
            >
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Insert Image</h3>

              {/* Image URL Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">OR</span>
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700"></div>
              </div>

              {/* File Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Image
                </label>
                <label className="flex items-center justify-center w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                  <Upload className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {imageFile ? imageFile.name : 'Choose file'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowImageDialog(false);
                    setImageUrl('');
                    setImageFile(null);
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-900 dark:text-white"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  onClick={insertImage}
                  disabled={(!imageUrl && !imageFile) || isUploading}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Insert
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment Dialog */}
      <AnimatePresence>
        {showCommentDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCommentDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-800"
            >
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Add Comment
              </h3>

              {selectedText && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{selectedText}"</p>
                </div>
              )}

              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your comment..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors mb-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-h-[100px] resize-none"
                autoFocus
              />

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowCommentDialog(false);
                    setCommentText('');
                    setSelectedText('');
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-900 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={addComment}
                  disabled={!commentText.trim()}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  Add Comment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EditorContentArea;