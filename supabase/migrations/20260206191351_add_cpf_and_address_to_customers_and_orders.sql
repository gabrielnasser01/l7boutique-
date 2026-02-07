/*
  # Add CPF and address fields to customers and orders

  1. Modified Tables
    - `customers`
      - `cpf` (text) - Customer CPF document
      - `cep` (text) - Postal code
      - `street` (text) - Street name
      - `number` (text) - Street number
      - `complement` (text) - Address complement
      - `neighborhood` (text) - Neighborhood
    - `orders`
      - `shipping_cpf` (text) - CPF at time of order
      - `shipping_name` (text) - Recipient name
      - `shipping_phone` (text) - Phone at time of order
      - `shipping_cep` (text) - CEP at time of order
      - `shipping_street` (text) - Street at time of order
      - `shipping_number` (text) - Number at time of order
      - `shipping_complement` (text) - Complement at time of order
      - `shipping_neighborhood` (text) - Neighborhood at time of order
      - `shipping_city` (text) - City at time of order
      - `shipping_state` (text) - State at time of order

  2. Notes
    - Orders store a snapshot of the shipping address so changes to customer data don't affect past orders
    - All new columns have safe defaults and are nullable
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'cpf') THEN
    ALTER TABLE customers ADD COLUMN cpf text DEFAULT '' NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'cep') THEN
    ALTER TABLE customers ADD COLUMN cep text DEFAULT '' NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'street') THEN
    ALTER TABLE customers ADD COLUMN street text DEFAULT '' NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'number') THEN
    ALTER TABLE customers ADD COLUMN number text DEFAULT '' NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'complement') THEN
    ALTER TABLE customers ADD COLUMN complement text DEFAULT '' NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'neighborhood') THEN
    ALTER TABLE customers ADD COLUMN neighborhood text DEFAULT '' NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_cpf') THEN
    ALTER TABLE orders ADD COLUMN shipping_cpf text DEFAULT '' NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_name') THEN
    ALTER TABLE orders ADD COLUMN shipping_name text DEFAULT '' NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_phone') THEN
    ALTER TABLE orders ADD COLUMN shipping_phone text DEFAULT '' NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_cep') THEN
    ALTER TABLE orders ADD COLUMN shipping_cep text DEFAULT '' NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_street') THEN
    ALTER TABLE orders ADD COLUMN shipping_street text DEFAULT '' NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_number') THEN
    ALTER TABLE orders ADD COLUMN shipping_number text DEFAULT '' NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_complement') THEN
    ALTER TABLE orders ADD COLUMN shipping_complement text DEFAULT '' NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_neighborhood') THEN
    ALTER TABLE orders ADD COLUMN shipping_neighborhood text DEFAULT '' NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_city') THEN
    ALTER TABLE orders ADD COLUMN shipping_city text DEFAULT '' NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_state') THEN
    ALTER TABLE orders ADD COLUMN shipping_state text DEFAULT '' NOT NULL;
  END IF;
END $$;