-- Villedas Delight Campaign Schema
-- Run this in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS actions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
  platform    TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'tiktok')),
  clicked_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, platform)
);

CREATE TABLE IF NOT EXISTS coupons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT UNIQUE NOT NULL,
  session_id  TEXT UNIQUE REFERENCES sessions(session_id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL,
  redeemed    BOOLEAN DEFAULT FALSE,
  redeemed_at TIMESTAMPTZ,
  redeemed_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_actions_session_id ON actions(session_id);
CREATE INDEX IF NOT EXISTS idx_coupons_session_id ON coupons(session_id);
CREATE INDEX IF NOT EXISTS idx_coupons_redeemed    ON coupons(redeemed);

-- Row Level Security (disable for service-key backend access)
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE actions  DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupons  DISABLE ROW LEVEL SECURITY;
