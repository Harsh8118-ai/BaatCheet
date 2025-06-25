const mongoose = require("mongoose");

const InstagramUserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    full_name: String,
    biography: String,
    profile_pic_url: String,
    follower_count: Number,
    following_count: Number,
    media_count: Number,
    is_private: Boolean,
    account_type: Number,
    category: String,
    source_ip: String,
    user_agent: String,
    last_fetched: { type: Date, default: Date.now },
    visit_count: { type: Number, default: 0 },
    visit_history: [
      {
        timestamp: { type: Date, default: Date.now },
        ip: String,
        user_agent: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("InstagramUser", InstagramUserSchema);