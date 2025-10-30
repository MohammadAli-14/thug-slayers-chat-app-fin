// backend/src/controllers/group.controller.js
import Group from "../models/Group.js";
import GroupMessage from "../models/GroupMessage.js";
import User from "../models/User.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";

/**
 * Create a new group
 */
export const createGroup = async (req, res) => {
  try {
    const { name, description, memberIds } = req.body;
    const adminId = req.user._id;

    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    // Create members array with admin as first member
    const members = [
      {
        user: adminId,
        role: "admin",
      },
    ];

    // Add other members if provided
    if (memberIds && memberIds.length > 0) {
      // Verify that all member IDs are valid users
      const validUsers = await User.find({
        _id: { $in: memberIds },
        accountVerified: true,
      }).select("_id");

      const validUserIds = validUsers.map((user) => user._id.toString());

      // Add valid users as members
      validUserIds.forEach((userId) => {
        members.push({
          user: userId,
          role: "member",
        });
      });
    }

    // Create group
    const newGroup = new Group({
      name,
      description,
      admin: adminId,
      members,
    });

    await newGroup.save();

    // Populate the group data before sending response
    const populatedGroup = await Group.findById(newGroup._id)
      .populate("admin", "fullName profilePic email")
      .populate("members.user", "fullName profilePic email");

    // Create a system message for group creation
    const systemMessage = new GroupMessage({
      groupId: newGroup._id,
      senderId: adminId,
      messageType: "system",
      systemMessage: `Group "${name}" was created by ${req.user.fullName}`,
    });

    await systemMessage.save();

    res.status(201).json({
      success: true,
      group: populatedGroup,
      message: "Group created successfully",
    });
  } catch (error) {
    console.log("Error in createGroup controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get groups for logged in user
 */
export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({
      "members.user": userId,
      isActive: true,
    })
      .populate("admin", "fullName profilePic email")
      .populate("members.user", "fullName profilePic email")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      groups,
    });
  } catch (error) {
    console.log("Error in getUserGroups controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get details of a group (only if user is a member)
 */
export const getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findOne({
      _id: groupId,
      "members.user": userId,
      isActive: true,
    })
      .populate("admin", "fullName profilePic email")
      .populate("members.user", "fullName profilePic email");

    if (!group) {
      return res.status(404).json({ message: "Group not found or access denied" });
    }

    res.status(200).json({
      success: true,
      group,
    });
  } catch (error) {
    console.log("Error in getGroupDetails controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Add members to a group (admin only)
 */
export const addMembersToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberIds } = req.body;
    const userId = req.user._id;

    // Check if group exists and user is admin
    const group = await Group.findOne({
      _id: groupId,
      admin: userId,
      isActive: true,
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found or you are not the admin" });
    }

    // Get valid users to add
    const validUsers = await User.find({
      _id: { $in: memberIds },
      accountVerified: true,
    }).select("_id fullName");

    const newMembers = validUsers.map((user) => ({
      user: user._id,
      role: "member",
    }));

    // Add only new members (avoid duplicates)
    const existingMemberIds = group.members.map((member) => member.user.toString());
    const membersToAdd = newMembers.filter(
      (member) => !existingMemberIds.includes(member.user.toString())
    );

    if (membersToAdd.length === 0) {
      return res.status(400).json({ message: "No new members to add" });
    }

    group.members.push(...membersToAdd);
    await group.save();

    // Create system message for new members
    const systemMessage = new GroupMessage({
      groupId,
      senderId: userId,
      messageType: "system",
      systemMessage: `${membersToAdd.length} member(s) added to the group`,
    });

    await systemMessage.save();

    // Emit socket event to all group members
    const updatedGroup = await Group.findById(groupId)
      .populate("admin", "fullName profilePic email")
      .populate("members.user", "fullName profilePic email");

    // Notify all group members about the update
    updatedGroup.members.forEach((member) => {
      const socketId = getReceiverSocketId(member.user.toString());
      if (socketId) {
        io.to(socketId).emit("groupUpdated", {
          group: updatedGroup,
          action: "membersAdded",
        });
      }
    });

    res.status(200).json({
      success: true,
      group: updatedGroup,
      message: "Members added successfully",
    });
  } catch (error) {
    console.log("Error in addMembersToGroup controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Remove a member from group (admin only)
 */
export const removeMemberFromGroup = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.user._id;

    // Check if group exists and user is admin
    const group = await Group.findOne({
      _id: groupId,
      admin: userId,
      isActive: true,
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found or you are not the admin" });
    }

    // Cannot remove admin
    if (memberId === userId.toString()) {
      return res.status(400).json({ message: "Cannot remove yourself as admin" });
    }

    // Remove member
    const initialLength = group.members.length;
    group.members = group.members.filter((member) => member.user.toString() !== memberId);

    if (group.members.length === initialLength) {
      return res.status(404).json({ message: "Member not found in group" });
    }

    await group.save();

    // Create system message
    const removedUser = await User.findById(memberId).select("fullName");
    const systemMessage = new GroupMessage({
      groupId,
      senderId: userId,
      messageType: "system",
      systemMessage: `${removedUser?.fullName || "A user"} was removed from the group`,
    });

    await systemMessage.save();

    // Emit socket events
    const updatedGroup = await Group.findById(groupId)
      .populate("admin", "fullName profilePic email")
      .populate("members.user", "fullName profilePic email");

    // Notify remaining group members
    updatedGroup.members.forEach((member) => {
      const socketId = getReceiverSocketId(member.user.toString());
      if (socketId) {
        io.to(socketId).emit("groupUpdated", {
          group: updatedGroup,
          action: "memberRemoved",
        });
      }
    });

    // Notify removed user
    const removedUserSocketId = getReceiverSocketId(memberId);
    if (removedUserSocketId) {
      io.to(removedUserSocketId).emit("removedFromGroup", {
        groupId,
        groupName: group.name,
      });
    }

    res.status(200).json({
      success: true,
      group: updatedGroup,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.log("Error in removeMemberFromGroup controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Leave a group (member)
 */
export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findOne({
      _id: groupId,
      "members.user": userId,
      isActive: true,
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // If user is admin, they can't leave - must transfer admin or delete group
    if (group.admin.toString() === userId.toString()) {
      return res.status(400).json({
        message: "Group admin cannot leave. Transfer admin role or delete group instead.",
      });
    }

    // Remove user from members
    group.members = group.members.filter((member) => member.user.toString() !== userId.toString());

    await group.save();

    // Create system message
    const systemMessage = new GroupMessage({
      groupId,
      senderId: userId,
      messageType: "system",
      systemMessage: `${req.user.fullName} left the group`,
    });

    await systemMessage.save();

    // Notify remaining group members
    const updatedGroup = await Group.findById(groupId)
      .populate("admin", "fullName profilePic email")
      .populate("members.user", "fullName profilePic email");

    updatedGroup.members.forEach((member) => {
      const socketId = getReceiverSocketId(member.user.toString());
      if (socketId) {
        io.to(socketId).emit("groupUpdated", {
          group: updatedGroup,
          action: "memberLeft",
        });
      }
    });

    res.status(200).json({
      success: true,
      message: "You have left the group",
    });
  } catch (error) {
    console.log("Error in leaveGroup controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update group profile (admin only)
 */
export const updateGroupProfile = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, profilePic } = req.body;
    const userId = req.user._id;

    // Check if group exists and user is admin
    const group = await Group.findOne({
      _id: groupId,
      admin: userId,
      isActive: true,
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found or you are not the admin" });
    }

    // Update fields
    if (name) group.name = name;
    if (description) group.description = description;

    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      group.profilePic = uploadResponse.secure_url;
    }

    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("admin", "fullName profilePic email")
      .populate("members.user", "fullName profilePic email");

    // Notify all group members
    updatedGroup.members.forEach((member) => {
      const socketId = getReceiverSocketId(member.user.toString());
      if (socketId) {
        io.to(socketId).emit("groupUpdated", {
          group: updatedGroup,
          action: "profileUpdated",
        });
      }
    });

    res.status(200).json({
      success: true,
      group: updatedGroup,
      message: "Group profile updated successfully",
    });
  } catch (error) {
    console.log("Error in updateGroupProfile controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Transfer admin role to another group member (new function)
 */
export const transferGroupAdmin = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { newAdminId } = req.body;
    const currentAdminId = req.user._id;

    // Find the group and verify current admin
    const group = await Group.findOne({
      _id: groupId,
      admin: currentAdminId,
      isActive: true,
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found or you are not the admin" });
    }

    // Check if new admin is a member of the group
    const newAdminMember = group.members.find(
      (member) => member.user.toString() === newAdminId
    );

    if (!newAdminMember) {
      return res.status(400).json({ message: "New admin must be a group member" });
    }

    // Cannot transfer to yourself
    if (newAdminId === currentAdminId.toString()) {
      return res.status(400).json({ message: "You are already the admin" });
    }

    // Update admin and member roles
    group.admin = newAdminId;

    // Update member roles
    group.members = group.members.map((member) => {
      const memberObj = member.toObject ? member.toObject() : member;
      if (member.user.toString() === newAdminId) {
        return { ...memberObj, role: "admin" };
      }
      if (member.user.toString() === currentAdminId.toString()) {
        return { ...memberObj, role: "member" };
      }
      return memberObj;
    });

    await group.save();

    // Create system message for admin transfer
    const currentUser = await User.findById(currentAdminId).select("fullName");
    const newAdminUser = await User.findById(newAdminId).select("fullName");

    const systemMessage = new GroupMessage({
      groupId,
      senderId: currentAdminId,
      messageType: "system",
      systemMessage: `${currentUser?.fullName || "A user"} transferred admin role to ${newAdminUser?.fullName || "another user"}`,
    });

    await systemMessage.save();

    // Populate the updated group
    const updatedGroup = await Group.findById(groupId)
      .populate("admin", "fullName profilePic email")
      .populate("members.user", "fullName profilePic email");

    // Emit socket event to all group members (use updatedGroup members)
    updatedGroup.members.forEach((member) => {
      const socketId = getReceiverSocketId(member.user.toString());
      if (socketId) {
        io.to(socketId).emit("groupUpdated", {
          group: updatedGroup,
          action: "adminTransferred",
        });
      }
    });

    res.status(200).json({
      success: true,
      group: updatedGroup,
      message: "Admin role transferred successfully",
    });
  } catch (error) {
    console.log("Error in transferGroupAdmin controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
