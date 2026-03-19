-- ================================================================
-- BRUNENGER WORLD - Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kick_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  avatar TEXT DEFAULT '',
  puntos INTEGER DEFAULT 0,
  nivel INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_kick_id ON users(kick_id);
CREATE INDEX idx_users_puntos ON users(puntos DESC);

-- ─── ITEMS (Shop) ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  descripcion TEXT DEFAULT '',
  imagen TEXT DEFAULT '',
  costo_puntos INTEGER NOT NULL DEFAULT 100,
  categoria TEXT DEFAULT 'general',
  disponible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample items
INSERT INTO items (nombre, descripcion, imagen, costo_puntos, categoria) VALUES
  ('Shoutout en Stream', 'Te damos un shoutout en el próximo stream', '', 500, 'stream'),
  ('Rol VIP en Discord', 'Acceso al rol VIP del servidor de Discord', '', 1000, 'discord'),
  ('Emote Personalizado', 'Sugiere un emote personalizado para el canal', '', 2000, 'canal'),
  ('1v1 con Brunenger', 'Juega una partida 1v1 con Brunenger', '', 5000, 'gaming'),
  ('Nombre en Pantalla', 'Tu nombre aparece en pantalla durante 1 stream', '', 750, 'stream'),
  ('Pack de Stickers', 'Pack digital exclusivo de stickers de Brunenger', '', 300, 'digital')
ON CONFLICT DO NOTHING;

-- ─── REDEMPTIONS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  estado TEXT DEFAULT 'pendiente' -- pendiente, completado, cancelado
);

CREATE INDEX idx_redemptions_usuario ON redemptions(usuario_id);

-- ─── WATCH TIME ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS watch_time (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  tiempo INTEGER DEFAULT 0, -- in minutes
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_watch_time_tiempo ON watch_time(tiempo DESC);

-- ─── CHAT ACTIVITY ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  mensajes INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_activity_mensajes ON chat_activity(mensajes DESC);

-- ─── GIVEAWAYS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS giveaways (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  premio TEXT NOT NULL,
  descripcion TEXT DEFAULT '',
  imagen TEXT DEFAULT '',
  estado TEXT DEFAULT 'activo', -- activo, finalizado, pendiente
  winner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE INDEX idx_giveaways_estado ON giveaways(estado);

-- ─── GIVEAWAY ENTRIES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS giveaway_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES users(id) ON DELETE CASCADE,
  giveaway_id UUID REFERENCES giveaways(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, giveaway_id)
);

CREATE INDEX idx_giveaway_entries_giveaway ON giveaway_entries(giveaway_id);
CREATE INDEX idx_giveaway_entries_usuario ON giveaway_entries(usuario_id);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_time ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE giveaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE giveaway_entries ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (backend uses service role key)
-- Public can read users, items, giveaways (for display)
CREATE POLICY "Public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Public read items" ON items FOR SELECT USING (true);
CREATE POLICY "Public read giveaways" ON giveaways FOR SELECT USING (true);
CREATE POLICY "Public read giveaway entries" ON giveaway_entries FOR SELECT USING (true);
CREATE POLICY "Public read rankings" ON watch_time FOR SELECT USING (true);
CREATE POLICY "Public read chat activity" ON chat_activity FOR SELECT USING (true);

-- ─── FUNCTION: Update nivel based on puntos ──────────────────────────────
CREATE OR REPLACE FUNCTION update_user_nivel()
RETURNS TRIGGER AS $$
BEGIN
  NEW.nivel = CASE
    WHEN NEW.puntos >= 50000 THEN 10
    WHEN NEW.puntos >= 20000 THEN 9
    WHEN NEW.puntos >= 10000 THEN 8
    WHEN NEW.puntos >= 5000  THEN 7
    WHEN NEW.puntos >= 2500  THEN 6
    WHEN NEW.puntos >= 1000  THEN 5
    WHEN NEW.puntos >= 500   THEN 4
    WHEN NEW.puntos >= 250   THEN 3
    WHEN NEW.puntos >= 100   THEN 2
    ELSE 1
  END;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_nivel
  BEFORE UPDATE OF puntos ON users
  FOR EACH ROW EXECUTE FUNCTION update_user_nivel();
