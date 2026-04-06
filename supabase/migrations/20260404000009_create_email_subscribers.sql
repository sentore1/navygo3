-- Create email subscribers table for newsletter signups
-- This allows admins to see who subscribed from the landing page

CREATE TABLE IF NOT EXISTS public.email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'landing_page', -- 'landing_page', 'footer', 'popup', etc.
  status TEXT DEFAULT 'active', -- 'active', 'unsubscribed', 'bounced'
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}', -- For additional info like referrer, utm params, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_email_subscribers_email ON public.email_subscribers(email);
CREATE INDEX idx_email_subscribers_status ON public.email_subscribers(status);
CREATE INDEX idx_email_subscribers_subscribed_at ON public.email_subscribers(subscribed_at DESC);

-- Enable RLS
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can view and manage
CREATE POLICY "Admins can view all subscribers" ON public.email_subscribers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can manage subscribers" ON public.email_subscribers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Allow anyone to insert (for public signup forms)
CREATE POLICY "Anyone can subscribe" ON public.email_subscribers FOR INSERT WITH CHECK (true);

-- Function to update timestamps
CREATE TRIGGER update_email_subscribers_updated_at BEFORE UPDATE ON public.email_subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.email_subscribers IS 'Stores email addresses from newsletter signups on landing page';
