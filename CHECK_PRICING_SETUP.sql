-- Check if pricing tables exist and have data
SELECT 'pricing_settings' as table_name, COUNT(*) as count FROM pricing_settings
UNION ALL
SELECT 'pricing_product_features' as table_name, COUNT(*) as count FROM pricing_product_features;

-- Check pricing settings content
SELECT * FROM pricing_settings;

-- If empty, insert default settings
INSERT INTO pricing_settings (
    page_title,
    page_subtitle,
    yearly_savings_percent,
    show_monthly,
    show_yearly
)
SELECT 
    'Choose Your Plan',
    'Start achieving your goals with the perfect plan for you',
    20,
    true,
    true
WHERE NOT EXISTS (SELECT 1 FROM pricing_settings);
