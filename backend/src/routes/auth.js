const express = require("express");
const axios = require("axios");
const router = express.Router();
const supabase = require("../lib/supabase");
const { generateToken } = require("../middleware/auth");

const KICK_CLIENT_ID = process.env.KICK_CLIENT_ID || "01KM3MJ0VFDX1762BKS18S3CR5";
const KICK_CLIENT_SECRET = process.env.KICK_CLIENT_SECRET || "1234951294e39c1c060e4fded7e3c48ae27903f94cd581d8be514adc8fec513a";
const KICK_REDIRECT_URI = process.env.KICK_REDIRECT_URI || "http://localhost:3000/auth/callback";

// POST /api/auth/kick/callback
router.post("/kick/callback", async (req, res) => {
  const { code, codeVerifier } = req.body;
  if (!code) return res.status(400).json({ error: "Código de autorización requerido" });
  if (!codeVerifier) return res.status(400).json({ error: "code_verifier requerido" });

  try {
    // Exchange code for token (PKCE flow)
    const tokenRes = await axios.post(
      "https://id.kick.com/oauth/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: KICK_CLIENT_ID,
        client_secret: KICK_CLIENT_SECRET,
        redirect_uri: KICK_REDIRECT_URI,
        code,
        code_verifier: codeVerifier,
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token, expires_in } = tokenRes.data;

    // Get user info from Kick API
    const userRes = await axios.get("https://api.kick.com/public/v1/users", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Client-Id": KICK_CLIENT_ID,
      },
    });

    const kickUser = userRes.data?.data?.[0] || userRes.data?.data || userRes.data;
    const kickId = String(kickUser.user_id || kickUser.id);
    const username = kickUser.username || kickUser.name;
    const avatar = kickUser.profile_pic || kickUser.profile_picture || kickUser.avatar || "";
    const bio = kickUser.bio || "";

    // Upsert user in Supabase
    const { data: existingUser, error: fetchErr } = await supabase
      .from("users")
      .select("*")
      .eq("kick_id", kickId)
      .single();

    let dbUser;
    const now = new Date().toISOString();

    if (fetchErr || !existingUser) {
      // Create new user
      const { data: newUser, error: insertErr } = await supabase
        .from("users")
        .insert({
          kick_id: kickId,
          username,
          avatar,
          bio,
          puntos: 0,
          nivel: 1,
          kick_access_token: access_token,
          kick_refresh_token: refresh_token || null,
          kick_token_expires: expires_in ? new Date(Date.now() + expires_in * 1000).toISOString() : null,
          last_login: now,
          login_count: 1,
        })
        .select()
        .single();

      if (insertErr) throw new Error(insertErr.message);
      dbUser = newUser;
    } else {
      // Update existing user — save new tokens and login info
      const { data: updatedUser, error: updateErr } = await supabase
        .from("users")
        .update({
          username,
          avatar,
          bio,
          kick_access_token: access_token,
          kick_refresh_token: refresh_token || existingUser.kick_refresh_token,
          kick_token_expires: expires_in ? new Date(Date.now() + expires_in * 1000).toISOString() : null,
          last_login: now,
          login_count: (existingUser.login_count || 0) + 1,
          updated_at: now,
        })
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

    // Return user without sensitive tokens
    const safeUser = { ...dbUser };
    delete safeUser.kick_access_token;
    delete safeUser.kick_refresh_token;
    delete safeUser.kick_token_expires;

    res.json({ token, user: safeUser });
  } catch (err) {
    const detail = err.response?.data || err.message;
    console.error("Auth error:", JSON.stringify(detail));
    res.status(500).json({
      error: "Error de autenticación con Kick",
      detail: typeof detail === "object" ? JSON.stringify(detail) : detail,
    });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.json({ message: "Sesión cerrada correctamente" });
});

module.exports = router;
