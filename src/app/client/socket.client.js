// socketClient.js
import { io } from 'socket.io-client';

class SocketClient {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.isConnecting = false;
  }

  // Initialize socket connection
  // In socketClient.js - update the connect method
  connect(url = 'https://caffetest.onrender.com') {
    // Prevent multiple connection attempts
    if (this.isConnecting) {
      console.log('Socket connection already in progress...');
      return this.socket;
    }

    const token = this.getToken();
    const userId = this.getUserId();
    const userName = this.getUserName();
    const organizationId = this.getOrganizationId();

    console.log('🔗 === FRONTEND SOCKET CONNECTION ATTEMPT ===');
    console.log('📦 Data being sent to server:');
    console.log('   - Token exists:', !!token);
    console.log('   - Token preview:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
    console.log('   - User ID:', userId);
    console.log('   - User Name:', userName);
    console.log('   - Organization ID:', organizationId);
    console.log('   - All localStorage:', {
      token: localStorage.getItem('token'),
      userId: localStorage.getItem('userId'),
      userName: localStorage.getItem('userName'),
      organizationId: localStorage.getItem('organizationId')
    });

    if (!token) {
      console.error('❌ NO TOKEN FOUND in localStorage');
      return null;
    }

    if (!userId) {
      console.error('❌ NO USER ID FOUND in localStorage');
      return null;
    }

    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    this.isConnecting = true;

    try {
      this.socket = io(url, {
        auth: {
          token: token,
          userId: userId,
          userName: userName,
          organizationId: organizationId
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10,
        timeout: 20000,
      });

      this.setupDefaultListeners();
      return this.socket;
    } catch (error) {
      console.error('Socket connection error:', error);
      this.isConnecting = false;
      return null;
    }
  }

  // Setup default socket event listeners
  setupDefaultListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.isConnecting = false;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnecting = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
      this.isConnecting = false;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Reconnection attempt', attemptNumber);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error.message);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect');
      this.isConnecting = false;
    });

    // Add error handler for general socket errors
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  // Get user data from localStorage
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  getUserId() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userId');
    }
    return null;
  }

  getUserName() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userName');
    }
    return null;
  }

  getOrganizationId() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('organizationId');
    }
    return null;
  }

  // Join organization room
  joinOrganization(organizationId) {
    if (this.socket?.connected) {
      this.socket.emit('join_organization', { organizationId });
      console.log('📥 Joined organization:', organizationId);
    } else {
      console.warn('Socket not connected, cannot join organization');
    }
  }

  // Leave organization room
  leaveOrganization(organizationId) {
    if (this.socket?.connected) {
      this.socket.emit('leave_organization', { organizationId });
      console.log('📤 Left organization:', organizationId);
    }
  }

  // Listen to new messages
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new_message', callback);
      this.listeners.set('new_message', callback);
    }
  }

  // Listen to message edits
  onMessageEdited(callback) {
    if (this.socket) {
      this.socket.on('message_edited', callback);
      this.listeners.set('message_edited', callback);
    }
  }

  // Listen to message deletions
  onMessageDeleted(callback) {
    if (this.socket) {
      this.socket.on('message_deleted', callback);
      this.listeners.set('message_deleted', callback);
    }
  }

  // Listen to message reactions
  onMessageReaction(callback) {
    if (this.socket) {
      this.socket.on('message_reaction', callback);
      this.listeners.set('message_reaction', callback);
    }
  }

  // Listen to message pins
  onMessagePinned(callback) {
    if (this.socket) {
      this.socket.on('message_pinned', callback);
      this.listeners.set('message_pinned', callback);
    }
  }

  // Listen to message reads
  onMessageRead(callback) {
    if (this.socket) {
      this.socket.on('message_read', callback);
      this.listeners.set('message_read', callback);
    }
  }

  // Listen to user typing
  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
      this.listeners.set('user_typing', callback);
    }
  }

  // Listen to user stopped typing
  onUserStoppedTyping(callback) {
    if (this.socket) {
      this.socket.on('user_stopped_typing', callback);
      this.listeners.set('user_stopped_typing', callback);
    }
  }

  // Emit typing start event
  emitTypingStart(organizationId) {
    if (this.socket?.connected) {
      this.socket.emit('typing_start', {
        organizationId,
        userId: this.getUserId(),
        userName: this.getUserName()
      });
    }
  }

  // Emit typing stop event
  emitTypingStop(organizationId) {
    if (this.socket?.connected) {
      this.socket.emit('typing_stop', {
        organizationId,
        userId: this.getUserId(),
        userName: this.getUserName()
      });
    }
  }

  // Send message read receipt
  emitMessageRead(messageId) {
    if (this.socket?.connected) {
      this.socket.emit('message_read', {
        messageId,
        userId: this.getUserId(),
        userName: this.getUserName()
      });
    }
  }

  // Send message reaction
  emitMessageReaction(messageId, emoji) {
    if (this.socket?.connected) {
      this.socket.emit('message_reaction', {
        messageId,
        emoji,
        userId: this.getUserId(),
        userName: this.getUserName()
      });
    }
  }

  // Remove a specific listener
  off(eventName) {
    if (this.socket && this.listeners.has(eventName)) {
      const callback = this.listeners.get(eventName);
      this.socket.off(eventName, callback);
      this.listeners.delete(eventName);
    }
  }

  // Remove all custom listeners
  removeAllListeners() {
    if (this.socket) {
      this.listeners.forEach((callback, eventName) => {
        this.socket.off(eventName, callback);
      });
      this.listeners.clear();
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
      console.log('🔌 Socket disconnected');
    }
  }

  // Check if socket is connected
  isConnected() {
    return this.socket?.connected || false;
  }

  // Check if socket is connecting
  isConnecting() {
    return this.isConnecting;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Get socket ID
  getSocketId() {
    return this.socket?.id || null;
  }
}

// Create singleton instance
const socketClient = new SocketClient();

export default socketClient;