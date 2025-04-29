const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { oauthLogin, updateUsername } = require("../controllers/oauth-controllers");

const CLIENT_URL = "http://localhost:5173/auth-success";

// 🔹 Token Generator Function
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "7d" }
  );
};

// ✅ GitHub Authentication
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    if (!req.user) {
      return res.redirect(`${CLIENT_URL}?error=Authentication Failed`);
    }
    const token = generateToken(req.user);
    res.redirect(`${CLIENT_URL}?token=${token}&username=${req.user.username}`);
  }
);

// ✅ Google Authentication
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    if (!req.user) {
      return res.redirect(`${CLIENT_URL}?error=Authentication Failed`);
    }
    const token = generateToken(req.user);
    res.redirect(`${CLIENT_URL}?token=${token}&username=${req.user.username}`);
  }
);

// ✅ OAuth Login Route (For Manual API Calls)
router.post("/oauth", oauthLogin);

// ✅ Update Username Route
router.put("/update-username", updateUsername);

module.exports = router;
