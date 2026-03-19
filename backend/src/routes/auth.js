const express = require("express");
const axios = require("axios");
const router = express.Router();
const supabase = require("../lib/supabase");
const { generateToken } = require("../middleware/auth");

const KICK_CLIENT_ID = process.env.KICK_CLIENT_ID || "01KM3MJ0VFDX1762BKS18S3CR5";
const KICK_CLIENT_SECRET = process.env.KICK_CLIENT_SECRET || "1234951294e39c1c060e4fded7e3c48ae27903f94cd581d8be514adc8fec513a";
const KICK_REDIRECT_URI = process.env.KICK_REDIRECT_URI || "http://localhost:3000/auth/callback";

// POST /api/auth/kick/callback
// Exchanges authorization code for access token and creates/updates user
router.post("/kick/callback", async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Código de autorización requerido" });

  try {
    // Exchange code for token
    const tokenRes = await axios.post(
      "https://id.kick.com/oauth/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: KICK_CLIENT_ID,
        client_secret: KICK_CLIENT_SECRET,
        redirect_uri: KICK_REDIRECT_URI,
        code,
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token } = tokenRes.data;

    // Get user info from Kick API
    const userRes = await axios.get("https://api.kick.com/public/v1/user", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const kickUser = userRes.data?.data || userRes.data;
    const kickId = String(kickUser.user_id || kickUser.id);
    const username = kickUser.username || kickUser.name;
    const avatar = kickUser.profile_pic || kickUser.profile_picture || "";

    // Upsert user in Supabase
    const { data: existingUser, error: fetchErr } = await supabase
      .from("users")
      .select("*")
      .eq("kick_id", kickId)
      .single();

    let dbUser;
    if (fetchErr || !existingUser) {
      // Create new user
      const { data: newUser, error: insertErr } = await supabase
        .from("users")
        .insert({
          kick_id: kickId,
          username,
          avatar,
          puntos: 0,
          nivel: 1,
        })
        .select()
        .single();

      if (insertErr) throw new Error(insertErr.message);
      dbUser = newUser;
    } else {
      // Update existing user
      const { data: updatedUser, error: updateErr } = await supabase
        .from("users")
        .update({ username, avatar, updated_at: new Date().toISOString() })
        .eq("kick_id", kickId)
        .select()
        .single();

      if (updateErr) throw new Error(updateErr.message);
      dbUser = updatedUser;
    }

    // Generate JWT
    const token = generateToken({
      id: dbUser.id,
      kick_id: kickId,
      username: dbUser.username,
    });

    res.json({ token, user: dbUser });
  } catch (err) {
    console.error("Auth error:", err.response?.data || err.message);
    res.status(500).json({ error: "Error de autenticación con Kick" });
  }
});

// GET /api/auth/logout
router.post("/logout", (req, res) => {
  res.json({ message: "Sesión cerrada correctamente" });
});

module.exports = router;
