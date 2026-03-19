/**
 * Kick Chat Bot — Brunenger World
 * Conecta al chat de Kick via Pusher y acumula puntos + estadísticas
 */

const Pusher = require("pusher-js");
const supabase = require("../lib/supabase");

// ─── Config ───────────────────────────────────────────────────────────────
const KICK_PUSHER_KEY = "eb1d5f283081a78b932c";
const KICK_PUSHER_CLUSTER = "us2";
const KICK_PUSHER_HOST = "ws-us2.pusher.com";
const CHATROOM_ID = 1648550; // brunenger chatroom ID
const CHANNEL_SLUG = "brunenger";

// ─── Puntos por acción ────────────────────────────────────────────────────
const POINTS = {
  MESSAGE: 1,          // mensaje normal
  EMOJI_ONLY: 1,       // mensaje solo emojis (mismo que normal por ahora)
  FIRST_MESSAGE: 5,    // primer mensaje del stream
  SUBSCRIPTION: 100,   // se suscribió
  GIFT_SUB: 50,        // recibió gift sub
  FOLLOW: 20,          // siguió el canal
};

// Cache en memoria para no consultar DB en cada mensaje (5 min TTL)
const userCache = new Map(); // kick_user_id -> { db_id, points, first_msg_stream }
const sessionFirstMessages = new Set(); // kick_user_ids que ya mandaron primer msg hoy
let io = null;
let isRunning = false;

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Detecta si un mensaje es solo emojis */
function isEmojiOnly(text) {
  const stripped = text.replace(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "").trim();
  return stripped.length === 0 && text.trim().length > 0;
}

/**
 * Obtiene o crea el usuario en Supabase por kick_user_id
 * Cachea el resultado 5 minutos
 */
async function getOrCreateUser(kickUser) {
  const cacheKey = String(kickUser.id);

  if (userCache.has(cacheKey)) {
    const cached = userCache.get(cacheKey);
    if (Date.now() - cached.ts < 5 * 60 * 1000) return cached;
  }

  // Buscar en DB
  let { data: user, error } = await supabase
    .from("users")
    .select("id, kick_user_id, username, puntos, mensajes_chat, emoji_messages")
    .eq("kick_user_id", String(kickUser.id))
    .single();

  if (!user || error) {
    // Crear usuario nuevo
    const { data: newUser, error: createErr } = await supabase
      .from("users")
      .insert({
        kick_user_id: String(kickUser.id),
        username: kickUser.username,
        avatar: kickUser.profile_pic || null,
        puntos: 0,
        mensajes_chat: 0,
        emoji_messages: 0,
        created_at: new Date().toISOString(),
      })
      .select("id, kick_user_id, username, puntos, mensajes_chat, emoji_messages")
      .single();

    if (createErr) {
      console.error("[Bot] Error creando usuario:", createErr.message);
      return null;
    }
    user = newUser;
    console.log(`[Bot] 👤 Nuevo usuario: ${user.username}`);
  }

  const entry = { ...user, ts: Date.now() };
  userCache.set(cacheKey, entry);
  return entry;
}

/**
 * Acumula puntos y estadísticas al usuario
 */
async function awardPoints(kickUserId, pointsToAdd, statsUpdate) {
  // Actualizar cache local primero
  if (userCache.has(String(kickUserId))) {
    const c = userCache.get(String(kickUserId));
    c.puntos = (c.puntos || 0) + pointsToAdd;
    if (statsUpdate.mensajes_chat) c.mensajes_chat = (c.mensajes_chat || 0) + 1;
    if (statsUpdate.emoji_messages) c.emoji_messages = (c.emoji_messages || 0) + 1;
  }

  // Update en Supabase usando RPC para atomicidad
  const updates = {};
  if (pointsToAdd > 0) updates.points = pointsToAdd;
  if (statsUpdate.total_messages) updates.total_messages = 1;
  if (statsUpdate.emoji_messages) updates.emoji_messages = 1;

  // Usar rpc increment para evitar race conditions
  const { error } = await supabase.rpc("increment_user_stats", {
    p_kick_user_id: String(kickUserId),
    p_points: pointsToAdd,
    p_messages: statsUpdate.total_messages ? 1 : 0,
    p_emoji_messages: statsUpdate.emoji_messages ? 1 : 0,
  });

  if (error) {
    // Fallback: UPDATE directo
    await supabase
      .from("users")
      .update({
        points: supabase.rpc ? undefined : undefined,
      })
      .eq("kick_user_id", String(kickUserId));
  }
}

// ─── Handlers de eventos ──────────────────────────────────────────────────

async function handleChatMessage(data) {
  try {
    const { sender, content } = data;
    if (!sender || !content) return;

    const kickUser = {
      id: sender.id,
      username: sender.username,
      profile_pic: sender.profile_pic || null,
    };

    const user = await getOrCreateUser(kickUser);
    if (!user) return;

    // Calcular puntos y stats
    let pointsEarned = POINTS.MESSAGE;
    const emojiOnly = isEmojiOnly(content);
    const isFirstMsg = !sessionFirstMessages.has(String(sender.id));

    if (isFirstMsg) {
      pointsEarned += POINTS.FIRST_MESSAGE;
      sessionFirstMessages.add(String(sender.id));
      console.log(`[Bot] ⭐ Primer mensaje de ${sender.username} (+${POINTS.FIRST_MESSAGE} bonus)`);
    }

    await awardPoints(sender.id, pointsEarned, {
      mensajes_chat: true,
      emoji_messages: emojiOnly,
    });

    // Log en consola (solo cada 50 msgs para no saturar)
    const newTotal = (user.total_messages || 0) + 1;
    if (newTotal % 50 === 0 || isFirstMsg) {
      console.log(`[Bot] 💬 ${sender.username}: +${pointsEarned}pts (total msgs: ${newTotal})`);
    }

    // Emitir evento Socket.IO si hay io disponible (para live updates en dashboard)
    if (io && isFirstMsg) {
      io.emit("user_activity", {
        type: "first_message",
        username: sender.username,
        points: pointsEarned,
      });
    }
  } catch (err) {
    console.error("[Bot] Error procesando mensaje:", err.message);
  }
}

async function handleSubscription(data) {
  try {
    const { username, user_id } = data.subscriber || data;
    if (!username) return;

    const kickUser = { id: user_id || data.user_id, username };
    const user = await getOrCreateUser(kickUser);
    if (!user) return;

    await awardPoints(kickUser.id, POINTS.SUBSCRIPTION, {});
    console.log(`[Bot] 🎉 Sub de ${username} +${POINTS.SUBSCRIPTION}pts`);

    if (io) {
      io.emit("subscription", { username, points: POINTS.SUBSCRIPTION });
    }
  } catch (err) {
    console.error("[Bot] Error procesando sub:", err.message);
  }
}

async function handleFollow(data) {
  try {
    const { user_id, username } = data;
    if (!username) return;

    const kickUser = { id: user_id, username };
    const user = await getOrCreateUser(kickUser);
    if (!user) return;

    await awardPoints(user_id, POINTS.FOLLOW, {});
    console.log(`[Bot] ❤️  Follow de ${username} +${POINTS.FOLLOW}pts`);
  } catch (err) {
    console.error("[Bot] Error procesando follow:", err.message);
  }
}

// ─── Reset de sesión (al cambiar de stream) ───────────────────────────────

function resetSession() {
  sessionFirstMessages.clear();
  userCache.clear();
  console.log("[Bot] 🔄 Sesión reseteada");
}

// ─── Conexión Pusher ──────────────────────────────────────────────────────

function connect(socketIo) {
  if (isRunning) return;
  io = socketIo;
  isRunning = true;

  console.log(`[Bot] 🤖 Iniciando Kick Chat Bot para canal: ${CHANNEL_SLUG}`);
  console.log(`[Bot] 📡 Chatroom ID: ${CHATROOM_ID}`);

  const pusher = new Pusher(KICK_PUSHER_KEY, {
    cluster: KICK_PUSHER_CLUSTER,
    wsHost: KICK_PUSHER_HOST,
    wsPort: 443,
    wssPort: 443,
    forceTLS: true,
    disableStats: true,
  });

  pusher.connection.bind("connected", () => {
    console.log("[Bot] ✅ Conectado a Kick Pusher");
  });

  pusher.connection.bind("error", (err) => {
    console.error("[Bot] ❌ Error de conexión Pusher:", err);
  });

  pusher.connection.bind("disconnected", () => {
    console.warn("[Bot] ⚠️  Desconectado de Pusher — reconectando...");
    isRunning = false;
    setTimeout(() => connect(io), 5000);
  });

  // ─── Suscribirse al chatroom ─────────────────────────────────────────
  const chatroomChannel = pusher.subscribe(`chatrooms.${CHATROOM_ID}.v2`);

  chatroomChannel.bind("pusher:subscription_succeeded", () => {
    console.log(`[Bot] 💬 Escuchando chat de ${CHANNEL_SLUG}`);
  });

  // Mensajes de chat
  chatroomChannel.bind("App\\Events\\ChatMessageEvent", handleChatMessage);

  // ─── Suscribirse al canal principal (subs, follows) ──────────────────
  const channelEvents = pusher.subscribe(`channel.${CHATROOM_ID}`);

  channelEvents.bind("App\\Events\\SubscriptionEvent", handleSubscription);
  channelEvents.bind("App\\Events\\FollowEvent", handleFollow);

  // Reset de sesión a medianoche
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const msToMidnight = midnight - now;
  setTimeout(() => {
    resetSession();
    setInterval(resetSession, 24 * 60 * 60 * 1000);
  }, msToMidnight);

  return pusher;
}

module.exports = { connect, resetSession };
