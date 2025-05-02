import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import socket from './socket';
import axios from 'axios';
import { useMood } from './MoodContext';
import { moodThemes } from './theme';

import ChatHeader from './ChatHeader';
import TypingIndicator from './TypindIndicator';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import MoodPicker from './MoodPicker';
import EmojiPicker from './EmojiPicker';
import { handleKeyPress } from './useChatInput';

const ChatApp = () => {
  const { state } = useLocation();
  const { friendUsername } = state || {};
  const receiverId = window.location.pathname.split('/chat/')[1];
  const userId = localStorage.getItem('userId');
  const { mood, setMood } = useMood();
  const currentTheme = moodThemes[mood] || moodThemes['professional'];

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [file, setFile] = useState(null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [clickedMsgId, setClickedMsgId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFriendOnline, setIsFriendOnline] = useState(false);
  const messagesEndRef = useRef(null);
  const BASE = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    socket.connect();
    socket.emit('join', userId);
  
    socket.on('onlineUsers', (onlineUserIds) => {
      setIsFriendOnline(onlineUserIds.includes(receiverId));
    });
  
    socket.on('userOnline', (onlineUserId) => {
      if (onlineUserId === receiverId) {
        setIsFriendOnline(true);
      }
    });
  
    socket.on('userOffline', (offlineUserId) => {
      if (offlineUserId === receiverId) {
        setIsFriendOnline(false);
      }
    });
  
    socket.on('messageReceived', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
  
    socket.on('typing', ({ senderId }) => {
      if (senderId === receiverId) {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      }
    });
  
    socket.on('messagesSeen', ({ by }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId === by ? { ...msg, status: 'seen' } : msg
        )
      );
    });
  
    // Add the message:statusUpdate event listener here
    socket.on('message:statusUpdate', (updatedMessage) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === updatedMessage._id
            ? { ...msg, status: updatedMessage.status }
            : msg
        )
      );
    });
  
    loadConversation();
  
    return () => {
      socket.off('onlineUsers');
      socket.off('userOnline');
      socket.off('userOffline');
      socket.off('messageReceived');
      socket.off('typing');
      socket.off('messagesSeen');
      socket.off('message:statusUpdate');  // Cleanup on unmount
      socket.disconnect();
    };
  }, [userId, receiverId]);
  

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.senderId === receiverId) {
      socket.emit('markAsSeen', { userId, contactId: receiverId });
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${BASE}/chat/conversation/${userId}/${receiverId}`);
      setMessages(res.data);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const typingTimeoutRef = useRef(null);


  const handleTyping = () => {
    socket.emit('typing', { senderId: userId, receiverId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false); // Stop showing typing after delay
    }, 3000); // 3 seconds
  };

  const onKeyPress = (e) => handleKeyPress(e, handleSendMessage);
  const tempId = Date.now().toString();

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !file && !isRecording) return;
    try {
      const payload = {
        senderId: userId,
        receiverId,
        message: inputValue,
        messageType: 'text',
        tempId,
      };
      if (file) {
        const ext = file.name.split('.').pop();
        payload.fileUrl = URL.createObjectURL(file);
        payload.messageType =
          ['jpg', 'jpeg', 'png', 'gif'].includes(ext) ? 'image' :
            ['mp3', 'wav', 'ogg'].includes(ext) ? 'voice' : 'file';
        if (payload.messageType === 'file') payload.fileType = ext;
      }

      socket.emit('sendMessage', payload);
      
      setMessages((prev) => [
        ...prev,
        {
          ...payload,
          _id: tempId,
          createdAt: new Date().toISOString(),
          status: 'sending',
          reactions: [],
        },
      ]);
      setInputValue('');
      setFile(null);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleReaction = async (messageId, reactionType) => {
    try {
      await axios.post(`${BASE}/chat/message/${messageId}/react`, { userId, type: reactionType });
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
              ...msg,
              reactions: msg.reactions?.some((r) => r.userId === userId)
                ? msg.reactions.map((r) =>
                  r.userId === userId ? { ...r, type: reactionType } : r
                )
                : [...(msg.reactions || []), { userId, type: reactionType }],
            }
            : msg
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const toggleRecording = () => setIsRecording(!isRecording);

  return (
    <div className={`flex flex-col h-screen ${currentTheme.bg} ${currentTheme.text}`}>
      <ChatHeader
        friendUsername={friendUsername}
        setShowMoodPicker={setShowMoodPicker}
        showMoodPicker={showMoodPicker}
        isFriendOnline={isFriendOnline}
        isTyping={isTyping}
      />

      <TypingIndicator isTyping={isTyping} />
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          userId={userId}
          receiverId={receiverId}
          mood={mood}
          clickedMsgId={clickedMsgId}
          setClickedMsgId={setClickedMsgId}
          handleReaction={handleReaction}
          messagesEndRef={messagesEndRef}
        />
      </div>
      {showMoodPicker && (
        <MoodPicker
          currentMood={mood}
          onSelect={(m) => {
            setMood(m);
            setShowMoodPicker(false);
          }}
          onClose={() => setShowMoodPicker(false)}
        />
      )}
      {showEmojiPicker && (
        <EmojiPicker
          onSelect={(emoji) => {
            setInputValue((prev) => prev + emoji);
            setShowEmojiPicker(false);
          }}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}
      <MessageInput
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleKeyPress={onKeyPress}
        handleTyping={handleTyping}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        file={file}
        setFile={setFile}
        handleSendMessage={handleSendMessage}
        isRecording={isRecording}
        toggleRecording={toggleRecording}
      />
    </div>
  );
};

export default ChatApp;
