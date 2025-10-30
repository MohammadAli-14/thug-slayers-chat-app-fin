import MessageReaction from "../models/MessageReaction.js";
import Message from "../models/Message.js";
import GroupMessage from "../models/GroupMessage.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const addReaction = async (req, res) => {
  try {
    const { messageId, emoji, messageType } = req.body;
    const userId = req.user._id;

    if (!messageId || !emoji || !messageType) {
      return res.status(400).json({ message: "Message ID, emoji, and message type are required" });
    }

    // Validate emoji format (basic validation)
    if (emoji.length > 10) {
      return res.status(400).json({ message: "Invalid emoji" });
    }

    // Check if message exists based on type and user has access
    let message;
    if (messageType === "private") {
      message = await Message.findOne({
        _id: messageId,
        $or: [{ senderId: userId }, { receiverId: userId }]
      });
    } else if (messageType === "group") {
      // For group messages, we need to check if user is a member of the group
      message = await GroupMessage.findById(messageId)
        .populate("groupId");
      
      if (message && message.groupId) {
        const isMember = message.groupId.members.some(
          member => member.user.toString() === userId.toString()
        );
        if (!isMember) {
          return res.status(403).json({ message: "You are not a member of this group" });
        }
      }
    } else {
      return res.status(400).json({ message: "Invalid message type" });
    }

    if (!message) {
      return res.status(404).json({ message: "Message not found or access denied" });
    }

    // Check if user has already reacted with this emoji
    const existingReaction = await MessageReaction.findOne({
      $or: [
        { messageId, messageType: "private" },
        { groupMessageId: messageId, messageType: "group" }
      ],
      userId,
      emoji
    });

    if (existingReaction) {
      return res.status(400).json({ message: "You have already reacted with this emoji" });
    }

    // Create reaction with proper fields based on message type
    const reactionData = {
      userId,
      emoji,
      messageType,
    };

    // Set the appropriate ID field based on message type
    if (messageType === "private") {
      reactionData.messageId = messageId;
    } else {
      reactionData.groupMessageId = messageId;
    }

    const reaction = new MessageReaction(reactionData);
    await reaction.save();

    // Populate reaction with user details
    const populatedReaction = await MessageReaction.findById(reaction._id)
      .populate("userId", "fullName profilePic");

    // Emit socket event
    if (messageType === "private") {
      // For private messages, notify both users
      const receiverId = message.senderId.toString() === userId.toString() 
        ? message.receiverId 
        : message.senderId;
      
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageReactionAdded", {
          messageId,
          reaction: populatedReaction,
          messageType: "private" // ADDED THIS
        });
      }

      // Also notify the sender
      const senderSocketId = getReceiverSocketId(userId.toString());
      if (senderSocketId && senderSocketId !== receiverSocketId) {
        io.to(senderSocketId).emit("messageReactionAdded", {
          messageId,
          reaction: populatedReaction,
          messageType: "private" // ADDED THIS
        });
      }
    } else if (messageType === "group") {
      // For group messages, notify all group members
      if (message && message.groupId) {
        // Use the group room name consistently
        const roomName = `group_${message.groupId._id}`;
        
        // Emit to the group room with proper data structure
        io.to(roomName).emit("messageReactionAdded", {
          messageId: messageId,
          reaction: populatedReaction,
          messageType: messageType
        });
        
        console.log(`Emitted reaction to room: ${roomName}`);
      }
    }

    res.status(201).json({
      success: true,
      reaction: populatedReaction,
    });
  } catch (error) {
    console.log("Error in addReaction controller:", error.message);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already reacted with this emoji" });
    }
    
    // Handle custom validation errors
    if (error.message.includes("is required")) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: "Internal server error" });
  }
};

export const removeReaction = async (req, res) => {
  try {
    const { reactionId } = req.params;
    const userId = req.user._id;

    const reaction = await MessageReaction.findOne({
      _id: reactionId,
      userId,
    }).populate("userId", "fullName profilePic");

    if (!reaction) {
      return res.status(404).json({ message: "Reaction not found" });
    }

    const { messageId, groupMessageId, messageType, emoji } = reaction;

    await MessageReaction.deleteOne({ _id: reactionId });

    // Determine the actual message ID for socket emission
    const actualMessageId = messageType === "private" ? messageId : groupMessageId;

    // Emit socket event
    if (messageType === "private") {
      const message = await Message.findById(actualMessageId);
      if (message) {
        const receiverId = message.senderId.toString() === userId.toString() 
          ? message.receiverId 
          : message.senderId;
        
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("messageReactionRemoved", {
            messageId: actualMessageId,
            userId: userId.toString(),
            emoji,
            messageType: "private" // ADDED THIS FOR CONSISTENCY
          });
        }

        // Also notify the sender
        const senderSocketId = getReceiverSocketId(userId.toString());
        if (senderSocketId && senderSocketId !== receiverSocketId) {
          io.to(senderSocketId).emit("messageReactionRemoved", {
            messageId: actualMessageId,
            userId: userId.toString(),
            emoji,
            messageType: "private" // ADDED THIS FOR CONSISTENCY
          });
        }
      }
    } else if (messageType === "group") {
      const groupMessage = await GroupMessage.findById(actualMessageId).populate("groupId");
      if (groupMessage && groupMessage.groupId) {
        const roomName = `group_${groupMessage.groupId._id}`;
        io.to(roomName).emit("messageReactionRemoved", {
          messageId: actualMessageId,
          userId: userId.toString(),
          emoji,
          messageType: messageType
        });
        console.log(`Emitted reaction removal to room: ${roomName}`);
      }
    }

    res.status(200).json({
      success: true,
      message: "Reaction removed successfully",
    });
  } catch (error) {
    console.log("Error in removeReaction controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessageReactions = async (req, res) => {
  try {
    const { messageId, messageType } = req.params;

    let query;
    if (messageType === "private") {
      query = { messageId, messageType: "private" };
    } else if (messageType === "group") {
      query = { groupMessageId: messageId, messageType: "group" };
    } else {
      return res.status(400).json({ message: "Invalid message type" });
    }

    const reactions = await MessageReaction.find(query)
      .populate("userId", "fullName profilePic");

    // Group reactions by emoji
    const reactionsByEmoji = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = [];
      }
      acc[reaction.emoji].push(reaction.userId);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      reactions: reactionsByEmoji,
    });
  } catch (error) {
    console.log("Error in getMessageReactions controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const removeReactionByMessageAndEmoji = async (req, res) => {
  try {
    const { messageId, emoji, messageType } = req.body;
    const userId = req.user._id;

    if (!messageId || !emoji || !messageType) {
      return res.status(400).json({ message: "Message ID, emoji, and message type are required" });
    }

    // Build query based on message type
    let query;
    if (messageType === "private") {
      query = { messageId, userId, emoji, messageType: "private" };
    } else if (messageType === "group") {
      query = { groupMessageId: messageId, userId, emoji, messageType: "group" };
    } else {
      return res.status(400).json({ message: "Invalid message type" });
    }

    // Find and delete the reaction
    const reaction = await MessageReaction.findOne(query);

    if (!reaction) {
      return res.status(404).json({ message: "Reaction not found" });
    }

    await MessageReaction.deleteOne({ _id: reaction._id });

    // Emit socket event (same as in removeReaction)
    const actualMessageId = messageType === "private" ? messageId : reaction.groupMessageId;

    if (messageType === "private") {
      const message = await Message.findById(actualMessageId);
      if (message) {
        const receiverId = message.senderId.toString() === userId.toString() 
          ? message.receiverId 
          : message.senderId;
        
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("messageReactionRemoved", {
            messageId: actualMessageId,
            userId: userId.toString(),
            emoji,
            messageType: "private" // ADDED THIS FOR CONSISTENCY
          });
        }

        // Also notify the sender
        const senderSocketId = getReceiverSocketId(userId.toString());
        if (senderSocketId && senderSocketId !== receiverSocketId) {
          io.to(senderSocketId).emit("messageReactionRemoved", {
            messageId: actualMessageId,
            userId: userId.toString(),
            emoji,
            messageType: "private" // ADDED THIS FOR CONSISTENCY
          });
        }
      }
    } else if (messageType === "group") {
      const groupMessage = await GroupMessage.findById(actualMessageId).populate("groupId");
      if (groupMessage && groupMessage.groupId) {
        const roomName = `group_${groupMessage.groupId._id}`;
        io.to(roomName).emit("messageReactionRemoved", {
          messageId: actualMessageId,
          userId: userId.toString(),
          emoji,
          messageType: messageType
        });
        console.log(`Emitted reaction removal to room: ${roomName}`);
      }
    }

    res.status(200).json({
      success: true,
      message: "Reaction removed successfully",
    });
  } catch (error) {
    console.log("Error in removeReactionByMessageAndEmoji controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};