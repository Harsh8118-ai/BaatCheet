import { useParams, useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUserCircle } from "react-icons/fa";
import ChatApp from "./ChatApp";
import { EmojiVoiceProvider } from "./EmojiPicker/EmojiVoiceContext";

const ChatPage = () => {
  const { friendId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const friendUsername = location.state?.friendUsername || "Unknown";
  const friendProfileUrl = location.state?.friendProfileUrl || null;


  return (
    <EmojiVoiceProvider>
      <div className="h-screen flex flex-col bg-gray-100">
        {/* Chat Component (Scrollable) */}
        <div className="flex-1 overflow-y-auto">
          <ChatApp
            receiverId={friendId}
            friendUsername={friendUsername}
            friendProfileUrl={friendProfileUrl}
          />

        </div>
      </div>
    </EmojiVoiceProvider>
  );
};

export default ChatPage;
