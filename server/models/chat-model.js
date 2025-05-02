const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String }, // e.g., "❤️", "😂", "👍"
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    message: { type: String }, // Text or emoji message

    messageType: {
      type: String,
      enum: ["text", "emoji", "image", "file", "voice"],
      default: "text",
    },

    fileUrl: { type: String },       // For file/image
    fileType: { type: String },      // e.g., "pdf", "jpg", "mp4"
    audioUrl: { type: String },      // For voice message

    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },

    reactions: [reactionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
