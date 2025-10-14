// docEditorUtils.js

// ========================
// UTILITY FUNCTIONS
// ========================

export const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const getProjectAndTestType = () => {
  const projectId = typeof window !== 'undefined' ? localStorage.getItem('currentProjectId') : '';
  const testTypeId = typeof window !== 'undefined' ? localStorage.getItem('selectedTestTypeId') : '';
  return { projectId, testTypeId };
};

export const calculateTextStats = (text) => {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const characters = text.length;
  return { words, characters };
};

export const getSelectedRange = (editorRef) => {
  const selection = window.getSelection();
  if (selection.rangeCount === 0) return { start: 0, end: 0 };

  const range = selection.getRangeAt(0);
  const preCaretRange = range.cloneRange();
  if (editorRef.current) {
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
  }

  const start = preCaretRange.toString().length - range.toString().length;
  const end = start + range.toString().length;

  return { start, end };
};

export const updateCursorStats = (editorRef) => {
  const selection = window.getSelection();
  if (editorRef.current && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const text = editorRef.current.textContent;
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    const position = preCaretRange.toString().length;
    const lines = text.substring(0, position).split('\n');
    const line = lines.length - 1;
    const column = lines[line].length;

    return { line, column };
  }
  return { line: 0, column: 0 };
};

export const copyToClipboard = (text, showNotification) => {
  navigator.clipboard.writeText(text).then(() => {
    showNotification('Copied to clipboard');
  }).catch(() => {
    showNotification('Failed to copy', 'error');
  });
};

export const downloadFile = (content, filename, type = 'text/plain', showNotification) => {
  const element = document.createElement('a');
  element.setAttribute('href', `data:${type};charset=utf-8,${encodeURIComponent(content)}`);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  showNotification('File downloaded');
};

export const applyTextFormatting = (formatType, editorRef, getSelectedRange, currentFormat, setTextFormats, setSelectedText, setSelectionStart, setSelectionEnd) => {
  const selection = window.getSelection();
  if (selection.rangeCount === 0 || !editorRef.current) return;

  const range = selection.getRangeAt(0);
  setSelectedText(range.toString());

  const { start, end } = getSelectedRange();
  setSelectionStart(start);
  setSelectionEnd(end);

  const span = document.createElement('span');
  switch (formatType) {
    case 'bold':
      span.style.fontWeight = 'bold';
      break;
    case 'italic':
      span.style.fontStyle = 'italic';
      break;
    case 'underline':
      span.style.textDecoration = 'underline';
      break;
    case 'strikethrough':
      span.style.textDecoration = 'line-through';
      break;
    case 'code':
      span.style.backgroundColor = '#f0f0f0';
      span.style.fontFamily = 'monospace';
      span.style.padding = '2px 4px';
      break;
    case 'highlight':
      span.style.backgroundColor = 'yellow';
      break;
  }
  span.appendChild(range.extractContents());
  range.insertNode(span);

  const newFormat = {
    startIndex: start,
    endIndex: end,
    format: formatType,
    ...currentFormat,
  };
  setTextFormats(prev => [...prev, newFormat]);
};

export const applyAlignment = (alignment, editorRef, setCurrentFormat) => {
  if (editorRef.current) {
    editorRef.current.style.textAlign = alignment;
    setCurrentFormat(prev => ({
      ...prev,
      textAlign: alignment,
    }));
  }
};

export const applyTextColor = (color, setCurrentFormat) => {
  const selection = window.getSelection();
  if (selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const span = document.createElement('span');
  span.style.color = color;
  span.appendChild(range.extractContents());
  range.insertNode(span);

  setCurrentFormat(prev => ({
    ...prev,
    textColor: color,
  }));
};

export const applyBackgroundColor = (color, setCurrentFormat) => {
  const selection = window.getSelection();
  if (selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const span = document.createElement('span');
  span.style.backgroundColor = color;
  span.appendChild(range.extractContents());
  range.insertNode(span);

  setCurrentFormat(prev => ({
    ...prev,
    backgroundColor: color,
  }));
};

export const applyFontSize = (size, setCurrentFormat) => {
  const selection = window.getSelection();
  if (selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const span = document.createElement('span');
  span.style.fontSize = `${size}px`;
  span.appendChild(range.extractContents());
  range.insertNode(span);

  setCurrentFormat(prev => ({
    ...prev,
    fontSize: size,
  }));
};

export const removeAllFormatting = (editorRef, setTextFormats, showNotification) => {
  if (editorRef.current) {
    const text = editorRef.current.textContent;
    editorRef.current.innerHTML = text;
    setTextFormats([]);
    showNotification('All formatting removed');
  }
};

export const validateFile = (file, allowedTypes = [], maxSize = 10485760, showNotification) => {
  if (file.size > maxSize) {
    showNotification(`File size exceeds ${maxSize / 1024 / 1024}MB limit`, 'error');
    return false;
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    showNotification(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`, 'error');
    return false;
  }

  return true;
};

export const getCloudinaryImageUrl = (publicId, width = 400, height = 300, crop = 'fill') => {
  return `https://res.cloudinary.com/dvytvjplt/image/fetch/w_${width},h_${height},c_${crop}/https://${publicId}`;
};

export const getCloudinaryThumbnail = (publicId, size = 200) => {
  return `https://res.cloudinary.com/dvytvjplt/image/fetch/w_${size},h_${size},c_thumb,q_auto/https://${publicId}`;
};

// Helper function to show notifications
export const createNotificationHandler = (setSuccess, setError) => {
  return (message, type = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setError(null);
    } else {
      setError(message);
      setSuccess(null);
    }
    setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 3000);
  };
};

// Helper function to handle tag operations
export const addTag = (tag, tags, setTags) => {
  if (tag && !tags.includes(tag)) {
    setTags([...tags, tag]);
  }
};

export const removeTag = (tag, tags, setTags) => {
  setTags(tags.filter(t => t !== tag));
};