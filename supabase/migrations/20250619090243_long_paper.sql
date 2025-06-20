/*
  # Seed Data for VendHub Inventory Management

  1. Sample Locations
    - Office buildings and retail spaces
    
  2. Sample Products  
    - Common vending machine items with UPC codes
    
  3. Initial Inventory
    - Stock levels for each location/product combination
*/

-- Insert sample locations
/*INSERT INTO locations (location_id, name, address) VALUES
('SW_01', 'Downtown Office Building A', '123 Main St, Downtown'),
('SW_02', 'Corporate Plaza B', '456 Business Ave, Midtown'),
('SW_03', 'Tech Campus C', '789 Innovation Dr, Tech District'),
('2.0_SW_01', 'Mall Food Court', '321 Shopping Center Blvd'),
('2.0_SW_02', 'University Student Center', '654 College Way'),
('RETAIL_01', 'Airport Terminal A', '987 Airport Way'),
('RETAIL_02', 'Hospital Main Lobby', '147 Medical Center Dr')
ON CONFLICT (location_id) DO NOTHING;

-- Insert sample products with real UPC codes
INSERT INTO products (name, upc, price) VALUES
('Celsius Arctic Berry', '889392014', 3.50),
('Muscle Milk Vanilla', '520000519', 3.50),
('Red Bull Energy', '9002490100', 2.99),
('Monster Energy Ultra', '70847811063', 2.99),
('Coca-Cola Classic', '49000028911', 1.99),
('Pepsi Cola', '12000171789', 1.99),
('Snickers Bar', '40000000396', 1.50),
('Doritos Nacho Cheese', '28400064057', 2.25),
('Lays Classic', '28400310505', 2.25),
('Twix Bar', '40000445722', 1.50),
('Gatorade Blue', '52000338355', 2.49),
('Dasani Water', '49000028904', 1.25),
('Pringles Original', '38000845407', 2.75),
('KitKat Bar', '34000002214', 1.50),
('Cheetos Crunchy', '28400647595', 2.25)
ON CONFLICT (upc) DO NOTHING;*/

-- Insert initial inventory levels for each location
INSERT INTO inventory (location_id, product_id, current_stock, min_stock, max_stock, last_restocked)
SELECT 
  l.id as location_id,
  p.id as product_id,
  FLOOR(RANDOM() * 30 + 10)::integer as current_stock, -- Random stock between 10-40
  5 as min_stock,
  50 as max_stock,
  now() - interval '3 days' as last_restocked
FROM locations l
CROSS JOIN products p
ON CONFLICT (location_id, product_id) DO NOTHING;

-- Insert some sample sales transactions
INSERT INTO sales_transactions (location_id, product_id, quantity_sold, unit_price, total_amount, transaction_date, vendor_source, raw_data)
SELECT 
  l.id as location_id,
  p.id as product_id,
  1 as quantity_sold,
  p.price as unit_price,
  p.price * 1.09 as total_amount, -- Including tax
  now() - interval '1 day' + (random() * interval '24 hours') as transaction_date,
  CASE WHEN random() > 0.5 THEN 'vendor_a' ELSE 'vendor_b' END as vendor_source,
  jsonb_build_object(
    'original_location_id', l.location_id,
    'original_product_name', p.name,
    'original_upc', p.upc
  ) as raw_data
FROM locations l
CROSS JOIN products p
WHERE random() > 0.7 -- Only create transactions for 30% of combinations
ORDER BY random()
LIMIT 50;

-- Update inventory levels based on sales (subtract sold quantities)
UPDATE inventory 
SET current_stock = current_stock - COALESCE(sold_qty, 0)
FROM (
  SELECT 
    i.location_id,
    i.product_id,
    SUM(st.quantity_sold) as sold_qty
  FROM inventory i
  LEFT JOIN sales_transactions st ON i.location_id = st.location_id AND i.product_id = st.product_id
  WHERE st.transaction_date >= now() - interval '1 day'
  GROUP BY i.location_id, i.product_id
) as sales_summary
WHERE inventory.location_id = sales_summary.location_id 
  AND inventory.product_id = sales_summary.product_id;

-- Ensure no negative stock levels
UPDATE inventory SET current_stock = 0 WHERE current_stock < 0;