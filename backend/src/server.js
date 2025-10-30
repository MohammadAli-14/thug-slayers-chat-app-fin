// backend/src/server.js
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.routes.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import cors from "cors";
import { app, server } from "./lib/socket.js";
import { removeUnverifiedAccounts } from "./automation/removeUnverifiedAccounts.js";
import groupRoutes from "./routes/group.routes.js";
import groupMessageRoutes from "./routes/groupMessage.routes.js";
import reactionRoutes from "./routes/reaction.routes.js"; // ADD THIS
import readReceiptRoutes from "./routes/readReceipt.routes.js"; // ADD THIS

const __dirname = path.resolve();
const PORT = ENV.PORT || 3000;

app.use(express.json({ limit: "5mb" })); // middleware to parse json data req.body
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true })); // enable CORS for frontend domain
app.use(cookieParser()); // middleware to parse cookies

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/group-messages", groupMessageRoutes);
app.use("/api/reactions", reactionRoutes); // ADD THIS
app.use("/api/read-receipts", readReceiptRoutes); // ADD THIS

// make ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

server.listen(PORT, () => {
  console.log("Server running on port: " + PORT);
  connectDB();
  removeUnverifiedAccounts(); // Start the cleanup job
});
