-- Closet Worthy Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- REFERENCE TABLES
-- =============================================

-- Brands table
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  website TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  body_area TEXT CHECK (body_area IN ('Top', 'Bottom', 'Footwear', 'Accessory')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subcategories table
CREATE TABLE subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conditions table
CREATE TABLE conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL UNIQUE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- MAIN CLOSET ITEMS TABLE
-- =============================================

CREATE TABLE closet_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Core fields
  item_name TEXT NOT NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
  condition_id UUID REFERENCES conditions(id) ON DELETE SET NULL,
  
  size TEXT,
  colour TEXT,
  
  -- Purchase info
  purchase_price_cad DECIMAL(10,2),
  purchase_date DATE,
  currency TEXT DEFAULT 'CAD',
  
  -- Override/manual fields
  brand_override_text TEXT,
  model_style_text TEXT,
  
  -- AI-generated fields
  ai_item_recognition TEXT,
  ai_retail_price_raw TEXT,
  ai_resale_price_raw TEXT,
  retail_price_cad DECIMAL(10,2),
  resale_price_cad DECIMAL(10,2),
  estimated_resale_value_cad DECIMAL(10,2),
  
  -- Listing fields
  ai_listing_description TEXT,
  ai_listing_title TEXT,
  
  -- Sell/Keep logic
  status TEXT CHECK (status IN ('Keep', 'Sell', 'Donate')) DEFAULT 'Keep',
  for_sale BOOLEAN DEFAULT false,
  sell_platforms TEXT[], -- Array of platforms: Grailed, Poshmark, etc.
  
  -- Photos
  photo_urls TEXT[], -- Array of Supabase Storage URLs
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_closet_items_brand ON closet_items(brand_id);
CREATE INDEX idx_closet_items_category ON closet_items(category_id);
CREATE INDEX idx_closet_items_status ON closet_items(status);
CREATE INDEX idx_closet_items_for_sale ON closet_items(for_sale);
CREATE INDEX idx_subcategories_category ON subcategories(category_id);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_closet_items_updated_at BEFORE UPDATE ON closet_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SEED DATA
-- =============================================

-- Insert default conditions
INSERT INTO conditions (label, score, notes) VALUES
  ('New with tags', 10, 'Brand new, never worn, tags attached'),
  ('New without tags', 9, 'Brand new, never worn, no tags'),
  ('Excellent', 9, 'Worn once or twice, like new condition'),
  ('Very good', 8, 'Lightly worn, no visible defects'),
  ('Good', 7, 'Worn several times, minor wear'),
  ('Fair', 6, 'Noticeable wear but still functional');

-- Insert common categories
INSERT INTO categories (name, body_area) VALUES
  ('Jacket', 'Top'),
  ('Jeans', 'Bottom'),
  ('Pants', 'Bottom'),
  ('T-Shirt', 'Top'),
  ('Sweater', 'Top'),
  ('Hoodie', 'Top'),
  ('Shoes', 'Footwear'),
  ('Accessories', 'Accessory'),
  ('Shirt', 'Top'),
  ('Shorts', 'Bottom');

-- Insert common subcategories (get category IDs first)
DO $$
DECLARE
  jacket_id UUID;
  jeans_id UUID;
  pants_id UUID;
  shoes_id UUID;
  sweater_id UUID;
  shirt_id UUID;
BEGIN
  SELECT id INTO jacket_id FROM categories WHERE name = 'Jacket';
  SELECT id INTO jeans_id FROM categories WHERE name = 'Jeans';
  SELECT id INTO pants_id FROM categories WHERE name = 'Pants';
  SELECT id INTO shoes_id FROM categories WHERE name = 'Shoes';
  SELECT id INTO sweater_id FROM categories WHERE name = 'Sweater';
  SELECT id INTO shirt_id FROM categories WHERE name = 'Shirt';
  
  INSERT INTO subcategories (name, category_id) VALUES
    ('Denim', jeans_id),
    ('Bomber', jacket_id),
    ('Blazer', jacket_id),
    ('Trench', jacket_id),
    ('Overshirt', jacket_id),
    ('Parka', jacket_id),
    ('Chinos', pants_id),
    ('Cargo', pants_id),
    ('Low-top Sneaker', shoes_id),
    ('High-top Sneaker', shoes_id),
    ('Chelsea Boot', shoes_id),
    ('Derby', shoes_id),
    ('Crewneck', sweater_id),
    ('Cardigan', sweater_id),
    ('Oxford', shirt_id),
    ('Flannel', shirt_id);
END $$;

-- Insert some common brands
INSERT INTO brands (name, website) VALUES
  ('Agolde', 'https://agolde.com'),
  ('Isabel Marant', 'https://isabelmarant.com'),
  ('Acne Studios', 'https://acnestudios.com'),
  ('A.P.C.', 'https://apc.fr'),
  ('Norse Projects', 'https://norseprojects.com'),
  ('Lemaire', 'https://lemaire.fr'),
  ('Margaret Howell', 'https://margarethowell.co.uk'),
  ('Dries Van Noten', 'https://driesvannoten.com'),
  ('AMI Paris', 'https://amiparis.com'),
  ('Our Legacy', 'https://ourlegacy.com');

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
-- Enable RLS on all tables
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE closet_items ENABLE ROW LEVEL SECURITY;

-- Policies: Allow all operations for authenticated users
-- Reference tables: read for everyone
CREATE POLICY "Allow public read access on brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Allow public read access on categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access on subcategories" ON subcategories FOR SELECT USING (true);
CREATE POLICY "Allow public read access on conditions" ON conditions FOR SELECT USING (true);

-- Closet items: full access for all (since this is single-user app, adjust if adding auth)
CREATE POLICY "Allow all operations on closet_items" ON closet_items FOR ALL USING (true);
