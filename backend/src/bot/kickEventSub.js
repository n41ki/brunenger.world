/**
 * Kick EventSub — Brunenger World
 * Suscribe a eventos del canal via webhooks oficiales de Kick
 * Reemplaza la conexión Pusher (más confiable)
 */

const axios = require("axios");

const KICK_CLIENT_ID     = process.env.KICK_CLIENT_ID;
const KICK_CLIENT_SECRET = process.env.KICK_CLIENT_SECRET;
const BACKEND_URL        = process.env.BACKEND_URL; // e.g. https://brunenger-world-api.onrender.com
const BRUNENGER_USER_ID  = 1704959;

// Eventos que queremos recibir
const EVENTS = [
  "chat.message.sent",
  "channel.followed",
  "channel.subscription.new",
  "channel.subscription.renewal",
  "channel.subscription.gifts",
  "moderation.banned",
  "livestream.status.updated",
];

let appToken = null;
let tokenExpiry = 0;

/**
 * Obtiene un App Access Token (client_credentials) — no requiere usuario
 */
async function getAppToken() {
  if (appToken && Date.now() < tokenExpiry) return appToken;

  const res = await axios.post(
    "https://id.kick.com/oauth/token",
    new URLSearchParams({
      grant_type:    "client_credentials",
      client_id:     KICK_CLIENT_ID,
      client_secret: KICK_CLIENT_SECRET,
    }).toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  appToken  = res.data.access_token;
  tokenExpiry = Date.now() + (res.data.expires_in - 60) * 1000;
  return appToken;
}

/**
 * Suscribe a todos los eventos del canal brunenger
 */
async function subscribe() {
  if (!KICK_CLIENT_ID || !KICK_CLIENT_SECRET) {
    console.warn("[EventSub] Faltan KICK_CLIENT_ID / KICK_CLIENT_SECRET — salteando suscripción");
    return;
  }
  if (!BACKEND_URL) {
    console.warn("[EventSub] Falta BACKEND_URL env var — salteando suscripción de webhooks");
    return;
  }

  try {
    const token    = await getAppToken();
    const webhookUrl = `${BACKEND_URL}/webhook/kick`;
    const headers  = {
      Authorization: `Bearer ${token}`,
      "Client-Id":   KICK_CLIENT_ID,
      "Content-Type": "application/json",
    };

    // Obtener suscripciones existentes para no duplicar
    const { data: existing } = await axios.get(
      "https://api.kick.com/public/v1/events/subscriptions",
      { headers }
    );
    const existingTypes = new Set(
      (existing?.data || []).map(s => s.event_type)
    );

    let created = 0;
    for (const event of EVENTS) {
      if (existingTypes.has(event)) {
        console.log(`[EventSub] ✅ Ya suscrito a: ${event}`);
        continue;
      }

      await axios.post(
        "https://api.kick.com/public/v1/events/subscriptions",
        {
          event_type: event,
          broadcaster_user_id: BRUNENGER_USER_ID,
          method: "webhook",
          version: "1",
          condition: { broadcaster_user_id: BRUNENGER_USER_ID },
          transport: { method: "webhook", callback: webhookUrl },
        },
        { headers }
      );
      console.log(`[EventSub] 📡 Suscrito a: ${event}`);
      created++;
    }

    if (created === 0) {
      console.log("[EventSub] 🟢 Todas las suscripciones ya estaban activas");
    } else {
      console.log(`[EventSub] ✅ ${created} suscripciones nuevas creadas → ${webhookUrl}`);
    }
  } catch (err) {
    const detail = err.response?.data || err.message;
    console.error("[EventSub] ❌ Error al suscribir:", JSON.stringify(detail));
  }
}

/**
 * Elimina todas las suscripciones actuales
 */
async function unsubscribeAll() {
  try {
    const token   = await getAppToken();
    const headers = {
      Authorization: `Bearer ${token}`,
      "Client-Id":   KICK_CLIENT_ID,
    };

    const { data } = await axios.get(
      "https://api.kick.com/public/v1/events/subscriptions",
      { headers }
    );
    const subs = data?.data || [];

    for (const sub of subs) {
      await axios.delete("https://api.kick.com/public/v1/events/subscriptions", {
        headers,
        data: { id: sub.id },
      });
      console.log(`[EventSub] 🗑  Eliminada suscripción: ${sub.event_type}`);
    }
  } catch (err) {
    console.error("[EventSub] Error al desuscribir:", err.message);
  }
}

module.exports = { subscribe, unsubscribeAll, getAppToken };
