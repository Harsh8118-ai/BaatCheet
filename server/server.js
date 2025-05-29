require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const compression = require("compression");
const session = require("express-session");
const passport = require("passport");
const connectDb = require("./utils/db");
require("./utils/passport-config");

// Import Routes
const authRoute = require("./routes/auth-route");
const oauthRoute = require("./routes/oauth-route");
const friendRoute = require("./routes/friend-route");
const messageRoute = require("./routes/chat-route");
const otpRoutes = require("./routes/otp-route");
const emojiRoutes = require("./routes/emoji-route");

// Import WebSocket Controller
const initializeSocket = require("./controllers/webSocket-controllers");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://192.168.45.15:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// CORS & Middleware
app.use(compression());
app.use(cors({ origin: io.opts.cors.origin, methods: "GET, POST, PUT, DELETE", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/oauth", oauthRoute);
app.use("/api/friends", friendRoute);
app.use("/api/chat", messageRoute);
app.use("/api/otp", otpRoutes);
app.use("/api/emoji", emojiRoutes);

// Initialize WebSocket
initializeSocket(io);

// Root Route
app.get("/", (req, res) => {
  res.status(200).send("Welcome to ChatApp Backend!");
});

// Error Handling Middleware
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    message: error.message || "Internal Server Error",
    extraDetails: error.extraDetails || "No additional information",
  });
});

// Connect to Database & Start Server
connectDb().then(() => {
  const PORT = process.env.PORT || 5000;
  const HOST = '0.0.0.0'; // <-- This allows external devices to connect

  server.listen(PORT, HOST, () => {
    console.log(`🚀 Server is running at http://${HOST}:${PORT}`);
  });
});
