import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
function ChatPopup({ room, roomTitle, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const messagesEndRef = useRef(null);
  const hasJoinedRoomRef = useRef(false); // Persist across reconnections
  const socketRef = useRef(null); // Persist socket instance
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    // Prevent duplicate initialization in React Strict Mode
    if (socketRef.current) {
      console.log("Socket already initialized, skipping...");
      return;
    }

    console.log("Initializing chat connection to room:", room);
    console.log("Current user:", currentUser);

    const initializeChat = async () => {
      try {
        // Fetch chat token from backend
        const tokenRes = await fetch("http://localhost:5001/api/users/chat-token", {
          method: "GET",
          credentials: "include",
        });

        if (!tokenRes.ok) {
          console.error("Failed to get chat token");
          setConnectionError("Authentication failed");
          return;
        }

        const { chatToken } = await tokenRes.json();
        console.log("Chat token received");

        // Connect to Socket.IO with token
        const newSocket = io("http://localhost:5001", {
          auth: { token: chatToken },
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
        });

        newSocket.on("connect", () => {
          console.log("✅ Connected to chat server");
          setIsConnected(true);
          setConnectionError("");

          // Only join room once per session (not per reconnection)
          if (!hasJoinedRoomRef.current) {
            console.log("Joining room:", room);
            newSocket.emit("join_room", room);
            hasJoinedRoomRef.current = true;
          } else {
            console.log("Already joined room, skipping join_room emit");
          }
        });

        newSocket.on("connect_error", (err) => {
          console.error("❌ Connection error:", err.message);
          setIsConnected(false);
          setConnectionError(err.message);
        });

        newSocket.on("receive_message", (message) => {
          console.log("📩 Message received:", message);
          setMessages((prev) => {
            // Prevent duplicate messages using unique identifiers
            const isDuplicate = prev.some(
              (m) => {
                // For system messages, check message + timestamp
                if (m.messageType === "system" && message.messageType === "system") {
                  return m.message === message.message &&
                         Math.abs(new Date(m.createdAt) - new Date(message.createdAt)) < 1000;
                }
                // For regular messages, use _id if available
                return m._id && message._id && m._id === message._id;
              }
            );
            if (isDuplicate) {
              console.log("Duplicate message detected, skipping");
              return prev;
            }
            return [...prev, message];
          });
        });

        newSocket.on("error", (error) => {
          console.error("Socket error:", error);
        });

        newSocket.on("disconnect", () => {
          console.log("Disconnected from chat server");
          setIsConnected(false);
          // Don't reset hasJoinedRoomRef here - we stay joined to the room
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        // Fetch previous messages
        fetch(`http://localhost:5001/api/chat/messages/${room}`, {
          credentials: "include",
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("📜 Previous messages loaded:", data.length);
            setMessages(data);
          })
          .catch((err) => console.error("Error fetching messages:", err));

      } catch (error) {
        console.error("Error initializing chat:", error);
        setConnectionError("Failed to connect to chat");
      }
    };

    initializeChat();

    // Cleanup function
    return () => {
      if (socketRef.current) {
        console.log("Cleanup: Leaving room and disconnecting...");
        socketRef.current.emit("leave_room", room);
        socketRef.current.off("connect");
        socketRef.current.off("connect_error");
        socketRef.current.off("receive_message");
        socketRef.current.off("error");
        socketRef.current.off("disconnect");
        socketRef.current.disconnect();
        socketRef.current = null;
        hasJoinedRoomRef.current = false; // Reset for next mount
      }
    };
  }, [room]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .substring(0, 2)
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
        {/* Header */}
        <div className="chat-header">
          <div>
            <h3>{roomTitle}</h3>
            <span className={`status-indicator ${isConnected ? "online" : "offline"}`}>
              {isConnected ? "● Online" : "○ Offline"}
            </span>
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {connectionError && (
            <div className="error-message">
              ⚠️ {connectionError}
            </div>
          )}
          {messages.length === 0 ? (
            <p className="empty-state">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((msg, index) => {
              // Handle both formats: populated userId object and plain ObjectId string
              const msgUserId = typeof msg.userId === 'object' ? msg.userId?._id : msg.userId;
              const isOwnMessage = msgUserId?.toString() === currentUser._id?.toString();
              const isSystemMessage = msg.messageType === "system";

              if (isSystemMessage) {
                return (
                  <div key={index} className="system-message">
                    {msg.message}
                  </div>
                );
              }

              return (
                <div
                  key={index}
                  className={`message-wrapper ${isOwnMessage ? "own" : "other"}`}
                >
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

        {/* Input */}
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
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
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

  .chat-header h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
  }

  .status-indicator {
    font-size: 0.75rem;
    opacity: 0.9;
    display: block;
    margin-top: 4px;
  }

  .status-indicator.online {
    color: #26de81;
  }

  .status-indicator.offline {
    color: #ff6b6b;
  }

  .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.2s;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .chat-messages {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background: #f8f9fc;
  }

  .chat-messages::-webkit-scrollbar {
    width: 6px;
  }

  .chat-messages::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }

  .empty-state {
    text-align: center;
    color: #95a5a6;
    margin-top: 40%;
    font-size: 0.9rem;
  }

  .error-message {
    background: #fff5f5;
    color: #ff4757;
    padding: 12px;
    border-radius: 8px;
    text-align: center;
    font-size: 0.9rem;
    margin-bottom: 10px;
    border: 1px solid #ffdddd;
  }

  .message-wrapper {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
    align-items: flex-end;
  }

  .message-wrapper.own {
    flex-direction: row-reverse;
  }

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
    flex-shrink: 0;
  }

  .avatar.own {
    background: linear-gradient(135deg, #26de81 0%, #20bf6b 100%);
  }

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

  .message-text {
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .message-time {
    font-size: 0.7rem;
    opacity: 0.7;
    margin-top: 4px;
  }

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

  .chat-input input:focus {
    border-color: #4a6cff;
  }

  .chat-input input:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }

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

  .chat-input button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .chat-popup {
      width: 100%;
      height: 100%;
      bottom: 0;
      right: 0;
      border-radius: 0;
    }

    .chat-header {
      border-radius: 0;
    }

    .chat-input {
      border-radius: 0;
    }
  }
`;

export default ChatPopup;
