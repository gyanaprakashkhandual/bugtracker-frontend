// socketClient.js
import { io } from 'socket.io-client';

class SocketClient {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  // Initialize socket connection
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

  // Setup default socket event listeners
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
    });
  }

  // Get token from localStorage
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  // Join organization room
  joinOrganization(organizationId) {
    if (this.socket?.connected) {
      this.socket.emit('join_organization', organizationId);
      console.log('📥 Joined organization:', organizationId);
    }
  }

  // Leave organization room
  leaveOrganization(organizationId) {
    if (this.socket?.connected) {
      this.socket.emit('leave_organization', organizationId);
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

  // Emit typing event
  emitTyping(isTyping) {
    if (this.socket?.connected) {
      this.socket.emit('typing', isTyping);
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
      console.log('🔌 Socket disconnected');
    }
  }

  // Check if socket is connected
  isConnected() {
    return this.socket?.connected || false;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }
}

// Create singleton instance
const socketClient = new SocketClient();

export default socketClient;