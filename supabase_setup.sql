-- ══════════════════════════════════════════════════════
-- Chillz Supabase Setup
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/sykjlkbifrkmvlikyilv/editor
-- ══════════════════════════════════════════════════════

-- 1. Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan          TEXT NOT NULL DEFAULT 'monthly',
  status        TEXT NOT NULL DEFAULT 'active',
  amount        INTEGER,
  currency      TEXT DEFAULT 'UGX',
  transaction_id TEXT,
  activated_at  TIMESTAMPTZ DEFAULT now(),
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- 3. Make muyanjaowen3@gmail.com a permanent premium member
-- This inserts a lifetime subscription for the owner account
-- Run AFTER the owner has signed up at least once

INSERT INTO public.subscriptions (user_id, plan, status, amount, currency, transaction_id, activated_at, expires_at)
SELECT
  id,
  'lifetime',
  'active',
  0,
  'UGX',
  'OWNER-FREE-LIFETIME',
  now(),
  '2099-12-31T23:59:59Z'
FROM auth.users
WHERE email = 'muyanjaowen3@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
  plan = 'lifetime',
  status = 'active',
  expires_at = '2099-12-31T23:59:59Z',
  transaction_id = 'OWNER-FREE-LIFETIME';

-- 4. Watchlist table (for future use)
CREATE TABLE IF NOT EXISTS public.watchlist (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id    TEXT NOT NULL,
  item_type  TEXT NOT NULL, -- 'movie' | 'channel' | 'fixture'
  item_title TEXT,
  item_poster TEXT,
  added_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, item_id, item_type)
);

ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own watchlist"
  ON public.watchlist FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Done!
SELECT 'Chillz Supabase setup complete ✓' AS status;
