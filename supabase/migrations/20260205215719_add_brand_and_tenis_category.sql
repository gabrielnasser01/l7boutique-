/*
  # Add brand field to products and Tenis category

  1. Modified Tables
    - `products`
      - Added `brand` (text) - Brand name (e.g. Hermes, Louis Vuitton, Gucci, Golden Goose)

  2. New Data
    - New category "Tenis" for sneakers

  3. Important Notes
    - L7 is a luxury reseller, not a clothing brand
    - Brand field allows filtering products by luxury brand
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'brand'
  ) THEN
    ALTER TABLE products ADD COLUMN brand text DEFAULT '';
  END IF;
END $$;

INSERT INTO categories (name, slug, image_url, sort_order)
SELECT 'Tenis', 'tenis', 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800', 7
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'tenis');

CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
