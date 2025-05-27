import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import socket from '../../store/socket';
import axios from 'axios';
import { useMood } from './MoodContext';
import { moodThemes } from '../../store/theme';
import useChatSocket from '../../store/useChatSocket';
import ChatHeader from './ChatHeader';
import TypingIndicator from './TypindIndicator';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import MoodPicker from './MoodPicker';
import EmojiPicker from './EmojiPicker/EmojiPicker';
import { handleKeyPress } from '../../store/useChatInput';

const ChatApp = () => {
  const { state } = useLocation();
  const { friendUsername } = state || {};
  const receiverId = window.location.pathname.split('/chat/')[1];
  const userId = localStorage.getItem('userId');
  const { mood, setMood } = useMood();
  const navigate = useNavigate();
  const currentTheme = moodThemes[mood]

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

  // Load the conversation when the component mounts
  useEffect(() => {
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

    loadConversation(); 
  }, [receiverId, userId]);

  //Load the currentMood 
  useEffect(() => {
    const fetchCurrentMood = async () => {
      try {
        const token = localStorage.getItem('token'); // Get the token from localStorage

        const res = await axios.get(`${BASE}/auth/user`, {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in the header
          },
        });

        // Access the user's current mood from the response data
        const liveMood = res.data?.user?.currentMood;


        if (liveMood) {
          setMood(liveMood); // Update the mood context with the live mood
        }
      } catch (error) {
        console.error("Error fetching mood:", error);
      }
    };

    fetchCurrentMood(); // Fetch current mood when the component mounts or mood picker is shown
  }, [showMoodPicker]);




  // Use custom hook for socket events
  useChatSocket({
    userId,
    receiverId,
    setMessages,
    setIsTyping,
    setIsFriendOnline,
  });



  useEffect(() => {
    if (messages.some(msg => msg.senderId === receiverId && msg.status !== 'read')) {
      socket.emit('markAsSeen', { userId, contactId: receiverId });
    }
  }, [messages, receiverId]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        formData.append('folder', `chat_uploads`);

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
        mood,
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
  // console.log(currentTheme.bg);


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
          currentMood={currentTheme.accent}
          currentText={currentTheme.text}
        />
        <TypingIndicator isTyping={isTyping} />
      </div>

      {/* Message list with proper padding */}
      <div className={`flex-1 overflow-y-auto px-4 mt-16 py-2 space-y-3 pb-20 ${currentTheme.bg} ${currentTheme.text}`}>
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
            userId={userId}
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
            onSelect={({ emoji, messageType, emojiSoundUrl }) => {
              const tempId = Date.now().toString();

              const payload = {
                senderId: userId,
                receiverId,
                tempId,
                message: emoji, // store emoji as message
                messageType,     // "emoji"
                emojiSoundUrl,   // sound to play
                mood,
              };

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
