import express from "express";
import {
    getAllContacts,
    getChatPartners,
    getMessagesByUserId,
    sendMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from '../middleware/arcjet.middleware.js';
import { simpleRateLimit } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

// Skip Arcjet in development for better performance
if (process.env.NODE_ENV === 'production' && process.env.ARCJET_KEY && process.env.ARCJET_KEY !== "your_arcjet_key_here") {
  router.use(arcjetProtection);
} else {
  router.use(simpleRateLimit);
}

router.use(protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage);

export default router;