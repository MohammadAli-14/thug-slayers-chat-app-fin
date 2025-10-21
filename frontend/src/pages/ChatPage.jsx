import { useChatStore } from "../store/useChatStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();

  return (
    <div className="w-full h-screen bg-slate-900">
      <div className="relative w-full h-full max-w-6xl mx-auto">
        <BorderAnimatedContainer>
          <div className="w-full h-full flex flex-col md:flex-row">
            {/* LEFT SIDE - Hidden on mobile when chat is open */}
            <div className={`
              ${selectedUser ? 'hidden md:flex' : 'flex'}
              w-full md:w-80 flex-col
              bg-slate-800/50 backdrop-blur-sm
            `}>
              <ProfileHeader />
              <ActiveTabSwitch />

              <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2">
                {activeTab === "chats" ? <ChatsList /> : <ContactList />}
              </div>
            </div>

            {/* RIGHT SIDE - Full screen on mobile when chat is open */}
            <div className={`
              ${selectedUser ? 'flex' : 'hidden md:flex'}
              flex-1 flex-col bg-slate-900/50 backdrop-blur-sm
            `}>
              {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default ChatPage;