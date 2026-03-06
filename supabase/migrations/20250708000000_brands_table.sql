-- Brands table migration
-- The brands table was created manually in the DB but was missing from migrations
-- and the generated Database type. This migration captures the existing schema.

CREATE TABLE IF NOT EXISTS brands (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  slug       text NOT NULL UNIQUE,
  logo_url   text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Brands are publicly readable" ON brands;
CREATE POLICY "Brands are publicly readable" ON brands
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage brands" ON brands;
CREATE POLICY "Admins can manage brands" ON brands
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'::user_role
    )
  );

-- Seed data (idempotent — skip if rows already exist)
INSERT INTO brands (name, slug, logo_url, sort_order)
VALUES
  ('Apple',   'apple',   '/images/brands/apple.svg',   1),
  ('Samsung', 'samsung', '/images/brands/samsung.svg', 2),
  ('Google',  'google',  '/images/brands/google.svg',  3),
  ('OnePlus', 'oneplus', '/images/brands/oneplus.svg', 4),
  ('Sony',    'sony',    '/images/brands/sony.svg',    5),
  ('Xiaomi',  'xiaomi',  '/images/brands/xiaomi.svg',  6)
ON CONFLICT (slug) DO NOTHING;
