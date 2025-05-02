import React, { useEffect, useState } from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';
import ReactionBar from './ReactionBar';
import { moodThemes } from './theme';

const ChatMessage = ({ 
  message, 
  isOwn, 
  currentUser, 
  selectedContact, 
  mood, 
  onClick, 
  clicked,
  onReaction,
  socket // Add socket prop to listen to status updates
}) => {
  // Fallback theme
  const theme = moodThemes[mood] || moodThemes['default'];

  // State to track message status
  const [messageStatus, setMessageStatus] = useState(message.status);

  // Format the timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get message status icon
  const getStatusIcon = () => {
    if (!isOwn) return null;
    
    switch (messageStatus) {
      case 'sending':
        return <Clock size={14} className="text-gray-400" />;
      case 'sent':
        return <Check size={14} className="text-gray-400" />;
      case 'delivered':
        return <Check size={14} className="text-gray-400" />;
      case 'read':
        return <CheckCheck size={14} className="text-blue-500" />;
      case 'error':
        return <span className="text-red-500 text-xs">Failed</span>;
      default:
        return <Check size={14} className="text-gray-400" />;
    }
  };

  // Listen for status updates via socket
  useEffect(() => {
    if (socket) {
      socket.on('message:statusUpdate', (updatedMessage) => {
        if (updatedMessage._id === message._id) {
          setMessageStatus(updatedMessage.status);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('message:statusUpdate');
      }
    };
  }, [socket, message._id]);

  // Render the message content based on its type
  const renderMessageContent = () => {
    switch (message.messageType) {
      case 'image':
        return (
          <img 
            src={message.fileUrl} 
            alt="Image" 
            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          />
        );
      case 'voice':
        return (
          <audio 
            controls 
            src={message.audioUrl} 
            className="max-w-full"
          />
        );
      case 'file':
        return (
          <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg">
            <div className="bg-blue-100 p-2 rounded">
              <span className="text-blue-500 font-bold">{message.fileType}</span>
            </div>
            <div>
              <p className="font-medium">Document</p>
              <p className="text-xs text-gray-500">Click to download</p>
            </div>
          </div>
        );
      default:
        return <p className="break-words">{message.message}</p>;
    }
  };

  // Render reaction counts if any
  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0) return null;
    
    const reactionCounts = message.reactions.reduce((acc, reaction) => {
      acc[reaction.type] = (acc[reaction.type] || 0) + 1;
      return acc;
    }, {});
    
    return (
      <div className="flex mt-1 space-x-1">
        {Object.entries(reactionCounts).map(([type, count]) => (
          <div key={type} className="bg-white rounded-full px-2 py-0.5 shadow-sm text-xs flex items-center">
            <span>{type}</span>
            {count > 1 && <span className="ml-1">{count}</span>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
      onClick={onClick}
    >
      <div
        className={`max-w-xs md:max-w-md px-4 py-2 rounded-xl shadow-sm cursor-pointer transition-all ${
          isOwn ? theme.ownMessageBg : theme.otherMessageBg
        }`}
      >
        {renderMessageContent()}

        <div className="flex items-center justify-between mt-1 space-x-2 text-xs text-gray-500">
          <span>{formatTime(message.createdAt)}</span>
          {getStatusIcon()}
        </div>

        {/* Reactions bar */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="mt-1">
            <ReactionBar
              reactions={message.reactions}
              onReact={(reactionType) => onReaction(reactionType)}
              isOwn={isOwn}
            />
          </div>
        )}

        {/* If this message is clicked, show reaction options */}
        {clicked && (
          <div className="mt-2">
            <ReactionBar
              onReact={(reactionType) => onReaction(reactionType)}
              showAllOptions
              isOwn={isOwn}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
