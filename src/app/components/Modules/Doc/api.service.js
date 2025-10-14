// docEditorAPI.js

import { BASE_URL, CLOUDINARY_URL, CLOUDINARY_PRESET } from './Constant';
import { getHeaders, getProjectAndTestType } from './Utils';

// ========================
// DOCUMENT CRUD OPERATIONS
// ========================

export const createNewDoc = async (docData, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(docData),
      }
    );
    if (!response.ok) throw new Error('Failed to create document');
    const data = await response.json();
    showNotification('Document created successfully');
    return data.doc;
  } catch (err) {
    showNotification(err.message, 'error');
    throw err;
  }
};

export const fetchDocById = async (id, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}`,
      { headers: getHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch document');
    const data = await response.json();
    showNotification('Document loaded');
    return data.doc;
  } catch (err) {
    showNotification(err.message, 'error');
    throw err;
  }
};

export const updateDocInfo = async (id, docData, showNotification, onSave) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(docData),
      }
    );
    if (!response.ok) throw new Error('Failed to update document');
    const data = await response.json();
    showNotification('Document updated');
    if (onSave) onSave(data.doc);
    return data.doc;
  } catch (err) {
    showNotification(err.message, 'error');
    throw err;
  }
};

export const deleteDocument = async (id, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}`,
      {
        method: 'DELETE',
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to delete document');
    showNotification('Document deleted');
    return true;
  } catch (err) {
    showNotification(err.message, 'error');
    throw err;
  }
};

// ========================
// DOCUMENT SEARCH & FILTER
// ========================

export const searchDocuments = async (query, filters = {}, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  const params = new URLSearchParams({ q: query, ...filters });
  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/search?${params}`,
      { headers: getHeaders() }
    );
    if (!response.ok) throw new Error('Failed to search documents');
    return await response.json();
  } catch (err) {
    showNotification(err.message, 'error');
    throw err;
  }
};

export const getDocsByCategory = async (cat, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/category/${cat}`,
      { headers: getHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch documents');
    return await response.json();
  } catch (err) {
    showNotification(err.message, 'error');
    throw err;
  }
};

export const getRecentDocuments = async (limit = 10, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/recent?limit=${limit}`,
      { headers: getHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch recent documents');
    return await response.json();
  } catch (err) {
    showNotification(err.message, 'error');
    throw err;
  }
};

// ========================
// DOCUMENT ACTIONS
// ========================

export const exportDocument = async (id, format = 'txt', title, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/export?format=${format}`,
      { headers: getHeaders() }
    );
    if (!response.ok) throw new Error('Failed to export document');
    const text = await response.text();
    
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`);
    element.setAttribute('download', `${title || 'document'}.${format}`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    showNotification(`Document exported as ${format}`);
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

export const updateDocStatus = async (id, statusData, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/status`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(statusData),
      }
    );
    if (!response.ok) throw new Error('Failed to update status');
    const data = await response.json();
    showNotification('Status updated');
    return data.doc;
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

export const duplicateDocument = async (id, newTitle, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/duplicate`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ title: newTitle }),
      }
    );
    if (!response.ok) throw new Error('Failed to duplicate document');
    const data = await response.json();
    showNotification('Document duplicated');
    return data.doc;
  } catch (err) {
    showNotification(err.message, 'error');
    throw err;
  }
};

export const getDocStats = async (id, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/stats`,
      { headers: getHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch stats');
    return await response.json();
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

export const togglePin = async (id, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/pin`,
      {
        method: 'PUT',
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to toggle pin');
    const data = await response.json();
    showNotification(data.pinned ? 'Document pinned' : 'Document unpinned');
    return data;
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

export const toggleStar = async (id, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/star`,
      {
        method: 'PUT',
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to toggle star');
    const data = await response.json();
    showNotification(data.starred ? 'Document starred' : 'Document unstarred');
    return data;
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

export const archiveDocument = async (id, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/archive`,
      {
        method: 'PUT',
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to archive document');
    showNotification('Document archived');
    return true;
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

export const unarchiveDocument = async (id, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/unarchive`,
      {
        method: 'PUT',
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to unarchive document');
    showNotification('Document unarchived');
    return true;
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

// ========================
// FORMATTING OPERATIONS
// ========================

export const clearFormatInRange = async (id, startIdx, endIdx, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/formatting`,
      {
        method: 'DELETE',
        headers: getHeaders(),
        body: JSON.stringify({ startIndex: startIdx, endIndex: endIdx }),
      }
    );
    if (!response.ok) throw new Error('Failed to clear formatting');
    const data = await response.json();
    showNotification('Formatting cleared');
    return data.textFormats;
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

// ========================
// COMMENT OPERATIONS
// ========================

export const addComment = async (id, commentData, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/comments`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(commentData),
      }
    );
    if (!response.ok) throw new Error('Failed to add comment');
    const data = await response.json();
    showNotification('Comment added');
    return data.comments || [];
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

export const replyToComment = async (id, commentId, replyData, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/comments/${commentId}/reply`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(replyData),
      }
    );
    if (!response.ok) throw new Error('Failed to add reply');
    const data = await response.json();
    showNotification('Reply added');
    return data.comment;
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

export const resolveComment = async (id, commentId, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/comments/${commentId}/resolve`,
      {
        method: 'PUT',
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to resolve comment');
    const data = await response.json();
    showNotification('Comment resolved');
    return data.comment;
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

export const deleteComment = async (id, commentId, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/comments/${commentId}`,
      {
        method: 'DELETE',
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to delete comment');
    showNotification('Comment deleted');
    return true;
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

// ========================
// SUGGESTION OPERATIONS
// ========================

export const addSuggestion = async (id, suggestionData, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/suggestions`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(suggestionData),
      }
    );
    if (!response.ok) throw new Error('Failed to add suggestion');
    const data = await response.json();
    showNotification('Suggestion added');
    return data.suggestions || [];
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

export const acceptSuggestion = async (id, suggestionId, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/suggestions/${suggestionId}/accept`,
      {
        method: 'PUT',
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to accept suggestion');
    const data = await response.json();
    showNotification('Suggestion accepted');
    return data.suggestion;
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

export const rejectSuggestion = async (id, suggestionId, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/suggestions/${suggestionId}/reject`,
      {
        method: 'PUT',
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to reject suggestion');
    const data = await response.json();
    showNotification('Suggestion rejected');
    return data.suggestion;
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

// ========================
// VERSION OPERATIONS
// ========================

export const createVersionSnapshot = async (id, versionData, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/versions`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(versionData),
      }
    );
    if (!response.ok) throw new Error('Failed to create version');
    const data = await response.json();
    showNotification('Version created');
    return data.versionSnapshots || [];
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

export const fetchVersions = async (id, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/versions`,
      { headers: getHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch versions');
    const data = await response.json();
    return data.versions || [];
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

export const restoreVersion = async (id, versionNumber, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/versions/${versionNumber}/restore`,
      {
        method: 'PUT',
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to restore version');
    const data = await response.json();
    showNotification(`Restored to version ${versionNumber}`);
    return data.doc;
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

// ========================
// COLLABORATION OPERATIONS
// ========================

export const addCollaborator = async (id, collaboratorData, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/collaborators`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(collaboratorData),
      }
    );
    if (!response.ok) throw new Error('Failed to add collaborator');
    const data = await response.json();
    showNotification('Collaborator added');
    return data.collaborators || [];
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

export const updateCollaboratorPermission = async (id, collaboratorId, permissionData, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/collaborators/${collaboratorId}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(permissionData),
      }
    );
    if (!response.ok) throw new Error('Failed to update permission');
    const data = await response.json();
    showNotification('Permission updated');
    return data.collaborators || [];
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

export const removeCollaborator = async (id, collaboratorId, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/collaborators/${collaboratorId}`,
      {
        method: 'DELETE',
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to remove collaborator');
    const data = await response.json();
    showNotification('Collaborator removed');
    return data.collaborators || [];
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

export const fetchCollaborators = async (id, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/collaborators`,
      { headers: getHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch collaborators');
    const data = await response.json();
    return data;
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

// ========================
// REAL-TIME COLLABORATION
// ========================

export const updateCursorPosition = async (id, cursorData) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) return;

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/cursor`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(cursorData),
      }
    );
    if (!response.ok) throw new Error('Failed to update cursor');
    const data = await response.json();
    return data.currentEditors || [];
  } catch (err) {
    console.error(err);
  }
};

export const removeCursor = async (id) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) return;

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/cursor`,
      {
        method: 'DELETE',
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to remove cursor');
    const data = await response.json();
    return data.currentEditors || [];
  } catch (err) {
    console.error(err);
  }
};

// ========================
// MEDIA OPERATIONS
// ========================

export const addImage = async (id, imageData, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/images`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(imageData),
      }
    );
    if (!response.ok) throw new Error('Failed to add image');
    const data = await response.json();
    showNotification('Image added');
    return data.images || [];
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

export const updateImage = async (id, imageId, imageData, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/images/${imageId}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(imageData),
      }
    );
    if (!response.ok) throw new Error('Failed to update image');
    const data = await response.json();
    showNotification('Image updated');
    return data.image;
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

export const deleteImage = async (id, imageId, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/images/${imageId}`,
      {
        method: 'DELETE',
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to delete image');
    showNotification('Image deleted');
    return true;
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

export const addAttachment = async (id, attachmentData, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/attachments`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(attachmentData),
      }
    );
    if (!response.ok) throw new Error('Failed to add attachment');
    const data = await response.json();
    showNotification('Attachment added');
    return data.attachments || [];
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

export const deleteAttachment = async (id, attachmentId, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/attachments/${attachmentId}`,
      {
        method: 'DELETE',
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to delete attachment');
    showNotification('Attachment deleted');
    return true;
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

export const downloadAttachment = async (id, attachmentId, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/attachments/${attachmentId}/download`,
      { headers: getHeaders() }
    );
    if (!response.ok) throw new Error('Failed to download attachment');
    const data = await response.json();
    window.open(data.attachment.url, '_blank');
    showNotification('Download started');
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

// ========================
// CODE BLOCK OPERATIONS
// ========================

export const addCodeBlock = async (id, codeBlockData, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/code-blocks`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(codeBlockData),
      }
    );
    if (!response.ok) throw new Error('Failed to add code block');
    const data = await response.json();
    showNotification('Code block added');
    return data.codeBlocks || [];
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

export const updateCodeBlock = async (id, codeBlockId, codeBlockData, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/code-blocks/${codeBlockId}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(codeBlockData),
      }
    );
    if (!response.ok) throw new Error('Failed to update code block');
    const data = await response.json();
    showNotification('Code block updated');
    return data.codeBlock;
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

export const deleteCodeBlock = async (id, codeBlockId, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/code-blocks/${codeBlockId}`,
      {
        method: 'DELETE',
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to delete code block');
    showNotification('Code block deleted');
    return true;
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

export const copyCodeBlock = async (id, codeBlockId, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/code-blocks/${codeBlockId}/copy`,
      {
        method: 'POST',
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to copy code block');
    const data = await response.json();
    
    // Copy to clipboard
    navigator.clipboard.writeText(data.codeBlock.code);
    showNotification('Copied to clipboard');
    
    return data.codeBlock;
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

// ========================
// TABLE OPERATIONS
// ========================

export const addTable = async (id, tableData, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/tables`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(tableData),
      }
    );
    if (!response.ok) throw new Error('Failed to add table');
    const data = await response.json();
    showNotification('Table added');
    return data.tables || [];
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

export const updateTable = async (id, tableId, tableData, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/tables/${tableId}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(tableData),
      }
    );
    if (!response.ok) throw new Error('Failed to update table');
    const data = await response.json();
    showNotification('Table updated');
    return data.table;
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

export const deleteTable = async (id, tableId, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/tables/${tableId}`,
      {
        method: 'DELETE',
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to delete table');
    showNotification('Table deleted');
    return true;
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

// ========================
// ACCESS LOGS OPERATIONS
// ========================

export const fetchAccessLogs = async (id, limit = 50, skip = 0, showNotification) => {
  const { projectId, testTypeId } = getProjectAndTestType();
  if (!projectId || !testTypeId) {
    showNotification('Project ID or Test Type ID missing', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${id}/access-logs?limit=${limit}&skip=${skip}`,
      { headers: getHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch access logs');
    const data = await response.json();
    return data;
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

// ========================
// CLOUDINARY OPERATIONS
// ========================

export const uploadToCloudinary = async (file, resourceType = 'image', showNotification) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_PRESET);
    formData.append('resource_type', resourceType);

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Failed to upload to Cloudinary');
    const data = await response.json();

    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      size: data.bytes,
    };
  } catch (err) {
    showNotification(err.message, 'error');
    throw err;
  }
};

export const deleteImageFromCloudinary = async (publicId, showNotification) => {
  try {
    // Note: This requires backend support to delete from Cloudinary
    // For now, we just notify
    showNotification('Image removed from document');
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

export const deleteFileFromCloudinary = async (publicId, showNotification) => {
  try {
    // Note: This requires backend support to delete from Cloudinary
    // For now, we just notify
    showNotification('File removed from document');
  } catch (err) {
    showNotification(err.message, 'error');
  }
};