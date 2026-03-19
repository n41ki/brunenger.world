require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { createServer } = require("http");
const { Server } = require("socket.io");

const kickEventSub = require("./bot/kickEventSub");
// kickBot (Pusher) reemplazado por EventSub webhooks
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const shopRoutes = require("./routes/shop");
const rankingsRoutes = require("./routes/rankings");
const streamRoutes = require("./routes/stream");
const { router: giveawaysRouter, setIO } = require("./routes/giveaways");
const adminRoutes = require("./routes/admin");
const { router: webhookRouter, setIO: setWebhookIO } = require("./routes/webhook");

const app = express();
const httpServer = createServer(app);

const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "").trim();
const PORT = process.env.PORT || 3001;

// ─── Socket.IO ────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

setIO(io);
setWebhookIO(io);

io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
}));

// Guardar raw body para verificación de firma de webhooks (solo en /webhook)
app.use("/webhook", express.json({
  verify: (req, res, buf) => { req.rawBody = buf.toString(); }
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "Demasiadas solicitudes, intenta más tarde" },
});
app.use("/api/", limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Demasiados intentos de autenticación" },
});
app.use("/api/auth/", authLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────
app.use("/webhook", webhookRouter);   // Kick EventSub webhooks (no rate limit)
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/rankings", rankingsRoutes);
app.use("/api/stream", streamRoutes);
app.use("/api/giveaways", giveawaysRouter);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

// ─── Start ─────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`🚀 Brunenger World API running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌍 Accepting connections from: ${FRONTEND_URL}`);
  // Suscribir a eventos de Kick via EventSub (webhooks oficiales)
  setTimeout(() => kickEventSub.subscribe(), 3000);
});
