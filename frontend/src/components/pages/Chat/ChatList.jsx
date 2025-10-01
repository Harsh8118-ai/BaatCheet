import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useChatSocket from '../../store/useChatSocket';
import { Check, CheckCheck, Clock } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const ChatList = () => {
    const [chats, setChats] = useState([]);
    const [onlineUserIds, setOnlineUserIds] = useState([]);
    const [loading, setLoading] = useState(true); // ✅ loader state
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;

    // ✅ Initialize socket
    useChatSocket({
        userId,
        receiverId: null,
        setMessages: () => { },
        setIsTyping: () => { },
        setIsFriendOnline: () => { },
        setOnlineUserIds,
        setChats,
    });

    useEffect(() => {
        const fetchChats = async () => {
            try {
                setLoading(true); // show loader
                const res = await axios.get(`${BASE_URL}/chat/recent/${userId}`);
                setChats(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Error fetching chats:", err);
                setChats([]);
            } finally {
                setLoading(false); // hide loader
            }
        };

        if (userId) {
            fetchChats();
        }
    }, [userId]);

    const formatChatTimestamp = (timestamp) => {
        const messageDate = new Date(timestamp);
        const now = new Date();

        const msInDay = 24 * 60 * 60 * 1000;
        const isToday = now.toDateString() === messageDate.toDateString();
        const isYesterday = new Date(now - msInDay).toDateString() === messageDate.toDateString();

        if (isToday) {
            return messageDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
        } else if (isYesterday) {
            return "Yesterday";
        } else {
            return messageDate.toLocaleDateString('en-US', { weekday: 'long' });
        }
    };

    const handleMessage = (friendId, friendUsername, friendProfileUrl) => {
        navigate(`/chat/${friendId}`, {
            state: { friendUsername, friendProfileUrl }
        });
    };

    return (
        <div className="mt-4">
            <h2 className="text-xl font-semibold mb-4">Chats</h2>

            {/* ✅ Loader */}
            {loading ? (
                <div className="flex-1 flex items-center justify-center mt-44">
                    <div className="flex flex-col items-center text-gray-600">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                        <p className="mt-2 text-gray-700">Loading chats...</p>
                    </div>
                </div>
            ) : chats.length === 0 ? (
                <div className="flex-1 flex items-center justify-center mt-44">
                    <div className="text-center text-gray-600 px-6">
                        <p className="text-lg font-semibold text-gray-800">Click on the Add Friend button</p>
                        <p className="mt-1">Generate the invite code and enter your friend’s code.</p>
                        <p className="mt-1">And start chatting instantly 🚀</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {chats.map(chat => {
                        const otherUserId = chat.senderId.toString() === userId ? chat.receiverId : chat.senderId;
                        const isOnline = onlineUserIds.includes(otherUserId.toString());
                        const time = formatChatTimestamp(chat.createdAt);

                        return (
                            <div
                                key={chat._id}
                                className="flex items-center gap-4 cursor-pointer hover:bg-gray-100 p-2 rounded-lg relative"
                                onClick={() => handleMessage(otherUserId, chat.username, chat.profileUrl)}
                            >
                                <div className="relative w-14 h-14">
                                    {chat.profileUrl ? (
                                        <img
                                            src={chat.profileUrl}
                                            alt={`${chat.username}'s profile`}
                                            className="w-15 h-14 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-purple-400 to-blue-400 flex items-center justify-center text-white font-bold text-lg">
                                            {chat.username?.[0] || "U"}
                                        </div>
                                    )}

                                    <span
                                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 border-2 border-white' : 'bg-transparent'}`}
                                    />
                                </div>

                                <div className="flex-grow">
                                    <div className="font-medium">{chat.username || "Unknown"}</div>
                                    <div className="text-gray-500 text-sm truncate max-w-xs flex items-center gap-1 leading-tight">
                                        {chat.senderId.toString() === userId && (
                                            <span className="font-medium text-gray-700">You: </span>
                                        )}
                                        {chat.messageType === "emoji"
                                            ? `${chat.message.slice(0, 35)}${chat.message.length > 35 ? '...' : ''}`
                                            : `${chat.message.slice(0, 35)}${chat.message.length > 35 ? '...' : ''}`
                                        }
                                        {chat.senderId.toString() === userId && chat.status && (
                                            <span className="text-blue-500 text-xs ml-1">
                                                {chat.status === "read" ? (
                                                    <CheckCheck size={16} className="text-blue-500 text-xs" />
                                                ) : chat.status === "delivered" ? (
                                                    <Check size={16} className="text-gray-500 text-xs" />
                                                ) : (
                                                    <Clock />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-1 min-w-[48px]">
                                    <div className="text-xs text-gray-400 whitespace-nowrap">{time}</div>
                                    {chat.unreadCount > 0 && (
                                        <div className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
                                            {chat.unreadCount}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ChatList;
