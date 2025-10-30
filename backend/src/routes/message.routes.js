import express from "express";
import {
    getAllContacts,
    getChatPartners,
    getMessagesByUserId,
    sendMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from '../middleware/arcjet.middleware.js';
import { simpleRateLimit } from '../middleware/rateLimit.middleware.js'; // ADD THIS

const router = express.Router();

// Use Arcjet if available, otherwise use simple rate limit
if (process.env.ARCJET_KEY && process.env.ARCJET_KEY !== "your_arcjet_key_here") {
  router.use(arcjetProtection);
} else {
  router.use(simpleRateLimit);
}

// the middlewares execute in order - so requests get rate-limited first, then authenticated.
// this is actually more efficient since unauthenticated requests get blocked by rate limiting before hitting the auth middleware.
router.use(protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage);

export default router;