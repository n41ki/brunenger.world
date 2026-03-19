const express = require("express");
const router = express.Router();
const supabase = require("../lib/supabase");
const { authMiddleware } = require("../middleware/auth");

const ADMIN_SECRET = process.env.ADMIN_SECRET || "";

// Admin check: either es_admin flag in JWT or x-admin-key header
function adminMiddleware(req, res, next) {
  // First: check x-admin-key header
  if (ADMIN_SECRET && req.headers["x-admin-key"] === ADMIN_SECRET) return next();
  // Second: check JWT token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Acceso admin requerido" });
  }
  const jwt = require("jsonwebtoken");
  const JWT_SECRET = process.env.JWT_SECRET || "brunenger-super-secret-key-change-in-production";
  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET);
    if (!decoded.es_admin) return res.status(403).json({ error: "No tienes permisos de admin" });
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}

// ─── ITEMS ────────────────────────────────────────────────────────────────

// GET all items
router.get("/items", adminMiddleware, async (req, res) => {
  const { data, error } = await supabase.from("items").select("*").order("costo_puntos");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

// POST create item
router.post("/items", adminMiddleware, async (req, res) => {
  const { nombre, descripcion, imagen, costo_puntos, categoria } = req.body;
  if (!nombre || !costo_puntos) return res.status(400).json({ error: "nombre y costo_puntos requeridos" });
  const { data, error } = await supabase.from("items")
    .insert({ nombre, descripcion, imagen, costo_puntos: Number(costo_puntos), categoria, disponible: true })
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PUT update item
router.put("/items/:id", adminMiddleware, async (req, res) => {
  const { nombre, descripcion, imagen, costo_puntos, categoria, disponible } = req.body;
  const updates = {};
  if (nombre !== undefined)       updates.nombre        = nombre;
  if (descripcion !== undefined)  updates.descripcion   = descripcion;
  if (imagen !== undefined)       updates.imagen        = imagen;
  if (costo_puntos !== undefined) updates.costo_puntos  = Number(costo_puntos);
  if (categoria !== undefined)    updates.categoria     = categoria;
  if (disponible !== undefined)   updates.disponible    = disponible;
  const { data, error } = await supabase.from("items").update(updates).eq("id", req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE item
router.delete("/items/:id", adminMiddleware, async (req, res) => {
  const { error } = await supabase.from("items").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ─── GIVEAWAYS ────────────────────────────────────────────────────────────

// GET all giveaways (admin view)
router.get("/giveaways", adminMiddleware, async (req, res) => {
  const { data, error } = await supabase.from("giveaways").select("*, giveaway_entries(count)").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

// POST create giveaway
router.post("/giveaways", adminMiddleware, async (req, res) => {
  const { premio, descripcion, imagen } = req.body;
  if (!premio) return res.status(400).json({ error: "premio requerido" });
  const { data, error } = await supabase.from("giveaways")
    .insert({ premio, descripcion, imagen, estado: "activo" })
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST draw winner
router.post("/giveaways/:id/draw", adminMiddleware, async (req, res) => {
  const { setIO } = require("./giveaways");
  const giveawayId = req.params.id;

  // Get all entries
  const { data: entries, error: eErr } = await supabase
    .from("giveaway_entries")
    .select("usuario_id, users(username,avatar)")
    .eq("giveaway_id", giveawayId);
  if (eErr) return res.status(500).json({ error: eErr.message });
  if (!entries || entries.length === 0) return res.status(400).json({ error: "Sin participantes" });

  // Pick random winner
  const winner = entries[Math.floor(Math.random() * entries.length)];
  const winnerUser = winner.users;

  // Update giveaway
  const { data: giveaway } = await supabase.from("giveaways").select("premio").eq("id", giveawayId).single();
  await supabase.from("giveaways").update({ estado: "finalizado", ganador_id: winner.usuario_id }).eq("id", giveawayId);

  // Broadcast via Socket.IO
  try {
    const { getIO } = require("./giveaways");
    const io = getIO();
    if (io) io.emit("giveaway:winner", { winner: { id: winner.usuario_id, ...winnerUser }, prize: giveaway?.premio });
  } catch {}

  res.json({ winner: winnerUser, prize: giveaway?.premio });
});

// DELETE giveaway
router.delete("/giveaways/:id", adminMiddleware, async (req, res) => {
  const { error } = await supabase.from("giveaways").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ─── STATS ────────────────────────────────────────────────────────────────
router.get("/stats", adminMiddleware, async (req, res) => {
  const [users, items, giveaways, redemptions] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("items").select("id", { count: "exact", head: true }),
    supabase.from("giveaways").select("id", { count: "exact", head: true }),
    supabase.from("redemptions").select("id", { count: "exact", head: true }),
  ]);
  res.json({
    users:       users.count       || 0,
    items:       items.count       || 0,
    giveaways:   giveaways.count   || 0,
    redemptions: redemptions.count || 0,
  });
});

module.exports = router;
