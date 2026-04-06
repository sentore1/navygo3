-- Setup script for Pricing CMS
-- Run this after applying the migration

-- Check if products exist
SELECT 
    pp.product_name,
    pp.display_name,
    pp.description,
    pp.is_popular,
    pp.is_enabled,
    COUNT(pf.id) as feature_count
FROM pricing_products pp
LEFT JOIN pricing_features pf ON pf.product_id = pp.id
GROUP BY pp.id, pp.product_name, pp.display_name, pp.description, pp.is_popular, pp.is_enabled
ORDER BY pp.sort_order;

-- Check pricing settings
SELECT * FROM pricing_settings;

-- If you need to add more products, use this template:
/*
INSERT INTO pricing_products (product_name, display_name, description, is_popular, sort_order)
VALUES ('delta goal', 'Delta Goal', 'Advanced features for power users', false, 2)
RETURNING id;

-- Then add features for the new product (replace <product_id> with the returned id):
INSERT INTO pricing_features (product_id, feature_text, sort_order)
VALUES 
    ('<product_id>', 'Unlimited goals', 1),
    ('<product_id>', 'Advanced goal tracking', 2),
    ('<product_id>', 'Progress visualization', 3),
    ('<product_id>', 'Daily consistency tracking', 4),
    ('<product_id>', 'AI goal suggestions', 5),
    ('<product_id>', 'Priority support', 6);
*/
