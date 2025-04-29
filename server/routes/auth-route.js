const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/auth-controllers");
const oauthControllers = require("../controllers/oauth-controllers"); // Import OAuth Controller
const { signupSchema, loginSchema } = require("../validators/auth-validator");
const validate = require("../middlewares/validate-middleware");
const authMiddleware = require("../middlewares/auth-middleware");

// ✅ Home Route
router.get("/", authControllers.home);

// ✅ Manual Signup & Login
router.post("/register", validate(signupSchema), authControllers.register);
router.post("/login", validate(loginSchema), authControllers.login);

// ✅ OAuth Signup/Login (Google/GitHub)
router.post("/oauth", oauthControllers.oauthLogin);

// ✅ Password Reset Routes (OTP-based)
router.post("/send-otp-password-reset", authControllers.sendOtpForPasswordReset);
router.put("/reset-password", authControllers.resetPassword); 


// ✅ Profile Routes (Protected)
router.use(authMiddleware); 
router.put("/update-profile", authControllers.updateProfile);
router.get("/user", authControllers.user);

module.exports = router;
