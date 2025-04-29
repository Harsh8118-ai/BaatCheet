  const mongoose = require("mongoose");

  const friendSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    inviteCode: { type: String, required: true, unique: true },

    // List of friends (storing only user IDs)
    friends: [{     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    }], 

    // Incoming friend requests
    friendRequests: [{ 
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" } 
    }],

    // Sent friend requests
    requestsSent: [{ 
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
      createdAt: { type: Date, default: Date.now } 
    }],
  });

  const Friend = mongoose.model("Friend", friendSchema);
  module.exports = Friend;
