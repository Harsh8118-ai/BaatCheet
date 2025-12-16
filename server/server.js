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
const instagramRoutes = require("./routes/instagram-route");

// Import WebSocket Controller
const initializeSocket = require("./controllers/webSocket-controllers");

const allowedOrigins = process.env.FRONTEND_ORIGIN?.split(",") || [];

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// CORS & Middleware
app.use(compression());
app.use(cors({ origin: allowedOrigins, methods: "GET, POST, PUT, DELETE", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);  
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "default_secret",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: true,
//       sameSite: "none",
//       httpOnly: true,
//     },
//   })
// );
// app.use(passport.session());
app.use(passport.initialize());

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/oauth", oauthRoute);
app.use("/api/friends", friendRoute);
app.use("/api/chat", messageRoute);
app.use("/api/otp", otpRoutes);
app.use("/api/emoji", emojiRoutes);
app.use("/api/instagram", instagramRoutes);


// Initialize WebSocket
initializeSocket(io);

// Root Route
app.get("/", (req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>BaatCheet Backend</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #1f1f1f, #323232);
          color: #f0f0f0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          flex-direction: column;
          text-align: center;
        }

        h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: #00ffcc;
        }

        p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
        }

        a {
          display: inline-block;
          padding: 12px 24px;
          background-color: #00ffcc;
          color: #1f1f1f;
          text-decoration: none;
          font-weight: bold;
          border-radius: 8px;
          transition: background-color 0.3s ease;
        }

        a:hover {
          background-color: #00cca3;
        }

        .footer {
          position: absolute;
          bottom: 20px;
          font-size: 0.85rem;
          color: #888;
        }
      </style>
    </head>
    <body>
      <h1>Welcome to the BaatCheet's Backend</h1>
      <p>Developed by <strong>Harsh Tyagi</strong></p>
      <a href="https://baatcheet-ai.netlify.app/" target="_blank">Go to Frontend</a>
      <div class="footer">© ${new Date().getFullYear()} BaatCheet • All rights reserved</div>
    </body>
    </html>
  `);
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
  const PORT = process.env.PORT || 3000;

  server.listen(PORT, () => {
    console.log(`🚀 Server is running at port:${PORT}`);
  });
});
