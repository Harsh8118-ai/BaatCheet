import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
  const typingTimeoutRef = useRef(null);
  const BASE = import.meta.env.VITE_BACKEND_URL;
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const PRESET = import.meta.env.VITE_CLOUDINARY_PRESET_NAME;


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

    socket.on('messageDelivered', ({ messageId, tempId }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === tempId ? { ...msg, _id: messageId, status: 'delivered' } : msg
        )
      );
    });


    socket.on('messageReceived', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('typing', ({ senderId }) => {
      if (senderId === receiverId) {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    });


    socket.on('messagesSeen', ({ by }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId === by ? { ...msg, status: 'seen' } : msg
        )
      );
    });

    socket.on('messageReaction', ({ messageId, type, userId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
              ...msg,
              reactions: msg.reactions?.some((r) => r.userId === userId)
                ? msg.reactions.map((r) =>
                  r.userId === userId ? { ...r, type } : r
                )
                : [...(msg.reactions || []), { userId, type }],
            }
            : msg
        )
      );
    });


    // Add the message:statusUpdate event listener here
    socket.on('message:statusUpdate', (updatedMessage) => {
      console.log('Received message status update:', updatedMessage);

      // Ensure the ID is a string for consistent comparison
      const messageId = updatedMessage._id.toString();

      setMessages((prevMessages) => {
        return prevMessages.map((msg) => {
          // Ensure consistent ID comparison by converting both to strings
          const msgId = msg._id.toString();

          if (msgId === messageId) {
            console.log(`Updating message ${msgId} status to ${updatedMessage.status}`);
            return { ...msg, status: updatedMessage.status };
          }
          return msg;
        });
      });
    });
    loadConversation();

    return () => {
      socket.off('onlineUsers');
      socket.off('userOnline');
      socket.off('userOffline');
      socket.off('messageReceived');
      socket.off('typing');
      socket.off('messagesSeen');
      socket.off('messageDelivered');
      socket.off('messageReaction');
      socket.off('message:statusUpdate');
      socket.disconnect();
    };
  }, [userId, receiverId]);


  useEffect(() => {
    if (messages.some(msg => msg.senderId === receiverId && msg.status !== 'read')) {
      socket.emit('markAsSeen', { userId, contactId: receiverId });
    }
  }, [messages, receiverId]);


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



  const handleTyping = () => {
    socket.emit('typing', { senderId: userId, receiverId });
  };


  const onKeyPress = (e) => handleKeyPress(e, handleSendMessage);
  

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !file && !isRecording) return;

    const tempId = Date.now().toString();
    let fileUrl = null;
    let messageType = 'text';
    let fileType = null;

    try {
      // 1. Upload file to Cloudinary if exists
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', PRESET);

        const uploadRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
          formData
        );


        fileUrl = uploadRes.data.secure_url;
        const ext = file.name.split('.').pop().toLowerCase();
        

        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) messageType = 'image';
        else if (['mp3', 'wav', 'ogg'].includes(ext)) messageType = 'voice';
        else {
          messageType = 'file';
          fileType = ext;
        }
      }

      // 2. Prepare message payloadx`
      const payload = {
        senderId: userId,
        receiverId,
        tempId,
        message: inputValue || '', // Text still included
        messageType,
        fileUrl,
        fileType,
      };

      // 3. Emit message via socket
      socket.emit('sendMessage', payload);

      // 4. Optimistic UI update
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

      // Clear input field and file state
      setInputValue('');
      setFile(null);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };



  const handleReaction = async (messageId, reactionType) => {
    try {
      await axios.post(`${BASE}/chat/message/${messageId}/react`, { userId, type: reactionType });

      // Emit socket event to notify others
      socket.emit('reactMessage', { messageId, type: reactionType, userId });

      // Update local state for sender
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

  return (<>
    <div className={`flex flex-col h-screen ${currentTheme.bg} ${currentTheme.text}`}>
      {/* Fixed header at the top */}
      <div className="sticky top-0 z-10">
        <ChatHeader
          friendUsername={friendUsername}
          setShowMoodPicker={setShowMoodPicker}
          showMoodPicker={showMoodPicker}
          isFriendOnline={isFriendOnline}
          isTyping={isTyping}
          onBack={() => navigate(-1)}
        />
        <TypingIndicator isTyping={isTyping} />
      </div>
      
      {/* Message list with proper padding */}
      <div className="flex-1 overflow-y-auto px-4 mt-16 py-2 space-y-3 pb-20">
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
      
      {/* Fixed input at the bottom */}
      <div className="sticky bottom-0 z-10">
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
    </div>
  </>
  );
};

export default ChatApp;
