const express = require("express");
const router = express.Router();
const { sendMessage, getConversation } = require("../controllers/chat-controllers");

// 📩 Send Message & Save in DB
router.post("/send", sendMessage);

// 📜 Get Messages Between Two Users
router.get("/conversation/:user1/:user2", getConversation);

module.exports = router;
