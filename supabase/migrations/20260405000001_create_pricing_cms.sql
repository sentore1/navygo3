-- Create pricing features table (keyed by Polar product ID)
CREATE TABLE IF NOT EXISTS pricing_product_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    polar_product_id TEXT NOT NULL,
    polar_product_name TEXT NOT NULL,
    feature_text TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(polar_product_id, feature_text)
);

-- Create pricing settings table
CREATE TABLE IF NOT EXISTS pricing_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_title TEXT DEFAULT 'Choose Your Plan',
    page_subtitle TEXT DEFAULT 'Select a plan that fits your goals. All plans include recurring billing.',
    yearly_savings_percent INTEGER DEFAULT 17,
    show_monthly BOOLEAN DEFAULT true,
    show_yearly BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE pricing_product_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_settings ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can read pricing features"
    ON pricing_product_features FOR SELECT
    TO public
    USING (is_enabled = true);

CREATE POLICY "Public can read pricing settings"
    ON pricing_settings FOR SELECT
    TO public
    USING (true);

-- Admin full access
CREATE POLICY "Admins can manage pricing features"
    ON pricing_product_features FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage pricing settings"
    ON pricing_settings FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Create indexes
CREATE INDEX idx_pricing_features_product ON pricing_product_features(polar_product_id);
CREATE INDEX idx_pricing_features_sort ON pricing_product_features(sort_order);

-- Insert default pricing settings
INSERT INTO pricing_settings (page_title, page_subtitle, yearly_savings_percent)
VALUES (
    'Choose Your Plan',
    'Select a plan that fits your goals. All plans include recurring billing.',
    17
);
