const express = require("express");
const axios = require("axios");
const router = express.Router();

const KICK_CHANNEL_SLUG = process.env.KICK_CHANNEL_SLUG || "brunenger";
const KICK_CLIENT_ID = process.env.KICK_CLIENT_ID || "01KM3MJ0VFDX1762BKS18S3CR5";

let statusCache = null;
let cacheTime = 0;
const CACHE_TTL = 30000; // 30s

// GET /api/stream/status
router.get("/status", async (req, res) => {
  const now = Date.now();
  if (statusCache && now - cacheTime < CACHE_TTL) {
    return res.json(statusCache);
  }

  try {
    // Try Kick public API
    const response = await axios.get(
      `https://api.kick.com/public/v1/channels?broadcaster_user_login=${KICK_CHANNEL_SLUG}`,
      {
        headers: {
          "Client-Id": KICK_CLIENT_ID,
          Accept: "application/json",
        },
        timeout: 5000,
      }
    );

    const channel = response.data?.data?.[0] || response.data;
    const isLive = channel?.stream?.is_live || channel?.is_live || false;

    statusCache = {
      isLive,
      viewers: channel?.stream?.viewer_count || channel?.viewers_count || 0,
      title: channel?.stream?.title || channel?.channel?.stream_title || "",
      game: channel?.stream?.categories?.[0]?.name || "",
      thumbnail: channel?.stream?.thumbnail?.url || "",
    };
    cacheTime = now;

    res.json(statusCache);
  } catch (err) {
    // Fallback: try legacy Kick API
    try {
      const legacyRes = await axios.get(
        `https://kick.com/api/v1/channels/${KICK_CHANNEL_SLUG}`,
        { timeout: 5000 }
      );
      const ch = legacyRes.data;
      statusCache = {
        isLive: ch?.livestream !== null && ch?.livestream !== undefined,
        viewers: ch?.livestream?.viewer_count || 0,
        title: ch?.livestream?.session_title || "",
        game: ch?.livestream?.categories?.[0]?.name || "",
        thumbnail: ch?.livestream?.thumbnail?.url || "",
      };
      cacheTime = now;
      res.json(statusCache);
    } catch {
      res.json({ isLive: false, viewers: 0, title: "", game: "" });
    }
  }
});

module.exports = router;
