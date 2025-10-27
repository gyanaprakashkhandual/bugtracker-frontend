'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Typography from '@tiptap/extension-typography';
import Placeholder from '@tiptap/extension-placeholder';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import Blockquote from '@tiptap/extension-blockquote';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Focus from '@tiptap/extension-focus';
import CharacterCount from '@tiptap/extension-character-count';
import Youtube from '@tiptap/extension-youtube';
import BubbleMenu from '@tiptap/extension-bubble-menu';
import FloatingMenu from '@tiptap/extension-floating-menu';
import { Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import sql from 'highlight.js/lib/languages/sql';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';

const lowlight = createLowlight();

lowlight.register('javascript', javascript);
lowlight.register('python', python);
lowlight.register('java', java);
lowlight.register('cpp', cpp);
lowlight.register('csharp', csharp);
lowlight.register('php', php);
lowlight.register('ruby', ruby);
lowlight.register('go', go);
lowlight.register('rust', rust);
lowlight.register('typescript', typescript);
lowlight.register('xml', xml);
lowlight.register('css', css);
lowlight.register('sql', sql);
lowlight.register('bash', bash);
lowlight.register('json', json);

import { Extension } from '@tiptap/core';

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize || null,
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run();
      },
    };
  },
});

const LineHeight = Extension.create({
  name: 'lineHeight',
  addOptions() {
    return {
      types: ['paragraph', 'heading'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: element => element.style.lineHeight || null,
            renderHTML: attributes => {
              if (!attributes.lineHeight) {
                return {};
              }
              return {
                style: `line-height: ${attributes.lineHeight}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setLineHeight: lineHeight => ({ commands }) => {
        return this.options.types.every(type =>
          commands.updateAttributes(type, { lineHeight })
        );
      },
    };
  },
});

const LetterSpacing = Extension.create({
  name: 'letterSpacing',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          letterSpacing: {
            default: null,
            parseHTML: element => element.style.letterSpacing || null,
            renderHTML: attributes => {
              if (!attributes.letterSpacing) {
                return {};
              }
              return {
                style: `letter-spacing: ${attributes.letterSpacing}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setLetterSpacing: letterSpacing => ({ chain }) => {
        return chain()
          .setMark('textStyle', { letterSpacing })
          .run();
      },
    };
  },
});

const Indent = Extension.create({
  name: 'indent',
  addOptions() {
    return {
      types: ['paragraph', 'heading'],
      minLevel: 0,
      maxLevel: 8,
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            renderHTML: attributes => {
              if (!attributes.indent) {
                return {};
              }
              return {
                style: `margin-left: ${attributes.indent * 30}px`,
              };
            },
            parseHTML: element => {
              const margin = element.style.marginLeft;
              return margin ? parseInt(margin, 10) / 30 : 0;
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      indent: () => ({ tr, state, dispatch, editor }) => {
        const { selection } = state;
        tr = tr.setSelection(selection);
        tr = tr.setMeta('indent', true);
        const { from, to } = selection;
        state.doc.nodesBetween(from, to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            const currentIndent = node.attrs.indent || 0;
            if (currentIndent < this.options.maxLevel) {
              tr = tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                indent: currentIndent + 1,
              });
            }
          }
        });
        if (dispatch) {
          dispatch(tr);
        }
        return true;
      },
      outdent: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        tr = tr.setSelection(selection);
        tr = tr.setMeta('outdent', true);
        const { from, to } = selection;
        state.doc.nodesBetween(from, to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            const currentIndent = node.attrs.indent || 0;
            if (currentIndent > this.options.minLevel) {
              tr = tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                indent: currentIndent - 1,
              });
            }
          }
        });
        if (dispatch) {
          dispatch(tr);
        }
        return true;
      },
    };
  },
  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.indent(),
      'Shift-Tab': () => this.editor.commands.outdent(),
    };
  },
});

import { useTestType } from '@/app/script/TestType.context';
import { useAlert } from '@/app/script/Alert.context';
import { useProject } from '@/app/script/Project.context';
import { useDoc } from '@/app/script/Doc.context';
import EditorToolbar from '../component/Toolbar';
import EditorContentArea from '../component/Editor';
import DocumentStatusBar from '../component/Statusbar';
import OpenDocs from '../component/Doc';
import ComingSoonFeature from '../component/Bot';


const DocumentEditor = () => {
    const { showAlert } = useAlert();
    const { selectedProject } = useProject();
    const projectId = selectedProject?._id;
    const { testTypeId, testTypeName } = useTestType();
    const { docId, docName } = useDoc();

    const [document, setDocument] = useState(null);
    const [title, setTitle] = useState('Untitled Document');
    const [lastSaved, setLastSaved] = useState(null);
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [showImageDialog, setShowImageDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showOpenDocs, setShowOpenDocs] = useState(false);
    const [showDocBot, setShowDocBot] = useState(false);

    const saveTimeoutRef = useRef(null);
    const isLoadingRef = useRef(false);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                history: {
                    depth: 100,
                },
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
                codeBlock: false,
            }),
            Underline,
            Subscript,
            Superscript,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right', 'justify'],
                defaultAlignment: 'left',
            }),
            Highlight.configure({
                multicolor: true,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 dark:text-blue-400 underline cursor-pointer hover:text-blue-700 dark:hover:text-blue-300',
                },
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
                HTMLAttributes: {
                    class: 'max-w-full h-auto rounded-lg shadow-md my-4 cursor-pointer',
                },
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse table-auto w-full my-4',
                },
            }),
            TableRow,
            TableCell.configure({
                HTMLAttributes: {
                    class: 'border border-gray-300 dark:border-gray-600 p-2 min-w-[100px]',
                },
            }),
            TableHeader.configure({
                HTMLAttributes: {
                    class: 'border border-gray-300 dark:border-gray-600 p-2 bg-gray-100 dark:bg-gray-800 font-bold',
                },
            }),
            TaskList.configure({
                HTMLAttributes: {
                    class: 'list-none space-y-2',
                },
            }),
            TaskItem.configure({
                nested: true,
                HTMLAttributes: {
                    class: 'flex items-start gap-2',
                },
            }),
            TextStyle,
            Color,
            FontFamily,
            FontSize,
            LineHeight,
            LetterSpacing,
            Indent,
            Typography,
            Placeholder.configure({
                placeholder: 'Start writing your document...',
            }),
            CodeBlockLowlight.configure({
                lowlight,
                HTMLAttributes: {
                    class: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto',
                },
            }),
            Blockquote.configure({
                HTMLAttributes: {
                    class: 'border-l-4 border-blue-500 dark:border-blue-500 pl-4 italic text-gray-700 dark:text-gray-300 my-4',
                },
            }),
            HorizontalRule.configure({
                HTMLAttributes: {
                    class: 'my-8 border-t-2 border-gray-300 dark:border-gray-700',
                },
            }),
            Dropcursor.configure({
                color: '#3b82f6',
                width: 2,
            }),
            Gapcursor,
            Focus.configure({
                className: 'has-focus',
                mode: 'all',
            }),
            CharacterCount,
            Youtube.configure({
                width: 640,
                height: 480,
                HTMLAttributes: {
                    class: 'rounded-lg my-4',
                },
            }),
        ],
        content: '',
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert prose-lg max-w-none focus:outline-none min-h-[600px] p-8',
            },
        },
        onUpdate: ({ editor }) => {
            if (!isLoadingRef.current) {
                const html = editor.getHTML();
                handleContentChange(html);
            }
        },
    });

    const getToken = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    };

    const loadDocument = useCallback(async () => {
        if (!docId || !editor) {
            return;
        }

        setIsLoading(true);
        isLoadingRef.current = true;

        try {
            const token = getToken();

            if (!token) {
                showAlert('Authentication required', 'error');
                setIsLoading(false);
                isLoadingRef.current = false;
                return;
            }

            const response = await fetch(`https://caffetest.onrender.com/api/v1/doc/${docId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const doc = await response.json();
                setDocument(doc);
                setTitle(doc.title || 'Untitled Document');

                if (doc.content?.html) {
                    setTimeout(() => {
                        editor.commands.setContent(doc.content.html);
                    }, 50);
                } else {
                    editor.commands.setContent('');
                }
            } else {
                throw new Error('Failed to load document');
            }
        } catch (error) {
            showAlert('Failed to load document', 'error');
        } finally {
            setTimeout(() => {
                setIsLoading(false);
                isLoadingRef.current = false;
            }, 100);
        }
    }, [docId, editor, showAlert]);

    useEffect(() => {
        if (docId && editor) {
            loadDocument();
        } else {
            if (!docId) {
                setIsLoading(false);
            }
        }
    }, [docId, editor, loadDocument]);

    const autoSave = useCallback(async (contentToSave) => {
        if (!docId) {
            return;
        }

        try {
            const token = getToken();

            const payload = {
                content: { html: contentToSave },
                title: title,
                version: (document?.version || 1) + 1
            };

            const response = await fetch(`https://caffetest.onrender.com/api/v1/doc/${docId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const updatedDoc = await response.json();
                setDocument(updatedDoc);
                setLastSaved(new Date());
            } else {
                throw new Error('Failed to save document');
            }
        } catch (error) {
            showAlert('Failed to save document', 'error');
        }
    }, [docId, document, title, showAlert]);

    const handleContentChange = useCallback((newContent) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            autoSave(newContent);
        }, 2000);
    }, [autoSave]);

    const handleManualSave = () => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        if (editor) {
            autoSave(editor.getHTML());
        }
    };

    const insertTable = () => {
        if (editor) {
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        }
    };

    const handleOpenDocs = () => {
        if (showDocBot) {
            setShowDocBot(false);
        }
        setShowOpenDocs(!showOpenDocs);
    };

    const handleOpenDocBot = () => {
        if (showOpenDocs) {
            setShowOpenDocs(false);
        }
        setShowDocBot(!showDocBot);
    };

    if (isLoading || !editor) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-500 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400 mt-4">
                        {!editor ? 'Initializing editor...' : 'Loading document...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="sidebar-scrollbar min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
            <div className="sticky top-0 z-50 bg-white dark:bg-gray-950">
                <EditorToolbar
                    editor={editor}
                    setShowLinkDialog={setShowLinkDialog}
                    setShowImageDialog={setShowImageDialog}
                    insertTable={insertTable}
                />
            </div>

            <div className="relative flex" style={{ height: 'calc(100vh - 90px)' }}>
                <AnimatePresence mode="wait">
                    {showOpenDocs && (
                        <OpenDocs onClose={() => setShowOpenDocs(false)} />
                    )}
                    {showDocBot && (
                        <ComingSoonFeature onClose={() => setShowDocBot(false)} />
                    )}
                </AnimatePresence>

                <div 
                    className={`flex-1 overflow-y-auto transition-all duration-300 ${
                        showOpenDocs ? 'ml-80' : ''
                    } ${
                        showDocBot ? 'mr-80' : ''
                    }`}
                >
                    <EditorContentArea
                        editor={editor}
                        showLinkDialog={showLinkDialog}
                        setShowLinkDialog={setShowLinkDialog}
                        showImageDialog={showImageDialog}
                        setShowImageDialog={setShowImageDialog}
                    />
                </div>
            </div>

            <DocumentStatusBar
                editor={editor}
                title={title}
                setTitle={setTitle}
                testTypeName={testTypeName}
                docName={docName}
                lastSaved={lastSaved}
                handleManualSave={handleManualSave}
                onOpenDocs={handleOpenDocs}
                onOpenDocBot={handleOpenDocBot}
                isDocsOpen={showOpenDocs}
                isDocBotOpen={showDocBot}
            />
        </div>
    );
};

export default DocumentEditor;