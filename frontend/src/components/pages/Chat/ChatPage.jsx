import { useParams, useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUserCircle } from "react-icons/fa";
import ChatApp from "./ChatApp";

const ChatPage = () => {
  const { friendId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const friendUsername = location.state?.friendUsername || "Unknown";

  return (
      <div className="h-screen flex flex-col bg-gray-100">
          {/* Chat Component (Scrollable) */}
          <div className="flex-1 overflow-y-auto">
              <ChatApp receiverId={friendId} friendUsername={friendUsername} />
          </div>
      </div>
  );
};

export default ChatPage;
