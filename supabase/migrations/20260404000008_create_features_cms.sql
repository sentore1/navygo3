-- Create Features CMS Tables
-- Allows admin to manage feature sections with images and content

-- Features sections table
CREATE TABLE IF NOT EXISTS public.features_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_order INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Features list items table
CREATE TABLE IF NOT EXISTS public.features_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES public.features_sections(id) ON DELETE CASCADE,
    icon_name TEXT NOT NULL, -- e.g., 'Target', 'TrendingUp', 'Calendar', 'Trophy'
    text TEXT NOT NULL,
    item_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.features_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features_items ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view active features sections"
    ON public.features_sections FOR SELECT
    USING (is_active = true);

CREATE POLICY "Anyone can view features items"
    ON public.features_items FOR SELECT
    USING (true);

-- Admin full access
CREATE POLICY "Admins can manage features sections"
    ON public.features_sections FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage features items"
    ON public.features_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Insert default data
INSERT INTO public.features_sections (section_order, title, description, image_url) VALUES
(1, 'Track Your Progress', 'Everything you need to turn your dreams into reality with structured goal tracking and progress monitoring.', '/1.jpg'),
(2, 'Achieve More Together', 'Join a community of achievers and unlock your full potential with our comprehensive goal management system.', '/2.jpg');

-- Get section IDs for inserting items
DO $$
DECLARE
    section1_id UUID;
    section2_id UUID;
BEGIN
    SELECT id INTO section1_id FROM public.features_sections WHERE section_order = 1;
    SELECT id INTO section2_id FROM public.features_sections WHERE section_order = 2;

    -- Items for section 1
    INSERT INTO public.features_items (section_id, icon_name, text, item_order) VALUES
    (section1_id, 'Target', 'Smart goal creation', 1),
    (section1_id, 'TrendingUp', 'Progress tracking', 2),
    (section1_id, 'Calendar', 'Daily streak monitoring', 3),
    (section1_id, 'Trophy', 'Achievement milestones', 4);

    -- Items for section 2
    INSERT INTO public.features_items (section_id, icon_name, text, item_order) VALUES
    (section2_id, 'Trophy', 'Community challenges', 1),
    (section2_id, 'Target', 'Personalized insights', 2),
    (section2_id, 'TrendingUp', 'Performance analytics', 3),
    (section2_id, 'Calendar', 'Goal reminders', 4);
END $$;

-- Create indexes
CREATE INDEX idx_features_sections_order ON public.features_sections(section_order);
CREATE INDEX idx_features_items_section ON public.features_items(section_id, item_order);

-- Success message
SELECT 
    'Features CMS created successfully! ✅' as status,
    COUNT(*) as total_sections
FROM public.features_sections;
