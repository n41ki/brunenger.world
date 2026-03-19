const express = require("express");
const router = express.Router();
const supabase = require("../lib/supabase");
const { authMiddleware } = require("../middleware/auth");

// GET /api/users/me
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, username, avatar, puntos, nivel, kick_id, created_at")
      .eq("id", req.user.id)
      .single();

    if (error || !data) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener usuario" });
  }
});

// POST /api/users/points
// Add or subtract points (admin only in production)
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
