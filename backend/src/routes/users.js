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

    // Brunenger's channel IDs (fixed)
    const BRUNENGER_USER_ID = 1704959;

    // Fetch all available Kick data in parallel
    let kickUserData = null;
    let kickFollowData = null;
    let kickSubData = null;

    if (user.kick_access_token) {
      const headers = {
        Authorization: `Bearer ${user.kick_access_token}`,
        "Client-Id": KICK_CLIENT_ID,
        "Accept": "application/json",
      };

      const [userRes, followRes, subRes] = await Promise.allSettled([
        // Own Kick user info (badges, bio, etc.)
        axios.get("https://api.kick.com/public/v1/users", { headers }),

        // Follow status for Brunenger's channel
        axios.get("https://api.kick.com/public/v1/channels/followed", {
          headers,
          params: { broadcaster_user_id: BRUNENGER_USER_ID },
        }),

        // Subscription status on Brunenger's channel
        axios.get("https://api.kick.com/public/v1/subscriptions", {
          headers,
          params: { broadcaster_user_id: BRUNENGER_USER_ID },
        }),
      ]);

      if (userRes.status === "fulfilled") {
        kickUserData = userRes.value.data?.data?.[0] || userRes.value.data?.data || null;
      }
      if (followRes.status === "fulfilled") {
        const followList = followRes.value.data?.data || [];
        kickFollowData = followList.find(f => String(f.broadcaster_user_id) === String(BRUNENGER_USER_ID)) || null;
      }
      if (subRes.status === "fulfilled") {
        const subList = subRes.value.data?.data || [];
        kickSubData = subList.length > 0 ? subList[0] : null;
      }

      // Update DB with fresh Kick data
      const updatePayload = {};
      if (kickFollowData) {
        updatePayload.fecha_follow = kickFollowData.followed_at || kickFollowData.created_at || null;
      }
      if (kickSubData !== null) {
        updatePayload.es_suscriptor = kickSubData !== null;
        updatePayload.subscription_tier = kickSubData?.tier || null;
      }
      if (kickUserData?.profile_pic) {
        updatePayload.avatar = kickUserData.profile_pic;
      }
      if (Object.keys(updatePayload).length > 0) {
        await supabase.from("users").update(updatePayload).eq("id", user.id);
      }
    }

    // Return profile without sensitive tokens
    const profile = {
      id: user.id,
      username: user.username,
      avatar: kickUserData?.profile_pic || user.avatar,
      bio: kickUserData?.bio || user.bio || "",
      kick_id: user.kick_id,
      puntos: user.puntos || 0,
      nivel: user.nivel || 1,
      es_admin: user.es_admin || false,
      es_suscriptor: kickSubData ? true : (user.es_suscriptor || false),
      subscription_tier: kickSubData?.tier || user.subscription_tier || null,
      es_baneado: user.es_baneado || false,
      es_muteado: user.es_muteado || false,
      insignia: user.insignia || null,
      fecha_follow: kickFollowData?.followed_at || kickFollowData?.created_at || user.fecha_follow || null,
      mensajes_chat: user.mensajes_chat || 0,
      emoji_messages: user.emoji_messages || 0,
      watch_time_mins: user.watch_time_mins || 0,
      items_canjeados: user.items_canjeados || 0,
      sorteos_participados: user.sorteos_participados || 0,
      created_at: user.created_at,
      last_login: user.last_login,
      last_seen_at: user.last_seen_at || null,
      login_count: user.login_count || 1,
      rank_position: rankPosition,
      total_users: totalUsers,
      // Raw Kick API data for extra details
      kick_badges: kickUserData?.badges || [],
      kick_social_links: kickUserData?.social_links || [],
      kick_is_following: !!kickFollowData,
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
