import React, { useState, useEffect, useRef } from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';
import ReactionBar from './ReactionBar';
import { moodThemes } from '../../store/theme';
import VoiceMessagePlayer from './VoiceMessagePlayer';

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
  const [showReactionBar, setShowReactionBar] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState(null);

  const theme = moodThemes[message.mood] || moodThemes['default'];

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
 
  const renderMessageContent = () => {
    switch (message.messageType) {
      case 'image':
        return (
          <img
            src={message.fileUrl}
            alt="Image"
            className="w-full max-w-md sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          />
        );
      case 'voice':
        return (
          <VoiceMessagePlayer src={message.fileUrl || message.audioUrl} createdAt={message.createdAt} />
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
      case 'emoji':
        return (
          <div className="flex items-center gap-2">
            <p className="text-3xl">{message.message}</p>
            {!isOwn && message.emojiSoundUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  new Audio(message.emojiSoundUrl).play();
                }}
                className="text-gray-500 hover:text-gray-800"
                title="Replay Sound"
              >
                🔊
              </button>
            )}
          </div>
        );
      default:
        return <p className="break-words">{message.message}</p>;
    }
  };

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
    setShowReactionBar(true);
    onClick();
  };

  const handleReactionSelect = (reactionType) => {
    setSelectedReaction(reactionType);
    onReaction(reactionType);
    setShowReactionBar(false);
  };

  const hasPlayedRef = useRef(false);
  const playedEmojiMessages = new Set();

  useEffect(() => {
    if (
      message.messageType === 'emoji' &&
      message.emojiSoundUrl &&
      !isOwn &&
      message.status !== 'read'
    ) {
      const audio = new Audio(message.emojiSoundUrl);
      audio.play()
        .catch(err => console.error("Emoji sound play error:", err));
    }
  }, [message]);



  return (
    <div
      className={`flex flex-col items-${isOwn ? 'end' : 'start'} mb-3`}
      onClick={handleMessageClick}
    >
      <div
        className={`relative flex flex-col justify-end max-w-xs md:max-w-md px-4 py-2 mx-1 rounded-xl transition-all
    ${message.messageType !== 'emoji' ? `
      ${theme.shadow} 
      ${isOwn ? theme.msgBgOwn : theme.msgBgReceiver} 
      ${isOwn ? theme.msgTextOwn : theme.msgTextReceiver} 
      ${isOwn ? 'self-end' : 'self-start'} 
      hover:shadow-lg
    ` : ''}
  `}
      >

        {renderMessageContent()}
        {renderReactions()}

        {clicked && showReactionBar && (
          <div className={`absolute -top-10 ${isOwn ? 'right-0' : 'left-0'} z-10`}>
            <ReactionBar
              onReact={handleReactionSelect}
              currentUserReaction={message.reactions?.find(r => r.userId === currentUser._id)?.type || null}
              showAllOptions
              isOwn={isOwn}
              theme={theme}
            />
          </div>
        )}
      </div>

      {clicked && (
        <div className="flex mt-1 space-x-2 text-xs opacity-70">
          <span>{getStatusIcon()} &nbsp;</span>
          <span>{formatTime(message.createdAt)}</span>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
