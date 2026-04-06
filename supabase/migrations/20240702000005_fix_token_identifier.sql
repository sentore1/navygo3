-- Make token_identifier nullable or provide a default value
ALTER TABLE public.users ALTER COLUMN token_identifier DROP NOT NULL;

-- Update existing rows with null token_identifier to use user_id
UPDATE public.users SET token_identifier = id WHERE token_identifier IS NULL;
