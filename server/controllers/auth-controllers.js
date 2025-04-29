const User = require("../models/user-model");
const OTP = require("../models/otp-model");
const jwt = require("jsonwebtoken");  
const bcrypt = require("bcryptjs");


// 🔹 Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });
};

// ✅ **Home Controller**
const home = async (req, res) => {
  try {
    res.status(200).json({ msg: "Welcome to our home page" });
  } catch (error) {
    console.error("❌ Home Route Error:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ✅ **User Registration (Manual Signup)**
const register = async (req, res, next) => {
  try {
    console.log("📩 Received Request Body:", JSON.stringify(req.body, null, 2));


    const { username, email, mobileNumber, password, otp } = req.body;

    if (!username || !email || !mobileNumber || !password || !otp) {
      return res.status(400).json({ message: "All fields are required, including OTP" });
    }

    // ✅ Check if OTP is valid
    const otpRecord = await OTP.findOne({ email: email.toLowerCase() });
    console.log("🔍 OTP Found in DB:", otpRecord);


    console.log("DB OTP:", otpRecord?.otp);
    console.log("User OTP:", otp);


    if (!otpRecord || otpRecord.otp.toString() !== otp.toString()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }


    // ✅ Check if user already exists
    const userExist = await User.findOne({ $or: [{ email }, { mobileNumber }] });
    if (userExist) {
      return res.status(400).json({ message: "Email or Mobile Number already exists" });
    }

    // ✅ Create new user
    const newUser = new User({ username, email, mobileNumber, password });
    await newUser.save();

    // ✅ Delete OTP after verification
    await OTP.deleteOne({ _id: otpRecord._id });

    // ✅ Generate JWT token
    const token = generateToken(newUser._id);

    return res.status(201).json({
      message: "Registration Successful",
      token,
      user: { id: newUser._id, username: newUser.username, email: newUser.email },
    });
  } catch (error) {
    console.error("❌ Registration Error:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


// ✅ **User Login (Manual Login)**
const login = async (req, res, next) => {
  try {
    const { mobileNumber, password } = req.body;

    if (!mobileNumber || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Fix: Ensure password is selected
    const user = await User.findOne({ mobileNumber }).select("+password");
    if (!user) {
      console.log("⚠️ User not found:", mobileNumber);
      return res.status(400).json({ message: "Invalid Mobile Number or Password" });
    }

    // Fix: Password comparison
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("❌ Incorrect password for user:", mobileNumber);
      return res.status(400).json({ message: "Invalid Mobile Number or Password" });
    }

    console.log("✅ Login successful for user:", mobileNumber);

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login Successful",
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("❌ Login Error:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ✅ **Get User Data**
const user = async (req, res) => {
  try {
    return res.status(200).json({ user: req.user });
  } catch (error) {
    console.error("❌ Get User Data Error:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ✅ **Update User Profile**
const updateProfile = async (req, res, next) => {
  try {
    const { username, email, mobileNumber } = req.body;
    const userId = req.user._id;

    const userDetails = await User.findById(userId);
    if (!userDetails) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email && email !== userDetails.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    if (mobileNumber && mobileNumber !== userDetails.mobileNumber) {
      const mobileExists = await User.findOne({ mobileNumber });
      if (mobileExists) {
        return res.status(400).json({ message: "Mobile Number already in use" });
      }
    }

    userDetails.username = username || userDetails.username;
    userDetails.email = email || userDetails.email;
    userDetails.mobileNumber = mobileNumber || userDetails.mobileNumber;

    await userDetails.save();

    return res.status(200).json({
      message: "Profile Updated Successfully",
      user: {
        id: userDetails._id,
        username: userDetails.username,
        email: userDetails.email,
        mobileNumber: userDetails.mobileNumber,
      },
    });
  } catch (error) {
    console.error("❌ Profile Update Error:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const sendOtpForPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    // ✅ Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    // ✅ Delete old OTP before saving new one
    await OTP.deleteOne({ email });

    // ✅ Generate OTP
    const otp = otpGenerator.generate(4, { digits: true, alphabets: false, specialChars: false });

    // ✅ Save new OTP in database
    await OTP.create({ email, otp });


    // ✅ Send OTP via email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is ${otp}. It is valid for 5 minutes.`,
    });

    res.status(200).json({ message: "OTP sent to your email!" });
  } catch (error) {
    res.status(500).json({ message: "Error sending OTP", error });
  }
};

const resetPassword = async (req, res) => {
  const { email, newPassword, otp } = req.body;

  try {
    console.log("🔹 Reset Password Request Received");
    console.log("📧 Email:", email);
    console.log("🔢 OTP:", otp);
    console.log("🔒 New Password:", newPassword);

    // ✅ Check if OTP exists
    const otpRecord = await OTP.findOne({ email, otp });
    console.log("🔎 OTP Record Found:", otpRecord);

    if (!otpRecord) {
      console.log("❌ Invalid OTP.");
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // ✅ Check OTP expiration
    if (new Date(otpRecord.expiresAt) < new Date()) {
      console.log("⏳ OTP has expired. Deleting OTP record...");
      await OTP.deleteOne({ _id: otpRecord._id }); // Remove expired OTP
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // ✅ Hash new password
    console.log("🔐 Hashing new password...");
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log("✅ Password hashed successfully");

    // ✅ Update user password
    console.log("🔄 Updating user password in the database...");
    const userUpdate = await User.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true });

    if (!userUpdate) {
      console.log("❌ No user found with this email.");
      return res.status(404).json({ message: "User not found." });
    }

    console.log("✅ Password updated successfully for:", userUpdate.email);

    // ✅ Delete OTP after password reset
    console.log("🗑 Deleting OTP record...");
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("🚨 Error resetting password:", error);
    res.status(500).json({ message: "Error resetting password", error });
  }
};


module.exports = { home, register, login, user, updateProfile, sendOtpForPasswordReset, resetPassword };
