const multer = require("multer");

// Use memory storage to keep files in buffer before Cloudinary upload
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
