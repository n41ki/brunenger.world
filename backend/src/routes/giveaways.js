const express = require("express");
const router = express.Router();
const supabase = require("../lib/supabase");
const { authMiddleware } = require("../middleware/auth");

let io; // Will be injected

function setIO(socketIO) {
  io = socketIO;
}

// GET /api/giveaways
router.get("/", async (req, res) => {
  try {
    const { data: giveaways, error } = await supabase
      .from("giveaways")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // For each giveaway, get participants
    const giveawaysWithParticipants = await Promise.all(
      (giveaways || []).map(async (g) => {
        const { data: entries } = await supabase
          .from("giveaway_entries")
          .select("usuario_id, users(id, username, avatar)")
          .eq("giveaway_id", g.id);

        const participantes = (entries || []).map((e) => e.users).filter(Boolean);

        let ganador = null;
        if (g.winner_id) {
          const { data: winnerData } = await supabase
            .from("users")
            .select("id, username, avatar")
            .eq("id", g.winner_id)
            .single();
          ganador = winnerData;
        }

        return { ...g, participantes, ganador };
      })
    );

    res.json(giveawaysWithParticipants);
  } catch (err) {
    console.error("Giveaways error:", err);
    res.status(500).json({ error: "Error al obtener sorteos" });
  }
});

// POST /api/giveaways/:id/join
router.post("/:id/join", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Check giveaway exists and is active
    const { data: giveaway, error: gErr } = await supabase
      .from("giveaways")
      .select("*")
      .eq("id", id)
      .single();

    if (gErr || !giveaway) return res.status(404).json({ error: "Sorteo no encontrado" });
    if (giveaway.estado !== "activo") return res.status(400).json({ error: "El sorteo no está activo" });

    // Check if already participating
    const { data: existing } = await supabase
      .from("giveaway_entries")
      .select("id")
      .eq("giveaway_id", id)
      .eq("usuario_id", userId)
      .single();

    if (existing) return res.status(400).json({ error: "Ya estás participando en este sorteo" });

    // Join
    const { error: insertErr } = await supabase
      .from("giveaway_entries")
      .insert({ giveaway_id: id, usuario_id: userId });

    if (insertErr) throw insertErr;

    res.json({ message: "Te has unido al sorteo exitosamente" });
  } catch (err) {
    console.error("Join giveaway error:", err);
    res.status(500).json({ error: "Error al unirse al sorteo" });
  }
});

// POST /api/giveaways/:id/draw — pick a winner (admin)
router.post("/:id/draw", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    // Get all entries
    const { data: entries, error: eErr } = await supabase
      .from("giveaway_entries")
      .select("usuario_id, users(id, username, avatar)")
      .eq("giveaway_id", id);

    if (eErr) throw eErr;
    if (!entries || entries.length === 0) {
      return res.status(400).json({ error: "No hay participantes en este sorteo" });
    }

    // Get giveaway info
    const { data: giveaway } = await supabase
      .from("giveaways")
      .select("*")
      .eq("id", id)
      .single();

    // Random winner
    const winnerEntry = entries[Math.floor(Math.random() * entries.length)];
    const winner = winnerEntry.users;

    // Update giveaway
    await supabase
      .from("giveaways")
      .update({ estado: "finalizado", winner_id: winner.id })
      .eq("id", id);

    // Emit to all connected clients
    if (io) {
      io.emit("giveaway:winner", {
        giveawayId: id,
        winner,
        prize: giveaway?.premio || "Premio",
      });
      io.emit("giveaway:update");
    }

    res.json({ winner, message: "¡Ganador seleccionado!" });
  } catch (err) {
    console.error("Draw error:", err);
    res.status(500).json({ error: "Error al seleccionar ganador" });
  }
});

// POST /api/giveaways — create giveaway (admin)
router.post("/", authMiddleware, async (req, res) => {
  const { premio, descripcion, imagen } = req.body;
  if (!premio) return res.status(400).json({ error: "Premio requerido" });

  try {
    const { data, error } = await supabase
      .from("giveaways")
      .insert({ premio, descripcion, imagen, estado: "activo" })
      .select()
      .single();

    if (error) throw error;
    if (io) io.emit("giveaway:update");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error al crear sorteo" });
  }
});

module.exports = { router, setIO };
