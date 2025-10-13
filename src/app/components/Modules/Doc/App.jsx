import React from 'react'
'use client';

function Document() {


  const BASE_URL = 'http://localhost:5000/api/v1/doc';
  const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dvytvjplt/image/upload';
  const CLOUDINARY_UPLOAD_PRESET = 'your_upload_preset'; // Replace with your actual preset

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Helper function to get project and test type IDs
  const getContextIds = () => {
    const projectId = typeof window !== 'undefined' ? localStorage.getItem('currentProjectId') : null;
    const testTypeId = typeof window !== 'undefined' ? localStorage.getItem('selectedTestTypeId') : null;
    return { projectId, testTypeId };
  };

  // Helper function to build URL with context
  const buildUrl = (endpoint) => {
    const { projectId, testTypeId } = getContextIds();
    return `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}${endpoint}`;
  };

  // ==========================
  // CLOUDINARY UPLOAD FUNCTIONS
  // ==========================

  const uploadImageToCloudinary = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'documents/images');

      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Image upload failed');

      const data = await response.json();
      return {
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
        format: data.format,
        size: data.bytes
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const uploadFileToCloudinary = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'documents/attachments');
      formData.append('resource_type', 'raw');

      const response = await fetch(CLOUDINARY_URL.replace('/image/', '/raw/'), {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('File upload failed');

      const data = await response.json();
      return {
        url: data.secure_url,
        publicId: data.public_id,
        fileType: data.format,
        size: data.bytes
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  // ==========================
  // CREATE OPERATIONS
  // ==========================

  const createDocument = async (docData) => {
    try {
      const response = await fetch(buildUrl('/docs'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(docData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create document');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  };

  // ==========================
  // READ OPERATIONS
  // ==========================

  const getAllDocuments = async () => {
    try {
      const response = await fetch(buildUrl('/docs'), {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch documents');
      return await response.json();
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  };

  const getDocumentById = async (docId) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}`), {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch document');
      return await response.json();
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  };

  const searchDocuments = async (query, filters = {}) => {
    try {
      const params = new URLSearchParams({ q: query, ...filters });
      const response = await fetch(buildUrl(`/docs/search?${params}`), {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Search failed');
      return await response.json();
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  };

  const getDocumentsByCategory = async (category) => {
    try {
      const response = await fetch(buildUrl(`/docs/category/${category}`), {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch documents by category');
      return await response.json();
    } catch (error) {
      console.error('Error fetching documents by category:', error);
      throw error;
    }
  };

  const getRecentDocuments = async (limit = 10) => {
    try {
      const response = await fetch(buildUrl(`/docs/recent?limit=${limit}`), {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch recent documents');
      return await response.json();
    } catch (error) {
      console.error('Error fetching recent documents:', error);
      throw error;
    }
  };

  const getDocumentsByTestType = async (testTypeId) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${BASE_URL}/docs/org/${testTypeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch documents by test type');
      return await response.json();
    } catch (error) {
      console.error('Error fetching documents by test type:', error);
      throw error;
    }
  };

  // ==========================
  // UPDATE OPERATIONS
  // ==========================

  const updateDocument = async (docId, updateData) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update document');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  };

  const updateDocumentStatus = async (docId, statusData) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/status`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(statusData)
      });

      if (!response.ok) throw new Error('Failed to update document status');
      return await response.json();
    } catch (error) {
      console.error('Error updating document status:', error);
      throw error;
    }
  };

  // ==========================
  // COMMENT OPERATIONS
  // ==========================

  const addComment = async (docId, commentData) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/comments`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(commentData)
      });

      if (!response.ok) throw new Error('Failed to add comment');
      return await response.json();
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  const replyToComment = async (docId, commentId, replyData) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/comments/${commentId}/reply`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(replyData)
      });

      if (!response.ok) throw new Error('Failed to reply to comment');
      return await response.json();
    } catch (error) {
      console.error('Error replying to comment:', error);
      throw error;
    }
  };

  const resolveComment = async (docId, commentId) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/comments/${commentId}/resolve`), {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to resolve comment');
      return await response.json();
    } catch (error) {
      console.error('Error resolving comment:', error);
      throw error;
    }
  };

  const deleteComment = async (docId, commentId) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/comments/${commentId}`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to delete comment');
      return await response.json();
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  };

  // ==========================
  // SUGGESTION OPERATIONS
  // ==========================

  const addSuggestion = async (docId, suggestionData) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/suggestions`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(suggestionData)
      });

      if (!response.ok) throw new Error('Failed to add suggestion');
      return await response.json();
    } catch (error) {
      console.error('Error adding suggestion:', error);
      throw error;
    }
  };

  const acceptSuggestion = async (docId, suggestionId) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/suggestions/${suggestionId}/accept`), {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to accept suggestion');
      return await response.json();
    } catch (error) {
      console.error('Error accepting suggestion:', error);
      throw error;
    }
  };

  const rejectSuggestion = async (docId, suggestionId) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/suggestions/${suggestionId}/reject`), {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to reject suggestion');
      return await response.json();
    } catch (error) {
      console.error('Error rejecting suggestion:', error);
      throw error;
    }
  };

  // ==========================
  // VERSION CONTROL OPERATIONS
  // ==========================

  const createVersionSnapshot = async (docId, versionData) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/versions`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(versionData)
      });

      if (!response.ok) throw new Error('Failed to create version snapshot');
      return await response.json();
    } catch (error) {
      console.error('Error creating version snapshot:', error);
      throw error;
    }
  };

  const getVersions = async (docId) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/versions`), {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch versions');
      return await response.json();
    } catch (error) {
      console.error('Error fetching versions:', error);
      throw error;
    }
  };

  const restoreVersion = async (docId, versionNumber) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/versions/${versionNumber}/restore`), {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to restore version');
      return await response.json();
    } catch (error) {
      console.error('Error restoring version:', error);
      throw error;
    }
  };

  // ==========================
  // COLLABORATION OPERATIONS
  // ==========================

  const addCollaborator = async (docId, collaboratorData) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/collaborators`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(collaboratorData)
      });

      if (!response.ok) throw new Error('Failed to add collaborator');
      return await response.json();
    } catch (error) {
      console.error('Error adding collaborator:', error);
      throw error;
    }
  };

  const updateCollaboratorPermission = async (docId, collaboratorId, permissionData) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/collaborators/${collaboratorId}`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(permissionData)
      });

      if (!response.ok) throw new Error('Failed to update collaborator permission');
      return await response.json();
    } catch (error) {
      console.error('Error updating collaborator permission:', error);
      throw error;
    }
  };

  const removeCollaborator = async (docId, collaboratorId) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/collaborators/${collaboratorId}`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to remove collaborator');
      return await response.json();
    } catch (error) {
      console.error('Error removing collaborator:', error);
      throw error;
    }
  };

  const getCollaborators = async (docId) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/collaborators`), {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch collaborators');
      return await response.json();
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      throw error;
    }
  };

  // ==========================
  // REAL-TIME COLLABORATION
  // ==========================

  const updateCursorPosition = async (docId, cursorData) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/cursor`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(cursorData)
      });

      if (!response.ok) throw new Error('Failed to update cursor position');
      return await response.json();
    } catch (error) {
      console.error('Error updating cursor position:', error);
      throw error;
    }
  };

  const removeCursor = async (docId) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/cursor`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to remove cursor');
      return await response.json();
    } catch (error) {
      console.error('Error removing cursor:', error);
      throw error;
    }
  };

  const removeTextFormat = async (docId, formatId) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/formatting/${formatId}`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to remove text format');
      return await response.json();
    } catch (error) {
      console.error('Error removing text format:', error);
      throw error;
    }
  };

  const clearFormatting = async (docId, rangeData) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/formatting`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify(rangeData)
      });

      if (!response.ok) throw new Error('Failed to clear formatting');
      return await response.json();
    } catch (error) {
      console.error('Error clearing formatting:', error);
      throw error;
    }
  };

  const applyTextFormat = async (docId, formatData) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/formatting`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formatData)
      });

      if (!response.ok) throw new Error('Failed to apply text format');
      return await response.json();
    } catch (error) {
      console.error('Error applying text format:', error);
      throw error;
    }
  };

  // ==========================
  // MEDIA OPERATIONS
  // ==========================

  const addImage = async (docId, file, caption = '', altText = '') => {
    try {
      // First upload to Cloudinary
      const uploadResult = await uploadImageToCloudinary(file);

      // Then add to document
      const response = await fetch(buildUrl(`/docs/${docId}/images`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          caption,
          altText
        })
      });

      if (!response.ok) throw new Error('Failed to add image');
      return await response.json();
    } catch (error) {
      console.error('Error adding image:', error);
      throw error;
    }
  };

  const updateImage = async (docId, imageId, updateData) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/images/${imageId}`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error('Failed to update image');
      return await response.json();
    } catch (error) {
      console.error('Error updating image:', error);
      throw error;
    }
  };

  const deleteImage = async (docId, imageId) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/images/${imageId}`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to delete image');
      return await response.json();
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  };

  // ==========================
  // ATTACHMENT OPERATIONS
  // ==========================

  const addAttachment = async (docId, file, description = '') => {
    try {
      // First upload to Cloudinary
      const uploadResult = await uploadFileToCloudinary(file);

      // Then add to document
      const response = await fetch(buildUrl(`/docs/${docId}/attachments`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: file.name,
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          fileType: uploadResult.fileType,
          size: uploadResult.size,
          description
        })
      });

      if (!response.ok) throw new Error('Failed to add attachment');
      return await response.json();
    } catch (error) {
      console.error('Error adding attachment:', error);
      throw error;
    }
  };

  const deleteAttachment = async (docId, attachmentId) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/attachments/${attachmentId}`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to delete attachment');
      return await response.json();
    } catch (error) {
      console.error('Error deleting attachment:', error);
      throw error;
    }
  };

  const downloadAttachment = async (docId, attachmentId) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/attachments/${attachmentId}/download`), {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to download attachment');
      return await response.json();
    } catch (error) {
      console.error('Error downloading attachment:', error);
      throw error;
    }
  };

  // ==========================
  // CODE BLOCK OPERATIONS
  // ==========================

  const addCodeBlock = async (docId, codeData) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/code-blocks`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(codeData)
      });

      if (!response.ok) throw new Error('Failed to add code block');
      return await response.json();
    } catch (error) {
      console.error('Error adding code block:', error);
      throw error;
    }
  };

  const updateCodeBlock = async (docId, codeBlockId, updateData) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/code-blocks/${codeBlockId}`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error('Failed to update code block');
      return await response.json();
    } catch (error) {
      console.error('Error updating code block:', error);
      throw error;
    }
  };

  const deleteCodeBlock = async (docId, codeBlockId) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/code-blocks/${codeBlockId}`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to delete code block');
      return await response.json();
    } catch (error) {
      console.error('Error deleting code block:', error);
      throw error;
    }
  };

  const copyCodeBlock = async (docId, codeBlockId) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/code-blocks/${codeBlockId}/copy`), {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to copy code block');
      return await response.json();
    } catch (error) {
      console.error('Error copying code block:', error);
      throw error;
    }
  };

  // ==========================
  // TABLE OPERATIONS
  // ==========================

  const addTable = async (docId, tableData) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/tables`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(tableData)
      });

      if (!response.ok) throw new Error('Failed to add table');
      return await response.json();
    } catch (error) {
      console.error('Error adding table:', error);
      throw error;
    }
  };

  const updateTable = async (docId, tableId, updateData) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/tables/${tableId}`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error('Failed to update table');
      return await response.json();
    } catch (error) {
      console.error('Error updating table:', error);
      throw error;
    }
  };

  const deleteTable = async (docId, tableId) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/tables/${tableId}`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to delete table');
      return await response.json();
    } catch (error) {
      console.error('Error deleting table:', error);
      throw error;
    }
  };

  // ==========================
  // ACCESS LOG OPERATIONS
  // ==========================

  const getAccessLogs = async (docId, limit = 50, skip = 0) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/access-logs?limit=${limit}&skip=${skip}`), {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch access logs');
      return await response.json();
    } catch (error) {
      console.error('Error fetching access logs:', error);
      throw error;
    }
  };

  // ==========================
  // DOCUMENT MANAGEMENT
  // ==========================

  const togglePin = async (docId) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/pin`), {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to toggle pin');
      return await response.json();
    } catch (error) {
      console.error('Error toggling pin:', error);
      throw error;
    }
  };

  const toggleStar = async (docId) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/star`), {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to toggle star');
      return await response.json();
    } catch (error) {
      console.error('Error toggling star:', error);
      throw error;
    }
  };

  const archiveDocument = async (docId) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/archive`), {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to archive document');
      return await response.json();
    } catch (error) {
      console.error('Error archiving document:', error);
      throw error;
    }
  };

  const unarchiveDocument = async (docId) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/unarchive`), {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to unarchive document');
      return await response.json();
    } catch (error) {
      console.error('Error unarchiving document:', error);
      throw error;
    }
  };

  const deleteDocument = async (docId) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to delete document');
      return await response.json();
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  };

  const getDocumentStats = async (docId) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/stats`), {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch document stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching document stats:', error);
      throw error;
    }
  };

  const duplicateDocument = async (docId, title) => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/duplicate`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title })
      });

      if (!response.ok) throw new Error('Failed to duplicate document');
      return await response.json();
    } catch (error) {
      console.error('Error duplicating document:', error);
      throw error;
    }
  };

  const exportDocument = async (docId, format = 'txt') => {
    try {
      const response = await fetch(buildUrl(`/docs/${docId}/ ?format=${format}`), {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to   document');

      // Get the content type from response
      const contentType = response.headers.get('content-type');

      if (contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error('Error exporting document:', error);
      throw error;
    }
  };

  // ==========================
  // UTILITY FUNCTIONS
  // ==========================

  const handleApiError = (error) => {
    if (error.message.includes('token') || error.message.includes('auth')) {
      // Redirect to login or refresh token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return error.message;
  };

  const validateContextIds = () => {
    const { projectId, testTypeId } = getContextIds();
    if (!projectId || !testTypeId) {
      throw new Error('Project ID and Test Type ID are required. Please select a project and test type.');
    }
    return true;
  };
  return (
    <div>App</div>
  )
}

export default Document