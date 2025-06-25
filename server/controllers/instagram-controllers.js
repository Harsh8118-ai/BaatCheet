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

        const visitEntry = {
            timestamp: new Date(),
            ip,
            user_agent: userAgent,
        };

        const updatedUser = await InstagramUser.findOneAndUpdate(
      { username },
      {
        $set: {
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
        },
        $inc: { visit_count: 1 },
        $push: { visit_history: visitEntry },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ message: "Instagram user data stored", user: updatedUser });
  } catch (err) {
    console.error("Error saving Instagram user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


exports.getInstagramUser = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await InstagramUser.findOne({ username });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error("Error fetching Instagram user:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};


exports.saveVisitorData = async (req, res) => {
    try {
        // Accurate IP detection (trust proxy must be set in app)
        const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
            req.connection?.remoteAddress ||
            req.socket?.remoteAddress;

        const {
            username, screen, language, session_id, referrer, pages,
            entry_time, exit_time, duration_seconds, user_agent
        } = req.body;

        // Parse device info from user agent
        const parser = new UAParser(user_agent);
        const { browser, os, device } = parser.getResult();
        const device_type = device.type || "desktop";
        const browserName = browser.name || "Unknown";
        const osName = os.name || "Unknown";

        // Time handling
        const entry = new Date(entry_time);
        const finalExitTime = exit_time ? new Date(exit_time) : new Date();
        const duration = duration_seconds ?? Math.floor((finalExitTime - entry) / 1000);

        // Geo Lookup
        let geo = {
            country: "",
            city: "",
            region: "",
            timezone: ""
        };

        try {
            if (ip && ip !== "::1" && ip !== "127.0.0.1") {
                const geoRes = await axios.get(`https://ipinfo.io/${ip}?token=${process.env.IPINFO_TOKEN}`);
                geo = {
                    country: geoRes.data.country || "",
                    city: geoRes.data.city || "",
                    region: geoRes.data.region || "",
                    timezone: geoRes.data.timezone || ""
                };
            }
        } catch (geoErr) {
            console.error("Geo IP lookup failed:", geoErr.message);
        }

        // Save visitor to DB
        const visitor = new Visitor({
            username,
            ip,
            geo,
            user_agent,
            device_type,
            browser: browserName,
            os: osName,
            screen,
            language,
            session_id,
            referrer,
            pages,
            entry_time: entry,
            exit_time: finalExitTime,
            duration_seconds: duration,
        });

        await visitor.save();
        res.status(200).json({ message: "Visitor data saved" });

    } catch (err) {
        console.error("Error saving visitor:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};
