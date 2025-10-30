import mongoose from "mongoose";

const messageReactionSchema = new mongoose.Schema(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      // Remove required: true and make it conditional
    },
    groupMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GroupMessage",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    emoji: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10,
    },
    messageType: {
      type: String,
      enum: ["private", "group"],
      required: true,
    },
  },
  { timestamps: true }
);

// Add custom validation to ensure one of messageId or groupMessageId is present
messageReactionSchema.pre("validate", function(next) {
  if (!this.messageId && !this.groupMessageId) {
    return next(new Error("Either messageId or groupMessageId is required"));
  }
  
  if (this.messageType === "private" && !this.messageId) {
    return next(new Error("messageId is required for private messages"));
  }
  
  if (this.messageType === "group" && !this.groupMessageId) {
    return next(new Error("groupMessageId is required for group messages"));
  }
  
  next();
});

// Update compound index for unique reactions per user per message
messageReactionSchema.index(
  { 
    messageId: 1, 
    groupMessageId: 1, 
    userId: 1, 
    emoji: 1 
  }, 
  { 
    unique: true,
    partialFilterExpression: {
      $or: [
        { messageId: { $exists: true } },
        { groupMessageId: { $exists: true } }
      ]
    }
  }
);

// Index for better query performance
messageReactionSchema.index({ messageId: 1, messageType: 1 });
messageReactionSchema.index({ groupMessageId: 1, messageType: 1 });

const MessageReaction = mongoose.model("MessageReaction", messageReactionSchema);

export default MessageReaction;