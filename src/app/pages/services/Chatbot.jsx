'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, Plus, Image, Paperclip, Calendar, RefreshCw, MessageSquare, Search } from 'lucide-react'

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
    const [searchQuery, setSearchQuery] = useState('')
    const [chatHistory, setChatHistory] = useState([
        { id: 1, title: 'Budget Planning for March', date: 'Today', active: true },
        { id: 2, title: 'Investment Strategy Discussion', date: 'Yesterday' },
        { id: 3, title: 'Monthly Spending Analysis', date: '2 days ago' },
        { id: 4, title: 'Savings Goals Review', date: '1 week ago' },
        { id: 5, title: 'Tax Preparation Tips', date: '2 weeks ago' },
        { id: 6, title: 'Emergency Fund Setup', date: '3 weeks ago' },
    ])
    const messagesEndRef = useRef(null)

    const filteredChatHistory = chatHistory.filter(chat =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

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

    const suggestions = [
        { icon: Calendar, title: 'Smart Budget', desc: 'Create a budget that adapts to your lifestyle and goals.' },
        { icon: Sparkles, title: 'Calculation', desc: 'Easily crunch the numbers for clearer money choices.' },
        { icon: RefreshCw, title: 'Spending', desc: 'See your spending habits and spot useful patterns.' }
    ]

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <h2 className="font-semibold text-slate-800 text-sm mb-3">Chat History</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        />
                    </div>
                </div>

                <nav className="flex-1 p-3 overflow-y-auto">
                    {filteredChatHistory.length > 0 ? (
                        filteredChatHistory.map((chat) => (
                            <button
                                key={chat.id}
                                className={`w-full text-left px-3 py-3 rounded-lg mb-2 transition-colors group ${chat.active
                                        ? 'bg-slate-100 text-slate-800'
                                        : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex items-start gap-2">
                                    <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">{chat.title}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{chat.date}</p>
                                    </div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-xs text-slate-400">No conversations found</p>
                        </div>
                    )}
                </nav>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2 text-slate-400 text-xs"
                        >
                            <div className="flex gap-1">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                    className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                    className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                    className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                                />
                            </div>
                            AI is typing...
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="bg-white border-t border-slate-200 px-6 py-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            <div className="flex items-center gap-3 px-4 py-3">
                                <button className="text-slate-400 hover:text-blue-500 transition-colors">
                                    <Plus className="w-5 h-5" />
                                </button>
                                <button className="text-slate-400 hover:text-blue-500 transition-colors">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <button className="text-slate-400 hover:text-blue-500 transition-colors">
                                    <Image className="w-5 h-5" />
                                </button>
                                <button className="text-slate-400 hover:text-blue-500 transition-colors">
                                    <Calendar className="w-5 h-5" />
                                </button>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask Lumen AI Assistant..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSend}
                                    disabled={!input.trim()}
                                    className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4" />
                                </motion.button>
                            </div>
                        </div>
                        <p className="text-center text-[10px] text-slate-400 mt-3">
                            Great for deep research and calculation
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}