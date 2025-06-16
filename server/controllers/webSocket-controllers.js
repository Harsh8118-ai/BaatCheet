const cloudinary = require('cloudinary').v2; // Ensure Cloudinary is configured properly
const Message = require('../models/chat-model');
const streamifier = require('streamifier'); // Required for streaming files to Cloudinary
const fs = require('fs'); // For file system operations
const User = require("../models/user-model");

const onlineUsers = new Map();

const initializeSocket = (io) => {
  io.on("connection", (socket) => {

    // Join room & track user
    socket.on("join", (userId) => {
      socket.userId = userId; // Save on socket
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
      socket.broadcast.emit("userOnline", userId);

      // 🔥 Send full online list to newly connected user
      const allOnline = Array.from(onlineUsers.keys());
      socket.emit("onlineUsers", allOnline);

      
    });

    // Typing
    socket.on("typing", ({ senderId, receiverId }) => {
      io.to(receiverId).emit("typing", { senderId });
    });

    // Sending Message with File Upload
    socket.on("sendMessage", async (data) => {
      const { senderId, receiverId, tempId, file } = data;
      const conversationId = [senderId, receiverId].sort().join("_");
      data.conversationId = conversationId;

      try {
        // 🔍 Fetch the sender's mood
        const sender = await User.findById(senderId).select("currentMood");
        const mood = sender?.currentMood || "default";
        data.mood = mood;

        if (file) {
          let fileUrl = '';
          const fileBuffer = Buffer.from(file, 'base64');

          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto' },
            async (error, result) => {
              if (error) {
                console.error('Error uploading to Cloudinary:', error);
                return;
              }

              fileUrl = result.secure_url;

              const message = new Message({ ...data, fileUrl, status: "sent" });
              await message.save();

              const senderInfo = await User.findById(senderId).select("username profileUrl");

              io.to(receiverId).emit("messageReceived", {
                ...message.toObject(),
                username: senderInfo?.username || "New User",
                profileUrl: senderInfo?.profileUrl || "",
                status: "delivered",
              });
              io.to(senderId).emit("messageDelivered", { messageId: message._id, tempId });
              await Message.findByIdAndUpdate(message._id, { status: "delivered" });

              
            }
          );

          streamifier.createReadStream(fileBuffer).pipe(uploadStream);
        } else {
          // No file, just save the message with mood
          const message = new Message({ ...data, status: "sent" });
          await message.save();

          const senderInfo = await User.findById(senderId).select("username profileUrl");

          io.to(receiverId).emit("messageReceived", {
            ...message.toObject(),
            username: senderInfo?.username || "New User",
            profileUrl: senderInfo?.profileUrl || "",
            status: "delivered",
          });
          io.to(senderId).emit("messageDelivered", { messageId: message._id, tempId });
          await Message.findByIdAndUpdate(message._id, { status: "delivered" });

          
        }
      } catch (err) {
        console.error("Error in sendMessage:", err);
      }
    });


    // Seen Status - FIXED
    socket.on("markAsSeen", async ({ userId, contactId }) => {
      try {
        const updatedMessages = await Message.find({
          senderId: contactId,
          receiverId: userId,
          status: { $ne: "read" }
        });

        if (updatedMessages.length > 0) {
          

          const messageIds = updatedMessages.map(msg => msg._id);

          await Message.updateMany({ _id: { $in: messageIds } }, { status: "read" });

          const freshMessages = await Message.find({ _id: { $in: messageIds } });

          freshMessages.forEach(message => {
            const messageObj = message.toObject();
            messageObj._id = messageObj._id.toString();

            io.to(contactId).emit("message:statusUpdate", messageObj);
            io.to(userId).emit("message:statusUpdate", messageObj);
          });

          io.to(contactId).emit("messagesSeen", { by: userId });

          
        }
      } catch (error) {
        console.error("Error marking messages as seen:", error);
      }
    });

    // Reactions
    socket.on("reactMessage", ({ messageId, type, userId }) => {
      io.emit("messageReaction", { messageId, type, userId });
      
    });

    // Handle Disconnect
    socket.on("disconnect", () => {
      const userId = socket.userId;
      if (userId) {
        onlineUsers.delete(userId);
        socket.broadcast.emit("userOffline", userId);
        
      }
    });
  });
};

module.exports = initializeSocket;
