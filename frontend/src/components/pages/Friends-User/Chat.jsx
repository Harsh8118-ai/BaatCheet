import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { motion } from "framer-motion";
import { FaPaperPlane } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa"; // Default user icon

const Chat = () => {
    const location = useLocation();
    const { friendUsername } = location.state || {};
    const receiverId = location.pathname.split("/chat/")[1];
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [socket, setSocket] = useState(null);
    const [clickedMsgId, setClickedMsgId] = useState(null); // For timestamp toggle

    const userId = localStorage.getItem("userId");
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;


    // ✅ Initialize Socket.io connection
    useEffect(() => {
        const newSocket = io("http://localhost:5000");
        setSocket(newSocket);
        return () => newSocket.disconnect();
    }, []);

    // ✅ Listen for incoming messages
    useEffect(() => {
        if (!userId || !socket) return;
        socket.emit("join", userId);

        const handleMessageReceived = (data) => {
            setChat((prev) => [...prev, data]);
        };

        socket.on("messageReceived", handleMessageReceived);
        return () => socket.off("messageReceived", handleMessageReceived);
    }, [userId, socket]);

    // ✅ Fetch chat history
    useEffect(() => {
        if (!userId || !receiverId) return;

        axios.get(`${BASE_URL}/chat/conversation/${userId}/${receiverId}`)
            .then(res => setChat(res.data))
            .catch(err => console.error("Error fetching messages:", err));
    }, [userId, receiverId]);

    // ✅ Send message
    const sendMessage = () => {
        if (message.trim() && receiverId && socket) {
            const newMessage = { senderId: userId, receiverId, message, createdAt: new Date().toISOString() };

            setChat((prev) => [...prev, newMessage]);

            socket.emit("sendMessage", newMessage);

            axios.post(`${BASE_URL}/chat/send`, newMessage)
                .then(res => console.log("✅ Message saved:", res.data))
                .catch(err => console.error("❌ Error sending message:", err));

            setMessage("");
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-blue-200 to-white">
            {/* ✅ Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chat.map((msg, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-center ${msg.senderId === userId ? "justify-end" : "justify-start"
                            }`}
                    >
                        {/* ✅ Receiver's Message (Left side) */}
                        {msg.senderId !== userId && (
                            <FaUserCircle className="text-gray-500 text-xl sm:text-2xl md:text-3xl mr-2" />
                        )}

                        <div
                            className={`relative p-2 sm:p-3 max-w-xs sm:max-w-sm md:max-w-md rounded-xl text-white shadow-lg cursor-pointer ${msg.senderId === userId ? "gradient" : "bg-gray-500"
                                }`}
                            onClick={() => setClickedMsgId(clickedMsgId === msg._id ? null : msg._id)}
                        >
                            <p className="text-xs sm:text-sm">{msg.message}</p>

                            {/* ✅ Show timestamp only when clicked */}
                            {clickedMsgId === msg._id && (
                                <p className="mt-1 text-[10px] sm:text-xs text-gray-300 text-center">
                                    {new Date(msg.createdAt).toLocaleString()}
                                </p>
                            )}
                        </div>

                        {/* ✅ Sender's Message (Right side) */}
                        {msg.senderId === userId && (
                            <FaUserCircle className="text-blue-500 text-xl sm:text-2xl md:text-3xl ml-2" />
                        )}
                    </motion.div>
                ))}
            </div>

            {/* ✅ Message Input Box (Sticky at Bottom) */}
            <div className="sticky bottom-6 bg-gray-200 p-2 sm:p-3 shadow-md flex items-center rounded-t-xl">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 p-2 sm:p-3 text-xs sm:text-sm md:text-base rounded-full border border-gray-300 focus:outline-none"
                />
                <button
                    onClick={sendMessage}
                    className="ml-2 sm:ml-3 gradient
 text-white p-2 sm:p-3 rounded-full hover:brightness-90
"
                >
                    <FaPaperPlane size={14} sm:size={18} />
                </button>
            </div>
        </div>
    );
};

export default Chat;
