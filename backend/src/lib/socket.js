// socket.js
import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

// this is for storing online users: { userId: socketId }
const userSocketMap = {};

// apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

// we will use this function to check if the user is online or not
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  try {
    const fullName = socket?.user?.fullName ?? "Unknown";
    console.log("A user connected", fullName);

    const userId = socket.userId;
    if (!userId) {
      console.warn("Connected socket missing userId — disconnecting");
      socket.disconnect(true);
      return;
    }

    // save mapping and join personal room
    userSocketMap[userId] = socket.id;
    socket.join(userId);

    // broadcast current online users to everyone
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Enhanced group room joining with automatic rejoining of user's groups
    socket.on("joinGroup", (groupId) => {
      if (!groupId) return;
      const roomName = `group_${groupId}`;
      socket.join(roomName);
      console.log(`User ${fullName} joined group room: ${roomName}`);
    });

    socket.on("leaveGroup", (groupId) => {
      if (!groupId) return;
      const roomName = `group_${groupId}`;
      socket.leave(roomName);
      console.log(`User ${fullName} left group room: ${roomName}`);
    });

    // Automatically join all user's groups on connection
    socket.on("joinUserGroups", async (groupIds) => {
      if (groupIds && Array.isArray(groupIds)) {
        groupIds.forEach(groupId => {
          const roomName = `group_${groupId}`;
          socket.join(roomName);
          console.log(`User ${fullName} auto-joined group room: ${roomName}`);
        });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("A user disconnected", fullName, "reason:", reason);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });

  } catch (err) {
    console.error("Error during socket connection handling:", err);
  }
});

export { io, app, server };