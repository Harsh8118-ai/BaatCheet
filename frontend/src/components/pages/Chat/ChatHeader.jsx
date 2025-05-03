// components/ChatHeader.jsx
import { Moon, ArrowLeft } from 'lucide-react';


const ChatHeader = ({
  friendUsername,
  setShowMoodPicker,
  showMoodPicker,
  isFriendOnline,
  isTyping,
  onBack,
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-20 flex justify-between items-center px-4 py-3 bg-white shadow-md border-b border-gray-200">
      {/* Left Section: Back button (for mobile), Avatar, and Username */}
      <div className="flex items-center space-x-3 min-w-0">
        {/* Back Button on small screens */}
        <button
          onClick={onBack || (() => console.log('No onBack handler'))}
          className="text-gray-600 hover:text-black"
        >
          <ArrowLeft size={20} />
        </button>


        {/* Avatar with online indicator */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold text-lg">
            {friendUsername?.charAt(0) || 'C'}
          </div>
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isFriendOnline ? 'bg-green-400' : 'bg-gray-400'
              }`}
          />
        </div>

        {/* User Info */}
        <div className="truncate">
          <h3 className="font-medium text-base truncate">
            {friendUsername || 'Contact'}
          </h3>
          <p className="text-xs text-gray-500">
            {isTyping ? 'Typing...' : isFriendOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Right Section: Mood + Media buttons */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setShowMoodPicker(!showMoodPicker)}
          className="text-gray-500 hover:text-gray-700"
          title="Mood Picker"
        >
          <Moon size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
