const Message = require("../models/chat-model");

// 📩 Send Message & Save in DB
const sendMessage = async (req, res) => {
  try {
    const {
      senderId,
      receiverId,
      message,
      messageType = "text", // default to text
      fileUrl,
      fileType,
      audioUrl,
    } = req.body;

    if (!senderId || !receiverId || !messageType) {
      return res.status(400).json({ error: "senderId, receiverId, and messageType are required" });
    }

    const conversationId = [senderId, receiverId].sort().join("_");

    const newMessage = new Message({
      senderId,
      receiverId,
      messageType,
      conversationId,
      message: message || "", // fallback for text/emoji
      fileUrl,
      fileType,
      audioUrl,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
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

// ✅ Mark Messages as "read"
const markMessagesAsRead = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    if (!senderId || !receiverId) {
      return res.status(400).json({ error: "senderId and receiverId are required" });
    }

    const conversationId = [senderId, receiverId].sort().join("_");

    const result = await Message.updateMany(
      { conversationId, senderId, receiverId, status: { $ne: "read" } },
      { $set: { status: "read" } }
    );

    res.status(200).json({ message: "Messages marked as read", modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating message status" });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  markMessagesAsRead,
};
