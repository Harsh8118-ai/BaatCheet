// models/Visitor.js
const mongoose = require("mongoose");

const VisitorSchema = new mongoose.Schema({
    username: { type: String },
    ip: { type: String },
    geo: {
        country: { type: String, default: "" },
        city: { type: String, default: "" },
        region: { type: String, default: "" },
        timezone: { type: String, default: "" },
    },
    user_agent: { type: String },
    device_type: { type: String, default: "device" },
    browser: { type: String },
    os: { type: String },
    screen: { type: String },
    language: { type: String },
    session_id: { type: String },
    referrer: { type: String },
    pages: { type: [String], default: [] },
    entry_time: { type: Date },
    exit_time: { type: Date },
    duration_seconds: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model("Visitor", VisitorSchema);
