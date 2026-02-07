/*
  # Add brands management + full CRUD for categories and collections

  1. New Tables
    - `brands`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `slug` (text, unique, not null)
      - `logo_url` (text, default '')
      - `is_active` (boolean, default true)
      - `sort_order` (integer, default 0)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `brands` table
    - Add public read policy for active brands only
    - All write operations go through SECURITY DEFINER RPC functions

  3. New RPC Functions
    - `admin_brands_write(p_admin_id, p_operation, p_brand_id, p_data)` - Full CRUD for brands
    - `admin_categories_write(p_admin_id, p_operation, p_category_id, p_data)` - Full CRUD for categories
    - `admin_collections_write(p_admin_id, p_operation, p_collection_id, p_data)` - Full CRUD for collections

  4. Important Notes
    - Products still reference brand by text column; brands table provides a managed list
    - Existing category and collection data is preserved
    - Old admin_categories_update function remains for backward compatibility
*/

CREATE TABLE IF NOT EXISTS public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text DEFAULT '',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active brands"
  ON public.brands
  FOR SELECT
  USING (is_active = true);

CREATE INDEX IF NOT EXISTS idx_brands_sort_order ON public.brands (sort_order);
CREATE INDEX IF NOT EXISTS idx_brands_is_active ON public.brands (is_active);

CREATE OR REPLACE FUNCTION public.admin_brands_write(
  p_admin_id uuid,
  p_operation text,
  p_brand_id uuid DEFAULT NULL,
  p_data jsonb DEFAULT '{}'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.is_valid_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_operation = 'insert' THEN
    INSERT INTO public.brands (name, slug, logo_url, is_active, sort_order)
    VALUES (
      p_data->>'name',
      p_data->>'slug',
      COALESCE(p_data->>'logo_url', ''),
      COALESCE((p_data->>'is_active')::boolean, true),
      COALESCE((p_data->>'sort_order')::integer, 0)
    )
    RETURNING to_jsonb(brands.*) INTO v_result;
  ELSIF p_operation = 'update' THEN
    UPDATE public.brands SET
      name = COALESCE(p_data->>'name', name),
      slug = COALESCE(p_data->>'slug', slug),
      logo_url = COALESCE(p_data->>'logo_url', logo_url),
      is_active = COALESCE((p_data->>'is_active')::boolean, is_active),
      sort_order = COALESCE((p_data->>'sort_order')::integer, sort_order)
    WHERE id = p_brand_id
    RETURNING to_jsonb(brands.*) INTO v_result;
  ELSIF p_operation = 'delete' THEN
    DELETE FROM public.brands WHERE id = p_brand_id;
    v_result := '{"deleted": true}'::jsonb;
  END IF;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_categories_write(
  p_admin_id uuid,
  p_operation text,
  p_category_id uuid DEFAULT NULL,
  p_data jsonb DEFAULT '{}'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.is_valid_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_operation = 'insert' THEN
    INSERT INTO public.categories (name, slug, image_url, sort_order)
    VALUES (
      p_data->>'name',
      p_data->>'slug',
      COALESCE(p_data->>'image_url', ''),
      COALESCE((p_data->>'sort_order')::integer, 0)
    )
    RETURNING to_jsonb(categories.*) INTO v_result;
  ELSIF p_operation = 'update' THEN
    UPDATE public.categories SET
      name = COALESCE(p_data->>'name', name),
      slug = COALESCE(p_data->>'slug', slug),
      image_url = COALESCE(p_data->>'image_url', image_url),
      sort_order = COALESCE((p_data->>'sort_order')::integer, sort_order)
    WHERE id = p_category_id
    RETURNING to_jsonb(categories.*) INTO v_result;
  ELSIF p_operation = 'delete' THEN
    DELETE FROM public.categories WHERE id = p_category_id;
    v_result := '{"deleted": true}'::jsonb;
  END IF;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_collections_write(
  p_admin_id uuid,
  p_operation text,
  p_collection_id uuid DEFAULT NULL,
  p_data jsonb DEFAULT '{}'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.is_valid_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_operation = 'insert' THEN
    INSERT INTO public.collections (name, slug, description, image_url, is_featured, sort_order)
    VALUES (
      p_data->>'name',
      p_data->>'slug',
      COALESCE(p_data->>'description', ''),
      COALESCE(p_data->>'image_url', ''),
      COALESCE((p_data->>'is_featured')::boolean, false),
      COALESCE((p_data->>'sort_order')::integer, 0)
    )
    RETURNING to_jsonb(collections.*) INTO v_result;
  ELSIF p_operation = 'update' THEN
    UPDATE public.collections SET
      name = COALESCE(p_data->>'name', name),
      slug = COALESCE(p_data->>'slug', slug),
      description = COALESCE(p_data->>'description', description),
      image_url = COALESCE(p_data->>'image_url', image_url),
      is_featured = COALESCE((p_data->>'is_featured')::boolean, is_featured),
      sort_order = COALESCE((p_data->>'sort_order')::integer, sort_order)
    WHERE id = p_collection_id
    RETURNING to_jsonb(collections.*) INTO v_result;
  ELSIF p_operation = 'delete' THEN
    DELETE FROM public.collections WHERE id = p_collection_id;
    v_result := '{"deleted": true}'::jsonb;
  END IF;

  RETURN v_result;
END;
$$;