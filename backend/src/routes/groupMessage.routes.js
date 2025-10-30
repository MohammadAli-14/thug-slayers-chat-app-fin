import express from "express";
import {
  sendGroupMessage,
  getGroupMessages,
  getGroupChatPartners,
} from "../controllers/groupMessage.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.get("/chats", getGroupChatPartners);
router.get("/:groupId", getGroupMessages);
router.post("/send/:groupId", sendGroupMessage);

export default router;