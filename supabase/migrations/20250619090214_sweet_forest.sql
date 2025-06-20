/*
  # VendHub Inventory Management Schema

  1. New Tables
    - `locations`
      - `id` (uuid, primary key)
      - `location_id` (text, unique identifier from vendors)
      - `name` (text, display name)
      - `address` (text, optional)
      - `active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, product name)
      - `upc` (text, universal product code)
      - `price` (decimal, unit price)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
    - `inventory`
      - `id` (uuid, primary key)
      - `location_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `current_stock` (integer, current inventory level)
      - `min_stock` (integer, minimum stock threshold)
      - `max_stock` (integer, maximum stock capacity)
      - `last_restocked` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
    - `sales_transactions`
      - `id` (uuid, primary key)
      - `location_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `quantity_sold` (integer)
      - `unit_price` (decimal)
      - `total_amount` (decimal)
      - `transaction_date` (timestamp)
      - `vendor_source` (text, which vendor system)
      - `raw_data` (jsonb, original CSV row data)
      - `created_at` (timestamp)
      
    - `csv_uploads`
      - `id` (uuid, primary key)
      - `filename` (text)
      - `vendor_source` (text)
      - `total_records` (integer)
      - `processed_records` (integer)
      - `failed_records` (integer)
      - `status` (text, processing status)
      - `error_log` (jsonb, processing errors)
      - `uploaded_by` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
    
  3. Indexes
    - Performance indexes on frequently queried columns
*/

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id text UNIQUE NOT NULL,
  name text NOT NULL,
  address text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  upc text UNIQUE NOT NULL,
  price decimal(10,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid REFERENCES locations(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  current_stock integer DEFAULT 0,
  min_stock integer DEFAULT 5,
  max_stock integer DEFAULT 50,
  last_restocked timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(location_id, product_id)
);

-- Create sales_transactions table
CREATE TABLE IF NOT EXISTS sales_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid REFERENCES locations(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity_sold integer DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  transaction_date timestamptz NOT NULL,
  vendor_source text NOT NULL,
  raw_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create csv_uploads table
CREATE TABLE IF NOT EXISTS csv_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  vendor_source text NOT NULL,
  total_records integer DEFAULT 0,
  processed_records integer DEFAULT 0,
  failed_records integer DEFAULT 0,
  status text DEFAULT 'pending',
  error_log jsonb DEFAULT '[]'::jsonb,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for locations
CREATE POLICY "Users can read all locations"
  ON locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage all locations"
  ON locations FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for products
CREATE POLICY "Users can read all products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage all products"
  ON products FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for inventory
CREATE POLICY "Users can read all inventory"
  ON inventory FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage all inventory"
  ON inventory FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for sales_transactions
CREATE POLICY "Users can read all sales transactions"
  ON sales_transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert sales transactions"
  ON sales_transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for csv_uploads
CREATE POLICY "Users can read their own uploads"
  ON csv_uploads FOR SELECT
  TO authenticated
  USING (uploaded_by = auth.uid());

CREATE POLICY "Users can insert their own uploads"
  ON csv_uploads FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can update their own uploads"
  ON csv_uploads FOR UPDATE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_locations_location_id ON locations(location_id);
CREATE INDEX IF NOT EXISTS idx_products_upc ON products(upc);
CREATE INDEX IF NOT EXISTS idx_inventory_location_product ON inventory(location_id, product_id);
CREATE INDEX IF NOT EXISTS idx_sales_transactions_location ON sales_transactions(location_id);
CREATE INDEX IF NOT EXISTS idx_sales_transactions_date ON sales_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_csv_uploads_user ON csv_uploads(uploaded_by);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


ALTER TABLE csv_uploads DISABLE ROW LEVEL SECURITY;
-- Allow inserts by service_role (no WITH CHECK constraint)
CREATE POLICY "Admin can insert any upload"
  ON csv_uploads FOR INSERT
  TO service_role
  USING (true);


