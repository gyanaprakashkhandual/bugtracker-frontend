'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Paperclip,
    Mic,
    Search,
    Plus,
    Menu,
    Pin,
    Trash2,
    Edit2,
    Check,
    X,
    Loader2,
    ChevronLeft,
    ChevronRight,
    StopCircle
} from 'lucide-react';
import { useTestType } from '@/app/script/TestType.context.js';
import MessageParser from '../lib/message.parser.jsx';
import CommandDropdown from '../components/Dropdown.jsx';
import { getUser } from '@/app/utils/Get.user.js';

const Chat = () => {
    const BASE_URL = 'http://localhost:5000/api/v1/chat';
    const AUDIO_API_URL = 'http://localhost:5000/api/v1/audio';
    const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dvytvjplt/image/upload';
    const CLOUDINARY_PRESET = 'test_case_preset';

    const projectId = typeof window !== 'undefined' ? localStorage.getItem('currentProjectId') : null;
    const { testTypeId, testTypeName } = useTestType();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const [chats, setChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCommandDropdown, setShowCommandDropdown] = useState(false);
    const [selectedCommand, setSelectedCommand] = useState(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editingChatId, setEditingChatId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [user, setUser] = useState([]);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    
    const uploadImageToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_PRESET);

        try {
            const response = await fetch(CLOUDINARY_URL, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.secure_url) {
                return {
                    url: data.secure_url,
                    public_id: data.public_id,
                    type: 'image',
                    name: file.name,
                    size: file.size,
                    mimetype: file.type
                };
            }
            throw new Error('Upload failed');
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw error;
        }
    };

    const handleImageSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const uploadPromises = files.map(async (file, index) => {
                if (!file.type.startsWith('image/')) {
                    throw new Error(`${file.name} is not an image file`);
                }

                if (file.size > 10 * 1024 * 1024) {
                    throw new Error(`${file.name} is too large. Max size is 10MB`);
                }

                const uploadedImage = await uploadImageToCloudinary(file);
                setUploadProgress(((index + 1) / files.length) * 100);
                return uploadedImage;
            });

            const uploadedImages = await Promise.all(uploadPromises);
            setAttachments((prev) => [...prev, ...uploadedImages]);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            alert('Error uploading images: ' + error.message);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const removeAttachment = (index) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const fetchUserData = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = getToken();

            if (!token) {
                setError('No authentication token found. Please login again.');
                return;
            }

            const response = await fetch('http://localhost:5000/api/v1/auth/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    setError('Session expired. Please login again.');
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.user) {
                setUser(data.user);
            } else {
                setError('Invalid response format from server');
            }

        } catch (err) {
            console.error('Error fetching user data:', err);
            setError(err.message || 'Failed to fetch user data');
        } finally {
            setLoading(false);
        }
    };

    const fetchChats = async () => {
        try {
            const response = await fetch(
                `${BASE_URL}?testTypeId=${testTypeId}&projectId=${projectId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const data = await response.json();
            if (data.success) {
                setChats(data.data);
            }
        } catch (error) {
            console.error('Error fetching chats:', error);
        }
    };

    const createNewChat = async () => {
        try {
            const response = await fetch(BASE_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    testTypeId,
                    projectId,
                    title: 'New Conversation',
                    aiConfig: {
                        model: 'openai/gpt-3.5-turbo',
                        temperature: 0.7,
                        maxTokens: 2000
                    }
                })
            });
            const data = await response.json();
            if (data.success) {
                setCurrentChat(data.data);
                setMessages([]);
                fetchChats();
            }
        } catch (error) {
            console.error('Error creating chat:', error);
        }
    };

    const loadChat = async (chatId) => {
        try {
            const response = await fetch(`${BASE_URL}/${chatId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (data.success) {
                setCurrentChat(data.data);
                setMessages(data.data.messages || []);
            }
        } catch (error) {
            console.error('Error loading chat:', error);
        }
    };

    // In Chat.jsx, update the sendMessage function around line 360-390:

const sendMessage = async () => {
    if ((!inputMessage.trim() && attachments.length === 0) || !currentChat) return;
    if (inputRef.current) {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = '24px';
    }

    const userMessage = {
        role: 'user',
        content: inputMessage || 'Analyze this image',
        attachments: attachments,
        timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    const tempAttachments = [...attachments];
    setAttachments([]);
    setIsLoading(true);

    try {
        console.log('🚀 [FRONTEND] Sending request:', {
            chatId: currentChat._id,
            content: inputMessage,
            command: selectedCommand
        });

        const response = await fetch(`${BASE_URL}/${currentChat._id}/messages`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: inputMessage || 'Analyze this image',
                command: selectedCommand,
                attachments: tempAttachments
            })
        });

        const data = await response.json();
        
        console.log('📥 [FRONTEND] Response received:', {
            success: data.success,
            hasData: !!data.data,
            hasUserMessage: !!data.data?.userMessage,
            hasAssistantMessage: !!data.data?.assistantMessage
        });

        if (data.success) {
            // 🔍 DEBUG: Check assistant message
            console.log('🤖 [FRONTEND] Assistant message:', {
                role: data.data.assistantMessage.role,
                contentLength: data.data.assistantMessage.content?.length,
                hasMetadata: !!data.data.assistantMessage.metadata,
                metadataKeys: data.data.assistantMessage.metadata ? Object.keys(data.data.assistantMessage.metadata) : [],
                operation: data.data.assistantMessage.metadata?.operation,
                dataCount: data.data.assistantMessage.metadata?.data?.length || 0
            });

            // 🔍 DEBUG: Log the actual metadata being received
            if (data.data.assistantMessage.metadata?.data) {
                console.log('📊 [FRONTEND] Metadata data:', {
                    operation: data.data.assistantMessage.metadata.operation,
                    dataLength: data.data.assistantMessage.metadata.data.length,
                    firstItem: data.data.assistantMessage.metadata.data[0]
                });
            }

            setMessages((prev) => [
                ...prev.slice(0, -1),
                data.data.userMessage,
                data.data.assistantMessage
            ]);
            
            setCurrentChat((prev) => ({
                ...prev,
                title: data.data.chatMetadata.title
            }));
            fetchChats();
        }
    } catch (error) {
        console.error('❌ [FRONTEND] Error sending message:', error);
    } finally {
        setIsLoading(false);
        setSelectedCommand(null);
    }
};

    const updateChatTitle = async (chatId, newTitle) => {
        if (!newTitle.trim()) return;

        try {
            const response = await fetch(`${BASE_URL}/${chatId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: newTitle })
            });

            const data = await response.json();
            if (data.success) {
                if (currentChat?._id === chatId) {
                    setCurrentChat(data.data);
                }
                fetchChats();
                setIsEditingTitle(false);
                setEditingChatId(null);
            }
        } catch (error) {
            console.error('Error updating title:', error);
        }
    };

    const deleteChat = async (chatId) => {
        try {
            const response = await fetch(`${BASE_URL}/${chatId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                fetchChats();
                if (currentChat?._id === chatId) {
                    setCurrentChat(null);
                    setMessages([]);
                }
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
    };

    const togglePin = async (chatId, isPinned) => {
        try {
            const response = await fetch(`${BASE_URL}/${chatId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isPinned: !isPinned })
            });

            const data = await response.json();
            if (data.success) {
                fetchChats();
            }
        } catch (error) {
            console.error('Error toggling pin:', error);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputMessage(value);

        if (value === '@' || (value.endsWith(' @') && !showCommandDropdown)) {
            setShowCommandDropdown(true);
        } else if (!value.includes('@')) {
            setShowCommandDropdown(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await sendAudioToAPI(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Microphone access denied or not available.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const sendAudioToAPI = async (audioBlob) => {
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');

            const response = await fetch(AUDIO_API_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (data.text) {
                setInputMessage(prev => prev + data.text);
                if (inputRef.current) {
                    setTimeout(() => {
                        inputRef.current.style.height = 'auto';
                        inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 400)}px`;
                        inputRef.current.focus();
                    }, 0);
                }
            }
        } catch (error) {
            console.error('Error processing audio:', error);
            alert('Failed to process audio.');
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    useEffect(() => {
        if (testTypeId && projectId && token) {
            fetchChats();
        }
    }, [testTypeId, projectId, token]);

    return (
        <div className="flex h-screen bg-white dark:bg-gray-900">
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ x: -320 }}
                        animate={{ x: 0 }}
                        exit={{ x: -320 }}
                        className="w-full sm:w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col absolute sm:relative z-20 h-full"
                    >
                        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <span className="text-lg sm:text-xl font-bold text-white">L</span>
                                    </div>
                                    <div>
                                        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">Lumen AI</h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">QA Assistant</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                </button>
                            </div>

                            <button
                                onClick={createNewChat}
                                className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg"
                            >
                                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="text-sm font-semibold">New Chat</span>
                            </button>
                        </div>

                        <div className="p-3 sm:p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-2 sm:px-3">
                            {chats.length === 0 ? (
                                <div className="p-6 sm:p-8 text-center">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No conversations yet</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Start a new chat to begin</p>
                                </div>
                            ) : (
                                <div className="space-y-2 pb-4">
                                    {chats
                                        .filter((chat) =>
                                            chat.title.toLowerCase().includes(searchQuery.toLowerCase())
                                        )
                                        .map((chat) => (
                                            <motion.div
                                                key={chat._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`rounded-xl cursor-pointer transition-all group ${currentChat?._id === chat._id
                                                    ? 'bg-gradient-to-r from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 border-2 border-sky-300 dark:border-sky-600 shadow-sm'
                                                    : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                                                    }`}
                                                onClick={() => loadChat(chat._id)}
                                            >
                                                <div className="p-2.5 sm:p-3">
                                                    {isEditingTitle && editingChatId === chat._id ? (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={editTitle}
                                                                onChange={(e) => setEditTitle(e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="flex-1 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    updateChatTitle(chat._id, editTitle);
                                                                }}
                                                                className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                                                            >
                                                                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setIsEditingTitle(false);
                                                                    setEditingChatId(null);
                                                                }}
                                                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                                            >
                                                                <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                                    {chat.title}
                                                                </h3>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                    {new Date(chat.updatedAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setIsEditingTitle(true);
                                                                        setEditingChatId(chat._id);
                                                                        setEditTitle(chat.title);
                                                                    }}
                                                                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                                                >
                                                                    <Edit2 className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        togglePin(chat._id, chat.isPinned);
                                                                    }}
                                                                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                                                >
                                                                    <Pin
                                                                        className={`w-3.5 h-3.5 ${chat.isPinned
                                                                            ? 'fill-sky-500 text-sky-500 dark:fill-sky-400 dark:text-sky-400'
                                                                            : 'text-gray-500 dark:text-gray-400'
                                                                            }`}
                                                                    />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (window.confirm('Delete this conversation?')) {
                                                                            deleteChat(chat._id);
                                                                        }
                                                                    }}
                                                                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                    {!currentChat ? (
                        <div className="h-full flex items-center justify-center px-4">
                            <div className="text-center max-w-4xl">
                                {!isSidebarOpen && (
                                    <button
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="absolute top-4 left-4 p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl transition-all shadow-sm"
                                    >
                                        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    </button>
                                )}
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-sky-400 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl">
                                    <span className="text-3xl sm:text-4xl font-bold text-white">L</span>
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
                                    Hello there!
                                </h2>
                                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8">
                                    I'm <span className="font-semibold text-sky-600 dark:text-sky-400">Lumen</span>, your intelligent QA testing assistant
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto">
                                    <div className="p-3 sm:p-4 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border border-sky-200 dark:border-sky-800 rounded-xl">
                                        <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">Manage Bugs</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Track and resolve issues</p>
                                    </div>
                                    <div className="p-3 sm:p-4 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border border-sky-200 dark:border-sky-800 rounded-xl">
                                        <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">Test Cases</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Create and organize tests</p>
                                    </div>
                                    <div className="p-3 sm:p-4 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border border-sky-200 dark:border-sky-800 rounded-xl">
                                        <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">Projects</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage your workspace</p>
                                    </div>
                                    <div className="p-3 sm:p-4 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border border-sky-200 dark:border-sky-800 rounded-xl">
                                        <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">Natural Language</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Just ask me anything</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="px-4 py-4 sm:py-6 lg:px-8">
                            {!isSidebarOpen && (
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="fixed top-4 left-4 z-10 p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl transition-all shadow-md"
                                >
                                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                </button>
                            )}
                            <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
                                {messages.map((message, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={`flex gap-2 sm:gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                            }`}
                                    >
                                        {message.role === 'assistant' && (
                                            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                                                <span className="text-xs sm:text-sm font-bold text-white">AI</span>
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[85%] h-full sm:max-w-4xl ${message.role === 'user'
                                                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-2xl rounded-tr-md px-4 sm:px-5 py-3 sm:py-3.5'
                                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-md px-4 sm:px-5 py-3 sm:py-3.5 shadow-sm'
                                                }`}
                                        >
<MessageParser
    content={message.content}
    role={message.role}
    attachments={message.attachments}
    metadata={message.metadata}
/>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span
                                                    className={`text-xs ${message.role === 'user'
                                                        ? 'text-sky-100'
                                                        : 'text-gray-400 dark:text-gray-500'
                                                        }`}
                                                >
                                                    {new Date(message.timestamp).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                        {message.role === 'user' && (
                                            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-sky-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                                                <span className="text-xs sm:text-sm font-bold text-white">U</span>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex gap-2 sm:gap-3"
                                    >
                                        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                                            <span className="text-xs sm:text-sm font-bold text-white">AI</span>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-md px-4 sm:px-5 py-3 sm:py-3.5 shadow-sm">
                                            <Loader2 className="w-5 h-5 animate-spin text-sky-500 dark:text-sky-400" />
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>
                    )}
                </div>

                {currentChat && (
                    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-3 sm:py-4 lg:px-8">
                        <div className="max-w-4xl mx-auto relative">
                            <AnimatePresence>
                                {showCommandDropdown && (
                                    <CommandDropdown
                                        onSelect={(command) => {
                                            setSelectedCommand(command);
                                            setShowCommandDropdown(false);
                                            setInputMessage((prev) => prev.replace(/@\s*$/, ''));
                                            setTimeout(() => {
                                                inputRef.current?.focus();
                                            }, 100);
                                        }}
                                        onClose={() => setShowCommandDropdown(false)}
                                    />
                                )}
                            </AnimatePresence>

                            {selectedCommand && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-2 sm:mb-3 flex items-center gap-2"
                                >
                                    <span className="text-xs bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium">
                                        Command: {selectedCommand}
                                    </span>
                                    <button
                                        onClick={() => setSelectedCommand(null)}
                                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            )}

                            {attachments.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mb-2 sm:mb-3 flex flex-wrap gap-2"
                                >
                                    {attachments.map((attachment, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="relative group"
                                        >
                                            <img
                                                src={attachment.url}
                                                alt={attachment.name}
                                                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-sm"
                                            />
                                            <button
                                                onClick={() => removeAttachment(index)}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}

                            {isUploading && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mb-2 sm:mb-3 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-2"
                                >
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-sky-500 dark:text-sky-400" />
                                        <div className="flex-1">
                                            <div className="text-xs text-sky-700 dark:text-sky-300 font-medium">
                                                {Math.round(uploadProgress)}%
                                            </div>
                                            <div className="w-full bg-sky-200 dark:bg-sky-800 rounded-full h-1 overflow-hidden mt-1">
                                                <motion.div
                                                    className="bg-gradient-to-r from-sky-500 to-blue-600 h-1"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${uploadProgress}%` }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div className="w-full space-y-2">
                                {isRecording && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2"
                                    >
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                        <span className="text-xs text-red-600 dark:text-red-400 font-medium">Recording...</span>
                                        <button
                                            onClick={stopRecording}
                                            className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                        >
                                            <StopCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                        </button>
                                    </motion.div>
                                )}

                                <div className="flex items-end gap-2 bg-gray-100 dark:bg-gray-700 rounded-2xl border border-gray-300 dark:border-gray-600 p-2 shadow-sm">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageSelect}
                                        className="hidden"
                                    />

                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading || isRecording}
                                        className="p-2 sm:p-2.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                    >
                                        <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                                    </button>

                                    <textarea
                                        ref={inputRef}
                                        value={inputMessage}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            const textarea = e.target;
                                            textarea.style.height = 'auto';
                                            textarea.style.height = `${Math.min(textarea.scrollHeight, 400)}px`;
                                        }}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Ask Lumen about bugs, test cases, projects..."
                                        disabled={isUploading || isRecording}
                                        className="flex-1 bg-transparent border-none outline-none resize-none text-sm sm:text-base text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 overflow-y-auto"
                                        rows={1}
                                        style={{
                                            minHeight: '24px',
                                            maxHeight: '400px',
                                            lineHeight: '24px'
                                        }}
                                    />

                                    <button
                                        onClick={sendMessage}
                                        disabled={
                                            (!inputMessage.trim() && attachments.length === 0) ||
                                            isLoading ||
                                            isUploading ||
                                            isRecording
                                        }
                                        className="p-2 sm:p-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl transition-all shadow-md hover:shadow-lg flex-shrink-0"
                                    >
                                        <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </button>
                                </div>

                                <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2">
                                    Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Shift + Enter</kbd> for new line
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;