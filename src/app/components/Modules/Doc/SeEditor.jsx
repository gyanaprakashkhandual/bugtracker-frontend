// docEditorUI.js - Part 2: All Tab Content Components, Modals, and Editor

import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, MessageSquare, Sparkles, History, Users, Image, Activity, Settings,
  Trash2, Reply, CornerDownRight, Check, X, Plus, RefreshCw, Download,
  Copy, Paperclip, Edit3, Tag, Clock, TrendingUp, Monitor, Upload,
  ZoomIn, ZoomOut, Menu, Save, FileText, Code, Table as TableIcon
} from 'lucide-react';

// ========================
// ENHANCED EDITOR TAB WITH ENTER KEY HANDLING
// ========================

export const EditorTab = ({
  editorRef,
  title,
  setTitle,
  description,
  setDescription,
  tags,
  handleAddTag,
  handleRemoveTag,
  content,
  handleContentChange,
  currentFormat,
  images,
  document,
  handleDeleteImage,
  codeBlocks,
  handleDeleteCodeBlock,
  handleCopyCodeBlock,
  tables,
  handleDeleteTable,
  updateCursorStats,
  handleImageFromClipboard
}) => {
  const handleEditorInput = (e) => {
    const text = e.currentTarget.textContent || '';
    handleContentChange(text);
  };

  const handleEditorKeyDown = (e) => {
    // Enhanced Enter key handling - maintain cursor position at line start
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      
      // Create a new line with proper formatting
      const br = document.createElement('br');
      range.deleteContents();
      range.insertNode(br);
      
      // Move cursor to the start of new line
      range.setStartAfter(br);
      range.setEndAfter(br);
      range.collapse(true);
      
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Trigger input event to update content
      const text = editorRef.current.textContent || '';
      handleContentChange(text);
      updateCursorStats();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 min-h-[800px]">
        <div className="p-12">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document Title"
            className="w-full text-3xl font-bold text-gray-900 border-none outline-none mb-2 placeholder-gray-300"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            className="w-full text-sm text-gray-600 border-none outline-none mb-6 placeholder-gray-300"
          />

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag, idx) => (
              <span
                key={`tag-${idx}-${tag}`}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
              >
                <Tag size={10} />
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            <button
              onClick={() => {
                const tag = prompt('Enter tag:');
                if (tag) handleAddTag(tag);
              }}
              className="inline-flex items-center gap-1 px-2 py-1 border border-dashed border-gray-300 text-gray-500 rounded-full text-xs hover:border-blue-400 hover:text-blue-600"
            >
              <Plus size={10} />
              Add Tag
            </button>
          </div>

          {/* Enhanced Editor with Enter Key Support */}
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            onKeyDown={handleEditorKeyDown}
            onSelect={updateCursorStats}
            onPaste={handleImageFromClipboard}
            className="min-h-[600px] text-sm text-gray-800 leading-relaxed outline-none focus:outline-none"
            style={{
              fontFamily: currentFormat.fontFamily,
              fontSize: `${currentFormat.fontSize}px`,
              lineHeight: currentFormat.lineHeight,
              textAlign: currentFormat.textAlign,
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            }}
            suppressContentEditableWarning
          >
            {content}
          </div>

          {/* Display Images */}
          {images.length > 0 && (
            <div className="mt-6 space-y-4">
              {images.map((img) => (
                <div key={`image-${img._id}`} className="relative group">
                  <img
                    src={img.url}
                    alt={img.altText || 'Document image'}
                    className="max-w-full rounded-lg border border-gray-200"
                  />
                  {img.caption && (
                    <p className="text-xs text-gray-600 italic mt-1">{img.caption}</p>
                  )}
                  <button
                    onClick={() => document?._id && handleDeleteImage(img._id)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Display Code Blocks */}
          {codeBlocks.length > 0 && (
            <div className="mt-6 space-y-4">
              {codeBlocks.map((cb) => (
                <div key={`codeblock-${cb._id}`} className="relative group">
                  <div className="bg-gray-900 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                      <span className="text-xs text-gray-300">{cb.language}</span>
                      <button
                        onClick={() => document?._id && handleCopyCodeBlock(cb._id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-300 hover:text-white transition-colors"
                      >
                        <Copy size={12} />
                        Copy
                      </button>
                    </div>
                    <pre className="p-4 overflow-x-auto">
                      <code className="text-xs text-gray-100 font-mono">{cb.code}</code>
                    </pre>
                  </div>
                  <button
                    onClick={() => document?._id && handleDeleteCodeBlock(cb._id)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Display Tables */}
          {tables.length > 0 && (
            <div className="mt-6 space-y-4">
              {tables.map((table) => (
                <div key={`table-${table._id}`} className="relative group overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-xs">
                    <thead>
                      <tr className="bg-gray-50">
                        {table.headers?.map((header, idx) => (
                          <th key={`header-${idx}`} className="border border-gray-300 px-3 py-2 text-left font-semibold">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows?.map((row, rowIdx) => (
                        <tr key={`row-${rowIdx}`}>
                          {row.map((cell, cellIdx) => (
                            <td key={`cell-${rowIdx}-${cellIdx}`} className="border border-gray-300 px-3 py-2">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    onClick={() => document?._id && handleDeleteTable(table._id)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ========================
// PREVIEW TAB
// ========================

export const PreviewTab = ({ title, description, tags, content, images }) => (
  <div className="flex-1 overflow-y-auto p-6">
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 min-h-[800px] p-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      {description && (
        <p className="text-sm text-gray-600 mb-6">{description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {tags.map((tag, idx) => (
          <span key={`preview-tag-${idx}`} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
            {tag}
          </span>
        ))}
      </div>

      <div className="prose prose-sm max-w-none">
        <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />
      </div>

      {images.length > 0 && (
        <div className="mt-6 space-y-4">
          {images.map((img) => (
            <div key={`preview-image-${img._id}`}>
              <img src={img.url} alt={img.altText} className="max-w-full rounded-lg" />
              {img.caption && <p className="text-xs text-gray-600 italic mt-1">{img.caption}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// ========================
// COMMENTS TAB
// ========================

export const CommentsTab = ({
  comments,
  document,
  setShowCommentBox,
  handleResolveComment,
  handleDeleteComment,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  handleReplyToComment
}) => (
  <div className="flex-1 overflow-y-auto p-6">
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Comments</h2>
        <button
          onClick={() => setShowCommentBox(true)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus size={16} />
          New Comment
        </button>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <motion.div
            key={`comment-${comment._id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {comment.userId?.name?.[0] || 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{comment.userId?.name || 'Anonymous'}</p>
                  <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {comment.resolved ? (
                  <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">Resolved</span>
                ) : (
                  <button
                    onClick={() => document?._id && handleResolveComment(comment._id)}
                    className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Resolve
                  </button>
                )}
                <button
                  onClick={() => document?._id && handleDeleteComment(comment._id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-3">{comment.text}</p>

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-8 space-y-2 mt-3 pt-3 border-t border-gray-100">
                {comment.replies.map((reply, idx) => (
                  <div key={`reply-${comment._id}-${idx}`} className="flex items-start gap-2">
                    <CornerDownRight size={14} className="text-gray-400 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-semibold text-gray-900">{reply.userId?.name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500">{new Date(reply.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p className="text-xs text-gray-700">{reply.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Form */}
            {replyingTo === comment._id ? (
              <div className="ml-8 mt-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                    className="px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReplyToComment(comment._id, { text: replyText })}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Reply
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setReplyingTo(comment._id)}
                className="ml-8 mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
              >
                <Reply size={12} />
                Reply
              </button>
            )}
          </motion.div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-sm text-gray-500">No comments yet</p>
            <p className="text-xs text-gray-400 mt-1">Be the first to add a comment</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

// ========================
// SUGGESTIONS TAB
// ========================

export const SuggestionsTab = ({
  suggestions,
  document,
  setShowSuggestionBox,
  handleAcceptSuggestion,
  handleRejectSuggestion
}) => (
  <div className="flex-1 overflow-y-auto p-6">
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Suggestions</h2>
        <button
          onClick={() => setShowSuggestionBox(true)}
          className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
        >
          <Sparkles size={16} />
          New Suggestion
        </button>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <motion.div
            key={`suggestion-${suggestion._id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Suggested by {suggestion.userId?.name || 'Anonymous'}</p>
                  <p className="text-xs text-gray-400">{new Date(suggestion.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                suggestion.status === 'accepted' ? 'bg-green-50 text-green-700' :
                suggestion.status === 'rejected' ? 'bg-red-50 text-red-700' :
                'bg-yellow-50 text-yellow-700'
              }`}>
                {suggestion.status}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              <div className="bg-red-50 border border-red-200 rounded p-2">
                <p className="text-xs text-gray-500 mb-1">Original:</p>
                <p className="text-sm text-gray-900 line-through">{suggestion.originalText}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded p-2">
                <p className="text-xs text-gray-500 mb-1">Suggested:</p>
                <p className="text-sm text-gray-900">{suggestion.suggestedText}</p>
              </div>
            </div>

            {suggestion.description && (
              <p className="text-xs text-gray-600 mb-3">{suggestion.description}</p>
            )}

            {suggestion.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => document?._id && handleAcceptSuggestion(suggestion._id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs"
                >
                  <Check size={12} />
                  Accept
                </button>
                <button
                  onClick={() => document?._id && handleRejectSuggestion(suggestion._id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs"
                >
                  <X size={12} />
                  Reject
                </button>
              </div>
            )}
          </motion.div>
        ))}

        {suggestions.length === 0 && (
          <div className="text-center py-12">
            <Sparkles size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-sm text-gray-500">No suggestions yet</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

// ========================
// VERSIONS TAB
// ========================

export const VersionsTab = ({
  versions,
  document,
  setShowVersionModal,
  handleRestoreVersion
}) => (
  <div className="flex-1 overflow-y-auto p-6">
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Version History</h2>
        <button
          onClick={() => setShowVersionModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus size={16} />
          Create Version
        </button>
      </div>

      <div className="space-y-3">
        {versions.map((version, idx) => (
          <motion.div
            key={`version-${version._id || idx}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <History size={16} className="text-blue-600" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    {version.versionName || `Version ${version.versionNumber}`}
                  </h3>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    v{version.versionNumber}
                  </span>
                </div>
                {version.description && (
                  <p className="text-xs text-gray-600 mb-2">{version.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{new Date(version.createdAt).toLocaleString()}</span>
                  <span>•</span>
                  <span>By {version.createdBy?.name || 'Unknown'}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (document?._id && confirm(`Restore to version ${version.versionNumber}?`)) {
                    handleRestoreVersion(version.versionNumber);
                  }
                }}
                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Restore
              </button>
            </div>
          </motion.div>
        ))}

        {versions.length === 0 && (
          <div className="text-center py-12">
            <History size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-sm text-gray-500">No version history</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

// ========================
// COLLABORATORS TAB
// ========================

export const CollaboratorsTab = ({
  collaborators,
  currentEditors,
  document,
  setShowCollaboratorBox,
  handleUpdateCollaboratorPermission,
  handleRemoveCollaborator
}) => (
  <div className="flex-1 overflow-y-auto p-6">
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Collaborators</h2>
        <button
          onClick={() => setShowCollaboratorBox(true)}
          className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
        >
          <Plus size={16} />
          Add Collaborator
        </button>
      </div>

      {/* Current Editors */}
      {currentEditors.length > 0 && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-green-900 mb-3">Currently Editing</h3>
          <div className="space-y-2">
            {currentEditors.map((editor, idx) => (
              <div key={`editor-${editor.userId || idx}`} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-800">{editor.userId?.name || 'Anonymous'}</span>
                <span className="text-xs text-green-600">• Line {editor.lineNumber}, Col {editor.columnNumber}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collaborators List */}
      <div className="space-y-3">
        {collaborators.map((collab) => (
          <motion.div
            key={`collaborator-${collab._id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {collab.userId?.name?.[0] || 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{collab.userId?.name || 'Anonymous'}</p>
                  <p className="text-xs text-gray-500">{collab.userId?.email || 'No email'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={collab.permission}
                  onChange={(e) => {
                    if (document?._id) {
                      handleUpdateCollaboratorPermission(collab._id, { permission: e.target.value });
                    }
                  }}
                  className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="view">View</option>
                  <option value="comment">Comment</option>
                  <option value="edit">Edit</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  onClick={() => {
                    if (document?._id && confirm('Remove this collaborator?')) {
                      handleRemoveCollaborator(collab._id);
                    }
                  }}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {collaborators.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-sm text-gray-500">No collaborators yet</p>
          </div>
        )}
      </div>
    </div>
  </div>
);