const cloudinary = require("../utils/cloudinary");
const Message = require("../models/chat-model");
const streamifier = require("streamifier");

const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

exports.sendFileMessage = async (req, res) => {
  const { senderId, receiverId, conversationId, messageType, fileType } = req.body;
  const fileBuffer = req.file.buffer;

  try {
    const result = await uploadToCloudinary(fileBuffer, "chat_files");

    const message = new Message({
      senderId,
      receiverId,
      conversationId,
      messageType,
      fileType,
      fileUrl: result.secure_url,
      audioUrl: messageType === "voice" ? result.secure_url : undefined,
    });

    await message.save();
    res.status(200).json(message);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload file message" });
  }
};
