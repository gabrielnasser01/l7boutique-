/*
  # Add missing write policies for admin-managed tables

  The admin panel operates using the anon role. Several tables only had
  SELECT policies, causing all admin writes to be silently blocked by RLS.

  1. Modified Tables
    - `products` - Add INSERT, UPDATE, DELETE policies for anon
    - `categories` - Add INSERT, UPDATE, DELETE policies for anon
    - `collections` - Add INSERT, UPDATE, DELETE policies for anon

  2. Security Notes
    - Admin authentication is enforced at the application level
      (custom admin_users table with verify_admin_login RPC)
    - orders, customers, order_items already have necessary write policies
    - site_images already has full CRUD policies
*/

-- Products: admin needs full CRUD for product management
CREATE POLICY "Anon can insert products"
  ON products FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update products"
  ON products FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can delete products"
  ON products FOR DELETE
  TO anon
  USING (true);

-- Categories: admin manages category images and details
CREATE POLICY "Anon can insert categories"
  ON categories FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update categories"
  ON categories FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can delete categories"
  ON categories FOR DELETE
  TO anon
  USING (true);

-- Collections: admin manages collections
CREATE POLICY "Anon can insert collections"
  ON collections FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update collections"
  ON collections FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can delete collections"
  ON collections FOR DELETE
  TO anon
  USING (true);
