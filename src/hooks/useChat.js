import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:4000';

/**
 * Custom hook for Socket.IO chat functionality
 * Handles connection, messaging, and proper cleanup
 *
 * @param {string} userId - Unique user identifier
 * @param {string} username - Display name for the user
 * @returns {Object} Chat state and methods
 */
export const useChat = (userId, username) => {
  // Socket reference - persists across renders
  const socketRef = useRef(null);

  // Track if user has joined (prevent duplicate joins)
  const hasJoinedRef = useRef(false);

  // Track if we're in cleanup phase
  const isCleaningUpRef = useRef(false);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());

  // -------------------------------------------------------------------------
  // SOCKET INITIALIZATION - Only once per component lifecycle
  // -------------------------------------------------------------------------
  useEffect(() => {
    // Prevent duplicate socket creation in React StrictMode
    if (socketRef.current) return;

    console.log('🔌 Initializing socket connection...');

    // Create socket with optimized settings
    const socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
      // Send auth data with connection
      auth: {
        userId,
        username
      }
    });

    socketRef.current = socket;

    // -----------------------------------------------------------------------
    // CONNECTION EVENTS
    // -----------------------------------------------------------------------

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setIsConnected(true);

      // Send join event only once per connection
      // The server will handle reconnection logic
      if (!hasJoinedRef.current && !isCleaningUpRef.current) {
        console.log('📤 Sending user:join event');
        socket.emit('user:join', { userId, username });
        hasJoinedRef.current = true;
      }
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      setIsConnected(false);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setIsConnected(false);

      // Don't reset hasJoinedRef here - we might reconnect
      // Only reset on explicit component unmount
    });

    // -----------------------------------------------------------------------
    // INCOMING MESSAGE EVENTS (from other users only)
    // -----------------------------------------------------------------------

    // Another user joined - we receive this, but we never see our own join
    socket.on('user:joined', (data) => {
      console.log('👤 User joined:', data.username);

      // Add system message to chat
      setMessages((prev) => [
        ...prev,
        {
          id: `join-${data.userId}-${Date.now()}`,
          type: 'system',
          message: data.message,
          timestamp: data.timestamp
        }
      ]);
    });

    // Another user left - we receive this, but we never see our own leave
    socket.on('user:left', (data) => {
      console.log('👤 User left:', data.username);

      // Add system message to chat
      setMessages((prev) => [
        ...prev,
        {
          id: `leave-${data.userId}-${Date.now()}`,
          type: 'system',
          message: data.message,
          timestamp: data.timestamp
        }
      ]);
    });

    // Updated list of active users
    socket.on('users:list', (users) => {
      console.log('📋 Active users:', users);
      setActiveUsers(users);
    });

    // New chat message
    socket.on('message:received', (messageData) => {
      setMessages((prev) => [
        ...prev,
        {
          ...messageData,
          type: 'message',
          isOwnMessage: messageData.userId === userId
        }
      ]);
    });

    // Typing indicator updates
    socket.on('user:typing:update', (data) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.username);
        } else {
          newSet.delete(data.username);
        }
        return newSet;
      });
    });

    // -----------------------------------------------------------------------
    // CLEANUP - Critical for preventing duplicate listeners
    // -----------------------------------------------------------------------

    return () => {
      console.log('🧹 Cleaning up socket connection...');
      isCleaningUpRef.current = true;

      if (socket) {
        // Send explicit leave event
        socket.emit('user:leave');

        // Remove all listeners
        socket.off('connect');
        socket.off('connect_error');
        socket.off('disconnect');
        socket.off('user:joined');
        socket.off('user:left');
        socket.off('users:list');
        socket.off('message:received');
        socket.off('user:typing:update');

        // Disconnect socket
        socket.disconnect();
      }

      // Reset refs
      socketRef.current = null;
      hasJoinedRef.current = false;
    };
  }, [userId, username]); // Only re-run if userId or username changes

  // -------------------------------------------------------------------------
  // SEND MESSAGE FUNCTION
  // -------------------------------------------------------------------------

  const sendMessage = useCallback((message) => {
    if (!socketRef.current || !message.trim()) return;

    socketRef.current.emit('message:send', {
      userId,
      username,
      message: message.trim()
    });
  }, [userId, username]);

  // -------------------------------------------------------------------------
  // TYPING INDICATOR FUNCTION
  // -------------------------------------------------------------------------

  const setTypingStatus = useCallback((isTyping) => {
    if (!socketRef.current) return;

    socketRef.current.emit('user:typing', {
      userId,
      username,
      isTyping
    });
  }, [userId, username]);

  // -------------------------------------------------------------------------
  // RETURN PUBLIC API
  // -------------------------------------------------------------------------

  return {
    messages,
    activeUsers,
    isConnected,
    typingUsers: Array.from(typingUsers),
    sendMessage,
    setTypingStatus
  };
};

export default useChat;
