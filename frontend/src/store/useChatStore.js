// frontend/src/store/useChatStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  // Users & chats
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // Sound setting
  isSoundEnabled:
    (typeof window !== "undefined" &&
      JSON.parse(localStorage.getItem("isSoundEnabled"))) === true,

  toggleSound: () => {
    const current = get().isSoundEnabled;
    localStorage.setItem("isSoundEnabled", JSON.stringify(!current));
    set({ isSoundEnabled: !current });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  // Socket private handlers
  _private_messageHandler: null,
  _private_reactionAddedHandler: null,
  _private_reactionRemovedHandler: null,
  _private_groupHandlers: null,

  // --- Contacts & 1:1 Chats ---
  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load contacts");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load chats");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      
      // Fetch reactions for each message
      const messagesWithReactions = await Promise.all(
        res.data.map(async (message) => {
          try {
            const reactionsRes = await axiosInstance.get(`/reactions/${message._id}/private`);
            return {
              ...message,
              reactions: reactionsRes.data.reactions || {}
            };
          } catch (error) {
            // If reactions fail to load, just return the message without reactions
            console.error("Failed to load reactions for message:", message._id, error);
            return { ...message, reactions: {} };
          }
        })
      );
      
      set({ messages: messagesWithReactions });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    const { authUser } = useAuthStore.getState();

    if (!selectedUser) {
      toast.error("No recipient selected");
      return;
    }

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser?._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image, // Only text and image, no file
      createdAt: new Date().toISOString(),
      isOptimistic: true,
      reactions: {}
    };

    // Immediately update UI by adding the optimistic message
    set((state) => ({ messages: [...state.messages, optimisticMessage] }));

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      // Replace optimistic message with the server message
      const currentMessages = get().messages;
      set({
        messages: currentMessages.map((m) => (m._id === tempId ? { ...res.data, reactions: {} } : m)),
      });
    } catch (error) {
      // Remove optimistic message on failure
      set((state) => ({
        messages: state.messages.filter((m) => m._id !== tempId),
      }));
      toast.error(error?.response?.data?.message || "Something went wrong");
      throw error;
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    const messageHandler = (newMessage) => {
      const isMessageFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageFromSelectedUser) return;

      const currentMessages = get().messages;
      // avoid duplicate
      if (!currentMessages.find((m) => m._id === newMessage._id)) {
        set({ messages: [...currentMessages, { ...newMessage, reactions: {} }] });

        if (isSoundEnabled) {
          const notificationSound = new Audio("/sound/notification.mp3");
          notificationSound.currentTime = 0;
          notificationSound.play().catch((e) => console.log("Audio play failed:", e));
        }
      }
    };

    // UPDATED REACTION HANDLERS FOR PRIVATE CHATS
    const reactionAddedHandler = (data) => {
      console.log("Private chat reaction added:", data);
      
      // Only process if it's a private message reaction
      if (data.messageType !== "private") return;
      
      const currentMessages = get().messages;
      
      // Update the specific message with new reactions
      const updatedMessages = currentMessages.map(msg => {
        if (msg._id === data.messageId) {
          // Create or update reactions for this message
          const updatedReactions = { ...msg.reactions };
          if (!updatedReactions[data.reaction.emoji]) {
            updatedReactions[data.reaction.emoji] = [];
          }
          
          // Check if user already reacted to avoid duplicates
          const userExists = updatedReactions[data.reaction.emoji].some(
            user => user._id === data.reaction.userId._id
          );
          
          if (!userExists) {
            updatedReactions[data.reaction.emoji].push(data.reaction.userId);
          }
          
          return { ...msg, reactions: updatedReactions };
        }
        return msg;
      });
      
      set({ messages: updatedMessages });
    };

    const reactionRemovedHandler = (data) => {
      console.log("Private chat reaction removed:", data);
      
      // Only process if it's a private message reaction
      if (data.messageType !== "private") return;
      
      const currentMessages = get().messages;
      
      // Update the specific message by removing the reaction
      const updatedMessages = currentMessages.map(msg => {
        if (msg._id === data.messageId) {
          const updatedReactions = { ...msg.reactions };
          
          if (updatedReactions[data.emoji]) {
            updatedReactions[data.emoji] = updatedReactions[data.emoji].filter(
              user => user._id !== data.userId
            );
            
            // Remove emoji if no users left
            if (updatedReactions[data.emoji].length === 0) {
              delete updatedReactions[data.emoji];
            }
          }
          
          return { ...msg, reactions: updatedReactions };
        }
        return msg;
      });
      
      set({ messages: updatedMessages });
    };

    // attach with named references so we can remove exactly these listeners later
    socket.on("newMessage", messageHandler);
    socket.on("messageReactionAdded", reactionAddedHandler);
    socket.on("messageReactionRemoved", reactionRemovedHandler);

    // store the handler references so unsubscribe can use them
    set({ 
      _private_messageHandler: messageHandler,
      _private_reactionAddedHandler: reactionAddedHandler,
      _private_reactionRemovedHandler: reactionRemovedHandler
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    const { 
      _private_messageHandler, 
      _private_reactionAddedHandler, 
      _private_reactionRemovedHandler 
    } = get();
    
    if (!socket) return;
    
    if (_private_messageHandler) {
      socket.off("newMessage", _private_messageHandler);
    }
    
    if (_private_reactionAddedHandler) {
      socket.off("messageReactionAdded", _private_reactionAddedHandler);
    }
    
    if (_private_reactionRemovedHandler) {
      socket.off("messageReactionRemoved", _private_reactionRemovedHandler);
    }
    
    // fallback: remove all listeners if handlers are not set
    if (!_private_messageHandler && !_private_reactionAddedHandler && !_private_reactionRemovedHandler) {
      socket.off("newMessage");
      socket.off("messageReactionAdded");
      socket.off("messageReactionRemoved");
    }
    
    set({ 
      _private_messageHandler: null,
      _private_reactionAddedHandler: null,
      _private_reactionRemovedHandler: null 
    });
  },

  // --- Group chat: state & actions ---
  groups: [],
  selectedGroup: null,
  groupMessages: [],
  isGroupsLoading: false,
  isGroupMessagesLoading: false,

  // NEW loading states
  isCreatingGroup: false,
  isUpdatingGroup: false,
  isAddingMembers: false,
  isRemovingMember: false,
  isLeavingGroup: false,
  isSendingGroupMessage: false,

  setSelectedGroup: (selectedGroup) => set({ selectedGroup }),

  // Auto-join group rooms when groups are loaded
  autoJoinGroupRooms: async () => {
    const socket = useAuthStore.getState().socket;
    const { groups } = get();
    
    if (socket && groups.length > 0) {
      const groupIds = groups.map(group => group._id);
      socket.emit("joinUserGroups", groupIds);
      console.log("Auto-joined user's groups:", groupIds);
    }
  },

  // Enhanced Group Actions with Loading States
  createGroup: async (groupData) => {
    set({ isCreatingGroup: true });
    try {
      const res = await axiosInstance.post("/groups", groupData);
      set((state) => ({
        groups: [res.data.group, ...state.groups],
        isCreatingGroup: false,
      }));

      // Auto-join the new group room
      setTimeout(() => {
        get().autoJoinGroupRooms();
      }, 100);

      toast.success("Group created successfully");
      return { success: true, group: res.data.group };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to create group";
      toast.error(errorMessage);
      set({ isCreatingGroup: false });
      throw new Error(errorMessage);
    }
  },

  updateGroupProfile: async (groupId, updateData) => {
    set({ isUpdatingGroup: true });
    try {
      const res = await axiosInstance.put(`/groups/${groupId}/profile`, updateData);

      // Update groups list
      const { groups, selectedGroup } = get();
      const updatedGroups = groups.map((group) =>
        group._id === groupId ? res.data.group : group
      );
      set({
        groups: updatedGroups,
        isUpdatingGroup: false,
      });

      // Update selected group if it's the current one
      if (selectedGroup && selectedGroup._id === groupId) {
        set({ selectedGroup: res.data.group });
      }

      toast.success("Group profile updated successfully");
      return { success: true, group: res.data.group };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update group profile";
      toast.error(errorMessage);
      set({ isUpdatingGroup: false });
      throw new Error(errorMessage);
    }
  },

  getMyGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data.groups });
      
      // Auto-join group rooms after loading groups
      setTimeout(() => {
        get().autoJoinGroupRooms();
      }, 100);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  getGroupMessages: async (groupId) => {
    set({ isGroupMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/group-messages/${groupId}`);
      set({ groupMessages: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load group messages");
    } finally {
      set({ isGroupMessagesLoading: false });
    }
  },

  sendGroupMessage: async (messageData) => {
    const { selectedGroup } = get();
    const { authUser } = useAuthStore.getState();

    if (!selectedGroup) {
      toast.error("No group selected");
      return;
    }

    set({ isSendingGroupMessage: true });

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser?._id,
      groupId: selectedGroup._id,
      text: messageData.text,
      image: messageData.image,
      file: messageData.file,
      fileName: messageData.fileName,
      fileSize: messageData.fileSize,
      messageType: messageData.image ? "image" : messageData.file ? "file" : "text",
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    // Immediately update the UI by adding the optimistic message
    set((state) => ({ 
      groupMessages: [...state.groupMessages, optimisticMessage] 
    }));

    try {
      const res = await axiosInstance.post(
        `/group-messages/send/${selectedGroup._id}`,
        messageData
      );

      // Use latest groupMessages from state to avoid stale closure
      const currentGroupMessages = get().groupMessages;
      
      // Remove the optimistic message and any duplicates of the real message
      const updatedMessages = currentGroupMessages.filter(msg => 
        msg._id !== tempId && msg._id !== res.data._id
      );
      
      // Add the real message from server response
      set({
        groupMessages: [...updatedMessages, res.data],
        isSendingGroupMessage: false,
      });

      console.log("Message sent successfully, optimistic message replaced");
    } catch (error) {
      // Remove optimistic message on failure
      set((state) => ({
        groupMessages: state.groupMessages.filter((m) => m._id !== tempId),
        isSendingGroupMessage: false,
      }));
      const errorMessage = error.response?.data?.message || "Failed to send message";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  subscribeToGroupMessages: () => {
    const { selectedGroup, isSoundEnabled } = get();
    const { authUser } = useAuthStore.getState();

    if (!selectedGroup) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Join the group room on the socket server
    socket.emit("joinGroup", selectedGroup._id);

    const groupHandler = (newMessage) => {
      if (newMessage.groupId !== selectedGroup._id) return;

      const currentMessages = get().groupMessages;
      
      // Check if message already exists (avoid duplicates)
      const messageExists = currentMessages.find((m) => m._id === newMessage._id);
      
      // For sender: if this is our own message from socket, check if we already have it from server response
      const isOwnMessage = newMessage.senderId?._id === authUser._id;
      
      if (isOwnMessage) {
        // For sender's own messages, we rely on server response, so ignore socket duplicates
        if (!messageExists) {
          set({ groupMessages: [...currentMessages, newMessage] });
        }
      } else {
        // For others' messages, add if not exists
        if (!messageExists) {
          set({ groupMessages: [...currentMessages, newMessage] });

          if (isSoundEnabled) {
            const notificationSound = new Audio("/sound/notification.mp3");
            notificationSound.currentTime = 0;
            notificationSound.play().catch((e) => console.log("Audio play failed:", e));
          }
        }
      }
    };

    const groupUpdatedHandler = (data) => {
      const { groups } = get();
      const updatedGroups = groups.map((g) => (g._id === data.group._id ? data.group : g));
      set({ groups: updatedGroups });

      const { selectedGroup } = get();
      if (selectedGroup && selectedGroup._id === data.group._id) {
        set({ selectedGroup: data.group });
      }
    };

    const removedFromGroupHandler = (data) => {
      const { groups, selectedGroup } = get();
      const updated = groups.filter((g) => g._id !== data.groupId);
      set({ groups: updated });

      if (selectedGroup && selectedGroup._id === data.groupId) {
        set({ selectedGroup: null });
        toast.success(`You were removed from group: ${data.groupName}`);
      }
    };

    socket.on("newGroupMessage", groupHandler);
    socket.on("groupUpdated", groupUpdatedHandler);
    socket.on("removedFromGroup", removedFromGroupHandler);

    // store handlers so unsubscribe can remove them precisely
    set({
      _private_groupHandlers: {
        groupHandler,
        groupUpdatedHandler,
        removedFromGroupHandler,
      },
    });
  },

  // COMPLETELY CORRECTED unsubscribeFromGroupMessages:
  unsubscribeFromGroupMessages: () => {
    const { selectedGroup, _private_groupHandlers } = get();
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    if (selectedGroup) {
      socket.emit("leaveGroup", selectedGroup._id);
    }

    if (_private_groupHandlers) {
      const { groupHandler, groupUpdatedHandler, removedFromGroupHandler } =
        _private_groupHandlers;
      socket.off("newGroupMessage", groupHandler);
      socket.off("groupUpdated", groupUpdatedHandler);
      socket.off("removedFromGroup", removedFromGroupHandler);
      set({ _private_groupHandlers: null });
    } else {
      // fallback: remove all listeners
      socket.off("newGroupMessage");
      socket.off("groupUpdated");
      socket.off("removedFromGroup");
    }
  },

  addMembersToGroup: async (groupId, memberIds) => {
    set({ isAddingMembers: true });
    try {
      const res = await axiosInstance.put(`/groups/${groupId}/members`, {
        memberIds,
      });

      // Update groups list
      const { groups, selectedGroup } = get();
      const updatedGroups = groups.map((group) =>
        group._id === groupId ? res.data.group : group
      );
      set({
        groups: updatedGroups,
        isAddingMembers: false,
      });

      // Update selected group if it's the current one
      if (selectedGroup && selectedGroup._id === groupId) {
        set({ selectedGroup: res.data.group });
      }

      toast.success("Members added successfully");
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to add members";
      toast.error(errorMessage);
      set({ isAddingMembers: false });
      throw new Error(errorMessage);
    }
  },

  removeMemberFromGroup: async (groupId, memberId) => {
    set({ isRemovingMember: true });
    try {
      const res = await axiosInstance.delete(`/groups/${groupId}/members/${memberId}`);

      const { groups, selectedGroup } = get();
      const updatedGroups = groups.map((group) =>
        group._id === groupId ? res.data.group : group
      );
      set({
        groups: updatedGroups,
        isRemovingMember: false,
      });

      if (selectedGroup && selectedGroup._id === groupId) {
        set({ selectedGroup: res.data.group });
      }

      toast.success("Member removed successfully");
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to remove member";
      toast.error(errorMessage);
      set({ isRemovingMember: false });
      throw new Error(errorMessage);
    }
  },

  leaveGroup: async (groupId) => {
    set({ isLeavingGroup: true });
    try {
      await axiosInstance.post(`/groups/${groupId}/leave`);

      const { groups, selectedGroup } = get();
      const updatedGroups = groups.filter((group) => group._id !== groupId);
      set({
        groups: updatedGroups,
        isLeavingGroup: false,
      });

      if (selectedGroup && selectedGroup._id === groupId) {
        set({ selectedGroup: null });
      }

      toast.success("You have left the group");
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to leave group";
      toast.error(errorMessage);
      set({ isLeavingGroup: false });
      throw new Error(errorMessage);
    }
  },

  transferGroupAdmin: async (groupId, newAdminId) => {
    set({ isUpdatingGroup: true });
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/transfer-admin`, {
        newAdminId,
      });

      // Update groups list
      const { groups, selectedGroup } = get();
      const updatedGroups = groups.map((group) =>
        group._id === groupId ? res.data.group : group
      );
      set({
        groups: updatedGroups,
        isUpdatingGroup: false,
      });

      // Update selected group if it's the current one
      if (selectedGroup && selectedGroup._id === groupId) {
        set({ selectedGroup: res.data.group });
      }

      toast.success("Admin role transferred successfully");
      return { success: true, group: res.data.group };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to transfer admin role";
      toast.error(errorMessage);
      set({ isUpdatingGroup: false });
      throw new Error(errorMessage);
    }
  },

  // Reaction functions - single unified implementation
  addReaction: async (messageId, emoji, messageType) => {
    try {
      const res = await axiosInstance.post("/reactions", {
        messageId,
        emoji,
        messageType,
      });
      return { success: true, reaction: res.data.reaction };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to add reaction";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  removeReaction: async (reactionId) => {
    try {
      await axiosInstance.delete(`/reactions/${reactionId}`);
      toast.success("Reaction removed");
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to remove reaction";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

 // In useChatStore.js - update the getMessageReactions function
getMessageReactions: async (messageId, messageType) => {
  // Skip API call for optimistic messages
  if (messageId.startsWith('temp-')) {
    console.log('Skipping reaction fetch for optimistic message:', messageId);
    return { success: true, reactions: {} };
  }

  try {
    const res = await axiosInstance.get(`/reactions/${messageId}/${messageType}`);
    return { success: true, reactions: res.data.reactions };
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to get reactions";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
},

  removeReactionByMessageAndEmoji: async (messageId, emoji, messageType) => {
    try {
      await axiosInstance.delete('/reactions', {
        data: { messageId, emoji, messageType }
      });
      toast.success("Reaction removed");
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to remove reaction";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },
}));