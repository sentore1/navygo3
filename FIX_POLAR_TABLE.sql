-- Step 1: Check what columns currently exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'polar_subscriptions'
ORDER BY ordinal_position;

-- Step 2: Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add product_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'polar_subscriptions' AND column_name = 'product_id'
    ) THEN
        ALTER TABLE polar_subscriptions ADD COLUMN product_id TEXT;
    END IF;

    -- Add price_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'polar_subscriptions' AND column_name = 'price_id'
    ) THEN
        ALTER TABLE polar_subscriptions ADD COLUMN price_id TEXT;
    END IF;

    -- Add current_period_start if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'polar_subscriptions' AND column_name = 'current_period_start'
    ) THEN
        ALTER TABLE polar_subscriptions ADD COLUMN current_period_start TIMESTAMPTZ;
    END IF;

    -- Add current_period_end if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'polar_subscriptions' AND column_name = 'current_period_end'
    ) THEN
        ALTER TABLE polar_subscriptions ADD COLUMN current_period_end TIMESTAMPTZ;
    END IF;

    -- Add cancel_at_period_end if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'polar_subscriptions' AND column_name = 'cancel_at_period_end'
    ) THEN
        ALTER TABLE polar_subscriptions ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT false;
    END IF;

    -- Add metadata if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'polar_subscriptions' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE polar_subscriptions ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Step 3: Verify all columns now exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'polar_subscriptions'
ORDER BY ordinal_position;
