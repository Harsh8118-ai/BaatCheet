const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getConversation,
  markMessagesAsRead,
  setMood,
  getMood,
  getRecentChats,
} = require("../controllers/chat-controllers");
const Message = require("../models/chat-model");
const upload = require("../middlewares/upload");
const { sendFileMessage } = require("../controllers/file-message-controllers");

// 📩 Send Message & Save in DB
router.post("/send", sendMessage);

// New route for uploading any type of file message (image, voice, video, doc)
router.post("/send-file", upload.single("file"), sendFileMessage);

// 📜 Get Messages Between Two Users
router.get("/conversation/:user1/:user2", getConversation);

// Mark messages as 'read'
router.post("/mark-read", markMessagesAsRead);

// Set and Get Mood
router.post("/mood", setMood);
router.get("/mood/:userId", getMood);

// ❤️ React to a message
router.post("/message/:id/react", async (req, res) => {
  const { id } = req.params;
  const { userId, type } = req.body;

  try {
    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ error: "Message not found" });

    // Find existing reaction
    const existingIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId
    );

    if (existingIndex !== -1) {
      if (type === null) {
        // Remove reaction
        message.reactions.splice(existingIndex, 1);
      } else {
        // Update reaction
        message.reactions[existingIndex].type = type;
      }
    } else if (type !== null) {
      // Add new reaction only if type is not null
      message.reactions.push({ userId, type });
    } 

    await message.save();
    res.status(200).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error reacting to message" });
  }
});

// Get Chats List
router.get("/recent/:userId", getRecentChats);

module.exports = router;
