const cloudinary = require('cloudinary').v2; // Ensure Cloudinary is configured properly
const Message = require('../models/chat-model');
const streamifier = require('streamifier'); // Required for streaming files to Cloudinary
const fs = require('fs'); // For file system operations

const onlineUsers = new Map();

const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("👤 New user connected:", socket.id);

    // ✅ Join room & track user
    socket.on("join", (userId) => {
      socket.userId = userId; // Save on socket
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
      socket.broadcast.emit("userOnline", userId);

      // 🔥 Send full online list to newly connected user
      const allOnline = Array.from(onlineUsers.keys());
      socket.emit("onlineUsers", allOnline);

      console.log(`📌 User ${userId} joined room: ${userId}`);
    });

    // ✅ Typing
    socket.on("typing", ({ senderId, receiverId }) => {
      io.to(receiverId).emit("typing", { senderId });
    });

    // ✅ Sending Message with File Upload
    socket.on("sendMessage", async (data) => {
      const { senderId, receiverId, tempId, file } = data;
      const conversationId = [senderId, receiverId].sort().join("_");
      data.conversationId = conversationId;

      // If there is a file (image, video, or voice), handle the upload to Cloudinary
      if (file) {
        try {
          let fileUrl = '';
          const fileBuffer = Buffer.from(file, 'base64'); // Assuming file is base64-encoded

          // Upload to Cloudinary
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto' }, // 'auto' for auto-detecting file type (image, video, audio)
            (error, result) => {
              if (error) {
                console.error('Error uploading to Cloudinary:', error);
                return;
              }
              fileUrl = result.secure_url; // Store the file URL
            }
          );

          // Stream file to Cloudinary
          streamifier.createReadStream(fileBuffer).pipe(uploadStream);

          // Wait for the upload to complete before saving the message
          while (!fileUrl) {
            // Waiting for Cloudinary upload to complete
          }

          // After uploading the file, create the message with the URL
          const message = new Message({ ...data, fileUrl, status: "sent" });
          await message.save();

          io.to(receiverId).emit("messageReceived", { ...message.toObject(), status: "delivered" });
          io.to(senderId).emit("messageDelivered", { messageId: message._id, tempId });

          await Message.findByIdAndUpdate(message._id, { status: "delivered" });

          console.log(`📤 Message ${message._id} from ${senderId} to ${receiverId} with file`);
        } catch (error) {
          console.error('Error handling file upload:', error);
        }
      } else {
        // If no file, simply save the message
        const message = new Message({ ...data, status: "sent" });
        await message.save();

        io.to(receiverId).emit("messageReceived", { ...message.toObject(), status: "delivered" });
        io.to(senderId).emit("messageDelivered", { messageId: message._id, tempId });

        await Message.findByIdAndUpdate(message._id, { status: "delivered" });

        console.log(`📤 Message ${message._id} from ${senderId} to ${receiverId}`);
      }
    });

    // ✅ Seen Status - FIXED
    socket.on("markAsSeen", async ({ userId, contactId }) => {
      try {
        const updatedMessages = await Message.find({
          senderId: contactId,
          receiverId: userId,
          status: { $ne: "read" }
        });

        if (updatedMessages.length > 0) {
          console.log(`Found ${updatedMessages.length} messages to mark as read`);

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

          console.log(`👁️ ${messageIds.length} messages from ${contactId} seen by ${userId}`);
        }
      } catch (error) {
        console.error("Error marking messages as seen:", error);
      }
    });

    // ✅ Reactions
    socket.on("reactMessage", ({ messageId, type, userId }) => {
      io.emit("messageReaction", { messageId, type, userId });
      console.log(`💬 Reaction on message ${messageId} by ${userId}: ${type}`);
    });

    // ✅ Handle Disconnect
    socket.on("disconnect", () => {
      const userId = socket.userId;
      if (userId) {
        onlineUsers.delete(userId);
        socket.broadcast.emit("userOffline", userId);
        console.log(`❌ User ${userId} disconnected`);
      }
    });
  });
};

module.exports = initializeSocket;
