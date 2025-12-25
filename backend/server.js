import userroutes from './routes/userroutes.js';
import express from 'express';
import cookieParser from "cookie-parser";
import blogroutes from './routes/blogroutes.js';
import chatRoutes from './routes/chatRoutes.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from "cors";
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { saveChatMessage } from './controllers/chatController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const httpServer = createServer(app);


const io = new Server(httpServer, {
  cors: {
    origin: "https://blog-website-frontend-3bs9.onrender.com",
    credentials: true,
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "https://blog-website-frontend-3bs9.onrender.com",
  credentials: true
}));


app.use('/uploads', express.static('uploads'));

app.use('/api/users', userroutes);
app.use('/api/blogs', blogroutes);
app.use('/api/chat', chatRoutes); 

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in environment variables");
  process.exit(1);
}

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


const roomMembers = new Map(); 


io.on("connection", (socket) => {
  console.log(`User connected: ${socket.username} (${socket.id})`);

  socket.on("join_room", async (room) => {
  
    if (!roomMembers.has(room)) {
      roomMembers.set(room, new Set());
    }

    const roomMemberSet = roomMembers.get(room);
    const isAlreadyInRoom = roomMemberSet.has(socket.userId);

    socket.join(room);
    console.log(`${socket.username} joined room: ${room} (already in room: ${isAlreadyInRoom})`);

   
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
        console.log(`Broadcasted join message to room ${room} (excluding ${socket.username})`);
      } catch (err) {
        console.error("Error sending join message:", err);
      }
    } else {
      console.log(`${socket.username} already in room ${room}, skipping join message`);
    }
  });


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
      console.log(`Broadcasted leave message to room ${room} (excluding ${socket.username})`);
    } catch (err) {
      console.error("Error sending leave message:", err);
    }
  });


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


  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.username} (${socket.id})`);

    for (const [room, members] of roomMembers.entries()) {
      if (members.has(socket.userId)) {
        members.delete(socket.userId);
        console.log(`Removed ${socket.username} from room ${room} on disconnect`);

       

        if (members.size === 0) {
          roomMembers.delete(room);
        }
      }
    }
  });
});

httpServer.listen(5001, () => {
    console.log('Server started on port 5001');
    console.log('Socket.IO server ready');
});

export default app;