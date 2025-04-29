import { useParams, useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUserCircle } from "react-icons/fa";
import Chat from "./Chat";

const ChatPage = () => {
  const { friendId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const friendUsername = location.state?.friendUsername || "Unknown";

  return (
      <div className="h-screen flex flex-col bg-gray-100">
          {/* ✅ Chat Header with Sticky Position */}
          <div className="gradient
 text-white p-4 flex items-center shadow-md sticky top-0 z-50">
              <button 
                  onClick={() => navigate(-1)} 
                  className="mr-3 p-2 rounded-full hover:brightness-90
"
              >
                  <FaArrowLeft size={20} />
              </button>
              <FaUserCircle size={30} className="mr-2" />
              <h2 className="text-lg font-semibold">{friendUsername}</h2>
          </div>

          {/* ✅ Chat Component (Scrollable) */}
          <div className="flex-1 overflow-y-auto">
              <Chat receiverId={friendId} friendUsername={friendUsername} />
          </div>
      </div>
  );
};

export default ChatPage;
