/*
  # L7 Boutique E-Commerce Schema

  1. New Tables
    - `collections`
      - `id` (uuid, primary key)
      - `name` (text) - Collection name
      - `slug` (text, unique) - URL-friendly identifier
      - `description` (text) - Collection description
      - `image_url` (text) - Hero image for collection
      - `is_featured` (boolean) - Whether to show on homepage
      - `sort_order` (integer) - Display order
      - `created_at` (timestamptz)
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text) - Category name
      - `slug` (text, unique) - URL-friendly identifier
      - `image_url` (text) - Category image
      - `sort_order` (integer)
      - `created_at` (timestamptz)
    - `products`
      - `id` (uuid, primary key)
      - `name` (text) - Product name
      - `slug` (text, unique) - URL slug
      - `description` (text) - Product description
      - `price` (numeric) - Current price
      - `original_price` (numeric) - Price before discount
      - `category_id` (uuid, FK) - Category reference
      - `collection_id` (uuid, FK) - Collection reference
      - `images` (text[]) - Array of image URLs
      - `sizes` (text[]) - Available sizes
      - `colors` (jsonb) - Available colors with hex codes
      - `material` (text) - Material composition
      - `care_instructions` (text) - Care info
      - `is_featured` (boolean) - Show in highlights
      - `is_new` (boolean) - New arrival badge
      - `is_bestseller` (boolean) - Bestseller badge
      - `in_stock` (boolean) - Stock status
      - `stock_quantity` (integer) - Available quantity
      - `created_at` (timestamptz)
    - `testimonials`
      - `id` (uuid, primary key)
      - `author_name` (text)
      - `author_location` (text)
      - `content` (text)
      - `rating` (integer)
      - `is_featured` (boolean)
      - `created_at` (timestamptz)
    - `faq_items`
      - `id` (uuid, primary key)
      - `question` (text)
      - `answer` (text)
      - `category` (text) - FAQ category grouping
      - `sort_order` (integer)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on all tables
    - Public read access for storefront data (anon role)
    - No write access from client side
*/

CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  is_featured boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view collections"
  ON collections FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  image_url text DEFAULT '',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  original_price numeric,
  category_id uuid REFERENCES categories(id),
  collection_id uuid REFERENCES collections(id),
  images text[] DEFAULT '{}',
  sizes text[] DEFAULT '{}',
  colors jsonb DEFAULT '[]',
  material text DEFAULT '',
  care_instructions text DEFAULT '',
  is_featured boolean DEFAULT false,
  is_new boolean DEFAULT false,
  is_bestseller boolean DEFAULT false,
  in_stock boolean DEFAULT true,
  stock_quantity integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  author_location text DEFAULT '',
  content text NOT NULL,
  rating integer DEFAULT 5,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view testimonials"
  ON testimonials FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'geral',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view FAQ items"
  ON faq_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
