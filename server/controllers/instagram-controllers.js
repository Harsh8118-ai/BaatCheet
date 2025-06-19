const axios = require("axios");
const InstagramUser = require("../models/instagram-user-model");
const Visitor = require("../models/visitor-model");
const UAParser = require("ua-parser-js");

exports.saveInstagramUser = async (req, res) => {
    try {
        const {
            username,
            full_name,
            biography,
            profile_pic_url,
            follower_count,
            following_count,
            media_count,
            is_private,
            account_type,
            category,
        } = req.body;

        const ip = req.ip;
        const userAgent = req.headers["user-agent"];

        const userData = {
            username,
            full_name,
            biography,
            profile_pic_url,
            follower_count,
            following_count,
            media_count,
            is_private,
            account_type,
            category,
            source_ip: ip,
            user_agent: userAgent,
        };

        const savedUser = await InstagramUser.findOneAndUpdate(
            { username },
            userData,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({ message: "Instagram user data stored", user: savedUser });
    } catch (err) {
        console.error("Error saving Instagram user:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.saveVisitorData = async (req, res) => {
    try {
        const ip = req.ip || req.headers["x-forwarded-for"]?.split(",")[0] || req.connection.remoteAddress;
        const {
            username, screen, language, session_id, referrer, pages,
            entry_time, exit_time, duration_seconds, user_agent
        } = req.body;

        // Parse device info
        const parser = new UAParser(user_agent);
        const { browser, os, device } = parser.getResult();
        const device_type = device.type || "desktop";

        // Fetch geo info
        let geo = {};
        try {
            const geoRes = await axios.get(`https://ipapi.co/${ip}/json/`);
            geo = {
                country: geoRes.data.country_name,
                city: geoRes.data.city,
                region: geoRes.data.region,
                timezone: geoRes.data.timezone,
            };
        } catch (geoErr) {
            console.error("Geo IP lookup failed:", geoErr.message);
        }

        const visitor = new Visitor({
            username,
            ip,
            geo,
            user_agent,
            device_type,
            browser: browser.name,
            os: os.name,
            screen,
            language,
            session_id,
            referrer,
            pages,
            entry_time,
            exit_time,
            duration_seconds,
        });

        await visitor.save();
        res.status(200).json({ message: "Visitor data saved" });
    } catch (err) {
        console.error("Error saving visitor:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};
