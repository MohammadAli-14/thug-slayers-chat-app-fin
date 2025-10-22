import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
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
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();

    // clean up
    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header Section - Always visible */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50">
        {/* Mobile Header with Back Button and User Info */}
        <div className="md:hidden flex items-center justify-between p-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button 
              onClick={() => setSelectedUser(null)}
              className="flex-shrink-0 flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeftIcon className="size-5" />
            </button>
            
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`avatar ${useAuthStore.getState().onlineUsers.includes(selectedUser._id) ? "online" : "offline"}`}>
                <div className="size-10 rounded-full flex-shrink-0">
                  <img 
                    src={selectedUser.profilePic || "/avatar.png"} 
                    alt={selectedUser.fullName}
                    className="object-cover"
                  />
                </div>
              </div>
              
              <div className="min-w-0 flex-1">
                <h3 className="text-slate-200 font-medium truncate text-sm">
                  {selectedUser.fullName}
                </h3>
                <p className="text-slate-400 text-xs truncate">
                  {useAuthStore.getState().onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Desktop Header - Hidden on mobile */}
        <div className="hidden md:block">
          <ChatHeader />
        </div>
      </div>
      
      {/* Messages Area - Scrollable */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 md:px-6 py-4"
        style={{ 
          height: 'calc(100vh - 140px)',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-4 md:space-y-6 pb-4">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}
              >
                <div
                  className={`chat-bubble relative ${
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
                  {msg.text && <p className="mt-2 break-words">{msg.text}</p>}
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

      {/* Sticky Message Input - Always at bottom */}
      <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/50">
        <MessageInput />
      </div>
    </div>
  );
}

export default ChatContainer;