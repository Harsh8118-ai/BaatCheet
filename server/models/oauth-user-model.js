const mongoose = require("mongoose");

const oauthUserSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: String,
      enum: ["google", "github"],
      required: true,
    },
    providerId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const OAuthUser = mongoose.model("OAuthUser", oauthUserSchema);
module.exports = OAuthUser;
