// models/Visitor.js
const mongoose = require("mongoose");

const VisitorSchema = new mongoose.Schema({
    username: String,
    ip: String,
    geo: {
        country: String,
        city: String,
        region: String,
        timezone: String,
    },
    user_agent: String,
    device_type: String,
    browser: String,
    os: String,
    screen: String,
    language: String,
    session_id: String,
    referrer: String,
    pages: [String],
    entry_time: Date,
    exit_time: Date,
    duration_seconds: Number,
}, { timestamps: true });

module.exports = mongoose.model("Visitor", VisitorSchema);
