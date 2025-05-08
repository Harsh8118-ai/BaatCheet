const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String }, 
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    message: { type: String }, 

    messageType: {
      type: String,
      enum: ["text", "emoji", "image", "file", "voice"],
      default: "text",
    },

    fileUrl: { type: String },       
    fileType: { type: String },      
    audioUrl: { type: String },      

    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },

    reactions: [reactionSchema],

    mood: {
      type: String,
      enum: ["default", "happy", "calm", "romantic", "dark", "energetic", "professional"],
      default: "default",
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
