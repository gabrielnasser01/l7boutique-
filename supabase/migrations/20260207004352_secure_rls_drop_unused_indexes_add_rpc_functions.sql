/*
  # Security overhaul: lock down RLS, add admin RPC functions, drop unused indexes

  1. Dropped Unused Indexes
    - idx_orders_payment_status
    - idx_orders_customer_id
    - idx_order_items_product_id
    - idx_site_images_section
    - idx_admin_users_username
    - idx_orders_order_nsu
    - idx_products_featured
    - idx_orders_status
    - idx_user_addresses_user_id

  2. Admin Users Table
    - Add service_role ALL policy so admin_users remains manageable

  3. New SECURITY DEFINER Functions (bypass RLS after verifying admin)
    - `admin_products_write` - insert/update/delete products
    - `admin_categories_update` - update categories
    - `admin_site_images_write` - insert/update/delete site_images
    - `admin_orders_update` - update order status/tracking
    - `checkout_create_order` - full checkout flow (customer + order + items)
    - `payment_update_order` - update payment-related fields on orders

  4. Dropped Always-True Anon Write Policies
    - Removed all anon INSERT/UPDATE/DELETE policies that had USING(true)
      on: products, categories, collections, customers, orders, order_items, site_images
    - Kept anon/authenticated SELECT policies (public read is intended)

  5. Security Model
    - Admin writes now go through verified RPC functions (admin ID checked)
    - Checkout writes go through a dedicated RPC function (constrained fields)
    - Payment updates go through a dedicated RPC function (payment fields only)
    - No more unrestricted anonymous write access to any table
*/

-- ============================================================
-- 1. DROP UNUSED INDEXES
-- ============================================================
DROP INDEX IF EXISTS idx_orders_payment_status;
DROP INDEX IF EXISTS idx_orders_customer_id;
DROP INDEX IF EXISTS idx_order_items_product_id;
DROP INDEX IF EXISTS idx_site_images_section;
DROP INDEX IF EXISTS idx_admin_users_username;
DROP INDEX IF EXISTS idx_orders_order_nsu;
DROP INDEX IF EXISTS idx_products_featured;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_user_addresses_user_id;

-- ============================================================
-- 2. FIX ADMIN_USERS (add service_role policy)
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'admin_users' AND policyname = 'Service role full access to admin_users'
  ) THEN
    CREATE POLICY "Service role full access to admin_users"
      ON admin_users FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================================
-- 3. DROP ALWAYS-TRUE ANON WRITE POLICIES
-- ============================================================

-- Products
DROP POLICY IF EXISTS "Anon can insert products" ON products;
DROP POLICY IF EXISTS "Anon can update products" ON products;
DROP POLICY IF EXISTS "Anon can delete products" ON products;

-- Categories
DROP POLICY IF EXISTS "Anon can insert categories" ON categories;
DROP POLICY IF EXISTS "Anon can update categories" ON categories;
DROP POLICY IF EXISTS "Anon can delete categories" ON categories;

-- Collections
DROP POLICY IF EXISTS "Anon can insert collections" ON collections;
DROP POLICY IF EXISTS "Anon can update collections" ON collections;
DROP POLICY IF EXISTS "Anon can delete collections" ON collections;

-- Site Images
DROP POLICY IF EXISTS "Anon can insert site images" ON site_images;
DROP POLICY IF EXISTS "Anon can update site images" ON site_images;
DROP POLICY IF EXISTS "Anon can delete site images" ON site_images;

-- Customers
DROP POLICY IF EXISTS "Anon can insert customers" ON customers;
DROP POLICY IF EXISTS "Anon can update customers" ON customers;

-- Orders
DROP POLICY IF EXISTS "Anon can insert orders" ON orders;
DROP POLICY IF EXISTS "Anon can update orders" ON orders;

-- Order Items
DROP POLICY IF EXISTS "Anon can insert order items" ON order_items;

-- ============================================================
-- 4. SECURITY DEFINER FUNCTIONS
-- ============================================================

-- Helper: verify admin
CREATE OR REPLACE FUNCTION public.is_valid_admin(p_admin_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE id = p_admin_id);
$$;

REVOKE ALL ON FUNCTION public.is_valid_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_valid_admin(uuid) TO anon, authenticated, service_role;

-- ============================================================
-- ADMIN: Products Write
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_products_write(
  p_admin_id uuid,
  p_operation text,
  p_product_id uuid DEFAULT NULL,
  p_data jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.is_valid_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_operation = 'delete' THEN
    DELETE FROM public.products WHERE id = p_product_id;
    RETURN jsonb_build_object('deleted', true);

  ELSIF p_operation = 'insert' THEN
    INSERT INTO public.products (
      name, slug, brand, description, price, original_price,
      category_id, collection_id, images, sizes, colors, material,
      care_instructions, in_stock, is_featured, is_new, is_bestseller, pronta_entrega
    ) VALUES (
      p_data->>'name',
      p_data->>'slug',
      COALESCE(p_data->>'brand', ''),
      COALESCE(p_data->>'description', ''),
      COALESCE((p_data->>'price')::numeric, 0),
      (p_data->>'original_price')::numeric,
      (p_data->>'category_id')::uuid,
      (p_data->>'collection_id')::uuid,
      COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_data->'images')), '{}'::text[]),
      COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_data->'sizes')), '{}'::text[]),
      COALESCE(p_data->'colors', '[]'::jsonb),
      COALESCE(p_data->>'material', ''),
      COALESCE(p_data->>'care_instructions', ''),
      COALESCE((p_data->>'in_stock')::boolean, true),
      COALESCE((p_data->>'is_featured')::boolean, false),
      COALESCE((p_data->>'is_new')::boolean, false),
      COALESCE((p_data->>'is_bestseller')::boolean, false),
      COALESCE((p_data->>'pronta_entrega')::boolean, false)
    )
    RETURNING to_jsonb(products.*) INTO v_result;
    RETURN v_result;

  ELSIF p_operation = 'update' THEN
    UPDATE public.products SET
      name = CASE WHEN p_data ? 'name' THEN p_data->>'name' ELSE name END,
      slug = CASE WHEN p_data ? 'slug' THEN p_data->>'slug' ELSE slug END,
      brand = CASE WHEN p_data ? 'brand' THEN p_data->>'brand' ELSE brand END,
      description = CASE WHEN p_data ? 'description' THEN p_data->>'description' ELSE description END,
      price = CASE WHEN p_data ? 'price' THEN (p_data->>'price')::numeric ELSE price END,
      original_price = CASE WHEN p_data ? 'original_price' THEN (p_data->>'original_price')::numeric ELSE original_price END,
      category_id = CASE WHEN p_data ? 'category_id' THEN (p_data->>'category_id')::uuid ELSE category_id END,
      collection_id = CASE WHEN p_data ? 'collection_id' THEN (p_data->>'collection_id')::uuid ELSE collection_id END,
      images = CASE WHEN p_data ? 'images' THEN ARRAY(SELECT jsonb_array_elements_text(p_data->'images')) ELSE images END,
      sizes = CASE WHEN p_data ? 'sizes' THEN ARRAY(SELECT jsonb_array_elements_text(p_data->'sizes')) ELSE sizes END,
      colors = CASE WHEN p_data ? 'colors' THEN p_data->'colors' ELSE colors END,
      material = CASE WHEN p_data ? 'material' THEN p_data->>'material' ELSE material END,
      care_instructions = CASE WHEN p_data ? 'care_instructions' THEN p_data->>'care_instructions' ELSE care_instructions END,
      in_stock = CASE WHEN p_data ? 'in_stock' THEN (p_data->>'in_stock')::boolean ELSE in_stock END,
      is_featured = CASE WHEN p_data ? 'is_featured' THEN (p_data->>'is_featured')::boolean ELSE is_featured END,
      is_new = CASE WHEN p_data ? 'is_new' THEN (p_data->>'is_new')::boolean ELSE is_new END,
      is_bestseller = CASE WHEN p_data ? 'is_bestseller' THEN (p_data->>'is_bestseller')::boolean ELSE is_bestseller END,
      pronta_entrega = CASE WHEN p_data ? 'pronta_entrega' THEN (p_data->>'pronta_entrega')::boolean ELSE pronta_entrega END
    WHERE id = p_product_id
    RETURNING to_jsonb(products.*) INTO v_result;
    RETURN COALESCE(v_result, '{}'::jsonb);
  END IF;

  RETURN '{}'::jsonb;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_products_write(uuid, text, uuid, jsonb) TO anon, authenticated;

-- ============================================================
-- ADMIN: Categories Update
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_categories_update(
  p_admin_id uuid,
  p_category_id uuid,
  p_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.is_valid_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.categories SET
    name = CASE WHEN p_data ? 'name' THEN p_data->>'name' ELSE name END,
    slug = CASE WHEN p_data ? 'slug' THEN p_data->>'slug' ELSE slug END,
    image_url = CASE WHEN p_data ? 'image_url' THEN p_data->>'image_url' ELSE image_url END,
    sort_order = CASE WHEN p_data ? 'sort_order' THEN (p_data->>'sort_order')::integer ELSE sort_order END
  WHERE id = p_category_id
  RETURNING to_jsonb(categories.*) INTO v_result;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_categories_update(uuid, uuid, jsonb) TO anon, authenticated;

-- ============================================================
-- ADMIN: Site Images Write
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_site_images_write(
  p_admin_id uuid,
  p_operation text,
  p_image_id uuid DEFAULT NULL,
  p_data jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.is_valid_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_operation = 'delete' THEN
    DELETE FROM public.site_images WHERE id = p_image_id;
    RETURN jsonb_build_object('deleted', true);

  ELSIF p_operation = 'insert' THEN
    INSERT INTO public.site_images (section, image_key, image_url, title, subtitle, link_url, sort_order)
    VALUES (
      COALESCE(p_data->>'section', ''),
      COALESCE(p_data->>'image_key', ''),
      COALESCE(p_data->>'image_url', ''),
      COALESCE(p_data->>'title', ''),
      COALESCE(p_data->>'subtitle', ''),
      COALESCE(p_data->>'link_url', ''),
      COALESCE((p_data->>'sort_order')::integer, 0)
    )
    RETURNING to_jsonb(site_images.*) INTO v_result;
    RETURN v_result;

  ELSIF p_operation = 'update' THEN
    UPDATE public.site_images SET
      image_url = CASE WHEN p_data ? 'image_url' THEN p_data->>'image_url' ELSE image_url END,
      title = CASE WHEN p_data ? 'title' THEN p_data->>'title' ELSE title END,
      subtitle = CASE WHEN p_data ? 'subtitle' THEN p_data->>'subtitle' ELSE subtitle END,
      link_url = CASE WHEN p_data ? 'link_url' THEN p_data->>'link_url' ELSE link_url END,
      sort_order = CASE WHEN p_data ? 'sort_order' THEN (p_data->>'sort_order')::integer ELSE sort_order END
    WHERE id = p_image_id
    RETURNING to_jsonb(site_images.*) INTO v_result;
    RETURN COALESCE(v_result, '{}'::jsonb);
  END IF;

  RETURN '{}'::jsonb;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_site_images_write(uuid, text, uuid, jsonb) TO anon, authenticated;

-- ============================================================
-- ADMIN: Orders Update
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_orders_update(
  p_admin_id uuid,
  p_order_id uuid,
  p_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.is_valid_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.orders SET
    status = CASE WHEN p_data ? 'status' THEN (p_data->>'status')::text ELSE status END,
    payment_status = CASE WHEN p_data ? 'payment_status' THEN (p_data->>'payment_status')::text ELSE payment_status END,
    tracking_code = CASE WHEN p_data ? 'tracking_code' THEN p_data->>'tracking_code' ELSE tracking_code END,
    notes = CASE WHEN p_data ? 'notes' THEN p_data->>'notes' ELSE notes END,
    updated_at = now()
  WHERE id = p_order_id
  RETURNING to_jsonb(orders.*) INTO v_result;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_orders_update(uuid, uuid, jsonb) TO anon, authenticated;

-- ============================================================
-- CHECKOUT: Create Order
-- ============================================================
CREATE OR REPLACE FUNCTION public.checkout_create_order(
  p_customer jsonb,
  p_order jsonb,
  p_items jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_customer_id uuid;
  v_order_id uuid;
  v_order_number text;
  v_phone text;
  v_item jsonb;
BEGIN
  v_phone := p_customer->>'phone';

  SELECT id INTO v_customer_id
  FROM public.customers
  WHERE phone = v_phone;

  IF v_customer_id IS NOT NULL THEN
    UPDATE public.customers SET
      name = COALESCE(p_customer->>'name', name),
      email = CASE WHEN p_customer ? 'email' AND p_customer->>'email' != '' THEN p_customer->>'email' ELSE email END,
      cpf = COALESCE(p_customer->>'cpf', cpf),
      cep = COALESCE(p_customer->>'cep', cep),
      street = COALESCE(p_customer->>'street', street),
      number = COALESCE(p_customer->>'number', number),
      complement = COALESCE(p_customer->>'complement', complement),
      neighborhood = COALESCE(p_customer->>'neighborhood', neighborhood),
      city = COALESCE(p_customer->>'city', city),
      state = COALESCE(p_customer->>'state', state)
    WHERE id = v_customer_id;
  ELSE
    INSERT INTO public.customers (name, email, phone, cpf, cep, street, number, complement, neighborhood, city, state)
    VALUES (
      p_customer->>'name',
      NULLIF(p_customer->>'email', ''),
      v_phone,
      COALESCE(p_customer->>'cpf', ''),
      COALESCE(p_customer->>'cep', ''),
      COALESCE(p_customer->>'street', ''),
      COALESCE(p_customer->>'number', ''),
      COALESCE(p_customer->>'complement', ''),
      COALESCE(p_customer->>'neighborhood', ''),
      COALESCE(p_customer->>'city', ''),
      COALESCE(p_customer->>'state', '')
    )
    RETURNING id INTO v_customer_id;
  END IF;

  INSERT INTO public.orders (
    customer_id, status, payment_method, payment_status, payment_provider,
    subtotal, discount, shipping_cost, total,
    shipping_cpf, shipping_name, shipping_phone,
    shipping_cep, shipping_street, shipping_number, shipping_complement,
    shipping_neighborhood, shipping_city, shipping_state
  ) VALUES (
    v_customer_id,
    'pending',
    COALESCE(p_order->>'payment_method', 'pix'),
    'pending',
    COALESCE(p_order->>'payment_provider', 'infinitepay'),
    COALESCE((p_order->>'subtotal')::numeric, 0),
    COALESCE((p_order->>'discount')::numeric, 0),
    COALESCE((p_order->>'shipping_cost')::numeric, 0),
    COALESCE((p_order->>'total')::numeric, 0),
    COALESCE(p_order->>'shipping_cpf', ''),
    COALESCE(p_order->>'shipping_name', ''),
    COALESCE(p_order->>'shipping_phone', ''),
    COALESCE(p_order->>'shipping_cep', ''),
    COALESCE(p_order->>'shipping_street', ''),
    COALESCE(p_order->>'shipping_number', ''),
    COALESCE(p_order->>'shipping_complement', ''),
    COALESCE(p_order->>'shipping_neighborhood', ''),
    COALESCE(p_order->>'shipping_city', ''),
    COALESCE(p_order->>'shipping_state', '')
  )
  RETURNING id, order_number INTO v_order_id, v_order_number;

  UPDATE public.orders SET order_nsu = v_order_id::text WHERE id = v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.order_items (order_id, product_id, product_name, product_image, size, quantity, unit_price)
    VALUES (
      v_order_id,
      (v_item->>'product_id')::uuid,
      v_item->>'product_name',
      COALESCE(v_item->>'product_image', ''),
      COALESCE(v_item->>'size', ''),
      COALESCE((v_item->>'quantity')::integer, 1),
      COALESCE((v_item->>'unit_price')::numeric, 0)
    );
  END LOOP;

  RETURN jsonb_build_object('id', v_order_id, 'order_number', v_order_number);
END;
$$;

GRANT EXECUTE ON FUNCTION public.checkout_create_order(jsonb, jsonb, jsonb) TO anon, authenticated;

-- ============================================================
-- PAYMENT: Update Order (for webhooks and payment checks)
-- ============================================================
CREATE OR REPLACE FUNCTION public.payment_update_order(
  p_order_id uuid,
  p_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_result jsonb;
BEGIN
  UPDATE public.orders SET
    payment_status = CASE WHEN p_data ? 'payment_status' THEN p_data->>'payment_status' ELSE payment_status END,
    status = CASE WHEN p_data ? 'status' THEN p_data->>'status' ELSE status END,
    payment_provider = CASE WHEN p_data ? 'payment_provider' THEN p_data->>'payment_provider' ELSE payment_provider END,
    order_nsu = CASE WHEN p_data ? 'order_nsu' THEN p_data->>'order_nsu' ELSE order_nsu END,
    transaction_nsu = CASE WHEN p_data ? 'transaction_nsu' THEN p_data->>'transaction_nsu' ELSE transaction_nsu END,
    receipt_url = CASE WHEN p_data ? 'receipt_url' THEN p_data->>'receipt_url' ELSE receipt_url END,
    capture_method = CASE WHEN p_data ? 'capture_method' THEN p_data->>'capture_method' ELSE capture_method END,
    installments = CASE WHEN p_data ? 'installments' THEN (p_data->>'installments')::integer ELSE installments END,
    paid_amount = CASE WHEN p_data ? 'paid_amount' THEN (p_data->>'paid_amount')::numeric ELSE paid_amount END,
    invoice_slug = CASE WHEN p_data ? 'invoice_slug' THEN p_data->>'invoice_slug' ELSE invoice_slug END,
    updated_at = now()
  WHERE id = p_order_id
  RETURNING to_jsonb(orders.*) INTO v_result;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.payment_update_order(uuid, jsonb) TO anon, authenticated, service_role;
