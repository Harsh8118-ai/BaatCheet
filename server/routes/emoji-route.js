// routes/emojiRoutes.js
const express = require('express');
const router = express.Router();
const emojiController = require('../controllers/emoji-controllers');
const authMiddleware = require("../middlewares/auth-middleware"); // ✅

router.get("/", emojiController.home);

router.post("/post", authMiddleware, emojiController.setEmojiVoice);
router.get('/get', authMiddleware, emojiController.getEmojiVoicesForUser);

module.exports = router;
