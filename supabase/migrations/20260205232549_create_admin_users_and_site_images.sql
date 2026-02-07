/*
  # Create Admin Users and Site Images Tables

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `username` (text, unique) - Admin login username
      - `name` (text) - Display name
      - `email` (text) - Admin email
      - `password_hash` (text) - Password hashed with pgcrypto
      - `created_at` (timestamptz)
    - `site_images`
      - `id` (uuid, primary key)
      - `section` (text) - Section identifier (hero, category, etc)
      - `image_key` (text) - Specific key within section
      - `image_url` (text) - URL to the image
      - `title` (text) - Optional title/label
      - `subtitle` (text) - Optional subtitle
      - `link_url` (text) - Optional link destination
      - `sort_order` (integer) - Display order
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - admin_users: anon can select for login verification
    - site_images: anon can read (needed for storefront), anon can manage (admin panel)

  3. Functions
    - `verify_admin_login` - RPC to verify username/password
    - Returns admin user data on success, null on failure

  4. Seed Data
    - Default admin user (isaacl7 / isaac2324@)
    - Hero banner slides

  5. Storage
    - Create storage bucket for product and site images
*/

-- Admin Users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can verify admin login"
  ON admin_users FOR SELECT
  TO anon
  USING (true);

-- Site Images table
CREATE TABLE IF NOT EXISTS site_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  image_key text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  link_url text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(section, image_key)
);

ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read site images"
  ON site_images FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can insert site images"
  ON site_images FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update site images"
  ON site_images FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can delete site images"
  ON site_images FOR DELETE
  TO anon
  USING (true);

-- Verify admin login function using pgcrypto
CREATE OR REPLACE FUNCTION verify_admin_login(p_username text, p_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user admin_users;
BEGIN
  SELECT * INTO v_user
  FROM admin_users
  WHERE username = p_username
  AND password_hash = extensions.crypt(p_password, password_hash);

  IF v_user.id IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN json_build_object(
    'id', v_user.id,
    'username', v_user.username,
    'name', v_user.name,
    'email', v_user.email
  );
END;
$$;

-- Seed admin user: isaacl7 / isaac2324@
INSERT INTO admin_users (username, name, email, password_hash)
VALUES (
  'isaacl7',
  'Isaac',
  'isaacl7@l7boutique.com',
  extensions.crypt('isaac2324@', extensions.gen_salt('bf'))
)
ON CONFLICT (username) DO NOTHING;

-- Seed hero banner slides
INSERT INTO site_images (section, image_key, image_url, title, subtitle, link_url, sort_order) VALUES
('hero', 'slide-1', 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=1600', 'Luxo Autentico', 'HERMES | LOUIS VUITTON | GUCCI', '/loja', 0),
('hero', 'slide-2', 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1600', 'Tenis Exclusivos', 'GOLDEN GOOSE | SNEAKERS', '/loja?categoria=tenis', 1),
('hero', 'slide-3', 'https://images.pexels.com/photos/6764007/pexels-photo-6764007.jpeg?auto=compress&cs=tinysrgb&w=1600', 'Elegancia Silenciosa', 'CURADORIA DE LUXO', '/colecoes/inverno-2025', 2)
ON CONFLICT (section, image_key) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_site_images_section ON site_images(section);
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
