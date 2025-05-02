// components/MessageList.jsx
import ChatMessage from './ChatMessage';

const MessageList = ({
  messages,
  isLoading,
  userId,
  receiverId,
  mood,
  clickedMsgId,
  setClickedMsgId,
  handleReaction,
  messagesEndRef,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-full text-gray-400">
        No messages yet. Start the conversation!
      </div>
    );
  }

  return (
    <>
      {messages.map((msg) => (
        <div key={msg._id || `temp-${Date.now()}`} className="mb-1">
          <ChatMessage
            message={msg}
            isOwn={msg.senderId === userId}
            currentUser={{ _id: userId }}
            selectedContact={{ _id: receiverId }}
            mood={mood}
            onClick={() => setClickedMsgId(clickedMsgId === msg._id ? null : msg._id)}
            clicked={clickedMsgId === msg._id}
            onReaction={(reactionType) => handleReaction(msg._id, reactionType)}
          />
        </div>
      ))}
      <div ref={messagesEndRef} />
    </>
  );
};

export default MessageList;
