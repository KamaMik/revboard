
-- Add weather columns to incassi table
ALTER TABLE public.incassi 
ADD COLUMN IF NOT EXISTS weather_temperature NUMERIC(4,1),
ADD COLUMN IF NOT EXISTS weather_description TEXT,
ADD COLUMN IF NOT EXISTS weather_icon TEXT;
