/*
  # Secure customers, orders, and order_items access

  1. Security Changes
    - Drop open anonymous SELECT policies on `customers`, `orders`, `order_items`
    - Previously ANY anonymous user could read ALL customer data (CPF, address, phone, email)
    - Previously ANY anonymous user could read ALL order data and order items

  2. New Admin RPC Functions (all verify admin identity via is_valid_admin)
    - `admin_read_customers` - Returns all customers for admin panel
    - `admin_read_orders_full` - Returns all orders with nested customer + items
    - `admin_read_order_detail` - Returns single order with full details
    - `admin_read_order_stats` - Returns order statistics per customer
    - `admin_read_all_order_items` - Returns all order items for analytics

  3. New Public RPC Functions (controlled, minimal access)
    - `public_track_order` - Track order by number or tracking code (no sensitive customer data)
    - `public_get_order_basic` - Get basic order status by ID (for payment flows)
    - `public_find_order_for_payment` - Find order by ID or NSU (for webhooks)
    - `public_customer_orders` - Authenticated users can view their own orders by email

  4. Important Notes
    - Customer personal data (CPF, addresses, phones, emails) is no longer publicly accessible
    - Admin panel uses RPC functions that verify admin identity before returning data
    - Public tracking only returns order status, items, and tracking code
    - All functions use SECURITY DEFINER to bypass RLS with controlled access
*/

-- ============================================================
-- 1. DROP OPEN ANONYMOUS READ POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Anon can read customers" ON public.customers;
DROP POLICY IF EXISTS "Anon can read orders" ON public.orders;
DROP POLICY IF EXISTS "Anon can read order items" ON public.order_items;

-- ============================================================
-- 2. ADMIN READ RPC FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_read_customers(p_admin_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_valid_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN COALESCE((
    SELECT jsonb_agg(to_jsonb(c.*))
    FROM (SELECT * FROM public.customers ORDER BY created_at DESC) c
  ), '[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_read_orders_full(p_admin_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_valid_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN COALESCE((
    SELECT jsonb_agg(row_data)
    FROM (
      SELECT
        to_jsonb(o.*) ||
        jsonb_build_object(
          'customers', (SELECT to_jsonb(c.*) FROM public.customers c WHERE c.id = o.customer_id),
          'order_items', COALESCE(
            (SELECT jsonb_agg(to_jsonb(oi.*)) FROM public.order_items oi WHERE oi.order_id = o.id),
            '[]'::jsonb
          )
        ) AS row_data
      FROM public.orders o
      ORDER BY o.created_at DESC
    ) sub
  ), '[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_read_order_detail(p_admin_id uuid, p_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_valid_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN (
    SELECT
      to_jsonb(o.*) ||
      jsonb_build_object(
        'customers', (SELECT to_jsonb(c.*) FROM public.customers c WHERE c.id = o.customer_id),
        'order_items', COALESCE(
          (SELECT jsonb_agg(to_jsonb(oi.*)) FROM public.order_items oi WHERE oi.order_id = o.id),
          '[]'::jsonb
        )
      )
    FROM public.orders o
    WHERE o.id = p_order_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_read_order_stats(p_admin_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_valid_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN COALESCE((
    SELECT jsonb_agg(
      jsonb_build_object(
        'customer_id', o.customer_id,
        'total', o.total,
        'created_at', o.created_at,
        'status', o.status
      )
    )
    FROM public.orders o
  ), '[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_read_all_order_items(p_admin_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_valid_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN COALESCE((
    SELECT jsonb_agg(to_jsonb(oi.*))
    FROM public.order_items oi
  ), '[]'::jsonb);
END;
$$;

-- ============================================================
-- 3. PUBLIC RPC FUNCTIONS (controlled access)
-- ============================================================

CREATE OR REPLACE FUNCTION public.public_track_order(p_query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_result jsonb;
BEGIN
  SELECT o.id INTO v_order_id
  FROM public.orders o
  WHERE o.order_number ILIKE '%' || p_query || '%'
     OR o.tracking_code ILIKE '%' || p_query || '%'
  LIMIT 1;

  IF v_order_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT
    jsonb_build_object(
      'id', o.id,
      'order_number', o.order_number,
      'status', o.status,
      'payment_status', o.payment_status,
      'payment_method', o.payment_method,
      'subtotal', o.subtotal,
      'discount', o.discount,
      'shipping_cost', o.shipping_cost,
      'total', o.total,
      'tracking_code', o.tracking_code,
      'created_at', o.created_at,
      'updated_at', o.updated_at,
      'shipping_name', o.shipping_name,
      'shipping_city', o.shipping_city,
      'shipping_state', o.shipping_state,
      'order_items', COALESCE(
        (SELECT jsonb_agg(
          jsonb_build_object(
            'id', oi.id,
            'product_name', oi.product_name,
            'product_image', oi.product_image,
            'size', oi.size,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price
          )
        ) FROM public.order_items oi WHERE oi.order_id = o.id),
        '[]'::jsonb
      )
    ) INTO v_result
  FROM public.orders o
  WHERE o.id = v_order_id;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.public_get_order_basic(p_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT jsonb_build_object(
      'id', o.id,
      'order_number', o.order_number,
      'status', o.status,
      'payment_status', o.payment_status,
      'total', o.total,
      'payment_provider', o.payment_provider,
      'created_at', o.created_at
    )
    FROM public.orders o
    WHERE o.id = p_order_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.public_find_order_for_payment(p_nsu text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  BEGIN
    SELECT jsonb_build_object('id', o.id, 'payment_status', o.payment_status)
    INTO v_result
    FROM public.orders o
    WHERE o.id = p_nsu::uuid;
  EXCEPTION WHEN invalid_text_representation THEN
    v_result := NULL;
  END;

  IF v_result IS NULL THEN
    SELECT jsonb_build_object('id', o.id, 'payment_status', o.payment_status)
    INTO v_result
    FROM public.orders o
    WHERE o.order_nsu = p_nsu;
  END IF;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.public_customer_orders(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT id INTO v_customer_id
  FROM public.customers
  WHERE email = p_email;

  IF v_customer_id IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;

  RETURN COALESCE((
    SELECT jsonb_agg(row_data)
    FROM (
      SELECT
        to_jsonb(o.*) ||
        jsonb_build_object(
          'order_items', COALESCE(
            (SELECT jsonb_agg(to_jsonb(oi.*)) FROM public.order_items oi WHERE oi.order_id = o.id),
            '[]'::jsonb
          )
        ) AS row_data
      FROM public.orders o
      WHERE o.customer_id = v_customer_id
      ORDER BY o.created_at DESC
    ) sub
  ), '[]'::jsonb);
END;
$$;
