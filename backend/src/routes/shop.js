const express = require("express");
const router = express.Router();
const supabase = require("../lib/supabase");
const { authMiddleware } = require("../middleware/auth");

// GET /api/shop — list all items
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .order("costo_puntos", { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener items" });
  }
});

// POST /api/shop/redeem — redeem an item
router.post("/redeem", authMiddleware, async (req, res) => {
  const { itemId } = req.body;
  if (!itemId) return res.status(400).json({ error: "itemId requerido" });

  const userId = req.user.id;

  try {
    // Get item
    const { data: item, error: itemErr } = await supabase
      .from("items")
      .select("*")
      .eq("id", itemId)
      .single();

    if (itemErr || !item) return res.status(404).json({ error: "Item no encontrado" });
    if (!item.disponible) return res.status(400).json({ error: "Item no disponible" });

    // Get user points
    const { data: user, error: userErr } = await supabase
      .from("users")
      .select("puntos")
      .eq("id", userId)
      .single();

    if (userErr || !user) return res.status(404).json({ error: "Usuario no encontrado" });
    if (user.puntos < item.costo_puntos) {
      return res.status(400).json({ error: "Puntos insuficientes" });
    }

    // Deduct points
    const { error: updateErr } = await supabase
      .from("users")
      .update({ puntos: user.puntos - item.costo_puntos })
      .eq("id", userId);

    if (updateErr) throw updateErr;

    // Record redemption
    const { error: redemptionErr } = await supabase.from("redemptions").insert({
      usuario_id: userId,
      item_id: itemId,
    });

    if (redemptionErr) throw redemptionErr;

    res.json({ message: "Item canjeado exitosamente", puntos_restantes: user.puntos - item.costo_puntos });
  } catch (err) {
    console.error("Redeem error:", err);
    res.status(500).json({ error: "Error al canjear item" });
  }
});

module.exports = router;
