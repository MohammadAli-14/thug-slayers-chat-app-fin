import GroupMessage from "../models/GroupMessage.js";
import Group from "../models/Group.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await GroupMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if user is a member of the group
    const group = await Group.findOne({
      _id: message.groupId,
      "members.user": userId,
    });

    if (!group) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    // Check if message is already read by user
    const alreadyRead = message.readBy.some(
      read => read.userId.toString() === userId.toString()
    );

    if (!alreadyRead) {
      message.readBy.push({
        userId,
        readAt: new Date(),
      });

      await message.save();

      // Emit socket event to notify other group members
      const populatedMessage = await GroupMessage.findById(messageId)
        .populate("readBy.userId", "fullName profilePic");

      io.to(`group_${message.groupId}`).emit("messageRead", {
        messageId,
        readBy: populatedMessage.readBy,
        readByUser: req.user,
      });
    }

    res.status(200).json({
      success: true,
      message: "Message marked as read",
    });
  } catch (error) {
    console.log("Error in markMessageAsRead controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markMultipleMessagesAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user._id;

    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({ message: "Message IDs array is required" });
    }

    const messages = await GroupMessage.find({
      _id: { $in: messageIds },
      "readBy.userId": { $ne: userId }, // Only messages not already read
    });

    const readReceipts = [];

    for (const message of messages) {
      // Check if user is a member of the group for each message
      const group = await Group.findOne({
        _id: message.groupId,
        "members.user": userId,
      });

      if (group) {
        message.readBy.push({
          userId,
          readAt: new Date(),
        });

        await message.save();

        const populatedMessage = await GroupMessage.findById(message._id)
          .populate("readBy.userId", "fullName profilePic");

        readReceipts.push({
          messageId: message._id,
          readBy: populatedMessage.readBy,
        });

        // Emit socket event for each message
        io.to(`group_${message.groupId}`).emit("messageRead", {
          messageId: message._id,
          readBy: populatedMessage.readBy,
          readByUser: req.user,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
      readReceipts,
    });
  } catch (error) {
    console.log("Error in markMultipleMessagesAsRead controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};