-- ══════════════════════════════════════════════════════════════
-- CHILLZ — Supabase Setup
-- Project: https://pydishigjctbyccedcso.supabase.co
-- Run this in: https://supabase.com/dashboard/project/pydishigjctbyccedcso/editor
-- ══════════════════════════════════════════════════════════════

-- ── 1. PROFILES TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       TEXT UNIQUE,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by owner"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role full access to profiles"
  ON public.profiles FOR ALL USING (auth.role() = 'service_role');

-- Auto-create profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 2. SUBSCRIPTIONS TABLE ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan           TEXT NOT NULL DEFAULT 'monthly',   -- monthly | yearly | lifetime
  status         TEXT NOT NULL DEFAULT 'active',    -- active | expired | cancelled
  amount         INTEGER DEFAULT 0,
  currency       TEXT DEFAULT 'UGX',
  transaction_id TEXT,
  payment_phone  TEXT,
  payment_network TEXT,
  activated_at   TIMESTAMPTZ DEFAULT now(),
  expires_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own subscription"
  ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own subscription"
  ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own subscription"
  ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to subscriptions"
  ON public.subscriptions FOR ALL USING (auth.role() = 'service_role');

-- ── 3. WATCHLIST TABLE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.watchlist (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id     TEXT NOT NULL,
  item_type   TEXT NOT NULL,   -- movie | channel | fixture
  item_title  TEXT,
  item_poster TEXT,
  item_url    TEXT,
  added_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, item_id, item_type)
);

ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own watchlist"
  ON public.watchlist FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 4. PAYMENTS LOG TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  transaction_id TEXT UNIQUE,
  amount         INTEGER NOT NULL,
  currency       TEXT DEFAULT 'UGX',
  phone          TEXT,
  network        TEXT,
  plan           TEXT,
  status         TEXT DEFAULT 'pending',  -- pending | success | failed
  jjuma_ref      TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own payments"
  ON public.payments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to payments"
  ON public.payments FOR ALL USING (auth.role() = 'service_role');

-- ── 5. GRANT OWNER (muyanjaowen3@gmail.com) LIFETIME PREMIUM ──
-- Owen's user ID from auth.users: 53af1ef0-2b43-409c-969b-9cffd95cebe2
-- Insert his profile first
INSERT INTO public.profiles (id, email, full_name)
VALUES (
  '53af1ef0-2b43-409c-969b-9cffd95cebe2',
  'muyanjaowen3@gmail.com',
  'Owen Muyanja'
)
ON CONFLICT (id) DO UPDATE SET
  full_name = 'Owen Muyanja',
  email = 'muyanjaowen3@gmail.com';

-- Give him lifetime premium
INSERT INTO public.subscriptions (
  user_id, plan, status, amount, currency,
  transaction_id, activated_at, expires_at
)
VALUES (
  '53af1ef0-2b43-409c-969b-9cffd95cebe2',
  'lifetime',
  'active',
  0,
  'UGX',
  'OWNER-FREE-LIFETIME',
  now(),
  '2099-12-31T23:59:59+00:00'
)
ON CONFLICT (user_id) DO UPDATE SET
  plan       = 'lifetime',
  status     = 'active',
  expires_at = '2099-12-31T23:59:59+00:00',
  transaction_id = 'OWNER-FREE-LIFETIME';

-- ── VERIFY ────────────────────────────────────────────────────
SELECT
  p.email,
  p.full_name,
  s.plan,
  s.status,
  s.expires_at
FROM public.profiles p
JOIN public.subscriptions s ON s.user_id = p.id
WHERE p.email = 'muyanjaowen3@gmail.com';
