-- ===============================================
-- REDMONT E-Commerce Database Migration
-- Run this in Supabase SQL Editor
-- ===============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================= PRODUCTS TABLE =================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT,
  image TEXT,
  category TEXT NOT NULL DEFAULT 'Men',
  rating NUMERIC DEFAULT 4.5,
  stock INT DEFAULT 50,
  flipkart_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================= ORDERS TABLE =================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT DEFAULT 'card',
  full_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure orders table has all delivery columns if it already existed
ALTER TABLE orders ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pincode TEXT;

-- ================= PROFILES TABLE =================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================= ORDER ITEMS TABLE =================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  size TEXT DEFAULT 'M',
  unit_price NUMERIC NOT NULL
);

-- ================= ROW LEVEL SECURITY =================

-- Products: Public read, admin managed via service key or manual
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Products are insertable by authenticated users" ON products;
CREATE POLICY "Products are insertable by authenticated users"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Products are updatable by authenticated users" ON products;
CREATE POLICY "Products are updatable by authenticated users"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Products are deletable by authenticated users" ON products;
CREATE POLICY "Products are deletable by authenticated users"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Orders: Users can only see and create their own orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can view all orders" ON orders;
CREATE POLICY "Admin can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'dravon491@gmail.com'
  );

-- Order Items: Users can see items from their own orders
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own order items" ON order_items;
CREATE POLICY "Users can insert their own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- Profiles: Users can only see and update their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ================= SEED DATA =================
-- Default Products
INSERT INTO products (name, price, description, image, category, rating, stock, flipkart_url) VALUES
  ('Onyx Essential Tee', 1499, 'Premium heavyweight cotton tee in deep onyx black. Tailored for a relaxed, modern fit.', '/products/onyx-essential-tee.png', 'Men', 4.8, 100, 'https://www.flipkart.com/onyx-essential-tee-men-solid-round-neck/p/itm_onyx_tee'),
  ('Crimson Utility Jacket', 4599, 'A sleek utility jacket with subtle red accents and water-resistant finish.', '/products/crimson-utility-jacket.png', 'Men', 4.9, 40, 'https://www.flipkart.com/crimson-men-solid-utility-jacket/p/itm_crimson_jacket'),
  ('Silk Wrap Blouse', 2899, 'Luxurious silk blouse featuring a minimalist wrap design.', '/products/silk-wrap-blouse.png', 'Women', 4.7, 60, NULL),
  ('Midnight Trench', 7999, 'Classic trench coat reimagined in a stark midnight silhouette.', '/products/midnight-trench.png', 'Women', 5.0, 25, 'https://www.flipkart.com/midnight-women-solid-trench-coat/p/itm_midnight_trench'),
  ('Structured Cargo Pants', 3499, 'Utilitarian cargo pants tailored for a sharp, clean look.', '/products/structured-cargo-pants.png', 'Men', 4.6, 70, 'https://www.flipkart.com/structured-men-grey-cargo-pants/p/itm_cargo_pants'),
  ('Cashmere Turtleneck', 5499, 'Ultra-soft cashmere blend pullover with an exaggerated turtleneck.', '/products/cashmere-turtleneck.png', 'Women', 4.9, 30, NULL),
  ('Monochrome Sneaker', 5999, 'Minimalist leather sneakers in stark white and black.', '/products/monochrome-sneaker.png', 'Men', 4.7, 55, 'https://www.flipkart.com/monochrome-men-white-sneakers/p/itm_mono_sneaker'),
  ('Pleated Midi Skirt', 2499, 'Elegant knife-pleated skirt perfect for day-to-night transitions.', '/products/pleated-midi-skirt.png', 'Women', 4.5, 45, NULL),
  ('Textured Knit Polo', 2199, 'A modern take on the classic polo with heavy knit texture.', '/products/textured-knit-polo.png', 'Men', 4.6, 80, NULL),
  ('Sculpted Blazer', 6599, 'Fitted blazer with strong shoulders and a deep V-neckline.', '/products/sculpted-blazer.png', 'Women', 4.9, 20, 'https://www.flipkart.com/sculpted-women-solid-single-breasted-blazer/p/itm_sculpted_blazer'),
  ('Geometric Print Shirt', 1899, 'Short sleeve shirt featuring a striking geometric contrast.', '/products/geometric-print-shirt.png', 'Men', 4.4, 90, NULL),
  ('High-Rise Wide Leg Jeans', 3199, 'Premium denim washed in subtle grey, cut wide for comfort and style.', '/products/wide-leg-jeans.png', 'Women', 4.8, 65, NULL),
  ('Matte Black Watch', 8999, 'Sleek, minimalist timepiece.', '/products/matte-black-watch.png', 'Men', 5.0, 15, 'https://www.flipkart.com/matte-black-analog-watch-for-men/p/itm_matte_watch'),
  ('Leather Ankle Boots', 5999, 'Genuine leather boots with a sharp pointed toe.', '/products/leather-ankle-boots.png', 'Women', 4.7, 40, NULL),
  ('Draped Evening Gown', 12999, 'Effortlessly elegant gown suitable for the highest profile events.', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80', 'Women', 4.9, 10, 'https://www.flipkart.com/draped-women-solid-evening-gown/p/itm_evening_gown'),
  ('Oversized Wool Coat', 9999, 'A heavy, draped wool coat that commands attention.', 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80', 'Men', 4.8, 18, 'https://www.flipkart.com/oversized-men-solid-wool-coat/p/itm_wool_coat');

-- Seed the Fallback UUIDs so they are actually orderable
INSERT INTO products (id, name, price, description, image, category, rating, stock)
VALUES 
  ('00000000-0000-0000-0000-000000000101', 'Onyx Essential Tee', 1499, 'Premium heavyweight cotton tee', '/products/onyx-essential-tee.png', 'Men', 4.8, 100),
  ('00000000-0000-0000-0000-000000000102', 'Crimson Utility Jacket', 4599, 'A sleek utility jacket', '/products/crimson-utility-jacket.png', 'Men', 4.9, 40)
ON CONFLICT (id) DO NOTHING;
