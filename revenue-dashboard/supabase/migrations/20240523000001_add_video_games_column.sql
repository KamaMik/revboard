
-- Add video_games column to incassi table
ALTER TABLE public.incassi 
ADD COLUMN IF NOT EXISTS video_games NUMERIC(10,2) DEFAULT 0 NOT NULL;
