const initializeSocket = (io) => {
  io.on("connection", (socket) => {
      console.log("👤 New user connected:", socket.id);

      //  Join Room (User-Specific)
      socket.on("join", (userId) => {
          socket.join(userId);
          console.log(`📌 User ${userId} joined their room`);
      });

      //  Handle Sending Messages
      socket.on("sendMessage", (data) => {
          const { senderId, receiverId, message } = data;
          const conversationId = [senderId, receiverId].sort().join("_");

          // Broadcast message to receiver's room
          io.to(receiverId).emit("messageReceived", { senderId, message, conversationId });

          console.log(`📤 Message from ${senderId} to ${receiverId}: ${message}`);
      });

      // ❌ Handle Disconnect
      socket.on("disconnect", () => {
          console.log("❌ User disconnected:", socket.id);
      });
  });
};

module.exports = initializeSocket;
