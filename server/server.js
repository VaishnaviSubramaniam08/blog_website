import express from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 1e8, // 100 MB for file uploads
});

// Store active users and rooms
const activeUsers = new Map(); // socketId -> {username, room, userId}
const roomMessages = new Map(); // room -> messages[]
const typingUsers = new Map(); // room -> Set of usernames

app.get("/", (req, res) => {
  res.send("Chat server running");
});

// Get room history
app.get("/api/rooms/:room/messages", (req, res) => {
  const { room } = req.params;
  const messages = roomMessages.get(room) || [];
  res.json(messages);
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User joins with username
  socket.on("join", ({ username, room, userId }) => {
    socket.username = username;
    socket.room = room;
    socket.userId = userId;

    socket.join(room);

    // Store active user
    activeUsers.set(socket.id, { username, room, userId });

    // Send existing messages to the new user
    const existingMessages = roomMessages.get(room) || [];
    socket.emit("message_history", existingMessages);

    // Get all users in the room
    const usersInRoom = getUsersInRoom(room);

    // Notify room about new user
    const joinMessage = {
      id: Date.now().toString(),
      user: "system",
      text: `${username} joined the chat`,
      time: new Date().toISOString(),
      type: "system",
    };

    // Save system message
    saveMessage(room, joinMessage);

    // Broadcast to room
    io.to(room).emit("message", joinMessage);
    io.to(room).emit("user_list", usersInRoom);
  });

  // Receive chat message
  socket.on("send_message", (data) => {
    const messageData = {
      id: Date.now().toString() + Math.random(),
      user: socket.username,
      userId: socket.userId,
      text: data.text,
      time: new Date().toISOString(),
      type: "text",
      reactions: {},
    };

    // Save message
    saveMessage(socket.room, messageData);

    // Broadcast to room
    io.to(socket.room).emit("message", messageData);
  });

  // Private message
  socket.on("private_message", ({ toUserId, text }) => {
    const recipient = Array.from(activeUsers.entries()).find(
      ([_, userData]) => userData.userId === toUserId
    );

    if (recipient) {
      const [recipientSocketId] = recipient;
      const messageData = {
        id: Date.now().toString() + Math.random(),
        user: socket.username,
        userId: socket.userId,
        text,
        time: new Date().toISOString(),
        type: "private",
        from: socket.userId,
        to: toUserId,
      };

      // Send to recipient
      io.to(recipientSocketId).emit("private_message", messageData);
      // Send back to sender
      socket.emit("private_message", messageData);
    }
  });

  // Typing indicator
  socket.on("typing_start", () => {
    if (!socket.room || !socket.username) return;

    if (!typingUsers.has(socket.room)) {
      typingUsers.set(socket.room, new Set());
    }
    typingUsers.get(socket.room).add(socket.username);

    socket.to(socket.room).emit("user_typing", {
      username: socket.username,
      isTyping: true,
    });
  });

  socket.on("typing_stop", () => {
    if (!socket.room || !socket.username) return;

    if (typingUsers.has(socket.room)) {
      typingUsers.get(socket.room).delete(socket.username);
    }

    socket.to(socket.room).emit("user_typing", {
      username: socket.username,
      isTyping: false,
    });
  });

  // File upload
  socket.on("send_file", ({ fileName, fileData, fileType }) => {
    const fileId = Date.now().toString() + Math.random();
    const filePath = path.join(uploadsDir, fileId + "-" + fileName);

    // Save file
    fs.writeFileSync(filePath, Buffer.from(fileData));

    const messageData = {
      id: fileId,
      user: socket.username,
      userId: socket.userId,
      text: fileName,
      time: new Date().toISOString(),
      type: "file",
      fileType,
      fileUrl: `http://localhost:5002/uploads/${fileId}-${fileName}`,
      reactions: {},
    };

    // Save message
    saveMessage(socket.room, messageData);

    // Broadcast to room
    io.to(socket.room).emit("message", messageData);
  });

  // Message reactions
  socket.on("add_reaction", ({ messageId, emoji }) => {
    const messages = roomMessages.get(socket.room) || [];
    const message = messages.find((m) => m.id === messageId);

    if (message) {
      if (!message.reactions) message.reactions = {};
      if (!message.reactions[emoji]) message.reactions[emoji] = [];

      if (!message.reactions[emoji].includes(socket.username)) {
        message.reactions[emoji].push(socket.username);
        io.to(socket.room).emit("reaction_update", {
          messageId,
          reactions: message.reactions,
        });
      }
    }
  });

  socket.on("remove_reaction", ({ messageId, emoji }) => {
    const messages = roomMessages.get(socket.room) || [];
    const message = messages.find((m) => m.id === messageId);

    if (message && message.reactions && message.reactions[emoji]) {
      message.reactions[emoji] = message.reactions[emoji].filter(
        (user) => user !== socket.username
      );

      if (message.reactions[emoji].length === 0) {
        delete message.reactions[emoji];
      }

      io.to(socket.room).emit("reaction_update", {
        messageId,
        reactions: message.reactions,
      });
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    if (socket.username && socket.room) {
      // Remove from active users
      activeUsers.delete(socket.id);

      // Remove from typing
      if (typingUsers.has(socket.room)) {
        typingUsers.get(socket.room).delete(socket.username);
      }

      // Notify room
      const leaveMessage = {
        id: Date.now().toString(),
        user: "system",
        text: `${socket.username} left the chat`,
        time: new Date().toISOString(),
        type: "system",
      };

      saveMessage(socket.room, leaveMessage);
      socket.to(socket.room).emit("message", leaveMessage);

      // Update user list
      const usersInRoom = getUsersInRoom(socket.room);
      io.to(socket.room).emit("user_list", usersInRoom);
    }
    console.log("User disconnected:", socket.id);
  });
});

// Helper functions
function getUsersInRoom(room) {
  const users = [];
  for (const [socketId, userData] of activeUsers.entries()) {
    if (userData.room === room) {
      users.push({
        userId: userData.userId,
        username: userData.username,
        socketId,
      });
    }
  }
  return users;
}

function saveMessage(room, message) {
  if (!roomMessages.has(room)) {
    roomMessages.set(room, []);
  }
  const messages = roomMessages.get(room);
  messages.push(message);

  // Keep only last 100 messages per room
  if (messages.length > 100) {
    messages.shift();
  }
}

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
