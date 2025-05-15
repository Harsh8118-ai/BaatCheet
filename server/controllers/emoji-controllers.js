const EmojiVoice = require('../models/emoji-model');

// **Home Controller**
exports.home = async (req, res) => {
  try {
    res.status(200).json({ msg: "Welcome to our home page" });
  } catch (error) {
    console.error("❌ Home Route Error:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// GET /api/emoji/get
exports.getEmojiVoicesForUser = async (req, res) => {
  try {
    const userId = req.user._id; 
    const record = await EmojiVoice.findOne({ user: userId });

    if (!record) {
      return res.status(200).json({ voices: {} });
    }

    res.status(200).json({ voices: Object.fromEntries(record.voices) });
  } catch (error) {
    console.error('Error getting emoji voices:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/emoji/post
exports.setEmojiVoice = async (req, res) => {
  console.log("✅ POST /api/emoji/post hit");

  const { emoji, emojiSoundUrl } = req.body;
  const userId = req.user?._id; // safer access

  if (!emoji || !emojiSoundUrl) {
    console.warn("❌ Missing required fields:", req.body);
    return res.status(400).json({ error: 'Emoji and emojiSoundUrl are required in body' });
  }

  try {
    let record = await EmojiVoice.findOne({ user: userId });

    if (!record) {
      record = new EmojiVoice({ user: userId, voices: { [emoji]: emojiSoundUrl } });
    } else {
      record.voices.set(emoji, emojiSoundUrl);
    }
    console.log("📥 Received from frontend:", { emoji, emojiSoundUrl, userId });

    await record.save();
    console.log("✅ Saved record:", record);

    res.status(200).json({
      message: `Voice set for emoji ${emoji}`,
      voices: Object.fromEntries(record.voices),
    });
  } catch (error) {
    console.error('❌ Error setting emoji voice:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


