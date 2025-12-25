/*
==============================================================================
COMPLETE STANDALONE CHAT APPLICATION
==============================================================================
This file contains a fully-functional real-time chat application combining:
- Backend server with Socket.IO
- Database models and controllers
- API routes
- Frontend React components with styling

To use this file:
1. Split the sections into appropriate files as needed
2. Or run as a single Node.js + React hybrid (requires build setup)

Technologies: Node.js, Express, Socket.IO, MongoDB, React, JWT
==============================================================================
*/

// ============================================================================
// BACKEND - SERVER SETUP
// ============================================================================

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.IO Server Configuration
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// ============================================================================
// DATABASE - MONGODB SCHEMA
// ============================================================================

const chatMessageSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    room: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    messageType: {
      type: String,
      enum: ["user", "system"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
chatMessageSchema.index({ room: 1, createdAt: -1 });

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

// ============================================================================
// CONTROLLERS - CHAT BUSINESS LOGIC
// ============================================================================

// Get chat messages for a room
const getChatMessages = async (req, res) => {
  const { room } = req.params;
  const limit = parseInt(req.query.limit) || 50;

  try {
    const messages = await ChatMessage.find({ room })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("userId", "name");

    const reversedMessages = messages.reverse();
    res.json(reversedMessages);
  } catch (err) {
    console.error("Error fetching chat messages:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Save chat message to database
const saveChatMessage = async (messageData) => {
  try {
    const chatMessage = new ChatMessage(messageData);
    await chatMessage.save();
    return chatMessage;
  } catch (err) {
    console.error("Error saving chat message:", err);
    throw err;
  }
};

// Delete old messages (cleanup)
const deleteOldMessages = async (req, res) => {
  const daysOld = parseInt(req.query.days) || 30;
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - daysOld);

  try {
    const result = await ChatMessage.deleteMany({
      createdAt: { $lt: dateThreshold },
      messageType: "user",
    });

    res.json({
      message: `Deleted ${result.deletedCount} messages older than ${daysOld} days`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("Error deleting old messages:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ============================================================================
// MIDDLEWARE - AUTHENTICATION
// ============================================================================

// Note: You'll need to implement this based on your auth system
const authMiddleware = (req, res, next) => {
  // Your auth logic here
  // Example: verify JWT token from cookies or headers
  next();
};

// ============================================================================
// ROUTES - API ENDPOINTS
// ============================================================================

app.get("/api/chat/messages/:room", authMiddleware, getChatMessages);
app.delete("/api/chat/cleanup", authMiddleware, deleteOldMessages);

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blogtalentio';

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
})
.then(() => {
  console.log("Connected to MongoDB successfully");
  console.log(`Database: ${MONGODB_URI}`);
})
.catch((error) => {
  console.error("MongoDB connection error:", error.message);
});

// ============================================================================
// SOCKET.IO - AUTHENTICATION MIDDLEWARE
// ============================================================================

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    socket.userId = decoded.userId;
    socket.username = decoded.name || "Anonymous";
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

// ============================================================================
// SOCKET.IO - REAL-TIME CHAT LOGIC
// ============================================================================

const roomMembers = new Map(); // Track users in each room

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.username} (${socket.id})`);

  // JOIN ROOM EVENT
  socket.on("join_room", async (room) => {
    if (!roomMembers.has(room)) {
      roomMembers.set(room, new Set());
    }

    const roomMemberSet = roomMembers.get(room);
    const isAlreadyInRoom = roomMemberSet.has(socket.userId);

    socket.join(room);
    console.log(`${socket.username} joined room: ${room}`);

    if (!isAlreadyInRoom) {
      roomMemberSet.add(socket.userId);

      const systemMessage = {
        username: "System",
        userId: socket.userId,
        room,
        message: `${socket.username} joined the chat`,
        messageType: "system",
      };

      try {
        await saveChatMessage(systemMessage);
        socket.to(room).emit("receive_message", {
          ...systemMessage,
          createdAt: new Date(),
        });
      } catch (err) {
        console.error("Error sending join message:", err);
      }
    }
  });

  // LEAVE ROOM EVENT
  socket.on("leave_room", async (room) => {
    socket.leave(room);
    console.log(`${socket.username} left room: ${room}`);

    if (roomMembers.has(room)) {
      roomMembers.get(room).delete(socket.userId);

      if (roomMembers.get(room).size === 0) {
        roomMembers.delete(room);
      }
    }

    const systemMessage = {
      username: "System",
      userId: socket.userId,
      room,
      message: `${socket.username} left the chat`,
      messageType: "system",
    };

    try {
      await saveChatMessage(systemMessage);
      socket.to(room).emit("receive_message", {
        ...systemMessage,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error("Error sending leave message:", err);
    }
  });

  // SEND MESSAGE EVENT
  socket.on("send_message", async (data) => {
    const { room, message } = data;

    if (!message || !message.trim()) {
      return;
    }

    const chatMessage = {
      username: socket.username,
      userId: socket.userId,
      room,
      message: message.trim(),
      messageType: "user",
    };

    try {
      const savedMessage = await saveChatMessage(chatMessage);

      io.to(room).emit("receive_message", {
        ...savedMessage.toObject(),
        userId: {
          _id: socket.userId,
          name: socket.username
        },
      });
    } catch (err) {
      console.error("Error sending message:", err);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // DISCONNECT EVENT
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.username} (${socket.id})`);

    for (const [room, members] of roomMembers.entries()) {
      if (members.has(socket.userId)) {
        members.delete(socket.userId);

        if (members.size === 0) {
          roomMembers.delete(room);
        }
      }
    }
  });
});

// ============================================================================
// START SERVER
// ============================================================================

httpServer.listen(5001, () => {
  console.log('Server started on port 5001');
  console.log('Socket.IO server ready');
});

export default app;

// ============================================================================
// FRONTEND - REACT COMPONENT (ChatPopup.js)
// ============================================================================

/*
// Copy this section into: frontend/src/components/ChatPopup.js

import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

function ChatPopup({ room, roomTitle, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const messagesEndRef = useRef(null);
  const hasJoinedRoomRef = useRef(false);
  const socketRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (socketRef.current) {
      return;
    }

    const initializeChat = async () => {
      try {
        // Fetch chat token from backend
        const tokenRes = await fetch("http://localhost:5001/api/users/chat-token", {
          method: "GET",
          credentials: "include",
        });

        if (!tokenRes.ok) {
          setConnectionError("Authentication failed");
          return;
        }

        const { chatToken } = await tokenRes.json();

        // Connect to Socket.IO
        const newSocket = io("http://localhost:5001", {
          auth: { token: chatToken },
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
        });

        newSocket.on("connect", () => {
          setIsConnected(true);
          setConnectionError("");

          if (!hasJoinedRoomRef.current) {
            newSocket.emit("join_room", room);
            hasJoinedRoomRef.current = true;
          }
        });

        newSocket.on("connect_error", (err) => {
          setIsConnected(false);
          setConnectionError(err.message);
        });

        newSocket.on("receive_message", (message) => {
          setMessages((prev) => {
            const isDuplicate = prev.some((m) => {
              if (m.messageType === "system" && message.messageType === "system") {
                return m.message === message.message &&
                       Math.abs(new Date(m.createdAt) - new Date(message.createdAt)) < 1000;
              }
              return m._id && message._id && m._id === message._id;
            });
            if (isDuplicate) return prev;
            return [...prev, message];
          });
        });

        newSocket.on("disconnect", () => {
          setIsConnected(false);
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        // Fetch previous messages
        fetch(`http://localhost:5001/api/chat/messages/${room}`, {
          credentials: "include",
        })
          .then((res) => res.json())
          .then((data) => setMessages(data))
          .catch((err) => console.error("Error fetching messages:", err));

      } catch (error) {
        setConnectionError("Failed to connect to chat");
      }
    };

    initializeChat();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave_room", room);
        socketRef.current.disconnect();
        socketRef.current = null;
        hasJoinedRoomRef.current = false;
      }
    };
  }, [room]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !socket || !isConnected) {
      return;
    }

    socket.emit("send_message", {
      room,
      message: newMessage.trim(),
    });

    setNewMessage("");
  };

  const getInitials = (name) => {
    return name
      ? name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
      : "U";
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <style>{chatStyles}</style>
      <div className="chat-popup">
        <div className="chat-header">
          <div>
            <h3>{roomTitle}</h3>
            <span className={`status-indicator ${isConnected ? "online" : "offline"}`}>
              {isConnected ? "● Online" : "○ Offline"}
            </span>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="chat-messages">
          {connectionError && (
            <div className="error-message">⚠️ {connectionError}</div>
          )}
          {messages.length === 0 ? (
            <p className="empty-state">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((msg, index) => {
              const msgUserId = typeof msg.userId === 'object' ? msg.userId?._id : msg.userId;
              const isOwnMessage = msgUserId?.toString() === currentUser._id?.toString();
              const isSystemMessage = msg.messageType === "system";

              if (isSystemMessage) {
                return (
                  <div key={index} className="system-message">{msg.message}</div>
                );
              }

              return (
                <div key={index} className={`message-wrapper ${isOwnMessage ? "own" : "other"}`}>
                  {!isOwnMessage && (
                    <div className="avatar">{getInitials(msg.userId?.name || msg.username)}</div>
                  )}
                  <div className={`message ${isOwnMessage ? "own" : "other"}`}>
                    {!isOwnMessage && (
                      <div className="message-username">{msg.userId?.name || msg.username}</div>
                    )}
                    <div className="message-text">{msg.message}</div>
                    <div className="message-time">{formatTime(msg.createdAt)}</div>
                  </div>
                  {isOwnMessage && (
                    <div className="avatar own">{getInitials(currentUser.name)}</div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={!isConnected}
          />
          <button type="submit" disabled={!isConnected || !newMessage.trim()}>
            Send
          </button>
        </form>
      </div>
    </>
  );
}

const chatStyles = `
  .chat-popup {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 380px;
    height: 550px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    z-index: 9999;
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .chat-header {
    padding: 16px 20px;
    background: linear-gradient(135deg, #4a6cff 0%, #3a5ce5 100%);
    color: white;
    border-radius: 16px 16px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .chat-header h3 { margin: 0; font-size: 1.1rem; font-weight: 700; }
  .status-indicator { font-size: 0.75rem; opacity: 0.9; display: block; margin-top: 4px; }
  .status-indicator.online { color: #26de81; }
  .status-indicator.offline { color: #ff6b6b; }

  .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.2s;
  }

  .close-btn:hover { background: rgba(255, 255, 255, 0.2); }

  .chat-messages {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background: #f8f9fc;
  }

  .empty-state { text-align: center; color: #95a5a6; margin-top: 40%; font-size: 0.9rem; }
  .error-message {
    background: #fff5f5;
    color: #ff4757;
    padding: 12px;
    border-radius: 8px;
    text-align: center;
    font-size: 0.9rem;
    margin-bottom: 10px;
  }

  .message-wrapper {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
    align-items: flex-end;
  }

  .message-wrapper.own { flex-direction: row-reverse; }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4a6cff 0%, #6a8cff 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .avatar.own { background: linear-gradient(135deg, #26de81 0%, #20bf6b 100%); }

  .message {
    max-width: 70%;
    padding: 10px 14px;
    border-radius: 16px;
    word-wrap: break-word;
  }

  .message.other {
    background: white;
    border-bottom-left-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .message.own {
    background: linear-gradient(135deg, #4a6cff 0%, #5a7cff 100%);
    color: white;
    border-bottom-right-radius: 4px;
  }

  .message-username {
    font-size: 0.75rem;
    font-weight: 600;
    color: #4a6cff;
    margin-bottom: 4px;
  }

  .message-text { font-size: 0.9rem; line-height: 1.4; }
  .message-time { font-size: 0.7rem; opacity: 0.7; margin-top: 4px; }
  .system-message {
    text-align: center;
    font-size: 0.8rem;
    color: #95a5a6;
    margin: 12px 0;
    font-style: italic;
  }

  .chat-input {
    padding: 16px;
    border-top: 1px solid #edf2f7;
    display: flex;
    gap: 10px;
    background: white;
    border-radius: 0 0 16px 16px;
  }

  .chat-input input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid #e0e0e0;
    border-radius: 24px;
    font-size: 0.9rem;
    outline: none;
    transition: border 0.2s;
  }

  .chat-input input:focus { border-color: #4a6cff; }
  .chat-input input:disabled { background: #f5f5f5; cursor: not-allowed; }

  .chat-input button {
    padding: 12px 24px;
    background: linear-gradient(135deg, #4a6cff 0%, #3a5ce5 100%);
    color: white;
    border: none;
    border-radius: 24px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .chat-input button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(74, 108, 255, 0.4);
  }

  .chat-input button:disabled { opacity: 0.5; cursor: not-allowed; }

  @media (max-width: 768px) {
    .chat-popup { width: 100%; height: 100%; bottom: 0; right: 0; border-radius: 0; }
    .chat-header, .chat-input { border-radius: 0; }
  }
`;

export default ChatPopup;
*/

// ============================================================================
// FRONTEND - CUSTOM HOOK (useChat.js)
// ============================================================================

/*
// Copy this section into: src/hooks/useChat.js

import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:4000';

export const useChat = (userId, username) => {
  const socketRef = useRef(null);
  const hasJoinedRef = useRef(false);
  const isCleaningUpRef = useRef(false);

  const [messages, setMessages] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());

  useEffect(() => {
    if (socketRef.current) return;

    const socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
      auth: { userId, username }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      if (!hasJoinedRef.current && !isCleaningUpRef.current) {
        socket.emit('user:join', { userId, username });
        hasJoinedRef.current = true;
      }
    });

    socket.on('connect_error', (error) => {
      setIsConnected(false);
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
    });

    socket.on('user:joined', (data) => {
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

    socket.on('user:left', (data) => {
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

    socket.on('users:list', (users) => {
      setActiveUsers(users);
    });

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

    return () => {
      isCleaningUpRef.current = true;
      if (socket) {
        socket.emit('user:leave');
        socket.disconnect();
      }
      socketRef.current = null;
      hasJoinedRef.current = false;
    };
  }, [userId, username]);

  const sendMessage = useCallback((message) => {
    if (!socketRef.current || !message.trim()) return;
    socketRef.current.emit('message:send', {
      userId,
      username,
      message: message.trim()
    });
  }, [userId, username]);

  const setTypingStatus = useCallback((isTyping) => {
    if (!socketRef.current) return;
    socketRef.current.emit('user:typing', {
      userId,
      username,
      isTyping
    });
  }, [userId, username]);

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
*/

// ============================================================================
// FRONTEND - FULL CHAT ROOM COMPONENT (ChatRoom.jsx)
// ============================================================================

/*
// Copy this section into: src/components/ChatRoom.jsx

import React, { useState, useRef, useEffect } from 'react';
import useChat from '../hooks/useChat';
import './ChatRoom.css';

const ChatRoom = ({ userId, username, onLeave }) => {
  const {
    messages,
    activeUsers,
    isConnected,
    typingUsers,
    sendMessage,
    setTypingStatus
  } = useChat(userId, username);

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendMessage(inputMessage);
    setInputMessage('');
    setTypingStatus(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputMessage(value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (value.trim()) {
      setTypingStatus(true);
      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus(false);
      }, 2000);
    } else {
      setTypingStatus(false);
    }
  };

  const renderMessage = (msg) => {
    if (msg.type === 'system') {
      return (
        <div key={msg.id} className="message-system">
          <span className="system-text">{msg.message}</span>
          <span className="system-time">
            {new Date(msg.timestamp).toLocaleTimeString()}
          </span>
        </div>
      );
    }

    return (
      <div
        key={msg.id}
        className={`message ${msg.isOwnMessage ? 'message-own' : 'message-other'}`}
      >
        <div className="message-header">
          <span className="message-username">{msg.username}</span>
          <span className="message-time">
            {new Date(msg.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div className="message-content">{msg.message}</div>
      </div>
    );
  };

  return (
    <div className="chat-room">
      <div className="chat-header">
        <div className="chat-header-left">
          <h2>Chat Room</h2>
          <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>
        <button className="leave-button" onClick={onLeave}>Leave Chat</button>
      </div>

      <div className="chat-body">
        <aside className="chat-sidebar">
          <h3>Active Users ({activeUsers.length})</h3>
          <ul className="users-list">
            {activeUsers.map((user) => (
              <li
                key={user.userId}
                className={user.userId === userId ? 'user-self' : 'user-other'}
              >
                <span className="user-indicator">🟢</span>
                <span className="user-name">
                  {user.username}{user.userId === userId && ' (You)'}
                </span>
              </li>
            ))}
          </ul>
        </aside>

        <main className="chat-messages">
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="no-messages">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map(renderMessage)
            )}

            {typingUsers.length > 0 && (
              <div className="typing-indicator">
                <span className="typing-text">
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="message-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="message-input"
              placeholder="Type a message..."
              value={inputMessage}
              onChange={handleInputChange}
              disabled={!isConnected}
            />
            <button
              type="submit"
              className="send-button"
              disabled={!isConnected || !inputMessage.trim()}
            >
              Send
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default ChatRoom;
*/

// ============================================================================
// COMPLETE CSS STYLES (ChatRoom.css)
// ============================================================================

/*
// Copy this section into: src/components/ChatRoom.css

.chat-room {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
  background: #ffffff;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #2563eb;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chat-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.chat-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.connection-status {
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.1);
}

.connection-status.connected {
  background: rgba(34, 197, 94, 0.2);
}

.connection-status.disconnected {
  background: rgba(239, 68, 68, 0.2);
}

.leave-button {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

.leave-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.chat-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.chat-sidebar {
  width: 250px;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  padding: 1.5rem;
  overflow-y: auto;
}

.chat-sidebar h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.users-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.users-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem;
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
  transition: background 0.2s;
}

.users-list li.user-self {
  background: #dbeafe;
  font-weight: 500;
}

.users-list li.user-other:hover {
  background: #f1f5f9;
}

.user-indicator {
  font-size: 0.75rem;
}

.user-name {
  font-size: 0.875rem;
  color: #334155;
}

.chat-messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.messages-container {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.no-messages {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
  font-size: 1rem;
}

.message-system {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f1f5f9;
  border-radius: 0.5rem;
  margin: 0.5rem 0;
}

.system-text {
  font-size: 0.875rem;
  color: #64748b;
  font-style: italic;
}

.system-time {
  font-size: 0.75rem;
  color: #94a3b8;
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message-own {
  align-self: flex-end;
  background: #2563eb;
  color: white;
  border-bottom-right-radius: 0.25rem;
}

.message-other {
  align-self: flex-start;
  background: #f1f5f9;
  color: #1e293b;
  border-bottom-left-radius: 0.25rem;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
  gap: 1rem;
}

.message-username {
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0.8;
}

.message-time {
  font-size: 0.625rem;
  opacity: 0.6;
}

.message-content {
  font-size: 0.9375rem;
  line-height: 1.5;
  word-wrap: break-word;
}

.typing-indicator {
  padding: 0.5rem 1rem;
  align-self: flex-start;
}

.typing-text {
  font-size: 0.875rem;
  color: #64748b;
  font-style: italic;
}

.message-input-form {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.message-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  outline: none;
  transition: border-color 0.2s;
}

.message-input:focus {
  border-color: #2563eb;
}

.message-input:disabled {
  background: #f1f5f9;
  cursor: not-allowed;
}

.send-button {
  padding: 0.75rem 1.5rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.send-button:hover:not(:disabled) {
  background: #1d4ed8;
}

.send-button:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.messages-container::-webkit-scrollbar,
.chat-sidebar::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-thumb,
.chat-sidebar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

@media (max-width: 768px) {
  .chat-sidebar {
    display: none;
  }
  .message {
    max-width: 85%;
  }
  .chat-header h2 {
    font-size: 1.25rem;
  }
}
*/

// ============================================================================
// PACKAGE.JSON DEPENDENCIES
// ============================================================================

/*
{
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2",
    "socket.io-client": "^4.7.2",
    "mongoose": "^7.0.0",
    "jsonwebtoken": "^9.0.0",
    "cors": "^2.8.5",
    "cookie-parser": "^1.4.6",
    "dotenv": "^16.0.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
*/
