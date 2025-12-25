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

  // -------------------------------------------------------------------------
  // MESSAGE SENDING
  // -------------------------------------------------------------------------

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    sendMessage(inputMessage);
    setInputMessage('');

    // Clear typing indicator when message is sent
    setTypingStatus(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  // -------------------------------------------------------------------------
  // TYPING INDICATOR WITH DEBOUNCE
  // -------------------------------------------------------------------------

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputMessage(value);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Start typing indicator
    if (value.trim()) {
      setTypingStatus(true);

      // Stop typing indicator after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus(false);
      }, 2000);
    } else {
      setTypingStatus(false);
    }
  };

  // -------------------------------------------------------------------------
  // RENDER MESSAGE ITEM
  // -------------------------------------------------------------------------

  const renderMessage = (msg) => {
    // System messages (join/leave)
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

    // Chat messages
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

  // -------------------------------------------------------------------------
  // RENDER UI
  // -------------------------------------------------------------------------

  return (
    <div className="chat-room">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <h2>Chat Room</h2>
          <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>
        <button className="leave-button" onClick={onLeave}>
          Leave Chat
        </button>
      </div>

      {/* Main Content */}
      <div className="chat-body">
        {/* Sidebar - Active Users */}
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
                  {user.username}
                  {user.userId === userId && ' (You)'}
                </span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Messages Area */}
        <main className="chat-messages">
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="no-messages">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map(renderMessage)
            )}

            {/* Typing Indicator */}
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
