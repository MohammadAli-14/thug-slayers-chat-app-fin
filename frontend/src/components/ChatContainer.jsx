import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import MessageReactions from "./MessageReactions";
import { ArrowLeftIcon } from "lucide-react";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    setSelectedUser,
  } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();
  const messageEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Enhanced mobile detection
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

  useEffect(() => {
    if (selectedUser && selectedUser._id) {
      getMessagesByUserId(selectedUser._id);
      subscribeToMessages();
    }

    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages.length > 0) {
      messageEndRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "nearest"
      });
    }
  }, [messages]);

  const handleBackClick = () => {
    setSelectedUser(null);
  };

  // Guard clause to prevent rendering when no user is selected
  if (!selectedUser) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400">No user selected</p>
        </div>
      </div>
    );
  }

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
                <div className={`avatar ${onlineUsers.includes(selectedUser._id) ? "online" : "offline"}`}>
                  <div className="size-10 rounded-full flex-shrink-0 border-2 border-slate-600">
                    <img 
                      src={selectedUser.profilePic || "/avatar.png"} 
                      alt={selectedUser.fullName}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
                
                <div className="min-w-0 flex-1">
                  <h3 className="text-slate-200 font-medium truncate text-base">
                    {selectedUser.fullName}
                  </h3>
                  <p className="text-slate-400 text-xs truncate">
                    {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
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
        {messages.length > 0 && !isMessagesLoading ? (
          <div className={`space-y-3 md:space-y-4 ${!isMobile ? 'max-w-3xl mx-auto' : ''}`}>
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"} group`}
              >
                <div
                  className={`chat-bubble relative max-w-xs md:max-w-md ${
                    msg.senderId === authUser._id
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {msg.image && (
                    <img 
                      src={msg.image} 
                      alt="Shared" 
                      className="rounded-lg max-w-full h-auto max-h-48 object-cover" 
                    />
                  )}
                  {msg.text && <p className="mt-2 break-words text-sm md:text-base">{msg.text}</p>}
                  
                  <MessageReactions 
                    messageId={msg._id}
                    messageType="private"
                    currentReactions={msg.reactions || {}}
                  />
                  
                  <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
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
}

export default ChatContainer;