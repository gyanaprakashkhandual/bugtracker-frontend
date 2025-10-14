// DocEditorApp.jsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Search, Filter, Grid, List, Save, Image as ImageIcon, Paperclip, X, Users, MessageSquare, Clock, Maximize2, Minimize2 } from 'lucide-react';
import { useTestType } from '@/app/script/TestType.context';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import debounce from 'lodash.debounce';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import Navbar from './Navbar';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import Toolbar from './Toolbar';
import Statusbar from './Statusbar';
import * as api from './api.service';

const BASE_URL = 'http://localhost:5000/api/v1/doc';
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dvytvjplt/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'test_case_preset';

const DocEditorApp = () => {
  const router = useRouter();
  const pathname = usePathname();
  const projectId = typeof window !== 'undefined' ? localStorage.getItem('currentProjectId') : null;
  const { testTypeId } = useTestType();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [documents, setDocuments] = useState([]);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const quillRef = useRef(null);
  const editorRef = useRef(null);
  const autoSaveTimeout = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: false, // Custom toolbar is used
        },
      });
      quillRef.current.on('text-change', () => {
        if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
        autoSaveTimeout.current = setTimeout(async () => {
          if (currentDoc) {
            setSaving(true);
            try {
              await api.updateDoc(projectId, testTypeId, currentDoc._id, {
                content: JSON.stringify(quillRef.current.getContents()),
                textFormats: quillRef.current.getFormat(),
              });
            } catch (error) {
              console.error('Failed to auto-save:', error);
            } finally {
              setSaving(false);
            }
          }
        }, 2000);
      });
    }
  }, [currentDoc, projectId, testTypeId]);

  const loadDocuments = useCallback(
    debounce(async () => {
      if (!projectId || !testTypeId) return;
      setLoading(true);
      try {
        const response = await api.getDocsByProjectAndTestType(projectId, testTypeId);
        setDocuments(response.docs);
      } catch (error) {
        console.error('Failed to load documents:', error);
      } finally {
        setLoading(false);
      }
    }, 300),
    [projectId, testTypeId]
  );

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleCreateDoc = async () => {
    try {
      const newDoc = await api.createDoc(projectId, testTypeId, {
        title: newDocForm.title || 'Untitled Document',
        description: newDocForm.description,
        category: newDocForm.category,
        priority: newDocForm.priority,
      });
      setDocuments([...documents, newDoc.doc]);
      setCurrentDoc(newDoc.doc);
      setShowCreateModal(false);
      setShowEditor(true);
      if (quillRef.current) quillRef.current.setContents([]);
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const handleDocSelect = async (docId) => {
    try {
      const doc = await api.getDocById(projectId, testTypeId, docId);
      setCurrentDoc(doc.doc);
      setShowEditor(true);
      if (quillRef.current && doc.doc.content) {
        quillRef.current.setContents(JSON.parse(doc.doc.content));
      }
    } catch (error) {
      console.error('Failed to load document:', error);
    }
  };

  const handleUploadMedia = async (file, type) => {
    setUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      const response = await axios.post(CLOUDINARY_URL, formData);
      const { secure_url, public_id } = response.data;
      if (type === 'image') {
        await api.addImage(projectId, testTypeId, currentDoc._id, {
          url: secure_url,
          publicId: public_id,
        });
      } else {
        await api.addAttachment(projectId, testTypeId, currentDoc._id, {
          name: file.name,
          url: secure_url,
          publicId: public_id,
          fileType: file.type,
          size: file.size,
        });
      }
      handleDocSelect(currentDoc._id);
    } catch (error) {
      console.error('Failed to upload media:', error);
    } finally {
      setUploadingMedia(false);
    }
  };

  const [newDocForm, setNewDocForm] = useState({
    title: '',
    description: '',
    category: 'documentation',
    priority: 'medium',
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen flex flex-col bg-gray-50 text-sm font-sans"
    >
      <Navbar
        projectId={projectId}
        testTypeId={testTypeId}
        currentDocId={currentDoc?._id}
        onDocSelected={handleDocSelect}
        onCreateNew={handleCreateDoc}
      />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar
          doc={currentDoc}
          versions={currentDoc?.versions || []}
          onRestore={async (version) => {
            await api.restoreVersion(projectId, testTypeId, currentDoc._id, version.versionNumber);
            handleDocSelect(currentDoc._id);
          }}
          onDuplicate={async () => {
            const dup = await api.duplicateDoc(projectId, testTypeId, currentDoc._id, {});
            setDocuments([...documents, dup.doc]);
            handleDocSelect(dup.doc._id);
          }}
          onExport={async (format) => {
            const data = await api.exportDoc(projectId, testTypeId, currentDoc._id, format);
            const blob = new Blob([data], { type: format === 'txt' ? 'text/plain' : 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${currentDoc.title}.${format}`;
            link.click();
            window.URL.revokeObjectURL(url);
          }}
          onArchive={async () => {
            await api.archiveDoc(projectId, testTypeId, currentDoc._id);
            handleDocSelect(currentDoc._id);
          }}
          onUnarchive={async () => {
            await api.unarchiveDoc(projectId, testTypeId, currentDoc._id);
            handleDocSelect(currentDoc._id);
          }}
          onDelete={async () => {
            await api.deleteDoc(projectId, testTypeId, currentDoc._id);
            setDocuments(documents.filter((d) => d._id !== currentDoc._id));
            setCurrentDoc(null);
            setShowEditor(false);
          }}
          onPin={async () => {
            await api.togglePin(projectId, testTypeId, currentDoc._id);
            handleDocSelect(currentDoc._id);
          }}
          onStar={async () => {
            await api.toggleStar(projectId, testTypeId, currentDoc._id);
            handleDocSelect(currentDoc._id);
          }}
        />
        <div className="flex-1 p-4 overflow-auto">
          {showEditor && currentDoc ? (
            <>
              <Toolbar
                quillRef={quillRef}
                onAddImage={handleUploadMedia}
                onAddAttachment={handleUploadMedia}
                onAddCodeBlock={async (data) => {
                  await api.addCodeBlock(projectId, testTypeId, currentDoc._id, data);
                  handleDocSelect(currentDoc._id);
                }}
                onAddTable={async (data) => {
                  await api.addTable(projectId, testTypeId, currentDoc._id, data);
                  handleDocSelect(currentDoc._id);
                }}
                onClearFormat={async (range) => {
                  await api.clearFormatting(projectId, testTypeId, currentDoc._id, range);
                  handleDocSelect(currentDoc._id);
                }}
              />
              <div
                ref={editorRef}
                className={`bg-white p-4 rounded shadow text-sm ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
              />
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="absolute top-4 right-4"
              >
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
            </>
          ) : (
            <p>Select a document to edit</p>
          )}
        </div>
        <RightSidebar
          comments={currentDoc?.comments || []}
          onAddComment={async (data) => {
            await api.addComment(projectId, testTypeId, currentDoc._id, data);
            handleDocSelect(currentDoc._id);
          }}
          onReplyComment={async (commentId, data) => {
            await api.replyToComment(projectId, testTypeId, currentDoc._id, commentId, data);
            handleDocSelect(currentDoc._id);
          }}
          onResolveComment={async (commentId) => {
            await api.resolveComment(projectId, testTypeId, currentDoc._id, commentId);
            handleDocSelect(currentDoc._id);
          }}
          onDeleteComment={async (commentId) => {
            await api.deleteComment(projectId, testTypeId, currentDoc._id, commentId);
            handleDocSelect(currentDoc._id);
          }}
          suggestions={currentDoc?.suggestions || []}
          onAddSuggestion={async (data) => {
            await api.addSuggestion(projectId, testTypeId, currentDoc._id, data);
            handleDocSelect(currentDoc._id);
          }}
          onAcceptSuggestion={async (suggestionId) => {
            await api.acceptSuggestion(projectId, testTypeId, currentDoc._id, suggestionId);
            handleDocSelect(currentDoc._id);
          }}
          onRejectSuggestion={async (suggestionId) => {
            await api.rejectSuggestion(projectId, testTypeId, currentDoc._id, suggestionId);
            handleDocSelect(currentDoc._id);
          }}
          collaborators={currentDoc?.collaborators || []}
          onAddCollaborator={async (data) => {
            await api.addCollaborator(projectId, testTypeId, currentDoc._id, data);
            handleDocSelect(currentDoc._id);
          }}
          onUpdatePermission={async (collaboratorId, data) => {
            await api.updateCollaboratorPermission(projectId, testTypeId, currentDoc._id, collaboratorId, data);
            handleDocSelect(currentDoc._id);
          }}
          onRemoveCollaborator={async (collaboratorId) => {
            await api.removeCollaborator(projectId, testTypeId, currentDoc._id, collaboratorId);
            handleDocSelect(currentDoc._id);
          }}
          cursors={currentDoc?.currentEditors || []}
          onUpdateStatus={async (data) => {
            await api.updateDocStatus(projectId, testTypeId, currentDoc._id, data);
            handleDocSelect(currentDoc._id);
          }}
        />
      </div>
      <Statusbar
        isSaving={saving}
        cursors={currentDoc?.currentEditors || []}
        stats={async () => await api.getDocStats(projectId, testTypeId, currentDoc?._id)}
        logs={async () => await api.getAccessLogs(projectId, testTypeId, currentDoc?._id)}
      />
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white p-4 rounded shadow w-96"
            >
              <h3 className="font-bold mb-2">Create New Document</h3>
              <input
                value={newDocForm.title}
                onChange={(e) => setNewDocForm({ ...newDocForm, title: e.target.value })}
                placeholder="Title"
                className="w-full p-2 mb-2 border rounded"
              />
              <textarea
                value={newDocForm.description}
                onChange={(e) => setNewDocForm({ ...newDocForm, description: e.target.value })}
                placeholder="Description"
                className="w-full p-2 mb-2 border rounded"
              />
              <select
                value={newDocForm.category}
                onChange={(e) => setNewDocForm({ ...newDocForm, category: e.target.value })}
                className="w-full p-2 mb-2 border rounded"
              >
                <option value="documentation">Documentation</option>
                <option value="test-cases">Test Cases</option>
              </select>
              <select
                value={newDocForm.priority}
                onChange={(e) => setNewDocForm({ ...newDocForm, priority: e.target.value })}
                className="w-full p-2 mb-2 border rounded"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button
                onClick={handleCreateDoc}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="ml-2 px-4 py-2 rounded border"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DocEditorApp;