const User = require("../models/user-model");
const Friend = require("../models/friend-model");
const mongoose = require("mongoose");


// Send Friend Request using Invite Code
exports.sendFriendRequest = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const senderId = req.user.id;

    console.log("📌 Received Friend Request - Invite Code:", inviteCode);
    console.log("📌 Sender ID:", senderId);

    if (!inviteCode) {
      console.error("❌ Invite Code Missing!");
      return res.status(400).json({ message: "Invite code is required!" });
    }

    const recipientFriend = await Friend.findOne({ inviteCode }).populate("userId");

    if (!recipientFriend) {
      console.error("❌ User with invite code not found!");
      return res.status(404).json({ message: "User not found!" });
    }

    const recipient = recipientFriend.userId;
    console.log("📌 Recipient ID:", recipient._id.toString());

    if (senderId === recipient._id.toString()) {
      console.error("❌ Sender is trying to send request to themselves!");
      return res.status(400).json({ message: "You cannot send a friend request to yourself!" });
    }

    let senderFriend = await Friend.findOneAndUpdate(
      { userId: senderId },
      { $setOnInsert: { userId: senderId, friends: [], requestsSent: [], friendRequests: [] } },
      { new: true, upsert: true }
    );

    let recipientFriendData = await Friend.findOneAndUpdate(
      { userId: recipient._id },
      { $setOnInsert: { userId: recipient._id, friends: [], requestsSent: [], friendRequests: [] } },
      { new: true, upsert: true }
    );

    console.log("📌 Sender Friend Data:", senderFriend);
    console.log("📌 Recipient Friend Data:", recipientFriendData);

    // Ensure requestsSent and friends exist
    if (!Array.isArray(senderFriend.requestsSent)) senderFriend.requestsSent = [];
    if (!Array.isArray(senderFriend.friends)) senderFriend.friends = [];
    if (!Array.isArray(recipientFriendData.friendRequests)) recipientFriendData.friendRequests = [];

    if (senderFriend.friends.some(friendId => friendId.toString() === recipient._id.toString())) {
      console.error("❌ Users are already friends!");
      return res.status(400).json({ message: "You are already friends!" });
    }

    if (senderFriend.requestsSent.some(_id => _id.toString() === recipient._id.toString())) {
      console.error("❌ Friend request already sent!");
      return res.status(400).json({ message: "Friend request already sent!" });
    }

    senderFriend.requestsSent.push(recipient._id);
    recipientFriendData.friendRequests.push(senderId);

    await senderFriend.save();
    await recipientFriendData.save();

    console.log("✅ Friend request sent successfully!");
    res.status(200).json({ message: "Friend request sent successfully!" });
  } catch (error) {
    console.error("❌ Server Error in sendFriendRequest:", error);
    res.status(500).json({ message: "Server error!", error: error.message });
  }
};


// Accept or Reject Friend Request
exports.respondToFriendRequest = async (req, res) => {
  try {
    const { _id, receiverId, action } = req.body; // _id is the sender's userId

    if (!_id || !receiverId || !action) {
      return res.status(400).json({ message: "Missing senderId, receiverId, or action." });
    }

    console.log("📩 Processing request:", { senderId: _id, receiverId });

    // Find receiver's Friend document
    const receiver = await Friend.findOne({ userId: receiverId });
    if (!receiver) return res.status(404).json({ message: "Receiver not found!" });

    // Find sender's Friend document
    const sender = await Friend.findOne({ userId: _id });
    if (!sender) return res.status(404).json({ message: "Sender not found!" });

    // Ensure arrays exist
    receiver.friends = receiver.friends || [];
    sender.friends = sender.friends || [];
    receiver.friendRequests = receiver.friendRequests || [];
    sender.requestsSent = sender.requestsSent || [];

    if (action === "accept") {
      console.log("✅ Friend request accepted! Updating friend lists...");

      // Add sender to receiver's friend list (only if not already there)
      if (!receiver.friends.some(friend => friend.userId.equals(_id))) {
        receiver.friends.push({ userId: _id });
      }

      // Add receiver to sender's friend list (only if not already there)
      if (!sender.friends.some(friend => friend.userId.equals(receiverId))) {
        sender.friends.push({ userId: receiverId });
      }
    }

    // Remove friend request (Avoid undefined `req.userId` error)
    receiver.friendRequests = receiver.friendRequests.filter(req => req.userId && !req.userId.equals(_id));
    sender.requestsSent = sender.requestsSent.filter(req => req.userId && !req.userId.equals(receiverId));

    // Save both documents
    await receiver.save();
    await sender.save();

    console.log("✅ Friend request successfully processed.");
    return res.status(200).json({ message: `Friend request ${action}ed successfully!` });

  } catch (error) {
    console.error("❌ Error processing friend request:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};



// Get Friends List
exports.getFriendsList = async (req, res) => {
  try {
    const userId = req.user.id;

    const friendData = await Friend.findOne({ userId });

    if (!friendData || friendData.friends.length === 0) {
      return res.status(200).json({ friends: [] });
    }

    // Extract userIds from friends array
    const friendIds = friendData.friends.map(friend => friend.userId);

    // Fetch user details for each friend from the Users collection
    const friendsList = await User.find(
      { _id: { $in: friendIds } },
      "username email inviteCode"
    );

    res.status(200).json({ friends: friendsList });
  } catch (error) {
    console.error("❌ Error fetching friend list:", error);
    res.status(500).json({ message: "Server error!", error: error.message });
  }
};




// Get Sent Requests
exports.getSentRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const friendData = await Friend.findOne({ userId });

    if (!friendData) {
      return res.status(404).json({ message: "Friend data not found" });
    }

    const requestsSentMeta = friendData.requestsSent; // contains status, createdAt, _id
    const sentUserIds = requestsSentMeta.map((r) => r._id);

    // Get basic user info
    const users = await User.find(
      { _id: { $in: sentUserIds } },
      "username email"
    );

    // Merge user info with metadata (status, createdAt)
    const enriched = users.map((user) => {
      const meta = requestsSentMeta.find(
        (r) => r._id.toString() === user._id.toString()
      );

      return {
        _id: user._id,
        email: user.email,
        username: user.username,
        status: meta?.status,
        createdAt: meta?.createdAt,
      };
    });

    res.status(200).json(enriched);
  } catch (error) {
    console.error("Error fetching sent requests:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// Get Received Requests
exports.getReceivedRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the friend document for the user
    const friendData = await Friend.findOne({ userId });

    if (!friendData) {
      return res.status(404).json({ message: "Friend data not found" });
    }

    // Fetch user details for each received request
    const receivedRequests = await User.find(
      { _id: { $in: friendData.friendRequests } },
      "username email inviteCode");

    res.status(200).json(receivedRequests);
  } catch (error) {
    console.error("Error fetching received requests:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Withdraw Sent Friend Request
exports.withdrawFriendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.user.id;

    

    if (!recipientId) {
      console.error("❌ Error: Recipient ID is missing!");
      return res.status(400).json({ message: "Recipient ID is required!" });
    }

    const senderFriend = await Friend.findOne({ userId: senderId });
    if (!senderFriend) {
      console.error("❌ Error: Sender's friend data not found!");
      return res.status(404).json({ message: "Sender's friend data not found!" });
    }

    const recipientFriend = await Friend.findOne({ userId: recipientId });
    if (!recipientFriend) {
      console.error("❌ Error: Recipient's friend data not found!");
      return res.status(404).json({ message: "Recipient's friend data not found!" });
    }

    if (!senderFriend.requestsSent || senderFriend.requestsSent.length === 0) {
      return res.status(400).json({ message: "No sent friend requests found!" });
    }

    

    // Compare `_id` instead of `userId`
    const sentRequest = senderFriend.requestsSent.find(request =>
      request?._id?.toString() === recipientId.toString()
    );

    if (!sentRequest) {
      console.error("❌ Error: Friend request not found in sender's requestsSent!");
      return res.status(400).json({ message: "Friend request not found!" });
    }

    

    await Friend.updateOne(
      { userId: senderId },
      { $pull: { requestsSent: { _id: sentRequest._id } } }
    );

    if (!recipientFriend.friendRequests || recipientFriend.friendRequests.length === 0) {
      return res.status(200).json({ message: "Friend request withdrawn successfully!" });
    }

    const recipientRequest = recipientFriend.friendRequests.find(
      (request) => request?._id?.toString() === senderId.toString()
    );

    if (recipientRequest) {
      await Friend.updateOne(
        { userId: recipientId },
        { $pull: { friendRequests: { _id: recipientRequest._id } } }
      );
    }

    res.status(200).json({ message: "Friend request withdrawn successfully!" });

  } catch (error) {
    console.error("❌ Server Error in withdrawFriendRequest:", error);
    res.status(500).json({ message: "Server error!", error: error.message });
  }
};




// Remove a friend
exports.removeFriend = async (req, res) => {
  try {
    const { _id } = req.body;
    const userId = req.user.id;

    if (!_id) {
      console.error("❌ Friend ID is missing!");
      return res.status(400).json({ message: "Friend ID is required!" });
    }

    console.log("📌 Remove Friend - User ID:", userId);
    console.log("📌 Friend ID:", _id);

    // Find the friend documents
    let userFriend = await Friend.findOne({ userId });
    let targetFriend = await Friend.findOne({ userId: _id });

    if (!userFriend || !targetFriend) {
      return res.status(404).json({ message: "Friend data not found!" });
    }

    // Check if they are actually friends
    if (!userFriend.friends.some(friend => friend.userId.toString() === _id)) {
      console.error("❌ Users are not friends!");
      return res.status(400).json({ message: "You are not friends with this user!" });
    }

    // ❌ Remove each other from their friend lists
    userFriend.friends = userFriend.friends.filter(friend => friend.userId.toString() !== _id);
    targetFriend.friends = targetFriend.friends.filter(friend => friend.userId.toString() !== userId);

    // Save the updates
    await userFriend.save();
    await targetFriend.save();

    console.log("✅ Friend removed successfully!");
    res.status(200).json({ message: "Friend removed successfully!" });

  } catch (error) {
    console.error("❌ Server Error in removeFriend:", error);
    res.status(500).json({ message: "Server error!", error: error.message });
  }
};

