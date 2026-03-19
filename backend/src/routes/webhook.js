/**
 * Webhook handler para eventos de Kick
 * Recibe y procesa eventos de EventSub (chat, follows, subs, bans, stream)
 */

const express = require("express");
const crypto  = require("crypto");
const axios   = require("axios");
const router  = express.Router();
const supabase = require("../lib/supabase");

const KICK_CLIENT_ID    = process.env.KICK_CLIENT_ID;
const BRUNENGER_USER_ID = 1704959;

// ─── Puntos por acción ────────────────────────────────────────────────────
const POINTS = {
  MESSAGE:        1,
  FIRST_MESSAGE:  5,
  FOLLOW:         20,
  SUBSCRIPTION:   100,
  RENEWAL:        50,
  GIFT_SUB:       30,   // por sub gifteada recibida
};

let kickPublicKey  = null;
let io             = null;
const sessionFirstMessages = new Set(); // reset al iniciar/terminar stream

// ─── Obtener clave pública de Kick (cachea 1h) ────────────────────────────
async function getKickPublicKey() {
  if (kickPublicKey) return kickPublicKey;
  try {
    const { data } = await axios.get("https://api.kick.com/public/v1/public-key", {
      headers: { "Client-Id": KICK_CLIENT_ID },
    });
    kickPublicKey = data?.data?.public_key || data?.public_key || null;
    setTimeout(() => { kickPublicKey = null; }, 60 * 60 * 1000);
    return kickPublicKey;
  } catch (e) {
    console.error("[Webhook] Error obteniendo clave pública:", e.message);
    return null;
  }
}

/**
 * Verifica firma RSA del webhook de Kick
 */
async function verifySignature(req) {
  try {
    const messageId  = req.headers["kick-event-message-id"]  || "";
    const timestamp  = req.headers["kick-event-message-timestamp"] || "";
    const signature  = req.headers["kick-event-signature"]   || "";
    const rawBody    = req.rawBody || JSON.stringify(req.body);

    if (!messageId || !timestamp || !signature) return false;

    const pubKey = await getKickPublicKey();
    if (!pubKey) return true; // si no hay clave, aceptar (no bloquear en dev)

    const sigBuffer = Buffer.from(signature, "base64");
    const message   = `${messageId}.${timestamp}.${rawBody}`;
    const hash      = crypto.createHash("sha256").update(message).digest();

    return crypto.verify("sha256", hash, pubKey, sigBuffer);
  } catch (e) {
    console.error("[Webhook] Error verificando firma:", e.message);
    return false;
  }
}

// ─── User cache (5min) ────────────────────────────────────────────────────
const userCache = new Map();

async function getOrCreateUser(kickUserId, username, avatar) {
  const key = String(kickUserId);
  const cached = userCache.get(key);
  if (cached && Date.now() - cached.ts < 5 * 60 * 1000) return cached;

  let { data: user } = await supabase
    .from("users")
    .select("id, kick_user_id, username, puntos, mensajes_chat")
    .eq("kick_user_id", key)
    .single();

  if (!user) {
    const { data: newUser } = await supabase
      .from("users")
      .insert({
        kick_user_id: key,
        username:     username || "unknown",
        avatar:       avatar   || null,
        puntos:       0,
        mensajes_chat: 0,
        emoji_messages: 0,
      })
      .select("id, kick_user_id, username, puntos, mensajes_chat")
      .single();
    user = newUser;
    if (user) console.log(`[Webhook] 👤 Nuevo usuario: ${user.username}`);
  }

  if (user) userCache.set(key, { ...user, ts: Date.now() });
  return user;
}

async function addPoints(kickUserId, points, stats = {}) {
  if (userCache.has(String(kickUserId))) {
    const c = userCache.get(String(kickUserId));
    c.puntos = (c.puntos || 0) + points;
  }
  await supabase.rpc("increment_user_stats", {
    p_kick_user_id:   String(kickUserId),
    p_points:         points,
    p_messages:       stats.mensajes_chat ? 1 : 0,
    p_emoji_messages: stats.emoji_messages ? 1 : 0,
  });
}

// ─── Detectar emoji only ──────────────────────────────────────────────────
function isEmojiOnly(text) {
  const stripped = text.replace(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "").trim();
  return stripped.length === 0 && text.trim().length > 0;
}

// ─── Handlers por evento ──────────────────────────────────────────────────

async function onChatMessage(event) {
  const sender  = event.sender || event.broadcaster;
  const content = event.content || event.message;
  if (!sender || !content) return;

  const user = await getOrCreateUser(sender.user_id || sender.id, sender.username, null);
  if (!user) return;

  const emojiOnly  = isEmojiOnly(String(content));
  const isFirst    = !sessionFirstMessages.has(String(sender.user_id || sender.id));
  let pts          = POINTS.MESSAGE;

  if (isFirst) {
    pts += POINTS.FIRST_MESSAGE;
    sessionFirstMessages.add(String(sender.user_id || sender.id));
  }

  await addPoints(sender.user_id || sender.id, pts, { mensajes_chat: true, emoji_messages: emojiOnly });

  if (io && isFirst) {
    io.emit("user_activity", { type: "first_message", username: sender.username, points: pts });
  }
}

async function onFollow(event) {
  const u = event.follower || event;
  const user = await getOrCreateUser(u.user_id || u.id, u.username, null);
  if (!user) return;

  await supabase.from("users")
    .update({ fecha_follow: event.followed_at || new Date().toISOString() })
    .eq("kick_user_id", String(u.user_id || u.id));

  await addPoints(u.user_id || u.id, POINTS.FOLLOW);
  console.log(`[Webhook] ❤️  Follow de ${u.username} +${POINTS.FOLLOW}pts`);

  if (io) io.emit("new_follow", { username: u.username });
}

async function onSubscription(event) {
  const u    = event.subscriber || event;
  const user = await getOrCreateUser(u.user_id || u.id, u.username, null);
  if (!user) return;

  await supabase.from("users")
    .update({ es_suscriptor: true, subscription_tier: event.tier || null })
    .eq("kick_user_id", String(u.user_id || u.id));

  await addPoints(u.user_id || u.id, POINTS.SUBSCRIPTION);
  console.log(`[Webhook] 🎉 Sub de ${u.username} +${POINTS.SUBSCRIPTION}pts`);

  if (io) io.emit("new_sub", { username: u.username, tier: event.tier });
}

async function onRenewal(event) {
  const u = event.subscriber || event;
  await getOrCreateUser(u.user_id || u.id, u.username, null);
  await addPoints(u.user_id || u.id, POINTS.RENEWAL);
  console.log(`[Webhook] 🔄 Renovación de ${u.username} +${POINTS.RENEWAL}pts`);
}

async function onGiftSub(event) {
  // Regalar subs: dar puntos a los que reciben
  const recipients = event.recipients || [];
  for (const r of recipients) {
    await getOrCreateUser(r.user_id || r.id, r.username, null);
    await addPoints(r.user_id || r.id, POINTS.GIFT_SUB);
  }
  if (recipients.length > 0) {
    console.log(`[Webhook] 🎁 ${recipients.length} gift subs recibidos`);
  }
}

async function onBan(event) {
  const u = event.banned_user || event;
  await supabase.from("users")
    .update({ es_baneado: true })
    .eq("kick_user_id", String(u.user_id || u.id));
  console.log(`[Webhook] 🚫 Ban: ${u.username}`);
}

function onStreamStatus(event) {
  const isLive = event.is_live === true || event.type === "StreamerIsLive";
  if (!isLive) {
    // Stream terminó — resetear primer mensaje de sesión
    sessionFirstMessages.clear();
    console.log("[Webhook] 🔴 Stream terminado — sesión reseteada");
  } else {
    console.log("[Webhook] 🟢 Stream iniciado");
  }
  if (io) io.emit("stream_status", { is_live: isLive });
}

// ─── Mapa de eventos ──────────────────────────────────────────────────────
const EVENT_HANDLERS = {
  "chat.message.sent":         onChatMessage,
  "channel.followed":          onFollow,
  "channel.subscription.new":  onSubscription,
  "channel.subscription.renewal": onRenewal,
  "channel.subscription.gifts": onGiftSub,
  "moderation.banned":         onBan,
  "livestream.status.updated": onStreamStatus,
};

// ─── Endpoint POST /webhook/kick ──────────────────────────────────────────
router.post("/kick", async (req, res) => {
  // Siempre responder 200 rápido para evitar retries de Kick
  res.status(200).json({ ok: true });

  const eventType = req.headers["kick-event-type"] || req.body?.event;
  if (!eventType) return;

  // Verificar firma (no bloquea si no hay clave en dev)
  const valid = await verifySignature(req);
  if (!valid) {
    console.warn(`[Webhook] ⚠️  Firma inválida para ${eventType}`);
    return;
  }

  const payload = req.body?.data || req.body;
  const handler = EVENT_HANDLERS[eventType];

  if (handler) {
    handler(payload).catch(err => console.error(`[Webhook] Error en ${eventType}:`, err.message));
  } else {
    console.log(`[Webhook] Evento no manejado: ${eventType}`);
  }
});

// ─── Export para inyectar io ──────────────────────────────────────────────
function setIO(socketIo) { io = socketIo; }

module.exports = { router, setIO };
