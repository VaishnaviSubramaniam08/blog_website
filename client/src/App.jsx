import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:5002");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("general");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [notifications, setNotifications] = useState(true);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const userId = useRef(Date.now().toString() + Math.random()).current;

  const emojis = ["👍", "❤️", "😂", "😮", "😢", "🎉", "🔥", "👏"];

  useEffect(() => {
  
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

  
    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);

     
      if (
        notifications &&
        document.hidden &&
        data.type !== "system" &&
        data.userId !== userId
      ) {
        showNotification(data.user, data.text);
      }
    });

    socket.on("message_history", (history) => {
      setMessages(history);
    });

    socket.on("user_list", (userList) => {
      setUsers(userList.filter((u) => u.userId !== userId));
    });

    socket.on("user_typing", ({ username, isTyping }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(username);
        } else {
          newSet.delete(username);
        }
        return newSet;
      });
    });

   
    socket.on("private_message", (data) => {
      setMessages((prev) => [...prev, data]);
      if (notifications && document.hidden && data.userId !== userId) {
        showNotification(`${data.user} (Private)`, data.text);
      }
    });

    // Reaction updates
    socket.on("reaction_update", ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, reactions } : msg
        )
      );
    });

    return () => {
      socket.off("message");
      socket.off("message_history");
      socket.off("user_list");
      socket.off("user_typing");
      socket.off("private_message");
      socket.off("reaction_update");
    };
  }, [notifications, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const showNotification = (title, body) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/chat-icon.png",
        tag: "chat-notification",
      });
    }
  };

  const joinChat = () => {
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }
    socket.emit("join", { username, room, userId });
    setJoined(true);
  };

  const handleTyping = () => {
    socket.emit("typing_start");

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_stop");
    }, 1000);
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    if (selectedUser) {
      // Send private message
      socket.emit("private_message", {
        toUserId: selectedUser.userId,
        text: message,
      });
    } else {
      // Send public message
      socket.emit("send_message", { text: message });
    }

    socket.emit("typing_stop");
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileData = event.target.result.split(",")[1]; // Remove data URL prefix
      socket.emit("send_file", {
        fileName: file.name,
        fileData,
        fileType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const addReaction = (messageId, emoji) => {
    socket.emit("add_reaction", { messageId, emoji });
    setShowEmojiPicker(null);
  };

  const renderMessage = (msg, index) => {
    const isOwnMessage = msg.userId === userId;
    const isPrivate = msg.type === "private";
    const isSystem = msg.type === "system";

    if (isSystem) {
      return (
        <div key={index} className="system-message">
          {msg.text}
        </div>
      );
    }

    return (
      <div
        key={index}
        className={`message ${isOwnMessage ? "own-message" : ""} ${
          isPrivate ? "private-message" : ""
        }`}
      >
        <div className="message-header">
          <strong>{msg.user}</strong>
          {isPrivate && <span className="private-badge">Private</span>}
          <span className="time">
            {new Date(msg.time).toLocaleTimeString()}
          </span>
        </div>

        {msg.type === "file" ? (
          <div className="file-message">
            {msg.fileType?.startsWith("image/") ? (
              <img src={msg.fileUrl} alt={msg.text} className="shared-image" />
            ) : (
              <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                📎 {msg.text}
              </a>
            )}
          </div>
        ) : (
          <div className="message-text">{msg.text}</div>
        )}

        <div className="message-footer">
          <div className="reactions">
            {msg.reactions &&
              Object.entries(msg.reactions).map(([emoji, users]) => (
                <span
                  key={emoji}
                  className="reaction"
                  onClick={() => addReaction(msg.id, emoji)}
                  title={users.join(", ")}
                >
                  {emoji} {users.length}
                </span>
              ))}
          </div>

          <button
            className="emoji-button"
            onClick={() =>
              setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)
            }
          >
            +
          </button>

          {showEmojiPicker === msg.id && (
            <div className="emoji-picker">
              {emojis.map((emoji) => (
                <span
                  key={emoji}
                  className="emoji-option"
                  onClick={() => addReaction(msg.id, emoji)}
                >
                  {emoji}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!joined) {
    return (
      <div className="join-container">
        <div className="join-card">
          <h1>💬 Chat App</h1>
          <h2>Join a Chat Room</h2>
          <input
            className="input"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && joinChat()}
          />
          <input
            className="input"
            placeholder="Room name"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && joinChat()}
          />
          <button className="button" onClick={joinChat}>
            Join Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>Room: {room}</h3>
        </div>

        <div className="user-list">
          <h4>Online Users ({users.length})</h4>
          {users.map((user) => (
            <div
              key={user.userId}
              className={`user-item ${
                selectedUser?.userId === user.userId ? "selected" : ""
              }`}
              onClick={() =>
                setSelectedUser(
                  selectedUser?.userId === user.userId ? null : user
                )
              }
            >
              <span className="online-indicator"></span>
              {user.username}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <label className="notification-toggle">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
            Notifications
          </label>
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-header">
          <h2>
            {selectedUser ? `Private chat with ${selectedUser.username}` : room}
          </h2>
          {selectedUser && (
            <button
              className="close-dm"
              onClick={() => setSelectedUser(null)}
            >
              ✕
            </button>
          )}
        </div>

        <div className="messages">
          {messages
            .filter((msg) => {
              if (selectedUser) {
                return (
                  msg.type === "private" &&
                  ((msg.from === userId && msg.to === selectedUser.userId) ||
                    (msg.from === selectedUser.userId && msg.to === userId))
                );
              }
              return msg.type !== "private";
            })
            .map(renderMessage)}

          {typingUsers.size > 0 && !selectedUser && (
            <div className="typing-indicator">
              {Array.from(typingUsers).join(", ")} {typingUsers.size === 1 ? "is" : "are"} typing...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: "none" }}
            onChange={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />

          <button
            className="icon-button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload file"
          >
            📎
          </button>

          <input
            className="message-input"
            value={message}
            placeholder={
              selectedUser
                ? `Message ${selectedUser.username}...`
                : "Type a message..."
            }
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
          />

          <button className="send-button" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
