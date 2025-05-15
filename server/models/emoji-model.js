// models/emoji-model.js
const mongoose = require('mongoose');

const EmojiVoiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // one document per user
  },
  voices: {
    type: Map,
    of: String, // key: emoji, value: soundUrl
    default: {},
  },
}, { timestamps: true });

module.exports = mongoose.model('EmojiVoice', EmojiVoiceSchema);
