import { useEffect, useRef, useState, memo, useCallback, useMemo } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import MessageReactions from "./MessageReactions";
import { ArrowLeftIcon } from "lucide-react";
import Logger from "../utils/logger";

// Memoized message bubble component with optimized props
const MemoizedMessageBubble = memo(({ message, isOwnMessage, authUser }) => {
  const messageTime = useMemo(() => {
    return new Date(message.createdAt).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [message.createdAt]);

  return (
    <div
      className={`chat ${isOwnMessage ? "chat-end" : "chat-start"} group`}
    >
      <div
        className={`chat-bubble relative max-w-xs md:max-w-md ${
          isOwnMessage
            ? "bg-cyan-600 text-white"
            : "bg-slate-800 text-slate-200"
        }`}
      >
        {message.image && (
          <img 
            src={message.image} 
            alt="Shared" 
            className="rounded-lg max-w-full h-auto max-h-48 object-cover" 
            loading="lazy"
          />
        )}
        {message.text && (
          <p className="mt-2 break-words text-sm md:text-base">{message.text}</p>
        )}
        
        <MessageReactions 
          messageId={message._id}
          messageType="private"
          currentReactions={message.reactions || {}}
        />
        
        <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
          {messageTime}
        </p>
      </div>
    </div>
  );
});

MemoizedMessageBubble.displayName = 'MemoizedMessageBubble';

// Main ChatContainer component
const ChatContainer = memo(function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    setSelectedUser,
    setSelectedGroup,
    subscribeToReactions,
    unsubscribeFromReactions,
  } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();
  const messageEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const prevMessagesLengthRef = useRef(0);

  // Enhanced mobile detection with throttling
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Optimized message fetching and subscription
  useEffect(() => {
    if (selectedUser && selectedUser._id) {
      Logger.debug('Fetching messages for user:', selectedUser._id);
      getMessagesByUserId(selectedUser._id);
      subscribeToMessages();
      subscribeToReactions();
    }

    return () => {
      Logger.debug('Cleaning up subscriptions');
      unsubscribeFromMessages();
      unsubscribeFromReactions();
    };
  }, [
    selectedUser, 
    getMessagesByUserId, 
    subscribeToMessages, 
    unsubscribeFromMessages,
    subscribeToReactions,
    unsubscribeFromReactions
  ]);

  // Optimized scroll behavior with conditional auto-scroll
  useEffect(() => {
    if (messageEndRef.current && messages.length > 0) {
      const isUserNearBottom = () => {
        const container = messagesContainerRef.current;
        if (!container) return true;
        
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        
        // Auto-scroll only if user is within 200px of bottom or new message is from them
        return distanceFromBottom < 200 || 
               messages[messages.length - 1]?.senderId === authUser._id ||
               messages.length !== prevMessagesLengthRef.current;
      };

      if (isUserNearBottom()) {
        messageEndRef.current.scrollIntoView({ 
          behavior: messages.length !== prevMessagesLengthRef.current ? "smooth" : "auto",
          block: "nearest"
        });
      }
      
      prevMessagesLengthRef.current = messages.length;
    }
  }, [messages, authUser._id]);

  const handleBackClick = useCallback(() => {
    Logger.debug('Back button clicked, clearing selected user/group');
    setSelectedUser(null);
    setSelectedGroup(null);
  }, [setSelectedUser, setSelectedGroup]);

  // Memoize message rendering for better performance
  const renderMessage = useCallback((msg) => {
    const isOwnMessage = msg.senderId === authUser._id;
    return (
      <MemoizedMessageBubble
        key={msg._id}
        message={msg}
        isOwnMessage={isOwnMessage}
        authUser={authUser}
      />
    );
  }, [authUser]);

  // Memoize messages array to prevent unnecessary re-renders
  const memoizedMessages = useMemo(() => messages, [messages]);

  // Memoize user online status
  const isUserOnline = useMemo(() => 
    onlineUsers.includes(selectedUser?._id), 
    [onlineUsers, selectedUser?._id]
  );

  // Guard clause to prevent rendering when no user is selected
  if (!selectedUser) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  Logger.debug('ChatContainer rendering with', memoizedMessages.length, 'messages');

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Enhanced Mobile Header */}
      {isMobile && (
        <div className="sticky top-0 z-30 bg-slate-900 border-b border-slate-700/50 chat-safe-area">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button 
                onClick={handleBackClick}
                className="flex-shrink-0 flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors touch-manipulation p-2 -ml-2"
                aria-label="Back to chats"
              >
                <ArrowLeftIcon className="size-5" />
              </button>
              
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`avatar ${isUserOnline ? "online" : "offline"}`}>
                  <div className="size-10 rounded-full flex-shrink-0 border-2 border-slate-600">
                    <img 
                      src={selectedUser.profilePic || "/avatar.png"} 
                      alt={selectedUser.fullName}
                      className="object-cover w-full h-full"
                      loading="eager"
                    />
                  </div>
                </div>
                
                <div className="min-w-0 flex-1">
                  <h3 className="text-slate-200 font-medium truncate text-base">
                    {selectedUser.fullName}
                  </h3>
                  <p className="text-slate-400 text-xs truncate">
                    {isUserOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Desktop Header */}
      {!isMobile && (
        <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50">
          <ChatHeader />
        </div>
      )}
      
      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className={`flex-1 overflow-y-auto mobile-scroll scrollbar-thin ${
          isMobile 
            ? 'px-3 py-3 pb-4 messages-container-mobile' 
            : 'px-4 md:px-6 py-4'
        }`}
      >
        {memoizedMessages.length > 0 && !isMessagesLoading ? (
          <div className={`space-y-3 md:space-y-4 ${!isMobile ? 'max-w-3xl mx-auto' : ''}`}>
            {memoizedMessages.map(renderMessage)}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      {/* Message Input */}
      <div className={`sticky bottom-0 z-10 bg-slate-900 border-t border-slate-700/50 ${
        isMobile ? 'pb-[env(safe-area-inset-bottom)]' : ''
      }`}>
        <MessageInput />
      </div>
    </div>
  );
});

ChatContainer.displayName = 'ChatContainer';

export default ChatContainer;