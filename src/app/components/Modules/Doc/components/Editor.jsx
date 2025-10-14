// Editor.jsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Editor as SlateEditor, Transforms, Range, Point } from 'slate';
import { Slate, Editable, withReact, useSlate } from 'slate-react';
import { BaseEditor } from 'slate';
import { ReactEditor } from 'slate-react';
import Navbar from './Navbar';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import Toolbar from './Toolbar';
import Statusbar from './Statusbar';
import * as api from '../service/api.service';
import { useTestType } from '@/app/script/TestType.context';

const withFormats = (editor) => {
    const { insertText, insertData } = editor;

    editor.insertText = (text) => {
        insertText(text);
    };

    return editor;
};

const Leaf = ({ attributes, children, leaf }) => {
    if (leaf.bold) children = <strong>{children}</strong>;
    if (leaf.italic) children = <em>{children}</em>;
    if (leaf.underline) children = <u>{children}</u>;
    if (leaf.strikethrough) children = <del>{children}</del>;
    if (leaf.code) children = <code>{children}</code>;
    if (leaf.highlight) children = <mark>{children}</mark>;
    if (leaf.superscript) children = <sup>{children}</sup>;
    if (leaf.subscript) children = <sub>{children}</sub>;

    const style = {};
    if (leaf.color) style.color = leaf.color;
    if (leaf.backgroundColor) style.backgroundColor = leaf.backgroundColor;
    if (leaf.fontSize) style.fontSize = `${leaf.fontSize}px`;
    if (leaf.fontFamily) style.fontFamily = leaf.fontFamily;
    if (leaf.lineHeight) style.lineHeight = leaf.lineHeight;
    if (leaf.textAlign) style.textAlign = leaf.textAlign;

    return <span {...attributes} style={style}>{children}</span>;
};

const Editor = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const docId = searchParams.get('docId');
    const projectId = typeof window !== 'undefined' ? localStorage.getItem('currentProjectId') : null;
    const { testTypeId } = useTestType();
    const [editor] = useState(() => withReact(withFormats(SlateEditor.create())));
    const [value, setValue] = useState([{ type: 'paragraph', children: [{ text: '' }] }]);
    const [doc, setDoc] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [collaborators, setCollaborators] = useState([]);
    const [cursors, setCursors] = useState([]);
    const [comments, setComments] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [versions, setVersions] = useState([]);
    const [autoSaveTimer, setAutoSaveTimer] = useState(null);
    const editorRef = useRef(null);

    const loadDoc = useCallback(async () => {
        if (docId && projectId && testTypeId) {
            const response = await api.getDocById(projectId, testTypeId, docId);
            const loadedDoc = response.doc;
            setDoc(loadedDoc);
            const slateValue = convertToSlate(loadedDoc.content, loadedDoc.textFormats);
            setValue(slateValue);
            setComments(loadedDoc.comments);
            setSuggestions(loadedDoc.suggestions);
            setCollaborators(loadedDoc.collaborators);
            setCursors(loadedDoc.currentEditors);
            const vers = await api.getVersions(projectId, testTypeId, docId);
            setVersions(vers.versions);
        }
    }, [docId, projectId, testTypeId]);

    useEffect(() => {
        loadDoc();
        const interval = setInterval(async () => {
            if (docId) {
                const collabs = await api.getCollaborators(projectId, testTypeId, docId);
                setCollaborators(collabs.collaborators);
                setCursors(collabs.activeEditors);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [loadDoc, docId, projectId, testTypeId]);

    useEffect(() => {
        if (editorRef.current) {
            gsap.to(editorRef.current, { duration: 0.5, opacity: 1 });
        }
    }, []);

    const handleChange = (newValue) => {
        setValue(newValue);
        if (autoSaveTimer) clearTimeout(autoSaveTimer);
        const timer = setTimeout(async () => {
            setIsSaving(true);
            const content = extractText(newValue);
            const formats = extractFormats(newValue);
            await api.updateDoc(projectId, testTypeId, docId, { content, textFormats: formats });
            setIsSaving(false);
        }, 2000);
        setAutoSaveTimer(timer);
    };

    const handleKeyDown = (event) => { };

    const handleSelectionChange = async () => {
        const { selection } = editor;
        if (selection) {
            const [start] = Range.edges(selection);
            const position = SlateEditor.string(editor, []).length;
            await api.updateCursorPosition(projectId, testTypeId, docId, { position: start.offset, lineNumber: start.path[0], columnNumber: start.offset });
        }
    };

    const handleApplyFormat = async (format, styles = {}) => {
        const { selection } = editor;
        if (selection && Range.isCollapsed(selection)) return;
        const startIndex = editor.children.reduce((acc, node, i) => acc + SlateEditor.string(editor, [i]).length, 0) + selection.anchor.offset;
        const endIndex = startIndex + (selection.focus.offset - selection.anchor.offset);
        await api.applyTextFormat(projectId, testTypeId, docId, { startIndex, endIndex, format, ...styles });
        loadDoc();
    };

    const convertToSlate = (content, formats) => {
        const children = [{ text: content }];
        formats.forEach(f => { });
        return [{ type: 'paragraph', children }];
    };

    const extractText = (value) => value.map(n => SlateEditor.string(editor, [])).join('\n');

    const extractFormats = (value) => {
        return [];
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-screen bg-gray-50 text-sm font-sans">
            <Navbar projectId={projectId} testTypeId={testTypeId} currentDocId={docId} onDocSelected={(id) => router.push(`?docId=${id}`)} onCreateNew={async (title) => {
                const newDoc = await api.createDoc(projectId, testTypeId, { title });
                router.push(`?docId=${newDoc.doc._id}`);
            }} />
            <div className="flex flex-1 overflow-hidden">
                <LeftSidebar doc={doc} versions={versions} onRestore={async (version) => {
                    await api.restoreVersion(projectId, testTypeId, docId, version.versionNumber);
                    loadDoc();
                }} onDuplicate={async () => {
                    const dup = await api.duplicateDoc(projectId, testTypeId, docId, {});
                    router.push(`?docId=${dup.doc._id}`);
                }} onExport={async (format) => {
                    const data = await api.exportDoc(projectId, testTypeId, docId, format);
                }} onArchive={async () => {
                    await api.archiveDoc(projectId, testTypeId, docId);
                    loadDoc();
                }} onUnarchive={async () => {
                    await api.unarchiveDoc(projectId, testTypeId, docId);
                    loadDoc();
                }} onDelete={async () => {
                    await api.deleteDoc(projectId, testTypeId, docId);
                    router.push('/');
                }} onPin={async () => {
                    await api.togglePin(projectId, testTypeId, docId);
                    loadDoc();
                }} onStar={async () => {
                    await api.toggleStar(projectId, testTypeId, docId);
                    loadDoc();
                }} />
                <div className="flex-1 p-4 overflow-auto">
                    <Toolbar onFormat={handleApplyFormat} onAddImage={async (data) => {
                        await api.addImage(projectId, testTypeId, docId, data);
                        loadDoc();
                    }} onAddAttachment={async (data) => {
                        await api.addAttachment(projectId, testTypeId, docId, data);
                        loadDoc();
                    }} onAddCodeBlock={async (data) => {
                        await api.addCodeBlock(projectId, testTypeId, docId, data);
                        loadDoc();
                    }} onAddTable={async (data) => {
                        await api.addTable(projectId, testTypeId, docId, data);
                        loadDoc();
                    }} onClearFormat={async (range) => {
                        await api.clearFormatting(projectId, testTypeId, docId, range);
                        loadDoc();
                    }} />
                    <Slate editor={editor} value={value} onChange={handleChange}>
                        <Editable
                            renderLeaf={Leaf}
                            onKeyDown={handleKeyDown}
                            onSelect={handleSelectionChange}
                            className="bg-white p-4 rounded shadow text-sm"
                            placeholder="Start typing..."
                        />
                    </Slate>
                </div>
                <RightSidebar
                    comments={comments} onAddComment={async (data) => {
                        await api.addComment(projectId, testTypeId, docId, data);
                        loadDoc();
                    }} onReplyComment={async (commentId, data) => {
                        await api.replyToComment(projectId, testTypeId, docId, commentId, data);
                        loadDoc();
                    }} onResolveComment={async (commentId) => {
                        await api.resolveComment(projectId, testTypeId, docId, commentId);
                        loadDoc();
                    }} onDeleteComment={async (commentId) => {
                        await api.deleteComment(projectId, testTypeId, docId, commentId);
                        loadDoc();
                    }}
                    suggestions={suggestions} onAddSuggestion={async (data) => {
                        await api.addSuggestion(projectId, testTypeId, docId, data);
                        loadDoc();
                    }} onAcceptSuggestion={async (suggestionId) => {
                        await api.acceptSuggestion(projectId, testTypeId, docId, suggestionId);
                        loadDoc();
                    }} onRejectSuggestion={async (suggestionId) => {
                        await api.rejectSuggestion(projectId, testTypeId, docId, suggestionId);
                        loadDoc();
                    }}
                    collaborators={collaborators} onAddCollaborator={async (data) => {
                        await api.addCollaborator(projectId, testTypeId, docId, data);
                        loadDoc();
                    }} onUpdatePermission={async (collaboratorId, data) => {
                        await api.updateCollaboratorPermission(projectId, testTypeId, docId, collaboratorId, data);
                        loadDoc();
                    }} onRemoveCollaborator={async (collaboratorId) => {
                        await api.removeCollaborator(projectId, testTypeId, docId, collaboratorId);
                        loadDoc();
                    }}
                    cursors={cursors}
                    onUpdateStatus={async (data) => {
                        await api.updateDocStatus(projectId, testTypeId, docId, data);
                        loadDoc();
                    }}
                />
            </div>
            <Statusbar isSaving={isSaving} cursors={cursors} stats={async () => await api.getDocStats(projectId, testTypeId, docId)} logs={async () => await api.getAccessLogs(projectId, testTypeId, docId)} />
        </motion.div>
    );
};

export default Editor;
