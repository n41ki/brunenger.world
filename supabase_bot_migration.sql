-- ─── Columnas para el bot ─────────────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS total_messages   INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS emoji_messages   INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS followed_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_subscribed    BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT,
  ADD COLUMN IF NOT EXISTS last_seen_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS es_admin         BOOLEAN DEFAULT false;

-- ─── Items iniciales de la tienda ─────────────────────────────────────────
INSERT INTO items (nombre, descripcion, imagen, costo_puntos, categoria, disponible)
VALUES
  ('iPhone 14 Pro',    'iPhone 14 Pro 128GB, color a elección',   NULL, 50000, 'tech',  true),
  ('McDonald''s Combo','Combo Big Mac + papas + bebida',           NULL,  5000, 'food',  true),
  ('No BAPE (Ropa)',   'Hoodie No BAPE talla a elección',          NULL, 20000, 'ropa',  true)
ON CONFLICT DO NOTHING;

-- ─── RPC: incrementar stats atómicamente ──────────────────────────────────
CREATE OR REPLACE FUNCTION increment_user_stats(
  p_kick_user_id  TEXT,
  p_points        INTEGER DEFAULT 0,
  p_messages      INTEGER DEFAULT 0,
  p_emoji_messages INTEGER DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE users
  SET
    points         = points         + p_points,
    total_messages = total_messages + p_messages,
    emoji_messages = emoji_messages + p_emoji_messages,
    last_seen_at   = NOW()
  WHERE kick_user_id = p_kick_user_id;
END;
$$;
