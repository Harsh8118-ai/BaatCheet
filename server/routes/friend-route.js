const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const User = require("../models/user-model");
const Friend = require("../models/friend-model");
const {
  sendFriendRequest,
  respondToFriendRequest,
  getFriendsList,
  getSentRequests,
  getReceivedRequests,
  withdrawFriendRequest,
  removeFriend,
} = require("../controllers/friend-controllers");

const generateInviteCode = (userId) => {
  const last6Chars = userId.slice(-6);
  let numericCode = parseInt(last6Chars, 16) % 1000000;
  return `${numericCode.toString().padStart(6, "0")}`;
};

router.post("/generate-invite-code", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const inviteCode = generateInviteCode(userId);

    let friendData = await Friend.findOneAndUpdate(
      { userId },
      { inviteCode },
      { new: true, upsert: true }
    );

    res.status(200).json({ inviteCode, message: "Invite code generated successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error!", error: error.message });
  }
});

// ✅ Search User by Invite Code
router.get("/search-by-invite", async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ message: "Invite code is required!" });
    }

    // Find the friend document that has this invite code
    const friendData = await Friend.findOne({ inviteCode: code }).populate("userId", "username email");

    if (!friendData) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.status(200).json({
      username: friendData.userId.username,
      email: friendData.userId.email,
      inviteCode: friendData.inviteCode
    });

  } catch (error) {
    res.status(500).json({ message: "Server error!", error: error.message });
  }
});
module.exports = router;


// ✅ Get Stored Invite Code
router.get("/invite-code", authMiddleware, async (req, res) => {
  try {
    const friendData = await Friend.findOne({ userId: req.user.id });

    if (!friendData || !friendData.inviteCode) {
      return res.status(404).json({ message: "Invite code not generated yet!" });
    }

    res.status(200).json({ inviteCode: friendData.inviteCode });
  } catch (error) {
    res.status(500).json({ message: "Server error!", error: error.message });
  }
});

// ✅ Send a friend request using an invite code
router.post("/send-request", authMiddleware, sendFriendRequest);

// ✅ Accept or reject a friend request
router.post("/respond-request", authMiddleware, respondToFriendRequest);

// ✅ Get a list of friends
router.get("/friends-list", authMiddleware, getFriendsList);

// ✅ Get sent friend requests
router.get("/requests/sent", authMiddleware, getSentRequests);

// ✅ Get received friend requests
router.get("/requests/received", authMiddleware, getReceivedRequests);

// ✅ Withdraw Sent Friend Request
router.post("/withdraw-request", authMiddleware, withdrawFriendRequest);

// ✅ Remove a friend
router.post("/remove-friend", authMiddleware, removeFriend);

module.exports = router;
