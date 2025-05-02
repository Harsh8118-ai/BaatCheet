const onlineUsers = new Map();
const Message = require('../models/chat-model');

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

      console.log(`📌 User ${userId} joined their room`);
    });

    // ✅ Typing
    socket.on("typing", ({ senderId, receiverId }) => {
      io.to(receiverId).emit("typing", { senderId });
    });

    // ✅ Sending Message
    socket.on("sendMessage", async (data) => {
      const { senderId, receiverId } = data;
      const conversationId = [senderId, receiverId].sort().join("_");
      data.conversationId = conversationId;

      // Save message with initial "sent" status
      const message = new Message({ ...data, status: "sent" });
      await message.save();

      // Emit to receiver → mark as "delivered"
      io.to(receiverId).emit("messageReceived", { ...message.toObject(), status: "delivered" });

      // Emit to sender to update UI
      io.to(senderId).emit("messageDelivered", { messageId: message._id });

      // Update message status to "delivered" in DB
      await Message.findByIdAndUpdate(message._id, { status: "delivered" });

      console.log(`📤 Message ${message._id} from ${senderId} to ${receiverId}`);
    });

    // ✅ Seen Status
    socket.on("markAsSeen", async ({ userId, contactId }) => {
      // Update messages from contact to user
      await Message.updateMany(
        { senderId: contactId, receiverId: userId, status: { $ne: "read" } },
        { status: "read" }
      );

      io.to(contactId).emit("messagesSeen", { by: userId });
      console.log(`👁️ Messages from ${contactId} seen by ${userId}`);
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
