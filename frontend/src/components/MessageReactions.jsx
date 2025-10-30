import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { SmileIcon, LoaderIcon } from "lucide-react";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "👏"];

function MessageReactions({ messageId, messageType, currentReactions = {} }) {
  const [showPicker, setShowPicker] = useState(false);
  const [reactions, setReactions] = useState(currentReactions);
  const [isLoading, setIsLoading] = useState(false);
  const { addReaction, removeReactionByMessageAndEmoji, getMessageReactions } = useChatStore();
  const { authUser, socket } = useAuthStore();

  // Initialize with current reactions and fetch latest
  useEffect(() => {
    setReactions(currentReactions);
    
    const fetchReactions = async () => {
      try {
        const result = await getMessageReactions(messageId, messageType);
        if (result.success) {
          setReactions(result.reactions);
        }
      } catch (error) {
        console.error("Failed to fetch reactions:", error);
      }
    };

    fetchReactions();
  }, [messageId, messageType, getMessageReactions]);

  // Enhanced socket listener for real-time updates - FIXED VERSION
  useEffect(() => {
    if (!socket) return;

    console.log(`Setting up reaction listeners for ${messageType} message: ${messageId}`);

    const handleReactionAdded = (data) => {
      console.log("Reaction added event received:", data);
      // Check if this event is for our message and type
      if (data.messageId === messageId && data.messageType === messageType) {
        setReactions(prev => {
          const newReactions = { ...prev };
          const emoji = data.reaction.emoji;
          
          if (!newReactions[emoji]) {
            newReactions[emoji] = [];
          }
          
          // Check if user already in the list to avoid duplicates
          const userExists = newReactions[emoji].some(
            user => user._id === data.reaction.userId._id
          );
          
          if (!userExists) {
            newReactions[emoji].push(data.reaction.userId);
          }
          
          return newReactions;
        });
      }
    };

    const handleReactionRemoved = (data) => {
      console.log("Reaction removed event received:", data);
      if (data.messageId === messageId && data.messageType === messageType) {
        setReactions(prev => {
          const newReactions = { ...prev };
          
          if (newReactions[data.emoji]) {
            newReactions[data.emoji] = newReactions[data.emoji].filter(
              user => user._id !== data.userId
            );
            
            // Remove emoji if no users left
            if (newReactions[data.emoji].length === 0) {
              delete newReactions[data.emoji];
            }
          }
          
          return newReactions;
        });
      }
    };

    socket.on("messageReactionAdded", handleReactionAdded);
    socket.on("messageReactionRemoved", handleReactionRemoved);

    return () => {
      socket.off("messageReactionAdded", handleReactionAdded);
      socket.off("messageReactionRemoved", handleReactionRemoved);
      console.log(`Cleaned up reaction listeners for ${messageType} message: ${messageId}`);
    };
  }, [socket, messageId, messageType]);

  const handleReactionClick = async (emoji) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // Check if user already reacted with this emoji
      const userReaction = reactions[emoji]?.some(user => user._id === authUser._id);

      if (userReaction) {
        // Remove reaction
        await removeReactionByMessageAndEmoji(messageId, emoji, messageType);
      } else {
        // Add reaction
        await addReaction(messageId, emoji, messageType);
      }
      
      setShowPicker(false);
    } catch (error) {
      console.error("Failed to handle reaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasUserReacted = (emoji) => {
    return reactions[emoji]?.some(user => user._id === authUser._id);
  };

  return (
    <div className="relative mt-2">
      {/* Reaction Display */}
      {Object.keys(reactions).length > 0 && (
        <div className="flex items-center gap-1 mb-2 flex-wrap">
          {Object.entries(reactions).map(([emoji, users]) => (
            <button
              key={emoji}
              onClick={() => handleReactionClick(emoji)}
              disabled={isLoading}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors ${
                hasUserReacted(emoji)
                  ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                  : "bg-slate-700/50 border-slate-600/50 text-slate-400 hover:bg-slate-600/50"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span>{emoji}</span>
              <span className="min-w-[8px] text-center">{users.length}</span>
            </button>
          ))}
        </div>
      )}

      {/* Reaction Picker */}
      <div className="relative inline-block">
        <button
          onClick={() => setShowPicker(!showPicker)}
          disabled={isLoading}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-slate-200 rounded disabled:opacity-50"
        >
          {isLoading ? (
            <LoaderIcon className="w-4 h-4 animate-spin" />
          ) : (
            <SmileIcon className="w-4 h-4" />
          )}
        </button>

        {showPicker && (
          <>
            {/* Backdrop to close picker when clicking outside */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowPicker(false)}
            />
            
            <div className="absolute bottom-full left-0 mb-2 bg-slate-800 border border-slate-700 rounded-lg p-2 shadow-lg z-50">
              <div className="flex gap-1 flex-wrap" style={{ width: '180px' }}>
                {EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleReactionClick(emoji)}
                    disabled={isLoading}
                    className="p-2 hover:bg-slate-700 rounded transition-colors text-lg disabled:opacity-50"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MessageReactions;