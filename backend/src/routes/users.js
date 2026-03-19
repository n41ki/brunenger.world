const express = require("express");
const axios = require("axios");
const router = express.Router();
const supabase = require("../lib/supabase");
const { authMiddleware } = require("../middleware/auth");

const KICK_CLIENT_ID = process.env.KICK_CLIENT_ID || "01KM3MJ0VFDX1762BKS18S3CR5";

// GET /api/users/me
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, username, avatar, puntos, nivel, kick_id, es_admin, created_at, last_login, login_count, bio, mensajes_chat, watch_time_mins, es_suscriptor, fecha_follow, es_baneado, es_muteado, insignia")
      .eq("id", req.user.id)
      .single();

    if (error || !data) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener usuario" });
  }
});

// GET /api/users/me/profile — Extended profile with ranking position + Kick channel data
router.get("/me/profile", authMiddleware, async (req, res) => {
  try {
    // Get full user data
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", req.user.id)
      .single();

    if (error || !user) return res.status(404).json({ error: "Usuario no encontrado" });

    // Get ranking position (by points)
    const { data: allUsers } = await supabase
      .from("users")
      .select("id, puntos")
      .order("puntos", { ascending: false });

    let rankPosition = 0;
    if (allUsers) {
      rankPosition = allUsers.findIndex(u => u.id === user.id) + 1;
    }

    // Get total user count
    const totalUsers = allUsers ? allUsers.length : 0;

    // Try to fetch Kick channel data using stored access token
    let kickChannelData = null;
    if (user.kick_access_token) {
      try {
        // Fetch user's own channel info from Kick
        const channelRes = await axios.get("https://api.kick.com/public/v1/channels", {
          headers: {
            Authorization: `Bearer ${user.kick_access_token}`,
            "Client-Id": KICK_CLIENT_ID,
          },
          params: { broadcaster_user_id: user.kick_id },
        });
        kickChannelData = channelRes.data?.data?.[0] || null;
      } catch (e) {
        // Token might be expired, that's ok
        console.log("Could not fetch Kick channel data:", e.response?.status);
      }
    }

    // Return profile without sensitive tokens
    const profile = {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio || "",
      kick_id: user.kick_id,
      puntos: user.puntos,
      nivel: user.nivel,
      es_admin: user.es_admin || false,
      es_suscriptor: user.es_suscriptor || false,
      es_baneado: user.es_baneado || false,
      es_muteado: user.es_muteado || false,
      insignia: user.insignia || null,
      fecha_follow: user.fecha_follow || null,
      mensajes_chat: user.mensajes_chat || 0,
      watch_time_mins: user.watch_time_mins || 0,
      items_canjeados: user.items_canjeados || 0,
      sorteos_participados: user.sorteos_participados || 0,
      created_at: user.created_at,
      last_login: user.last_login,
      login_count: user.login_count || 1,
      rank_position: rankPosition,
      total_users: totalUsers,
      kick_channel: kickChannelData,
    };

    res.json(profile);
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ error: "Error al obtener perfil" });
  }
});

// POST /api/users/points
router.post("/points", authMiddleware, async (req, res) => {
  const { userId, points } = req.body;
  if (!userId || points === undefined) {
    return res.status(400).json({ error: "userId y points son requeridos" });
  }

  try {
    const { data: user, error: fetchErr } = await supabase
      .from("users")
      .select("puntos")
      .eq("id", userId)
      .single();

    if (fetchErr || !user) return res.status(404).json({ error: "Usuario no encontrado" });

    const newPoints = Math.max(0, user.puntos + points);
    const { data, error } = await supabase
      .from("users")
      .update({ puntos: newPoints })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    res.json({ puntos: data.puntos });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar puntos" });
  }
});

// GET /api/users/:id
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, username, avatar, puntos, nivel, created_at")
      .eq("id", req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener usuario" });
  }
});

module.exports = router;
