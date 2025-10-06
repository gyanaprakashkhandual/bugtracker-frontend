'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Search, Plus, Paperclip, Mic, StopCircle } from 'lucide-react'

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

export default function LumenChat() {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            content: 'Good Morning, Julie!',
            subtitle: 'Your money story today starts with Lumen — clear, simple, and made for you.',
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
    const inputRef = useRef(null)
    const messagesEndRef = useRef(null)
    const dropdownRef = useRef(null)
    const fileInputRef = useRef(null)

    const filteredCommands = commands.filter(cmd =>
        cmd.toLowerCase().includes(dropdownSearch.toLowerCase())
    )

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

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

    useEffect(() => {
        // Apply styling to textarea content
        if (inputRef.current) {
            const parts = input.split(/(@[\w-]+)/g)
            let hasValidCommand = false
            parts.forEach(part => {
                if (commands.includes(part)) {
                    hasValidCommand = true
                }
            })

            if (hasValidCommand) {
                inputRef.current.style.fontWeight = '400'
            }
        }
    }, [input])

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

        // Check if a valid command was just completed
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

        // Trigger highlight after command selection
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

    const handleSend = () => {
        if (!input.trim()) return

        const userMessage = {
            id: messages.length + 1,
            type: 'user',
            content: input,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setHighlightedCommands(new Set())
        setIsTyping(true)

        setTimeout(() => {
            const aiMessage = {
                id: messages.length + 2,
                type: 'ai',
                content: 'I can help you with that! I can analyze your spending patterns, create budgets, and provide financial insights tailored to your goals.',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, aiMessage])
            setIsTyping(false)
        }, 1500)
    }

    const handleFileUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            console.log('File uploaded:', file.name)
        }
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
                    // Partial match or incomplete command - show as plain text
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
                    <button className="w-full flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                        <Plus className="w-4 h-4" />
                        New Chat
                    </button>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={sidebarSearch}
                            onChange={(e) => setSidebarSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="flex-1 p-3 overflow-y-auto">
                    <div className="text-center py-12">
                        <p className="text-sm text-gray-400">No chat history yet</p>
                        <p className="text-xs text-gray-300 mt-1">Start a conversation to see it here</p>
                    </div>
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
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-xl">
                                        <div className="text-gray-800 text-base">
                                            {renderMessageContent(message.content)}
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
                                            className={`w-full text-left px-4 py-2.5 transition-colors text-sm font-mono ${index === selectedCommandIndex
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
                                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all flex-shrink-0"
                                >
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <div className="flex-1 relative min-h-[24px] max-h-[600px]">
                                    <textarea
                                        ref={inputRef}
                                        value={input}
                                        onChange={handleInputChange}
                                        onKeyDown={handleKeyDown}
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
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${isRecording
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
                                    disabled={!input.trim()}
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