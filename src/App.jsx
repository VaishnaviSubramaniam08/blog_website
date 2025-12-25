import React, { useState } from 'react';
import ChatRoom from './components/ChatRoom';
import './App.css';

/**
 * Main App Component
 * Handles user authentication/setup before entering chat
 */
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState('');

  // -------------------------------------------------------------------------
  // JOIN CHAT
  // -------------------------------------------------------------------------

  const handleJoinChat = (e) => {
    e.preventDefault();

    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }

    // Generate unique user ID (in production, use proper auth)
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    setCurrentUser({
      userId,
      username: username.trim()
    });
  };

  // -------------------------------------------------------------------------
  // LEAVE CHAT
  // -------------------------------------------------------------------------

  const handleLeaveChat = () => {
    setCurrentUser(null);
    setUsername('');
  };

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------

  // Show chat room if user is logged in
  if (currentUser) {
    return (
      <ChatRoom
        userId={currentUser.userId}
        username={currentUser.username}
        onLeave={handleLeaveChat}
      />
    );
  }


  return (
    <div className="app-container">
      <div className="login-card">
        <h1>Real-Time Chat</h1>
        <p className="login-subtitle">Enter your username to join the chat</p>

        <form onSubmit={handleJoinChat} className="login-form">
          <input
            type="text"
            placeholder="Enter username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="username-input"
            maxLength={20}
            autoFocus
          />

          <button type="submit" className="join-button">
            Join Chat
          </button>
        </form>

        <div className="features-list">
          <h3>Features:</h3>
          <ul>
            <li>✅ No duplicate join/leave messages</li>
            <li>✅ No self join/leave notifications</li>
            <li>✅ Handles reconnections gracefully</li>
            <li>✅ Real-time typing indicators</li>
            <li>✅ Active user list</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
