'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Search, Plus, Paperclip, Mic, StopCircle, CheckCircle, AlertCircle, Info, X, Image as ImageIcon, File, Trash2, MessageSquare } from 'lucide-react'

const commands = [
    '@add-test-case',
    '@add-bug',
    '@add-data',
    '@add-project',
    '@add-test-type',
    '@edit-test-case',
    '@edit-bug',
    '@edit-data',
    '@edit-project',
    '@edit-test-type',
    '@archive-test-case',
    '@archive-bug',
    '@archive-data',
    '@get-test-case',
    '@get-bug',
    '@get-project',
    '@get-test-type',
    '@get-test-data'
]

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api/v1/chat'

// Helper to get auth token
const getAuthToken = () => {
    // Safely read from localStorage in the browser; fall back to window.authToken if set
    if (typeof window === 'undefined') return ''
    try {
        const t = localStorage.getItem('token')
        return t || window.authToken || ''
    } catch (e) {
        // localStorage access can throw in some environments (e.g., private mode)
        return window.authToken || ''
    }
}

// Helper to render message content with command highlighting
const renderMessageContent = (content) => {
    const parts = content.split(/(@[\w-]+)/g)
    return parts.map((part, index) => {
        if (part.startsWith('@') && commands.includes(part)) {
            return (
                <span key={index} className="inline-flex items-center px-2.5 py-1 mx-0.5 rounded-md bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-semibold text-sm border border-indigo-200 shadow-sm">
                    {part}
                </span>
            )
        }
        return <span key={index}>{part}</span>
    })
}

// Action result component
const ActionResult = ({ result }) => {
    if (!result) return null

    const getIcon = () => {
        switch (result.status) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-600" />
            case 'need_info':
                return <Info className="w-5 h-5 text-blue-600" />
            default:
                return <Info className="w-5 h-5 text-gray-600" />
        }
    }

    const getBgColor = () => {
        switch (result.status) {
            case 'success':
                return 'bg-green-50 border-green-200'
            case 'error':
                return 'bg-red-50 border-red-200'
            case 'need_info':
                return 'bg-blue-50 border-blue-200'
            default:
                return 'bg-gray-50 border-gray-200'
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-3 p-3 rounded-lg border ${getBgColor()}`}
        >
            <div className="flex items-start gap-2">
                {getIcon()}
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{result.message}</p>
                    {result.data && (
                        <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-x-auto">
                            {JSON.stringify(result.data, null, 2)}
                        </pre>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

// Attachment preview component
const AttachmentPreview = ({ attachment, onRemove }) => {
    const isImage = attachment.type === 'image'
    
    return (
        <div className="relative inline-block mr-2 mb-2">
            <div className="relative w-20 h-20 bg-gray-100 rounded-lg border border-gray-300 overflow-hidden">
                {isImage ? (
                    <img src={attachment.url} alt={attachment.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex items-center justify-center w-full h-full">
                        <File className="w-8 h-8 text-gray-400" />
                    </div>
                )}
            </div>
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                    <X className="w-3 h-3" />
                </button>
            )}
            <p className="text-xs text-gray-600 mt-1 truncate w-20">{attachment.name}</p>
        </div>
    )
}

export default function LumenChat() {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            content: 'Good Morning! 👋',
            subtitle: 'I\'m Lumen, your QA testing assistant. I can help you create bugs, projects, test cases, and more using natural language. Try using commands like @add-bug or @add-project!',
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [dropdownSearch, setDropdownSearch] = useState('')
    const [cursorPosition, setCursorPosition] = useState(0)
    const [isRecording, setIsRecording] = useState(false)
    const [selectedCommandIndex, setSelectedCommandIndex] = useState(0)
    const [sidebarSearch, setSidebarSearch] = useState('')
    const [highlightedCommands, setHighlightedCommands] = useState(new Set())
    const [chatHistory, setChatHistory] = useState([])
    const [currentConversationId, setCurrentConversationId] = useState(null)
    const [attachments, setAttachments] = useState([])
    const [isUploading, setIsUploading] = useState(false)
    const inputRef = useRef(null)
    const messagesEndRef = useRef(null)
    const dropdownRef = useRef(null)
    const fileInputRef = useRef(null)

    const filteredCommands = commands.filter(cmd =>
        cmd.toLowerCase().includes(dropdownSearch.toLowerCase())
    )

    const filteredChatHistory = chatHistory.filter(chat =>
        chat.title.toLowerCase().includes(sidebarSearch.toLowerCase())
    )

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        loadChatHistory()
    }, [])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto'
            inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 300) + 'px'
        }
    }, [input])

    const loadChatHistory = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/history`, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setChatHistory(data.conversations || [])
            }
        } catch (error) {
            console.error('Error loading chat history:', error)
        }
    }

    const loadConversation = async (conversationId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/conversation/${conversationId}`, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                const conversation = data.conversation
                
                const formattedMessages = conversation.messages.map((msg, index) => ({
                    id: index + 1,
                    type: msg.role === 'user' ? 'user' : 'ai',
                    content: msg.content,
                    timestamp: new Date(msg.timestamp),
                    command: msg.command,
                    actionResult: msg.actionResult,
                    attachments: msg.attachments
                }))

                setMessages(formattedMessages)
                setCurrentConversationId(conversationId)
            }
        } catch (error) {
            console.error('Error loading conversation:', error)
        }
    }

    const handleSearchConversations = async (query) => {
        if (!query.trim()) {
            loadChatHistory()
            return
        }

        try {
            const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setChatHistory(data.conversations || [])
            }
        } catch (error) {
            console.error('Error searching conversations:', error)
        }
    }

    const deleteConversation = async (conversationId, e) => {
        e.stopPropagation()
        
        if (!confirm('Are you sure you want to delete this conversation?')) return

        try {
            const response = await fetch(`${API_BASE_URL}/conversation/${conversationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            })

            if (response.ok) {
                setChatHistory(prev => prev.filter(chat => chat._id !== conversationId))
                if (currentConversationId === conversationId) {
                    handleNewChat()
                }
            }
        } catch (error) {
            console.error('Error deleting conversation:', error)
        }
    }

    const triggerCommandHighlight = (command) => {
        setHighlightedCommands(prev => new Set([...prev, command]))
        setTimeout(() => {
            setHighlightedCommands(prev => {
                const newSet = new Set(prev)
                newSet.delete(command)
                return newSet
            })
        }, 1000)
    }

    const handleInputChange = (e) => {
        const value = e.target.value
        const curPos = e.target.selectionStart
        const prevInput = input
        setInput(value)
        setCursorPosition(curPos)

        const prevParts = prevInput.split(/(@[\w-]*)/g).filter(p => p.startsWith('@'))
        const currentParts = value.split(/(@[\w-]*)/g).filter(p => p.startsWith('@'))

        currentParts.forEach(part => {
            if (commands.includes(part) && !prevParts.includes(part)) {
                triggerCommandHighlight(part)
            }
        })

        const textBeforeCursor = value.slice(0, curPos)
        const lastAtIndex = textBeforeCursor.lastIndexOf('@')

        if (lastAtIndex !== -1) {
            const textAfterAt = textBeforeCursor.slice(lastAtIndex)
            const hasSpace = textAfterAt.includes(' ')

            if (!hasSpace) {
                const searchTerm = textAfterAt.slice(1).toLowerCase()
                const matches = commands.filter(cmd =>
                    cmd.toLowerCase().includes(searchTerm)
                )

                if (matches.length > 0) {
                    setShowDropdown(true)
                    setDropdownSearch(textAfterAt.slice(1))
                    setSelectedCommandIndex(0)
                } else {
                    setShowDropdown(false)
                }
            } else {
                setShowDropdown(false)
            }
        } else {
            setShowDropdown(false)
        }
    }

    const handleCommandSelect = (command) => {
        const textBeforeCursor = input.slice(0, cursorPosition)
        const textAfterCursor = input.slice(cursorPosition)
        const lastAtIndex = textBeforeCursor.lastIndexOf('@')

        const newValue = input.slice(0, lastAtIndex) + command + ' ' + textAfterCursor
        setInput(newValue)
        setShowDropdown(false)
        setDropdownSearch('')
        setSelectedCommandIndex(0)
        inputRef.current?.focus()
        triggerCommandHighlight(command)
    }

    const handleKeyDown = (e) => {
        if (showDropdown && filteredCommands.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedCommandIndex(prev =>
                    prev < filteredCommands.length - 1 ? prev + 1 : prev
                )
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedCommandIndex(prev => prev > 0 ? prev - 1 : prev)
            } else if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleCommandSelect(filteredCommands[selectedCommandIndex])
                return
            }
        }

        if (e.key === 'Enter' && !e.shiftKey && !showDropdown) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setIsUploading(true)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch(`${API_BASE_URL}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: formData
            })

            if (response.ok) {
                const data = await response.json()
                setAttachments(prev => [...prev, data.file])
            } else {
                alert('Failed to upload file')
            }
        } catch (error) {
            console.error('Error uploading file:', error)
            alert('Error uploading file')
        } finally {
            setIsUploading(false)
            e.target.value = ''
        }
    }

    const handlePaste = async (e) => {
        const items = e.clipboardData?.items
        if (!items) return

        for (let item of items) {
            if (item.type.startsWith('image/')) {
                e.preventDefault()
                const file = item.getAsFile()
                if (file) {
                    setIsUploading(true)

                    try {
                        const formData = new FormData()
                        formData.append('file', file)

                        const response = await fetch(`${API_BASE_URL}/upload`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${getAuthToken()}`
                            },
                            body: formData
                        })

                        if (response.ok) {
                            const data = await response.json()
                            setAttachments(prev => [...prev, data.file])
                        }
                    } catch (error) {
                        console.error('Error uploading pasted image:', error)
                    } finally {
                        setIsUploading(false)
                    }
                }
            }
        }
    }

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index))
    }

    const sendMessageToAPI = async (message, attachmentData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({
                    message: message,
                    conversationId: currentConversationId,
                    attachments: attachmentData
                })
            })

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`)
            }

            const data = await response.json()
            return data
        } catch (error) {
            console.error('Error sending message:', error)
            throw error
        }
    }

    const handleSend = async () => {
        if (!input.trim() && attachments.length === 0) return

        const userMessage = {
            id: messages.length + 1,
            type: 'user',
            content: input,
            timestamp: new Date(),
            attachments: [...attachments]
        }

        setMessages(prev => [...prev, userMessage])
        const currentInput = input
        const currentAttachments = [...attachments]
        setInput('')
        setAttachments([])
        setHighlightedCommands(new Set())
        setIsTyping(true)

        try {
            const response = await sendMessageToAPI(currentInput, currentAttachments)

            const aiMessage = {
                id: messages.length + 2,
                type: 'ai',
                content: response.message,
                timestamp: new Date(),
                command: response.command,
                actionResult: response.actionResult
            }

            setMessages(prev => [...prev, aiMessage])
            
            if (response.conversationId && !currentConversationId) {
                setCurrentConversationId(response.conversationId)
                loadChatHistory()
            }
        } catch (error) {
            const errorMessage = {
                id: messages.length + 2,
                type: 'ai',
                content: 'Sorry, I encountered an error processing your request. Please make sure you\'re logged in and try again.',
                timestamp: new Date(),
                actionResult: {
                    status: 'error',
                    message: error.message
                }
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsTyping(false)
        }
    }

    const handleNewChat = () => {
        setMessages([
            {
                id: 1,
                type: 'ai',
                content: 'Good Morning! 👋',
                subtitle: 'I\'m Lumen, your QA testing assistant. How can I help you today?',
                timestamp: new Date()
            }
        ])
        setCurrentConversationId(null)
        setAttachments([])
    }

    const toggleRecording = () => {
        setIsRecording(!isRecording)
    }

    const renderInputContent = () => {
        const parts = input.split(/(@[\w-]*)/g)
        return parts.map((part, index) => {
            if (part.startsWith('@') && part.length > 1) {
                const isValidCommand = commands.includes(part)
                const shouldHighlight = highlightedCommands.has(part)

                if (isValidCommand && shouldHighlight) {
                    return (
                        <motion.span
                            key={`${part}-${index}-highlighted`}
                            animate={{
                                color: ['rgb(67 56 202)', 'rgb(124 58 237)', 'rgb(67 56 202)']
                            }}
                            transition={{ duration: 1, ease: 'easeInOut' }}
                            className="font-bold text-indigo-700"
                        >
                            {part}
                        </motion.span>
                    )
                } else if (isValidCommand) {
                    return (
                        <span key={`${part}-${index}`} className="font-bold text-indigo-700">
                            {part}
                        </span>
                    )
                } else {
                    return <span key={index} className="text-gray-800">{part}</span>
                }
            }
            return <span key={index}>{part}</span>
        })
    }

    return (
        <div className="flex h-screen bg-white">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 space-y-3">
                    <button 
                        onClick={handleNewChat}
                        className="w-full flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                    >
                        <Plus className="w-4 h-4" />
                        New Chat
                    </button>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={sidebarSearch}
                            onChange={(e) => {
                                setSidebarSearch(e.target.value)
                                handleSearchConversations(e.target.value)
                            }}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="flex-1 p-3 overflow-y-auto">
                    {chatHistory.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-sm text-gray-400">No chat history yet</p>
                            <p className="text-xs text-gray-300 mt-1">Start a conversation to see it here</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredChatHistory.map((chat) => (
                                <div
                                    key={chat._id}
                                    onClick={() => loadConversation(chat._id)}
                                    className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                                        currentConversationId === chat._id
                                            ? 'bg-blue-50 border border-blue-200'
                                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <MessageSquare className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                {chat.title}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(chat.lastMessageAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => deleteConversation(chat._id, e)}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <AnimatePresence>
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={`mb-6 ${message.type === 'user' ? 'flex justify-end' : ''}`}
                            >
                                {message.type === 'ai' ? (
                                    <div className="max-w-3xl">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                                AI
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-gray-800 text-base leading-relaxed">
                                                    {renderMessageContent(message.content)}
                                                </div>
                                                {message.subtitle && (
                                                    <p className="text-gray-500 text-sm mt-2">{message.subtitle}</p>
                                                )}
                                                {message.actionResult && (
                                                    <ActionResult result={message.actionResult} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="max-w-xl">
                                        <div className="bg-gray-100 rounded-2xl px-4 py-3">
                                            <div className="text-gray-800 text-base">
                                                {renderMessageContent(message.content)}
                                            </div>
                                            {message.attachments && message.attachments.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {message.attachments.map((att, idx) => (
                                                        <AttachmentPreview key={idx} attachment={att} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-start gap-3 mb-6"
                        >
                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold text-sm">
                                AI
                            </div>
                            <div className="flex items-center gap-2">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                    className="w-2 h-2 bg-gray-400 rounded-full"
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                    className="w-2 h-2 bg-gray-400 rounded-full"
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                    className="w-2 h-2 bg-gray-400 rounded-full"
                                />
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-200 px-6 py-4">
                    <div className="max-w-3xl mx-auto relative" ref={dropdownRef}>
                        {/* Dropdown */}
                        {showDropdown && filteredCommands.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden z-50"
                            >
                                <div className="p-2 border-b border-gray-200">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search commands..."
                                            value={dropdownSearch}
                                            onChange={(e) => setDropdownSearch(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {filteredCommands.map((command, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleCommandSelect(command)}
                                            className={`w-full text-left px-4 py-2.5 transition-colors text-sm font-mono ${
                                                index === selectedCommandIndex
                                                    ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            {command}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Attachment Preview Area */}
                        {attachments.length > 0 && (
                            <div className="mb-3 flex flex-wrap gap-2">
                                {attachments.map((att, idx) => (
                                    <AttachmentPreview 
                                        key={idx} 
                                        attachment={att} 
                                        onRemove={() => removeAttachment(idx)}
                                    />
                                ))}
                            </div>
                        )}

                        <div className="bg-white rounded-xl border border-gray-300 focus-within:border-gray-400 transition-all shadow-sm">
                            <div className="flex items-end gap-2 px-4 py-3">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all flex-shrink-0 disabled:opacity-50"
                                >
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <div className="flex-1 relative min-h-[24px] max-h-[600px]">
                                    <textarea
                                        ref={inputRef}
                                        value={input}
                                        onChange={handleInputChange}
                                        onKeyDown={handleKeyDown}
                                        onPaste={handlePaste}
                                        placeholder="Message Lumen..."
                                        rows="1"
                                        className="w-full bg-transparent border-none outline-none text-base text-gray-800 caret-gray-800 placeholder:text-gray-400 resize-none overflow-y-auto px-0 py-0 relative z-20"
                                        style={{ minHeight: '24px', maxHeight: '300px', lineHeight: '24px' }}
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={toggleRecording}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                                        isRecording
                                            ? 'bg-red-500 hover:bg-red-600 text-white'
                                            : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                                    }`}
                                >
                                    {isRecording ? (
                                        <StopCircle className="w-4 h-4" />
                                    ) : (
                                        <Mic className="w-4 h-4" />
                                    )}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSend}
                                    disabled={!input.trim() && attachments.length === 0}
                                    className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center text-gray-600 transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4" />
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}