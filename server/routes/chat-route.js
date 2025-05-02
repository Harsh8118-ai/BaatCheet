const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getConversation,
  markMessagesAsRead,
} = require("../controllers/chat-controllers");
const Message = require("../models/chat-model");

// 📩 Send Message & Save in DB
router.post("/send", sendMessage);

// 📜 Get Messages Between Two Users
router.get("/conversation/:user1/:user2", getConversation);

// ✅ Mark messages as 'read'
router.post("/mark-read", markMessagesAsRead);

// ❤️ React to a message
router.post("/message/:id/react", async (req, res) => {
  const { id } = req.params;
  const { userId, type } = req.body;
  try {
    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ error: "Message not found" });

    // Add or update reaction
    const existing = message.reactions.find(
      (r) => r.userId.toString() === userId
    );
    if (existing) {
      existing.type = type; // update
    } else {
      message.reactions.push({ userId, type });
    }

    await message.save();
    res.status(200).json(message);
  } catch (err) {
    res.status(500).json({ error: "Error reacting to message" });
  }
});

module.exports = router;
