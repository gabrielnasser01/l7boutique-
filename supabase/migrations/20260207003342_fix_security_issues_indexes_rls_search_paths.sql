/*
  # Fix security issues: indexes, RLS optimization, function search paths

  1. Indexes
    - Add missing index on `user_addresses.user_id` foreign key

  2. RLS Policy Optimization (user_profiles)
    - Replace `auth.uid()` with `(select auth.uid())` in all policies
      to avoid re-evaluating per row

  3. RLS Policy Optimization (user_addresses)
    - Same optimization for all four policies

  4. Function Search Paths
    - Set `search_path = ''` on `update_updated_at_column`
    - Set `search_path = ''` on `verify_admin_login`
    - Set `search_path = ''` on `verify_admin_login_by_email`
    - Set `search_path = ''` on `handle_new_user`

  5. Admin Users Table Security
    - Drop overly permissive SELECT policy (verify_admin_login is
      SECURITY DEFINER so it bypasses RLS; no direct SELECT needed)
    - This prevents anon from querying the admin_users table directly

  6. Notes
    - Admin-managed tables (products, categories, collections, site_images)
      still use permissive anon write policies because the admin panel
      authenticates via a custom mechanism (not Supabase Auth) and
      operates under the anon role. Restricting these would break admin.
    - Checkout tables (customers, orders, order_items) need anon write
      for the storefront checkout flow.
*/

-- 1. Add missing index on user_addresses.user_id
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);

-- 2. Fix user_profiles RLS policies with (select auth.uid())
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- 3. Fix user_addresses RLS policies with (select auth.uid())
DROP POLICY IF EXISTS "Users can view own addresses" ON user_addresses;
CREATE POLICY "Users can view own addresses"
  ON user_addresses FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own addresses" ON user_addresses;
CREATE POLICY "Users can insert own addresses"
  ON user_addresses FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own addresses" ON user_addresses;
CREATE POLICY "Users can update own addresses"
  ON user_addresses FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own addresses" ON user_addresses;
CREATE POLICY "Users can delete own addresses"
  ON user_addresses FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- 4. Fix function search paths
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_admin_login(p_username text, p_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user public.admin_users;
BEGIN
  SELECT * INTO v_user
  FROM public.admin_users
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

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'verify_admin_login_by_email'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    EXECUTE '
      CREATE OR REPLACE FUNCTION public.verify_admin_login_by_email(p_email text, p_password text)
      RETURNS json
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = ''''
      AS $fn$
      DECLARE
        v_user public.admin_users;
      BEGIN
        SELECT * INTO v_user
        FROM public.admin_users
        WHERE email = p_email
        AND password_hash = extensions.crypt(p_password, password_hash);

        IF v_user.id IS NULL THEN
          RETURN NULL;
        END IF;

        RETURN json_build_object(
          ''id'', v_user.id,
          ''username'', v_user.username,
          ''name'', v_user.name,
          ''email'', v_user.email
        );
      END;
      $fn$;
    ';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- 5. Restrict admin_users SELECT (verify_admin_login is SECURITY DEFINER, bypasses RLS)
DROP POLICY IF EXISTS "Anon can verify admin login" ON admin_users;
