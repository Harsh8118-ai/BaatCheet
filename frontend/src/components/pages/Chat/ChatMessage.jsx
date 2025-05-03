import React, { useState } from 'react';
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
  onReaction
}) => {
  // State for managing the reaction bar
  const [showReactionBar, setShowReactionBar] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState(null); // For storing the selected reaction

  // Fallback theme
  const theme = moodThemes[mood] || moodThemes['default'];

  // Format the timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get message status icon - use message.status directly from props
  const getStatusIcon = () => {
    if (!isOwn) return null;
    
    switch (message.status) {
      case 'sending':
        return <Clock size={14} className="text-gray-400" />;
      case 'sent':
        return <Check size={14} className="text-gray-400" />;
      case 'delivered':
        return <CheckCheck size={14} className="text-gray-400" />;
      case 'read':
        return <CheckCheck size={14} className="text-blue-500" />;
      case 'error':
        return <span className="text-red-500 text-xs">Failed</span>;
      default:
        return <Check size={14} className="text-gray-400" />;
    }
  };

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
            <div className={`${theme.accent} bg-opacity-20 p-2 rounded`}>
              <span className={`${theme.accent} text-opacity-100 font-bold`}>{message.fileType}</span>
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
      <div className="flex mt-1 gap-1">
        {Object.entries(reactionCounts).map(([type, count]) => (
          <div key={type} className={`bg-white rounded-full px-2 py-0.5 ${theme.shadow} text-xs flex items-center`}>
            <span>{type}</span>
            {count > 1 && <span className="ml-1">{count}</span>}
          </div>
        ))}
      </div>
    );
  };

  const handleMessageClick = () => {
    setShowReactionBar(true);  // Immediately show the reaction bar on click
    onClick();  // Trigger the parent click handler (for time display)
  };

  const handleReactionSelect = (reactionType) => {
    setSelectedReaction(reactionType);  // Store the selected reaction
    onReaction(reactionType);  // Pass reaction to parent for updating reactions
    setShowReactionBar(false);  // Hide reaction bar after selecting
  };

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}
      onClick={handleMessageClick} // Trigger the onClick event
    >
      <div
       className={`
        relative flex justify-end max-w-xs md:max-w-md px-4 py-2 mx-1 rounded-xl ${theme.shadow} transition-all
        ${isOwn ? theme.msgBgOwn : 'bg-white'} 
        ${isOwn ? theme.msgTextOwn : theme.text}
        ${isOwn ? 'self-end' : 'self-start'}
        hover:shadow-lg
      `}      
      >
        {renderMessageContent()}
        
          {getStatusIcon()}
        {/* <div className="flex items-center justify-end mt-1 space-x-1 text-xs opacity-70">
        </div> */}

        {/* Render reactions */}
        

        {/* Render time only if the message is clicked */}
        {clicked && (
          <div className="flex items-center justify-between mt-1 space-x-2 text-xs opacity-70">
            <span>{formatTime(message.createdAt)}{renderReactions()}</span>
          </div>
        )}

        {/* Render selected reaction emoji in the right bottom corner */}
        {/* {selectedReaction && (
          <div className="absolute bottom-0 right-0 -mr-1 -mb-1 flex items-center justify-center h-6 w-6 rounded-full bg-white shadow-md">
            <span className="text-sm">{selectedReaction}</span>
          </div>
        )} */}

        {/* If this message is clicked, show reaction options */}
        {clicked && showReactionBar && (
          <div className="absolute -bottom-10 left-0 right-0 z-10">
            <ReactionBar
              onReact={handleReactionSelect}
              showAllOptions
              isOwn={isOwn}
              theme={theme}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;