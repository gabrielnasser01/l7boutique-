/*
  # Add pronta_entrega column to products

  1. Modified Tables
    - `products`
      - Added `pronta_entrega` (boolean, default false) - indicates if product is ready for immediate shipping
  
  2. Data Updates
    - All existing products are marked as pronta_entrega = true
    - New products will default to pronta_entrega = false
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'pronta_entrega'
  ) THEN
    ALTER TABLE products ADD COLUMN pronta_entrega boolean DEFAULT false NOT NULL;
  END IF;
END $$;

UPDATE products SET pronta_entrega = true WHERE pronta_entrega = false;