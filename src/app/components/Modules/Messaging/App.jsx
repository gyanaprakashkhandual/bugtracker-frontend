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
  Check,
  CheckCheck,
  AlertCircle,
  Wifi,
  WifiOff,
  Image as ImageIcon,
  Download,
} from "lucide-react";
import socketClient from "@/app/client/socket.client";

const API_BASE_URL = "http://localhost:5000/api/v1/message";
const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dvytvjplt/image/upload";
const CLOUDINARY_UPLOAD_PRESET = 'test_case_preset';

const getCurrentUser = () => {
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName");
    const userEmail = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole");
    const organizationId = localStorage.getItem("organizationId");
    const organizationName = localStorage.getItem("organizationName");

    let storedUser = {};
    try {
      const userStr = localStorage.getItem("user");
      if (userStr && userStr !== "{}") {
        storedUser = JSON.parse(userStr);
      }
    } catch (e) { }

    const userData = {
      id: userId || storedUser._id || storedUser.id,
      _id: userId || storedUser._id || storedUser.id,
      name: userName || storedUser.name,
      email: userEmail || storedUser.email,
      role: userRole || storedUser.role,
      token: token,
      organizationId: organizationId || storedUser.organizationId,
      organizationName: organizationName || storedUser.organizationName,
      isVerified: localStorage.getItem("isVerified") === 'true' || storedUser.isVerified,
      isActive: localStorage.getItem("isActive") === 'true' || storedUser.isActive,
      isOrganizationOwner: localStorage.getItem("isOrganizationOwner") === 'true' || storedUser.isOrganizationOwner,
    };

    return userData;
  }

  return {
    id: null,
    _id: null,
    name: null,
    email: null,
    token: null,
    organizationId: null,
    organizationName: null,
    role: null,
    isVerified: false,
    isActive: true,
    isOrganizationOwner: false
  };
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
  const [error, setError] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const currentUser = getCurrentUser();

  const sortedMessages = [...messages].sort((a, b) =>
    new Date(a.createdAt) - new Date(b.createdAt)
  );

  useEffect(() => {
    const organizationId = currentUser.organizationId;

    if (!currentUser.id || !currentUser.email) {
      setError("User session expired or invalid. Please log out and log in again.");
      setLoading(false);
      return;
    }

    if (!organizationId) {
      setError("Organization ID not found. Please contact your admin to be added to an organization.");
      setLoading(false);
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
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) {
          return prev;
        }
        const newMessages = [...prev, message];
        return newMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      });
      setTimeout(() => scrollToBottom(), 100);
    });

    socketClient.onMessageEdited((updatedMessage) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === updatedMessage._id ? { ...m, ...updatedMessage } : m
        )
      );
    });

    socketClient.onMessageDeleted((data) => {
      setMessages((prev) => prev.filter((m) => m._id !== data.messageId));
    });

    socketClient.onMessageReaction((data) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === data.messageId ? { ...m, reactions: data.reactions } : m
        )
      );
    });

    socketClient.onMessagePinned((data) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === data.messageId ? { ...m, isPinned: data.isPinned } : m
        )
      );
    });

    socketClient.onMessageRead((data) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m._id === data.messageId) {
            const existingReadBy = m.readBy || [];
            const isAlreadyRead = existingReadBy.some(
              r => String(r.userId || r) === String(data.userId)
            );

            if (!isAlreadyRead) {
              return {
                ...m,
                readBy: [...existingReadBy, {
                  userId: data.userId,
                  readAt: data.readAt || new Date().toISOString()
                }]
              };
            }
          }
          return m;
        })
      );
    });

    socketClient.onUserTyping((data) => {
      setTypingUsers((prev) => {
        const filtered = prev.filter((u) => u.userId !== data.userId);
        return [...filtered, data];
      });
    });

    socketClient.onUserStoppedTyping((data) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
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

  const handleTyping = (isTyping) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTyping) {
      socketClient.emitTypingStart(currentUser.organizationId);
      typingTimeoutRef.current = setTimeout(() => {
        socketClient.emitTypingStop(currentUser.organizationId);
      }, 3000);
    } else {
      socketClient.emitTypingStop(currentUser.organizationId);
    }
  };

  const fetchMessages = async (page = 1, search = "") => {
    try {
      setLoading(true);
      setError(null);
      const url = search
        ? `${API_BASE_URL}/search?query=${search}&page=${page}&limit=50`
        : `${API_BASE_URL}?page=${page}&limit=50`;

      const response = await fetch(url, {
        headers: getHeaders(),
      });
      const data = await response.json();

      if (response.ok) {
        const fetchedMessages = data.messages || data.results || [];
        const sortedMessages = fetchedMessages.sort((a, b) =>
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        setMessages(sortedMessages);
        setCurrentPage(data.pagination?.currentPage || 1);
        setTotalPages(data.pagination?.totalPages || 1);
        setTimeout(() => scrollToBottom(), 100);
      } else {
        setError(data.message || "Failed to fetch messages");
      }
    } catch (error) {
      setError("Error connecting to server");
    } finally {
      setLoading(false);
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
      setError("Failed to fetch replies");
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      return {
        url: data.secure_url,
        name: file.name,
        size: file.size,
        type: file.type.startsWith('image/') ? 'image' : 'file'
      };
    } catch (error) {
      throw error;
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const uploadedFile = await uploadToCloudinary(file);
      setSelectedFile(uploadedFile);
    } catch (error) {
      setError("Failed to upload file");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile && !editingMessage) return;

    try {
      if (editingMessage) {
        const response = await fetch(`${API_BASE_URL}/${editingMessage._id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({ content: newMessage }),
        });

        if (response.ok) {
          const updatedMessage = await response.json();
          setMessages((prev) =>
            prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m))
          );
          setEditingMessage(null);
          setNewMessage("");
        } else {
          const data = await response.json();
          setError(data.message || "Failed to update message");
        }
      } else {
        const messageData = {
          content: newMessage || '',
          messageType: selectedFile ? selectedFile.type : "text",
          parentMessageId: replyingTo?._id || null,
          mentions: [],
        };

        if (selectedFile) {
          messageData.fileUrl = selectedFile.url;
          messageData.fileName = selectedFile.name;
          messageData.fileSize = selectedFile.size;
        }

        const response = await fetch(API_BASE_URL, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(messageData),
        });

        if (response.ok) {
          const sentMessage = await response.json();
          setNewMessage("");
          setReplyingTo(null);
          setSelectedFile(null);
          handleTyping(false);

          setMessages(prev => {
            const newMessages = [...prev, sentMessage];
            return newMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          });

          setTimeout(() => scrollToBottom(), 100);
        } else {
          const data = await response.json();
          setError(data.message || "Failed to send message");
        }
      }
    } catch (error) {
      setError("Error connecting to server");
    }
  };

  const handleDeleteMessage = async (messageId) => {

    try {
      const response = await fetch(`${API_BASE_URL}/${messageId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (response.ok) {
        setMessages(prev => prev.filter(m => m._id !== messageId));
      } else {
        const data = await response.json();
        setError(data.message || "Failed to delete message");
      }
    } catch (error) {
      setError("Error connecting to server");
    }
  };


  const handleMarkAsRead = async (messageId) => {
    try {
      if (!messageId) return;

      const response = await fetch(`${API_BASE_URL}/${messageId}/read`, {
        method: "POST",
        headers: getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();

        setMessages(prev =>
          prev.map((m) => {
            if (m._id === messageId) {
              const existingReadBy = m.readBy || [];
              const isAlreadyRead = existingReadBy.some(
                r => String(r.userId || r) === String(currentUser.id)
              );

              if (!isAlreadyRead) {
                return {
                  ...m,
                  readBy: [...existingReadBy, {
                    userId: currentUser.id,
                    readAt: new Date().toISOString()
                  }]
                };
              }
            }
            return m;
          })
        );
      }
    } catch (error) { }
  };

  useEffect(() => {
    let isMounted = true;

    const markMessagesAsRead = async () => {
      if (!isMounted || messages.length === 0 || !currentUser.id) return;

      const unreadMessages = messages.filter((m) => {
        const messageSenderId = m.senderId?._id || m.senderId;
        const isMyMessage = String(messageSenderId) === String(currentUser.id);
        const isUnread = !m.readBy?.some((r) => String(r.userId) === String(currentUser.id));

        return !isMyMessage && isUnread && m._id;
      });

      if (unreadMessages.length === 0) return;

      const batchSize = 5;
      for (let i = 0; i < unreadMessages.length; i += batchSize) {
        if (!isMounted) break;

        const batch = unreadMessages.slice(i, i + batchSize);
        const promises = batch.map(m => handleMarkAsRead(m._id));

        try {
          await Promise.all(promises);
          if (i + batchSize < unreadMessages.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) { }
      }
    };

    const timer = setTimeout(() => {
      markMessagesAsRead();
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [messages, currentUser.id]);

  const formatMessageTime = (dateString) => {
    if (!dateString) return 'Just now';

    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return 'Just now';
      }

      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));

      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;

      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Just now'
    }
  };

  const handleTogglePin = async (messageId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${messageId}/pin`, {
        method: "PATCH",
        headers: getHeaders(),
      });

      if (response.ok) {
        const updatedMessage = await response.json();
        setMessages(prev =>
          prev.map((m) =>
            m._id === messageId ? { ...m, isPinned: updatedMessage.isPinned } : m
          )
        );
      } else {
        const data = await response.json();
        setError(data.message || "Failed to pin message");
      }
    } catch (error) {
      setError("Error connecting to server");
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
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startEdit = (message) => {
    setEditingMessage(message);
    setNewMessage(message.content);
    setContextMenu(null);
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 100);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setNewMessage("");
  };

  const isMyMessage = (message) => {
    const currentUserId = currentUser.id || currentUser._id;
    const messageSenderId = message.senderId?._id || message.senderId;
    const currentUserEmail = currentUser.email;
    const messageSenderEmail = message.senderId?.email || message.senderEmail;

    const idsMatch = currentUserId && messageSenderId &&
      String(messageSenderId) === String(currentUserId);
    const emailsMatch = currentUserEmail && messageSenderEmail &&
      String(currentUserEmail).toLowerCase() === String(messageSenderEmail).toLowerCase();

    return idsMatch || emailsMatch;
  };

  const handleContextMenu = (e, message) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      message: message
    });
  };

  const handleReplyFromContext = () => {
    setReplyingTo(contextMenu.message);
    setContextMenu(null);
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 100);
  };

  const handleEditFromContext = () => {
    startEdit(contextMenu.message);
  };

  const handleDeleteFromContext = () => {
    handleDeleteMessage(contextMenu.message._id);
    setContextMenu(null);
  };

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-69px)] max-h-[calc(100vh-69px)] sidebar-scrollbar">
      <AnimatePresence>
        {fullScreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setFullScreenImage(null)}
          >
            <button
              onClick={() => setFullScreenImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={24} className="text-white" />
            </button>
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={fullScreenImage}
              alt="Full screen"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: 'fixed',
              top: contextMenu.y,
              left: contextMenu.x,
              zIndex: 1000
            }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-slate-200 dark:border-gray-700 py-1 min-w-[150px]"
          >
            <button
              onClick={handleReplyFromContext}
              className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-gray-100"
            >
              <Reply size={14} />
              Reply
            </button>
            {isMyMessage(contextMenu.message) && (
              <>
                <button
                  onClick={handleEditFromContext}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-gray-100"
                >
                  <Edit2 size={14} />
                  Edit
                </button>
                <button
                  onClick={handleDeleteFromContext}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900 text-red-600 dark:text-red-400 flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-gray-100 flex items-center gap-2">
                  <MessageSquare size={16} />
                  Replies ({replies[showRepliesModal]?.length})
                </h3>
                <button
                  onClick={() => setShowRepliesModal(null)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X size={16} className="dark:text-gray-100" />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(80vh-120px)] p-4 space-y-3">
                {replies[showRepliesModal]?.map((reply, idx) => (
                  <motion.div
                    key={reply._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`rounded-lg p-3 ${String(reply.senderId) === String(currentUser.id)
                      ? "bg-[#dcf8c6] dark:bg-green-900 ml-auto"
                      : "bg-slate-100 dark:bg-gray-700 mr-auto"
                      } max-w-[85%]`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                        {reply.senderName?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-[11px] text-slate-800 dark:text-gray-100">
                        {reply.senderName}
                      </span>
                      <span className="text-[9px] text-slate-500 dark:text-gray-400 ml-auto">
                        {formatMessageTime(reply.createdAt)}
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-700 dark:text-gray-200 leading-relaxed">
                      {reply.content}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col max-h-[calc(100vh-69px)]">
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900 relative">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-2 p-2 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg flex items-center gap-2"
              >
                <AlertCircle className="text-red-600 dark:text-red-400" size={14} />
                <p className="text-[11px] text-red-800 dark:text-red-200">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-600 dark:text-red-400"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="flex flex-col justify-center items-center min-h-[calc(100vh-69px)]">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
              <p className="mt-2 text-[11px] text-slate-600 dark:text-gray-400">Loading messages...</p>
            </div>
          ) : sortedMessages.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full text-slate-500 dark:text-gray-400">
              <MessageSquare size={40} className="mb-2 opacity-50" />
              <p className="text-xs font-medium">No messages yet</p>
              <p className="text-[10px]">Start a conversation!</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="space-y-2">
                {sortedMessages.map((message, index) => {
                  const messageKey = message._id || `message-${index}-${Date.now()}`;

                  return (
                    <MessageBubble
                      key={messageKey}
                      message={message}
                      index={index}
                      isMyMessage={isMyMessage(message)}
                      currentUserId={currentUser.id}
                      onReply={() => {
                        setReplyingTo(message);
                        setTimeout(() => {
                          messageInputRef.current?.focus();
                        }, 100);
                      }}
                      onEdit={() => startEdit(message)}
                      onDelete={() => handleDeleteMessage(message._id)}
                      onPin={() => handleTogglePin(message._id)}
                      onToggleReplies={() => fetchReplies(message._id)}
                      onContextMenu={handleContextMenu}
                      formatMessageTime={formatMessageTime}
                      onImageClick={setFullScreenImage}
                    />
                  );
                })}
              </div>

              {typingUsers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-slate-500 dark:text-gray-400 text-[10px] px-3"
                >
                  <div className="flex gap-1">
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
                    {typingUsers.map(u => u.name).join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                  </span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center gap-2 py-2 bg-white dark:bg-gray-800 border-t dark:border-gray-700"
          >
            <button
              onClick={() => fetchMessages(currentPage - 1, searchQuery)}
              disabled={currentPage === 1}
              className="px-2.5 py-1 text-[11px] bg-slate-200 dark:bg-gray-700 dark:text-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-gray-600 font-medium"
            >
              Previous
            </button>
            <span className="px-2 py-1 text-[10px] font-medium text-slate-700 dark:text-gray-300">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => fetchMessages(currentPage + 1, searchQuery)}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 text-[11px] bg-slate-200 dark:bg-gray-700 dark:text-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-gray-600 font-medium"
            >
              Next
            </button>
          </motion.div>
        )}

        <div className="bg-white dark:bg-gray-800 border-t border-green-600 dark:border-green-700 px-4 py-2">
          <AnimatePresence>
            {replyingTo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between mb-2 p-2 bg-green-50 dark:bg-green-900 rounded-lg border-l-4 border-green-500"
              >
                <div className="flex items-center gap-2">
                  <Reply size={12} className="text-green-600 dark:text-green-400" />
                  <div>
                    <span className="text-[10px] font-semibold text-slate-700 dark:text-gray-200">
                      Replying to {replyingTo.senderName}
                    </span>
                    <p className="text-[10px] text-slate-500 dark:text-gray-400 truncate max-w-xs">
                      {replyingTo.content}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200"
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
                className="flex items-center justify-between mb-2 p-2 bg-amber-50 dark:bg-amber-900 rounded-lg border-l-4 border-amber-500"
              >
                <div className="flex items-center gap-2">
                  <Edit2 size={12} className="text-amber-600 dark:text-amber-400" />
                  <span className="text-[10px] font-semibold text-slate-700 dark:text-gray-200">
                    Editing message
                  </span>
                </div>
                <button
                  onClick={cancelEdit}
                  className="text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200"
                >
                  <X size={12} />
                </button>
              </motion.div>
            )}

            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between mb-2 p-2 bg-blue-50 dark:bg-blue-900 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {selectedFile.type === 'image' ? (
                    <img
                      src={selectedFile.url}
                      alt="Selected"
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <Paperclip size={16} className="text-blue-600 dark:text-blue-400" />
                  )}
                  <span className="text-[10px] text-slate-700 dark:text-gray-200">{selectedFile.name} ready to send</span>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200"
                >
                  <X size={12} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-gray-700 rounded-full px-3 py-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="*"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile}
              className="p-1 hover:bg-slate-100 dark:hover:bg-gray-600 rounded-full"
            >
              {uploadingFile ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 dark:border-gray-300"></div>
              ) : (
                <Paperclip size={18} className="text-slate-600 dark:text-gray-300" />
              )}
            </button>

            <input
              ref={messageInputRef}
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
              className="flex-1 px-3 py-1.5 text-[13px] bg-transparent dark:text-gray-100 focus:outline-none placeholder:text-slate-500 dark:placeholder:text-gray-400"
            />

            <button
              onClick={handleSendMessage}
              disabled={(!newMessage.trim() && !selectedFile) || uploadingFile}
              className="p-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({
  message,
  index,
  isMyMessage,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onPin,
  onToggleReplies,
  onContextMenu,
  formatMessageTime,
  onImageClick,
}) => {
  const [showActions, setShowActions] = useState(false);

  const getReadStatus = () => {
    if (!isMyMessage) return null;

    const readBy = message.readBy || [];
    const othersWhoRead = readBy.filter(
      r => String(r.userId || r) !== String(currentUserId)
    );

    return othersWhoRead.length > 0;
  };

  const hasBeenRead = getReadStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: isMyMessage ? 100 : -100 }}
      transition={{ delay: index * 0.02 }}
      className={`flex ${isMyMessage ? "justify-end" : "justify-start"} mb-2 px-3`}
      onContextMenu={(e) => onContextMenu(e, message)}
    >
      <div className={`relative max-w-[75%] group`}>
        {message.parentMessageId && (
          <div className="mb-1 ml-3 p-2 bg-slate-100 dark:bg-gray-700 rounded-lg text-[10px] text-slate-600 dark:text-gray-300 border-l-2 border-green-500">
            <Reply size={10} className="inline mr-1" />
            <span className="font-semibold">{message.parentMessageId.senderName || 'Someone'}</span>: {message.parentMessageId.content?.substring(0, 50)}{message.parentMessageId.content?.length > 50 ? '...' : ''}
          </div>
        )}

        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${isMyMessage
            ? "bg-[#dcf8c6] dark:bg-green-900 rounded-br-none"
            : "bg-white dark:bg-gray-800 rounded-bl-none border border-gray-200 dark:border-gray-700"
            }`}
        >
          {!isMyMessage && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                {message.senderName?.charAt(0).toUpperCase()}
              </div>
              <span className="text-[12px] font-semibold text-gray-800 dark:text-gray-100">
                {message.senderName}
              </span>
              {message.senderRole && (
                <span className="text-[9px] px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-700 dark:text-blue-300">
                  {message.senderRole}
                </span>
              )}
            </div>
          )}

          {message.messageType === 'image' && message.fileUrl && (
            <div className="mb-2">
              <img
                src={message.fileUrl}
                alt={message.fileName || 'Image'}
                className="max-w-full rounded-lg max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => onImageClick(message.fileUrl)}
              />
            </div>
          )}

          {message.messageType === 'file' && message.fileUrl && (
            <div className="mb-2 p-2 bg-slate-100 dark:bg-gray-700 rounded-lg flex items-center gap-2">
              <Paperclip size={16} className="text-slate-600 dark:text-gray-300" />
              <div className="flex-1">
                <p className="text-[11px] font-medium text-slate-800 dark:text-gray-100">{message.fileName}</p>
                <p className="text-[9px] text-slate-500 dark:text-gray-400">{(message.fileSize / 1024).toFixed(2)} KB</p>
              </div>
              <a
                href={message.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-slate-200 dark:hover:bg-gray-600 rounded"
              >
                <Download size={14} className="text-slate-600 dark:text-gray-300" />
              </a>
            </div>
          )}

          {message.content && (
            <p
              className={`text-[14px] leading-relaxed break-words ${isMyMessage ? "text-gray-800 dark:text-gray-100" : "text-gray-800 dark:text-gray-100"
                }`}
            >
              {message.content}
            </p>
          )}

          <div
            className={`flex items-center gap-2 mt-2 ${isMyMessage ? "justify-end" : "justify-start"
              }`}
          >
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              {formatMessageTime(message.createdAt)}
            </span>
            {message.isEdited && (
              <span className="text-[9px] text-gray-400 dark:text-gray-500">(edited)</span>
            )}
            {isMyMessage && (
              <span className="text-blue-500 dark:text-blue-400">
                {hasBeenRead ? (
                  <CheckCheck size={12} />
                ) : (
                  <Check size={12} />
                )}
              </span>
            )}
          </div>
        </div>

        <div className="absolute -top-1 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          {message.replyCount > 0 && (
            <button
              onClick={onToggleReplies}
              className="p-1 bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-slate-100 dark:hover:bg-gray-600 text-[9px] px-2"
            >
              <MessageSquare size={12} className="inline mr-1 text-slate-600 dark:text-gray-300" />
              {message.replyCount}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Messaging;