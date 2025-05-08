const Message = require("../models/chat-model");
const User = require("../models/user-model");

// 📩 Send Message & Save in DB
const sendMessage = async (req, res) => {
  try {
    const {
      senderId,
      receiverId,
      message,
      messageType = "text",
      fileUrl,
      fileType,
      audioUrl,
    } = req.body;

    if (!senderId || !receiverId || !messageType) {
      return res.status(400).json({ error: "senderId, receiverId, and messageType are required" });
    }

    const conversationId = [senderId, receiverId].sort().join("_");

    // ✅ Fetch current mood of the sender
    const sender = await User.findById(senderId).select("currentMood");
    if (!sender || !sender.currentMood) {
      return res.status(400).json({ error: "Sender not found or no current mood set" });
    }
    const mood = sender.currentMood;

    console.log("Sender mood:", sender?.currentMood);


    const newMessage = new Message({
      senderId,
      receiverId,
      messageType,
      conversationId,
      message: message || "",
      fileUrl,
      fileType,
      audioUrl,
      mood, // Use the fetched mood
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

// Mark Messages as "read"
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

// Set Mood
const setMood = async (req, res) => {
  const { userId, mood } = req.body;
  if (!userId || !mood) {
    return res.status(400).json({ error: "userId and mood are required" });
  }

  try {
    // Update User's current mood (you must add `currentMood` to your user model)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { currentMood: mood },
      { new: true }
    ).select("username currentMood");



    return res.status(200).json({
      message: "Mood set successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to set mood" });
  }
};

// Get Mood
const getMood = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const user = await User.findById(userId).select("currentMood");
    const mood = user?.currentMood || "happy";
    return res.status(200).json({ mood });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to get mood" });
  }
};


module.exports = {
  sendMessage,
  getConversation,
  markMessagesAsRead,
  setMood,
  getMood,
};
