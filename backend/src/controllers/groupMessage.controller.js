// backend/src/controllers/groupMessage.controller.js - FIXED VERSION
import GroupMessage from "../models/GroupMessage.js";
import Group from "../models/Group.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";

/**
 * Send a message to a group - FIXED FILE UPLOAD
 */
export const sendGroupMessage = async (req, res) => {
  try {
    const { text, image, file, fileName: customFileName, fileType } = req.body;
    const { groupId } = req.params;
    const senderId = req.user._id;

    console.log('=== GROUP MESSAGE REQUEST ===');
    console.log('Text:', text);
    console.log('Image exists:', !!image);
    console.log('File exists:', !!file);
    console.log('File name:', customFileName);
    console.log('File type:', fileType);
    console.log('Group ID:', groupId);
    
    // For groups: allow text, image, OR file
    if (!text && !image && !file) {
      console.log('ERROR: No text, image, or file provided for group message');
      return res.status(400).json({ message: "Text, image, or file is required for group messages." });
    }

    // Check if group exists and user is a member
    const group = await Group.findOne({
      _id: groupId,
      "members.user": senderId,
      isActive: true,
    });

    if (!group) {
      console.log('ERROR: Group not found or user not a member');
      return res.status(404).json({ message: "Group not found or you are not a member." });
    }

    let imageUrl;
    let fileUrl;
    let fileName;
    let fileSize;
    let uploadedFileType;

    // Upload image if provided
    if (image) {
      try {
        console.log('Starting image upload to Cloudinary...');
        
        const uploadResponse = await cloudinary.uploader.upload(image, {
          resource_type: "image",
          quality: "auto",
          fetch_format: "auto",
        });
        
        imageUrl = uploadResponse.secure_url;
        uploadedFileType = "image";
        console.log('Image upload successful:', imageUrl);
      } catch (err) {
        console.error("Cloudinary image upload error:", err);
        return res.status(500).json({ 
          message: `Failed to upload image: ${err.message}` 
        });
      }
    }

    // Upload file if provided (documents, videos, etc.)
    if (file) {
      try {
        console.log('Starting file upload to Cloudinary...');
        
        // Extract the actual base64 data (remove data URL prefix)
        const base64Data = file.replace(/^data:.*?;base64,/, "");
        
        // Create a buffer from base64
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Determine resource type based on file type
        let resourceType = "raw"; // Default to raw for documents
        const detectedFileType = fileType || customFileName || "";
        
        if (detectedFileType.includes('video') || detectedFileType.match(/\.(mp4|mov|avi|mkv|webm)$/i)) {
          resourceType = "video";
        } else if (detectedFileType.includes('image')) {
          resourceType = "image";
        }
        // For PDF, DOC, DOCX, TXT, ZIP, RAR - use "raw"

        console.log('Determined resource type:', resourceType);

        // Convert buffer to data URI for Cloudinary
        const dataUri = `data:application/octet-stream;base64,${base64Data}`;

        const uploadOptions = {
          resource_type: resourceType,
        };

        // Add specific folder for organization
        if (resourceType === "raw") {
          uploadOptions.folder = "documents";
          uploadOptions.type = "upload";
        } else if (resourceType === "video") {
          uploadOptions.folder = "videos";
          uploadOptions.chunk_size = 6000000; // 6MB chunks for video
        }

        console.log('Upload options:', uploadOptions);

        const uploadResponse = await cloudinary.uploader.upload(dataUri, uploadOptions);
        
        fileUrl = uploadResponse.secure_url;
        fileName = customFileName || uploadResponse.original_filename;
        fileSize = uploadResponse.bytes;
        uploadedFileType = resourceType;

        console.log(`File uploaded successfully: ${fileName}, type: ${resourceType}, size: ${fileSize} bytes`);
      } catch (err) {
        console.error("Cloudinary file upload error:", err);
        
        // More specific error messages
        if (err.message.includes("File size too large")) {
          return res.status(400).json({ 
            message: "File size exceeds Cloudinary limit. Please use a smaller file (<10MB for free tier)." 
          });
        } else if (err.message.includes("Invalid")) {
          return res.status(400).json({ 
            message: "Invalid file format. Please try a different file type." 
          });
        } else {
          return res.status(500).json({ 
            message: `Failed to upload file: ${err.message}. Please try a different file or contact support.` 
          });
        }
      }
    }

    console.log('Creating new group message in database...');
    
    // Determine message type more accurately
    let messageType = "text";
    if (imageUrl) {
      messageType = "image";
    } else if (fileUrl) {
      // More specific file type detection
      if (uploadedFileType === "video") {
        messageType = "video";
      } else {
        messageType = "file"; // This will now work with the updated schema
      }
    }

    const newMessage = new GroupMessage({
      groupId,
      senderId,
      text,
      image: imageUrl || undefined,
      file: fileUrl || undefined,
      fileName: fileName || undefined,
      fileSize: fileSize || undefined,
      fileType: uploadedFileType || undefined,
      messageType, // This now accepts "file" as valid
    });

    await newMessage.save();
    console.log('Group message saved to database with ID:', newMessage._id);

    // Populate the message with sender details
    const populatedMessage = await GroupMessage.findById(newMessage._id).populate(
      "senderId",
      "fullName profilePic email"
    );

    console.log('Emitting newGroupMessage to all group members...');

    // Emit to all group members
    group.members.forEach((member) => {
      const socketId = getReceiverSocketId(member.user.toString());
      if (socketId) {
        io.to(socketId).emit("newGroupMessage", populatedMessage);
      }
    });

    console.log('=== GROUP MESSAGE SENT SUCCESSFULLY ===');
    return res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error in sendGroupMessage controller: ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    // Check if user is a member of the group
    const group = await Group.findOne({
      _id: groupId,
      "members.user": userId,
      isActive: true,
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found or access denied." });
    }

    const messages = await GroupMessage.find({ groupId })
      .populate("senderId", "fullName profilePic email")
      .sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getGroupMessages controller: ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getGroupChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Find all groups where user is a member
    const groups = await Group.find({
      "members.user": loggedInUserId,
      isActive: true,
    })
      .populate("admin", "fullName profilePic email")
      .populate("members.user", "fullName profilePic email")
      .sort({ updatedAt: -1 });

    return res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getGroupChatPartners: ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};