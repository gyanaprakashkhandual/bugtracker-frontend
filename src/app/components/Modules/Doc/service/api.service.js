// api.service.js
const BASE_URL = 'http://localhost:5000/api/v1/doc';

const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

export async function createDoc(projectId, testTypeId, data) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create doc');
    return response.json();
}

export async function getDocsByProjectAndTestType(projectId, testTypeId) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs`, {
        method: 'GET',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to get docs');
    return response.json();
}

export async function searchDocs(projectId, testTypeId, params) {
    const url = new URL(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/search`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to search docs');
    return response.json();
}

export async function getDocsByCategory(projectId, testTypeId, category) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/category/${category}`, {
        method: 'GET',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to get docs by category');
    return response.json();
}

export async function getRecentDocs(projectId, testTypeId, limit = 10) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/recent?limit=${limit}`, {
        method: 'GET',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to get recent docs');
    return response.json();
}

export async function getDocById(projectId, testTypeId, docId) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}`, {
        method: 'GET',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to get doc by id');
    return response.json();
}

export async function updateDoc(projectId, testTypeId, docId, data) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update doc');
    return response.json();
}

export async function updateDocStatus(projectId, testTypeId, docId, data) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update doc status');
    return response.json();
}

export async function addComment(projectId, testTypeId, docId, data) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/comments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add comment');
    return response.json();
}

export async function replyToComment(projectId, testTypeId, docId, commentId, data) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/comments/${commentId}/reply`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to reply to comment');
    return response.json();
}

export async function resolveComment(projectId, testTypeId, docId, commentId) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/comments/${commentId}/resolve`, {
        method: 'PUT',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to resolve comment');
    return response.json();
}

export async function deleteComment(projectId, testTypeId, docId, commentId) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete comment');
    return response.json();
}

export async function addSuggestion(projectId, testTypeId, docId, data) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/suggestions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add suggestion');
    return response.json();
}

export async function acceptSuggestion(projectId, testTypeId, docId, suggestionId) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/suggestions/${suggestionId}/accept`, {
        method: 'PUT',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to accept suggestion');
    return response.json();
}

export async function rejectSuggestion(projectId, testTypeId, docId, suggestionId) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/suggestions/${suggestionId}/reject`, {
        method: 'PUT',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to reject suggestion');
    return response.json();
}

export async function createVersionSnapshot(projectId, testTypeId, docId, data) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/versions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create version snapshot');
    return response.json();
}

export async function getVersions(projectId, testTypeId, docId) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/versions`, {
        method: 'GET',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to get versions');
    return response.json();
}

export async function restoreVersion(projectId, testTypeId, docId, versionNumber) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/versions/${versionNumber}/restore`, {
        method: 'PUT',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to restore version');
    return response.json();
}

export async function addCollaborator(projectId, testTypeId, docId, data) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/collaborators`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add collaborator');
    return response.json();
}

export async function updateCollaboratorPermission(projectId, testTypeId, docId, collaboratorId, data) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/collaborators/${collaboratorId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update collaborator permission');
    return response.json();
}

export async function removeCollaborator(projectId, testTypeId, docId, collaboratorId) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/collaborators/${collaboratorId}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to remove collaborator');
    return response.json();
}

export async function getCollaborators(projectId, testTypeId, docId) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/collaborators`, {
        method: 'GET',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to get collaborators');
    return response.json();
}

export async function updateCursorPosition(projectId, testTypeId, docId, data) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/cursor`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update cursor position');
    return response.json();
}

export async function removeCursor(projectId, testTypeId, docId) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/cursor`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to remove cursor');
    return response.json();
}

export async function applyTextFormat(projectId, testTypeId, docId, data) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/formatting`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to apply text format');
    return response.json();
}

export async function removeTextFormat(projectId, testTypeId, docId, formatId) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/formatting/${formatId}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to remove text format');
    return response.json();
}

export async function clearFormatting(projectId, testTypeId, docId, data) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/formatting`, {
        method: 'DELETE',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to clear formatting');
    return response.json();
}

export async function addImage(projectId, testTypeId, docId, data) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/images`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add image');
    return response.json();
}

export async function updateImage(projectId, testTypeId, docId, imageId, data) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/images/${imageId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update image');
    return response.json();
}

export async function deleteImage(projectId, testTypeId, docId, imageId) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/images/${imageId}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete image');
    return response.json();
}

export async function addAttachment(projectId, testTypeId, docId, data) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/attachments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add attachment');
    return response.json();
}

export async function deleteAttachment(projectId, testTypeId, docId, attachmentId) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/attachments/${attachmentId}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete attachment');
    return response.json();
}

export async function downloadAttachment(projectId, testTypeId, docId, attachmentId) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/attachments/${attachmentId}/download`, {
        method: 'GET',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to download attachment');
    return response.json();
}

export async function addCodeBlock(projectId, testTypeId, docId, data) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/code-blocks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add code block');
    return response.json();
}

export async function updateCodeBlock(projectId, testTypeId, docId, codeBlockId, data) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/code-blocks/${codeBlockId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update code block');
    return response.json();
}

export async function deleteCodeBlock(projectId, testTypeId, docId, codeBlockId) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/code-blocks/${codeBlockId}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete code block');
    return response.json();
}

export async function copyCodeBlock(projectId, testTypeId, docId, codeBlockId) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/code-blocks/${codeBlockId}/copy`, {
        method: 'POST',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to copy code block');
    return response.json();
}

export async function addTable(projectId, testTypeId, docId, data) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/tables`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add table');
    return response.json();
}

export async function updateTable(projectId, testTypeId, docId, tableId, data) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/tables/${tableId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update table');
    return response.json();
}

export async function deleteTable(projectId, testTypeId, docId, tableId) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/tables/${tableId}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete table');
    return response.json();
}

export async function getAccessLogs(projectId, testTypeId, docId, limit = 50, skip = 0) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/access-logs?limit=${limit}&skip=${skip}`, {
        method: 'GET',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to get access logs');
    return response.json();
}

export async function togglePin(projectId, testTypeId, docId) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/pin`, {
        method: 'PUT',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to toggle pin');
    return response.json();
}

export async function toggleStar(projectId, testTypeId, docId) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/star`, {
        method: 'PUT',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to toggle star');
    return response.json();
}

export async function archiveDoc(projectId, testTypeId, docId) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/archive`, {
        method: 'PUT',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to archive doc');
    return response.json();
}

export async function unarchiveDoc(projectId, testTypeId, docId) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/unarchive`, {
        method: 'PUT',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to unarchive doc');
    return response.json();
}

export async function deleteDoc(projectId, testTypeId, docId) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete doc');
    return response.json();
}

export async function getDocStats(projectId, testTypeId, docId) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/stats`, {
        method: 'GET',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to get doc stats');
    return response.json();
}

export async function duplicateDoc(projectId, testTypeId, docId, data) {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/duplicate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to duplicate doc');
    return response.json();
}

export async function exportDoc(projectId, testTypeId, docId, format = 'txt') {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/export?format=${format}`, {
        method: 'GET',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to export doc');
    return response.text(); // or blob for files
}

export async function getDocsByTestType(testTypeId) {
    const response = await fetch(`${BASE_URL}/docs/org/${testTypeId}`, {
        method: 'GET',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to get docs by test type');
    return response.json();
}