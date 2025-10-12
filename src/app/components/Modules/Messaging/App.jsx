"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Search,
  Pin,
  Edit2,
  Trash2,
  Smile,
  Paperclip,
  X,
  Reply,
  MoreVertical,
  TrendingUp,
  Users,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Check,
  CheckCheck,
  AlertCircle,
  Wifi,
  WifiOff,
  Image as ImageIcon,
  Download,
} from "lucide-react";
import { io } from 'socket.io-client';

class SocketClient {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(url = 'http://localhost:5000') {
    const token = this.getToken();
    
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    this.socket = io(url, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.setupDefaultListeners();
    return this.socket;
  }

  setupDefaultListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
    });
  }

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  joinOrganization(organizationId) {
    if (this.socket?.connected) {
      this.socket.emit('join_organization', organizationId);
      console.log('📥 Joined organization:', organizationId);
    }
  }

  leaveOrganization(organizationId) {
    if (this.socket?.connected) {
      this.socket.emit('leave_organization', organizationId);
      console.log('📤 Left organization:', organizationId);
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new_message', callback);
      this.listeners.set('new_message', callback);
    }
  }

  onMessageEdited(callback) {
    if (this.socket) {
      this.socket.on('message_edited', callback);
      this.listeners.set('message_edited', callback);
    }
  }

  onMessageDeleted(callback) {
    if (this.socket) {
      this.socket.on('message_deleted', callback);
      this.listeners.set('message_deleted', callback);
    }
  }

  onMessageReaction(callback) {
    if (this.socket) {
      this.socket.on('message_reaction', callback);
      this.listeners.set('message_reaction', callback);
    }
  }

  onMessagePinned(callback) {
    if (this.socket) {
      this.socket.on('message_pinned', callback);
      this.listeners.set('message_pinned', callback);
    }
  }

  onMessageRead(callback) {
    if (this.socket) {
      this.socket.on('message_read', callback);
      this.listeners.set('message_read', callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
      this.listeners.set('user_typing', callback);
    }
  }

  emitTyping(isTyping) {
    if (this.socket?.connected) {
      this.socket.emit('typing', isTyping);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.listeners.forEach((callback, eventName) => {
        this.socket.off(eventName, callback);
      });
      this.listeners.clear();
    }
  }

  disconnect() {
    if (this.socket) {
      this.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 Socket disconnected');
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  getSocket() {
    return this.socket;
  }
}

const socketClient = new SocketClient();

const API_BASE_URL = "http://localhost:5000/api/v1/message";
const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/upload";
const CLOUDINARY_UPLOAD_PRESET = "YOUR_UPLOAD_PRESET";

const getCurrentUser = () => {
  if (typeof window !== "undefined") {
    return {
      id: localStorage.getItem("userId"),
      name: localStorage.getItem("userName"),
      token: localStorage.getItem("token"),
      organizationId: localStorage.getItem("organizationId"),
    };
  }
  return { id: null, name: null, token: null, organizationId: null };
};

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getCurrentUser().token}`,
});

const Messaging = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showRepliesModal, setShowRepliesModal] = useState(null);
  const [replies, setReplies] = useState({});
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const currentUser = getCurrentUser();

  const emojis = ["👍", "❤️", "😊", "🎉", "🔥", "👏", "😮", "😢", "✨", "💯"];

  useEffect(() => {
    const organizationId = currentUser.organizationId;
    
    if (!organizationId) {
      setError("Organization ID not found. Please log in again.");
      return;
    }

    socketClient.connect();
    setIsSocketConnected(socketClient.isConnected());
    socketClient.joinOrganization(organizationId);
    setupSocketListeners();

    return () => {
      socketClient.leaveOrganization(organizationId);
      socketClient.removeAllListeners();
      socketClient.disconnect();
    };
  }, []);

  const setupSocketListeners = () => {
    socketClient.onNewMessage((message) => {
      console.log("📨 New message received:", message);
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) {
          return prev;
        }
        return [...prev, message];
      });
      setTimeout(() => scrollToBottom(), 100);
      showNotification("New message received", "success");
    });

    socketClient.onMessageEdited((updatedMessage) => {
      console.log("✏️ Message edited:", updatedMessage);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === updatedMessage._id ? { ...m, ...updatedMessage } : m
        )
      );
      showNotification("Message updated", "success");
    });

    socketClient.onMessageDeleted((data) => {
      console.log("🗑️ Message deleted:", data);
      setMessages((prev) => prev.filter((m) => m._id !== data.messageId));
      showNotification("Message deleted", "success");
    });

    socketClient.onMessageReaction((data) => {
      console.log("😊 Reaction added:", data);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === data.messageId ? { ...m, reactions: data.reactions } : m
        )
      );
    });

    socketClient.onMessagePinned((data) => {
      console.log("📌 Message pinned:", data);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === data.messageId ? { ...m, isPinned: data.isPinned } : m
        )
      );
      showNotification(
        data.isPinned ? "Message pinned" : "Message unpinned",
        "success"
      );
    });

    socketClient.onMessageRead((data) => {
      console.log("✅ Message read:", data);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === data.messageId ? { ...m, readBy: data.readBy } : m
        )
      );
    });

    socketClient.onUserTyping((data) => {
      console.log("⌨️ User typing:", data);
      if (data.isTyping) {
        setTypingUsers((prev) => {
          if (!prev.includes(data.userName)) {
            return [...prev, data.userName];
          }
          return prev;
        });
      } else {
        setTypingUsers((prev) => prev.filter((name) => name !== data.userName));
      }
    });

    const socket = socketClient.getSocket();
    if (socket) {
      socket.on("connect", () => {
        setIsSocketConnected(true);
      });

      socket.on("disconnect", () => {
        setIsSocketConnected(false);
      });
    }
  };

  const showNotification = (message, type = "success") => {
    if (type === "success") {
      setSuccess(message);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleTyping = (isTyping) => {
    socketClient.emitTyping(isTyping);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        socketClient.emitTyping(false);
      }, 3000);
    }
  };

  const fetchMessages = async (page = 1, search = "") => {
    try {
      setLoading(true);
      setError(null);
      const url = search
        ? `${API_BASE_URL}?page=${page}&limit=50&search=${search}`
        : `${API_BASE_URL}?page=${page}&limit=50`;

      const response = await fetch(url, {
        headers: getHeaders(),
      });
      const data = await response.json();

      if (response.ok) {
        setMessages(data.messages);
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
        setTimeout(() => scrollToBottom(), 100);
      } else {
        setError(data.message || "Failed to fetch messages");
      }
    } catch (error) {
      setError("Error connecting to server");
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`, {
        headers: getHeaders(),
      });
      const data = await response.json();
      if (response.ok) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchReplies = async (messageId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${messageId}/replies`, {
        headers: getHeaders(),
      });
      const data = await response.json();
      if (response.ok) {
        setReplies((prev) => ({ ...prev, [messageId]: data.replies }));
        setShowRepliesModal(messageId);
      }
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    setUploadingImage(true);
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      setSelectedImage(imageUrl);
      showNotification("Image uploaded successfully", "success");
    } catch (error) {
      setError("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedImage && !editingMessage) return;

    try {
      if (editingMessage) {
        const response = await fetch(`${API_BASE_URL}/${editingMessage._id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({ content: newMessage }),
        });

        if (response.ok) {
          setEditingMessage(null);
          setNewMessage("");
          await fetchMessages(currentPage, searchQuery);
        } else {
          const data = await response.json();
          setError(data.message || "Failed to update message");
        }
      } else {
        const messageData = {
          content: newMessage,
          messageType: selectedImage ? "image" : "text",
          parentMessageId: replyingTo?._id || null,
        };

        if (selectedImage) {
          messageData.attachments = [
            {
              url: selectedImage,
              type: "image",
              name: "image.jpg",
            },
          ];
        }

        const response = await fetch(API_BASE_URL, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(messageData),
        });

        if (response.ok) {
          setNewMessage("");
          setReplyingTo(null);
          setSelectedImage(null);
          handleTyping(false);
          await fetchMessages(currentPage, searchQuery);
          setTimeout(() => scrollToBottom(), 100);
        } else {
          const data = await response.json();
          setError(data.message || "Failed to send message");
        }
      }
    } catch (error) {
      setError("Error connecting to server");
      console.error("Error sending message:", error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${messageId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (response.ok) {
        await fetchMessages(currentPage, searchQuery);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to delete message");
      }
    } catch (error) {
      setError("Error connecting to server");
      console.error("Error deleting message:", error);
    }
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${messageId}/reaction`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ emoji }),
      });

      if (response.ok) {
        await fetchMessages(currentPage, searchQuery);
      }
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
    setShowEmojiPicker(null);
  };

  const handleTogglePin = async (messageId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${messageId}/pin`, {
        method: "PATCH",
        headers: getHeaders(),
      });

      if (response.ok) {
        await fetchMessages(currentPage, searchQuery);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to pin message");
      }
    } catch (error) {
      setError("Error connecting to server");
      console.error("Error toggling pin:", error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchMessages(1, searchQuery);
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startEdit = (message) => {
    setEditingMessage(message);
    setNewMessage(message.content);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setNewMessage("");
  };

  const isMyMessage = (message) => {
    return String(message.senderId) === String(currentUser.id);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Stats Sidebar */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="fixed left-0 top-0 h-full w-72 bg-white shadow-2xl z-50 overflow-y-auto border-r"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-semibold text-slate-800">Statistics</h2>
                <button
                  onClick={() => setShowStats(false)}
                  className="p-1 hover:bg-slate-100 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>

              {stats && (
                <div className="space-y-2">
                  <StatCard
                    icon={<MessageSquare size={14} />}
                    label="Total Messages"
                    value={stats.totalMessages}
                    color="blue"
                  />
                  <StatCard
                    icon={<Reply size={14} />}
                    label="Total Replies"
                    value={stats.totalReplies}
                    color="green"
                  />
                  <StatCard
                    icon={<Pin size={14} />}
                    label="Pinned"
                    value={stats.pinnedMessages}
                    color="yellow"
                  />
                  <StatCard
                    icon={<TrendingUp size={14} />}
                    label="Today"
                    value={stats.todayMessages}
                    color="purple"
                  />

                  <div className="mt-4">
                    <h3 className="text-xs font-semibold mb-2 flex items-center gap-1.5 text-slate-800">
                      <Users size={14} />
                      Top Contributors
                    </h3>
                    <div className="space-y-1.5">
                      {stats.topContributors?.map((contributor, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                              {contributor.senderName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-[10px] font-medium text-slate-800">
                                {contributor.senderName}
                              </p>
                              <p className="text-[9px] text-slate-500">
                                {contributor.senderRole}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-blue-600">
                            {contributor.messageCount}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Replies Modal */}
      <AnimatePresence>
        {showRepliesModal && replies[showRepliesModal] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowRepliesModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <MessageSquare size={16} />
                  Replies ({replies[showRepliesModal]?.length})
                </h3>
                <button
                  onClick={() => setShowRepliesModal(null)}
                  className="p-1 hover:bg-slate-100 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(80vh-120px)] p-4 space-y-3">
                {replies[showRepliesModal]?.map((reply, idx) => (
                  <motion.div
                    key={reply._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`rounded-lg p-3 ${
                      String(reply.senderId) === String(currentUser.id)
                        ? "bg-[#dcf8c6] ml-auto"
                        : "bg-slate-100 mr-auto"
                    } max-w-[85%]`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                        {reply.senderName?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-[11px] text-slate-800">
                        {reply.senderName}
                      </span>
                      <span className="text-[9px] text-slate-500 ml-auto">
                        {new Date(reply.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-700 leading-relaxed">
                      {reply.content}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Messages Area */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-white">
          {/* Notifications at top */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
              >
                <AlertCircle className="text-red-600" size={14} />
                <p className="text-[11px] text-red-800">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-600"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-2 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2"
              >
                <Check className="text-green-600" size={14} />
                <p className="text-[11px] text-green-800">{success}</p>
                <button
                  onClick={() => setSuccess(null)}
                  className="ml-auto text-green-600"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="flex flex-col justify-center items-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
              <p className="mt-2 text-[11px] text-slate-600">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full text-slate-500">
              <MessageSquare size={40} className="mb-2 opacity-50" />
              <p className="text-xs font-medium">No messages yet</p>
              <p className="text-[10px]">Start a conversation!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((message, index) => (
                <MessageBubble
                  key={message._id}
                  message={message}
                  index={index}
                  isMyMessage={isMyMessage(message)}
                  onReply={() => setReplyingTo(message)}
                  onEdit={() => startEdit(message)}
                  onDelete={() => handleDeleteMessage(message._id)}
                  onReaction={(emoji) => handleReaction(message._id, emoji)}
                  onPin={() => handleTogglePin(message._id)}
                  onToggleReplies={() => fetchReplies(message._id)}
                  showEmojiPicker={showEmojiPicker === message._id}
                  setShowEmojiPicker={setShowEmojiPicker}
                  emojis={emojis}
                />
              ))}
              
              {typingUsers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-slate-500 text-[10px] px-3"
                >
                  <div className="flex gap-1">
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                    />
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                    />
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                    />
                  </div>
                  <span>
                    {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                  </span>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center gap-2 py-2 bg-white border-t"
          >
            <button
              onClick={() => fetchMessages(currentPage - 1, searchQuery)}
              disabled={currentPage === 1}
              className="px-2.5 py-1 text-[11px] bg-slate-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 font-medium"
            >
              Previous
            </button>
            <span className="px-2 py-1 text-[10px] font-medium text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => fetchMessages(currentPage + 1, searchQuery)}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 text-[11px] bg-slate-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 font-medium"
            >
              Next
            </button>
          </motion.div>
        )}

        {/* Input Area */}
        <div className="bg-white border-t px-4 py-3">
          <AnimatePresence>
            {replyingTo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between mb-2 p-2 bg-green-50 rounded-lg border-l-4 border-green-500"
              >
                <div className="flex items-center gap-2">
                  <Reply size={12} className="text-green-600" />
                  <div>
                    <span className="text-[10px] font-semibold text-slate-700">
                      Replying to {replyingTo.senderName}
                    </span>
                    <p className="text-[10px] text-slate-500 truncate max-w-xs">
                      {replyingTo.content}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X size={12} />
                </button>
              </motion.div>
            )}

            {editingMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between mb-2 p-2 bg-amber-50 rounded-lg border-l-4 border-amber-500"
              >
                <div className="flex items-center gap-2">
                  <Edit2 size={12} className="text-amber-600" />
                  <span className="text-[10px] font-semibold text-slate-700">
                    Editing message
                  </span>
                </div>
                <button
                  onClick={cancelEdit}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X size={12} />
                </button>
              </motion.div>
            )}

            {selectedImage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between mb-2 p-2 bg-blue-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="w-12 h-12 object-cover rounded"
                  />
                  <span className="text-[10px] text-slate-700">Image ready to send</span>
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X size={12} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2 bg-slate-50 rounded-full px-3 py-2">
            <button
              onClick={() => setShowEmojiPicker(showEmojiPicker ? null : "input")}
              className="p-1 hover:bg-slate-100 rounded-full"
            >
              <Smile size={18} className="text-slate-600" />
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="p-1 hover:bg-slate-100 rounded-full"
            >
              {uploadingImage ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600"></div>
              ) : (
                <Paperclip size={18} className="text-slate-600" />
              )}
            </button>
            
            <input
              type="text"
              placeholder="Type a message"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping(e.target.value.length > 0);
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 px-3 py-1.5 text-[13px] bg-transparent focus:outline-none"
            />
            
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() && !selectedImage}
              className="p-2 bg-green-500 hover:bg-green-600 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} className="text-white" />
            </button>
          </div>

          {/* Emoji Picker for Input */}
          <AnimatePresence>
            {showEmojiPicker === "input" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="absolute bottom-full left-4 mb-2 p-3 bg-white rounded-lg shadow-xl flex gap-1.5 z-10 border border-slate-200"
              >
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setNewMessage((prev) => prev + emoji);
                      setShowEmojiPicker(null);
                    }}
                    className="text-lg hover:bg-slate-100 rounded p-1.5 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// WhatsApp-Style Message Bubble Component
const MessageBubble = ({
  message,
  index,
  isMyMessage,
  onReply,
  onEdit,
  onDelete,
  onReaction,
  onPin,
  onToggleReplies,
  showEmojiPicker,
  setShowEmojiPicker,
  emojis,
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: isMyMessage ? 100 : -100 }}
      transition={{ delay: index * 0.02 }}
      className={`flex ${isMyMessage ? "justify-end" : "justify-start"} mb-1`}
    >
      <div
        className={`relative max-w-[65%] group`}
      >
        {message.isPinned && (
          <div className={`flex items-center gap-1 mb-1 px-2 ${isMyMessage ? "justify-end" : "justify-start"}`}>
            <Pin size={10} className="text-yellow-600" />
            <span className="text-[9px] text-yellow-700 font-medium">Pinned</span>
          </div>
        )}

        <div
          className={`rounded-lg px-3 py-2 shadow-sm ${
            isMyMessage
              ? "bg-[#dcf8c6] rounded-tr-none"
              : "bg-white rounded-tl-none border border-slate-200"
          }`}
        >
          {/* Sender Name (for received messages) */}
          {!isMyMessage && (
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[11px] font-semibold text-green-700">
                {message.senderName}
              </span>
              <span className="text-[8px] px-1.5 py-0.5 bg-green-100 rounded-full text-green-700">
                {message.senderRole}
              </span>
            </div>
          )}

          {/* Reply Reference */}
          {message.parentMessageId && (
            <div className="mb-1.5 p-1.5 bg-white/50 border-l-2 border-green-600 rounded">
              <p className="text-[9px] text-slate-600 font-medium">↩ Reply to message</p>
            </div>
          )}

          {/* Image Attachment */}
          {message.messageType === "image" && message.attachments?.[0]?.url && (
            <div className="mb-1.5">
              <img
                src={message.attachments[0].url}
                alt="Attachment"
                className="max-w-full rounded-lg max-h-64 object-cover"
              />
            </div>
          )}

          {/* Message Content */}
          {message.content && (
            <p className="text-[13px] text-slate-800 leading-relaxed break-words">
              {message.content}
            </p>
          )}

          {/* Message Footer */}
          <div className="flex items-center justify-end gap-1 mt-1">
            {message.isEdited && (
              <span className="text-[9px] text-slate-500 italic">edited</span>
            )}
            <span className="text-[9px] text-slate-500">
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {isMyMessage && (
              <span className="text-blue-600">
                {message.readBy?.length > 1 ? (
                  <CheckCheck size={12} />
                ) : (
                  <Check size={12} />
                )}
              </span>
            )}
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {Object.entries(
                message.reactions.reduce((acc, r) => {
                  acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                  return acc;
                }, {})
              ).map(([emoji, count]) => (
                <button
                  key={emoji}
                  onClick={() => onReaction(emoji)}
                  className="px-1.5 py-0.5 bg-white/80 hover:bg-white rounded-full text-[10px] shadow-sm border border-slate-200"
                >
                  {emoji} {count}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hover Actions */}
        <div
          className={`absolute top-0 ${
            isMyMessage ? "left-0 -translate-x-full" : "right-0 translate-x-full"
          } opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2`}
        >
          <button
            onClick={() => setShowEmojiPicker(showEmojiPicker ? null : message._id)}
            className="p-1 hover:bg-slate-200 rounded-full bg-white shadow-md"
          >
            <Smile size={12} className="text-slate-600" />
          </button>
          
          <button
            onClick={onReply}
            className="p-1 hover:bg-slate-200 rounded-full bg-white shadow-md"
          >
            <Reply size={12} className="text-slate-600" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 hover:bg-slate-200 rounded-full bg-white shadow-md"
            >
              <MoreVertical size={12} className="text-slate-600" />
            </button>

            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className={`absolute ${
                    isMyMessage ? "right-0" : "left-0"
                  } mt-1 w-32 bg-white rounded-lg shadow-xl py-1 z-20 border border-slate-200`}
                >
                  {isMyMessage && (
                    <button
                      onClick={() => {
                        onEdit();
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-1.5 text-left hover:bg-slate-100 flex items-center gap-2 text-slate-700 text-[11px]"
                    >
                      <Edit2 size={12} />
                      <span>Edit</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onPin();
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-1.5 text-left hover:bg-slate-100 flex items-center gap-2 text-slate-700 text-[11px]"
                  >
                    <Pin size={12} />
                    <span>{message.isPinned ? "Unpin" : "Pin"}</span>
                  </button>
                  <div className="border-t border-slate-200 my-0.5"></div>
                  <button
                    onClick={() => {
                      onDelete();
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-1.5 text-left hover:bg-red-50 flex items-center gap-2 text-red-600 text-[11px]"
                  >
                    <Trash2 size={12} />
                    <span>Delete</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Emoji Picker */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className={`absolute ${
                isMyMessage ? "right-0" : "left-0"
              } bottom-full mb-2 p-2 bg-white rounded-lg shadow-xl flex gap-1 z-10 border border-slate-200`}
            >
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onReaction(emoji)}
                  className="text-base hover:bg-slate-100 rounded p-1 transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Replies Button */}
        {message.replyCount > 0 && (
          <button
            onClick={onToggleReplies}
            className={`flex items-center gap-1 mt-1 text-[10px] text-blue-600 hover:text-blue-800 font-medium ${
              isMyMessage ? "justify-end" : "justify-start"
            }`}
          >
            <MessageSquare size={10} />
            <span>
              View {message.replyCount} {message.replyCount === 1 ? "reply" : "replies"}
            </span>
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    yellow: "from-yellow-500 to-yellow-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br ${colors[color]} rounded-lg p-2.5 text-white shadow-md`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="p-1 bg-white bg-opacity-20 rounded">{icon}</div>
        <span className="text-xl font-bold">{value}</span>
      </div>
      <p className="text-[10px] opacity-90 font-medium">{label}</p>
    </motion.div>
  );
};

export default Messaging;