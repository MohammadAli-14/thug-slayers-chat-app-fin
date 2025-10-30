import express from "express";
import {
  createGroup,
  getUserGroups,
  getGroupDetails,
  addMembersToGroup,
  removeMemberFromGroup,
  leaveGroup,
  updateGroupProfile,
  transferGroupAdmin,
} from "../controllers/group.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.post("/", createGroup);
router.get("/", getUserGroups);
router.get("/:groupId", getGroupDetails);
router.put("/:groupId/members", addMembersToGroup);
router.delete("/:groupId/members/:memberId", removeMemberFromGroup);
router.post("/:groupId/leave", leaveGroup);
router.put("/:groupId/profile", updateGroupProfile);
router.post("/:groupId/transfer-admin", transferGroupAdmin);

export default router;