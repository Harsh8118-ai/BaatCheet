import { useEffect, useRef } from 'react';
import socket from './socket';

const useChatSocket = ({
  userId,
  receiverId,
  setMessages,
  setIsTyping,
  setIsFriendOnline,
}) => {
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    socket.connect();
    socket.emit('join', userId);

    socket.on('onlineUsers', (onlineUserIds) => {
      setIsFriendOnline(onlineUserIds.includes(receiverId));
    });

    socket.on('userOnline', (id) => {
      if (id === receiverId) setIsFriendOnline(true);
    });

    socket.on('userOffline', (id) => {
      if (id === receiverId) setIsFriendOnline(false);
    });

    socket.on('messageDelivered', ({ messageId, tempId }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === tempId ? { ...msg, _id: messageId, status: 'delivered' } : msg
        )
      );
    });

    socket.on('messageReceived', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('typing', ({ senderId }) => {
      if (senderId === receiverId) {
        setIsTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      }
    });

    socket.on('messagesSeen', ({ by }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.senderId === by ? { ...msg, status: 'seen' } : msg
        )
      );
    });

    socket.on('messageReaction', ({ messageId, type, userId }) => {
      setMessages(prev =>
        prev.map(msg => {
          if (msg._id !== messageId) return msg;

          const existing = msg.reactions?.find(r => r.userId === userId);
          if (type === null) {
            return { ...msg, reactions: msg.reactions?.filter(r => r.userId !== userId) || [] };
          } else if (existing) {
            return {
              ...msg,
              reactions: msg.reactions.map(r =>
                r.userId === userId ? { ...r, type } : r
              ),
            };
          } else {
            return { ...msg, reactions: [...(msg.reactions || []), { userId, type }] };
          }
        })
      );
    });

    socket.on('message:statusUpdate', (updatedMessage) => {
      const messageId = updatedMessage._id.toString();
      setMessages(prev =>
        prev.map(msg =>
          msg._id.toString() === messageId
            ? { ...msg, status: updatedMessage.status }
            : msg
        )
      );
    });

    return () => {
      socket.off('onlineUsers');
      socket.off('userOnline');
      socket.off('userOffline');
      socket.off('messageDelivered');
      socket.off('messageReceived');
      socket.off('typing');
      socket.off('messagesSeen');
      socket.off('messageReaction');
      socket.off('message:statusUpdate');
      socket.disconnect();
    };
  }, [userId, receiverId]);
};

export default useChatSocket;
