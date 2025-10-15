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
    const [pages, setPages] = useState([{ id: 1, content: '' }]);
    const [lastSavedContent, setLastSavedContent] = useState('');
    const [currentPageIndex, setCurrentPageIndex] = useState(0);

    // A4 paper dimensions in pixels (approx)
    const A4_WIDTH = 794;
    const A4_HEIGHT = 1123;

    // Fetch document content on mount
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
                setLastSavedContent(fetchedContent);

                if (fetchedContent) {
                    const initialPages = splitContentIntoPages(fetchedContent);
                    setPages(initialPages);
                } else {
                    setPages([{ id: 1, content: '' }]);
                }

                setImages(response.data.doc.images || []);
                setAttachments(response.data.doc.attachments || []);
            } catch (error) {
                console.error('Error fetching document:', error.response?.data?.message || error.message);
            }
        };
        fetchDoc();
    }, [docId, projectId, testTypeId, token]);

    // Split content into pages
    const splitContentIntoPages = (text) => {
        if (!text.trim()) return [{ id: 1, content: '' }];

        const pages = [];
        const lines = text.split('\n');
        let currentPageContent = [];
        let currentPageId = 1;

        const measuringDiv = document.createElement('div');
        measuringDiv.style.width = `${A4_WIDTH}px`;
        measuringDiv.style.fontFamily = 'Times New Roman, serif';
        measuringDiv.style.fontSize = '12pt';
        measuringDiv.style.lineHeight = '1.6';
        measuringDiv.style.padding = '48px';
        measuringDiv.style.boxSizing = 'border-box';
        measuringDiv.style.position = 'absolute';
        measuringDiv.style.visibility = 'hidden';
        measuringDiv.style.whiteSpace = 'pre-wrap';
        measuringDiv.style.wordWrap = 'break-word';
        document.body.appendChild(measuringDiv);

        for (let i = 0; i < lines.length; i++) {
            const testContent = [...currentPageContent, lines[i]].join('\n');
            measuringDiv.textContent = testContent;

            const contentHeight = measuringDiv.offsetHeight;

            if (contentHeight > A4_HEIGHT - 96 && currentPageContent.length > 0) {
                pages.push({
                    id: currentPageId,
                    content: currentPageContent.join('\n')
                });
                currentPageContent = [lines[i]];
                currentPageId++;
            } else {
                currentPageContent.push(lines[i]);
            }
        }

        if (currentPageContent.length > 0) {
            pages.push({
                id: currentPageId,
                content: currentPageContent.join('\n')
            });
        }

        document.body.removeChild(measuringDiv);
        return pages.length > 0 ? pages : [{ id: 1, content: '' }];
    };

    // Check if page content overflows
    const checkAndAddPage = (pageIndex, currentContent) => {
        const measuringDiv = document.createElement('div');
        measuringDiv.style.width = `${A4_WIDTH}px`;
        measuringDiv.style.fontFamily = 'Times New Roman, serif';
        measuringDiv.style.fontSize = '12pt';
        measuringDiv.style.lineHeight = '1.6';
        measuringDiv.style.padding = '48px';
        measuringDiv.style.boxSizing = 'border-box';
        measuringDiv.style.position = 'absolute';
        measuringDiv.style.visibility = 'hidden';
        measuringDiv.style.whiteSpace = 'pre-wrap';
        measuringDiv.style.wordWrap = 'break-word';
        measuringDiv.innerHTML = currentContent;
        document.body.appendChild(measuringDiv);

        const contentHeight = measuringDiv.offsetHeight;
        document.body.removeChild(measuringDiv);

        return contentHeight > A4_HEIGHT - 96;
    };

    // Auto-save content
    const autoSave = async () => {
        if (!docId || content === lastSavedContent) return;
        setIsAutoSaving(true);
        try {
            await axios.put(
                `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}`,
                { content },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setLastSavedContent(content);
            console.log('Document auto-saved');
        } catch (error) {
            console.error('Error auto-saving document:', error.response?.data?.message || error.message);
        } finally {
            setIsAutoSaving(false);
        }
    };

    // Get cursor position in editor with page info
    const getCursorPositionWithPage = () => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return null;

        const range = selection.getRangeAt(0);

        // Find which editor the cursor is in
        let pageIndex = currentPageIndex;
        for (let i = 0; i < pages.length; i++) {
            const editor = document.getElementById(`editor-${i}`);
            if (editor && editor.contains(range.commonAncestorContainer)) {
                pageIndex = i;
                break;
            }
        }

        const editor = document.getElementById(`editor-${pageIndex}`);
        if (!editor) return null;

        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(editor);
        preCaretRange.setEnd(range.endContainer, range.endOffset);

        return {
            pageIndex,
            node: range.endContainer,
            offset: range.endOffset,
            charOffset: preCaretRange.toString().length
        };
    };

    // Set cursor position in specific page
    const setCursorPosition = (pageIndex, charOffset) => {
        const editor = document.getElementById(`editor-${pageIndex}`);
        if (!editor) return;

        const selection = window.getSelection();
        const range = document.createRange();

        let currentOffset = 0;
        let found = false;

        const findPosition = (node) => {
            if (found) return;

            if (node.nodeType === Node.TEXT_NODE) {
                const nextOffset = currentOffset + node.length;
                if (charOffset >= currentOffset && charOffset <= nextOffset) {
                    range.setStart(node, charOffset - currentOffset);
                    range.collapse(true);
                    found = true;
                    return;
                }
                currentOffset = nextOffset;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.tagName === 'BR') {
                    currentOffset += 1;
                    if (charOffset === currentOffset) {
                        range.setStartAfter(node);
                        range.collapse(true);
                        found = true;
                        return;
                    }
                } else if (node.tagName === 'IMG') {
                    currentOffset += 1;
                    if (charOffset === currentOffset) {
                        range.setStartAfter(node);
                        range.collapse(true);
                        found = true;
                        return;
                    }
                } else {
                    for (let i = 0; i < node.childNodes.length; i++) {
                        findPosition(node.childNodes[i]);
                        if (found) return;
                    }
                }
            }
        };

        findPosition(editor);

        if (found) {
            selection.removeAllRanges();
            selection.addRange(range);
            editor.focus();
        }
    };

    // Handle content changes
    const handleContentChange = (pageIndex, editor) => {
        const cursorPos = getCursorPositionWithPage();
        const newHtmlContent = editor.innerHTML;

        const updatedPages = [...pages];
        updatedPages[pageIndex].content = newHtmlContent;

        // Check overflow
        const needsNewPage = checkAndAddPage(pageIndex, newHtmlContent);

        if (needsNewPage && pageIndex === updatedPages.length - 1) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = newHtmlContent;
            const children = Array.from(tempDiv.childNodes);

            const measuringDiv = document.createElement('div');
            measuringDiv.style.width = `${A4_WIDTH}px`;
            measuringDiv.style.fontFamily = 'Times New Roman, serif';
            measuringDiv.style.fontSize = '12pt';
            measuringDiv.style.lineHeight = '1.6';
            measuringDiv.style.padding = '48px';
            measuringDiv.style.boxSizing = 'border-box';
            measuringDiv.style.position = 'absolute';
            measuringDiv.style.visibility = 'hidden';
            measuringDiv.style.whiteSpace = 'pre-wrap';
            measuringDiv.style.wordWrap = 'break-word';
            document.body.appendChild(measuringDiv);

            let currentPageNodes = [];
            let remainingNodes = [];

            for (let i = 0; i < children.length; i++) {
                measuringDiv.innerHTML = '';
                currentPageNodes.forEach(node => measuringDiv.appendChild(node.cloneNode(true)));
                measuringDiv.appendChild(children[i].cloneNode(true));

                const testHeight = measuringDiv.offsetHeight;

                if (testHeight <= A4_HEIGHT - 96) {
                    currentPageNodes.push(children[i]);
                } else {
                    remainingNodes = children.slice(i);
                    break;
                }
            }

            document.body.removeChild(measuringDiv);

            const currentPageDiv = document.createElement('div');
            currentPageNodes.forEach(node => currentPageDiv.appendChild(node.cloneNode(true)));
            updatedPages[pageIndex].content = currentPageDiv.innerHTML;

            if (remainingNodes.length > 0) {
                const remainingDiv = document.createElement('div');
                remainingNodes.forEach(node => remainingDiv.appendChild(node.cloneNode(true)));
                updatedPages.push({
                    id: updatedPages.length + 1,
                    content: remainingDiv.innerHTML
                });
            }
        }

        setPages(updatedPages);

        const fullContent = updatedPages.map(page => page.content).join('\n');
        setContent(fullContent);

        // Restore cursor position
        if (cursorPos) {
            setTimeout(() => {
                setCursorPosition(cursorPos.pageIndex, cursorPos.charOffset);
            }, 0);
        }

        // Auto-save
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }
        autoSaveTimeoutRef.current = setTimeout(autoSave, 1000);
    };

    // Handle Enter key - FIXED
    const handleKeyDown = (e, pageIndex) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            const editor = e.currentTarget;
            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            const cursorPos = getCursorPositionWithPage();

            // Check if we're at the end of the current page's editor
            const editorTextLength = editor.innerText.length;
            const isAtEnd = cursorPos && cursorPos.charOffset >= editorTextLength - 1;

            // Check if adding content would overflow
            const testDiv = document.createElement('div');
            testDiv.innerHTML = editor.innerHTML + '<br>';
            const wouldOverflow = checkAndAddPage(pageIndex, testDiv.innerHTML);

            if (isAtEnd && wouldOverflow) {
                // Create new page
                const updatedPages = [...pages];
                updatedPages.splice(pageIndex + 1, 0, {
                    id: Date.now(),
                    content: '<br>'
                });
                setPages(updatedPages);

                // Focus new page after render
                setTimeout(() => {
                    setCursorPosition(pageIndex + 1, 0);
                }, 50);
            } else {
                // Insert line break at cursor position
                const br = document.createElement('br');
                range.deleteContents();
                range.insertNode(br);

                // Move cursor after br
                range.setStartAfter(br);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);

                handleContentChange(pageIndex, editor);
            }
        }
    };

    // Handle paste - FIXED to maintain cursor position on current page
    const handlePaste = async (e, pageIndex) => {
        e.preventDefault();
        const items = e.clipboardData.items;
        const editor = e.currentTarget;

        for (const item of items) {
            if (item.type.includes('image')) {
                const file = item.getAsFile();
                const cursorPos = getCursorPositionWithPage();

                // Create temporary preview
                const tempUrl = URL.createObjectURL(file);
                const selection = window.getSelection();
                const range = selection.getRangeAt(0);

                const img = document.createElement('img');
                img.src = tempUrl;
                img.alt = 'Uploading...';
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                img.style.display = 'block';
                img.style.margin = '10px 0';
                img.style.opacity = '0.5';
                img.dataset.tempImage = 'true';

                range.deleteContents();
                range.insertNode(img);

                const br = document.createElement('br');
                range.setStartAfter(img);
                range.insertNode(br);
                range.setStartAfter(br);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);

                // Save current cursor position and page
                const savedPageIndex = cursorPos ? cursorPos.pageIndex : pageIndex;
                const savedCursorOffset = getCursorPositionWithPage();

                // Upload in background
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

                    // Update image with real URL
                    img.src = secure_url;
                    img.alt = file.name;
                    img.style.opacity = '1';
                    img.removeAttribute('data-temp-image');

                    URL.revokeObjectURL(tempUrl);

                    // Restore cursor to the SAME page where it was
                    setTimeout(() => {
                        if (savedCursorOffset) {
                            setCursorPosition(savedPageIndex, savedCursorOffset.charOffset);
                        }
                    }, 50);

                } catch (error) {
                    console.error('Error uploading pasted image:', error.response?.data?.message || error.message);
                    img.remove();
                    br.remove();
                }

                handleContentChange(pageIndex, editor);
            } else if (item.type.includes('text')) {
                const text = e.clipboardData.getData('text/plain');
                document.execCommand('insertText', false, text);
                handleContentChange(pageIndex, editor);
            }
        }
    };

    // Expose editor functions globally for Navbar to use
    useEffect(() => {
        window.editorAPI = {
            applyTextFormat: (format) => {
                const cursorPos = getCursorPositionWithPage();
                if (!cursorPos) return;

                document.execCommand(format, false, null);

                const editor = document.getElementById(`editor-${cursorPos.pageIndex}`);
                if (editor) {
                    handleContentChange(cursorPos.pageIndex, editor);
                }
            },

            applyAlignment: (align) => {
                const cursorPos = getCursorPositionWithPage();
                if (!cursorPos) return;

                const command = 'justify' + align.charAt(0).toUpperCase() + align.slice(1);
                document.execCommand(command, false, null);

                const editor = document.getElementById(`editor-${cursorPos.pageIndex}`);
                if (editor) {
                    handleContentChange(cursorPos.pageIndex, editor);
                }
            },

            applyFontSize: (size) => {
                const cursorPos = getCursorPositionWithPage();
                if (!cursorPos) return;

                document.execCommand('fontSize', false, '7');
                const fontElements = document.getElementsByTagName('font');
                for (let i = 0; i < fontElements.length; i++) {
                    if (fontElements[i].size === '7') {
                        fontElements[i].removeAttribute('size');
                        fontElements[i].style.fontSize = size + 'px';
                    }
                }

                const editor = document.getElementById(`editor-${cursorPos.pageIndex}`);
                if (editor) {
                    handleContentChange(cursorPos.pageIndex, editor);
                }
            },

            applyTextColor: (color) => {
                const cursorPos = getCursorPositionWithPage();
                if (!cursorPos) return;

                document.execCommand('foreColor', false, color);

                const editor = document.getElementById(`editor-${cursorPos.pageIndex}`);
                if (editor) {
                    handleContentChange(cursorPos.pageIndex, editor);
                }
            },

            applyBackgroundColor: (color) => {
                const cursorPos = getCursorPositionWithPage();
                if (!cursorPos) return;

                document.execCommand('hiliteColor', false, color);

                const editor = document.getElementById(`editor-${cursorPos.pageIndex}`);
                if (editor) {
                    handleContentChange(cursorPos.pageIndex, editor);
                }
            },

            clearFormatting: () => {
                const cursorPos = getCursorPositionWithPage();
                if (!cursorPos) return;

                document.execCommand('removeFormat', false, null);

                const editor = document.getElementById(`editor-${cursorPos.pageIndex}`);
                if (editor) {
                    handleContentChange(cursorPos.pageIndex, editor);
                }
            },

            insertBulletList: () => {
                const cursorPos = getCursorPositionWithPage();
                if (!cursorPos) return;

                document.execCommand('insertUnorderedList', false, null);

                const editor = document.getElementById(`editor-${cursorPos.pageIndex}`);
                if (editor) {
                    handleContentChange(cursorPos.pageIndex, editor);
                }
            },

            insertNumberedList: () => {
                const cursorPos = getCursorPositionWithPage();
                if (!cursorPos) return;

                document.execCommand('insertOrderedList', false, null);

                const editor = document.getElementById(`editor-${cursorPos.pageIndex}`);
                if (editor) {
                    handleContentChange(cursorPos.pageIndex, editor);
                }
            },

            insertLink: (url) => {
                const cursorPos = getCursorPositionWithPage();
                if (!cursorPos) return;

                document.execCommand('createLink', false, url);

                const editor = document.getElementById(`editor-${cursorPos.pageIndex}`);
                if (editor) {
                    handleContentChange(cursorPos.pageIndex, editor);
                }
            },

            getContent: () => {
                return content;
            },

            getCurrentPageIndex: () => {
                return currentPageIndex;
            }
        };

        return () => {
            delete window.editorAPI;
        };
    }, [pages, content, currentPageIndex]);

    // Track which page has focus
    const handleEditorFocus = (pageIndex) => {
        setCurrentPageIndex(pageIndex);
    };

    // Update cursor position
    const updateCursorPosition = async (pageIndex) => {
        if (!docId) return;
        try {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            const editor = document.getElementById(`editor-${pageIndex}`);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(editor);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            const position = preCaretRange.toString().length;
            const editorText = editor.innerText;
            const lineNumber = editorText.substr(0, position).split('\n').length;
            const columnNumber = position - editorText.lastIndexOf('\n', position - 1);

            await axios.put(
                `${API_BASE_URL}/projects/${projectId}/test-types/${testTypeId}/docs/${docId}/cursor`,
                {
                    position,
                    lineNumber,
                    columnNumber,
                    selectionStart: range.startOffset,
                    selectionEnd: range.endOffset,
                    page: pageIndex + 1,
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
            className="p-6 bg-gray-100 min-h-screen flex flex-col items-center overflow-y-auto"
        >
            <div className="space-y-8 w-full max-w-[794px]">
                {pages.map((page, index) => (
                    <div
                        key={page.id}
                        className="bg-white shadow-lg rounded-sm border border-gray-200 page-break"
                        style={{
                            width: `${A4_WIDTH}px`,
                            minHeight: `${A4_HEIGHT}px`,
                            maxHeight: `${A4_HEIGHT}px`,
                            overflow: 'hidden',
                            position: 'relative',
                        }}
                    >
                        <div
                            id={`editor-${index}`}
                            contentEditable
                            onInput={(e) => handleContentChange(index, e.currentTarget)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onPaste={(e) => handlePaste(e, index)}
                            onClick={() => updateCursorPosition(index)}
                            onKeyUp={() => updateCursorPosition(index)}
                            onFocus={() => handleEditorFocus(index)}
                            className="w-full h-full p-12 outline-none prose max-w-none overflow-hidden"
                            style={{
                                fontFamily: 'Times New Roman, serif',
                                fontSize: '12pt',
                                lineHeight: '1.6',
                                boxSizing: 'border-box',
                                whiteSpace: 'pre-wrap',
                                wordWrap: 'break-word',
                            }}
                            suppressContentEditableWarning={true}
                            dangerouslySetInnerHTML={{ __html: page.content }}
                        />

                        <div className="absolute bottom-4 left-0 right-0 text-center text-gray-400 text-sm pointer-events-none">
                            Page {index + 1}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 w-full max-w-[794px]">
                {images.length > 0 && (
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-2">Attached Images</h3>
                        {images.map((img) => (
                            <img
                                key={img._id}
                                src={img.url}
                                alt={img.altText}
                                className="max-w-full my-2 rounded"
                            />
                        ))}
                    </div>
                )}
                {attachments.length > 0 && (
                    <div className="bg-white p-4 rounded-lg shadow mt-4">
                        <h3 className="text-lg font-semibold mb-2">Attachments</h3>
                        {attachments.map((att) => (
                            <a
                                key={att._id}
                                href={att.url}
                                className="text-blue-600 underline block my-2 hover:text-blue-800"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {att.name}
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {isAutoSaving && (
                <div className="fixed bottom-4 right-4 bg-green-50 text-green-700 px-4 py-2 rounded-lg shadow-lg border border-green-200 flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                </div>
            )}
        </motion.div>
    );
};

export default Editor;