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
    Archive,
    Trash2,
    MoreVertical,
    Edit2,
    Check,
    X,
    Settings,
    MessageSquare,
    Loader2
} from 'lucide-react';
import { useTestType } from '@/app/script/TestType.context.js';
import MessageParser from '../lib/message.parser.jsx';
import CommandDropdown from '../components/Dropdown.jsx';

const Chat = () => {
    const BASE_URL = 'http://localhost:5000/api/v1/chat';
    const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dvytvjplt/image/upload';
    const CLOUDINARY_PRESET = 'test_case_preset';

    const projectId = typeof window !== 'undefined' ? localStorage.getItem('currentProjectId') : null;
    const { testTypeId, testTypeName } = useTestType();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // States
    const [chats, setChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCommandDropdown, setShowCommandDropdown] = useState(false);
    const [selectedCommand, setSelectedCommand] = useState(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitle, setEditTitle] = useState('');

    // Image upload states
    const [attachments, setAttachments] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Image upload to Cloudinary
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

    // Handle image file selection
    const handleImageSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const uploadPromises = files.map(async (file, index) => {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    throw new Error(`${file.name} is not an image file`);
                }

                // Validate file size (max 10MB)
                if (file.size > 10 * 1024 * 1024) {
                    throw new Error(`${file.name} is too large. Max size is 10MB`);
                }

                const uploadedImage = await uploadImageToCloudinary(file);
                setUploadProgress(((index + 1) / files.length) * 100);
                return uploadedImage;
            });

            const uploadedImages = await Promise.all(uploadPromises);
            setAttachments((prev) => [...prev, ...uploadedImages]);

            // Clear file input
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

    // Handle paste event for images
    const handlePaste = async (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        const imageFiles = [];

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    imageFiles.push(file);
                }
            }
        }

        if (imageFiles.length > 0) {
            e.preventDefault();
            setIsUploading(true);
            setUploadProgress(0);

            try {
                const uploadPromises = imageFiles.map(async (file, index) => {
                    const uploadedImage = await uploadImageToCloudinary(file);
                    setUploadProgress(((index + 1) / imageFiles.length) * 100);
                    return uploadedImage;
                });

                const uploadedImages = await Promise.all(uploadPromises);
                setAttachments((prev) => [...prev, ...uploadedImages]);
            } catch (error) {
                alert('Error uploading pasted images: ' + error.message);
            } finally {
                setIsUploading(false);
                setUploadProgress(0);
            }
        }
    };

    // Remove attachment
    const removeAttachment = (index) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    // Fetch all chats
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

    // Create new chat
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
                // Save to localStorage
                localStorage.setItem('lastChatId', data.data._id);
                fetchChats();
            }
        } catch (error) {
            console.error('Error creating chat:', error);
        }
    };

    // Load chat by ID
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
                // Save to localStorage
                localStorage.setItem('lastChatId', chatId);
            }
        } catch (error) {
            console.error('Error loading chat:', error);
        }
    };

    // Send message with attachments
    const sendMessage = async () => {
        if ((!inputMessage.trim() && attachments.length === 0) || !currentChat) return;

        const userMessage = {
            role: 'user',
            content: inputMessage || 'Analyze this image',
            attachments: attachments,
            timestamp: new Date()
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputMessage('');
        const tempAttachments = [...attachments];
        setAttachments([]); // Clear attachments after sending
        setIsLoading(true);

        try {
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
            if (data.success) {
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
            console.error('Error sending message:', error);
        } finally {
            setIsLoading(false);
            setSelectedCommand(null);
        }
    };

    // Update chat title
    const updateChatTitle = async () => {
        if (!editTitle.trim() || !currentChat) return;

        try {
            const response = await fetch(`${BASE_URL}/${currentChat._id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: editTitle })
            });

            const data = await response.json();
            if (data.success) {
                setCurrentChat(data.data);
                fetchChats();
                setIsEditingTitle(false);
            }
        } catch (error) {
            console.error('Error updating title:', error);
        }
    };

    // Delete chat
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
                    // Clear from localStorage if it's the current chat
                    localStorage.removeItem('lastChatId');
                    setCurrentChat(null);
                    setMessages([]);
                    // Create a new chat automatically
                    createNewChat();
                }
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
    };

    // Toggle pin
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

    // Handle @ command
    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputMessage(value);

        if (value === '@' || (value.endsWith(' @') && !showCommandDropdown)) {
            setShowCommandDropdown(true);
        } else if (!value.includes('@')) {
            setShowCommandDropdown(false);
        }
    };

    // Handle Enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Initialize: Load last chat or create new one
    useEffect(() => {
        if (testTypeId && projectId && token) {
            fetchChats();

            // Try to load last chat from localStorage
            const lastChatId = localStorage.getItem('lastChatId');

            if (lastChatId) {
                // Load the last opened chat
                loadChat(lastChatId);
            } else {
                // Create a new chat if no last chat exists
                createNewChat();
            }
        }
    }, [testTypeId, projectId, token]);

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        className="w-64 bg-white border-r border-gray-200 flex flex-col"
                    >
                        {/* New Chat Button */}
                        <div className="p-4 border-b border-gray-200">
                            <button
                                onClick={createNewChat}
                                className="w-full flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="text-sm font-medium">New Chat</span>
                            </button>
                        </div>

                        {/* Search */}
                        <div className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search chats..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Chat List */}
                        <div className="flex-1 overflow-y-auto">
                            {chats.length === 0 ? (
                                <div className="p-8 text-center">
                                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="text-sm text-gray-400">No chat history yet</p>
                                    <p className="text-xs text-gray-300 mt-1">
                                        Start a conversation to see it here
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-1 p-2">
                                    {chats
                                        .filter((chat) =>
                                            chat.title.toLowerCase().includes(searchQuery.toLowerCase())
                                        )
                                        .map((chat) => (
                                            <motion.div
                                                key={chat._id}
                                                whileHover={{ scale: 1.02 }}
                                                className={`p-3 rounded-lg cursor-pointer transition-colors group ${currentChat?._id === chat._id
                                                    ? 'bg-blue-50 border border-blue-200'
                                                    : 'hover:bg-gray-50'
                                                    }`}
                                                onClick={() => loadChat(chat._id)}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-sm font-medium text-gray-900 truncate">
                                                            {chat.title}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 truncate mt-1">
                                                            {chat.lastMessagePreview}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="text-xs text-gray-400">
                                                                {chat.messageCount} messages
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                togglePin(chat._id, chat.isPinned);
                                                            }}
                                                            className="p-1 hover:bg-gray-200 rounded"
                                                        >
                                                            <Pin
                                                                className={`w-3 h-3 ${chat.isPinned ? 'fill-blue-500 text-blue-500' : 'text-gray-400'
                                                                    }`}
                                                            />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteChat(chat._id);
                                                            }}
                                                            className="p-1 hover:bg-gray-200 rounded"
                                                        >
                                                            <Trash2 className="w-3 h-3 text-gray-400" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-1 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Menu className="w-5 h-5 text-gray-600" />
                        </button>
                        {currentChat ? (
                            isEditingTitle ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="px-3 py-1 border border-gray-300 rounded text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        autoFocus
                                    />
                                    <button
                                        onClick={updateChatTitle}
                                        className="p-1 hover:bg-green-100 rounded"
                                    >
                                        <Check className="w-5 h-5 text-green-600" />
                                    </button>
                                    <button
                                        onClick={() => setIsEditingTitle(false)}
                                        className="p-1 hover:bg-red-100 rounded"
                                    >
                                        <X className="w-5 h-5 text-red-600" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <h1 className="text-lg font-semibold text-gray-900">
                                        {currentChat.title}
                                    </h1>
                                    <button
                                        onClick={() => {
                                            setIsEditingTitle(true);
                                            setEditTitle(currentChat.title);
                                        }}
                                        className="p-1 hover:bg-gray-100 rounded"
                                    >
                                        <Edit2 className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                            )
                        ) : (
                            <h1 className="text-lg font-semibold text-gray-900">Lumen AI Assistant</h1>
                        )}
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    {!currentChat ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center max-w-md">
                                <Loader2 className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-spin" />
                                <p className="text-gray-500">Loading chat...</p>
                            </div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center max-w-md">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-white">L</span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Hello 👋
                                </h2>
                                <p className="text-gray-600">
                                    I'm Lumen, your QA testing assistant. I can help you manage test cases, bugs,
                                    and projects using natural language commands.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 max-w-4xl mx-auto">
                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                        }`}
                                >
                                    {message.role === 'assistant' && (
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-bold text-white">AI</span>
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-3xl ${message.role === 'user'
                                            ? 'bg-blue-500 text-white rounded-2xl rounded-tr-sm px-4 py-3'
                                            : 'bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3'
                                            }`}
                                    >
                                        <MessageParser content={message.content} role={message.role} attachments={message.attachments} />
                                        <div className="flex items-center gap-2 mt-2">
                                            <span
                                                className={`text-xs ${message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
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
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-bold text-white">U</span>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-4"
                                >
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-bold text-white">AI</span>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3">
                                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                {currentChat && (
                    <div className="bg-white border-t border-gray-200 px-6 py-4">
                        <div className="max-w-4xl mx-auto relative">
                            {/* Command Dropdown */}
                            <AnimatePresence>
                                {showCommandDropdown && (
                                    <CommandDropdown
                                        onSelect={(command) => {
                                            setSelectedCommand(command);
                                            setShowCommandDropdown(false);
                                            setInputMessage((prev) => prev.replace(/@\s*$/, ''));
                                        }}
                                        onClose={() => setShowCommandDropdown(false)}
                                    />
                                )}
                            </AnimatePresence>

                            {/* Selected Command Badge */}
                            {selectedCommand && (
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                        Command: {selectedCommand}
                                    </span>
                                    <button
                                        onClick={() => setSelectedCommand(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}

                            {/* Image Attachments Preview */}
                            {attachments.length > 0 && (
                                <div className="mb-3 flex flex-wrap gap-2">
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
                                                className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                                            />
                                            <button
                                                onClick={() => removeAttachment(index)}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* Upload Progress */}
                            {isUploading && (
                                <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                        <div className="flex-1">
                                            <div className="text-sm text-blue-700 mb-1">
                                                Uploading images... {Math.round(uploadProgress)}%
                                            </div>
                                            <div className="w-full bg-blue-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-end gap-2 bg-gray-50 rounded-2xl border border-gray-200 p-2">
                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />

                                {/* Attachment button */}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Paperclip className="w-5 h-5 text-gray-500" />
                                </button>

                                <textarea
                                    ref={inputRef}
                                    value={inputMessage}
                                    onChange={handleInputChange}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Message Lumen... (Attach images with 📎)"
                                    disabled={isUploading}
                                    className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 text-gray-900 placeholder-gray-400 disabled:opacity-50"
                                    rows={1}
                                    style={{
                                        minHeight: '24px',
                                        maxHeight: '120px'
                                    }}
                                />

                                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                                    <Mic className="w-5 h-5 text-gray-500" />
                                </button>

                                <button
                                    onClick={sendMessage}
                                    disabled={(!inputMessage.trim() && attachments.length === 0) || isLoading || isUploading}
                                    className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
                                >
                                    <Send className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;