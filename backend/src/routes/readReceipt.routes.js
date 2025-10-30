import express from "express";
import {
  markMessageAsRead,
  markMultipleMessagesAsRead,
} from "../controllers/readReceipt.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.post("/:messageId/read", markMessageAsRead);
router.post("/read-multiple", markMultipleMessagesAsRead);

export default router;