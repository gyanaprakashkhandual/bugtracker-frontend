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
} from "lucide-react";
import socketClient from "@/app/client/socket.client";

const API_BASE_URL = "http://localhost:5000/api/v1/message";

// Utility function to get token
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Utility function to get organization ID
const getOrganizationId = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("organizationId");
  }
  return null;
};

// API Headers
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
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
  const [showReplies, setShowReplies] = useState({});
  const [replies, setReplies] = useState({});
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const emojis = ["👍", "❤️", "😊", "🎉", "🔥", "👏", "😮", "😢", "✨", "💯"];

  // Initialize socket connection
  useEffect(() => {
    const organizationId = getOrganizationId();
    
    if (!organizationId) {
      setError("Organization ID not found. Please log in again.");
      return;
    }

    // Connect to socket
    socketClient.connect();
    setIsSocketConnected(socketClient.isConnected());

    // Join organization room
    socketClient.joinOrganization(organizationId);

    // Setup socket listeners
    setupSocketListeners();

    // Cleanup on unmount
    return () => {
      socketClient.leaveOrganization(organizationId);
      socketClient.removeAllListeners();
      socketClient.disconnect();
    };
  }, []);

  // Setup socket event listeners
  const setupSocketListeners = () => {
    // Listen for new messages
    socketClient.onNewMessage((message) => {
      console.log("📨 New message received:", message);
      setMessages((prev) => {
        // Check if message already exists
        if (prev.some((m) => m._id === message._id)) {
          return prev;
        }
        return [message, ...prev];
      });
      scrollToBottom();
      showNotification("New message received", "success");
    });

    // Listen for message edits
    socketClient.onMessageEdited((updatedMessage) => {
      console.log("✏️ Message edited:", updatedMessage);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === updatedMessage._id ? { ...m, ...updatedMessage } : m
        )
      );
      showNotification("Message updated", "success");
    });

    // Listen for message deletions
    socketClient.onMessageDeleted((data) => {
      console.log("🗑️ Message deleted:", data);
      setMessages((prev) => prev.filter((m) => m._id !== data.messageId));
      showNotification("Message deleted", "success");
    });

    // Listen for message reactions
    socketClient.onMessageReaction((data) => {
      console.log("😊 Reaction added:", data);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === data.messageId
            ? { ...m, reactions: data.reactions }
            : m
        )
      );
    });

    // Listen for message pins
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

    // Listen for message reads
    socketClient.onMessageRead((data) => {
      console.log("✅ Message read:", data);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === data.messageId ? { ...m, readBy: data.readBy } : m
        )
      );
    });

    // Listen for typing indicators
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

    // Monitor connection status
    const socket = socketClient.getSocket();
    if (socket) {
      socket.on("connect", () => {
        setIsSocketConnected(true);
        showNotification("Connected to real-time updates", "success");
      });

      socket.on("disconnect", () => {
        setIsSocketConnected(false);
        showNotification("Disconnected from real-time updates", "error");
      });
    }
  };

  // Show notification helper
  const showNotification = (message, type = "success") => {
    if (type === "success") {
      setSuccess(message);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(null), 3000);
    }
  };

  // Handle typing indicator
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

  // Fetch messages
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

  // Fetch stats
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

  // Fetch replies
  const fetchReplies = async (messageId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${messageId}/replies`, {
        headers: getHeaders(),
      });
      const data = await response.json();
      if (response.ok) {
        setReplies((prev) => ({ ...prev, [messageId]: data.replies }));
        setShowReplies((prev) => ({ ...prev, [messageId]: true }));
      }
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() && !editingMessage) return;

    try {
      if (editingMessage) {
        // Edit message
        const response = await fetch(`${API_BASE_URL}/${editingMessage._id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({ content: newMessage }),
        });

        if (response.ok) {
          setEditingMessage(null);
          setNewMessage("");
          // Socket will handle the update
        } else {
          const data = await response.json();
          setError(data.message || "Failed to update message");
        }
      } else {
        // Send new message
        const response = await fetch(API_BASE_URL, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            content: newMessage,
            messageType: "text",
            parentMessageId: replyingTo?._id || null,
          }),
        });

        if (response.ok) {
          setNewMessage("");
          setReplyingTo(null);
          handleTyping(false);
          // Socket will handle adding the message
          scrollToBottom();
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

  // Delete message
  const handleDeleteMessage = async (messageId) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${messageId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (response.ok) {
        // Socket will handle the deletion
      } else {
        const data = await response.json();
        setError(data.message || "Failed to delete message");
      }
    } catch (error) {
      setError("Error connecting to server");
      console.error("Error deleting message:", error);
    }
  };

  // Add reaction
  const handleReaction = async (messageId, emoji) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${messageId}/reaction`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ emoji }),
      });

      if (response.ok) {
        // Socket will handle the reaction update
      }
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
    setShowEmojiPicker(null);
  };

  // Mark as read
  const handleMarkAsRead = async (messageId) => {
    try {
      await fetch(`${API_BASE_URL}/${messageId}/read`, {
        method: "POST",
        headers: getHeaders(),
      });
      // Socket will handle the read status update
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Toggle pin
  const handleTogglePin = async (messageId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${messageId}/pin`, {
        method: "PATCH",
        headers: getHeaders(),
      });

      if (response.ok) {
        // Socket will handle the pin update
      } else {
        const data = await response.json();
        setError(data.message || "Failed to pin message");
      }
    } catch (error) {
      setError("Error connecting to server");
      console.error("Error toggling pin:", error);
    }
  };

  // Search messages
  const handleSearch = () => {
    setCurrentPage(1);
    fetchMessages(1, searchQuery);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, []);

  const startEdit = (message) => {
    setEditingMessage(message);
    setNewMessage(message.content);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setNewMessage("");
  };

  const toggleReplies = (messageId) => {
    if (showReplies[messageId]) {
      setShowReplies((prev) => ({ ...prev, [messageId]: false }));
    } else {
      fetchReplies(messageId);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-69px)] bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar - Stats */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800">Statistics</h2>
                <button
                  onClick={() => setShowStats(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {stats && (
                <div className="space-y-3">
                  <StatCard
                    icon={<MessageSquare size={16} />}
                    label="Total Messages"
                    value={stats.totalMessages}
                    color="blue"
                  />
                  <StatCard
                    icon={<Reply size={16} />}
                    label="Total Replies"
                    value={stats.totalReplies}
                    color="green"
                  />
                  <StatCard
                    icon={<Pin size={16} />}
                    label="Pinned"
                    value={stats.pinnedMessages}
                    color="yellow"
                  />
                  <StatCard
                    icon={<TrendingUp size={16} />}
                    label="Today"
                    value={stats.todayMessages}
                    color="purple"
                  />

                  <div className="mt-6">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-800">
                      <Users size={16} />
                      Top Contributors
                    </h3>
                    <div className="space-y-2">
                      {stats.topContributors.map((contributor, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center justify-between p-2 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {contributor.senderName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-800">
                                {contributor.senderName}
                              </p>
                              <p className="text-xs text-slate-500">
                                {contributor.senderRole}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-blue-600">
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

      {/* Main Container */}
      <div className="flex-1 flex flex-col max-full max-h-[calc(100vh-69px)] mx-auto w-full">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white shadow-md px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowStats(!showStats)}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <TrendingUp size={20} className="text-slate-700" />
            </motion.button>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Messaging
            </h1>
            
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {isSocketConnected ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Wifi size={14} />
                  <span className="text-xs font-medium">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <WifiOff size={14} />
                  <span className="text-xs font-medium">Disconnected</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56 transition-all"
              />
              <Search
                className="absolute left-2 top-2.5 text-slate-400"
                size={16}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Search
            </motion.button>
          </div>
        </motion.div>

        {/* Notifications */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
            >
              <AlertCircle className="text-red-600" size={16} />
              <p className="text-xs text-red-800">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-4 mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2"
            >
              <Check className="text-green-600" size={16} />
              <p className="text-xs text-green-800">{success}</p>
              <button
                onClick={() => setSuccess(null)}
                className="ml-auto text-green-600 hover:text-green-800"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
              <p className="mt-3 text-xs text-slate-600 font-medium">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full text-slate-500">
              <MessageSquare size={48} className="mb-3 opacity-50" />
              <p className="text-sm font-medium">No messages yet</p>
              <p className="text-xs">Start a conversation!</p>
            </div>
          ) : (
            <>
              <AnimatePresence>
                {messages.map((message, index) => (
                  <MessageCard
                    key={message._id}
                    message={message}
                    index={index}
                    onReply={() => setReplyingTo(message)}
                    onEdit={() => startEdit(message)}
                    onDelete={() => handleDeleteMessage(message._id)}
                    onReaction={(emoji) => handleReaction(message._id, emoji)}
                    onPin={() => handleTogglePin(message._id)}
                    onToggleReplies={() => toggleReplies(message._id)}
                    showReplies={showReplies[message._id]}
                    replies={replies[message._id]}
                    showEmojiPicker={showEmojiPicker === message._id}
                    setShowEmojiPicker={setShowEmojiPicker}
                    emojis={emojis}
                  />
                ))}
              </AnimatePresence>
              
              {/* Typing Indicator */}
              {typingUsers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-slate-500 text-xs px-3"
                >
                  <div className="flex gap-1">
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-slate-400 rounded-full"
                    />
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-slate-400 rounded-full"
                    />
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-slate-400 rounded-full"
                    />
                  </div>
                  <span>
                    {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                  </span>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center gap-2 py-3 bg-white border-t"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchMessages(currentPage - 1, searchQuery)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition-colors font-medium"
            >
              Previous
            </motion.button>
            <span className="px-2 py-1 text-xs font-medium text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchMessages(currentPage + 1, searchQuery)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition-colors font-medium"
            >
              Next
            </motion.button>
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
                className="flex items-center justify-between mb-2 p-2 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div className="flex items-center gap-2">
                  <Reply size={14} className="text-blue-600" />
                  <div>
                    <span className="text-xs font-medium text-slate-700">
                      Replying to {replyingTo.senderName}
                    </span>
                    <p className="text-xs text-slate-500 truncate max-w-xs">
                      {replyingTo.content}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}

            {editingMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between mb-2 p-2 bg-amber-50 rounded-lg border border-amber-200"
              >
                <div className="flex items-center gap-2">
                  <Edit2 size={14} className="text-amber-600" />
                  <span className="text-xs font-medium text-slate-700">
                    Editing message
                  </span>
                </div>
                <button
                  onClick={cancelEdit}
                  className="text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Paperclip size={18} className="text-slate-600" />
            </motion.button>
            <input
              type="text"
              placeholder="Type your message..."
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
              className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Send size={16} />
              {editingMessage ? "Update" : "Send"}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Message Card Component
const MessageCard = ({
  message,
  index,
  onReply,
  onEdit,
  onDelete,
  onReaction,
  onPin,
  onToggleReplies,
  showReplies,
  replies,
  showEmojiPicker,
  setShowEmojiPicker,
  emojis,
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition-all ${
        message.isPinned ? "border-l-4 border-yellow-500 bg-yellow-50" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0"
          >
            {message.senderName?.charAt(0).toUpperCase()}
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-slate-800 text-xs">
                {message.senderName}
              </h3>
              <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full text-slate-600 font-medium">
                {message.senderRole}
              </span>
              {message.isPinned && (
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Pin size={14} className="text-yellow-600 fill-yellow-600" />
                </motion.div>
              )}
            </div>

            <p className="text-slate-700 mb-2 leading-relaxed text-sm">{message.content}</p>

            {message.isEdited && (
              <span className="text-xs text-slate-500 italic flex items-center gap-1">
                <Edit2 size={10} />
                edited
              </span>
            )}

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {Object.entries(
                  message.reactions.reduce((acc, r) => {
                    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([emoji, count]) => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onReaction(emoji)}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-full text-xs transition-colors font-medium shadow-sm"
                  >
                    {emoji} {count}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 mt-2 text-slate-500 flex-wrap text-xs">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onReply}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
              >
                <Reply size={14} />
                <span className="font-medium">Reply</span>
              </motion.button>

              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setShowEmojiPicker(showEmojiPicker ? null : message._id)
                  }
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <Smile size={14} />
                  <span className="font-medium">React</span>
                </motion.button>

                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 10 }}
                      className="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-lg shadow-lg flex gap-1 z-10 border border-slate-200"
                    >
                      {emojis.map((emoji) => (
                        <motion.button
                          key={emoji}
                          whileHover={{ scale: 1.3 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onReaction(emoji)}
                          className="text-lg hover:bg-slate-100 rounded p-1 transition-colors"
                        >
                          {emoji}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {message.replyCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onToggleReplies}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <MessageSquare size={14} />
                  <span className="font-medium">
                    {message.replyCount} {message.replyCount === 1 ? "reply" : "replies"}
                  </span>
                  {showReplies ? (
                    <ChevronUp size={12} />
                  ) : (
                    <ChevronDown size={12} />
                  )}
                </motion.button>
              )}

              <span className="text-xs ml-auto text-slate-400">
                {new Date(message.createdAt).toLocaleString()}
              </span>
            </div>

            {/* Replies */}
            <AnimatePresence>
              {showReplies && replies && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pl-3 border-l-2 border-blue-200 space-y-2"
                >
                  {replies.map((reply, idx) => (
                    <motion.div
                      key={reply._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-slate-50 rounded-lg p-2 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {reply.senderName?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-xs text-slate-800">
                          {reply.senderName}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(reply.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {reply.content}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="relative ml-2 flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowActions(!showActions)}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <MoreVertical size={16} className="text-slate-600" />
          </motion.button>

          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg py-1 z-10 border border-slate-200"
              >
                <button
                  onClick={() => {
                    onEdit();
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-1 text-left hover:bg-slate-100 flex items-center gap-2 text-slate-700 transition-colors text-xs font-medium"
                >
                  <Edit2 size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    onPin();
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-1 text-left hover:bg-slate-100 flex items-center gap-2 text-slate-700 transition-colors text-xs font-medium"
                >
                  <Pin size={14} />
                  <span>
                    {message.isPinned ? "Unpin" : "Pin"}
                  </span>
                </button>
                <div className="border-t border-slate-200 my-0.5"></div>
                <button
                  onClick={() => {
                    onDelete();
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-1 text-left hover:bg-red-50 flex items-center gap-2 text-red-600 transition-colors text-xs font-medium"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
      className={`bg-gradient-to-br ${colors[color]} rounded-lg p-3 text-white shadow-md hover:shadow-lg transition-shadow`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="p-1 bg-white bg-opacity-20 rounded-lg">{icon}</div>
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-xs opacity-90 font-medium">{label}</p>
    </motion.div>
  );
};

export default Messaging;