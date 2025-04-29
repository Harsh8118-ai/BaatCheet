const Message = require("../models/chat-model");

// 📩 Send Message & Save in DB
const sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, message } = req.body;
        if (!senderId || !receiverId || !message) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const conversationId = [senderId, receiverId].sort().join("_"); // Unique ID for chat

        const newMessage = new Message({ senderId, receiverId, message, conversationId });
        await newMessage.save();

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: "Error sending message" });
    }
};

// 📜 Get Messages Between Two Users
const getConversation = async (req, res) => {
    try {
        const { user1, user2 } = req.params;
        const conversationId = [user1, user2].sort().join("_");

        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: "Error fetching conversation" });
    }
};

module.exports = { sendMessage, getConversation };
