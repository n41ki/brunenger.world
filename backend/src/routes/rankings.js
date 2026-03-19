const express = require("express");
const router = express.Router();
const supabase = require("../lib/supabase");

// GET /api/rankings — all rankings
router.get("/", async (req, res) => {
  try {
    const [viewersRes, chattersRes, supportersRes] = await Promise.all([
      // Top viewers by watch_time
      supabase
        .from("watch_time")
        .select("usuario_id, tiempo, users(id, username, avatar, puntos, nivel)")
        .order("tiempo", { ascending: false })
        .limit(10),

      // Top chatters by messages
      supabase
        .from("chat_activity")
        .select("usuario_id, mensajes, users(id, username, avatar, puntos, nivel)")
        .order("mensajes", { ascending: false })
        .limit(10),

      // Top by points (supporters proxy)
      supabase
        .from("users")
        .select("id, username, avatar, puntos, nivel")
        .order("puntos", { ascending: false })
        .limit(10),
    ]);

    const mapUser = (row) => ({
      ...(row.users || {}),
      watch_time: row.tiempo,
      chat_messages: row.mensajes,
    });

    res.json({
      topViewers: (viewersRes.data || []).map(mapUser),
      topChatters: (chattersRes.data || []).map(mapUser),
      topSupporters: supportersRes.data || [],
    });
  } catch (err) {
    console.error("Rankings error:", err);
    res.status(500).json({ error: "Error al obtener rankings" });
  }
});

module.exports = router;
