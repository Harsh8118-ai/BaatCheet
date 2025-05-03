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

      console.log(`📌 User ${userId} joined room: ${userId}`);
    });

    // ✅ Typing
    socket.on("typing", ({ senderId, receiverId }) => {
      io.to(receiverId).emit("typing", { senderId });
    });

    // ✅ Sending Message
    socket.on("sendMessage", async (data) => {
      const { senderId, receiverId, tempId } = data;
      const conversationId = [senderId, receiverId].sort().join("_");
      data.conversationId = conversationId;

      const message = new Message({ ...data, status: "sent" });
      await message.save();

      io.to(receiverId).emit("messageReceived", { ...message.toObject(), status: "delivered" });
      io.to(senderId).emit("messageDelivered", { messageId: message._id, tempId });

      await Message.findByIdAndUpdate(message._id, { status: "delivered" });

      console.log(`📤 Message ${message._id} from ${senderId} to ${receiverId}`);
    });

    // ✅ Seen Status - FIXED
    // ✅ Seen Status - COMPLETE FIX
socket.on("markAsSeen", async ({ userId, contactId }) => {
  try {
    // Find all unread messages from the contact to the user
    const updatedMessages = await Message.find({
      senderId: contactId,
      receiverId: userId,
      status: { $ne: "read" }
    });

    if (updatedMessages.length > 0) {
      console.log(`Found ${updatedMessages.length} messages to mark as read`);
      
      // Extract the message IDs that need to be updated
      const messageIds = updatedMessages.map(msg => msg._id);
      
      // Update those messages' status to 'read' in the database
      await Message.updateMany(
        { _id: { $in: messageIds } }, 
        { status: "read" }
      );
      
      // Get the complete updated messages after the update
      const freshMessages = await Message.find({ _id: { $in: messageIds } });
      
      // Emit updates for each message
      freshMessages.forEach(message => {
        const messageObj = message.toObject();
        
        // For debugging
        console.log(`Emitting status update for message: ${message._id}, new status: read`);
        
        // Convert ObjectId to string to ensure consistent comparison in frontend
        messageObj._id = messageObj._id.toString();
        
        // Emit to both sender and receiver
        io.to(contactId).emit("message:statusUpdate", messageObj);
        io.to(userId).emit("message:statusUpdate", messageObj);
      });
      
      // Also emit a messagesSeen event as a backup approach
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
