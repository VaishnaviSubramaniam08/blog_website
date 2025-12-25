import express from "express";
import { Server } from "socket.io";
import http from "http";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.send("Chat server running");
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", ({ username, room }) => {
    socket.username = username;
    socket.room = room;

    socket.join(room);

    socket.to(room).emit("message", {
      user: "system",
      text: `${username} joined the chat`,
    });
  });

  socket.on("send_message", (data) => {
    io.to(socket.room).emit("message", {
      user: socket.username,
      text: data.text,
      time: new Date().toLocaleTimeString(),
    });
  });

  socket.on("disconnect", () => {
    if (socket.username && socket.room) {
      socket.to(socket.room).emit("message", {
        user: "system",
        text: `${socket.username} left the chat`,
      });
    }
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5002, () => {
  console.log("Server running on port 5002");
});
