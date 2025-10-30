import express from "express";
import {
  addReaction,
  removeReaction,
  getMessageReactions,
  removeReactionByMessageAndEmoji,
    getBulkReactions
} from "../controllers/reaction.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.post("/", addReaction);
router.delete("/:reactionId", removeReaction);
router.delete("/", removeReactionByMessageAndEmoji); 
router.get("/:messageId/:messageType", getMessageReactions);
router.post("/bulk", getBulkReactions);

export default router;