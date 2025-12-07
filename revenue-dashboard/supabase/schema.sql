-- Create incassi table
CREATE TABLE IF NOT EXISTS public.incassi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    data DATE NOT NULL UNIQUE,
    biliardi NUMERIC(10,2) DEFAULT 0,
    bowling_time NUMERIC(10,2) DEFAULT 0,
    bowling_game NUMERIC(10,2) DEFAULT 0,
    bar NUMERIC(10,2) DEFAULT 0,
    calcetto NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on data for faster queries
CREATE INDEX idx_incassi_data ON public.incassi(data);

-- Enable Row Level Security
ALTER TABLE public.incassi ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow read access for all users" ON public.incassi
    FOR SELECT USING (true);

CREATE POLICY "Allow insert for authenticated users" ON public.incassi
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" ON public.incassi
    FOR UPDATE USING (true);

CREATE POLICY "Allow delete for authenticated users" ON public.incassi
    FOR DELETE USING (true);

-- Grant permissions
GRANT ALL ON public.incassi TO authenticated;
GRANT SELECT ON public.incassi TO anon;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_incassi_updated_at 
    BEFORE UPDATE ON public.incassi 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO public.incassi (data, biliardi, bowling_time, bowling_game, bar, calcetto) VALUES
('2025-12-01', 250.00, 180.00, 120.00, 320.00, 200.00),
('2025-12-02', 280.00, 200.00, 140.00, 350.00, 220.00),
('2025-12-03', 300.00, 220.00, 160.00, 380.00, 240.00),
('2025-12-04', 320.00, 240.00, 180.00, 400.00, 260.00),
('2025-12-05', 290.00, 210.00, 150.00, 370.00, 230.00),
('2025-12-06', 310.00, 230.00, 170.00, 390.00, 250.00),
('2025-12-07', 330.00, 250.00, 190.00, 410.00, 270.00);